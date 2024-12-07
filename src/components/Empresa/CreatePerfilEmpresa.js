import React, { useState } from "react";
import ModalCreatePefilEmpresa from "./ModalCreatePerfilEmpresa.js";
import MessageModal from "../MessageModal";
import './CreatePerfilEmpresa.css'

function CreatePerfilEmpresa({ userType, id_usuario }) {
    const [showModalCreatePerfilEmpresa, setShowModalCreatePerfilEmpresa] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState('');

    const openModalCreatePefilEmpresa = () => {
        if (userType === 'empresa') {
            setShowModalCreatePerfilEmpresa(true);
            console.log('id:', id_usuario);
        } else if (userType === 'freelancer') {
            setMessage('Esta función es exclusiva para usuarios de tipo Empresa.');
            setShowMessageModal(true);
        } else {
            setMessage('Debes iniciar sesión como Empresa para desbloquear esta función.');
            setShowMessageModal(true);
        }
    };    
    
    const closeMessageModal = () => {
        setShowMessageModal(false);
    };

    return(
        <div className="background-perfil-empresa">
            <div className="empresa-perfil-content">
                <button className="empresa-perfil-btn" onClick={openModalCreatePefilEmpresa}>Crear Perfil</button>
            </div>


            {showModalCreatePerfilEmpresa && (
                <ModalCreatePefilEmpresa closeModal ={() => setShowModalCreatePerfilEmpresa(false)} id_usuario={id_usuario}/>
            )}

            {/* Mostrar el nuevo MessageModal si es necesario */}
            {showMessageModal && (
                <MessageModal message={message} closeModal={closeMessageModal} />
            )}

        </div>

    );
}

export default CreatePerfilEmpresa;