import React, { useState } from "react";
import Select from "react-select";
import './ModalCreateProject.css';
import { toast } from 'react-toastify';

function ModalCreateProject({ closeModal, id_usuario, addProject }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [errorMessage, setErrorMessage] = useState("");
    
    // Estado para guardar datos del proyecto
    const [projectData, setProjectData] = useState({
        titulo: "",
        descripcion:"",
        categoria: "",
        habilidades_requeridas: "",
        presupuesto: "",
        duracion_estimada: "",
        fecha_limite: "",
        ubicacion: "",
        tipo_contratacion: "",
        metodologia_trabajo: "",
    });

    // Captura cambios en los inputs o en el selector
    const handleChange = (e, name) => {
        if (typeof e === "string") {
            // Caso del `Select`, donde `e` es el valor seleccionado
            setProjectData((prevData) => ({
                ...prevData,
                [name]: e, // Establece el valor de `categoria`
            }));
        } else {
            // Caso del `input` y `textarea`, donde `e` es el evento
            const { name, value } = e.target;
            setProjectData((prevData) => ({
                ...prevData,
                [name]: value, // Establece el valor del campo correspondiente
            }));
        }
    };

    // Enviar datos del proyecto al backend
    const enviarDatosProyecto = async (e) => {
        e.preventDefault();
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:3001/api/create-project", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectData: projectData,
                    id_usuario: id_usuario,
                }),
            });
    
            const data = await response.json();
            
            if (response.ok) {
                // Formatear el proyecto antes de añadirlo
                const newProject = {
                    ...data, // Datos del servidor
                    ...projectData, // Datos del formulario
                    estado_publicacion: "sin publicar",
                    fecha_creacion: new Date().toISOString(),
                };
                
                addProject(newProject);
                toast.success('Proyecto creado exitosamente');
                closeModal();
                
                // Resetear los campos
                setProjectData({
                    titulo: "",
                    descripcion: "",
                    categoria: "",
                    habilidades_requeridas: "",
                    presupuesto: "",
                    duracion_estimada: "",
                    fecha_limite: "",
                    ubicacion: "",
                    tipo_contratacion: "",
                    metodologia_trabajo: "",
                });
                setErrorMessage("");
            } else {
                throw new Error(data.message || 'Error al crear el proyecto');
            }
        } catch (error) {
            console.error("Error al crear el proyecto:", error);
            toast.error(error.message || 'Error al crear el proyecto');
        }
    };

    const validateStep = () => {
        let isValid = true;
        let error = "";
    
        if (currentStep === 1) {
            if (!projectData.titulo.trim() || !projectData.descripcion.trim() || !projectData.categoria.trim()) { 
                error = "Por favor completa todos los campos en este paso.";
                isValid = false;
            }
        } else if (currentStep === 2) {
            if (!projectData.habilidades_requeridas.trim() || !projectData.presupuesto || !projectData.duracion_estimada 
                || !projectData.fecha_limite) { 
                error = "Por favor completa todos los campos en este paso.";
                isValid = false;
            }
        } else if (currentStep === 3) {
            if (!projectData.ubicacion.trim() || !projectData.tipo_contratacion.trim() || !projectData.metodologia_trabajo.trim()) {
                error = "Por favor completa todos los campos en este paso.";
                isValid = false;
            }
        }
    
        setErrorMessage(error);
        return isValid;
    };
    
    // Función para avanzar y retroceder en los pasos del formulario
    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep((prev) => prev + 1);
        }
    };    
    
    const prevStep = () => setCurrentStep((prev) => prev - 1);    

    return (
        <div className="create-project-overlay">
            <div className="create-project-content">
                <h2>Crear Proyecto</h2>
                <form onSubmit={(e) => {
                        e.preventDefault(); 
                        if (currentStep === 3 && validateStep()) { // Solo envía si es el último paso y pasa la validación
                            enviarDatosProyecto(e);
                        }
                    }}>
                    {currentStep === 1 && (
                        <div className="create-project-form-step">
                            <h3>Información del Proyecto</h3>
                            <div className="create-project-form-group">
                                <label htmlFor="titulo">Título del Proyecto o Tarea</label>
                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    placeholder="Ej: Desarrollo de aplicación web"
                                    value={projectData.titulo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="create-project-form-group">
                                <label htmlFor="descripcion">Descripción Detallada</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    placeholder="Descripción del proyecto"
                                    value={projectData.descripcion}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <div className="create-project-form-group">
                                <label htmlFor="categoria">Categoría del Proyecto</label>
                                    <Select
                                        options={[
                                            {value: "Desarollo Web", label: "Desarrollo Web"},
                                            {value: "Diseño Gráfico", label: "Diseño Gráfico"},
                                            {value: "Marketing Digital", label: "Marketing Digital"},
                                        ]}
                                        className="select"
                                        onChange={(option) => handleChange(option.value, "categoria")}
                                    />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="create-project-form-step">
                            <h3>Detalles Adicionales</h3>
                            <div className="create-project-form-group">
                                <label htmlFor="habilidades_requeridas">Habilidades Requeridas</label>
                                <input
                                    type="text"
                                    id="habilidades_requeridas"
                                    name="habilidades_requeridas"
                                    placeholder="Ej: React, Node.js, etc."
                                    value={projectData.habilidades_requeridas}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="create-project-form-group">
                                <label htmlFor="presupuesto">Presupuesto Estimado</label>
                                <input
                                    type="number"
                                    id="presupuesto"
                                    name="presupuesto"
                                    placeholder="Monto en CLP"
                                    value={projectData.presupuesto}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="create-project-form-group">
                                <label htmlFor="duracion_estimada">Duración Estimada</label>
                                <input
                                    type="text"
                                    id="duracion_estimada"
                                    name="duracion_estimada"
                                    placeholder="Ej: 2 semanas, 1 mes"
                                    value={projectData.duracion_estimada}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="create-project-form-group">
                                <label htmlFor="fecha_limite">Fecha Límite de Entrega</label>
                                <input
                                    type="date"
                                    id="fecha_limite"
                                    name="fecha_limite"
                                    value={projectData.fecha_limite}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="create-project-form-step">
                            <h3>Información Adicional</h3>
                            <div className="create-project-form-group">
                                <label htmlFor="ubicacion">Ubicación del Proyecto</label>
                                <input
                                    type="text"
                                    id="ubicacion"
                                    name="ubicacion"
                                    placeholder="Remoto o especificar ubicación"
                                    value={projectData.ubicacion}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="create-project-form-group">
                                <label htmlFor="tipo_contratacion">Tipo de Contratación</label>
                                <Select
                                        options={[
                                            {value: "porProyecto", label: "Por proyecto"},
                                            {value: "porHora", label: "Por hora"},
                                            {value: "largoPlazo", label: "A largo plazo"},
                                        ]}
                                        className="select"
                                        onChange={(option) => handleChange(option.value, "tipo_contratacion")}
                                    />
                            </div>
                            <div className="create-project-form-group">
                                <label htmlFor="metodologia_trabajo">Metodología de Trabajo</label>
                                <input
                                    type="text"
                                    id="metodologia_trabajo"
                                    name="metodologia_trabajo"
                                    placeholder="Ej: Agile, Scrum, etc."
                                    value={projectData.metodologia_trabajo}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div className="create-project-footer">
                    {errorMessage && <div className="error-message">{errorMessage}</div>}

                        {currentStep > 1 && (
                            <button type="button" onClick={prevStep}>
                                Anterior
                            </button>
                        )}
                        {currentStep < 3 ? (
                            <button type="button" onClick={nextStep}>
                                Siguiente
                            </button>                     
                        ) : (
                            <button type="submit">
                                Crear Proyecto
                            </button>
                        )}

                        <button type="button" onClick={closeModal}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModalCreateProject;
