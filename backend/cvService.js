const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function procesarArchivoCV(file) {
  let extractedText = "";

  if (file.mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);
    extractedText = pdfData.text;
  } else if (
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.mimetype === "application/msword"
  ) {
    const dataBuffer = fs.readFileSync(file.path);
    const docData = await mammoth.extractRawText({buffer: dataBuffer});
    extractedText = docData.value;
  } else {
    throw new Error("Formato de archivo no soportado.");
  }

  return extractedText;
}

// Función para procesar el texto extraído del CV
async function procesarCV(texto) {
  // Funciona
  const nombreCompleto = extraerNombre(texto);
  const {nombres, apellidos} = dividirNombreCompleto(nombreCompleto);
  const identificacion = extraerIdentificacion(texto) || null;
  const linkedIn = extraerDato(texto, /Linkedin:\s*(https?:\/\/[^\s]+)/i) || null;
  const telefono = extraerTelefono(texto, /(?:\+\d{1,3}\s?)?(?:\(?\d{1,3}\)?\s?)?\d{7,10}/) || null;
  const estado_civil = extraerDato(texto, /Estado Civil\s+(.+)/i) || null;
  const nacionalidad = extraerNacionalidad(texto) || null;
  const fecha_nacimiento = extraerFechaNacimiento(texto) || null;
  const region = extraerRegion(texto) || null;
  const ciudad = extraerCiudad(texto) || null;
  const comuna = extraerComuna(texto) || null;
  const direccion = extraerDireccion(texto) || null;
  const disponibilidad = extraerDisponibilidad(texto) || null;
  const renta_esperada = extraerRenta(texto) || null;
  const correo = extraerCorreo(texto) || null;
  const descripcionextraida = extraerDescripcion(texto) || null;
  const descripcion = limpiarTextoParaDB(descripcionextraida);


  // No Funciona
  const idiomas = extraerIdiomas(texto) || [];
  const habilidades = extraerHabilidadesYConocimientos(texto) || [];

  // Crear el objeto de datos extraídos
  const perfilData = {
    freelancer: {correo, telefono, linkedIn, descripcion},
    antecedentesPersonales: {
      nombres,
      apellidos,
      fecha_nacimiento,
      identificacion,
      nacionalidad,
      direccion,
      region,
      ciudad,
      comuna,
      estado_civil,
    },
    // idiomas,
    // habilidades,
    // formacion: extraerFormacionAcademica(texto) || null,
    // experienciaLaboral: extraerExperienciaLaboral(texto, /EXPERIENCIA LABORAL\s+([\s\S]*?)(?:\n\n|$)/i),
    // cursos: extraerCursos(texto) || null,
    pretensiones: {disponibilidad, renta_esperada},
  };

  console.log("Datos extraídos del CV:", perfilData);
  return perfilData;
}

function extraerCursos(texto) {
  if (!texto || texto.trim() === "") return [];
  const cursos = [];

  // Encontrar la sección de CURSOS
  const seccionCursosRegex = /CURSOS\s+(.*?)(?=\s*(?:DETALLES|$))/s;
  const seccionCursos = texto.match(seccionCursosRegex);

  if (!seccionCursos) return [];
  const contenidoCursos = seccionCursos[1];

  // Dividir el contenido en líneas para procesar las fechas
  const lineas = contenidoCursos.split("\n")
      .map((l) => l.trim())
      .filter((l) => l);

  // Patrón actualizado para el formato específico del PDF
  const patronFecha = /^(\w{3})\. (\d{4}) - (\w{3})\. (\d{4})$/;

  let fechaActual = null;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];

    // Verificar si es una línea de fecha
    const matchFecha = linea.match(patronFecha);
    if (matchFecha) {
      fechaActual = {
        mes_inicio: matchFecha[1],
        ano_inicio: matchFecha[2],
        mes_termino: matchFecha[3],
        ano_termino: matchFecha[4],
      };
      continue;
    }

    // Si tenemos una línea que no es fecha y no es "Training Course"
    if (!linea.includes("Training Course")) {
      // Verificar si la siguiente línea es Udemy
      const institucion = i + 1 < lineas.length ? lineas[i + 1] : null;

      if (fechaActual) {
        cursos.push({
          nombre_curso: linea,
          institucion: institucion === "Udemy" ? institucion : null,
          mes_inicio: fechaActual.mes_inicio,
          ano_inicio: fechaActual.ano_inicio,
          mes_termino: fechaActual.mes_termino,
          ano_termino: fechaActual.ano_termino,
        });
      }

      // Si la siguiente línea era Udemy, saltarla
      if (institucion === "Udemy") {
        i++;
      }
    }
  }

  return cursos;
}

function limpiarTextoParaDB(texto) {
  if (!texto) return null;

  return texto
  // Reemplazar viñetas y caracteres especiales comunes
      .replace(/[•·]/g, "-")
  // Reemplazar otros caracteres especiales si es necesario
      .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, "-")
  // Normalizar saltos de línea
      .replace(/\r\n/g, "\n")
  // Eliminar caracteres no imprimibles
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
  // Opcionalmente, reemplazar múltiples espacios por uno solo
      .replace(/\s+/g, " ")
      .trim();
}

function extraerCorreo(texto) {
  // Expresión regular que permite espacios en blanco opcionales alrededor del @
  const match = texto.match(/[\w.-]+\s*@\s*[\w.-]+\.\w+/);
  return match ? match[0].replace(/\s+/g, "") : null; // Si no hay coincidencias, devuelve null
}

function extraerIdentificacion(texto) {
  // Normalizar el texto: quitar espacios extras y convertir a minúsculas
  texto = texto.toLowerCase().replace(/\s+/g, " ");

  // Patrones para encontrar RUT/RUN
  const patrones = [
    // Patrón 1: RUT con puntos y guión (formato más común)
    /\b(\d{1,2}\.\d{3}\.\d{3}[-][0-9kK])\b/,

    // Patrón 2: RUT sin puntos, solo con guión
    /\b(\d{7,8}[-][0-9kK])\b/,

    // Patrón 3: RUT sin guión
    /\b(\d{7,8}[0-9kK])\b/,

    // Patrón 4: Etiquetas como "RUT:" o "RUN:"
    /rut\s*[:]\s*(\d{1,2}\.\d{3}\.\d{3}[-]?[0-9kK])/,
    /run\s*[:]\s*(\d{1,2}\.\d{3}\.\d{3}[-]?[0-9kK])/,

    // Patrón 5: RUT en contexto de documentos personales
    /identificaci[oó]n\s*[:]\s*(\d{1,2}\.\d{3}\.\d{3}[-]?[0-9kK])/,
  ];

  // Probar cada patrón
  for (const patron of patrones) {
    const match = texto.match(patron);
    if (match) {
      // Formatear el RUT si es necesario
      let rut = match[1].toUpperCase().replace(/\./g, "");

      // Asegurar que tenga el formato correcto con guión
      if (!rut.includes("-")) {
        rut = rut.slice(0, -1) + "-" + rut.slice(-1);
      }
      validarRut(rut);
      return rut;
    }
  }

  return null;
}

function extraerFechaNacimiento(texto) {
  // Extraer la fecha como string
  const fechaStr = extraerDato(texto, /Fecha de Nacimiento\s+(.+)/i) || null;

  if (!fechaStr) return null;

  try {
    // Mapeo de meses en español a números
    const meses = {
      "enero": "01",
      "febrero": "02",
      "marzo": "03",
      "abril": "04",
      "mayo": "05",
      "junio": "06",
      "julio": "07",
      "agosto": "08",
      "septiembre": "09",
      "octubre": "10",
      "noviembre": "11",
      "diciembre": "12",
    };

    // Expresión regular para extraer día, mes y año
    const regex = /(\d{1,2})\s+de\s+([A-Za-zá-úÁ-Ú]+)\s+de\s+(\d{4})/i;
    const match = fechaStr.match(regex);

    if (!match) return null;

    const dia = match[1].padStart(2, "0");
    const mesStr = match[2].toLowerCase();
    const año = match[3];

    // Obtener el número de mes
    const mes = meses[mesStr];

    if (!mes) return null;

    // Validar rangos
    const diaNum = parseInt(dia);
    const añoNum = parseInt(año);

    if (diaNum < 1 || diaNum > 31 || añoNum < 1900 || añoNum > 2024) {
      return null;
    }

    // Retornar en formato YYYY-MM-DD
    return `${año}-${mes}-${dia}`;
  } catch (error) {
    console.error("Error al convertir la fecha:", error);
    return null;
  }
}

