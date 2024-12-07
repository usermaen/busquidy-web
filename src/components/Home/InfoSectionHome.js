import React, { useEffect, useState } from 'react';
import FAQSection from './FAQSection ';
import axios from 'axios';
import MessageModal from "../MessageModal";
import './InfoSectionHome.css';
import ModalPagoSuscripcion from '../ModalPagoSuscripcion'

const InfoSectionHome = ({tipo_usuario, id_usuario}) => {
    const [showModalPagarSuscripcion, setShowModalPagarSuscripcion] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState('');

    const openModalPagarSuscripcion = async () => {
        if (tipo_usuario === 'freelancer') {
            try {
                const response = await axios.get(`http://localhost:3001/api/freelancer/${id_usuario}`);
                if (response.data.isPerfilIncompleto) {
                    setMessage('Completa tu perfil para ser Busquidy +.');
                    setShowMessageModal(true);
                    return; // Detenemos la ejecución aquí si el perfil está incompleto
                }
    
                setShowModalPagarSuscripcion(true); // Mostrar el modal solo si el perfil está completo
            } catch (error) {
                console.error("Error al verificar el perfil del freelancer:", error);
            }
        } else if (tipo_usuario === 'empresa') {
            try {
                const response = await axios.get(`http://localhost:3001/api/empresa/${id_usuario}`);
                console.log("Se verificó el perfil de la empresa");
                if (response.data.isPerfilIncompleto) {
                    setMessage('Completa tu perfil para ser Busquidy +');
                    setShowMessageModal(true);
                    return; // Detenemos la ejecución aquí si el perfil está incompleto
                }
    
                setShowModalPagarSuscripcion(true); // Mostrar el modal solo si el perfil está completo
            } catch (error) {
                console.error("Error al verificar el perfil de la empresa:", error);
            }
        } else if (tipo_usuario === 'administrador') {
            alert('Usted es un usuario de tipo administrador');
        } else {
            setMessage('Necesitas iniciar sesión para ser Busquidy +');
            setShowMessageModal(true);
        }
    };    

    const closeMessageModal = () => {
        setShowMessageModal(false);
    };

    useEffect (() => {
        if (!id_usuario && !tipo_usuario) {
            console.log('ID o Tipo de usuario no identificado.')
        }
    }, [id_usuario, tipo_usuario]);

    return (
        <div>
            {/* Primer sección de información */}
            <div className="como-funciona-container">
                <h2 className="como-funciona-title">¿Cómo funciona nuestra plataforma?</h2>
                <div className="como-funciona-cards-container">
                    <div className="como-funciona-card">
                        <div className="como-funciona-icon">🔍</div>
                        <h3 className="como-funciona-card-title">Búsqueda simple</h3>
                        <p className="como-funciona-card-description">Usa la barra de búsqueda para encontrar los servicios que necesitas.</p>
                    </div>
                    <div className="como-funciona-card">
                        <div className="como-funciona-icon">✔️</div>
                        <h3 className="como-funciona-card-title">Selección simple</h3>
                        <p className="como-funciona-card-description">Elige un servicio en base a las calificaciones y comentarios.</p>
                    </div>
                    <div className="como-funciona-card">
                        <div className="como-funciona-icon">💳</div>
                        <h3 className="como-funciona-card-title">Pago fácil</h3>
                        <p className="como-funciona-card-description">Paga de manera segura con nuestras opciones de pago.</p>
                    </div>
                </div>
            </div>

            {/* Segunda sección de información */}
            <div className="comunidad-container">
                <h2 className="comunidad-title">Comunidad</h2>
                <div className="comunidad-cards-container">
                    <div className="comunidad-card">
                        <div className="comunidad-icon">👥</div>
                        <h3 className="comunidad-card-title">Centro de la comunidad</h3>
                        <p className="comunidad-card-description">Descubre oportunidades para crear conexiones significativas y desarrollar tu crecimiento profesional.</p>
                    </div>
                    <div className="comunidad-card">
                        <div className="comunidad-icon">💬</div>
                        <h3 className="comunidad-card-title">Foro</h3>
                        <p className="comunidad-card-description">Únete a la conversación global para compartir consejos, mejores prácticas y apoyo entre pares.</p>
                    </div>
                    <div className="comunidad-card">
                        <div className="comunidad-icon">📖</div>
                        <h3 className="comunidad-card-title">Blog</h3>
                        <p className="comunidad-card-description">Visita el blog para descubrir cómo desarrollar tu actividad o carrera de freelance.</p>
                    </div>
                    <div className="comunidad-card">
                        <div className="comunidad-icon"><i className='bi bi-tiktok'></i></div>
                        <h3 className="comunidad-card-title">TikTok</h3>
                        <p className="comunidad-card-description">¡Síguenos para recibir consejos, inspiración y divertirte!</p>
                    </div>
                </div>
            </div>
            
            {/* Tercera sección de información */}
            <div className="busquidy-container">
                <div className="busquidy-header">
                    <h1>Busquidy<i className="bi bi-plus"></i></h1>
                    <h2 className="busquidy-title">
                        La solución freelance <span className="highlight">premium</span> para empresas
                    </h2>
                </div>
                <div className="busquidy-content">
                    <div className="busquidy-features">
                        <Feature
                            title="Expertos de contratación especializados"
                            description="Cuenta con un gestor de cuentas para encontrar el profesional adecuado y resolver todas las necesidades de tu proyecto."
                        />
                        <Feature
                            title="Satisfacción garantizada"
                            description="Haz pedidos con seguridad y con reembolsos garantizados en caso de entregas insatisfactorias."
                        />
                        <Feature
                            title="Herramientas de gestión avanzada"
                            description="Integra a los freelancers en tu equipo y en tus proyectos sin problemas."
                        />
                        <Feature
                            title="Modelos de pago flexibles"
                            description="Paga por proyecto o elige las tarifas por hora para facilitar la colaboración a largo plazo."
                        />
                    </div>
                    <div className="busquidy-image-section">
                        <img
                            src="ruta_de_la_imagen.jpg"
                            alt="Representación visual"
                            className="busquidy-image"
                        />
                        <div className="project-status">
                            <p>Project Status</p>
                            <p>92% | 4 steps out of 5</p>
                        </div>
                    </div>
                </div>
                <button className="busquidy-button" onClick={openModalPagarSuscripcion}>Probar ahora</button>
            </div>
            {showModalPagarSuscripcion && (
                <ModalPagoSuscripcion 
                    closeModal={() => setShowModalPagarSuscripcion(false)} 
                    tipo_usuario={tipo_usuario}
                    id_usuario={id_usuario} 
                />
            )}

            {showMessageModal && (
                <MessageModal message={message} closeModal={closeMessageModal} />
            )}

            <FAQSection />

        </div>
        
        
    );
};

function Feature({ title, description }) {
    return (
        <div className="feature">
            <span className="feature-icon">✔️</span>
            <div>
                <h4 className="feature-title">{title}</h4>
                <p className="feature-description">{description}</p>
            </div>
        </div>
    );
}


export default InfoSectionHome;
