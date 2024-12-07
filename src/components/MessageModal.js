import React from "react";
import "./MessageModal.css";
import { BiX } from "react-icons/bi"; // Asegúrate de tener react-icons instalado

function MessageModal({ message, closeModal }) {
    return (
        <div className="modal-message-overlay">
            <div className="modal-message-container">
                <button className="close-message-button" onClick={closeModal}>
                    <BiX />
                </button>
                <div className="modal-message-content">
                    <p>{message}</p>
                </div>
            </div>
        </div>
    );
}

export default MessageModal;
