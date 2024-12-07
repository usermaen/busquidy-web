import React from "react";
import './InfoCreatePerfil.css';

function InfoCreatePerfil() {
    return (
        <div className="info-perfil-container">
            <h2>Información</h2>
            <p>Crea tu perfl para utilizar las funciones de la plataforma sin problemas</p>
            <h2> ¿Cómo funciona crear mi pefil?</h2>
            <p>
                Puedes crear tu perfil manualmente con el boton "Crear Perfil" insertado tus 
                datos en los formularios obligatorios y opcionales.
            </p>
            <br></br>
            <p>
                Puedes crear tu perfil subiendo ya tu curriculum creado con el boton "Crear Perfil con CV" subiendo  
                tu archivo CV en formato WORD o PDF.
            </p>
        </div>
    );
}

export default InfoCreatePerfil;