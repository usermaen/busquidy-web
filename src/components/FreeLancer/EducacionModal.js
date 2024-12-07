import React, { useState } from "react";
import Modal from "react-modal";

function EducacionModal({ isOpen, onSave, onClose }) {
    const [educacion, setEducacion] = useState([]);
    const [newEducation, setNewEducation] = useState({
        institucion: "",
        titulo: "",
        inicio: "",
        fin: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEducation((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddEducation = () => {
        setEducacion([...educacion, newEducation]);
        setNewEducation({ institucion: "", titulo: "", inicio: "", fin: "" });
    };

    const handleSave = () => {
        onSave(educacion);
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="education-modal">
            <h2>Educación</h2>
            <input name="institucion" value={newEducation.institucion} onChange={handleChange} placeholder="Institución" />
            <input name="titulo" value={newEducation.titulo} onChange={handleChange} placeholder="Título" />
            <input name="inicio" value={newEducation.inicio} onChange={handleChange} placeholder="Fecha Inicio" />
            <input name="fin" value={newEducation.fin} onChange={handleChange} placeholder="Fecha Fin" />
            <button onClick={handleAddEducation}>Agregar Educación</button>
            <button onClick={handleSave}>Guardar</button>
            <button onClick={onClose}>Cerrar</button>
        </Modal>
    );
}

export default EducacionModal;
