import React, { useState } from "react";
import ModalCreatePefilFreelancer from "./ModalCreatePefilFreelancer";
import MessageModal from "../MessageModal";
import './CreatePerfilFreelancer.css'

function CreatePerfilFreelancer({ userType, id_usuario}) {
    const [showModalCreatePerfilFreelancer, setShowModalCreatePerfilFreelancer] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState('');

    const openModalCreatePefilFreelancer = () => {
        if (userType === 'freelancer') {
            setShowModalCreatePerfilFreelancer(true);
            console.log('id:', id_usuario);
        } else if (userType === 'empresa') {
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
        <div className="background-perfil-freelancer">
            <div className="freelancer-perfil-content">
                <button className="freelancer-perfil-btn" onClick={openModalCreatePefilFreelancer}>Crear Perfil</button>
            </div>


            {showModalCreatePerfilFreelancer && (
                <ModalCreatePefilFreelancer closeModal ={() => setShowModalCreatePerfilFreelancer(false)} id_usuario={id_usuario}/>
            )}

            {/* Mostrar el nuevo MessageModal si es necesario */}
            {showMessageModal && (
                <MessageModal message={message} closeModal={closeMessageModal} />
            )}

        </div>

    );
}

export default CreatePerfilFreelancer;