// Función adicional para validar RUT (opcional pero recomendada)
function validarRut(rut) {
  // Limpiar el RUT
  rut = rut.replace(/[.-]/g, "").toUpperCase();

  // Separar cuerpo y dígito verificador
  const cuerpo = rut.slice(0, -1);
  const digitoVerificador = rut.slice(-1);

  // Calcular dígito verificador
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = suma % 11;
  let dvCalculado = 11 - resto;

  // Mapear resultado
  if (dvCalculado === 10) dvCalculado = "K";
  if (dvCalculado === 11) dvCalculado = "0";

  // Comparar
  return digitoVerificador == dvCalculado;
}

// Funcion extraer nombre
function extraerNombre(texto) {
  // Patrones para encontrar el nombre
  const patrones = [
    // Patrón original para nombres con 4 partes
    /([A-ZÑÁÉÍÓÚ][a-zñáéíóú]+ [A-ZÑÁÉÍÓÚ][a-zñáéíóú]+ [A-ZÑÁÉÍÓÚ][a-zñáéíóú]+ [A-ZÑÁÉÍÓÚ][a-zñáéíóú]+)/,

    // Nuevo patrón para nombres con 3 partes
    /([A-ZÑÁÉÍÓÚ][a-zñáéíóú]+ [A-ZÑÁÉÍÓÚ][a-zñáéíóú]+ [A-ZÑÁÉÍÓÚ][a-zñáéíóú]+)/,

    // Patrón específico buscando después de RUN o antes de "Análisis de Sistemas"
    /RUN \d{8}-\d\s+([A-ZÑÁÉÍÓÚ][a-zñáéíóú]+ [A-ZÑÁÉÍÓÚ][a-zñáéíóú]+ [A-ZÑÁÉÍÓÚ][a-zñáéíóú]+)(?=\s+Análisis)/i,
  ];

  // Probar cada patrón
  for (const patron of patrones) {
    const match = texto.match(patron);
    if (match) {
      // Verificar que el nombre encontrado es válido
      const nombreEncontrado = match[1] || match[0];
      if (nombreEncontrado && !nombreEncontrado.includes("Alto Nivel")) {
        return nombreEncontrado;
      }
    }
  }

  return null; // Retorna null en lugar de un mensaje de error
}

function dividirNombreCompleto(nombreCompleto) {
  // Si no hay nombre completo válido, retornar null en ambos campos
  if (!nombreCompleto) {
    return {
      nombres: null,
      apellidos: null,
    };
  }

  // Dividir el nombre en partes
  const partes = nombreCompleto.trim().split(/\s+/);

  // Para nombres con 3 partes (un nombre y dos apellidos)
  if (partes.length === 3) {
    return {
      nombres: partes[0],
      apellidos: `${partes[1]} ${partes[2]}`,
    };
  }

  // Para nombres con 4 partes
  if (partes.length === 4) {
    return {
      nombres: `${partes[0]} ${partes[1]}`,
      apellidos: `${partes[2]} ${partes[3]}`,
    };
  }

  // En caso de otro número de partes, intentar dividir a la mitad
  const mitad = Math.floor(partes.length / 2);
  return {
    nombres: partes.slice(0, mitad).join(" "),
    apellidos: partes.slice(mitad).join(" "),
  };
}

