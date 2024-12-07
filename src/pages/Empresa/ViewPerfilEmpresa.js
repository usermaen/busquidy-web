import React, {useState, useEffect} from "react";
import {jwtDecode} from 'jwt-decode';  // Make sure you import the default function
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Home/Navbar";
import NavbarEmpresa from "../../components/Empresa/NavbarEmpresa";
import Footer from "../../components/Home/Footer";
import PerfilEmpresaCard from "../../components/Empresa/PerfilEmpresaCard";
import CreatePerfilEmpresa from "../../components/Empresa/CreatePerfilEmpresa";
import LoadingScreen from "../../components/LoadingScreen"; 

function ViewPerfilEmpresa() {
    // Estado para determinar si el usuario está autenticado
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Estado para la pantalla de carga
    const [loading, setLoading] = useState(true);
    // Estado para los mensajes de logout
    const [logoutStatus, setLogoutStatus] = useState("");
    // Estado para el tipo de usuario
    const [userType, setUserType] = useState("");
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
                        fetchPerfilEmpresa(decoded.id_usuario);
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

    const fetchPerfilEmpresa = async (id_usuario) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/empresa/${id_usuario}`);
            console.log("Se verificó el perfil de la empresa");
            setIsPerfilIncompleto(response.data.isPerfilIncompleto);
        } catch (error) {
            console.error("Error al verificar el perfil de la empresa:", error);
        }
    };

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
        if (userType === "empresa") {
            return <NavbarEmpresa onLogout={handleLogout} />;
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
                        <CreatePerfilEmpresa userType={userType} id_usuario={id_usuario} />
                    ) : (
                        <PerfilEmpresaCard userType={userType} id_usuario={id_usuario} />
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
}

export default ViewPerfilEmpresa;
