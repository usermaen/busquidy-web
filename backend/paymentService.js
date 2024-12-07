const {WebpayPlus, Options, IntegrationApiKeys, Environment} = require("transbank-sdk");

class PaymentService {
  constructor() {
    this.commerceCode = process.env.WEBPAY_COMMERCE_CODE || "597055555532";
    this.apiKey = process.env.WEBPAY_API_KEY || IntegrationApiKeys.WEBPAY;
    this.environment = process.env.NODE_ENV === "production" ?
            Environment.Production :
            Environment.Integration;
    this.transactionLocks = new Map();
    this.lockTimeout = 5000; // 5 seconds
    this.lockCleanupInterval = 60000; // 1 minute

    // Start cleanup interval
    this.startLockCleanup();
  }

  startLockCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [token, timestamp] of this.transactionLocks) {
        if (now - timestamp >= this.lockTimeout) {
          this.transactionLocks.delete(token);
        }
      }
    }, this.lockCleanupInterval);
  }

  validateTransactionData({amount, buyOrder, sessionId, returnUrl, plan}) {
    if (!amount || amount <= 0) throw new Error("Monto inválido");
    if (!buyOrder) throw new Error("Orden de compra inválida");
    if (!sessionId) throw new Error("ID de sesión inválido");
    if (!returnUrl) throw new Error("URL de retorno inválida");

    // Para transacciones de proyecto, no requiere validación de plan
    if (buyOrder.startsWith("SUB-")) {
      if (!plan || !["mensual", "anual"].includes(plan)) {
        throw new Error("Plan de suscripción inválido");
      }
    }
  }

  async createTransaction(transactionData) {
    try {
      if (transactionData.buyOrder.startsWith("SUB-")) {
        if (!["mensual", "anual"].includes(transactionData.plan)) {
          throw new Error("Plan de suscripción inválido");
        }
      }

      this.validateTransactionData(transactionData);

      const {
        amount,
        buyOrder,
        sessionId,
        plan,
        tipoUsuario,
        metodoPago,
        returnUrl,
      } = transactionData;

      console.log("transactionDATA:", transactionData);

      const webpay = new WebpayPlus.Transaction(
          new Options(this.commerceCode, this.apiKey, this.environment),
      );

      const response = await webpay.create(
          buyOrder,
          sessionId,
          amount,
          returnUrl,
      );

      if (!response?.token || !response?.url) {
        throw new Error("Respuesta inválida de Webpay");
      }

      // Almacenar los datos originales para recuperarlos en commitTransaction
      this.lastTransactionData = {
        plan: transactionData.plan,
        tipoUsuario: transactionData.tipoUsuario,
        metodoPago: transactionData.metodoPago,
      };

      // Combina la respuesta del SDK con los datos originales
      return {
        ...response,
        originalData: this.lastTransactionData,
      };
    } catch (error) {
      console.error("[PaymentService] Error creating transaction:", error);
      throw new Error(`Error al crear la transacción: ${error.message}`);
    }
  }

  async commitTransaction(token) {
    if (!token) throw new Error("Token no proporcionado");

    const now = Date.now();
    const lockInfo = this.transactionLocks.get(token);

    if (lockInfo && now - lockInfo < this.lockTimeout) {
      throw new Error("Transacción en proceso");
    }

    try {
      this.transactionLocks.set(token, now);

      const webpay = new WebpayPlus.Transaction(
          new Options(this.commerceCode, this.apiKey, this.environment),
      );

      const response = await webpay.commit(token);

      if (!response?.status) {
        throw new Error("Respuesta inválida de Webpay");
      }

      // Recuperar los datos originales almacenados durante la creación de la transacción
      return {
        ...response,
        originalData: this.lastTransactionData || {},
      };
    } catch (error) {
      console.error("[PaymentService] Error committing transaction:", error);
      if (error.message.includes("Transaction already locked")) {
        throw new Error("Transacción en proceso de confirmación por Webpay");
      }
      throw error;
    } finally {
      // Delay lock release
      setTimeout(() => {
        this.transactionLocks.delete(token);
      }, 1000);
    }
  }

  isTransactionLocked(token) {
    const lockInfo = this.transactionLocks.get(token);
    return lockInfo && (Date.now() - lockInfo < this.lockTimeout);
  }
}

// Singleton instance
module.exports = new PaymentService();