function extraerNacionalidad(texto) {
  // Normalizar el texto: quitar espacios extras, convertir a minúsculas
  texto = texto.toLowerCase().replace(/\s+/g, " ");

  // Lista de nacionalidades más comunes (puedes expandir esta lista)
  const nacionalidadesComunes = [
    "chilena", "argentina", "peruana", "boliviana",
    "brasileña", "colombiana", "venezolana", "ecuatoriana",
    "uruguaya", "paraguaya", "española", "estadounidense",
    "mexicana", "canadiense", "francesa", "italiana",
    "alemana", "inglesa", "portuguesa", "chileno",
  ];

  // Patrones para buscar nacionalidad
  const patrones = [
    // Patrón 1: Etiqueta "Nacionalidad:"
    /nacionalidad\s*[:]\s*([a-zá-úñ]+)/,

    // Patrón 2: Variaciones de la etiqueta
    /nacionalidad\s*completa\s*[:]\s*([a-zá-úñ]+)/,

    // Patrón 3: En sección de datos personales
    /datos\s*personales[^\n]*nacionalidad\s*[:]\s*([a-zá-úñ]+)/,

    // Patrón 4: Buscar palabras conocidas de nacionalidad
    new RegExp(`(${nacionalidadesComunes.join("|")})`),
  ];

  // Probar cada patrón
  for (const patron of patrones) {
    const match = texto.match(patron);
    if (match) {
      // Capitalizar la primera letra
      let nacionalidad = match[1].trim();
      nacionalidad = nacionalidad.charAt(0).toUpperCase() + nacionalidad.slice(1);
      return nacionalidad;
    }
  }

  // Si no se encuentra, intentar con un método más genérico
  const palabrasNacionalidad = texto.match(/\b([a-zá-úñ]+)\s*nacionalidad\b/i);
  if (palabrasNacionalidad) {
    let nacionalidad = palabrasNacionalidad[1].trim();
    nacionalidad = nacionalidad.charAt(0).toUpperCase() + nacionalidad.slice(1);
    return nacionalidad;
  }

  return null;
}

function extraerDireccion(texto) {
  // Convertir a minúsculas y normalizar espacios
  texto = texto.toLowerCase().replace(/\s+/g, " ").trim();

  // Patrones para detectar direcciones
  const patronesDireccion = [
    /dirección\s*(.*?)(?:\s*(?:número|teléfono|correo|fecha|género|nacionalidad|estado|antecedentes|\d{2}[-/]\d{2}[-/]\d{4}|ago\.|ene\.|dic\.|mar\.|jul\.))/i,
  ];

  for (const patron of patronesDireccion) {
    const match = texto.match(patron);
    if (match) {
      // Devolver la dirección extraída, preservando mayúsculas originales
      return match[1].trim();
    }
  }

  return null;
}

function extraerRegion(texto) {
  texto = texto.toLowerCase().replace(/\s+/g, " ");

  const regionesChile = [
    "arica y parinacota", "tarapacá", "antofagasta", "atacama", "coquimbo",
    "valparaíso", "metropolitana de santiago", "metropolitana", "o'higgins", "maule",
    "ñuble", "biobío", "araucanía", "los ríos", "los lagos", "aysén",
    "magallanes", "antártica chilena",
  ];

  // Buscar primera coincidencia con la lista de regiones
  const regionEncontrada = regionesChile.find((region) =>
    texto.includes(region),
  );

  return regionEncontrada || null;
}

function extraerComuna(texto) {
  texto = texto.toLowerCase().replace(/\s+/g, " ");

  const comunasChile = [
    "cerrillos", "cerro navia", "conchalí", "el bosque", "estación central", "huechuraba", "independencia",
    "la cisterna", "la florida", "la granja", "la pintana", "la reina", "las condes", "lo prado", "macul", "maipú", "ñuñoa",
    "pedro aguirre cerda", "peñalolén", "providencia", "pudahuel", "quilicura", "quinta normal", "lo espejo", "recoleta", "renca",
    "san joaquín", "san miguel", "san ramón", "vitacura", "puente alto", "pirque", "san josé de maipo", "colina", "lampa", "tiltil",
    "san bernardo", "lo barnechea", "buin", "calera de tango", "paine", "maría pinto", "talagante", "el monte", "isla de maipo",
    "padre hurtado", "peñaflor",
  ];

  // Buscar primera coincidencia con la lista de comunas
  const comunaEncontrada = comunasChile.find((comuna) =>
    texto.includes(comuna),
  );

  return comunaEncontrada || null;
}

function extraerCiudad(texto) {
  texto = texto.toLowerCase().replace(/\s+/g, " ");

  const ciudadesChile = [
    "santiago", "valparaíso", "concepción", "la serena", "coquimbo",
    "antofagasta", "iquique", "arica", "puerto montt", "temuco",
    "valdivia", "osorno", "puerto varas", "punta arenas", "rancagua",
  ];

  // Buscar primera coincidencia con la lista de ciudades
  const ciudadEncontrada = ciudadesChile.find((ciudad) =>
    texto.includes(ciudad),
  );

  return ciudadEncontrada || null;
}

function extraerRenta(texto) {
  // Convertir a minúsculas y normalizar espacios
  texto = texto.toLowerCase().replace(/\s+/g, " ");

  console.log("Texto normalizado:", texto);

  // Patrones más específicos y flexibles
  const patronesRenta = [
    // Patrón 1: Expectativa de renta con signo de peso
    /expectativa\s*de\s*renta\s*\n?\s*(\$?\s*\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)\s*(?:pesos?\s*(?:bruto|l[ií]quido)\s*(?:mensual)?)?/,

    // Patrón 2: Pretensión de renta con dos puntos
    /pretensión\s*de\s*renta\s*[:]\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)\s*(?:clp)?/,

    // Patrón 3: Valor con moneda
    /(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)\s*(?:clp|pesos)/,
  ];

  for (const patron of patronesRenta) {
    const match = texto.match(patron);
    console.log("Patrón probado:", patron);
    console.log("Resultado del match:", match);

    if (match) {
      // Limpiar y formatear el valor
      let renta = match[1]
          .replace(/\s|[$]/g, "") // Quitar espacios y símbolo de peso
          .replace(/\./g, "") // Quitar puntos de miles
          .replace(",", "."); // Cambiar coma por punto decimal

      // Validar que sea un número
      if (!isNaN(parseFloat(renta))) {
        renta = parseFloat(renta).toFixed(0);
        console.log("Renta extraída:", renta);
        return renta;
      }
    }
  }

  return null;
}

function extraerDisponibilidad(texto) {
  // Normalizar el texto
  texto = texto.toLowerCase().replace(/\s+/g, " ");

  // Patrones para buscar disponibilidad
  const patrones = [
    // Patrón 1: Fecha específica
    /(?:disponibilidad|disponible)\s*[:]\s*(\d{1,2}\s*de\s*[a-zá-úñ]+\s*de\s*\d{4})/,

    // Patrón 2: Disponibilidad con etiquetas directas
    /(?:^\s*)?(inmediata|inicio\s*inmediato|incorporaci[oó]n\s*inmediata)(?=\s|$)/,

    // Patrón 3: Frases de disponibilidad sin contextos no deseados
    /(?:^|\s)(inmediata)(?=\s*$|\s*[^a-zá-úñ])/,
  ];

  // Probar cada patrón
  for (const patron of patrones) {
    const match = texto.match(patron);
    if (match) {
      // Limpiar y formatear la disponibilidad
      let disponibilidad = match[1].trim();

      // Capitalizar la primera letra
      disponibilidad = disponibilidad.charAt(0).toUpperCase() + disponibilidad.slice(1);

      return disponibilidad;
    }
  }

  // Si no se encuentra nada, devolver un valor por defecto
  return "Inmediata";
}

// extraer dato
function extraerDato(texto, regex) {
  const match = texto.match(regex);
  return match ? match[1]?.trim() || match[0]?.trim() : ""; // Asegura siempre devolver una cadena
}

// extraer telefono
function extraerTelefono(texto, regex) {
  const match = texto.match(regex);
  return match ? match[0].trim() : "No especificado";
}

