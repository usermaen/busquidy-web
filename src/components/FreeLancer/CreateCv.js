// src/components/FreeLancer/CreateCV.js
import React, { useState } from "react";
import DatosPersonalesModal from "./DatosPersonalesModal";
import ExperienciaLaboralModal from "./ExperienciaLaboralModal";
import EducacionModal from "./EducacionModal";
import HabilidadesModal from "./HabilidadesModal";
import "./CreateCV.css";

function CreateCV({ cvData, onSave }) {
    const [localCvData, setLocalCvData] = useState(cvData || {
        datosPersonales: {},
        experiencia: [],
        educacion: [],
        habilidades: []
    });

    const [isDatosPersonalesOpen, setDatosPersonalesOpen] = useState(false);
    const [isExperienciaOpen, setExperienciaOpen] = useState(false);
    const [isEducacionOpen, setEducacionOpen] = useState(false);
    const [isHabilidadesOpen, setHabilidadesOpen] = useState(false);

    const handleSectionUpdate = (section, data) => {
        setLocalCvData((prevData) => ({
            ...prevData,
            [section]: data
        }));
    };

    const handleSave = () => {
        onSave(localCvData);
    };

    return (
        <div className="create-cv-container">
            <h2>Editar CV</h2>
            <button onClick={() => setDatosPersonalesOpen(true)}>Datos Personales</button>
            <button onClick={() => setExperienciaOpen(true)}>Experiencia Laboral</button>
            <button onClick={() => setEducacionOpen(true)}>Educación</button>
            <button onClick={() => setHabilidadesOpen(true)}>Habilidades</button>

            <DatosPersonalesModal 
                isOpen={isDatosPersonalesOpen} 
                onSave={(data) => { handleSectionUpdate('datosPersonales', data); setDatosPersonalesOpen(false); }}
                onClose={() => setDatosPersonalesOpen(false)}
            />
            <ExperienciaLaboralModal 
                isOpen={isExperienciaOpen} 
                onSave={(data) => { handleSectionUpdate('experiencia', data); setExperienciaOpen(false); }}
                onClose={() => setExperienciaOpen(false)}
            />
            <EducacionModal 
                isOpen={isEducacionOpen} 
                onSave={(data) => { handleSectionUpdate('educacion', data); setEducacionOpen(false); }}
                onClose={() => setEducacionOpen(false)}
            />
            <HabilidadesModal 
                isOpen={isHabilidadesOpen} 
                onSave={(data) => { handleSectionUpdate('habilidades', data); setHabilidadesOpen(false); }}
                onClose={() => setHabilidadesOpen(false)}
            />

            <button onClick={handleSave} className="save-cv-button">Guardar CV</button>
        </div>
    );
}

export default CreateCV;
