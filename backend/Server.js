require("dotenv").config(); // Carga variables de entorno

console.log("DB_HOST:", process.env.DB_HOST); // Debería mostrar 'localhost'
console.log("DB_USER:", process.env.DB_USER); // Debería mostrar 'root'
console.log("DB_PASSWORD:", process.env.DB_PASSWORD); // Debería mostrar 'admin'
console.log("DB_NAME:", process.env.DB_NAME); // Debería mostrar 'plataforma'

const express = require("express"); // Framework Express
const cors = require("cors"); // Permitir solicitudes de diferentes orígenes
const bodyParser = require("body-parser"); // Procesar solicitudes HTTP
const db = require("./db"); // Importar el pool de conexiones
const fs = require("fs");
const path = require("path");
const routes = require("./routes");

const app = express();
const port = process.env.PORT || 3001;
const uploadsDir = path.join(__dirname, process.env.UPLOADS_DIR || "uploads/cvs");

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      'http://localhost:3000', 
      'https://localhost:3000',
      process.env.FRONTEND_URL
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Use the cors middleware before your routes
app.use(cors(corsOptions));

app.use(express.static("public")); // Archivos estáticos
app.use(bodyParser.urlencoded({extended: true})); // Formularios
app.use(bodyParser.json()); // JSON
// Usar las rutas en la aplicación
app.use("/api", routes);

// Verificar la conexión con la base de datos
async function testDbConnection() {
  try {
    // Usamos pool.query() para verificar la conexión
    const [rows] = await db.pool.query("SELECT 1 + 1 AS resultado");
    console.log("Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error.message);
  }
}
testDbConnection();

// Middleware de manejo de errores general
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Verificar si el directorio existe, si no, crearlo
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {recursive: true}); // `recursive: true` crea directorios intermedios si no existen
  console.log(`Directorio creado: ${uploadsDir}`);
} else {
  console.log(`El directorio ya existe: ${uploadsDir}`);
}

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor Express iniciado en el puerto ${port}`);
});

module.exports = app;
