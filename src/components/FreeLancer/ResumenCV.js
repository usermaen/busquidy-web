import React from "react";

function ResumenCV({ cvData }) {
    return (
        <div className="cv-preview">
            <h2>Resumen del CV</h2>
            <h3>Datos Personales</h3>
            <p>{cvData.datosPersonales.nombre} {cvData.datosPersonales.apellido}</p>
            <p>{cvData.datosPersonales.email}</p>
            <p>{cvData.datosPersonales.telefono}</p>

            <h3>Experiencia Laboral</h3>
            {cvData.experiencia.map((exp, index) => (
                <div key={index}>
                    <p><strong>{exp.puesto}</strong> en {exp.empresa}</p>
                    <p>{exp.inicio} - {exp.fin}</p>
                    <p>{exp.descripcion}</p>
                </div>
            ))}

            <h3>Educación</h3>
            {cvData.educacion.map((edu, index) => (
                <div key={index}>
                    <p>{edu.titulo} en {edu.institucion}</p>
                    <p>{edu.inicio} - {edu.fin}</p>
                </div>
            ))}

            <h3>Habilidades</h3>
            <p>{cvData.habilidades.join(", ")}</p>
        </div>
    );
}

export default ResumenCV;
