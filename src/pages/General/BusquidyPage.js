import React, { useEffect, useState } from "react";
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Home/Navbar";
import NavbarFreeLancer from "../../components/FreeLancer/NavbarFreeLancer";
import NavbarEmpresa from "../../components/Empresa/NavbarEmpresa";
import Footer from "../../components/Home/Footer";
import LoadingScreen from "../../components/LoadingScreen";

function BusquidyPage() {
    // Estado para determinar si el usuario está autenticado
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Estado para la pantalla de carga
    const [loading, setLoading] = useState(true);
    // Estado para los mensajes de logout
    const [logoutStatus, setLogoutStatus] = useState("");
    // Estado para el tipo de usuario: "empresa" o "freelancer"
    const [userType, setUserType] = useState("");
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

    // Renderización condicional del navbar según el tipo de usuario
    const renderNavbar = () => {
        if (!isAuthenticated) {
            return <Navbar />;
        }
        if (userType === "empresa") {
            return <NavbarEmpresa onLogout={handleLogout} />;
        }
        if (userType === "freelancer") {
            return <NavbarFreeLancer onLogout={handleLogout} />;
        }
        // En caso de que no haya un tipo de usuario válido (prevención)
        return <Navbar />;
    };

    return (
        <div style={{ marginTop: "80px" }}>
            {/* Pantalla de carga */}
            {loading && <LoadingScreen />}

            {/* Renderiza el navbar correcto */}
            {renderNavbar()}

            <Footer />

            {/* Mensaje de estado de cierre de sesión */}
            {logoutStatus && (
                <div className="logout-status">
                    {logoutStatus}
                </div>
            )}
        </div>
    );
}

export default BusquidyPage;
