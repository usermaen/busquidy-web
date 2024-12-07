const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Clave secreta JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      console.error("No authorization header");
      return res.status(401).json({error: "Acceso denegado"});
    }

    const token = authHeader.split(" ")[1];
    console.log("Token recibido:", token);

    if (!token) return res.status(401).json({error: "Acceso denegado"});

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // El token decodificado contiene la información del usuario
    next();
  } catch (err) {
    console.error("Error al verificar el token:", err.message);
    res.status(401).json({error: "Token inválido"});
  }
};

// Middleware para validar usuario
const validateUser = async (req, res, next) => {
  const {id_usuario} = req.params;
  try {
    const [usuario] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id_usuario]);
    if (usuario.length === 0) {
      return res.status(404).json({error: "Usuario no encontrado"});
    }
    req.usuario = usuario[0];
    next();
  } catch (error) {
    res.status(500).json({error: "Error de validación de usuario"});
  }
};

// Middleware de validación
function validatePaymentData(req, res, next) {
  const {title, price, quantity, id_usuario, id_proyecto} = req.body;
  if (!title || !price || !quantity || !id_usuario || id_proyecto) {
    return res.status(400).json({error: "Faltan datos obligatorios para la preferencia de pago"});
  }
  if (isNaN(price) || isNaN(quantity)) {
    return res.status(400).json({error: "El precio y la cantidad deben ser valores numéricos"});
  }
  next();
}

// Configuración de multer para guardar archivos en una carpeta local
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/cvs"); // La carpeta donde se guardarán los archivos
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Renombrar archivo con timestamp
  },
});

const upload = multer({storage});

module.exports = {verifyToken, validatePaymentData, validateUser, upload};
