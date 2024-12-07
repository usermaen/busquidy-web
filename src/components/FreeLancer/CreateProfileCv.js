import React, { useState } from "react";
import './CreateProfileCv.css';

function CreateProfileCv({ id_usuario }) {
    const [cvFile, setCvFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileUpload = (event) => {
        setCvFile(event.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!cvFile) {
            alert("Por favor, sube un archivo CV.");
            return;
        }

        console.log("Valor de id_usuario antes de enviar:", id_usuario);

        if (!id_usuario) {
            alert("Error: El ID del usuario no está definido.");
            return;
        }
    
        const formData = new FormData();
        formData.append("cv", cvFile);
        formData.append("id_usuario", id_usuario);
    
        try {
            const response = await fetch("http://localhost:3001/api/upload-cv", {
                method: "POST",
                body: formData,
            });
    
            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const errorText = await response.text();  // Leer el cuerpo de la respuesta como texto
                console.error("Error en el servidor:", errorText);
                alert("Hubo un error al procesar el archivo.");
                return;
            }
    
            // Intentar parsear el JSON solo si la respuesta fue exitosa
            const result = await response.json();
            console.log(result);
    
            if (result) {
                alert("Perfil creado exitosamente");
            } else {
                alert("Hubo un error inesperado.");
            }
        } catch (error) {
            console.error("Error al cargar el archivo:", error);
            alert("Hubo un error al procesar el archivo.");
        }
    };    

    return (
        <div className="background-cv-content">
            <div className="button-cv-container">
                <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    onChange={handleFileUpload}
                    className="file-input"
                    />
                <button onClick={handleSubmit} className="cv-perfil-btn">
                    Subir y Crear Perfil
                </button>
            </div>
            {isLoading && <p>Cargando...</p>} {/* Indicador de carga */}
        </div>
    );
}

export default CreateProfileCv;