// extraer descripcion
function extraerDescripcion(texto) {
  // Normalizar saltos de línea y espacios
  texto = texto.replace(/\r\n/g, "\n").trim();

  // Palabras clave que indican el fin de una sección
  const finSeccion = [
    "ANTECEDENTES PERSONALES",
    "DATOS PERSONALES",
    "FORMACIÓN ACADÉMICA",
    "FORMACION ACADEMICA",
    "INFORMACIÓN DE CONTACTO",
    "EDUCACIÓN",
    "EDUCACION",
    "RUT",
    "RUN",
    "DIRECCIÓN",
    "DIRECCION",
    "FECHA DE NACIMIENTO",
    "ESTADO CIVIL",
    "EXPERIENCIA LABORAL",
    "HABILIDADES",
    "SKILLS",
    "IDIOMAS",
    "REFERENCIAS",
    "General",
    "Chilena",
    "Formación",
    "[0-9]{1,2} años",
  ].join("|");

  // Patrones para diferentes formatos de sección de descripción
  const patrones = [
    // Patrón para secciones con encabezado explícito
    new RegExp(`(?:RESUMEN EJECUTIVO|Acerca de mi|RESUMEN PROFESIONAL|PERFIL PROFESIONAL|PERFIL|DESCRIPCIÓN PROFESIONAL)\\s*((?:(?!\\n\\s*(?:${finSeccion})).)*?)(?=\\n\\s*(?:${finSeccion})|$)`, "is"),

    // Patrón para secciones sin encabezado pero con contenido relevante
    new RegExp(`((?:(?:Estudiante|Egresado|Titulado|Ingeniero|Analista|Desarrollador|Profesional)(?:(?!\\n\\s*(?:${finSeccion})).)*?)(?=\\n\\s*(?:${finSeccion})|$))`, "i"),

    // Patrón para encontrar párrafos descriptivos
    new RegExp(`^\\s*((?:Titulad[oa]|Egresad[oa]|Ingenier[oa]|Analista|Desarrollador[a])[^\\n]*(?:\\s[^\\n]*(?!\\n\\s*(?:${finSeccion})))*)`, "i"),

  ];

  // Función auxiliar para limpiar y validar la descripción
  function limpiarTextoParaDB(texto) {
    if (!texto) return null;
    return texto
        .replace(/[•·]/g, "-") // Reemplazar bullets por guiones
        .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, "-") // Reemplazar más bullets
        .replace(/[^\x00-\x7F]/g, "") // Eliminar caracteres no ASCII
        .trim();
  }

  // Función para validar si una descripción es significativa
  function esDescripcionValida(texto) {
    if (!texto) return false;

    // Eliminar espacios y caracteres especiales para contar solo texto real
    const textoLimpio = texto.replace(/[\s\n\r\t.,;]/g, "");

    // La descripción debe tener al menos 50 caracteres de texto real
    if (textoLimpio.length < 50) return false;

    // Evitar textos que son solo listas de tecnologías o habilidades
    if (/^(?:\s*[-•]\s*[\w\s,]+\s*)+$/m.test(texto)) return false;

    // Evitar textos que son mayormente fechas o números
    const proporcionNumeros = (texto.match(/\d/g) || []).length / texto.length;
    if (proporcionNumeros > 0.3) return false;

    return true;
  }

  // Almacenar todas las descripciones válidas encontradas
  const descripciones = [];

  // Buscar con cada patrón
  for (const patron of patrones) {
    const match = texto.match(patron);
    if (match && match[1]) {
      const descripcion = limpiarTextoParaDB(match[1]);
      if (esDescripcionValida(descripcion)) {
        descripciones.push(descripcion);
      }
    }
  }

  // Si encontramos múltiples descripciones válidas, combinarlas
  if (descripciones.length > 0) {
    // Tomar la descripción más larga o combinar si son complementarias
    let descripcionFinal = descripciones.reduce((a, b) =>
            a.length > b.length ? a : b,
    );

    // Si es muy corta, intentar combinar con otra complementaria
    if (descripcionFinal.length < 200 && descripciones.length > 1) {
      descripcionFinal = descripciones.join(" ").slice(0, 500); // Limitar a 500 caracteres
    }

    return descripcionFinal;
  }

  return null;
}

// Función para extraer idiomas y niveles
function extraerIdiomas(texto) {
  // Capturar solo la sección de idiomas y detener antes del siguiente encabezado o un doble salto de línea
  const idiomasMatch = texto.match(/IDIOMAS:\s+([\s\S]*?)(?:\n(?:[A-ZÁÉÍÓÚÑ]+|$)|\n\n)/i);
  if (!idiomasMatch) return [];

  const idiomasTexto = idiomasMatch[1]
      .split("\n") // Dividir por líneas
      .map((line) => line.replace(/•\s*/, "").trim()) // Eliminar "•" y espacios innecesarios
      .filter((line) => line.length > 0); // Filtrar líneas vacías

  // Procesar cada línea para extraer idioma y nivel
  return idiomasTexto.map((line) => {
    const idiomaYNivel = line.match(/^([A-Za-zÁÉÍÓÚÑáéíóúñ]+)\s+(.*)$/);
    if (!idiomaYNivel) return {idioma: line.trim(), nivel: "No especificado"};

    const idioma = idiomaYNivel[1].trim();
    const nivel = idiomaYNivel[2].replace(/[^\w\s]/g, "").trim() || "No especificado";
    return {idioma, nivel};
  });
}

