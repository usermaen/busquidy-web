import React, { useState } from "react";
import Modal from "react-modal";

function DatosPersonalesModal({ isOpen, onSave, onClose }) {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (   
            <Modal isOpen={isOpen} onRequestClose={onClose} className="modal-datos">
                <h2>Datos Personales</h2>
                <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" />                
                <input name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" />
                <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" />
                <button onClick={handleSave}>Guardar</button>
                <button onClick={onClose}>Cerrar</button>
            </Modal>
    );
}

export default DatosPersonalesModal;
