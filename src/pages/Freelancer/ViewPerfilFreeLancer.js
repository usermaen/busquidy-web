import React, {useState, useEffect} from "react";
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Home/Navbar";
import NavbarFreeLancer from "../../components/FreeLancer/NavbarFreeLancer";
import InfoCreatePerfil from "../../components/FreeLancer/InfoCreatePerfil";
import CreatePerfilFreelancer from "../../components/FreeLancer/CreatePerfilFreelancer";
import CreateProfileCv from "../../components/FreeLancer/CreateProfileCv";
import PerfilFreelancerMiniCard from "../../components/FreeLancer/PerfilFreelancerMiniCard";
import ButtonViewPerfil from "../../components/FreeLancer/ButtonViewPerfil";
import LoadingScreen from "../../components/LoadingScreen"; 
import Footer from "../../components/Home/Footer";

function ViewPerfilFreeLancer() {
    // Estado para determinar si el usaurio está autenticado
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Estado para la pantalla de carga
    const [loading, setLoading] = useState(true);
    // Estado para los mensajes de logout
    const [logoutStatus, setLogoutStatus] = useState("");
    // Estado para el tipo de usuario
    const [userType, setUserType] = useState(null);
    // Estado para el id usuario
    const [id_usuario, setIdUsuario] = useState(null);
    const [isPerfilIncompleto, setIsPerfilIncompleto] = useState(null); 
    const navigate = useNavigate(); 

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');    
            setIsAuthenticated(!!token);
    
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    console.log("Decoded token:", decoded);
                    setUserType(decoded.tipo_usuario);
                    setIdUsuario(decoded.id_usuario);

                    // Verifica el perfil una vez que id_usuario está disponible
                    if (decoded.id_usuario) {
                        fetchPerfilFreelancer(decoded.id_usuario);
                        console.log('ID de usuario correcto:', decoded.id_usuario);
                    }
                    
                } catch (error) {
                    console.error("Error decodificando el token:", error);
                }
            }
    
            setTimeout(() => {
                setLoading(false);
            }, 500);
        };
    
        window.addEventListener('storage', checkAuth);
        checkAuth();
    
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const fetchPerfilFreelancer = async (id_usuario) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/freelancer/${id_usuario}`);
            console.log("Se verificó el perfil freelancer");
            setIsPerfilIncompleto(response.data.isPerfilIncompleto);
        } catch (error) {
            console.error("Error al verificar el perfil freelancer:", error);
        }
    };
    
    useEffect(() => {
        if (id_usuario) {
            console.log("ID usuario actualizado:", id_usuario);
        }
    }, [id_usuario]); // Este useEffect se ejecuta cuando id_usuario cambia
    

    const handleLogout = () => {
        setLoading(true); // Muestra la pantalla de carga al cerrar sesión
        setLogoutStatus("Cerrando sesión...");
        setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("correo");
            setIsAuthenticated(false);
            setUserType(null);
            setLogoutStatus("Sesión cerrada");
            setTimeout(() => {
                setLoading(false); // Oculta la pantalla de carga antes de redirigir
                navigate("/");
            }, 1000); // Reduce este timeout si es necesario
        });
    };

    const renderNavbar = () => {
        if (!isAuthenticated) {
            return <Navbar />;
        }
        if (userType === "freelancer") {
            return <NavbarFreeLancer onLogout={handleLogout} />;
        }
        return <Navbar />;
    };
    
    return (
        <div style={{marginTop:"100px"}}>
            {/* Muestra la pantalla de carga si está activa */}
            {loading && <LoadingScreen />} 

            {renderNavbar()}

            {isAuthenticated && (
                <>
                    {isPerfilIncompleto === null ? ( 
                        <p>Loading profile data...</p>
                    ) : isPerfilIncompleto ? (
                        <>
                            <InfoCreatePerfil />
                            <CreatePerfilFreelancer userType={userType} id_usuario={id_usuario} />
                            <CreateProfileCv id_usuario={id_usuario} />
                        </>
                    ) : (
                        <>
                            <PerfilFreelancerMiniCard userType={userType} id_usuario={id_usuario} />
                            <ButtonViewPerfil />
                        </>
                    )}
                </>
            )}

            <Footer />

            {/* Mensaje de estado de cierre de sesión */}
            {logoutStatus && (
                <div className="logout-status-msg">
                    {logoutStatus}
                </div>
            )}
        </div>
    );
};

export default ViewPerfilFreeLancer;