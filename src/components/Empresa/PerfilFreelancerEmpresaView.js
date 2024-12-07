import React, { useState, useEffect } from 'react';
import './PerfilFreelancerEmpresaView.css'

function PerfilFreelancerEmpresaView({ freelancer }) {
    const [activeSection, setActiveSection] = useState("informacionGeneral");
    const [progresoPerfil, setProgresoPerfil] = useState(0);

    const handleNavigation = (section) => {
        setActiveSection(section);
        document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    };
    const verificarDato = (dato) => (dato === null || dato === undefined || dato === "" ? false : true);

    const calcularProgreso = () => {
        let totalSecciones = 0;
        let seccionesCompletadas = 0;

        // Información General
        totalSecciones += 1;
        if (verificarDato(freelancer.antecedentesPersonales.nombres) && verificarDato(freelancer.antecedentesPersonales.apellidos)) seccionesCompletadas += 1;
        
        // Usuario
        totalSecciones += 1;
        if (verificarDato(freelancer.usuario.tipo_usuario)) seccionesCompletadas += 1;

        // Contacto
        totalSecciones += 1;
        if (verificarDato(freelancer.freelancer.correo_contacto) && verificarDato(freelancer.freelancer.telefono_contacto)) seccionesCompletadas += 1;

        // Inclusión Laboral
        totalSecciones += 1;
        if (freelancer.inclusionLaboral && freelancer.inclusionLaboral.discapacidad) seccionesCompletadas += 1;

        // Experiencia Laboral
        totalSecciones += 1;
        if (freelancer.emprendimiento && freelancer.emprendimiento.emprendedor) seccionesCompletadas += 1;
        if (freelancer.trabajoPractica && freelancer.trabajoPractica.experiencia_laboral) seccionesCompletadas += 1;

        // Formación
        totalSecciones += 3;
        if (verificarDato(freelancer.nivelEducacional?.nivel_academico)) seccionesCompletadas += 1;
        if (verificarDato(freelancer.educacionSuperior?.carrera)) seccionesCompletadas += 1;
        if (verificarDato(freelancer.educacionBasicaMedia?.tipo)) seccionesCompletadas += 1;

        // Conocimientos
        totalSecciones += 2;
        if (verificarDato(freelancer.curso?.nombre_curso)) seccionesCompletadas += 1;
        if (freelancer.idiomas && freelancer.idiomas.length > 0) seccionesCompletadas += 1;
        if (freelancer.habilidades && freelancer.habilidades.length > 0) seccionesCompletadas += 1;

        // Pretensiones
        totalSecciones += 1;
        if (verificarDato(freelancer.pretensiones?.disponibilidad) && verificarDato(freelancer.pretensiones?.renta_esperada)) seccionesCompletadas += 1;

        // Calcular porcentaje de progreso
        const progreso = (seccionesCompletadas / totalSecciones) * 100;
        setProgresoPerfil(progreso);
    };

    // Calcular el progreso cuando el freelancer cambia
    useEffect(() => {
        calcularProgreso();
    }, [freelancer]);

    const validarDato = (dato) => (dato === null || dato === undefined ? "Sin especificar" : dato);

    return (
        <div className="perfil-freelancer-view">
            {/* Header Section */}
            <div className="header">
                <img
                    src="https://via.placeholder.com/150"
                    alt="Freelancer"
                    className="profile-image"
                />
                <div className="info">
                    <h1>
                        {validarDato(freelancer.antecedentesPersonales.nombres)}{" "}
                        {validarDato(freelancer.antecedentesPersonales.apellidos)}
                    </h1>
                    <p>
                        <i className="fas fa-user"></i>{" "}
                        Usuario: {validarDato(freelancer.usuario.tipo_usuario)}                    
                    </p>
                    <p>
                        <i className="fas fa-map-marker-alt"></i>{" "}
                        {validarDato(freelancer.antecedentesPersonales.ciudad)},{" "}
                        {validarDato(freelancer.antecedentesPersonales.comuna)}
                    </p>
                    <p>
                        <i className="fas fa-envelope"></i> Contacto: {validarDato(freelancer.freelancer.correo_contacto)} |{" "}
                        <i className="fas fa-phone-alt"></i>{validarDato(freelancer.freelancer.telefono_contacto)}
                    </p>
                    <p>
                        <i className="fas fa-flag"></i> Nacionalidad: {validarDato(freelancer.antecedentesPersonales.nacionalidad)}                    
                    </p>
                </div>
            </div>

            {/* Presentación/Description Section */}
            <div className="description" id="presentacion">
                <h2>Presentación</h2>
                <p>{freelancer.freelancer.descripcion}</p>
            </div>

            {/* Inclusión Laboral Section */}
            <div className="inclusion-laboral" id="inclusionLaboral">
                <h2>Inclusión Laboral</h2>
                {freelancer.inclusionLaboral && freelancer.inclusionLaboral.discapacidad ? (
                    <p><strong>Discapacidad:</strong> {freelancer.inclusionLaboral.discapacidad}</p>
                ) : (
                    <p>No hay información de inclusión laboral registrada</p>
                )}
            </div>

            {/* Experiencia Laboral Section */}
            <div className="experiencia-laboral" id="experienciaLaboral">
                <h2>Experiencia Laboral</h2>
                
                <div className="emprendimientos">
                    <h3>Emprendimientos</h3>
                    {freelancer.emprendimiento && freelancer.emprendimiento.emprendedor ? (
                        <p><strong>Emprendedor:</strong> {freelancer.emprendimiento.emprendedor}</p>
                    ) : (
                        <p>No hay emprendimientos registrados</p>
                    )}
                </div>

                <div className="trabajo-practica">
                    <h3>Trabajo y Práctica</h3>
                    {freelancer.trabajoPractica && freelancer.trabajoPractica.experiencia_laboral ? (
                        <p><strong>Experiencia laboral:</strong> {freelancer.trabajoPractica.experiencia_laboral}</p>
                    ) : (
                        <p>No hay experiencia laboral registrada</p>
                    )}
                </div>
            </div>

            {/* Formación Section */}
            <div className="formacion" id="formacion">
                <h2>Formación</h2>
                
                <div className="nivel-educacional">
                    <h3>Nivel Educacional</h3>
                    {freelancer.nivelEducacional && freelancer.nivelEducacional.nivel_academico ? (
                        <p><strong>Nivel académico:</strong> {freelancer.nivelEducacional.nivel_academico}</p>
                    ) : (
                        <p>No hay nivel educacional registrado</p>
                    )}
                </div>

                <div className="educacion-superior">
                    <h3>Educación Superior</h3>
                    {freelancer.educacionSuperior && freelancer.educacionSuperior.length > 0 ? (
                        freelancer.educacionSuperior.map((educacion, index) => (
                            <div key={index} className="educacion-superior-item">
                                <p><strong>Institución:</strong> {educacion.institucion}</p>
                                <p><strong>Carrera:</strong> {educacion.carrera}</p>
                                <p><strong>Estado:</strong> {educacion.estado}</p>
                                <p><strong>Año de Inicio:</strong> {educacion.ano_inicio}</p>
                                <p><strong>Año de Término:</strong> {educacion.ano_termino}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay educación superior registrada</p>
                    )}
                </div>

                <div className="educacion-basica-media">
                    <h3>Educación Básica y Media</h3>
                    {freelancer.educacionBasicaMedia && freelancer.educacionBasicaMedia.length > 0 ? (
                        freelancer.educacionBasicaMedia.map((educacion, index) => (
                            <div key={index} className="educacion-basica-media-item">
                                <p><strong>Institución:</strong> {educacion.institucion}</p>
                                <p><strong>Tipo:</strong> {educacion.tipo}</p>
                                <p><strong>País:</strong> {educacion.pais}</p>
                                <p><strong>Ciudad:</strong> {educacion.ciudad}</p>
                                <p><strong>Año de Inicio:</strong> {educacion.ano_inicio}</p>
                                <p><strong>Año de Término:</strong> {educacion.ano_termino}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay educación básica y media registrada</p>
                    )}
                </div>
            </div>

            {/* Conocimientos Section */}
            <div className="conocimientos" id="conocimientos">
                <h2>Conocimientos</h2>
                
                <div className="cursos">
                    <h3>Cursos</h3>
                    {freelancer.curso && freelancer.curso.length > 0 ? (
                        freelancer.curso.map((curso, index) => (
                            <div key={index} className="curso-item">
                                <p><strong>Nombre del Curso:</strong> {curso.nombre_curso}</p>
                                <p><strong>Institución:</strong> {curso.institucion}</p>
                                <p><strong>Año de Inicio:</strong> {curso.ano_inicio}</p>
                                <p><strong>Mes de Inicio:</strong> {curso.mes_inicio}</p>
                            </div>
                        ))
                    ) : (
                        <p>No hay cursos registrados</p>
                    )}
                </div>

                {/* Idiomas */}
                <div className="idiomas" id="idiomas">
                    <h3>Idiomas</h3>
                    {freelancer.idiomas && freelancer.idiomas.length > 0 ? (
                        freelancer.idiomas.map((idioma, index) => (
                            <p key={index}><strong>{idioma.idioma}:</strong> {idioma.nivel}</p>
                        ))
                    ) : (
                        <p>No hay idiomas registrados</p>
                    )}
                </div>

                {/* Habilidades */}
                <div className="habilidades" id="habilidades">
                    <h3>Habilidades</h3>
                    {freelancer.habilidades && freelancer.habilidades.length > 0 ? (
                        freelancer.habilidades.map((habilidad, index) => (
                            <p key={index}><strong>{habilidad.habilidad}:</strong> {habilidad.nivel}</p>
                        ))
                    ) : (
                        <p>No hay habilidades registradas</p>
                    )}
                </div>
            </div>

            {/* Pretensiones Section */}
            <div className="pretensiones" id="pretensiones">
                <h2>Pretensiones</h2>
                {freelancer.pretensiones ? (
                    <>
                        <p><strong>Disponibilidad:</strong> {validarDato(freelancer.pretensiones.disponibilidad)}</p>
                        <p><strong>Renta esperada:</strong> {validarDato(freelancer.pretensiones.renta_esperada)}</p>
                    </>
                ) : (
                    <p>No hay pretensiones registradas</p>
                )}
            </div>

             {/* Progress Bar */}
            <div className="progress-container">
                <h3>Progreso del Perfil</h3>
                <div className="progress-bar">
                    <div className="progress" style={{ width: `${progresoPerfil}%` }}></div>
                </div>
                <p>{progresoPerfil.toFixed(0)}% completado</p>
            </div>
        </div>
    );
}

export default PerfilFreelancerEmpresaView;