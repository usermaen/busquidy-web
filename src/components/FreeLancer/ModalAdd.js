import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModalAdd = ({ isOpen, onClose, onConfirm, id_usuario, itemType, initialData }) => {
    const [formData, setFormData] = useState({});

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

    const optionsAnoInicio = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008];
    const optionsAnoTermino = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

    useEffect(() => {
        // Initialize form data based on itemType when modal opens
        const initializeFormData = () => {
            switch (itemType) {
                case "inclusionLaboral":
                    return { 
                        discapacidad: "Si" ,
                        registro_nacional: "",
                        pension_invalidez: "",
                        ajuste_entrevista: "",
                        tipo_discapacidad: ""
                    };
                case "experienciaLaboral":
                    return { 
                        emprendedor: "Si",
                        interesado: "Si",
                        ano_inicio_emp: "",
                        mes_inicio_emp: "",
                        sector_emprendimiento: ""
                    };
                case "trabajoPractica":
                    return {
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
                case "formacion":
                    return { 
                        nivel_academico: "",
                        estado: ""
                    };
                case "educacionSuperior":
                    return {
                        institucion: "",
                        carrera: "",
                        carrera_afin: "",
                        estado_carrera: "",
                        ano_inicio_su: "",
                        ano_termino_su: ""
                    };
                case "educacionBasicaMedia":
                    return {
                        institucion: "",
                        tipo: "",
                        pais: "",
                        ciudad: "",
                        ano_inicio_ba: "",
                        ano_termino_ba: ""
                    };
                case "conocimientos":
                    return {
                        nombre_curso: "",
                        institucion: "",
                        ano_inicio_cur: "",
                        mes_inicio_cur: ""
                    };
                case "idiomas":
                    return {
                        idioma: "",
                        nivel: "Básico",
                    };
                case "habilidades":
                    return {
                        categoria: "",
                        habilidad: "",
                        nivel: "Básico",
                    };
                default:
                    return {};
            }
        };

        if (isOpen) {
            setFormData(initializeFormData());
        }
    }, [isOpen, itemType]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const renderFormAddContent = () => {
        switch (itemType) {
            case "inclusionLaboral":
                return (
                    <>
                        <label>
                            Discapacidad:
                            <select
                                name="discapacidad"
                                value={formData.discapacidad || ""}
                                onChange={handleChange}
                            >
                                <option value="Si">Si</option>
                            </select>
                        </label>

                        <label>
                            Registro Nacional:
                            <select
                                name="registro_nacional"
                                value={formData.registro_nacional || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Si">Si</option>
                                <option value="No">No</option>
                                <option value="EnTramite">En trámite</option>
                            </select>
                        </label>

                        <label>
                            Pensión de invalidez:
                            <select
                                name="pension_invalidez"
                                value={formData.pension_invalidez || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Si">Si</option>
                                <option value="No">No</option>
                                <option value="EnTramite">En trámite</option>
                            </select>
                        </label>

                        <label>
                            Ajuste de Entrevista:
                            <textarea
                                name="ajuste_entrevista"
                                value={formData.ajuste_entrevista || ""}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Tipo de Discapacidad:
                            <input
                                type="text"
                                name="tipo_discapacidad"
                                value={formData.tipo_discapacidad || ""}
                                onChange={handleChange}
                            />
                        </label>

                    </>
                );
            case "experienciaLaboral":
                return (
                    <>
                        <label>
                            Emprendedor:
                            <select
                                name="emprendedor"
                                value={formData.emprendedor || ""}
                                onChange={handleChange}
                            >
                                <option value="Si">Si</option>
                            </select>
                        </label>
                        <label>
                            Interesado:
                            <select
                                name="interesado"
                                value={formData.interesado || ""}
                                onChange={handleChange}
                            >
                                <option value="Si">Si</option>
                            </select>
                        </label>
                        <label>
                            Año Inicio:
                            <select
                                name="ano_inicio_emp"
                                value={formData.ano_inicio_emp || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona un año</option>
                                {optionsAnoInicio.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Mes Inicio:
                            <select
                                name="mes_inicio_emp"
                                value={formData.mes_inicio_emp || ""}
                                onChange={handleChange}
                            >
                                <option value="Enero">Enero</option>
                                <option value="Febrero">Febrero</option>
                                <option value="Marzo">Marzo</option>
                                <option value="Abril">Abril</option>
                                <option value="Mayo">Mayo</option>
                                <option value="Junio">Junio</option>
                                <option value="Julio">Julio</option>
                                <option value="Agosto">Agosto</option>
                                <option value="Septiembre">Septiembre</option>
                                <option value="Octubre">Octubre</option>
                                <option value="Noviembre">Noviembre</option>
                                <option value="Diciembre">Diciembre</option>
                            </select>
                        </label>
                        <label>
                            Sector Emprendimiento:
                            <input
                                type="text"
                                name="sector_emprendimiento"
                                value={formData.sector_emprendimiento || ""}
                                onChange={handleChange}
                            />
                        </label>
                    </>
                );
            case "trabajoPractica":
                return (
                    <>
                        <label>
                            Experiencia Laboral:
                            <select
                                name="experiencia_laboral"
                                value={formData.experiencia_laboral || ""}
                                onChange={handleChange}
                            >
                                <option value="Si">Si</option>
                            </select>
                        </label>
                        <label>
                            Experiencia:
                            <select
                                name="experiencia"
                                value={formData.experiencia || "Practica"}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Practica">Práctica</option>
                                <option value="Trabajo">Trabajo</option>
                            </select>
                        </label>
                        <label>
                            Empresa:
                            <input
                                type="text"
                                name="empresa"
                                value={formData.empresa || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Cargo:
                            <input
                                type="text"
                                name="cargo"
                                value={formData.cargo || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Área de Trabajo:
                            <input
                                type="text"
                                name="area_trabajo"
                                value={formData.area_trabajo || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Tipo de Cargo:
                            <input
                                type="text"
                                name="tipo_cargo"
                                value={formData.tipo_cargo || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Año Inicio:
                            <select
                                name="ano_inicio_tra"
                                value={formData.ano_inicio_tra || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona un año</option>
                                {optionsAnoInicio.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Mes Inicio:
                            <select
                                name="mes_inicio_tra"
                                value={formData.mes_inicio_tra || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Enero">Enero</option>
                                <option value="Febrero">Febrero</option>
                                <option value="Marzo">Marzo</option>
                                <option value="Abril">Abril</option>
                                <option value="Mayo">Mayo</option>
                                <option value="Junio">Junio</option>
                                <option value="Julio">Julio</option>
                                <option value="Agosto">Agosto</option>
                                <option value="Septiembre">Septiembre</option>
                                <option value="Octubre">Octubre</option>
                                <option value="Noviembre">Noviembre</option>
                                <option value="Diciembre">Diciembre</option>
                            </select>
                        </label>
                        <label>
                            Descripción:
                            <textarea
                                name="descripcion"
                                value={formData.descripcion || ""}
                                onChange={handleChange}
                            />
                        </label>
                    </>
                );
            case "formacion":
                return (
                    <>
                        <label>
                            Nivel Educacional:
                            <select
                                name="nivel_academico"
                                value={formData.nivel_academico || "Universidad"}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Basica">Básica</option>
                                <option value="Media">Media</option>
                                <option value="Universidad">Universidad</option>
                                <option value="Postgrado">Postgrado</option>
                                <option value="Doctorado">Doctorado</option>
                            </select>
                        </label>
                        <label>
                            Estado:
                            <select
                                name="estado"
                                value={formData.estado || "Incompleta"}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Completa">Completa</option>
                                <option value="Incompleta">Incompleta</option>
                            </select>
                        </label>
                    </>
                );
            case "educacionSuperior":
                return (
                    <>
                        <label>
                            Institución:
                            <input
                                type="text"
                                name="institucion"
                                value={formData.institucion || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Carrera:
                            <input
                                type="text"
                                name="carrera"
                                value={formData.carrera || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Carrera Afín:
                            <input
                                type="text"
                                name="carrera_afin"
                                value={formData.carrera_afin || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Estado:
                            <select
                                name="estado_carrera"
                                value={formData.estado_carrera || "Cursando"}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Cursando">Cursando</option>
                                <option value="Egresado">Egresado</option>
                                <option value="Títulado">Títulado</option>
                                <option value="Incompleta">Incompleta</option>
                            </select>
                        </label>
                        <label>
                            Año Inicio:
                            <select
                                name="ano_inicio_su"
                                value={formData.ano_inicio_su || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona un año</option>
                                {optionsAnoInicio.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Año Término:
                            <select
                                name="ano_termino_su"
                                value={formData.ano_termino_su || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona un año</option>
                                {optionsAnoTermino.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </>
                );
            case "educacionBasicaMedia":
                return (
                    <>
                        <label>
                            Institución:
                            <input
                                type="text"
                                name="institucion"
                                value={formData.institucion || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Tipo:
                            <select
                                name="tipo"
                                value={formData.tipo || "Educacion basica y media"}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Educacion basica">Educación básica</option>
                                <option value="Educacion media">Educación media</option>
                                <option value="Educacion basica y media">Educación básica y media</option>
                            </select>
                        </label>
                        <label>
                            Pais:
                            <select
                                name="pais"
                                value={formData.pais || "Chile"}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Chile">Chile</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Colombia">Colombia</option>
                                <option value="Venezuela">Venezuela</option>
                                <option value="Peru">Peru</option>
                                <option value="Ecuador">Ecuador</option>
                                <option value="Cuba">Cuba</option>
                                <option value="El Salvador">El Salvador</option>
                            </select>
                        </label>
                        <label>
                            Ciudad:
                            <input
                                type="text"
                                name="ciudad"
                                value={formData.ciudad || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Año Inicio:
                            <select
                                name="ano_inicio_ba"
                                value={formData.ano_inicio_ba || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona un año</option>
                                {optionsAnoInicio.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Año Término:
                            <select
                                name="ano_termino_ba"
                                value={formData.ano_termino_ba || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona un año</option>
                                {optionsAnoTermino.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </>
                );
            case "conocimientos":
                return (
                    <>
                        <label>
                            Nombre del Curso:
                            <input
                                type="text"
                                name="nombre_curso"
                                value={formData.nombre_curso || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Institución:
                            <input
                                type="text"
                                name="institucion"
                                value={formData.institucion || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Año Inicio:
                            <select
                                name="ano_inicio_cur"
                                value={formData.ano_inicio_cur || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona un año</option>
                                {optionsAnoInicio.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Mes Inicio:
                            <select
                                name="mes_inicio_cur"
                                value={formData.mes_inicio_cur || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Enero">Enero</option>
                                <option value="Febrero">Febrero</option>
                                <option value="Marzo">Marzo</option>
                                <option value="Abril">Abril</option>
                                <option value="Mayo">Mayo</option>
                                <option value="Junio">Junio</option>
                                <option value="Julio">Julio</option>
                                <option value="Agosto">Agosto</option>
                                <option value="Septiembre">Septiembre</option>
                                <option value="Octubre">Octubre</option>
                                <option value="Noviembre">Noviembre</option>
                                <option value="Diciembre">Diciembre</option>
                            </select>
                        </label>
                    </>
                );
            case "idiomas":
                return (
                    <>
                        <label>
                            Idioma:
                            <input
                                type="text"
                                name="idioma"
                                value={formData.idioma || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Nivel:
                            <select
                                name="nivel"
                                value={formData.nivel || "Básico"}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Básico">Básico</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                                <option value="Nativo">Nativo</option>

                            </select>
                        </label>
                    </>
                );
            case "habilidades":
                return (
                    <>
                        <label>
                            Categoría:
                            <select
                                name="nivel"
                                value={formData.categoria || ""}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una categoría</option>
                                    {optionsCategorySkills.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                            </select>
                        </label>
                        <label>
                            Habilidad:
                            <input
                                type="text"
                                name="habilidad"
                                value={formData.habilidad || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Nivel:
                            <select
                                name="nivel"
                                value={formData.nivel || "Básico"}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Básico">Básico</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                            </select>
                        </label>
                    </>
                );
            default:
                return <p>Tipo de elemento no reconocido.</p>;
        }
    };

    const handleConfirm = async () => {
        try {
            if (!id_usuario) {
                console.error('El ID del usuario no está definido.');
                return;
            }

            console.log('Datos a enviar:', formData);
            console.log(`Agregando datos para el tipo: ${itemType}`);

            const response = await axios.post(`http://localhost:3001/api/add-freelancer/${id_usuario}/${itemType}`, formData);

            if (response.status === 200 || response.status === 201) {
                console.log('Datos agregados correctamente:', response.data);
                alert('Datos agregados con éxito');
                window.location.reload();
            } else {
                console.error('Error al agregar los datos:', response.data);
                alert('Hubo un error al agregar los datos. Intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error en la solicitud de agregar:', error);
            alert('Hubo un error al agregar los datos. Intenta nuevamente.');
        } finally {
            onClose(); // Cerrar el modal
        }
    };

    return (
        <div className="modal-overlay-project">
            <div className="modal-content-project">
                <h3>Agregar {itemType}</h3>
                <form>{renderFormAddContent()}</form>
                <div className="modal-actions-project">
                    <button onClick={onClose} className="cancel-btn-project">Cancelar</button>
                    <button onClick={handleConfirm} className="confirm-btn-project">Agregar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalAdd;