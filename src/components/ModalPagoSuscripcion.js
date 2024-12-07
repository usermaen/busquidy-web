import React, { useState } from 'react';
import axios from 'axios';
import './ModalPagoSuscripcion.css';

const PLANES = {
    freelancer: {
        mensual: {
            precio: 10000,
            beneficios: [
                'Recomendación de tu perfil a otras empresas',
                'Certificaciones por completar proyectos', 
            ]
        },
        anual: {
            precio: 25000,
            beneficios: [
                'Todos los beneficios del plan mensual',
                'Descuento del 20%', 
                'Tutorías personalizadas',
                'Acceso a cursos exclusivos'
            ]
        }
    },
    empresa: {
        mensual: {
            precio: 10000,
            beneficios: [
                'Recomendación de tus publicaciones',
                'Descuento de un 20% de cobro por publicación',
            ]
        },
        anual: {
            precio: 25000,
            beneficios: [
                'Recomendación de tus publicaciones',
                'Descuento de un 35% de cobro por publicación',
            ]
        }
    }
};

const ModalPagoSuscripcion = ({ id_usuario, tipo_usuario, closeModal }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [planSeleccionado, setPlanSeleccionado] = useState('mensual');
    const [metodoPago, setMetodoPago] = useState('webpay');

    const planesActuales = PLANES[tipo_usuario] || PLANES['freelancer'];

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError(null);
            const paymentData = {
                amount: planesActuales[planSeleccionado].precio,
                buyOrder: `SUB-${id_usuario}-${Date.now()}`,
                sessionId: `Session-${id_usuario}`,
                plan: planSeleccionado,
                tipoUsuario: tipo_usuario,
                metodoPago: metodoPago,
                returnUrl: `${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'}/`
            };
            
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/create_transaction_suscription`,
                paymentData,
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            const { url, token } = response.data;
            if (!url || !token) {
                throw new Error('No se recibió URL o token de Webpay');
            }
            window.location.href = `${url}?token_ws=${token}`;
        } catch (error) {
            console.error('Error completo:', error.response?.data || error.message);
            
            // Manejo específico para suscripción activa
            if (error.response?.data?.code === 'ACTIVE_SUBSCRIPTION_EXISTS') {
                setError('Ya tienes una suscripción activa. Cancela tu suscripción actual para continuar.');
            } else {
                setError(`Error: ${error.response?.data?.error || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-suscripcion">
            <div className="modal-suscripcion-contenido">
                <div className="modal-header">
                    <h2>Suscripción {tipo_usuario.charAt(0).toUpperCase() + tipo_usuario.slice(1)}</h2>
                    <button 
                        onClick={closeModal} 
                        className="modal-close-btn"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="error-mensaje">
                        {error}
                    </div>
                )}

                <div className="plan-selector">
                    <button 
                        onClick={() => setPlanSeleccionado('mensual')}
                        className={`plan-btn ${planSeleccionado === 'mensual' ? 'activo' : ''}`}
                    >
                        Plan Mensual
                    </button>
                    <button 
                        onClick={() => setPlanSeleccionado('anual')}
                        className={`plan-btn ${planSeleccionado === 'anual' ? 'activo' : ''}`}
                    >
                        Plan Anual
                    </button>
                </div>

                <div className="contenido-plan">
                    <div className="beneficios-plan">
                        <h3>Beneficios:</h3>
                        <ul>
                            {planesActuales[planSeleccionado].beneficios.map((beneficio, index) => (
                                <li key={index}>{beneficio}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="detalles-plan">
                        <div className="precio">
                            ${planesActuales[planSeleccionado].precio.toLocaleString()} CLP
                        </div>
                        <div className="detalle-adicional">
                            {planSeleccionado === 'mensual' 
                                ? 'Cobro mensual' 
                                : 'Ahorra hasta un 30%'}
                        </div>
                    </div>
                </div>

                <div className="selector-metodo-pago">
                    <select 
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                    >
                        <option value="webpay">Webpay</option>
                        <option value="transferencia">Transferencia Bancaria</option>
                    </select>
                </div>

                <div className="botones-modal">
                    <button 
                        onClick={closeModal} 
                        disabled={loading}
                        className="btn btn-cancelar"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handlePayment} 
                        disabled={loading}
                        className="btn btn-pagar"
                    >
                        {loading 
                            ? 'Procesando...' 
                            : `Pagar $${planesActuales[planSeleccionado].precio.toLocaleString()}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalPagoSuscripcion;