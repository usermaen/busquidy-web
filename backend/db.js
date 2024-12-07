require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Función para insertar un usuario
async function insertarUsuario(correo, hashedPassword, tipo_usuario) {
  try {
    const [result] = await pool.query(
        "INSERT INTO usuario (correo, contraseña, tipo_usuario) VALUES (?, ?, ?)",
        [correo, hashedPassword, tipo_usuario],
    );
    return result.insertId; // Retorna el ID del nuevo usuario insertado
  } catch (error) {
    console.error("Error al insertar usuario:", error.message);
    throw error; // Lanza el error para ser manejado por la función que llame
  }
}

// Función para obtener usuario por id
async function getUserById(id_usuario) {
  try {
    const [rows] = await pool.query("SELECT * FROM usuario WHERE id_usuario = ?", [id_usuario]);
    return rows;
  } catch (error) {
    console.error(`Error al obtener usuario para id_usuario=${id_usuario}:`, error);
    throw new Error("Error al consultar la tabla usuario");
  }
}

// Función para obtener datos de empresa por ID de usuario
async function getEmpresaByUserId(id_usuario) {
  try {
    const [rows] = await pool.query("SELECT * FROM empresa WHERE id_usuario = ?", [id_usuario]);
    return rows;
  } catch (error) {
    console.error(`Error al obtener empresa para id_usuario=${id_usuario}:`, error);
    throw new Error("Error al consultar la tabla empresa");
  }
}

// Función para obtener datos de freelancer por ID de usuario
async function getFreelancerByUserId(id_usuario) {
  try {
    const [rows] = await pool.query("SELECT * FROM freelancer WHERE id_usuario = ?", [id_usuario]);
    return rows;
  } catch (error) {
    console.error(`Error al obtener freelancer para id_usuario=${id_usuario}:`, error);
    throw new Error("Error al consultar la tabla freelancer");
  }
}

// Función para obtener datos de empresa por ID de usuario
async function buscarEmpresaByUserId(id_usuario) {
  try {
    const [rows] = await pool.query("SELECT * FROM empresa WHERE id_usuario = ?", [id_usuario]);
    return rows[0] || null;
  } catch (error) {
    console.error(`Error al obtener empresa para id_usuario=${id_usuario}:`, error);
    throw new Error("Error al consultar la tabla empresa");
  }
}

// Función para obtener datos de freelancer por ID de usuario
async function buscarFreelancerByUserId(id_usuario) {
  try {
    const [rows] = await pool.query("SELECT * FROM freelancer WHERE id_usuario = ?", [id_usuario]);
    return rows[0] || null;
  } catch (error) {
    console.error(`Error al obtener freelancer para id_usuario=${id_usuario}:`, error);
    throw new Error("Error al consultar la tabla freelancer");
  }
}

// Función para obtener representante por id empresa
async function getRepresentanteByUserId(id_empresa) {
  const [rows] = await pool.query("SELECT * FROM representante_empresa WHERE id_empresa = ?", [id_empresa]);
  return rows;
}

// Función para verificar que no se dublique el proyecto
async function checkDuplicateProject(id_empresa, projectData) {
  const [rows] = await pool.query(
      `SELECT * FROM proyecto 
     WHERE id_empresa = ? AND titulo = ? AND descripcion = ? AND categoria = ? 
     AND habilidades_requeridas = ? AND presupuesto = ? AND duracion_estimada = ? 
     AND fecha_limite = ? AND ubicacion = ? AND tipo_contratacion = ? 
     AND metodologia_trabajo = ?`,
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
  return rows;
}

// Función para guardar los datos en la base de datos
async function guardarPerfilEnDB(data) {
  console.log("data:", data);
  const {
    id_freelancer,
    cv_url,
    freelancer,
    antecedentesPersonales,
    inclusionLaboral,
    experienciaLaboral,
    formacion,
    curso,
    pretensiones,
  } = data;

  try {
    if (id_freelancer == null) {
      console.log("id_freelancer:", id_freelancer);
      return;
    }

    // Actualizar descripción y cv_url en la tabla freelancer
    await pool.query(
        `UPDATE freelancer SET correo_contacto = ?, telefono_contacto = ?, linkedin_link = ?, descripcion = ?, cv_url = ? WHERE id_freelancer = ?`,
        [freelancer.correo, freelancer.telefono, freelancer.linkedin, freelancer.descripcion, cv_url, id_freelancer],
    );

    // Insertar en la tabla 'antecedentes_personales'
    await pool.query(
        `INSERT INTO antecedentes_personales (id_freelancer, nombres, apellidos, fecha_nacimiento, identificacion, nacionalidad, direccion, region, ciudad, comuna, estado_civil)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_freelancer, antecedentesPersonales.nombres, antecedentesPersonales.apellidos,
          antecedentesPersonales.fecha_nacimiento, antecedentesPersonales.identificacion,
          antecedentesPersonales.nacionalidad, antecedentesPersonales.direccion,
          antecedentesPersonales.region, antecedentesPersonales.ciudad_freelancer,
          antecedentesPersonales.comuna, antecedentesPersonales.estado_civil,
        ],
    );

    // Insertar en la tabla 'pretensiones'
    await pool.query(
        `INSERT INTO pretensiones (id_freelancer, disponibilidad, renta_esperada) VALUES (?, ?, ?)`,
        [
          id_freelancer, pretensiones.disponibilidad, pretensiones.renta_esperada,
        ],
    );
  } catch (error) {
    throw error;
  } finally {
  }
}

async function getCvUrlFromDB(idFreelancer) {
  const [result] = await pool.query(
      "SELECT cv_url FROM freelancer WHERE id_freelancer = ?",
      [idFreelancer],
  );
  return result.length > 0 ? result[0].cv_url : null;
}


module.exports = {
  pool, // Exporta el pool de conexiones
  insertarUsuario, // Exporta la función insertarUsuario
  getUserById,
  getEmpresaByUserId,
  getFreelancerByUserId,
  buscarEmpresaByUserId,
  buscarFreelancerByUserId,
  getRepresentanteByUserId,
  checkDuplicateProject,
  getCvUrlFromDB,
  guardarPerfilEnDB,
};
