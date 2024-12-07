import React, { useState, useEffect } from 'react';

const ModalEdit = ({ isOpen, onClose, onConfirm, data, section }) => {
    const [formData, setFormData] = useState(data || {});

    useEffect(() => {
        setFormData(data || {});
    }, [data]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleConfirm = () => {
        onConfirm(section, formData);
        onClose();
    };

    const renderFormContent = () => {
        switch (section) {
            case "informacionGeneral":
                return (
                    <>
                        {[
                            { label: "DNI", name: "identificacion" },
                            { label: "Nombres", name: "nombres" },
                            { label: "Apellidos", name: "apellidos" },
                            { label: "Correo electrónico Contacto", name: "correo_contacto", type: "email" },
                            { label: "Teléfono Contacto", name: "telefono_contacto" },
                            { label: "Fecha de nacimiento", name: "fecha_nacimiento", type: "date" },
                            { label: "Nacionalidad", name: "nacionalidad" },
                            { label: "Dirección", name: "direccion" },
                            { label: "Región", name: "region" },
                            { label: "Ciudad", name: "ciudad" },
                            { label: "Comuna", name: "comuna" }
                        ].map(({ label, name, type = "text" }) => (
                            <label key={name}>
                                {label}:
                                <input
                                    type={type}
                                    name={name}
                                    value={formData[name] || ""}
                                    onChange={handleChange}
                                />
                            </label>
                        ))}
                    </>
                );
            case "presentacion":
                return (
                    <label>
                        Descripción:
                        <textarea
                            name="descripcion"
                            value={formData.descripcion || ""}
                            onChange={handleChange}
                        />
                    </label>
                );
            case "formacion":
                return (
                    <>
                        <label>
                            Nivel Estudios:
                            <input
                                type="text"
                                name="nivel_academico"
                                value={formData.nivel_academico || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Estado:
                            <input
                                type="text"
                                name="estado"
                                value={formData.estado || ""}
                                onChange={handleChange}
                            />
                        </label>
                    </>
                );
            case "pretensiones":
                return (
                    <>
                        <label>
                            Disponibilidad:
                            <input
                                type="text"
                                name="disponibilidad"
                                value={formData.disponibilidad || ""}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Renta Esperada:
                            <input
                                type="number"
                                name="renta_esperada"
                                value={formData.renta_esperada || ""}
                                onChange={handleChange}
                            />
                        </label>
                    </>
                );
            default:
                return <p>Sección no reconocida.</p>;
        }
    };

    return (
        <div className="modal-overlay-project">
            <div className="modal-content-project">
                <h3>Editar {section}</h3>
                <form>{renderFormContent()}</form>
                <div className="modal-actions-project">
                    <button onClick={onClose} className="cancel-btn-project">Cancelar</button>
                    <button onClick={handleConfirm} className="confirm-btn-project">Guardar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalEdit;