const express = require("express");
const PaymentService = require("./paymentService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {verifyToken, validatePaymentData, validateUser, upload} = require("./middlewares/auth");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const router = express.Router();
const fs = require("fs");
const {procesarCV} = require("./cvService");
const {pool,
  insertarUsuario,
  getUserById,
  getEmpresaByUserId,
  getFreelancerByUserId,
  buscarEmpresaByUserId,
  buscarFreelancerByUserId,
  getRepresentanteByUserId,
  checkDuplicateProject,
  guardarPerfilEnDB,
} = require("./db");
const sendError = (res, status, message) => res.status(status).json({message});

// Clave secreta JWT (puedes usar directamente process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET;

// Crear transacción para proyectos
router.post("/create_transaction_project", async (req, res) => {
  try {
    const {amount, buyOrder, sessionId} = req.body;
    if (!amount || !buyOrder || !sessionId) {
      return res.status(400).json({error: "Datos incompletos"});
    }

    const returnUrl = `${process.env.FRONTEND_URL}/myprojects`;
    const response = await PaymentService.createTransaction({
      amount,
      buyOrder,
      sessionId,
      plan: "mensual",
      returnUrl,
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// Crear transacción para suscripciones
router.post("/create_transaction_suscription", async (req, res) => {
  try {
    // Destructurar todos los datos de la solicitud, incluyendo returnUrl si está presente
    const {
      amount,
      buyOrder,
      sessionId,
      plan,
      tipoUsuario,
      metodoPago,
      returnUrl: requestReturnUrl,
    } = req.body;

    // Verificar datos obligatorios
    if (!amount || !buyOrder || !sessionId || !plan || !tipoUsuario || !metodoPago) {
      return res.status(400).json({error: "Datos incompletos o inválidos"});
    }

    // Usar el returnUrl de la solicitud o generar uno predeterminado
    const returnUrl = requestReturnUrl ||
            (process.env.FRONTEND_URL ?
                `${process.env.FRONTEND_URL}/freelancer` :
                "http://localhost:3000/freelancer");

    // Verificar que returnUrl no esté vacío
    if (!returnUrl) {
      return res.status(500).json({error: "URL de retorno no configurada"});
    }

    // Validación adicional de plan
    if (!["mensual", "anual"].includes(plan)) {
      return res.status(400).json({error: "Plan de suscripción inválido"});
    }

    console.log("Datos para PaymentService:", {
      amount,
      buyOrder,
      sessionId,
      plan,
      tipoUsuario,
      metodoPago,
      returnUrl,
    });

    const response = await PaymentService.createTransaction({
      amount,
      buyOrder,
      sessionId,
      plan,
      tipoUsuario,
      metodoPago,
      returnUrl,
    });

    res.json(response);
  } catch (error) {
    console.error("Error en create_transaction_suscription:", error);
    res.status(500).json({error: error.message});
  }
});

// Confirmar transacción
router.post("/commit_transaction", async (req, res) => {
  const {token} = req.body;
  if (!token) {
    return res.status(400).json({
      status: "ERROR",
      error: "Token no proporcionado",
      code: "INVALID_TOKEN",
    });
  }

  let connection;
  try {
    const response = await PaymentService.commitTransaction(token);

    // Añade más logging para depuración
    console.log("Respuesta completa de commitTransaction:", response);

    const status = response.status === "AUTHORIZED" ? "APPROVED" : "REJECTED";
    connection = await pool.getConnection();

    const buyOrder = response.buy_order;
    const sessionId = response.session_id;
    const monto = response.amount;

    // Extrae los datos de originalData de manera más segura
    const plan = response.originalData?.plan || response.plan;
    const metodoPago = response.originalData?.metodoPago || response.metodoPago;

    console.log("Plan recibido:", plan);
    console.log("Método de pago recibido:", metodoPago);

    // Identificar tipo de transacción
    if (buyOrder.startsWith("BO-")) {
      // Transacción de publicación de proyecto
      const idProyecto = buyOrder.split("-")[1];
      const idUsuario = sessionId.split("-")[1];

      if (status === "APPROVED") {
        await connection.beginTransaction();
        console.log("Procesando transacción aprobada:", {buyOrder, sessionId, monto});
        const fechaPago = new Date();
        const horaPago = fechaPago.toTimeString().split(" ")[0];
        const newFechaPago = new Date(fechaPago);

        // Formatear fechas para MySQL
        const fechaPagoFinal = newFechaPago.toISOString().split("T")[0];
        try {
          // Insertar registro de pago
          await connection.query(
              `INSERT INTO pago_proyecto 
                        (id_proyecto, id_usuario, monto, fecha_pago, hora_pago, estado_pago, metodo_pago, referencia_pago)
                        VALUES (?, ?, ?, ?, ?, 'completado', ?, ?)`,
              [idProyecto, idUsuario, monto, fechaPagoFinal, horaPago, "Webpay", token],
          );

          // Actualizar estado de la publicación
          await connection.query(
              `UPDATE publicacion_proyecto
                        SET fecha_creacion = CURDATE(), estado_publicacion = 'activo'
                        WHERE id_proyecto = ?`,
              [idProyecto],
          );

          // Confirmar transacción
          await connection.commit();

          console.log("Pago registrado exitosamente");
          return res.json({
            status: "APPROVED",
            token: token,
            buyOrder: response.buy_order,
            amount: monto,
            type: "PROJECT_PUBLICATION",
            projectId: idProyecto,
            message: "Pago de publicación de proyecto procesado exitosamente",
          });
        } catch (dbError) {
          await connection.rollback();
          console.error("Error en la base de datos:", dbError);
          return res.status(500).json({
            status: "ERROR",
            error: "Error al procesar el pago del proyecto",
            code: "PROJECT_PAYMENT_ERROR",
            details: dbError.message,
          });
        }
      } else if (status === "REJECTED") {
        const fechaPago = new Date();
        const horaPago = fechaPago.toTimeString().split(" ")[0];
        const newFechaPago = new Date(fechaPago);

        // Formatear fechas para MySQL
        const fechaPagoFinal = newFechaPago.toISOString().split("T")[0];
        await connection.beginTransaction();

        try {
          // Verificar si el pago ya fue registrado
          const [existingPayment] = await connection.query(
              "SELECT id_pago FROM pago_proyecto WHERE referencia_pago = ?",
              [token],
          );

          if (existingPayment.length) {
            // Actualizar el registro existente
            await connection.query(
                `UPDATE pago_proyecto 
                            SET estado_pago = 'fallido', monto = ?, fecha_pago = ?, hora_pago = ?
                            WHERE referencia_pago = ?`,
                [monto, fechaPagoFinal, horaPago, token],
            );
          } else {
            // Insertar nuevo registro de pago fallido
            await connection.query(
                `INSERT INTO pago_proyecto 
                            (id_proyecto, id_usuario, monto, fecha_pago, hora_pago, estado_pago, metodo_pago, referencia_pago)
                            VALUES (?, ?, ?, ?, ?, 'fallido', ?, ?)`,
                [idProyecto, idUsuario, monto, fechaPago, horaPago, "Webpay", token],
            );
          }

          // Actualizar estado de la publicación a 'sin publicar'
          await connection.query(
              `UPDATE publicacion_proyecto
                        SET estado_publicacion = 'sin publicar'
                        WHERE id_proyecto = ?`,
              [idProyecto],
          );

          // Confirmar transacción
          await connection.commit();

          console.log("Pago rechazado registrado correctamente");

          return res.status(400).json({
            status: "REJECTED",
            token: token,
            buyOrder: response.buy_order,
            amount: monto,
            type: "PROJECT_PUBLICATION",
            projectId: idProyecto,
            message: "Pago de publicación de proyecto rechazado",
            reason: "Transaction not authorized",
          });
        } catch (dbError) {
          await connection.rollback();
          console.error("Error en la base de datos:", dbError);
          return res.status(500).json({
            status: "ERROR",
            error: "Error al procesar el pago rechazado del proyecto",
            code: "PROJECT_PAYMENT_REJECT_ERROR",
            details: dbError.message,
          });
        }
      }
    } else if (buyOrder.startsWith("SUB-")) {
      // Transacción de suscripción
      const idUsuario = sessionId.split("-")[1];

      if (status === "APPROVED") {
        await connection.beginTransaction();

        try {
          // Verificar si ya existe una suscripción activa
          const [existingSubscription] = await connection.query(
              `SELECT id_pago FROM pago_suscripcion WHERE id_usuario = ? AND estado_suscripcion = 'activa'`,
              [idUsuario],
          );

          if (!existingSubscription.length) {
            // Obtener la fecha actual y hora del pago
            const fechaPago = new Date();
            const horaPago = fechaPago.toTimeString().split(" ")[0];

            // Determinar el plan de suscripción (mensual o anual)
            const diasDuracion = plan === "mensual" ? 30 : 360;

            // Calcular fechas de inicio y fin
            const fechaInicio = new Date(fechaPago);
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + diasDuracion);

            // Formatear fechas para MySQL
            const fechaInicioFormatted = fechaInicio.toISOString().split("T")[0];
            const fechaFinFormatted = fechaFin.toISOString().split("T")[0];

            // Insertar en la tabla `pago_suscripcion`
            const [insertResult] = await connection.query(
                `INSERT INTO pago_suscripcion 
                            (id_usuario, monto, fecha_pago, hora_pago, estado_pago, metodo_pago, referencia_pago, plan_suscripcion, fecha_inicio, fecha_fin, estado_suscripcion)
                            VALUES (?, ?, ?, ?, 'completado', ?, ?, ?, ?, ?, 'activa')`,
                [
                  idUsuario,
                  monto,
                  fechaInicioFormatted,
                  horaPago,
                  metodoPago,
                  token,
                  plan,
                  fechaInicioFormatted,
                  fechaFinFormatted,
                ],
            );

            // Buscar `tipo_usuario` en la tabla `usuario`
            const userCheckResults = await getUserById(idUsuario);
            if (userCheckResults.length === 0) {
              return res.status(404).json({
                status: "ERROR",
                error: "Usuario no encontrado",
                code: "USER_NOT_FOUND",
              });
            }

            const tipo_usuario = userCheckResults[0].tipo_usuario;
            if (tipo_usuario == "freelancer") {
              // Actualizar `premium` en la tabla `freelancer`
              await connection.query(
                  `UPDATE freelancer SET premium = 1 WHERE id_usuario = ?`, [idUsuario],
              );
            } else if (tipo_usuario == "empresa") {
              // Actualizar `premium` en la tabla `empresa`
              await connection.query(
                  `UPDATE empresa SET premium = 1 WHERE id_usuario = ?`, [idUsuario],
              );
            } else {
              return res.status(400).json({
                status: "ERROR",
                error: "Tipo de usuario no permitido",
                code: "INVALID_USER_TYPE",
              });
            }

            // Confirmar la transacción en la base de datos
            await connection.commit();

            return res.json({
              status: "APPROVED",
              token: token,
              buyOrder: response.buy_order,
              amount: monto,
              type: "SUBSCRIPTION",
              userId: idUsuario,
              plan: plan,
              subscriptionStart: fechaInicioFormatted,
              subscriptionEnd: fechaFinFormatted,
              message: "Suscripción procesada exitosamente",
            });
          } else {
            // Ya existe una suscripción activa
            return res.status(409).json({
              status: "ERROR",
              error: "Ya existe una suscripción activa",
              code: "ACTIVE_SUBSCRIPTION_EXISTS",
              userId: idUsuario,
            });
          }
        } catch (dbError) {
          // Revertir en caso de error
          await connection.rollback();
          return res.status(500).json({
            status: "ERROR",
            error: `Error en la base de datos: ${dbError.message}`,
            code: "SUBSCRIPTION_PROCESSING_ERROR",
            details: dbError.message,
          });
        }
      } else {
        // Manejo de pagos rechazados para suscripciones
        try {
          await connection.query(
              `INSERT INTO pago_suscripcion 
                        (id_usuario, monto, fecha_pago, hora_pago, estado_pago, metodo_pago, referencia_pago, plan_suscripcion, estado_suscripcion)
                        VALUES (?, ?, CURDATE(), CURTIME(), 'fallido', ?, ?, ?, 'pendiente')`,
              [idUsuario, monto, metodoPago, token, plan],
          );

          return res.status(400).json({
            status: "REJECTED",
            token: token,
            buyOrder: response.buy_order,
            amount: monto,
            type: "SUBSCRIPTION",
            userId: idUsuario,
            plan: plan,
            message: "Pago de suscripción rechazado",
            reason: "Transaction not authorized",
          });
        } catch (dbError) {
          return res.status(500).json({
            status: "ERROR",
            error: "Error al registrar pago de suscripción rechazado",
            code: "SUBSCRIPTION_REJECT_ERROR",
            details: dbError.message,
          });
        }
      }
    }
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Error al confirmar transacción:", error);

    const errorMessage = error.message.includes("Transacción en proceso") ?
            "La transacción está siendo procesada" :
            "Error al procesar el pago";

    return res.status(error.message.includes("Transacción en proceso") ? 409 : 500).json({
      status: "ERROR",
      error: errorMessage,
      code: error.message.includes("Transacción en proceso") ?
                "TRANSACTION_IN_PROGRESS" :
                "UNEXPECTED_ERROR",
      details: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Registro de usuarios
router.post("/register", async (req, res) => {
  const {correo, contraseña, tipo_usuario} = req.body;

  try {
    // Verificar si el correo ya existe
    const [result] = await pool.query("SELECT * FROM usuario WHERE correo = ?", [correo]);
    if (result.length > 0) {
      return res.status(400).json({error: "Correo ya registrado"});
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    console.log("Contraseña hasheada:", hashedPassword);


    // Insertar usuario usando la función creada
    console.log("Correo:", correo, "Tipo de usuario:", tipo_usuario);
    const id_usuario = await insertarUsuario(correo, hashedPassword, tipo_usuario);
    console.log("ID Usuario insertado:", id_usuario);

    // Crear perfil dependiendo del tipo de usuario
    if (tipo_usuario === "empresa") {
      await pool.query("INSERT INTO empresa (id_usuario) VALUES (?)", [id_usuario]);
      res.status(201).json({message: "Usuario empresa registrado exitosamente"});
    } else if (tipo_usuario === "freelancer") {
      await pool.query("INSERT INTO freelancer (id_usuario) VALUES (?)", [id_usuario]);
      res.status(201).json({message: "Usuario freelancer registrado exitosamente"});
    } else {
      res.status(400).json({error: "Tipo de usuario no válido"});
    }
  } catch (error) {
    console.error("Error en /register:", error.message);
    res.status(500).json({error: "Error en el servidor"});
  }
});

// Inicio de sesión
router.post("/login", async (req, res) => {
  const {correo, contraseña} = req.body;
  console.log("Correo recibido:", correo);

  try {
    // Verificar si el correo existe
    const [result] = await pool.query("SELECT * FROM usuario WHERE correo = ?", [correo]);
    if (result.length === 0) {
      return res.status(404).json({error: "Usuario no encontrado"});
    }

    const user = result[0];
    console.log("Hash almacenado:", user.contraseña);

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    console.log("¿Contraseña válida?", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({error: "Contraseña incorrecta"});
    }

    // Generar token JWT
    const token = jwt.sign({id_usuario: user.id_usuario, tipo_usuario: user.tipo_usuario}, JWT_SECRET, {
      expiresIn: "2h",
    });

    res.status(200).json({message: "Inicio de sesión exitoso", token, tipo_usuario: user.tipo_usuario});
  } catch (error) {
    console.error("Error en /login:", error.message);
    res.status(500).json({error: "Error en el servidor"});
  }
});

// Crear proyecto
router.post("/create-project", verifyToken, async (req, res) => {
  const {projectData, id_usuario} = req.body;

  if (!id_usuario) {
    console.error("Error: id_usuario es undefined o null");
    return res.status(400).json({error: "ID de usuario inválido"});
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction(); // Inicia la transacción

    // Verificar usuario
    const userCheckResults = await getUserById(id_usuario);
    if (userCheckResults.length === 0) {
      return res.status(404).json({error: "Usuario no encontrado"});
    }

    const tipo_usuario = userCheckResults[0].tipo_usuario;
    if (tipo_usuario !== "empresa") {
      await connection.rollback();
      return res.status(403).json({error: "Acceso no autorizado"});
    }

    // Obtener `id_empresa`
    const empresaResults = await getEmpresaByUserId(id_usuario);
    if (empresaResults.length === 0) {
      await connection.rollback();
      return res.status(404).json({error: "Empresa no encontrada"});
    }

    const id_empresa = empresaResults[0].id_empresa;

    // Verificar duplicados
    const projectCheckResults = await checkDuplicateProject(id_empresa, projectData);
    if (projectCheckResults.length > 0) {
      await connection.rollback();
      return res.status(409).json({error: "Proyecto duplicado encontrado"});
    }

    // Insertar proyecto
    const [insertProjectResult] = await connection.query(
        `INSERT INTO proyecto 
            (id_empresa, titulo, descripcion, categoria, habilidades_requeridas, presupuesto, 
                duracion_estimada, fecha_limite, ubicacion, tipo_contratacion, metodologia_trabajo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_empresa,
          projectData.titulo,
          projectData.descripcion,
          projectData.categoria,
          projectData.habilidades_requeridas,
          projectData.presupuesto,
          projectData.duracion_estimada,
          projectData.fecha_limite,
          projectData.ubicacion,
          projectData.tipo_contratacion,
          projectData.metodologia_trabajo,
        ],
    );

    const id_proyecto = insertProjectResult.insertId;

    // Crear publicación
    await connection.query(
        `INSERT INTO publicacion_proyecto (id_proyecto, fecha_creacion, fecha_publicacion, estado_publicacion)
            VALUES (?, CURDATE(), NULL, 'sin publicar')`,
        [id_proyecto],
    );

    await connection.commit(); // Confirma la transacción
    console.log("Proyecto y publicación creados con éxito");
    res.status(201).json({
      message: "Proyecto y publicación creados con éxito",
      projectId: id_proyecto,
    });
  } catch (err) {
    console.error("Error al crear el proyecto:", err);
    if (connection) await connection.rollback();
    res.status(500).json({error: "Error interno del servidor"});
  } finally {
    if (connection) await connection.release();
  }
});

router.put("/api/proyecto/estado/:id_proyecto", async (req, res) => {
  const {id_proyecto} = req.params;
  const {nuevoEstado} = req.body; // El estado al que se desea cambiar

  try {
    await pool.query("UPDATE proyectos SET estado_publicacion = ? WHERE id_proyecto = ?", [nuevoEstado, id_proyecto]);
    res.status(200).json({message: "Estado del proyecto actualizado con éxito"});
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    res.status(500).json({message: "Error al actualizar el estado del proyecto"});
  }
});


// Ruta para traer los proyectos con su estado de publicación
router.get("/proyectos/:id_usuario", async (req, res) => {
  const {id_usuario} = req.params;
  console.log("id_usuario:", id_usuario);

  if (!id_usuario) {
    console.error("Error: id_usuario es undefined o null");
    return res.status(400).json({error: "ID de usuario inválido"});
  }

  try {
    // Verificar usuario
    const userCheckResults = await getUserById(id_usuario);
    if (userCheckResults.length === 0) {
      return res.status(404).json({error: "Usuario no encontrado"});
    }

    const tipo_usuario = userCheckResults[0].tipo_usuario;
    if (tipo_usuario !== "empresa") {
      return res.status(403).json({error: "Acceso no autorizado"});
    }

    // Obtener `id_empresa`
    const empresaResults = await getEmpresaByUserId(id_usuario);
    if (empresaResults.length === 0) {
      console.error("Empresa no encontrada para el usuario:", id_usuario);
      return res.status(404).json({error: "Empresa no encontrada"});
    }

    const id_empresa = empresaResults[0].id_empresa;

    // Obtener los proyectos asociados a la empresa
    const [projectResults] = await pool.query(
        "SELECT * FROM proyecto WHERE id_empresa = ?",
        [id_empresa],
    );

    if (projectResults.length === 0) {
      console.log("No se encontraron proyectos");
      return res.status(404).json({error: "No se encontraron proyectos"});
    }

    // Obtener los estados de publicación de los proyectos
    const projectIds = projectResults.map((proyecto) => proyecto.id_proyecto);
    const [publicationResults] = await pool.query(
        "SELECT id_proyecto, estado_publicacion FROM publicacion_proyecto WHERE id_proyecto IN (?)",
        [projectIds],
    );

    // Mapear los estados de publicación a sus respectivos proyectos
    const publicationMap = new Map(publicationResults.map((pub) => [pub.id_proyecto, pub.estado_publicacion]));
    const projectsWithStatus = projectResults.map((proyecto) => ({
      ...proyecto,
      estado_publicacion: publicationMap.get(proyecto.id_proyecto) || "Desconocido",
    }));

    res.json(projectsWithStatus);
  } catch (error) {
    console.error("Error al obtener proyectos:", error.message);
    res.status(500).json({error: "Error interno del servidor"});
  }
});

// Ruta para traer las publicaciones con sus proyectos
router.get("/publicacion", async (req, res) => {
  try {
    // Consulta combinada de proyectos y publicaciones
    const getProjectsWithPublicationsQuery = `
            SELECT 
                p.id_proyecto, 
                p.id_empresa, 
                p.titulo, 
                p.descripcion, 
                p.categoria, 
                p.habilidades_requeridas, 
                p.presupuesto, 
                p.duracion_estimada, 
                p.fecha_limite, 
                p.ubicacion, 
                p.tipo_contratacion, 
                p.metodologia_trabajo, 
                pub.id_publicacion, 
                pub.fecha_creacion, 
                pub.fecha_publicacion, 
                pub.estado_publicacion
            FROM 
                proyecto p
            LEFT JOIN 
                publicacion_proyecto pub 
            ON 
                p.id_proyecto = pub.id_proyecto;
        `;

    // Ejecutar la consulta
    const [results] = await pool.query(getProjectsWithPublicationsQuery);

    if (results.length === 0) {
      return res.status(404).json({error: "No se encontraron proyectos ni publicaciones."});
    }

    // Mapear los resultados para incluir un estado predeterminado
    const projectsWithStatus = results.map((row) => ({
      id_proyecto: row.id_proyecto,
      id_empresa: row.id_empresa,
      titulo: row.titulo,
      descripcion: row.descripcion,
      categoria: row.categoria,
      habilidades_requeridas: row.habilidades_requeridas,
      presupuesto: row.presupuesto,
      duracion_estimada: row.duracion_estimada,
      fecha_limite: row.fecha_limite,
      ubicacion: row.ubicacion,
      tipo_contratacion: row.tipo_contratacion,
      metodologia_trabajo: row.metodologia_trabajo,
      estado_publicacion: row.estado_publicacion || "sin publicar", // Valor predeterminado si no hay publicación
      fecha_creacion: row.fecha_creacion || null,
      fecha_publicacion: row.fecha_publicacion || null,
      id_publicacion: row.id_publicacion || null,
    }));

    res.json(projectsWithStatus);
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({error: "Error al obtener los datos"});
  }
});

// Ruta para eliminar proyecto
router.delete("/proyecto/:id_proyecto", async (req, res) => {
  const {id_proyecto} = req.params;
  let connection;

  try {
    connection = await pool.getConnection();

    // Verificar si el proyecto existe
    const [projectExists] = await connection.query(
        "SELECT COUNT(*) as count FROM proyecto WHERE id_proyecto = ?",
        [id_proyecto],
    );

    if (projectExists[0].count === 0) {
      return res.status(404).json({
        success: false,
        message: "Proyecto no encontrado",
      });
    }

    // Iniciar transacción
    await connection.beginTransaction();

    try {
      // Eliminar registros relacionados
      await connection.query(
          "DELETE FROM publicacion_proyecto WHERE id_proyecto = ?",
          [id_proyecto],
      );

      // Eliminar el proyecto
      await connection.query(
          "DELETE FROM proyecto WHERE id_proyecto = ?",
          [id_proyecto],
      );

      // Confirmar transacción
      await connection.commit();

      res.status(200).json({
        success: true,
        message: "Proyecto eliminado correctamente",
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el proyecto",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Ruta para Editar proyecto


// Ruta para ver si existe perfil empresa
router.get("/empresa/:id_usuario", async (req, res) => {
  const {id_usuario} = req.params;

  try {
    // Verificar usuario
    const userCheckResults = await getUserById(id_usuario);
    if (userCheckResults.length === 0) {
      return res.status(404).json({error: "Usuario no encontrado"});
    }
    console.log("Usuario encontrado");

    const {tipo_usuario} = userCheckResults[0];
    if (tipo_usuario !== "empresa") {
      return res.status(403).json({error: "Acceso no autorizado"});
    }

    // Obtener datos de la empresa
    const [empresaResults] = await pool.query(
        `SELECT nombre_empresa, identificacion_fiscal, direccion, telefono_contacto, 
                    correo_empresa, pagina_web, descripcion, sector_industrial 
             FROM empresa 
             WHERE id_usuario = ?`,
        [id_usuario],
    );

    if (empresaResults.length === 0) {
      return res.status(404).json({error: "Datos no encontrados"});
    }

    const perfilEmpresa = empresaResults[0];
    const isPerfilIncompleto = Object.values(perfilEmpresa).some((value) => !value);

    res.json({isPerfilIncompleto});
  } catch (error) {
    console.error("Error al verificar el perfil de la empresa:", error);
    res.status(500).json({error: "Error al verificar el perfil de la empresa"});
  }
});

// Ruta para ver si existe perfil freelancer
router.get("/freelancer/:id_usuario", async (req, res) => {
  const {id_usuario} = req.params;

  try {
    // Verificar usuario
    const userCheckResults = await getUserById(id_usuario);
    if (userCheckResults.length === 0) {
      return res.status(404).json({error: "Usuario no encontrado"});
    }

    // Obtener `id_freelancer`
    const freelancerResults = await getFreelancerByUserId(id_usuario);
    if (freelancerResults.length === 0) {
      return res.status(404).json({error: "Freelancer no encontrado"});
    }

    const id_freelancer = freelancerResults[0].id_freelancer;

    // Verificar antecedentes personales
    const [antecedentesResults] = await pool.query(
        "SELECT * FROM antecedentes_personales WHERE id_freelancer = ?",
        [id_freelancer],
    );

    const isPerfilIncompleto = antecedentesResults.length === 0;

    res.json({isPerfilIncompleto});
  } catch (error) {
    console.error("Error al verificar el perfil del freelancer:", error);
    res.status(500).json({error: "Error al verificar el perfil del freelancer"});
  }
});

// Ruta para ...
router.post("/upload-cv", upload.single("cv"), async (req, res) => {
  const file = req.file;
  const id_usuario = req.body.id_usuario;

  console.log("Archivo recibido:", req.file);
  console.log("Cuerpo de la solicitud (req.body):", req.body);

  if (!file) {
    return res.status(400).json({error: "No se ha proporcionado ningún archivo."});
  }

  try {
    const cv_url = `/uploads/cvs/${file.filename}`;
    let extractedText = "";

    // Procesar PDF
    if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    }
    // Procesar archivos Word
    else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.mimetype === "application/msword") {
      const dataBuffer = fs.readFileSync(file.path);
      const docData = await mammoth.extractRawText({buffer: dataBuffer});
      extractedText = docData.value;
    }
    // Formato no soportado
    else {
      // Limpia el archivo subido
      fs.unlinkSync(file.path);
      return res.status(400).json({error: "Formato de archivo no soportado."});
    }

    // Obtener `id_freelancer`
    const freelancerResults = await getFreelancerByUserId(id_usuario);
    if (freelancerResults.length === 0) {
      return res.status(404).json({error: "Freelancer no encontrado"});
    }

    const id_freelancer = freelancerResults[0].id_freelancer;

    console.log("Texto extraído del archivo:", extractedText);

    // Procesar el texto extraído
    const perfilData = await procesarCV(extractedText);
    perfilData.cv_url = cv_url;
    perfilData.id_freelancer = id_freelancer;

    console.log("Datos procesados para guardar en la DB:", perfilData);

    // Guardar en la base de datos
    await guardarPerfilEnDB(perfilData);

    console.log("Perfil creado exitosamente:", perfilData);

    // Enviar la respuesta final
    return res.status(201).json({message: "Perfil creado exitosamente.", cv_url});
  } catch (error) {
    console.error("Error al procesar el CV:", error);

    // Limpia el archivo subido en caso de error
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Enviar la respuesta de error
    return res.status(500).json({error: "Error al procesar el archivo."});
  }
});

// Recuperar la URL del CV desde la base de datos
router.get("/freelancer/:id/cv", async (req, res) => {
  const idFreelancer = req.params.id;

  try {
    const [result] = await pool.query(
        "SELECT cv_url FROM freelancer WHERE id_freelancer = ?",
        [idFreelancer],
    );

    if (result.length > 0) {
      res.status(200).json({cv_url: result[0].cv_url});
    } else {
      res.status(404).json({error: "Freelancer no encontrado"});
    }
  } catch (error) {
    console.error("Error al obtener la URL del CV:", error);
    res.status(500).json({error: "Error al obtener el CV"});
  }
});

// Función para crear el perfil de freelancer en múltiples tablas
router.post("/create-perfil-freelancer", verifyToken, async (req, res) => {
  const {
    freelancer,
    antecedentes_personales,
    inclusion_laboral,
    emprendimiento,
    trabajo_practica,
    nivel_educacional,
    educacion_superior,
    educacion_basica_media,
    idiomas,
    habilidades,
    curso,
    pretensiones,
    id_usuario,
  } = req.body;

  console.log("Datos enviados al backend:", req.body);

  // Verificar que id_usuario no sea undefined o null
  if (!id_usuario) {
    console.log("Error: id_usuario es undefined o null");
    return res.status(400).json({error: "ID de usuario inválido"});
  }

  try {
    // Verificar usuario
    const userCheckResults = await getUserById(id_usuario);
    if (userCheckResults.length === 0) {
      return res.status(404).json({error: "Usuario no encontrado"});
    }

    console.log("Usuario encontrado");

    // Obtener id_freelancer
    const freelancerResults = await getFreelancerByUserId(id_usuario);
    if (freelancerResults.length === 0) {
      return res.status(404).json({error: "Freelancer no encontrado"});
    }

    const id_freelancer = freelancerResults[0].id_freelancer;
    console.log("ID de freelancer obtenido:", id_freelancer);

    // Actualizar descripción en la tabla freelancer
    await pool.query(`
            UPDATE freelancer SET correo_contacto = ?, telefono_contacto = ?, linkedin_link = ?, descripcion = ? WHERE id_freelancer = ?`
    , [
      freelancer.correo_contacto, freelancer.telefono_contacto, freelancer.linkedin_link,
      freelancer.descripcion_freelancer, id_freelancer,
    ]);

    // Insertar en la tabla 'antecedentes_personales'
    await pool.query(`
            INSERT INTO antecedentes_personales (id_freelancer, nombres, apellidos, fecha_nacimiento, identificacion, nacionalidad, direccion, region, ciudad, comuna, estado_civil)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    , [
      id_freelancer, antecedentes_personales.nombres, antecedentes_personales.apellidos,
      antecedentes_personales.fecha_nacimiento, antecedentes_personales.identificacion,
      antecedentes_personales.nacionalidad, antecedentes_personales.direccion,
      antecedentes_personales.region, antecedentes_personales.ciudad_freelancer,
      antecedentes_personales.comuna, antecedentes_personales.estado_civil,
    ]);

    // Insertar en la tabla 'inclusion_laboral'
    await pool.query(`
            INSERT INTO inclusion_laboral (id_freelancer, discapacidad, registro_nacional, pension_invalidez, ajuste_entrevista, tipo_discapacidad)
            VALUES (?, ?, ?, ?, ?, ?)`
    , [
      id_freelancer, inclusion_laboral.discapacidad, inclusion_laboral.registro_nacional,
      inclusion_laboral.pension_invalidez, inclusion_laboral.ajuste_entrevista,
      inclusion_laboral.tipo_discapacidad,
    ]);

    // Insertar en la tabla 'emprendimiento'
    await pool.query(`
            INSERT INTO emprendimiento (id_freelancer, emprendedor, interesado, ano_inicio, mes_inicio, sector_emprendimiento)
            VALUES (?, ?, ?, ?, ?, ?)`
    , [
      id_freelancer, emprendimiento.emprendedor, emprendimiento.interesado,
      emprendimiento.ano_inicio_emprendimiento, emprendimiento.mes_inicio_emprendimiento,
      emprendimiento.sector_emprendimiento,
    ]);

    // Insertar en la tabla 'trabajo_practica'
    await pool.query(`
            INSERT INTO trabajo_practica (id_freelancer, experiencia_laboral, experiencia, empresa, cargo, area_trabajo, tipo_cargo, ano_inicio, mes_inicio, descripcion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    , [
      id_freelancer, trabajo_practica.experiencia_laboral, trabajo_practica.experiencia,
      trabajo_practica.empresa, trabajo_practica.cargo, trabajo_practica.area_trabajo,
      trabajo_practica.tipo_cargo, trabajo_practica.ano_inicio_trabajo, trabajo_practica.mes_inicio_trabajo,
      trabajo_practica.descripcion_trabajo,
    ]);

    // Insertar en la tabla 'nivel_educacional'
    await pool.query(`
            INSERT INTO nivel_educacional (id_freelancer, nivel_academico, estado)
            VALUES (?, ?, ?)`
    , [
      id_freelancer, nivel_educacional.nivel_academico, nivel_educacional.estado_educacional,
    ]);

    // Insertar en la tabla 'educacion_superior'
    await pool.query(`
            INSERT INTO educacion_superior (id_freelancer, institucion, carrera, carrera_afin, estado, ano_inicio, ano_termino)
            VALUES (?, ?, ?, ?, ?, ?, ?)`
    , [
      id_freelancer, educacion_superior.institucion_superior, educacion_superior.carrera,
      educacion_superior.carrera_afin, educacion_superior.estado_superior,
      educacion_superior.ano_inicio_superior, educacion_superior.ano_termino_superior,
    ]);

    // Insertar en la tabla 'educacion_basica_media'
    await pool.query(`
            INSERT INTO educacion_basica_media (id_freelancer, institucion, tipo, pais, ciudad, ano_inicio, ano_termino)
            VALUES (?, ?, ?, ?, ?, ?, ?)`
    , [
      id_freelancer, educacion_basica_media.institucion_basica_media, educacion_basica_media.tipo,
      educacion_basica_media.pais, educacion_basica_media.ciudad_basica_media,
      educacion_basica_media.ano_inicio_basica_media, educacion_basica_media.ano_termino_basica_media,
    ]);

    // Insertar múltiples idiomas en la tabla 'idiomas'
    const idiomaPromises = idiomas.map((idioma) => {
      return pool.query(`INSERT INTO idiomas (id_freelancer, idioma, nivel) VALUES (?, ?, ?)`, [
        id_freelancer, idioma.idioma, idioma.nivel_idioma,
      ]);
    });
    await Promise.all(idiomaPromises);

    // Insertar múltiples habilidades en la tabla 'habilidades'
    const habilidadPromises = habilidades.map((habilidad) => {
      return pool.query(`INSERT INTO habilidades (id_freelancer, categoria, habilidad, nivel) VALUES (?, ?, ?, ?)`, [
        id_freelancer, habilidad.categoria, habilidad.habilidad, habilidad.nivel_habilidad,
      ]);
    });
    await Promise.all(habilidadPromises);

    // Insertar en la tabla 'curso'
    await pool.query(`
            INSERT INTO curso (id_freelancer, nombre_curso, institucion, ano_inicio, mes_inicio) VALUES (?, ?, ?, ?, ?)`, [
      id_freelancer, curso.nombre_curso, curso.institucion_curso, curso.ano_inicio_curso, curso.mes_inicio_curso,
    ]);

    // Insertar en la tabla 'pretensiones'
    await pool.query(`
            INSERT INTO pretensiones (id_freelancer, disponibilidad, renta_esperada) VALUES (?, ?, ?)`, [
      id_freelancer, pretensiones.disponibilidad, pretensiones.renta_esperada,
    ]);

    console.log("Perfil freelancer creado exitosamente");
    res.status(201).json({message: "Perfil de freelancer creado exitosamente"});
  } catch (err) {
    console.error("Error al crear el perfil:", err);
    res.status(500).json({error: "Error al crear el perfil de freelancer"});
  }
});

// Ruta para crear el perfil empresa
router.post("/create-perfil-empresa", verifyToken, async (req, res) => {
  const {empresaData, representanteData, id_usuario} = req.body;

  console.log("empresaData:", empresaData);
  console.log("representanteData:", representanteData);
  console.log("ID Usuario:", id_usuario);

  if (!id_usuario) {
    console.log("Error: id_usuario es undefined o null");
    return res.status(400).json({error: "ID de usuario inválido"});
  }

  try {
    // Verificar usuario
    const userCheckResults = await getUserById(id_usuario);
    if (userCheckResults.length === 0) {
      return res.status(404).json({error: "Usuario no encontrado"});
    }
    console.log("Usuario encontrado");

    // Obtener `id_empresa`
    const empresaResults = await getEmpresaByUserId(id_usuario);
    if (empresaResults.length === 0) {
      return res.status(404).json({error: "Empresa no encontrada"});
    }

    const id_empresa = empresaResults[0].id_empresa;
    console.log("ID de Empresa obtenido:", id_empresa);

    // Actualizar descripción en la tabla empresa
    const updateEmpresaQuery = `
        UPDATE empresa
        SET nombre_empresa = ?, 
            identificacion_fiscal = ?, 
            direccion = ?, 
            telefono_contacto = ?, 
            correo_empresa = ?, 
            pagina_web = ?, 
            descripcion = ?, 
            sector_industrial = ?
        WHERE id_empresa = ?;
      `;
    await pool.query(updateEmpresaQuery, [
      empresaData.nombre_empresa, empresaData.identificacion_fiscal,
      empresaData.direccion, empresaData.telefono_contacto, empresaData.correo_empresa,
      empresaData.pagina_web, empresaData.descripcion, empresaData.sector_industrial, id_empresa,
    ]);

    const insertRepresentanteQuery = `
        INSERT INTO representante_empresa (id_empresa, nombre_completo, cargo, correo_representante, telefono_representante)
        VALUES (?, ?, ?, ?, ?)
      `;
    await pool.query(insertRepresentanteQuery, [
      id_empresa, representanteData.nombre_completo, representanteData.cargo,
      representanteData.correo_representante, representanteData.telefono_representante,
    ]);

    console.log("Perfil empresa creado exitosamente");
    res.status(201).json({message: "Perfil de empresa creado exitosamente"});
  } catch (err) {
    console.error("Error al crear el perfil de la empresa:", err);
    res.status(500).json({error: "Error al crear el perfil de empresa"});
  }
});

// Ruta para traer el perfil de la empresa y el representante
router.get("/perfil-empresa/:id_usuario", async (req, res) => {
  const {id_usuario} = req.params;
  console.log("id_usuario:", id_usuario);

  if (!id_usuario) {
    console.log("Error: id_usuario es undefined o null");
    return res.status(400).json({error: "ID de usuario inválido"});
  }

  try {
    // Verificar usuario
    const perfilUsuarioResults = await getUserById(id_usuario);
    if (perfilUsuarioResults.length === 0) {
      return res.status(404).json({error: "No se encontró el perfil usuario"});
    }

    // Obtener el perfil de la empresa
    const perfilEmpresaResults = await getEmpresaByUserId(id_usuario);
    if (perfilEmpresaResults.length === 0) {
      return res.status(404).json({error: "No se encontró el perfil de la empresa"});
    }

    const id_empresa = perfilEmpresaResults[0].id_empresa;
    console.log("id_empresa:", id_empresa);

    // Obtener el perfil del representante
    const perfilRepresentanteResults = await getRepresentanteByUserId(id_empresa);
    if (perfilRepresentanteResults.length === 0) {
      return res.status(404).json({error: "No se encontró el perfil representante"});
    }
    console.log("pefil:", perfilUsuarioResults[0], perfilEmpresaResults[0], perfilRepresentanteResults[0]);

    // Enviar ambos perfiles en la respuesta
    res.json({
      perfilUsuario: perfilUsuarioResults[0],
      perfilEmpresa: perfilEmpresaResults[0],
      perfilRepresentante: perfilRepresentanteResults[0],
    });
  } catch (error) {
    console.log("Error al obtener los perfiles:", error);
    res.status(500).json({error: "Error al obtener los perfiles"});
  }
});

// Ruta para obtener el perfil del freelancer
router.get("/perfil-freelancer/:id_usuario", async (req, res) => {
  const {id_usuario} = req.params;

  // Validar que el id_usuario sea válido
  if (!id_usuario || isNaN(id_usuario)) {
    return res.status(400).json({error: "ID de usuario inválido"});
  }

  try {
    // Verificar usuario
    const perfilUsuarioResults = await getUserById(id_usuario);
    if (perfilUsuarioResults.length === 0) {
      return res.status(404).json({error: "No se encontró el usuario"});
    }

    // Obtener freelancer
    const perfilFreelancerResults = await getFreelancerByUserId(id_usuario);
    if (perfilFreelancerResults.length === 0) {
      return res.status(404).json({error: "No se encontró el freelancer"});
    }
    const id_freelancer = perfilFreelancerResults[0].id_freelancer;

    // Consultar datos adicionales de las tablas relacionadas (opcional)
    const [antecedentes] = await pool.query(`
            SELECT * FROM antecedentes_personales WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [inclusionLaboral] = await pool.query(`
            SELECT * FROM inclusion_laboral WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [emprendimiento] = await pool.query(`
            SELECT * FROM emprendimiento WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [trabajoPractica] = await pool.query(`
            SELECT * FROM trabajo_practica WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [nivelEducacional] = await pool.query(`
            SELECT * FROM nivel_educacional WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [educacionSuperior] = await pool.query(`
            SELECT * FROM educacion_superior WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [educacionBasica] = await pool.query(`
            SELECT * FROM educacion_basica_media WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [idiomas] = await pool.query(`
            SELECT * FROM idiomas WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [habilidades] = await pool.query(`
            SELECT * FROM habilidades WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [cursos] = await pool.query(`
            SELECT * FROM curso WHERE id_freelancer = ?
        `, [id_freelancer]);

    const [pretensiones] = await pool.query(`
            SELECT * FROM pretensiones WHERE id_freelancer = ?
        `, [id_freelancer]);

    // Consolidar los datos en una sola respuesta
    res.json({
      usuario: perfilUsuarioResults[0],
      freelancer: perfilFreelancerResults[0],
      antecedentesPersonales: antecedentes[0] || {},
      inclusionLaboral: inclusionLaboral[0] || {},
      emprendimiento: emprendimiento || [],
      trabajoPractica: trabajoPractica || [],
      nivelEducacional: nivelEducacional[0] || {},
      educacionSuperior: educacionSuperior || {},
      educacionBasicaMedia: educacionBasica || {},
      idiomas: idiomas || [],
      habilidades: habilidades || [],
      curso: cursos || [],
      pretensiones: pretensiones[0] || {},
    });
  } catch (error) {
    console.error("Error al obtener el perfil del freelancer:", error);
    res.status(500).json({error: "Error al obtener el perfil del freelancer"});
  }
});

// Ruta para actualizar sección de perfil
router.put("/update-freelancer/:id_usuario/:section", async (req, res) => {
  const {id_usuario, section} = req.params;
  console.log("id_usuario:", id_usuario);
  console.log("seccion:", section);
  const updatedData = req.body;

  try {
    // Obtener freelancer
    const perfilFreelancerResults = await getFreelancerByUserId(id_usuario);
    if (perfilFreelancerResults.length === 0) {
      return res.status(404).json({error: "No se encontró el freelancer"});
    }
    const id_freelancer = perfilFreelancerResults[0].id_freelancer;

    switch (section) {
      case "informacionGeneral":
        const query1 = `
                    UPDATE antecedentes_personales
                    SET nombres = ?, apellidos = ?, fecha_nacimiento = ?,
                    identificacion = ?, nacionalidad = ?, direccion = ?, region = ?, ciudad = ?, comuna = ?
                    WHERE id_freelancer = ?
                `;
        const fecha_nacimiento = new Date(updatedData.fecha_nacimiento).toISOString().split("T")[0];
        const values1 = [
          updatedData.nombres,
          updatedData.apellidos,
          fecha_nacimiento,
          updatedData.identificacion,
          updatedData.nacionalidad,
          updatedData.direccion,
          updatedData.region,
          updatedData.ciudad,
          updatedData.comuna,
          id_freelancer,
        ];
        const query2 = `
                    UPDATE freelancer
                    SET correo_contacto = ?, telefono_contacto = ?
                    WHERE id_freelancer = ?
                `;
        const values2 = [
          updatedData.correo_contacto,
          updatedData.telefono_contacto,
          id_freelancer,
        ];
        const [result1] = await pool.query(query1, values1);
        const [result2] = await pool.query(query2, values2);

        // Verificar si se actualizaron registros
        if (result1.affectedRows === 0 && result2.affectedRows === 0) {
          return res.status(404).json({error: "No se encontraron datos para actualizar"});
        }
        break;

      case "presentacion":
        const query = `
                    UPDATE freelancer
                    SET descripcion = ?
                    WHERE id_freelancer = ?
                `;
        const values = [
          updatedData.descripcion,
          id_freelancer,
        ];
        const [presentacionResult] = await pool.query(query, values);

        // Verificar si se actualizaron registros
        if (presentacionResult.affectedRows === 0) {
          return res.status(404).json({error: "No se encontraron datos para actualizar"});
        }
        break;

      case "formacion":
        const query3 = `
                    UPDATE nivel_educacional
                    SET nivel_academico = ?, estado = ?
                    WHERE id_freelancer = ?
                `;
        const values3 = [
          updatedData.nivel_academico,
          updatedData.estado,
          id_freelancer,
        ];
        const [formacionResult] = await pool.query(query3, values3);

        // Verificar si se actualizaron registros
        if (formacionResult.affectedRows === 0) {
          return res.status(404).json({error: "No se encontraron datos para actualizar"});
        }
        break;
      case "pretensiones":
        const query4 = `
                    UPDATE pretensiones
                    SET disponibilidad  = ?, renta_esperada = ?
                    WHERE id_freelancer = ?
                `;
        const values4 = [
          updatedData.disponibilidad,
          updatedData.renta_esperada,
          id_freelancer,
        ];
        const [pretensionesResult] = await pool.query(query4, values4);

        // Verificar si se actualizaron registros
        if (pretensionesResult.affectedRows === 0) {
          return res.status(404).json({error: "No se encontraron datos para actualizar"});
        }
        break;

      default:
        return res.status(400).json({error: "Sección no válida"});
    }

    res.json({mensaje: "Actualización exitosa", datos: updatedData});
  } catch (error) {
    console.error(`Error al actualizar ${section}:`, error);
    res.status(500).json({error: "Error al actualizar perfil", detalles: error.message});
  }
});

// Ruta para agregar datos
router.post("/add-freelancer/:id_usuario/:itemType", async (req, res) => {
  const {id_usuario, itemType} = req.params;
  const data = req.body;

  if (!id_usuario || !itemType) {
    return res.status(400).json({message: "El ID de usuario o el tipo de elemento no están definidos."});
  }

  try {
    // Obtener freelancer
    const perfilFreelancerResults = await getFreelancerByUserId(id_usuario);
    if (perfilFreelancerResults.length === 0) {
      return res.status(404).json({error: "No se encontró el freelancer"});
    }
    const id_freelancer = perfilFreelancerResults[0].id_freelancer;

    let tableName;
    let columns = [];
    let values = [];

    // Seleccionar tabla y columnas según el itemType
    switch (itemType) {
      case "inclusionLaboral":
        tableName = "inclusion_laboral";
        columns = ["id_freelancer", "discapacidad", "registro_nacional", "pension_invalidez", "ajuste_entrevista", "tipo_discapacidad"];
        values = [id_freelancer, data.discapacidad, data.registro_nacional, data.pension_invalidez, data.ajuste_entrevista, data.tipo_discapacidad];
        break;
      case "experienciaLaboral":
        tableName = "emprendimiento";
        columns = ["id_freelancer", "emprendedor", "interesado", "ano_inicio", "mes_inicio", "sector_emprendimiento"];
        values = [id_freelancer, data.emprendedor, data.interesado, data.ano_inicio_emp, data.mes_inicio_emp, data.sector_emprendimiento];
        break;
      case "trabajoPractica":
        tableName = "trabajo_practica";
        columns = ["id_freelancer", "experiencia_laboral", "experiencia", "empresa", "cargo", "area_trabajo", "tipo_cargo", "ano_inicio", "mes_inicio", "descripcion"];
        values = [id_freelancer, data.experiencia_laboral, data.experiencia, data.empresa, data.cargo, data.area_trabajo, data.tipo_cargo, data.ano_inicio_tra, data.mes_inicio_tra, data.descripcion];
        break;
      case "formacion":
        tableName = "nivel_educacional";
        columns = ["id_freelancer", "nivel_academico", "estado"];
        values = [id_freelancer, data.nivel_academico, data.estado];
        break;
      case "educacionSuperior":
        tableName = "educacion_superior";
        columns = ["id_freelancer", "institucion", "carrera", "carrera_afin", "estado", "ano_inicio", "ano_termino"];
        values = [id_freelancer, data.institucion, data.carrera, data.carrera_afin, data.estado_carrera, data.ano_inicio_su, data.ano_termino_su];
        break;
      case "educacionBasicaMedia":
        tableName = "educacion_basica_media";
        columns = ["id_freelancer", "institucion", "tipo", "pais", "ciudad", "ano_inicio", "ano_termino"];
        values = [id_freelancer, data.institucion, data.tipo, data.pais, data.ciudad, data.ano_inicio_ba, data.ano_termino_ba];
        break;
      case "conocimientos":
        tableName = "curso";
        columns = ["id_freelancer", "nombre_curso", "institucion", "ano_inicio", "mes_inicio"];
        values = [id_freelancer, data.nombre_curso, data.institucion, data.ano_inicio_cur, data.mes_inicio_cur];
        break;
      case "idiomas":
        tableName = "idiomas";
        columns = ["id_freelancer", "idioma", "nivel"];
        values = [id_freelancer, data.idioma, data.nivel];
        break;
      case "habilidades":
        tableName = "habilidades";
        columns = ["id_freelancer", "categoria", "habilidad", "nivel"];
        values = [id_freelancer, data.categoria, data.habilidad, data.nivel];
        break;
      default:
        return res.status(400).json({message: "Tipo de elemento no reconocido."});
    }

    // Construcción de la consulta SQL
    const placeholders = columns.map(() => "?").join(", ");
    const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;

    // Ejecución de la consulta
    await pool.execute(sql, values);

    res.status(201).json({message: `${itemType} agregado correctamente.`});
  } catch (error) {
    console.error("Error al agregar datos:", error);
    res.status(500).json({message: "Error interno del servidor."});
  }
});

router.delete("/delete-idioma-habilidad/:id_usuario/:seccion/:id", async (req, res) => {
  const {id_usuario, seccion, id} = req.params;

  try {
    let query; let values;

    switch (seccion) {
      case "idiomas":
        query = "DELETE FROM idiomas WHERE id_idioma = ? AND id_freelancer = (SELECT id_freelancer FROM freelancer WHERE id_usuario = ?)";
        values = [id, id_usuario];
        break;

      case "habilidades":
        query = "DELETE FROM habilidades WHERE id_habilidad = ? AND id_freelancer = (SELECT id_freelancer FROM freelancer WHERE id_usuario = ?)";
        values = [id, id_usuario];
        break;

      default:
        return res.status(400).json({error: "Sección no válida"});
    }

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({error: "Dato no encontrado"});
    }

    res.json({mensaje: `${seccion.slice(0, -1)} eliminado exitosamente`});
  } catch (error) {
    console.error(`Error al eliminar ${seccion}:`, error);
    res.status(500).json({error: "Error al eliminar datos"});
  }
});

// Ruta para obtener el perfil del freelancer seleccionado
router.get("/freelancer-perfil/:id", async (req, res) => {
  const {id} = req.params;

  // Validar que el id_usuario sea válido
  if (!id || isNaN(id)) {
    return res.status(400).json({error: "ID de usuario inválido"});
  }

  try {
    // Obtener freelancer
    const [perfilFreelancerResults] = await pool.query("SELECT * FROM freelancer WHERE id_freelancer = ?", [id]);
    if (perfilFreelancerResults.length === 0) {
      return res.status(404).json({error: "No se encontró el freelancer"});
    }
    const id_usuario = perfilFreelancerResults[0].id_usuario;

    // Obtener usuario
    const [usuarioResults] = await pool.query("SELECT * FROM usuario WHERE id_usuario = ?", [id_usuario]);
    if (usuarioResults.length === 0) {
      return res.status(404).json({error: "No se encontró el usuario"});
    }

    // Consultar datos adicionales de las tablas relacionadas (opcional)
    const [antecedentes] = await pool.query(`
            SELECT * FROM antecedentes_personales WHERE id_freelancer = ?
        `, [id]);

    const [inclusionLaboral] = await pool.query(`
            SELECT * FROM inclusion_laboral WHERE id_freelancer = ?
        `, [id]);

    const [emprendimiento] = await pool.query(`
            SELECT * FROM emprendimiento WHERE id_freelancer = ?
        `, [id]);

    const [trabajoPractica] = await pool.query(`
            SELECT * FROM trabajo_practica WHERE id_freelancer = ?
        `, [id]);

    const [nivelEducacional] = await pool.query(`
            SELECT * FROM nivel_educacional WHERE id_freelancer = ?
        `, [id]);

    const [educacionSuperior] = await pool.query(`
            SELECT * FROM educacion_superior WHERE id_freelancer = ?
        `, [id]);

    const [educacionBasica] = await pool.query(`
            SELECT * FROM educacion_basica_media WHERE id_freelancer = ?
        `, [id]);

    const [idiomas] = await pool.query(`
            SELECT * FROM idiomas WHERE id_freelancer = ?
        `, [id]);

    const [habilidades] = await pool.query(`
            SELECT * FROM habilidades WHERE id_freelancer = ?
        `, [id]);

    const [cursos] = await pool.query(`
            SELECT * FROM curso WHERE id_freelancer = ?
        `, [id]);

    const [pretensiones] = await pool.query(`
            SELECT * FROM pretensiones WHERE id_freelancer = ?
        `, [id]);

    console.log("perfilFreelancerResults:", perfilFreelancerResults);
    console.log("usuarioResults:", usuarioResults);

    // Consolidar los datos en una sola respuesta
    res.json({
      usuario: {
        id_usuario: usuarioResults[0].id_usuario,
        correo: usuarioResults[0].correo,
        tipo_usuario: usuarioResults[0].tipo_usuario,
      },
      freelancer: perfilFreelancerResults[0] || null,
      antecedentesPersonales: antecedentes[0] || {},
      inclusionLaboral: inclusionLaboral[0] || {},
      emprendimiento: emprendimiento || [],
      trabajoPractica: trabajoPractica || [],
      nivelEducacional: nivelEducacional[0] || {},
      educacionSuperior: educacionSuperior || [],
      educacionBasicaMedia: educacionBasica || [],
      idiomas: idiomas || [],
      habilidades: habilidades || [],
      curso: cursos || [],
      pretensiones: pretensiones[0] || {},
    });
  } catch (error) {
    console.error("Error al obtener el perfil del freelancer:", error);
    res.status(500).json({error: "Error al obtener el perfil del freelancer"});
  }
});


// Ruta para buscar freelancers
router.get("/freelancer", async (req, res) => {
  const getFreelancerQuery = `
        SELECT 
            f.id_freelancer AS id_freelancer,
            ap.nombres AS nombres,
            ap.apellidos AS apellidos,
            ap.nacionalidad AS nacionalidad,
            ap.ciudad AS ciudad,
            ap.comuna AS comuna,
            f.correo_contacto AS correo_contacto,
            f.telefono_contacto AS telefono_contacto,
            f.calificacion_promedio AS calificacion_promedio,
            f.descripcion AS descripcion
        FROM freelancer AS f
        JOIN antecedentes_personales AS ap ON f.id_freelancer = ap.id_freelancer
    `;

  try {
    // Usar el pool para ejecutar la consulta
    const [results] = await pool.query(getFreelancerQuery); // Cambié 'db' a 'pool'

    if (results.length === 0) {
      return res.status(404).json({error: "No se encontraron freelancers"});
    }

    // Procesar los resultados para solo enviar el primer nombre y apellido
    const freelancers = results.map((freelancer) => ({
      id_freelancer: freelancer.id_freelancer,
      nombre: freelancer.nombres,
      apellido: freelancer.apellidos,
      nacionalidad: freelancer.nacionalidad,
      ciudad: freelancer.ciudad,
      comuna: freelancer.comuna,
      correo_contacto: freelancer.correo_contacto,
      telefono_contacto: freelancer.telefono_contacto,
      calificacion_promedio: freelancer.calificacion_promedio,
      descripcion: freelancer.descripcion,
    }));

    res.json(freelancers);
  } catch (error) {
    console.log("Error al obtener los freelancers:", error);
    return res.status(500).json({error: "Error al obtener los freelancers"});
  }
});

// Traer los proyectos y publicaciones de la base de datos
router.get("/proyectos", async (req, res) => {
  try {
    // Consulta para obtener proyectos con sus publicaciones
    const [proyectos] = await pool.query(`
            SELECT 
                p.id_proyecto,
                p.id_empresa,
                p.titulo,
                p.categoria,
                p.descripcion,
                pp.fecha_creacion,
                pp.fecha_publicacion,
                pp.estado_publicacion
            FROM proyecto p
            LEFT JOIN publicacion_proyecto pp 
            ON p.id_proyecto = pp.id_proyecto
        `);

    if (proyectos.length === 0) {
      return res.status(404).json({error: "No se encontraron proyectos"});
    }

    res.json(proyectos);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      mensaje: error.message,
    });
  }
});

// Ruta para bajar publicación
router.put("/update-proyecto-state/:id_proyecto", async (req, res) => {
  const {id_proyecto} = req.params;

  if (!id_proyecto || isNaN(id_proyecto)) {
    return res.status(400).json({error: "ID de usuario inválido"});
  }

  try {
    const [results] = await pool.query(`
            UPDATE publicacion_proyecto SET estado_publicacion = 'cancelado'
            WHERE id_proyecto = ?`, [id_proyecto],
    );

    // Verificar si se actualizaron registros
    if (results.affectedRows === 0) {
      return res.status(404).json({error: "No se encontro publicación para bajar"});
    }

    res.json({mensaje: "Actualización exitosa"});
  } catch (error) {
    console.error("Error al intentar bajar la publicación", error);
    res.status(500).json({error: "Error al bajar publicación", detalles: error.message});
  }
});

// Ruta para traer tabla pagos proyectos
router.get("/pagos-proyectos", async (req, res) => {
  try {
    // Consulta para obtener pagos de proyectos y los datos del usuario relacionado
    const [pagosProyectos] = await pool.query(`
            SELECT 
                pp.id_pago,
                pp.id_proyecto,
                pp.id_usuario,
                pp.monto,
                pp.fecha_pago,
                pp.estado_pago,
                pp.metodo_pago,
                pp.referencia_pago,
                u.correo,
                u.tipo_usuario
            FROM pago_proyecto pp
            INNER JOIN usuario u 
            ON pp.id_usuario = u.id_usuario
        `);

    if (pagosProyectos.length === 0) {
      return res.status(404).json({error: "No se encontraron pagos de proyectos"});
    }

    res.json(pagosProyectos);
  } catch (error) {
    console.error("Error al obtener pagos de proyectos:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      mensaje: error.message,
    });
  }
});

// Ruta para traer tabla pagos suscripciones
router.get("/pagos-suscripciones", async (req, res) => {
  try {
    // Consulta para obtener pagos de suscripciones y los datos del usuario relacionado
    const [pagosSuscripciones] = await pool.query(`
            SELECT 
                ps.id_pago,
                ps.id_usuario,
                ps.monto,
                ps.fecha_pago,
                ps.estado_pago,
                ps.metodo_pago,
                ps.referencia_pago,
                ps.plan_suscripcion,
                ps.fecha_inicio,
                ps.fecha_fin,
                ps.estado_suscripcion,
                u.correo,
                u.tipo_usuario
            FROM pago_suscripcion ps
            INNER JOIN usuario u 
            ON ps.id_usuario = u.id_usuario
        `);

    if (pagosSuscripciones.length === 0) {
      return res.status(404).json({error: "No se encontraron pagos de suscripciones"});
    }

    res.json(pagosSuscripciones);
  } catch (error) {
    console.error("Error al obtener pagos de suscripciones:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      mensaje: error.message,
    });
  }
});

// Ruta para traer los usuarios
router.get("/usuarios", async (req, res) => {
  try {
    const [usuarios] = await pool.query("SELECT * FROM usuario");

    if (usuarios.length === 0) {
      return res.status(404).json({error: "No se encontraron usuarios"});
    }

    const usuariosConDatos = await Promise.all(
        usuarios.map(async (usuario) => {
          const empresa = usuario.tipo_usuario === "empresa" ?
                    await buscarEmpresaByUserId(usuario.id_usuario) :
                    null;

          const freelancer = usuario.tipo_usuario === "freelancer" ?
                    await buscarFreelancerByUserId(usuario.id_usuario) :
                    null;

          // Procesar datos de rol y premium
          const idRol = usuario.tipo_usuario === "empresa" ?
                    (empresa ? empresa.id_empresa : null) :
                    (freelancer ? freelancer.id_freelancer : null);

          const premium = usuario.tipo_usuario === "empresa" ?
                    (empresa && empresa.premium === 1 ? "Sí" : "No") :
                    (freelancer && freelancer.premium === 1 ? "Sí" : "No");


          return {
            ...usuario,
            idRol,
            premium,
            empresa,
            freelancer,
          };
        }),
    );

    res.json(usuariosConDatos);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({error: "Error interno del servidor"});
  }
});

// Ruta para eliminar usuario
router.delete("/usuarios/:id_usuario", async (req, res) => {
  const id_usuario = req.params.id_usuario;

  // Validar que el id_usuario sea válido
  if (!id_usuario || isNaN(id_usuario)) {
    return res.status(400).json({error: "ID de usuario inválido"});
  }

  try {
    // Verificar usuario
    const usuario = await getUserById(id_usuario);
    if (usuario.length === 0) {
      return res.status(404).json({error: "No se encontró el usuario"});
    }

    const deleteUsuario = "DELETE FROM usuario WHERE id_usuario = ?";
    await pool.query(deleteUsuario, [id_usuario]);

    res.status(200).json({message: "Usuario eliminado exitosamente"});
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).json({error: "Error al eliminar el usuario"});
  }
});

// Ruta para insertar postulacion de freelancer
router.post("/postulacion/:id_publicacion", async (req, res) => {
  const {id_publicacion} = req.params;
  const {id_usuario} = req.body; // Change to req.body to match typical axios post
  console.log("id_publicacion:", id_publicacion);
  console.log("id_usuario:", id_usuario);

  if (!id_publicacion || isNaN(id_publicacion) || !id_usuario || isNaN(id_usuario)) {
    return res.status(400).json({error: "ID invalido"});
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if freelancer already applied to this publication
    const [existingApplications] = await connection.query(`
            SELECT * FROM postulacion 
            JOIN freelancer ON postulacion.id_freelancer = freelancer.id_freelancer
            WHERE postulacion.id_publicacion = ? AND freelancer.id_usuario = ?
        `, [id_publicacion, id_usuario]);

    if (existingApplications.length > 0) {
      return res.status(400).json({error: "Ya has aplicado a este proyecto"});
    }

    // Get freelancer
    const [perfilFreelancerResults] = await connection.query(
        "SELECT id_freelancer FROM freelancer WHERE id_usuario = ?",
        [id_usuario],
    );

    if (perfilFreelancerResults.length === 0) {
      return res.status(404).json({error: "No se encontró el freelancer"});
    }

    const id_freelancer = perfilFreelancerResults[0].id_freelancer;

    // Insert application
    await connection.query(`
            INSERT INTO postulacion (id_publicacion, id_freelancer, fecha_postulacion, estado_postulacion)
            VALUES (?, ?, CURDATE(), 'postulado')
        `, [id_publicacion, id_freelancer]);

    await connection.commit();
    res.status(201).json({
      message: "Postulación exitosa",
      id_publicacion: id_publicacion,
    });
  } catch (error) {
    console.error("Error al intentar postular:", error);
    if (connection) await connection.rollback();
    res.status(500).json({error: "Error interno del servidor"});
  } finally {
    if (connection) connection.release();
  }
});

// Ruta para obtener postulaciones del usuario
router.get("/postulaciones/:id_usuario", async (req, res) => {
  const {id_usuario} = req.params;

  if (!id_usuario || isNaN(id_usuario)) {
    return res.status(400).json({error: "ID inválido"});
  }

  try {
    // Obtener ID del freelancer asociado al usuario
    const [perfilFreelancerResults] = await pool.query(
        "SELECT id_freelancer FROM freelancer WHERE id_usuario = ?",
        [id_usuario],
    );

    if (perfilFreelancerResults.length === 0) {
      return res.status(404).json({error: "No se encontró el freelancer"});
    }

    const id_freelancer = perfilFreelancerResults[0].id_freelancer;

    // Obtener postulaciones del freelancer
    const [postulaciones] = await pool.query(`
            SELECT 
                p.id_postulacion,
                p.fecha_postulacion,
                p.estado_postulacion,
                pr.titulo AS titulo,
                e.nombre_empresa,
                e.correo_empresa,
                e.telefono_contacto,
                pp.fecha_publicacion,
                pp.estado_publicacion
            FROM postulacion AS p
            INNER JOIN publicacion_proyecto AS pp ON p.id_publicacion = pp.id_publicacion
            INNER JOIN proyecto AS pr ON pp.id_proyecto = pr.id_proyecto
            INNER JOIN empresa AS e ON pr.id_empresa = e.id_empresa
            WHERE p.id_freelancer = ?
        `, [id_freelancer]);

    res.json(postulaciones);
  } catch (error) {
    console.error("Error al obtener las postulaciones:", error);
    res.status(500).json({error: "Error interno del servidor"});
  }
});

// Ruta para eliminar una postulación
router.delete("/delete-postulacion/:id_postulacion", async (req, res) => {
  const {id_postulacion} = req.params;

  if (!id_postulacion || isNaN(id_postulacion)) {
    return res.status(400).json({error: "ID inválido"});
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Verificar si el proyecto existe
    const [postulacionExists] = await connection.query(
        "SELECT COUNT(*) as count FROM postulacion WHERE id_postulacion = ?",
        [id_postulacion],
    );

    if (postulacionExists[0].count === 0) {
      console.error("Error en la consulta SQL:", error);
      return res.status(404).json({
        success: false,
        message: "Postulación no encontrada",
      });
    }

    await connection.query(`DELETE FROM postulacion WHERE id_postulacion = ?`,
        [id_postulacion],
    );

    res.status(200).json({
      success: true,
      message: "Postulación eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar la postulación:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la postulación",
    });
  }
});

// Ruta para agregar reseña
router.post("/reviews", async (req, res) => {
  const {id_usuario, calificacion, comentario, id_identificador} = req.body;

  if (!id_usuario || !calificacion || !id_identificador) {
    return sendError(res, 400, "Faltan campos requeridos.");
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Determinar el tipo de usuario que está realizando la reseña
    const [usuarioResena] = await connection.query(
        "SELECT tipo_usuario FROM usuario WHERE id_usuario = ?",
        [id_usuario],
    );

    if (!usuarioResena || usuarioResena.length === 0) {
      return sendError(res, 404, "El usuario que reseña no existe.");
    }

    const tipoUsuario = usuarioResena[0].tipo_usuario;

    let tipo_calificado; let id_calificado;

    if (tipoUsuario === "freelancer") {
      // El que reseña es freelancer => El calificado debe ser una empresa

      // Obtener la empresa asociada al proyecto
      const [proyecto] = await connection.query(
          "SELECT p.id_empresa FROM proyecto p " +
                "INNER JOIN publicacion_proyecto pp ON p.id_proyecto = pp.id_proyecto " +
                "WHERE pp.id_publicacion = ?",
          [id_identificador],
      );

      if (!proyecto || proyecto.length === 0) {
        return sendError(res, 404, "No se encontró una empresa asociada a la publicación.");
      }
      console.log('proyecto:', proyecto);

      id_calificado = proyecto[0].id_empresa;
      console.log('id_calificado:',id_calificado);

      // Obtener empresa
      const empresaResults = await connection.query(`
        SELECT id_usuario FROM empresa WHERE id_empresa = ?`, id_calificado);
      console.log('empresaResults:', empresaResults);
      if (empresaResults.length === 0) {
      }
      const id_usuario = empresaResults[0][0].id_usuario;
      console.log('id_usuario:', id_usuario);
      // Obtener usuario
      const usuarioResults = await getUserById(id_usuario);
      if (usuarioResults.length === 0) {
        return sendError(res, 404, "No se encontró el usuario.");
      }

      tipo_calificado = usuarioResults[0].tipo_usuario;
    } else if (tipoUsuario === "empresa") {
      // El que reseña es una empresa => El calificado debe ser un freelancer

      const [freelancer] = await connection.query(
          "SELECT id_freelancer FROM freelancer WHERE id_freelancer = ?",
          [id_identificador],
      );

      if (!freelancer || freelancer.length === 0) {
        return res.status(404).json({message: "No puedes reseñar a un usuario del mismo tipo."});
      }

      // Obtener usuario
      const usuarioResults = await getFreelancerByUserId(id_identificador);
      if (usuarioResults.length === 0) {
        return res.status(404).json({error: "No puedes reseñar a un usuario del mismo tipo."});
      }

      tipo_calificado = usuarioResults[0].tipo_usuario;
    } else {
      return sendError(res, 400, "El tipo de usuario que reseña no es válido.");
    }

    // Validar que el tipo calificado no sea el mismo que el tipo del usuario que reseña
    if (tipoUsuario === tipo_calificado) {
      return sendError(res, 400, "No puedes reseñar a un usuario del mismo tipo.");
    }

    // Verificar si ya existe una reseña del usuario a este reseñado
    const [existingReview] = await connection.query(
        "SELECT id_resena FROM resena WHERE id_usuario = ? AND id_calificado = ?",
        [id_usuario, id_calificado],
    );

    if (existingReview && existingReview.length > 0) {
      return sendError(res, 409, "Ya has realizado una reseña a este usuario.");
    }

    // Insertar la reseña en la tabla `resena`
    await connection.query(
        "INSERT INTO resena (id_usuario, tipo_calificado, id_calificado, calificacion, comentario, fecha_resena) VALUES (?, ?, ?, ?, ?, CURDATE())",
        [id_usuario, tipo_calificado, id_calificado, calificacion, comentario],
    );

    await connection.commit();

    res.status(201).json({message: "Reseña agregada exitosamente."});
  } catch (err) {
    // Detectar el tipo de error y responder usando sendError
    if (err.response) {
      // El servidor respondió con un error conocido
      return sendError(res, err.response.status, err.response.data.message || "Ocurrió un error desconocido.");
    } else if (err.request) {
      // No se recibió respuesta del servidor (problema de red)
      return sendError(res, 503, "No se pudo conectar con el servidor. Inténtalo más tarde.");
    } else {
      // Error inesperado o desconocido
      console.error("Error inesperado:", err);
      return sendError(res, 500, "Ocurrió un error inesperado.");
    }
  } finally {
    if (connection) connection.release(); // Liberar la conexión en cualquier caso
  }
});


module.exports = router;
