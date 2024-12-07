import React, {useEffect, useRef, useState} from "react"
import "./NavbarFreeLancer.css";
import { Link, useLocation  } from "react-router-dom";
import ProfileCircle from "../ProfileCircle";
import 'bootstrap-icons/font/bootstrap-icons.css';


function NavbarFreeLancer({ onLogout}) {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para manejar la apertura/cierre del menú en dispositivos móviles
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // Estado para manejar la apertura del menú del perfil
    const profileMenuRef = useRef(null);


    // Ayuda Dropdown
    const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
    const [isIconRotated, setIsIconRotated] = useState(false); // Estado para la rotación del ícono

    const toggleHelpDropdown = () => {
        setIsHelpDropdownOpen(!isHelpDropdownOpen);
        setIsIconRotated(!isIconRotated); 
        console.log("Icon Rotated: ", !isIconRotated); // Para verificar el estado
    };

    // Función para alternar el estado del menú
    const toggleMenu = () =>  setIsMenuOpen(!isMenuOpen);

    // Función para alternar el estado del menú de perfil
    const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

    const isActive = (path) => location.pathname == path ? "active" : "";

    // Nueva función para obtener las iniciales del correo
    const getUserInitials = () => {
        const email = localStorage.getItem("correo") || "";
        const namePart = email.split("@")[0];
        return namePart.slice(0, 2).toUpperCase() || "NN";
    };

    const handleLogout = () => {
        onLogout(); // Llama a la función de logout que se pasa desde el componente padre
    };

    // Hook para cerrar el menú cuando se hace click afuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false); // Cierra el menú si el click es fuera de él
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileMenuRef]);

    return(
        <header className="navbar-freelancer">
            <div className="navbar-freelancer-content">
                <div className="navbar-freelancer-logo">
                    <Link to="/">
                        <img src="/images/Busquidy.png" useMap="#image-map" alt="logo"></img>
                    </Link>

                    {/* Botón del menú hamburguesa */}
                    <div className="navbar-freelancer-toggle">
                        <span className="menu-icon" onClick={toggleMenu}>&#9776;</span> {/* Asegúrate de que el botón llame a toggleMenu */}
                    </div>
                </div>
                {/* Enlaces del Navbar */}
                <nav className={`navbar-freelancer-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link className={isActive("/freelancer")} exact to="/freelancer" style={{color:"black"}}>FreeLancer</Link>
                    <Link className={isActive("/busquidypage")} to="/busquidypage" style={{color:"#06535794"}}>Busquidy<i className="bi bi-plus"></i></Link>
                    <Link className={isActive("/sobrenosotrospage")} to="/sobrenosotrospage" >Sobre Nosotros</Link>
                    <Link className={isActive("/comunidadpage")} to="#" >Comunidad</Link>
                    <div className="help-dropdown">
                        <button className="help-dropdown-btn" onClick={toggleHelpDropdown}>
                            ¡Ayuda! <i className={`bi bi-chevron-down ${isIconRotated ? 'rotated' : ''}`}></i>
                        </button>

                        {/* Desplegable de ayuda */}
                        {isHelpDropdownOpen && (
                            <div className="help-dropdown-content">
                                <Link to="/soporte-cliente">Soporte al Cliente</Link>
                                <Link to="/soporte-ia">Soporte IA</Link>
                                <Link to="/busquidy-guia">Busquidy Guía</Link>
                            </div>
                        )}
                    </div>
                </nav>

                <div className="navbar-freelancer-auth">
                <div className="profile-freelancer-icon" onClick={toggleProfileMenu}>
                    <ProfileCircle userInitials={getUserInitials()} />
                </div>

                <div className={`profile-freelancer-menu ${isProfileMenuOpen ? 'active' : ''}`} ref={profileMenuRef}>
                    <ul>
                            <li><Link to="/viewperfilfreelancer"><i className="bi bi-person"></i> Mi perfil</Link></li>
                            <li><Link to="/mypostulations"><i className="bi bi-file-earmark-text"></i> Mis postulaciones</Link></li>
                            <li><Link to="#"><i className="bi bi-arrow-up-right-circle"></i> Mejorar Busquidy<i className="bi bi-plus"></i></Link></li>
                            <li onClick={handleLogout} style={{cursor: "pointer"}}>
                                <i className="bi bi-box-arrow-right"></i> Cerrar sesión</li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default NavbarFreeLancer;