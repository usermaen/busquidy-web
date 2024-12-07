import React, { useState, useEffect } from "react";
import NavbarFreeLancer from "../../components/FreeLancer/NavbarFreeLancer";
import ResumenCV from "../../components/FreeLancer/ResumenCV";
import CreateCV from "../../components/FreeLancer/CreateCv";
import Modal from "react-modal";
import "./ViewCV.css";
import LoadingScreen from "../../components/LoadingScreen"; 

function ViewCV() {
    // Estado para la pantalla de carga
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Agregar un retraso de al menos 500ms antes de ocultar la pantalla de carga
        setTimeout(() => {
            setLoading(false);
        }, 500);
        }
    );

    const [cvData, setCvData] = useState({
        datosPersonales: {},
        experiencia: [],
        educacion: [],
        habilidades: []
    });

    const [isCreateCVModalOpen, setCreateCVModalOpen] = useState(false);

    const handleUpdateCV = (updatedData) => {
        setCvData(updatedData);
    };

    return (
        <div>
            {/* Muestra la pantalla de carga si está activa */}
            {loading && <LoadingScreen />} 

            <NavbarFreeLancer />
            <div className="view-cv-container">
                <h1>Mi CV Profesional</h1>

                {/* Vista previa del CV */}
                <ResumenCV cvData={cvData} />

                {/* Botón para abrir el modal de edición */}
                <button onClick={() => setCreateCVModalOpen(true)} className="edit-cv-button">
                    Editar CV
                </button>

                {/* Modal para el componente CreateCV */}
                <Modal 
                    isOpen={isCreateCVModalOpen} 
                    onRequestClose={() => setCreateCVModalOpen(false)}
                    className="create-cv-modal"
                >
                    <CreateCV 
                        cvData={cvData} 
                        onSave={(updatedData) => { 
                            handleUpdateCV(updatedData); 
                            setCreateCVModalOpen(false); 
                        }} 
                    />
                </Modal>
            </div>
        </div>
    );
}

export default ViewCV;