// Función para extraer habilidades
function extraerHabilidadesYConocimientos(texto) {
  const habilidadesSection = texto.match(/CONOCIMIENTOS TÉCNICOS:\s*([\s\S]*?)(?:\n\n|PRETENSIONES|$)/i);
  if (!habilidadesSection) return {};

  const lines = habilidadesSection[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line); // Filtrar líneas vacías

  const habilidades = {};
  let currentCategory = null;

  for (const line of lines) {
    if (/^•\s*[A-Za-zÁÉÍÓÚÑáéíóúñ\s/]+:$/.test(line)) {
      // Detecta una nueva categoría
      currentCategory = line.replace(/^•\s*/, "").replace(/:$/, "").trim();
      habilidades[currentCategory] = [];
    } else if (/^o\s/.test(line)) {
      // Detecta un ítem dentro de la categoría actual
      const habilidad = line.replace(/^o\s/, "").trim();
      if (currentCategory) {
        habilidades[currentCategory].push(habilidad);
      }
    }
  }

  return habilidades;
}

function extraerFormacionAcademica(texto) {
  if (!texto || texto.trim() === "") return [];
  const formacion = [];

  // Patrones para identificar la sección de educación con diferentes nombres
  const seccionEducacionRegex = /(?:EDUCACIÓN|Educación|FORMACIÓN|Formación|Formación Académica|FORMACIÓN ACADÉMICA|ANTECEDENTES ACADÉMICOS)\s+(.*?)(?=\s*(?:CURSOS|EXPERIENCIA|HABILIDADES|$))/si;
  const seccionEducacion = texto.match(seccionEducacionRegex);

  if (!seccionEducacion) return [];
  const contenidoEducacion = seccionEducacion[1];

  // Dividir el contenido en líneas
  const lineas = contenidoEducacion.split("\n")
      .map((l) => l.trim())
      .filter((l) => l);

  // Patrones para fechas
  const patronesFecha = [
    /^(\w{3})\. (\d{4}) - (\w{3})\. (\d{4})$/, // mar. 2019 - jul. 2023
    /^(\d{4}) - (\d{4})$/, // 2019 - 2023
    /^(\d{2})\/(\d{4}) - (\d{2})\/(\d{4})$/, // 03/2019 - 07/2023
    /^(\d{4}) - (?:Actual|Presente|Present)$/, // 2019 - Actual
    /^(\w{3})\. (\d{4}) - (?:Actual|Presente|Present)$/, // mar. 2019 - Actual
  ];

  let fechaActual = null;
  let tituloActual = null;
  let institucionActual = null;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];

    // Verificar si es una línea de fecha
    let esFecha = false;
    for (const patron of patronesFecha) {
      const matchFecha = linea.match(patron);
      if (matchFecha) {
        esFecha = true;
        // Normalizar el formato de fecha según el patrón encontrado
        if (patron.source.includes("Actual|Presente|Present")) {
          fechaActual = {
            mes_inicio: matchFecha[1].length === 3 ? matchFecha[1] : null,
            ano_inicio: matchFecha[1].length === 3 ? matchFecha[2] : matchFecha[1],
            mes_termino: null,
            ano_termino: "Actual",
          };
        } else if (matchFecha.length === 5) { // Formato completo con meses
          fechaActual = {
            mes_inicio: matchFecha[1],
            ano_inicio: matchFecha[2],
            mes_termino: matchFecha[3],
            ano_termino: matchFecha[4],
          };
        } else if (matchFecha.length === 3) { // Solo años
          fechaActual = {
            mes_inicio: null,
            ano_inicio: matchFecha[1],
            mes_termino: null,
            ano_termino: matchFecha[2],
          };
        }
        break;
      }
    }

    if (esFecha) {
      // Si encontramos una nueva fecha y tenemos información anterior, guardamos el registro
      if (tituloActual && institucionActual) {
        formacion.push({
          titulo: tituloActual,
          institucion: institucionActual,
          mes_inicio: fechaActual.mes_inicio,
          ano_inicio: fechaActual.ano_inicio,
          mes_termino: fechaActual.mes_termino,
          ano_termino: fechaActual.ano_termino,
        });
        tituloActual = null;
        institucionActual = null;
      }
      continue;
    }

    // Si no es fecha, alternamos entre título e institución
    if (!tituloActual) {
      tituloActual = linea;
    } else if (!institucionActual) {
      institucionActual = linea;

      // Si tenemos toda la información, guardamos el registro
      if (fechaActual) {
        formacion.push({
          titulo: tituloActual,
          institucion: institucionActual,
          mes_inicio: fechaActual.mes_inicio,
          ano_inicio: fechaActual.ano_inicio,
          mes_termino: fechaActual.mes_termino,
          ano_termino: fechaActual.ano_termino,
        });
        tituloActual = null;
        institucionActual = null;
      }
    }
  }

  // Guardar el último registro si quedó pendiente
  if (tituloActual && institucionActual && fechaActual) {
    formacion.push({
      titulo: tituloActual,
      institucion: institucionActual,
      mes_inicio: fechaActual.mes_inicio,
      ano_inicio: fechaActual.ano_inicio,
      mes_termino: fechaActual.mes_termino,
      ano_termino: fechaActual.ano_termino,
    });
  }

  return formacion;
}

// extraerExperiencia
function extraerExperienciaLaboral(texto) {
  if (!texto || texto.trim() === "") return [];
  const experiencias = [];

  // Encontrar la sección de experiencia laboral
  const seccionExperienciaRegex = /(?:EXPERIENCIA LABORAL|Experiencia Laboral|Experiencia laboral)\s+(.*?)(?=\s*(?:EDUCACIÓN|FORMACIÓN|CURSOS|HABILIDADES|$))/si;
  const seccionExperiencia = texto.match(seccionExperienciaRegex);

  if (!seccionExperiencia) return [];
  const contenidoExperiencia = seccionExperiencia[1];

  // Dividir el contenido en líneas
  const lineas = contenidoExperiencia.split("\n")
      .map((l) => l.trim())
      .filter((l) => l);

  // Patrones para fechas
  const patronesFecha = [
    /^(\w{3})\. (\d{4}) - (\w{3})\. (\d{4})$/, // ago. 2023 - ene. 2024
    /^(\d{4}) - (\d{4})$/, // 2023 - 2024
    /^(\d{2})\/(\d{4}) - (\d{2})\/(\d{4})$/, // 08/2023 - 01/2024
    /^(\w{3})\. (\d{4}) - (?:Actual|Presente|Present)$/, // ago. 2023 - Actual
    /^(\d{4}) - (?:Actual|Presente|Present)$/, // 2023 - Actual
  ];

  let experienciaActual = null;
  let descripcionActual = [];

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];

    // Verificar si es una línea de fecha
    let esFecha = false;
    for (const patron of patronesFecha) {
      const matchFecha = linea.match(patron);
      if (matchFecha) {
        esFecha = true;

        // Si ya tenemos una experiencia en proceso, la guardamos
        if (experienciaActual) {
          experienciaActual.descripcion = descripcionActual.join("\n");
          experiencias.push(experienciaActual);
          descripcionActual = [];
        }

        // Iniciar nueva experiencia
        experienciaActual = {
          cargo: "",
          empresa: "",
          descripcion: "",
          mes_inicio: matchFecha[1].length === 3 ? matchFecha[1] : null,
          ano_inicio: matchFecha[1].length === 3 ? matchFecha[2] : matchFecha[1],
          mes_termino: matchFecha.length > 3 ? matchFecha[3] : null,
          ano_termino: matchFecha.length > 3 ? matchFecha[4] : "Actual",
        };
        break;
      }
    }

    if (esFecha) {
      continue;
    }

    // Si tenemos una experiencia en proceso
    if (experienciaActual) {
      // Si el cargo está vacío, esta línea es el cargo
      if (!experienciaActual.cargo) {
        experienciaActual.cargo = linea;
        continue;
      }

      // Si la empresa está vacía, esta línea es la empresa
      if (!experienciaActual.empresa) {
        experienciaActual.empresa = linea;
        continue;
      }

      // Las demás líneas son parte de la descripción
      if (linea.startsWith("-")) {
        descripcionActual.push(linea);
      } else if (linea.toLowerCase().includes("lenguaje") ||
                      linea.toLowerCase().includes("funciones") ||
                      linea.toLowerCase().includes("aws") ||
                      linea.toLowerCase().includes("base de datos")) {
        descripcionActual.push(linea);
      }
    }
  }

  // Guardar la última experiencia si quedó pendiente
  if (experienciaActual) {
    experienciaActual.descripcion = descripcionActual.join("\n");
    experiencias.push(experienciaActual);
  }

  return experiencias;
}


module.exports = {procesarArchivoCV, procesarCV};
