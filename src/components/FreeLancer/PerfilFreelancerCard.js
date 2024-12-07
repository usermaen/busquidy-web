import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PerfilFreelancerCard.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import ModalEdit from "./ModalEdit";
import ModalAdd from "./ModalAdd";

function PerfilFreelancerCard({ userType, id_usuario }) {
    const [perfilFreelancerData, setPerfilFreelancerData] = useState(null);
    const [progresoPerfil, setProgresoPerfil] = useState(0);
    const [seccionesCompletas, setSeccionesCompletas] = useState({});
    const [activeSection, setActiveSection] = useState("informacionGeneral");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    const [isModalAddOpen, setIsModalAddOpen] = useState(false);
    const [activeItemType, setActiveItemType] = useState(null);

    useEffect(() => {
        if (userType === 'freelancer') {
            cargarPerfilFreelancer();
        } else {
            console.log('Esta función es exclusiva para usuarios de tipo Freelancer.');
        }
    }, [userType, id_usuario]);

    const cargarPerfilFreelancer = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/perfil-freelancer/${id_usuario}`);
            setPerfilFreelancerData(response.data);
            calcularProgreso(response.data);
        } catch (error) {
            console.error('Error al cargar perfil:', error);
        }
    };

    const calcularProgreso = (data) => {
        const secciones = {
            informacionGeneral: data.antecedentesPersonales?.nombres && data.antecedentesPersonales?.apellidos,
            presentacion: data.freelancer?.descripcion,
            inclusionLaboral: data.inclusionLaboral?.discapacidad,
            experienciaLaboral: data.experienciaLaboral?.length > 0,
            formacion: data.nivelEducacional?.nivel_academico,
            conocimientos: data.curso?.nombre_curso,
            pretensiones: data.pretensiones?.disponibilidad && data.pretensiones?.renta_esperada,
        };

        const totalCompletadas = Object.values(secciones).filter(Boolean).length;
        const progreso = (totalCompletadas / Object.keys(secciones).length) * 100;

        setProgresoPerfil(progreso);
        setSeccionesCompletas(secciones);
    };

    const editarDatos = (section) => {
        if (!perfilFreelancerData) return;
    
        let data = {};
    
        switch (section) {
            case "informacionGeneral":
                data = {
                    identificacion: perfilFreelancerData.antecedentesPersonales?.identificacion || "",
                    nombres: perfilFreelancerData.antecedentesPersonales?.nombres || "",
                    apellidos: perfilFreelancerData.antecedentesPersonales?.apellidos || "",
                    correo_contacto: perfilFreelancerData.freelancer?.correo_contacto || "",
                    telefono_contacto: perfilFreelancerData.freelancer?.telefono_contacto || "",
                    fecha_nacimiento: perfilFreelancerData.antecedentesPersonales?.fecha_nacimiento || "",
                    nacionalidad: perfilFreelancerData.antecedentesPersonales?.nacionalidad || "",
                    direccion: perfilFreelancerData.antecedentesPersonales?.direccion || "",
                    region: perfilFreelancerData.antecedentesPersonales?.region || "",
                    ciudad: perfilFreelancerData.antecedentesPersonales?.ciudad || "",
                    comuna: perfilFreelancerData.antecedentesPersonales?.comuna || "",
                };
                break;
            case "presentacion":
                data = {
                    descripcion: perfilFreelancerData.freelancer?.descripcion || "",
                };
                break;
            case "formacion":
                data = {
                    nivel_academico: perfilFreelancerData.nivelEducacional?.nivel_academico || "",
                    estado: perfilFreelancerData.nivelEducacional?.estado || ""
                };
                break;
            case "pretensiones":
                data = {
                    disponibilidad: perfilFreelancerData.pretensiones?.disponibilidad || "",
                    renta_esperada: perfilFreelancerData.pretensiones?.renta_esperada || "",
                };
                break;
            default:
                console.warn("Sección no reconocida:", section);
                return;
        }
    
        setModalData(data); // Configura los datos para el modal
        setActiveSection(section); // Marca la sección activa
        setIsModalOpen(true); // Abre el modal
    };    
    
    
    const handleConfirm = async (section, updatedData) => {
        try{
            if (!id_usuario) {
                console.error('El ID del usuario no está definido.');
                return;
            }
            console.log('Datos enviados al backend:', updatedData);
            console.log(`Actualizando datos para la sección ${section}:`, updatedData);

            const response = await axios.put(`http://localhost:3001/api/update-freelancer/${id_usuario}/${section}`, updatedData);
            // Manejar la respuesta del servidor
            if (response.status === 200) {
                console.log('Datos actualizados correctamente:', response.data);
                // Opcional: Actualizar el estado local si es necesario
                setPerfilFreelancerData((prevState) => ({
                    ...prevState,
                    [section]: updatedData, // Actualiza la sección específica en el estado
                }));
                alert('Datos actualizados con éxito');
                window.location.reload();
            } else {
                console.error('Error al actualizar los datos:', response.data);
            }
        } catch (error) {
        console.error('Error en la solicitud de actualización:', error);
        alert('Hubo un error al actualizar los datos. Intenta nuevamente.');
        } finally {
        setIsModalOpen(false); // Cerrar el modal
        }
    };

    const agregarGeneral = (id) => {
        let data = {};
    
        switch (id) {
            case "inclusionLaboral":
                data = {
                    discapacidad: "Si" ,
                    registro_nacional: "",
                    pension_invalidez: "",
                    ajuste_entrevista: "",
                    tipo_discapacidad: ""
                };
                break;
            case "experienciaLaboral":
                data = {
                    emprendedor: "Si",
                    interesado: "",
                    ano_inicio_emp: "",
                    mes_inicio_emp: "",
                    sector_emprendimiento: ""
                };
                break;
            case "trabajoPractica":
                data = {
                    experiencia_laboral: "Si",
                    experiencia: "",
                    empresa: "",
                    cargo: "",
                    area_trabajo: "",
                    tipo_cargo: "",
                    ano_inicio_tra: "",
                    mes_inicio_tra: "",
                    descripcion: ""
                };
                break;
            case "formacion":
                data = {
                    nivel_academico: "",
                    estado: ""
                };
                break;
            case "educacionSuperior":
                data = {
                    institucion: "",
                    carrera: "",
                    carrera_afin: "",
                    estado_carrera: "",
                    ano_inicio_su: "",
                    ano_termino_su: ""
                };
                break;
            case "educacionBasicaMedia":
                data = {
                    institucion: "",
                    tipo: "",
                    pais: "",
                    ciudad: "",
                    ano_inicio_ba: "",
                    ano_termino_ba: ""
                };
                break;
            case "conocimientos":
                data = {
                    nombre_curso: "",
                    institucion: "",
                    ano_inicio_cur: "",
                    mes_inicio_cur: ""
                };
                break;
            default:
                console.warn("ID no reconocido para agregar datos:", id);
                return;
        }

        setActiveItemType(id);
        setIsModalAddOpen(true);
    };

    const agregarMultiple = (id) => {
        let newItem = {};
    
        switch (id) {
            case "idiomas":
                newItem = {
                    idioma: "",
                    nivel: "Básico", // Nivel predeterminado
                };
                break;
            case "habilidades":
                newItem = {
                    categoria: "",
                    habilidad: "",
                    nivel: "Básico", // Nivel predeterminado
                };
                break;
            default:
                console.warn("ID no reconocido para agregar múltiples datos:", id);
                return;
        }
        setActiveItemType(id);
        setIsModalAddOpen(true);
    };
    
    // Función para agregar un nuevo ítem a la lista de idiomas o habilidades
    const agregarItem = (item, id) => {
        if (id === "idiomas") {
            setPerfilFreelancerData((prevData) => ({
                ...prevData,
                idiomas: [...(prevData.idiomas || []), item],
            }));
        } else if (id === "habilidades") {
            setPerfilFreelancerData((prevData) => ({
                ...prevData,
                habilidades: [...(prevData.habilidades || []), item],
            }));
        }
    
        // Limpia los campos del modal para agregar un nuevo ítem
        setModalData({
            ...(id === "idiomas" ? { idioma: "", nivel: "Básico" } : { categoria: "", habilidad: "", nivel: "Básico" }),
        });
    };    

    const handleNavigation = (section) => {
        setActiveSection(section);
        document.getElementById(section).scrollIntoView({ behavior: "smooth" });
    };

    const eliminarIdioma = async (id_idioma) => {
        try {
            const response = await fetch(`http://localhost:3001/api/delete-idioma-habilidad/${id_usuario}/idiomas/${id_idioma}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                throw new Error('Error al eliminar idioma');
            }

             // Filtrar el idioma eliminado del estado general
            setPerfilFreelancerData((prevData) => ({
                ...prevData,
                idiomas: prevData.idiomas.filter((idioma) => idioma.id_idioma !== id_idioma)
            }));
    
            alert('Idioma eliminado exitosamente');
        } catch (error) {
            console.error(error);
            alert('No se pudo eliminar el idioma');
        }
    };
    
    const eliminarHabilidad = async (id_habilidad) => {
        try {
            const response = await fetch(`http://localhost:3001/api/delete-idioma-habilidad/${id_usuario}/habilidades/${id_habilidad}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                throw new Error('Error al eliminar habilidad');
            }

            // Filtrar la habilidad eliminada del estado general
            setPerfilFreelancerData((prevData) => ({
                ...prevData,
                habilidades: prevData.habilidades.filter((habilidad) => habilidad.id_habilidad !== id_habilidad)
            }));
    
            alert('Habilidad eliminada exitosamente');
        } catch (error) {
            console.error(error);
            alert('No se pudo eliminar la habilidad');
        }
    };    

    const displayValue = (value) => (value !== null && value !== undefined ? value : "No especificado");

    return (
        <div className="perfil-free-container">
            {/* Información General */}
            <div className="perfil-info">
                <h2>Información General</h2>
                {perfilFreelancerData ? (
                    <>
                        <div className="mini-card">
                        <div id="informacionGeneral" className={` ${activeSection === "informacionGeneral" ? "active" : ""}`}>  
                                <p><strong>DNI:</strong> {displayValue(perfilFreelancerData.antecedentesPersonales.identificacion)}</p>
                                <p><strong>Nombre completo:</strong> {displayValue(perfilFreelancerData.antecedentesPersonales.nombres)} {perfilFreelancerData.antecedentesPersonales.apellidos}</p>
                                <p><strong>Correo electrónico Contacto:</strong> {displayValue(perfilFreelancerData.freelancer.correo_contacto)}</p>
                                <p><strong>Telefono Contacto:</strong> {displayValue(perfilFreelancerData.freelancer.telefono_contacto)}</p>
                                <p><strong>Fecha de nacimiento:</strong> {displayValue(new Date(perfilFreelancerData.antecedentesPersonales.fecha_nacimiento)).toLocaleDateString('es-CL')}</p>
                                <p><strong>Nacionalidad:</strong> {displayValue(perfilFreelancerData.antecedentesPersonales.nacionalidad)}</p>
                                <p><strong>Dirección:</strong> {displayValue(perfilFreelancerData.antecedentesPersonales.direccion)}</p>
                                <p><strong>Región:</strong> {displayValue(perfilFreelancerData.antecedentesPersonales.region)}</p>
                                <p><strong>Ciudad:</strong> {displayValue(perfilFreelancerData.antecedentesPersonales.ciudad)}</p>
                                <p><strong>Comuna:</strong> {displayValue(perfilFreelancerData.antecedentesPersonales.comuna)}</p>
                            </div>
                            <button className="btn-editar" onClick={() => editarDatos("informacionGeneral")}>
                                <i className="fas fa-edit"></i>Editar
                            </button>

                            
                        </div>

                        <h2>Presentación</h2>
                        <div className="mini-card">
                            <div id="presentacion" className={` ${activeSection === "presentacion" ? "active" : ""}`}> 
                                <p>{perfilFreelancerData.freelancer.descripcion}</p>
                            </div>
                            <button className="btn-editar" onClick={() => editarDatos("presentacion")}>
                                <i className="fas fa-edit"></i>Editar
                            </button>
                        </div>

                        <h2>Inclusión Laboral</h2>
                        <div className="mini-card">
                            <div id="inclusionLaboral" className={` ${activeSection === "inclusionLaboral" ? "active" : ""}`}> 
                                {perfilFreelancerData.inclusionLaboral && perfilFreelancerData.inclusionLaboral.discapacidad ? (
                                    <p><strong>Discapacidad:</strong> {perfilFreelancerData.inclusionLaboral.discapacidad}</p>
                                ) : (
                                    <p>No hay discapacidad registrada</p>
                                )}
                            </div>
                        </div>

                        <div className="mini-card-agregar">
                            <button 
                                className="btn-agregar" 
                                onClick={() => agregarGeneral("inclusionLaboral")}
                            >
                                <i className="fas fa-plus"></i>Agregar Discapacidad
                            </button>
                        </div>

                        <h2>Experiencia Laboral</h2>
                        <div className="mini-card">
                        <h3>Emprendimientos</h3>
                            <div id="experienciaLaboral" className={` ${activeSection === "experienciaLaboral" ? "active" : ""}`}>
                                {perfilFreelancerData.emprendimiento && perfilFreelancerData.emprendimiento.length > 0 ? (
                                    perfilFreelancerData.emprendimiento.map((emprendimiento) => (
                                        <div key={emprendimiento.id_emprendimiento} className="emprendimiento-card">
                                            <p><strong>Emprendedor:</strong> {emprendimiento.emprendedor}</p>
                                            <p><strong>Año Inicio:</strong> {emprendimiento.ano_inicio}</p>
                                            <p><strong>Mes Inicio:</strong> {emprendimiento.mes_inicio}</p>
                                            <p><strong>Sector Emprendimiento:</strong> {emprendimiento.sector_emprendimiento}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay emprendimientos registrados</p>
                                )}
                            </div>
                        </div>

                        <div className="mini-card-agregar">
                            <button 
                                className="btn-agregar"
                                onClick={() => agregarGeneral("experienciaLaboral")}
                            >
                                <i className="fas fa-plus"></i>Agregar Emprendimiento
                            </button>
                        </div>

                        <div className="mini-card">
                        <h3>Trabajo y Práctica</h3>
                            <div id="trabajoPractica" className="trabajoPractica">
                                {perfilFreelancerData.trabajoPractica && perfilFreelancerData.trabajoPractica.length > 0 ? (
                                    perfilFreelancerData.trabajoPractica.map((trabajo) => (
                                        <div key={trabajo.id_trabajo} className="trabajo-card">
                                            <p><strong>Experiencia:</strong> {trabajo.experiencia}</p>
                                            <p><strong>Empresa:</strong> {trabajo.empresa}</p>
                                            <p><strong>Cargo:</strong> {trabajo.cargo}</p>
                                            <p><strong>Área de Trabajo:</strong> {trabajo.area_trabajo}</p>
                                            <p><strong>Tipo de Cargo:</strong> {trabajo.tipo_cargo}</p>
                                            <p><strong>Año Inicio:</strong> {trabajo.ano_inicio}</p>
                                            <p><strong>Mes Inicio:</strong> {trabajo.mes_inicio}</p>
                                            <p><strong>Descripción:</strong> {trabajo.descripcion}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay experiencia laboral registrada</p>
                                )}
                            </div>
                        </div>

                        <div className="mini-card-agregar">
                            <button 
                                className="btn-agregar"
                                onClick={() => agregarGeneral("trabajoPractica")}
                            >
                                <i className="fas fa-plus"></i>Agregar Práctica o Trabajo
                            </button>
                        </div>

                        <h2>Formación</h2>
                        <div className="mini-card">
                        <h3>Nivel Educacional</h3>
                            <div id="formacion" className={` ${activeSection === "formacion" ? "active" : ""}`}>
                                {perfilFreelancerData.nivelEducacional && perfilFreelancerData.nivelEducacional.nivel_academico ? (
                                    <div className="nivel-educacional-card">
                                        <p><strong>Nivel académico:</strong> {perfilFreelancerData.nivelEducacional.nivel_academico}</p>
                                        <p><strong>Estado:</strong> {perfilFreelancerData.nivelEducacional.estado}</p>
                                        <button className="btn-editar" onClick={() => editarDatos("formacion")}>
                                            <i className="fas fa-edit"></i> Editar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <p>No hay nivel educacional registrado</p>
                                        <button 
                                            className="btn-agregar-conocimiento"
                                            onClick={() => agregarGeneral("formacion")}
                                        >
                                            <i className="fas fa-plus"></i>Agregar
                                        </button>
                                    </>
                                )}
                            </div>
                            
                        </div>

                        <div className="mini-card">
                        <h3>Educación Superior</h3>
                            <div id="educacionSuperior" className="educacion-superior">
                                {perfilFreelancerData.educacionSuperior && perfilFreelancerData.educacionSuperior.length > 0 ? (
                                    perfilFreelancerData.educacionSuperior.map((educacion) => (
                                        <div key={educacion.id_educacion} className="educacion-superior-card">
                                            <p><strong>Institución:</strong> {educacion.institucion}</p>
                                            <p><strong>Carrera:</strong> {educacion.carrera}</p>
                                            <p><strong>Estado:</strong> {educacion.estado}</p>
                                            <p><strong>Año Inicio:</strong> {educacion.ano_inicio}</p>
                                            <p><strong>Año Término:</strong> {educacion.ano_termino}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay educación superior registrada</p>
                                )}
                            </div>
                        </div>

                        <div className="mini-card-agregar">
                            <button 
                                className="btn-agregar"
                                onClick={() => agregarGeneral("educacionSuperior")}
                            >
                                <i className="fas fa-plus"></i>Agregar Educación Superior
                            </button>
                        </div>

                        <div className="mini-card">
                        <h3>Educación Básica y Media</h3>
                            <div id="educacionBasicaMedia" className="educacion-basica-media">
                                {perfilFreelancerData.educacionBasicaMedia && perfilFreelancerData.educacionBasicaMedia.length > 0 ? (
                                    perfilFreelancerData.educacionBasicaMedia.map((educacion) => (
                                        <div key={educacion.id_educacion_basica} className="educacion-basica-card">
                                            <p><strong>Institución:</strong> {educacion.institucion}</p>
                                            <p><strong>Tipo:</strong> {educacion.tipo}</p>
                                            <p><strong>País:</strong> {educacion.pais}</p>
                                            <p><strong>Ciudad:</strong> {educacion.ciudad}</p>
                                            <p><strong>Año Inicio:</strong> {educacion.ano_incio}</p>
                                            <p><strong>Año Término:</strong> {educacion.ano_termino}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay educación básica o media registrada</p>
                                )}
                            </div>
                        </div>

                        <div className="mini-card-agregar">
                            <button 
                                className="btn-agregar"
                                onClick={() => agregarGeneral("educacionBasicaMedia")}
                            >
                                <i className="fas fa-plus"></i>Agregar Educación Básica y Media
                            </button>
                        </div>

                        <h2>Conocimientos</h2>
                        <div className="mini-card">
                        <h3>Cursos</h3>
                            <div id="conocimientos" className={` ${activeSection === "conocimientos" ? "active" : ""}`}>
                                {perfilFreelancerData.curso && perfilFreelancerData.curso.length > 0 ? (
                                    perfilFreelancerData.curso.map((curso) => (
                                        <div key={curso.id_curso} className="curso-card">
                                            <p><strong>Nombre del Curso:</strong> {curso.nombre_curso}</p>
                                            <p><strong>Institución:</strong> {curso.institucion}</p>
                                            <p><strong>Año Inicio:</strong> {curso.ano_inicio}</p>
                                            <p><strong>Mes Inicio:</strong> {curso.mes_inicio}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay cursos registrados</p>
                                )}
                            </div>
                        </div>

                        <div className="mini-card-agregar">
                            <button 
                                className="btn-agregar"
                                onClick={() => agregarGeneral("conocimientos")}
                            >
                                <i className="fas fa-plus"></i>Agregar Curso
                            </button>
                        </div>

                        {/* Idiomas */}
                        <div id="idiomas" className={`mini-card ${activeSection === "idiomas" ? "active" : ""}`}>
                            <h3>Idiomas</h3>
                            {perfilFreelancerData.idiomas && perfilFreelancerData.idiomas.length > 0 ? (
                                perfilFreelancerData.idiomas.map((idioma) => (
                                    <div key={idioma.id_idioma} className="conocimiento-item">
                                        <span>{idioma.idioma} ({idioma.nivel}) 
                                            <button className="btn-eliminar" onClick={() => eliminarIdioma(idioma.id_idioma)}>✖</button>
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p>No hay idiomas registrados</p>
                            )}
                            <button 
                                className="btn-agregar-conocimiento"
                                onClick={() => agregarMultiple("idiomas")}
                            >
                                <i className="fas fa-plus"></i>Agregar

                            </button>
                        </div>

                        {/* Habilidades */}
                        <div id="habilidades" className={`mini-card ${activeSection === "habilidades" ? "active" : ""}`}>
                            <h3>Habilidades</h3>
                            {perfilFreelancerData.habilidades && perfilFreelancerData.habilidades.length > 0 ? (
                                perfilFreelancerData.habilidades.map((habilidad) => (
                                    <div key={habilidad.id_habilidad} className="conocimiento-item">
                                        <span>{habilidad.habilidad} ({habilidad.nivel}) 
                                            <button className="btn-eliminar" onClick={() => eliminarHabilidad(habilidad.id_habilidad)}>✖</button>
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p>No hay habilidades registradas</p>
                            )}
                            <button
                                className="btn-agregar-conocimiento"
                                onClick={() => agregarMultiple("habilidades")}
                            >
                                <i className="fas fa-plus"></i>Agregar
                            </button>
                        </div>

                        <h2>Pretensiones</h2>
                        <div className="mini-card">
                            <div id="pretensiones" className={` ${activeSection === "pretensiones" ? "active" : ""}`}>
                                <p><strong>Disponibilidad:</strong> {displayValue(perfilFreelancerData.pretensiones.disponibilidad)}</p>
                                <p><strong>Renta esperada:</strong> {displayValue(perfilFreelancerData.pretensiones.renta_esperada)}</p>
                            </div>
                            <button className="btn-editar" onClick={() => editarDatos("pretensiones")}>
                                <i className="fas fa-edit"></i>Editar
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Cargando datos...</p>
                )}
                <ModalEdit
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirm}
                    data={modalData}
                    section={activeSection}
                />

                <ModalAdd 
                    isOpen={isModalAddOpen} 
                    onClose={() => setIsModalAddOpen(false)} 
                    id_usuario={id_usuario}
                    itemType={activeItemType} 
                />
            </div>

            {/* Lado derecho (perfil-sidebar) */}
            <div className="perfil-sidebar">
                <h2 style={{ textAlign: "center" }}>Foto de Perfil</h2>
                <div className="foto-perfil">
                    <img src="https://via.placeholder.com/150" alt="Foto de perfil" />
                    <button className="btn-cambiar-foto"><i className="fas fa-edit"></i> Cambiar Foto</button>
                </div>

                {/* Barra de progreso */}
                <div className="completitud">
                    <p>{progresoPerfil.toFixed(0)}%</p>
                    <div className="barra-progreso">
                        <div className="progreso" style={{ width: `${progresoPerfil}%` }}></div>
                    </div>
                    <p className="completitud-mensaje">Este porcentaje de completitud es solo una referencia. Completa tu perfil para mejorar tu visibilidad.</p>
                    <button className="btn-descargar-cv"><i className="fas fa-download"></i> Descargar currículum</button>
                </div>

                {/* Resumen de Perfil */}
                <div className="curriculum">
                <h2>Resumen de Perfil</h2>
                    <h4>Curriculum</h4>
                    <ul>
                        <li onClick={() => handleNavigation("informacionGeneral")}><a>Información Géneral</a> {seccionesCompletas.informacionGeneral ? '✔' : '✖'}</li>
                        <li onClick={() => handleNavigation("presentacion")}><a>Presentación</a> {seccionesCompletas.presentacion ? '✔' : '✖'}</li>
                        <li onClick={() => handleNavigation("inclusionLaboral")}><a>Inclusión Laboral</a> {seccionesCompletas.inclusionLaboral ? '✔' : '✖'}</li>
                        <li onClick={() => handleNavigation("experienciaLaboral")}><a>Experiencia Laboral</a> {seccionesCompletas.experienciaLaboral ? '✔' : '✖'}</li>
                        <li onClick={() => handleNavigation("pretensiones")}><a>Pretensiones</a> {seccionesCompletas.pretensiones ? '✔' : '✖'}</li>
                        {/* Agrega más secciones según sea necesario */}
                    </ul>
                    <h4>Opcionales</h4>
                    <ul>
                        <li onClick={() => handleNavigation("formacion")}><a>Formación</a> {seccionesCompletas.formacion ? '✔'  : '✖'}</li>
                        <li onClick={() => handleNavigation("conocimientos")}><a>Conocimientos</a> {seccionesCompletas.conocimientos ? '✔' : '✖'}</li>
                    </ul>

                    <h4>Estoy interesado/a en</h4>
                    <ul>
                        <li>
                            <a>Proyectos medianos</a>
                            <span className="check-icon">✔</span>
                        </li>

                        <li>
                            <a>Proyectos pequeños</a>
                            <span className="check-icon">✔</span>
                        </li>
                        <li>
                            <a>Tareas</a>
                            <span className="check-icon">✔</span>
                        </li>
                    </ul>
                    <button className="btn-modificar-pref"><i className="fas fa-edit"></i> Modificar Preferencias</button>
                    <div></div>
                    <button className="btn-cambiar-cv"><i className="fas fa-edit"></i> Cambiar CV adjunto</button>
                    <div className="btn-container">
                        <button className="btn-ver-cv"><i className="fas fa-external-link"></i> Ver CV</button>
                        <button className="btn-borrar-cv"><i className="fas fa-trash"></i> Borrar CV</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PerfilFreelancerCard;
