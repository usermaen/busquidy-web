import React, { useState } from 'react';
import axios from 'axios';
import './ModalPublicarProyecto.css';

const ModalPublicarProyecto = ({ id_usuario, id_proyecto, closeModal, projectTitle = 'Publicación de Proyecto' }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [debug, setDebug] = useState(null);

    console.log('id_proyecto:', id_proyecto);
    console.log('id_usuario:', id_usuario);

    // Al inicio del componente
    console.log('Variables de entorno:', {
        REACT_APP_API_URL: process.env.REACT_APP_API_URL,
        REACT_APP_ENV: process.env.REACT_APP_ENV,
        NODE_ENV: process.env.NODE_ENV
    });

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);
    
            const paymentData = {
                amount: 10000,
                buyOrder: `BO-${id_proyecto}`,
                sessionId: `Session-${id_usuario}`,
            };
    
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/create_transaction_project`,
                paymentData,
                { headers: { 'Content-Type': 'application/json' } }
            );
    
            const { url, token } = response.data;
    
            if (!url || !token) {
                throw new Error('No se recibió URL o token de Webpay');
            }
    
            // Redirigir a Webpay con la URL de retorno correcta
            window.location.href = `${url}?token_ws=${token}`;
        } catch (error) {
            setError(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay-pay">
            <div className="modal-container-pay">
                <div className="modal-header-pay">
                    <h2 className="modal-title-pay">Publicar Proyecto</h2>
                    <button 
                        onClick={closeModal} 
                        className="modal-close-btn-pay"
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body-pay">
                    <div>
                        <p style={{fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem'}}>
                            Costo de publicación: $1000
                        </p>
                        <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                            Al publicar tu proyecto, será visible para todos los usuarios en la plataforma 
                            y los Freelancers registrados podran postular.
                        </p>
                    </div>

                    {error && (
                        <div className="error-message" style={{color: 'red', marginTop: '1rem'}}>
                            {error}
                        </div>
                    )}

                    {debug && (
                        <div className="debug-info" style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: '#f3f4f6',
                            borderRadius: '0.375rem'
                        }}>
                            <pre style={{fontSize: '0.75rem'}}>
                                {JSON.stringify(debug, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="modal-footer-pay">
                    <button
                        onClick={closeModal}
                        className="btn-secondary-pay"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="btn-primary-pay"
                    >
                        {loading ? (
                            <>
                                <svg 
                                    className="loading-spinner" 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor"
                                >
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                                Procesando...
                            </>
                        ) : 'Pagar y Publicar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalPublicarProyecto;