import React, { useState } from "react";
import Modal from "react-modal";

function HabilidadesModal({ isOpen, onSave, onClose }) {
    const [habilidades, setHabilidades] = useState([]);
    const [newHabilidad, setNewHabilidad] = useState("");

    const handleAddHabilidad = () => {
        if (newHabilidad.trim()) {
            setHabilidades([...habilidades, newHabilidad]);
            setNewHabilidad("");
        }
    };

    const handleSave = () => {
        onSave(habilidades);
        onClose(); // Cierra el modal después de guardar
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Habilidades" ariaHideApp={false} className="skills-modal">
            <h2>Habilidades</h2>
            <input
                type="text"
                placeholder="Nueva habilidad"
                value={newHabilidad}
                onChange={(e) => setNewHabilidad(e.target.value)}
            />
            <button onClick={handleAddHabilidad}>Agregar Habilidad</button>

            <ul>
                {habilidades.map((habilidad, index) => (
                    <li key={index}>{habilidad}</li>
                ))}
            </ul>

            <button onClick={handleSave}>Guardar</button>
            <button onClick={onClose}>Cerrar</button>
        </Modal>
    );
}

export default HabilidadesModal;
