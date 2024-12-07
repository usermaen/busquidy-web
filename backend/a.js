// Importar la librería bcryptjs
const bcrypt = require("bcryptjs");

// Función asincrónica para generar el hash de la contraseña
async function hashPassword() {
  const password = "administrador@1";

  try {
    // Esperar a que se resuelva el hash
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Contraseña hasheada:", hashedPassword); // Mostrar el hash
  } catch (err) {
    console.log("Error al generar el hash:", err);
  }
}

// Llamar a la función
hashPassword();
