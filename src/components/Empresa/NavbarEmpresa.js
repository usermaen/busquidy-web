import React, { useState, useRef, useEffect } from "react";
import "./NavbarEmpresa.css";
import { Link, useLocation } from "react-router-dom";
import ProfileCircle from "../ProfileCircle";
import 'bootstrap-icons/font/bootstrap-icons.css';

function NavbarEmpresa({ onLogout }) {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    // Ayuda Dropdown
    const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
    const [isIconRotated, setIsIconRotated] = useState(false); // Estado para la rotación del ícono

    const toggleHelpDropdown = () => {
        setIsHelpDropdownOpen(!isHelpDropdownOpen);
        setIsIconRotated(!isIconRotated); 
        console.log("Icon Rotated: ", !isIconRotated); // Para verificar el estado
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
    const isActive = (path) => location.pathname === path ? "active" : "";

    const getUserInitials = () => {
        const email = localStorage.getItem("correo") || "";
        const namePart = email.split("@")[0];
        return namePart.slice(0, 2).toUpperCase() || "NN";
    };

    const handleLogout = () => {
        onLogout(); // Llama a la función de logout que se pasa desde el componente padre
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [profileMenuRef]);

    return (
        <header className="navbar-empresa">
            <div className="navbar-empresa-content">
                <div className="navbar-empresa-logo">
                    <Link to="/">
                        <img src="/images/Busquidy.png" alt="logo" />
                    </Link>
                    <div className="navbar-empresa-toggle">
                        <span className="menu-icon" onClick={toggleMenu}>&#9776;</span>
                    </div>
                </div>

                <nav className={`navbar-empresa-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link className={isActive("/empresa")} to="/empresa">Empresa</Link>
                    <Link className={isActive("/busquidypage")} to="/busquidypage">Busquidy<i className="bi bi-plus"></i></Link>
                    <Link className={isActive("/sobrenosotrospage")} to="/sobrenosotrospage">Sobre Nosotros</Link>
                    <Link className={isActive("/comunidad")} to="#">Comunidad</Link>
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

                <div className="navbar-empresa-auth">
                    <div className="profile-empresa-icon" onClick={toggleProfileMenu}>
                        <ProfileCircle userInitials={getUserInitials()} />
                    </div>

                    <div className={`profile-empresa-menu ${isProfileMenuOpen ? 'active' : ''}`} ref={profileMenuRef}>
                        <ul>
                            <li><Link to="/viewperfilempresa"><i className="bi bi-person"></i> Mi perfil</Link></li>
                            <li><Link to="/myprojects"><i className="bi bi-file-earmark-text"></i> Mis publicaciones</Link></li>
                            <li><Link to="#"><i className="bi bi-arrow-up-right-circle"></i> Mejorar Busquidy<i className="bi bi-plus"></i></Link></li>
                            <li onClick={handleLogout} style={{ cursor: "pointer" }}>
                                <i className="bi bi-box-arrow-right"></i> Cerrar sesión
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default NavbarEmpresa;
