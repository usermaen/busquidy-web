import React, { useState, useEffect } from "react";
import "./PerfilFreelancerMiniCard.css";
import axios from "axios";
import ModalEdit from "./ModalEdit";

function PerfilFreelancerMiniCard({ userType, id_usuario }) {
    const [perfilData, setPerfilData] = useState(null);
    const [activeSection, setActiveSection] = useState('freelancer-info');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({});
    
    useEffect(() => {
        cargarPerfilFreelancer();
    }, []);

    const cargarPerfilFreelancer = async () => {
        if (userType === 'freelancer') {
            try {
                const response = await axios.get(`http://localhost:3001/api/perfil-freelancer/${id_usuario}`);
                setPerfilData(response.data);
            } catch (error) {
                console.error('Error al cargar perfil:', error);
            }
        } else {
            console.log('Esta función es exclusiva para usuarios de tipo Freelancer.');
        }
    };

    const editarDatos = (section) => {
        if (!perfilData) return;
    
        let data = {};
    
        switch (section) {
            case "informacionGeneral":
                data = {
                    identificacion: perfilData.antecedentesPersonales?.identificacion || "",
                    nombres: perfilData.antecedentesPersonales?.nombres || "",
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
                setPerfilData((prevState) => ({
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

    const renderSection = () => {
        const displayValue = (value) => {
            if (!value) return "No especificado";
        
            // Verifica si el valor es una fecha válida
            if (typeof value === "string" && !isNaN(Date.parse(value))) {
                const date = new Date(value).toLocaleDateString('es-CL');
                return date
            }
        
            return value; // Devuelve el valor tal cual si no es una fecha
        };
    
        if (!perfilData) return <p>Cargando datos...</p>;
    
        switch (activeSection) {
            case 'freelancer-info':
                return (
                    <div className="freelancer-info-section">
                        <h2>Información del Freelancer</h2>
                        <p>
                            <strong>Nombre:</strong>{" "}
                            {perfilData.antecedentesPersonales.nombres || perfilData.antecedentesPersonales.apellidos
                                ? `${displayValue(perfilData.antecedentesPersonales.nombres)} ${displayValue(perfilData.antecedentesPersonales.apellidos)}`
                                : "No especificado"}
                        </p>
                        <p><strong>Ciudad:</strong> {displayValue(perfilData.antecedentesPersonales.ciudad)}</p>
                        <p><strong>Descripción:</strong> {displayValue(perfilData.freelancer.descripcion)}</p>
                    </div>
                );
                case 'educacion':
                    return (
                        <div className="educacion-section">
                            <h2>Antecedentes Educación</h2>
                            <p>
                                <strong>Nivel Educacional:</strong>{" "}
                                {perfilData.nivelEducacional?.nivel_academico || perfilData.nivelEducacional?.estado
                                    ? `${displayValue(perfilData.nivelEducacional.nivel_academico)} - ${displayValue(perfilData.nivelEducacional.estado)}`
                                    : "No especificado"}
                            </p>
                            <p>
                                <strong>Educación Superior:</strong>{" "}
                                {perfilData.educacionSuperior?.carrera || perfilData.educacionSuperior?.ano_inicio || perfilData.educacionSuperior?.estado
                                    ? `${displayValue(perfilData.educacionSuperior.carrera)}${perfilData.educacionSuperior.ano_inicio ? `, ${perfilData.educacionSuperior.ano_inicio}` : ""}${perfilData.educacionSuperior.estado ? ` - ${perfilData.educacionSuperior.estado}` : ""}`
                                    : "No especificado"}
                            </p>
                            <p>
                                <strong>Educación Básica y Media:</strong>{" "}
                                {perfilData.educacionBasicaMedia?.institucion || perfilData.educacionBasicaMedia?.tipo || perfilData.educacionBasicaMedia?.ano_inicio || perfilData.educacionBasicaMedia?.ano_termino
                                    ? `${displayValue(perfilData.educacionBasicaMedia.institucion)}${perfilData.educacionBasicaMedia.tipo ? `, ${perfilData.educacionBasicaMedia.tipo}` : ""}${perfilData.educacionBasicaMedia.ano_inicio ? `, ${perfilData.educacionBasicaMedia.ano_inicio}` : ""}${perfilData.educacionBasicaMedia.ano_termino ? ` - ${perfilData.educacionBasicaMedia.ano_termino}` : ""}`
                                    : "No especificado"}
                            </p>
                        </div>
                    );                
            case 'antecedentes-personales':
                return (
                    <div className="antecedentes-personales-section">
                        <h2>Antecedentes Personales</h2>
                        <p><strong>Rut:</strong> {displayValue(perfilData.antecedentesPersonales.identificacion)}</p>
                        <p><strong>Fecha de Nacimiento:</strong> {displayValue(perfilData.antecedentesPersonales.fecha_nacimiento)}</p>
                        <p><strong>Nacionalidad:</strong> {displayValue(perfilData.antecedentesPersonales.nacionalidad)}</p>
                        <p><strong>Estado Civil:</strong> {displayValue(perfilData.antecedentesPersonales.estado_civil)}</p>
                    </div>
                );
            case 'informacion-adicional':
                return (
                    <div className="informacion-adicional-section">
                        <h2>Información Adicional</h2>
    
                        <p><strong>Experiencia laboral: </strong> 
                            {perfilData.trabajoPractica?.experiencia_laboral === 'No' 
                                ? "No especificado" 
                                : `${displayValue(perfilData.trabajoPractica?.experiencia_laboral)}${perfilData.trabajoPractica?.area_trabajo ? `, ${perfilData.trabajoPractica?.area_trabajo}` : ""}${perfilData.trabajoPractica?.ano_inicio ? `, ${perfilData.trabajoPractica?.ano_inicio}` : ""}`}
                        </p>
    
                        <p><strong>Emprendimientos: </strong>
                            {perfilData.emprendimiento?.emprendedor === 'No' || !perfilData.emprendimiento?.emprendedor
                                ? "No especificado"
                                : `Emprendedor: ${displayValue(perfilData.emprendimiento?.emprendedor)}${perfilData.emprendimiento?.sector_emprendimiento ? `, Sector: ${perfilData.emprendimiento?.sector_emprendimiento}` : ""}${perfilData.emprendimiento.ano_inicio ? `, Año de inicio: ${perfilData.emprendimiento.ano_inicio}` : ""}`}
                        </p>
    
                        <p><strong>Inclusión Laboral: </strong>
                            {perfilData.inclusionLaboral?.discapacidad === 'No' || !perfilData.inclusionLaboral?.discapacidad
                                ? "No especificado"
                                : `${perfilData.inclusionLaboral.discapacidad}${perfilData.inclusionLaboral.tipo_discapacidad ? `, Tipo de discapacidad: ${perfilData.inclusionLaboral.tipo_discapacidad}` : ""}`}
                        </p>
    
                        <p><strong>Idiomas: </strong>
                            {perfilData.idiomas && perfilData.idiomas.length > 0 ? (
                                perfilData.idiomas.map((idioma) => (
                                    <div key={idioma.id_idioma} className="conocimiento-item">
                                        <p>{displayValue(idioma.idioma)} ({displayValue(idioma.nivel)})</p>
                                    </div>
                                ))
                            ) : (
                                <p>No especificado</p>
                            )}
                        </p>
                    </div>
                );
                case 'informacion-cuenta':
                    return (
                        <div className="antecedentes-personales-section">
                            <h2>Información de la Cuenta</h2>
                            <p><strong>Tipo de Usuario:</strong> {(perfilData.usuario.tipo_usuario)}</p>
                            <p><strong>Correo Electrónico:</strong> {(perfilData.usuario.correo)}</p>
                            <p><strong>Contraseña:</strong> ************</p>

                            {userType === 'freelancer' && (
                                <button className="btn-editar" onClick={() => editarDatos("informacion-cuenta")}>
                                    <i className="fas fa-edit"></i> Editar
                                </button>
                            )}
                        </div>
                        
                    );
    
            // Agrega más casos según tus secciones
            default:
                return null;
        }
    };    
    
    return (
        <div className="perfil-freelancer-container">
            <div className="sidebar-freelancer">
                <ul>
                    <li onClick={() => setActiveSection('freelancer-info')} className={activeSection === 'freelancer-info' ? 'active' : ''}>Información del Freelancer</li>
                    <li onClick={() => setActiveSection('antecedentes-personales')} className={activeSection === 'antecedentes-personales' ? 'active' : ''}>Antecedentes Personales</li>
                    <li onClick={() => setActiveSection('educacion')} className={activeSection === 'educacion' ? 'active' : ''}>Educación</li>
                    <li onClick={() => setActiveSection('informacion-adicional')} className={activeSection === 'informacion-adicional' ? 'active' : ''}>Información Adicional</li>
                    <li onClick={() => setActiveSection('informacion-cuenta')} className={activeSection === 'informacion-cuenta' ? 'active' : ''}>Información de la Cuenta</li>
                    {/* Agrega más items según tus secciones */}
                </ul>
            </div>
            <div className="content">
                {renderSection()}
            </div>
            <ModalEdit
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    // onConfirm={handleConfirm}
                    data={modalData}
                    section={activeSection}
                />
        </div>
    );
}

export default PerfilFreelancerMiniCard;
