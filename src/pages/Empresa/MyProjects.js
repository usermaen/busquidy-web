import React, { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Home/Navbar";
import NavbarEmpresa from "../../components/Empresa/NavbarEmpresa";
import NavbarFreeLancer from "../../components/FreeLancer/NavbarFreeLancer";
import ViewProjects from "../../components/Empresa/ViewProjects";
import Footer from "../../components/Home/Footer";
import LoadingScreen from "../../components/LoadingScreen"; 
import "./MyProjects.css";

function MyProjects() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [logoutStatus, setLogoutStatus] = useState("");
    const [userType, setUserType] = useState(null);
    const [id_usuario, setIdUsuario] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

     // Verificar autenticación
     useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');    
            setIsAuthenticated(!!token);

            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setUserType(decoded.tipo_usuario);
                    setIdUsuario(decoded.id_usuario);
                } catch (error) {
                    console.error("Error decodificando el token:", error);
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            }

            setLoading(false);
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    // Manejar respuesta de pago
    useEffect(() => {
         const handlePaymentResponse = async () => {
        const searchParams = new URLSearchParams(location.search);
        const token_ws = searchParams.get("token_ws");
        const TBK_TOKEN = searchParams.get("TBK_TOKEN");

        if (!token_ws && !TBK_TOKEN) return;

        try {
            setLoading(true);

            if (TBK_TOKEN) {
                setPaymentStatus({
                    success: false,
                    message: "El pago fue cancelado.",
                    type: 'CANCELLED'
                });
            } else {
                try {
                    const response = await axios.post(
                        `${process.env.REACT_APP_API_URL}/commit_transaction`,
                        { token: token_ws }
                    );

                    // Manejar respuestas de diferentes tipos de transacciones
                    switch (response.data.status) {
                        case "APPROVED":
                            setPaymentStatus({
                                success: true,
                                message: response.data.message || "El pago se procesó exitosamente.",
                                type: response.data.type,
                                details: {
                                    amount: response.data.amount,
                                    buyOrder: response.data.buyOrder,
                                    ...(response.data.type === 'SUBSCRIPTION' && {
                                        plan: response.data.plan,
                                        subscriptionStart: response.data.subscriptionStart,
                                        subscriptionEnd: response.data.subscriptionEnd
                                    }),
                                    ...(response.data.type === 'PROJECT_PUBLICATION' && {
                                        projectId: response.data.projectId
                                    })
                                }
                            });
                            break;

                        case "REJECTED":
                            setPaymentStatus({
                                success: false,
                                message: response.data.message || "El pago fue rechazado.",
                                type: response.data.type,
                                reason: response.data.reason,
                                details: {
                                    amount: response.data.amount,
                                    buyOrder: response.data.buyOrder
                                }
                            });
                            break;

                        case "ERROR":
                            setPaymentStatus({
                                success: false,
                                message: response.data.error || "Ocurrió un error inesperado.",
                                type: 'ERROR',
                                code: response.data.code,
                                details: response.data.details
                            });
                            break;

                        default:
                            setPaymentStatus({
                                success: false,
                                message: "Respuesta inesperada del servidor.",
                                type: 'UNKNOWN',
                                details: response.data
                            });
                    }

                } catch (error) {
                    // Manejo específico para transacciones en progreso
                    if (error.response && error.response.data.code === 'TRANSACTION_IN_PROGRESS') {
                        setPaymentStatus({
                            success: false,
                            message: "La transacción ya está siendo procesada. Por favor, espera un momento o contacta a soporte.",
                            type: 'IN_PROGRESS',
                            code: error.response.data.code,
                            retryAfter: 5 * 60 // 5 minutos
                        });
                    }else {
                            // Manejo de otros tipos de errores
                            console.error('Payment processing error:', error.response?.data || error);
                            
                            setPaymentStatus({
                                success: false,
                                message: error.response?.data?.error || 
                                         "Pago rechazado, por favor intentelo de nuevo en unos minutos.",
                                type: 'NETWORK_ERROR',
                                code: error.response?.data?.code || 'UNKNOWN_ERROR',
                                details: {
                                    fullError: error.response?.data || error.message,
                                    status: error.response?.status
                                }
                            });
                        }
                    }
                }

                // Limpiar parámetros de la URL
                const newURL = `${window.location.origin}${window.location.pathname}`;
                window.history.replaceState({}, document.title, newURL);

            } catch (generalError) {
                // Manejo de errores generales
                console.error('General payment error:', generalError);
                
                setPaymentStatus({
                    success: false,
                    message: "Ocurrió un error inesperado. Por favor, intenta nuevamente o contacta a soporte.",
                    type: 'GENERAL_ERROR',
                    details: generalError
                });
            } finally {
                setLoading(false);

                // Limpiar el mensaje de estado después de 5 segundos
                setTimeout(() => setPaymentStatus(null), 5000);
            }
        };

        handlePaymentResponse();
    }, [location.search]);
    
    // Cargar proyectos cuando cambie el id_usuario
    useEffect(() => {
        if (id_usuario) {
        }
    }, [id_usuario]);

    // Manejar cierre de sesión
    const handleLogout = () => {
        setLoading(true);
        setLogoutStatus("Cerrando sesión...");
        
        setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("correo");
            setIsAuthenticated(false);
            setUserType(null);
            setLogoutStatus("Sesión cerrada");
            
            setTimeout(() => {
                setLoading(false);
                navigate("/");
            }, 500);
        }, 500);
    };

    // Renderizar navbar según tipo de usuario
    const renderNavbar = () => {
        if (!isAuthenticated) return <Navbar />;
        if (userType === "empresa") return <NavbarEmpresa onLogout={handleLogout} />;
        if (userType === "freelancer") return <NavbarFreeLancer onLogout={handleLogout} />;
        return <Navbar />;
    };

    return (
        <div style={{ marginTop: "80px" }}>
            {loading && <LoadingScreen />}

            {renderNavbar()}

            <div className="background-color-myproject">
                {userType && userType !== "empresa" ? (
                    <div 
                        style={{
                            padding: '3rem',
                            margin: '5.4rem auto',
                            maxWidth: '600px',
                            marginTop:'100px',
                            textAlign: 'center',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '5px',
                            color: '#721c24'
                        }}
                    >
                        <h2 style={{ marginBottom: '1rem' }}>Acceso Restringido</h2>
                        <p>Para utilizar esta función necesitas ser un usuario de tipo empresa.</p>
                        <p>Si eres un freelancer o usuario regular, por favor regístrate como empresa para acceder a estas funcionalidades.</p>
                    </div>
                ) : (
                    <>
                        <ViewProjects 
                            userType={userType} 
                            id_usuario={id_usuario}
                        />
                    </>
                )}

                {paymentStatus && !loading && (
                    <div
                        className={`payment-status ${paymentStatus.success ? "success" : "error"}`}
                        style={{
                            position: 'fixed',
                            top: '100px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            padding: '1rem',
                            margin: '1rem 0',
                            borderRadius: '5px',
                            backgroundColor: paymentStatus.success ? "#d4edda" : "#f8d7da",
                            color: paymentStatus.success ? "#155724" : "#721c24",
                            zIndex: 1000,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            width: '80%',
                            maxWidth: '500px',
                            textAlign: 'center'
                        }}
                    >
                        {paymentStatus.message}
                    </div>
                )}

                {logoutStatus && (
                    <div className="logout-status-msg">
                        {logoutStatus}
                    </div>
                )}

                <Footer />
            </div>
        </div>
    );
}

export default MyProjects;