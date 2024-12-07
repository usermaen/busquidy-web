import React from "react";
import "./Modal.css";

function Modal({show, onClose, children, dismissOnClickOutside}) {
    if (!show) return null;

    const handleClickOutside = (event) => {
        if (event.target.className === "modal-overlay" && dismissOnClickOutside) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClickOutside}>
            <div className="modal-content">
                {!dismissOnClickOutside && (
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                )}
                {children}
            </div>
        </div>
    );
}

export default Modal;