import React, { useState, useEffect } from "react";
import Select from "react-select";
import './ModalCreatePerfilFreelancer.css';

function ModalCreatePerfilFreelancer({ closeModal, id_usuario }) {
  const [freelancerData, setFreelancerData] = useState({
    freelancer: {
      correo_contacto: "",
      telefono_contacto: "",
      linkedin_link: "",
      descripcion_freelancer: ""
    },
    antecedentes_personales: {
      nombres: "",
      apellidos: "",
      fecha_nacimiento: "",
      identificacion: "",
      nacionalidad: "",
      direccion: "",
      region: "",
      ciudad_freelancer: "",
      comuna: "",
      estado_civil: ""
    },
    inclusion_laboral: {
      discapacidad: "",
      registro_nacional: null,
      pension_invalidez: null,
      ajuste_entrevista: null,
      tipo_discapacidad: null
    },
    emprendimiento: {
      emprendedor: "",
      interesado: null,
      ano_inicio_emprendimiento: null,
      mes_inicio_emprendimiento: null,
      sector_emprendimiento: null
    },
    trabajo_practica: {
      experiencia_laboral: "",
      experiencia: null,
      empresa: null,
      cargo: null,
      area_trabajo: null,
      tipo_cargo: null,
      ano_inicio_trabajo: null,
      mes_inicio_trabajo: null,
      descripcion_trabajo: null
    },
    nivel_educacional: {
      nivel_academico: "",
      estado_educacional: ""
    },
    educacion_superior: {
      institucion_superior: "",
      carrera: "",
      carrera_afin: "",
      estado_superior: "",
      ano_inicio_superior: "",
      ano_termino_superior: ""
    },
    educacion_basica_media: {
      institucion_basica_media: "",
      tipo: "",
      pais: "",
      ciudad_basica_media: "",
      ano_inicio_basica_media: "",
      ano_termino_basica_media: ""
    },
    idiomas: [],
    habilidades: [],
    curso: {
      nombre_curso: "",
      institucion_curso: "",
      ano_inicio_curso: "",
      mes_inicio_curso: ""
    },
    pretensiones: {
      disponibilidad: "",
      renta_esperada: ""
    },
  });

  const optionsCategorySkills = [
    { value: "Lenguajes de Programación", label: "Lenguajes de Programación" },
    { value: "Bases de Datos", label: "Bases de Datos" },
    { value: "Desarrollo Web", label: "Desarrollo Web" },
    { value: "Desarrollo de Software", label: "Desarrollo de Software" },
    { value: "Análisis de Datos", label: "Análisis de Datos" },
    { value: "Redacción y Comunicación", label: "Redacción y Comunicación" },
    { value: "Idiomas", label: "Idiomas" },
    { value: "Herramientas de Oficina y Productividad", label: "Herramientas de Oficina y Productividad" },
    { value: "Marketing y Publicidad", label: "Marketing y Publicidad" },
    { value: "Ventas y Negociación", label: "Ventas y Negociación" },
    { value: "Gestión de Proyectos", label: "Gestión de Proyectos" },
    { value: "Diseño Gráfico", label: "Diseño Gráfico" },
    { value: "Edición de Video y Fotografía", label: "Edición de Video y Fotografía" },
    { value: "Investigación Académica", label: "Investigación Académica" },
    { value: "Habilidades de Presentación", label: "Habilidades de Presentación" },
    { value: "Resolución de Problemas", label: "Resolución de Problemas" },
    { value: "Trabajo en Equipo", label: "Trabajo en Equipo" },
    { value: "Liderazgo", label: "Liderazgo" },
    { value: "Innovación y Creatividad", label: "Innovación y Creatividad" },
    { value: "Atención al Cliente", label: "Atención al Cliente" },
    { value: "Finanzas y Contabilidad", label: "Finanzas y Contabilidad" },
    { value: "Planificación y Organización", label: "Planificación y Organización" },
    { value: "Pensamiento Crítico", label: "Pensamiento Crítico" },
    { value: "Ciencias e Ingeniería", label: "Ciencias e Ingeniería" },
    { value: "Salud y Bienestar", label: "Salud y Bienestar" },
    { value: "Educación y Enseñanza", label: "Educación y Enseñanza" },
    { value: "Derecho y Normativas", label: "Derecho y Normativas" },
    { value: "Competencias Digitales Básicas", label: "Competencias Digitales Básicas" },
  ]

  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [nuevoIdioma, setNuevoIdioma] = useState({ idioma: "", nivel_idioma: "" });
  const [nuevaHabilidad, setNuevaHabilidad] = useState({ categoria: "", habilidad: "", nivel_habilidad: "" });

  const handleNuevoIdiomaChange = (e, field) => {
    const { value } = e.target;
    setNuevoIdioma((prev) => ({ ...prev, [field]: value }));
  };  

  const handleSelectChangeIdioma = (option) => {
    setNuevoIdioma((prev) => ({ ...prev, nivel_idioma: option.value }));
  };  

  const addIdioma = () => {
    if (nuevoIdioma.idioma && nuevoIdioma.nivel_idioma) {
      setFreelancerData((prevData) => ({
        ...prevData,
        idiomas: [...prevData.idiomas, nuevoIdioma],
      }));
      setNuevoIdioma({ idioma: "", nivel_idioma: "" }); // Limpia los campos después de agregar
    } else {
      alert("Por favor, complete ambos campos para agregar el idioma.");
    }
  };

  const handleNuevaHabilidadChange = (e, field) => {
    const { value } = e.target;
    setNuevaHabilidad((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSelectChangeHabilidad = (option, field) => {
    setNuevaHabilidad((prev) => ({ ...prev, [field]: option.value }));
  };
  
  const addHabilidad = () => {
    if (nuevaHabilidad.categoria && nuevaHabilidad.habilidad && nuevaHabilidad.nivel_habilidad) {
      setFreelancerData((prevData) => ({
        ...prevData,
        habilidades: [...prevData.habilidades, nuevaHabilidad],
      }));
      setNuevaHabilidad({ categoria: "", habilidad: "", nivel_habilidad: "" }); // Limpia los campos después de agregar
    } else {
      alert("Por favor, completa todos los campos para agregar la habilidad.");
    }
  };
  
  
  const handleChange = (e, section, index) => {
    const { name, value } = e.target;
    setFreelancerData((prevData) => {
      // Si la sección es un array (idiomas o habilidades), usa el índice para actualizar el valor.
      if (Array.isArray(prevData[section])) {
        const newSection = [...prevData[section]]; // Copia el array actual
        newSection[index][name] = value; // Actualiza el valor en el índice específico
        return {
          ...prevData,
          [section]: newSection,
        };
      } else {
        // Si la sección es un objeto, actualiza directamente el campo dentro del objeto.
        return {
          ...prevData,
          [section]: {
            ...prevData[section],
            [name]: value, // Actualiza el campo específico
          },
        };
      }
    });
  };  
  
  const handleSelectChange = (option, section, field, index = null) => {
    setFreelancerData((prevData) => {
      if (Array.isArray(prevData[section])) {
        // Si `section` es un array (como `idiomas` o `habilidades`), utiliza el índice para actualizar.
        const newSection = [...prevData[section]];
        newSection[index][field] = option.value;
        return { ...prevData, [section]: newSection };
      } else {
        // Si `section` es un objeto (como `inclusion_laboral`), actualiza directamente el campo.
        return {
          ...prevData,
          [section]: {
            ...prevData[section],
            [field]: option.value,
          },
        };
      }
    });
  };  

  const validateStep = () => {
    let isValid = true;
    let error = "";
  
    if (currentStep === 1) {
      if (!freelancerData.freelancer.descripcion_freelancer) {
        error = "Por favor completa tu descripción.";
        isValid = false;
      } else if (!freelancerData.freelancer.correo_contacto) {
        error = "Por favor ingresa tu correo de contacto.";
        isValid = false;
      } else if (!freelancerData.freelancer.telefono_contacto) {
        error = "Por favor ingresa tu telefono de contacto.";
        isValid = false;
      }
    }
    if (currentStep === 2) {
      if (!freelancerData.antecedentes_personales.nombres || !freelancerData.antecedentes_personales.apellidos || !freelancerData.antecedentes_personales.fecha_nacimiento
        || !freelancerData.antecedentes_personales.identificacion || !freelancerData.antecedentes_personales.nacionalidad || !freelancerData.antecedentes_personales.ciudad_freelancer
        || !freelancerData.antecedentes_personales.comuna || !freelancerData.antecedentes_personales.estado_civil ) {
        error = "Por favor completa todos los campos.";
        isValid = false;
      }
    }
    if (currentStep === 3) {
      if (!freelancerData.inclusion_laboral.discapacidad) {
        error = "Por favor indica si tienes discapacidad o no.";
        isValid = false;
      }
    }
    if (currentStep === 4) {
      if (!freelancerData.emprendimiento.emprendedor) {
        error = "Por favor indica si eres emprendedor o no.";
        isValid = false;
      }
    }
    if (currentStep === 5) {
      if (!freelancerData.trabajo_practica.experiencia_laboral) {
        error = "Por favor indica si tienes experiencia laboral o no.";
        isValid = false;
      }
    }
    if (currentStep === 6) {
      if (!freelancerData.nivel_educacional.nivel_academico || !freelancerData.nivel_educacional.estado_educacional) {
        error = "Por favor completa todos los campos.";
        isValid = false;
      }
    }
    if (currentStep === 7) {
      if (!freelancerData.educacion_superior.institucion_superior || !freelancerData.educacion_superior.carrera || !freelancerData.educacion_superior.carrera_afin
        || !freelancerData.educacion_superior.estado_superior || !freelancerData.educacion_superior.ano_inicio_superior || !freelancerData.educacion_superior.ano_termino_superior ) {
        error = "Por favor completa todos los campos.";
        isValid = false;
      }
    }
    if (currentStep === 8) {
      if (!freelancerData.educacion_basica_media.institucion_basica_media || !freelancerData.educacion_basica_media.tipo || !freelancerData.educacion_basica_media.pais
        || !freelancerData.educacion_basica_media.ciudad_basica_media || !freelancerData.educacion_basica_media.ano_inicio_basica_media || !freelancerData.educacion_basica_media.ano_termino_basica_media ) {
        error = "Por favor completa todos los campos.";
        isValid = false;
      }
    }
    if (currentStep === 12) {
      if (!freelancerData.pretensiones.disponibilidad || !freelancerData.pretensiones.renta_esperada) {
        error = "Por favor completa todos los campos.";
        isValid = false;
      }
    }
  
    setErrorMessage(error);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  useEffect(() => {
    console.log('id_usuario en ModalCreatePerfilFreelancer:', id_usuario);
  }, [id_usuario]);

  const envioDatosPerfilFreelancer = async (e) => {
    e.preventDefault();

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/create-perfil-freelancer', {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...freelancerData, id_usuario })
        });

        if (!response.ok) {
            const errorData = await response.json();
            setErrorMessage(errorData.error || "Error al crear el perfil: " + (errorData.details || ""));
            console.log(errorData.error || "Error al crear el perfil: " + (errorData.details || ""));
            return;
        }

        const data = await response.json();
        console.log("Perfil creado exitosamente", data);
        closeModal();
        resetFreelancerData();
        window.location.reload();
    } catch (error) {
        console.error("Error al crear el perfil:", error);
        setErrorMessage("Error de conexión o error inesperado en la creación del perfil.");
    }

    console.log("Datos del freelancer que se envían:", freelancerData);
  };

const resetFreelancerData = () => {
    setFreelancerData({
        freelancer: {
          correo_contacto: "",
          telefono_contacto: "",
          linkedin_link: "", 
          descripcion_freelancer: "" 
        },
        antecedentes_personales: {
          nombres: "",
          apellidos: "",
          fecha_nacimiento: "",
          identificacion: "",
          nacionalidad: "",
          direccion: "",
          region: "",
          ciudad_freelancer: "",
          comuna: "",
          estado_civil: ""
        },
        inclusion_laboral: {
          discapacidad: "No",
          registro_nacional: null,
          pension_invalidez: null,
          ajuste_entrevista: null,
          tipo_discapacidad: null
        },
        emprendimiento: {
          emprendedor: "No",
          interesado: null,
          ano_inicio_emprendimiento: null,
          mes_inicio_emprendimiento: null,
          sector_emprendimiento: null
        },
        trabajo_practica: {
          experiencia_laboral: "No",
          experiencia: null,
          empresa: null,
          cargo: null,
          area_trabajo: null,
          tipo_cargo: null,
          ano_inicio_trabajo: null,
          mes_inicio_trabajo: null,
          descripcion_trabajo: null
        },
        nivel_educacional: {
            nivel_academico: "",
            estado_educacional: ""
        },
        educacion_superior: {
            institucion_superior: "",
            carrera: "",
            carrera_afin: "",
            estado_superior: "",
            ano_inicio_superior: "",
            ano_termino_superior: ""
        },
        educacion_basica_media: {
            institucion_basica_media: "",
            tipo: "",
            pais: "",
            ciudad_basica_media: "",
            ano_inicio_basica_media: "",
            ano_termino_basica_media: ""
        },
        idiomas: [],
        habilidades: [],
        curso: {
            nombre_curso: "",
            institucion_curso: "",
            ano_inicio_curso: "",
            mes_inicio_curso: ""
        },
        pretensiones: {
            disponibilidad: "",
            renta_esperada: ""
        },
    });
    setErrorMessage("");
  };

  return (
    <div className="perfil-freelancer-overlay">
      <div className="perfil-freelancer-content">
        <h2>Crear Perfil</h2>
        
        <form onSubmit={envioDatosPerfilFreelancer}>
          {currentStep === 1 && (
            <div className="perfil-freelancer-form-step">
              <div className="grupos-container-first">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="descripcion_freelancer">Descripción</label>
                  <textarea
                    id="descripcion_freelancer"
                    name="descripcion_freelancer"
                    placeholder="Escribe una breve descripción de ti la cual será para presentarte "
                    value={freelancerData.freelancer.descripcion_freelancer}
                    onChange={(e) => handleChange(e, "freelancer")}
                    required
                  />
                </div>
              </div>
              <div style={{width:"1000px"}}>
                <div className="grupos-container-first">
                  <div className="perfil-freelancer-form-group">
                    <label htmlFor="correo_contacto">Correo Contacto</label>
                    <input
                      type="text"
                      id="correo_contacto"
                      name="correo_contacto"
                      value={freelancerData.freelancer.correo_contacto}
                      onChange={(e) => handleChange(e, "freelancer")}
                      required
                    />
                  </div>
                </div>
                <div className="grupos-container-first">
                  <div className="perfil-freelancer-form-group">
                    <label htmlFor="telefono_contacto">Telefono Contacto</label>
                    <input
                      type="text"
                      id="telefono_contacto"
                      name="telefono_contacto"
                      value={freelancerData.freelancer.telefono_contacto}
                      onChange={(e) => handleChange(e, "freelancer")}
                      required
                    />
                  </div>
                </div>
                <div className="grupos-container-first">
                  <div className="perfil-freelancer-form-group">
                    <label htmlFor="linkedin_link">Linkedin (Opcional)</label>
                    <input
                      type="text"
                      id="linkedin_link"
                      name="linkedin_link"
                      value={freelancerData.freelancer.linkedin_link}
                      onChange={(e) => handleChange(e, "freelancer")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="perfil-freelancer-form-step">
              <h3>Datos Personales</h3>
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="nombres">Nombres</label>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    value={freelancerData.antecedentes_personales.nombres}
                    onChange={(e) => handleChange(e, "antecedentes_personales")}
                    required
                  />
                </div>

                <div className="perfil-freelancer-form-group">
                  <label htmlFor="apellidos">Apellidos</label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    value={freelancerData.antecedentes_personales.apellidos}
                    onChange={(e) => handleChange(e, "antecedentes_personales")}
                    required
                  />
                </div>
              </div>

              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="identificacion">Identificación</label>
                  <input
                    type="text"
                    id="identificacion"
                    name="identificacion"
                    placeholder="RUT, DNI, etc."
                    value={freelancerData.antecedentes_personales.identificacion}
                    onChange={(e) => handleChange(e, "antecedentes_personales")}
                    required
                  />
                </div>

                <div className="perfil-freelancer-form-group">
                  <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    value={freelancerData.antecedentes_personales.fecha_nacimiento}
                    onChange={(e) => handleChange(e, "antecedentes_personales")}
                    required
                  />
                </div>
              </div>

              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    placeholder="Av Dep Calle 2323..."
                    value={freelancerData.antecedentes_personales.direccion}
                    onChange={(e) => handleChange(e, "antecedentes_personales")}
                    required
                  />
                </div>

                <div className="perfil-freelancer-form-group">
                  <label htmlFor="region">Región</label>
                  <div style={{ width: "320px", marginLeft: "32px" }}>
                    <Select
                      placeholder="Selecciona una opción"
                      options={[
                        { value: "Region Metropolitana", label: "Región Metropolitana" },
                        { value: "V Region", label: "V Región" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "antecedentes_personales", "region")}
                    />
                  </div>
                </div>
              </div>

              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="ciudad_freelancer">Ciudad</label>
                  <input
                    type="text"
                    id="ciudad_freelancer"
                    name="ciudad_freelancer"
                    placeholder="Santiago, etc."
                    value={freelancerData.antecedentes_personales.ciudad_freelancer}
                    onChange={(e) => handleChange(e, "antecedentes_personales")}
                    required
                  />
                </div>

                <div className="perfil-freelancer-form-group">
                  <label htmlFor="comuna">Comuna</label>
                  <input
                    type="text"
                    id="comuna"
                    name="comuna"
                    placeholder="Lo prado, etc."
                    value={freelancerData.antecedentes_personales.comuna}
                    onChange={(e) => handleChange(e, "antecedentes_personales")}
                    required
                  />
                </div>
              </div>
              
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="nacionalidad">Nacionalidad</label>
                  <input
                    type="text"
                    id="nacionalidad"
                    name="nacionalidad"
                    placeholder="Chileno, Argentino, etc."
                    value={freelancerData.antecedentes_personales.nacionalidad}
                    onChange={(e) => handleChange(e, "antecedentes_personales")}
                    required
                  />
                </div>

                <div className="perfil-freelancer-form-group">
                  <label htmlFor="estado_civil">Estado civil</label>
                  <input
                    type="text"
                    id="estado_civil"
                    name="estado_civil"
                    placeholder="Soltero, Casado, etc."
                    value={freelancerData.antecedentes_personales.estado_civil}
                    onChange={(e) => handleChange(e, "antecedentes_personales")}
                    required
                  />
                </div>
              </div>
              
            </div>
          )}

          {currentStep === 3 && (
            <div className="perfil-freelancer-form-step">
              <h3>Inclusión Laboral</h3>
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="discapacidad">¿Posee alguna discapacidad?</label>
                  <div style={{ width: "700px", marginLeft: "32px" }}>
                    <Select
                      options={[
                        { value: "Si", label: "Sí" },
                        { value: "No", label: "No" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "inclusion_laboral", "discapacidad")}
                    />
                  </div>
                </div>
              </div>
              {freelancerData.inclusion_laboral.discapacidad === "Si" && (
                <>
                  <div className="grupos-container">
                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="tipo_discapacidad">Tipo de Discapacidad</label>
                      <input
                        type="text"
                        id="tipo_discapacidad"
                        name="tipo_discapacidad"
                        value={freelancerData.inclusion_laboral.tipo_discapacidad}
                        onChange={(e) => handleChange(e, "inclusion_laboral")}
                        required
                      />
                    </div>
                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="registro_nacional">¿Está registrado en el Registro Nacional?</label>
                      <div style={{ width: "350px", marginRight: "32px" }}>
                        <Select
                          options={[
                            { value: "Si", label: "Sí" },
                            { value: "No", label: "No" },
                            { value: "En trámite", label: "En trámite" },
                          ]}
                          className="select"
                          onChange={(option) => handleSelectChange(option, "inclusion_laboral", "registro_nacional")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grupos-container">
                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="pension_invalidez">¿Recibe pensión de invalidez?</label>
                      <div style={{ width: "700px", marginLeft: "32px" }}>
                        <Select
                          options={[
                            { value: "Si", label: "Sí" },
                            { value: "No", label: "No" },
                            { value: "En trámite", label: "En trámite" },
                          ]}
                          className="select"
                          onChange={(option) => handleSelectChange(option, "inclusion_laboral", "pension_invalidez")}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grupos-container">
                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="ajuste_entrevista">¿Requiere algún ajuste para la entrevista?</label>
                      <textarea
                        id="ajuste_entrevista"
                        name="ajuste_entrevista"
                        value={freelancerData.inclusion_laboral.ajuste_entrevista}
                        onChange={(e) => handleChange(e, "inclusion_laboral")}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="perfil-freelancer-form-step">
              <h3>Emprendimiento</h3>
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="emprendedor">¿Es emprendedor?</label>
                  <div style={{ width: "700px", marginLeft: "32px" }}>
                    <Select
                      options={[
                        { value: "Si", label: "Sí" },
                        { value: "No", label: "No" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "emprendimiento", "emprendedor")}
                    />
                  </div>
                </div>
              </div>
              {freelancerData.emprendimiento.emprendedor === "No" && (
                <>
                  <div className="grupos-container">
                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="interesado">¿Te interesa emprender?</label>
                      <div style={{ width: "700px", marginLeft: "32px" }}>
                        <Select
                          options={[
                            { value: "Si", label: "Sí" },
                            { value: "No", label: "No" },
                          ]}
                          className="select"
                          onChange={(option) => handleSelectChange(option, "emprendimiento", "interesado")}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {freelancerData.emprendimiento.emprendedor === "Si" && (
                <>
                  <div className="grupos-container">
                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="ano_inicio_emprendimiento">Año de Inicio</label>
                      <input
                        type="text"
                        id="ano_inicio_emprendimiento"
                        name="ano_inicio_emprendimiento"
                        value={freelancerData.emprendimiento.ano_inicio_emprendimiento}
                        onChange={(e) => handleChange(e, "emprendimiento")}
                        required
                      />
                    </div>
                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="mes_inicio_emprendimiento">Mes de Inicio</label>
                      <input
                        type="text"
                        id="mes_inicio_emprendimiento"
                        name="mes_inicio_emprendimiento"
                        value={freelancerData.emprendimiento.mes_inicio_emprendimiento}
                        onChange={(e) => handleChange(e, "emprendimiento")}
                      />
                    </div>
                  </div>
                  <div className="grupos-container">
                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="sector_emprendimiento">Sector del Emprendimiento</label>
                      <div style={{ width: "700px", marginLeft: "32px" }}>
                        <Select
                            options={[
                              { value: "Si", label: "Sí" },
                              { value: "No", label: "No" },
                            ]}
                            className="select"
                            onChange={(option) => handleSelectChange(option, "emprendimiento", "interesado")}
                          />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="perfil-freelancer-form-step">
              <h3>Trabajo y Práctica</h3>
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="experiencia_laboral">¿Tiene experiencia laboral?</label>
                  <div style={{ width: "700px", marginLeft: "32px" }}>
                    <Select
                      options={[
                        { value: "Si", label: "Sí" },
                        { value: "No", label: "No" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "trabajo_practica", "experiencia_laboral")}
                    />
                  </div>
                </div>
              </div>
              {freelancerData.trabajo_practica.experiencia_laboral === "Si" && (
                <>
                  <div className="grupos-container">
                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="empresa">Empresa</label>
                      <input
                        type="text"
                        id="empresa"
                        name="empresa"
                        value={freelancerData.trabajo_practica.empresa || ""}
                        onChange={(e) => handleChange(e, "trabajo_practica")}
                        required
                      />
                    </div>

                    <div className="perfil-freelancer-form-group">
                      <label htmlFor="cargo">Cargo</label>
                      <input
                        type="text"
                        id="cargo"
                        name="cargo"
                        value={freelancerData.trabajo_practica.cargo || ""}
                        onChange={(e) => handleChange(e, "trabajo_practica")}
                      />
                    </div>
                  </div>

                  <div className="grupos-container">
                      <div className="perfil-freelancer-form-group">
                        <label htmlFor="area_trabajo">Área de Trabajo</label>
                        <input
                          type="text"
                          id="area_trabajo"
                          name="area_trabajo"
                          value={freelancerData.trabajo_practica.area_trabajo || ""}
                          onChange={(e) => handleChange(e, "trabajo_practica")}
                        />
                      </div>

                      <div className="perfil-freelancer-form-group">
                        <label htmlFor="tipo_cargo">Tipo de Cargo</label>
                        <input
                          type="text"
                          id="tipo_cargo"
                          name="tipo_cargo"
                          value={freelancerData.trabajo_practica.tipo_cargo || ""}
                          onChange={(e) => handleChange(e, "trabajo_practica")}
                        />
                      </div>
                  </div>
                    
                  <div className="grupos-container">
                      <div className="perfil-freelancer-form-group">
                        <label htmlFor="ano_inicio_trabajo">Año de Inicio</label>
                        <input
                          type="text"
                          id="ano_inicio_trabajo"
                          name="ano_inicio_trabajo"
                          value={freelancerData.trabajo_practica.ano_inicio_trabajo || ""}
                          onChange={(e) => handleChange(e, "trabajo_practica")}
                        />
                      </div>

                      <div className="perfil-freelancer-form-group">
                        <label htmlFor="mes_inicio_trabajo">Mes de Inicio</label>
                        <input
                          type="text"
                          id="mes_inicio_trabajo"
                          name="mes_inicio_trabajo"
                          value={freelancerData.trabajo_practica.mes_inicio_trabajo || ""}
                          onChange={(e) => handleChange(e, "trabajo_practica")}
                        />
                      </div>
                  </div>
                  <div className="grupos-container">
                    <div className="perfil-freelancer-form-group">
                        <label className="textArea" htmlFor="descripcion">Descripción</label>
                        <textarea
                          id="descripcion"
                          name="descripcion"
                          value={freelancerData.trabajo_practica.descripcion || ""}
                          onChange={(e) => handleChange(e, "trabajo_practica")}
                        />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="perfil-freelancer-form-step">
              <h3>Nivel Educacional</h3>
              <div className="perfil-freelancer-form-group" style={{ width: "705px", marginLeft: "32px" }}>
                <label htmlFor="nivel_academico">Nivel academico</label>
                <Select
                  options={[
                    { value: "Basica", label: "Básica" },
                    { value: "Media", label: "Media" },
                    { value: "Universidad", label: "Universidad" },
                    { value: "Postgrado", label: "Postgrado" },
                    { value: "Doctorado", label: "Doctorado" },
                  ]}
                  className="select"
                  onChange={(option) => handleSelectChange(option, "nivel_educacional", "nivel_academico")}
                  menuPortalTarget={document.body} // Muestra el menú fuera del contenedor
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Asegura que esté por encima del modal
                />
              </div>
              <div className="perfil-freelancer-form-group" style={{ width: "705px", marginLeft: "32px" }}>
                <label htmlFor="estado_educacional">Estado</label>
                <Select
                  options={[
                    { value: "Completa", label: "Completa" },
                    { value: "Incompleta", label: "Incompleta" },
                  ]}
                  className="select"
                  onChange={(option) => handleSelectChange(option, "nivel_educacional", "estado_educacional")}
                  menuPortalTarget={document.body} // Muestra el menú fuera del contenedor
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Asegura que esté por encima del modal
                />
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="perfil-freelancer-form-step">
              <h3>Educación Superior</h3>
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="institucion_superior">Institución</label>
                  <input
                    type="text"
                    id="institucion_superior"
                    name="institucion_superior"
                    value={freelancerData.educacion_superior.institucion_superior}
                    onChange={(e) => handleChange(e, "educacion_superior")}
                    required
                  />
                </div>
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="carrera">Carrera</label>
                  <input
                    type="text"
                    id="carrera"
                    name="carrera"
                    value={freelancerData.educacion_superior.carrera}
                    onChange={(e) => handleChange(e, "educacion_superior")}
                    required
                  />
                </div>
              </div>
              
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="carrera_afin">Carrera afín</label>
                  <div style={{ width: "322px", marginLeft: "31px"}}>
                    <Select
                      options={[
                        { value: "Informatica", label: "Informatica" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "educacion_superior", "carrera_afin")}
                    />
                  </div>
                </div>
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="estado_superior" style={{marginRight:"20px"}}>Estado</label>
                  <div style={{ width: "322px", marginLeft: "31px", marginRight:"25px"}}>
                    <Select
                      options={[
                        { value: "Cursando", label: "Cursando" },
                        { value: "Egresado", label: "Egresado" },
                        { value: "Titulado", label: "Titulado" },
                        { value: "Incompleta", label: "Incompleta" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "educacion_superior", "estado_superior")}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="ano_inicio_superior">Año inicio</label>
                  <div style={{ width: "322px", marginLeft: "31px"}}>
                    <Select
                      options={[
                        { value: "2022", label: "2022" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "educacion_superior", "ano_inicio_superior")}
                    />
                  </div>
                </div>
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="ano_termino_superior">Año término</label>
                  <div style={{ width: "322px", marginLeft: "31px"}}>
                    <Select
                      options={[
                        { value: "2024", label: "2024" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "educacion_superior", "ano_termino_superior")}
                    />
                  </div>
                </div>
              </div>
              
            </div>
          )}

          {currentStep === 8 && (
            <div className="perfil-freelancer-form-step">
              <h3>Educación básica y media</h3>
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="institucion_basica_media">Institución</label>
                  <input
                    type="text"
                    id="institucion_basica_media"
                    name="institucion_basica_media"
                    value={freelancerData.educacion_basica_media.institucion_basica_media}
                    onChange={(e) => handleChange(e, "educacion_basica_media")}
                    required
                  />
                </div>
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="tipo">Tipo</label>
                  <div style={{ width: "360px", marginRight:"25px"}}>
                    <Select
                      options={[
                        { value: "Educación básica", label: "Educación básica" },
                        { value: "Educación media", label: "Educación media" },
                        { value: "Educación básica y media", label: "Educación básica y media" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "educacion_basica_media", "tipo")}
                    />
                  </div>
                </div>
              </div>

              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="pais">País</label>
                  <div style={{ width: "322px", marginLeft: "31px"}}>
                    <Select
                      options={[
                        { value: "Chile", label: "Chile" },
                        { value: "Argentina", label: "Argentina" },
                        { value: "Colombia", label: "Colombia" },
                        { value: "Peru", label: "Peru" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "educacion_basica_media", "pais")}
                    />
                  </div>
                </div>
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="ciudad_basica_media">Ciudad</label>
                  <div style={{ width: "360px", marginLeft: "31px", marginRight:"25px"}}>
                    <Select
                      options={[
                        { value: "Santiago", label: "Santiago" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "educacion_basica_media", "ciudad_basica_media")}
                    />
                  </div>
                </div>
              </div>
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="ano_inicio_basica_media">Año inicio</label>
                  <div style={{ width: "322px", marginLeft: "31px"}}>
                    <Select
                      options={[
                        { value: "2022", label: "2022" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "educacion_basica_media", "ano_inicio_basica_media")}
                    />
                  </div>
                </div>
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="ano_termino_basica_media">Año término</label>
                  <div style={{ width: "360px", marginLeft: "31px", marginRight:"25px"}}>
                    <Select
                      options={[
                        { value: "2024", label: "2024" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "educacion_basica_media", "ano_termino_basica_media")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="perfil-freelancer-form-step">
              <h3>Idiomas</h3>

              {/* Campos para el nuevo idioma */}
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="nuevo-idioma">Idioma</label>
                  <input
                    type="text"
                    id="nuevo-idioma"
                    name="idioma"
                    style={{width:"675px", marginLeft: "31px"}}
                    value={nuevoIdioma.idioma}
                    onChange={(e) => handleNuevoIdiomaChange(e, "idioma")}
                    required
                  />
                </div>
              </div>

              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="nuevo-nivel_idioma">Nivel</label>
                  <div style={{ width: "700px", marginLeft: "31px", marginRight:"25px"}}>
                    <Select
                      options={[
                        { value: "Básico", label: "Básico" },
                        { value: "Intermedio", label: "Intermedio" },
                        { value: "Avanzado", label: "Avanzado" },
                        { value: "Nativo", label: "Nativo" },
                      ]}
                      className="select"
                      value={{ value: nuevoIdioma.nivel_idioma, label: nuevoIdioma.nivel_idioma }}
                      onChange={handleSelectChangeIdioma}
                      menuPortalTarget={document.body} // Muestra el menú fuera del contenedor
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Asegura que esté por encima del modal
                    />
                  </div>
                </div>
              </div>

              <button type="button" onClick={addIdioma}>Agregar Idioma</button>

              {/* Lista de idiomas agregados */}
              {freelancerData.idiomas.length > 0 && (
                <div>
                  <h4>Idiomas Agregados:</h4>
                  <ul>
                    {freelancerData.idiomas.map((idioma, index) => (
                      <li key={index}>{idioma.idioma} - {idioma.nivel_idioma}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {currentStep === 10 && (
            <div className="perfil-freelancer-form-step">
              <h3>Habilidades</h3>

              {/* Campos para la nueva habilidad */}
              <div className="grupos-container">  
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="nueva-categoria">Categoría</label>
                  <div style={{ width: "700px", marginLeft: "31px", marginRight:"25px"}}>
                    <Select
                      options={optionsCategorySkills} // Lista de opciones para la categoría
                      className="select"
                      value={{ value: nuevaHabilidad.categoria, label: nuevaHabilidad.categoria }}
                      onChange={(option) => handleSelectChangeHabilidad(option, "categoria")}
                      menuPortalTarget={document.body} // Muestra el menú fuera del contenedor
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Asegura que esté por encima del modal
                    />
                  </div>
                </div>
              </div>

              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="nueva-habilidad">Habilidad</label>
                  <input
                    type="text"
                    id="nueva-habilidad"
                    name="habilidad"
                    style={{width:"675px", marginLeft: "31px"}}
                    value={nuevaHabilidad.habilidad}
                    onChange={(e) => handleNuevaHabilidadChange(e, "habilidad")}
                    required
                  />
                </div>
              </div>

              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="nuevo-nivel_habilidad">Nivel</label>
                  <div style={{ width: "700px", marginLeft: "31px", marginRight:"25px"}}>
                    <Select
                      options={[
                        { value: "Básico", label: "Básico" },
                        { value: "Intermedio", label: "Intermedio" },
                        { value: "Avanzado", label: "Avanzado" },
                      ]}
                      className="select"
                      value={{ value: nuevaHabilidad.nivel_habilidad, label: nuevaHabilidad.nivel_habilidad }}
                      onChange={(option) => handleSelectChangeHabilidad(option, "nivel_habilidad")}
                      menuPortalTarget={document.body} // Muestra el menú fuera del contenedor
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Asegura que esté por encima del modal
                    />
                  </div>
                </div>
              </div>

              <button type="button" onClick={addHabilidad}>Agregar Habilidad</button>

              {/* Lista de habilidades agregadas */}
              {freelancerData.habilidades.length > 0 && (
                <div>
                  <h4>Habilidades Agregadas:</h4>
                  <ul>
                    {freelancerData.habilidades.map((habilidad, index) => (
                      <li key={index}>{habilidad.categoria} - {habilidad.habilidad} - {habilidad.nivel_habilidad}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {currentStep === 11 && (
            <div className="perfil-freelancer-form-step">
              <h3>Cursos</h3>
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="nombre_curso">Nombre del Curso</label>
                  <input
                    type="text"
                    id="nombre_curso"
                    name="nombre_curso"
                    value={freelancerData.curso.nombre_curso}
                    onChange={(e) => handleChange(e, "curso")}
                    required
                  />
                </div>
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="institucion_curso">Institución</label>
                  <input
                    type="text"
                    id="institucion_curso"
                    name="institucion_curso"
                    value={freelancerData.curso.institucion_curso}
                    onChange={(e) => handleChange(e, "curso")}
                    required
                  />
                </div>
              </div>

              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="ano_inicio_curso">Año de Inicio</label>
                  <div style={{ width: "322px", marginLeft: "31px", marginRight:"25px"}}>
                    <Select
                        options={[
                          { value: "2022", label: "2022" },
                        ]}
                        className="select"
                        onChange={(option) => handleSelectChange(option, "curso", "ano_inicio_curso")}
                      />
                  </div>
                </div>
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="mes_inicio_curso">Mes de Inicio</label>
                  <div style={{ width: "322px", marginLeft: "31px", marginRight:"25px"}}>
                    <Select
                      options={[
                        { value: "Enero", label: "Enero" },
                        { value: "Febrero", label: "Febrero" },
                        { value: "Marzo", label: "Marzo" },
                      ]}
                      className="select"
                      onChange={(option) => handleSelectChange(option, "curso", "mes_inicio_curso")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 12 && (
            <div className="perfil-freelancer-form-step">
              <h3>Pretensiones</h3>
              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="disponibilidad">Disponibilidad</label>
                  <input
                    type="text"
                    id="disponibilidad"
                    name="disponibilidad"
                    style={{width:"675px", marginLeft: "31px"}}
                    value={freelancerData.pretensiones.disponibilidad}
                    onChange={(e) => handleChange(e, "pretensiones")}
                    required
                  />
                </div>
              </div>

              <div className="grupos-container">
                <div className="perfil-freelancer-form-group">
                  <label htmlFor="renta_esperada">Renta esperada</label>
                  <input
                    type="number"
                    id="renta_esperada"
                    name="renta_esperada"
                    style={{width:"675px", marginLeft: "31px"}}
                    value={freelancerData.pretensiones.renta_esperada}
                    onChange={(e) => handleChange(e, "pretensiones")}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className="perfil-freelancer-footer">
            <button className="cancelar" type="button" onClick={closeModal}>
              Cancelar
            </button>

            <div className="navigation-buttons">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep}>
                  Anterior
                </button>
              )}

              {currentStep < 12 ? (
                <button className="siguiente" type="button" onClick={nextStep}>
                  Siguiente
                </button>
              ) : (
                <button type="submit">Crear Perfil</button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ModalCreatePerfilFreelancer;
