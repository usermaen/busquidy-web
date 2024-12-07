import React, { useState } from "react";
import Modal from "react-modal";

function ExperienciaLaboralModal({ isOpen, onSave, onClose }) {
    const [experiencia, setExperiencia] = useState([]);
    const [newExperience, setNewExperience] = useState({
        puesto: "",
        empresa: "",
        inicio: "",
        fin: "",
        descripcion: ""
    });

    const handleAddExperience = () => {
        setExperiencia([...experiencia, newExperience]);
        setNewExperience({ puesto: "", empresa: "", inicio: "", fin: "", descripcion: "" });
    };

    const handleSave = () => {
        onSave(experiencia);
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="experience-modal">
            <h2>Experiencia Laboral</h2>
            <input name="puesto" value={newExperience.puesto} placeholder="Puesto" />
            <input name="empresa" value={newExperience.empresa} placeholder="Empresa" />
            <input name="inicio" value={newExperience.inicio} placeholder="Fecha Inicio" />
            <input name="fin" value={newExperience.fin} placeholder="Fecha Fin" />
            <textarea name="descripcion" value={newExperience.descripcion} placeholder="Descripción" />
            <button onClick={handleAddExperience}>Agregar Experiencia</button>
            <button onClick={handleSave}>Guardar</button>
        </Modal>
    );
}

export default ExperienciaLaboralModal;
