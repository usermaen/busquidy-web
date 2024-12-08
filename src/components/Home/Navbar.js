import React, { useState, useEffect } from "react";
import "./Navbar.css";
import Modal from "./Modal";
import { Link, useLocation, useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';

function Navbar() {
    // Estados para almacenar el correo, contraseña, tipo de usuario, mensaje de error, y estado de carga
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState("");
    const [errorTipoUsuario, setErrorTipoUsuario] = useState(false);
    const [errorCorreo, setErrorCorreo] = useState(false);
    const [errorContraseña, setErrorContraseña] = useState(false);
    const [correoError, setCorreoError] = useState("");
    const [contraseñaError, setContraseñaError] = useState("");
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState(''); // 'success' o 'error'
    const [showToast, setShowToast] = useState(false);


    // Hooks de React Router para navegar entre páginas y obtener la ubicación actual
    const navigate = useNavigate();
    const location = useLocation();

    // Estados para controlar el menú y los modales
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showSecondaryModal, setShowSecondaryModal] = useState(false);
    const [showSecondaryRegisterModal, setShowSecondaryRegisterModal] = useState(false);

    // Ayuda Dropdown
    const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
    const [isIconRotated, setIsIconRotated] = useState(false); // Estado para la rotación del ícono

    const toggleHelpDropdown = () => {
        setIsHelpDropdownOpen(!isHelpDropdownOpen);
        setIsIconRotated(!isIconRotated); 
        console.log("Icon Rotated: ", !isIconRotated); // Para verificar el estado
    };

    // Función que determina si la ruta actual coincide exactamente con una de las dadas y devuelve la clase "active"
    const isActive = (path) => location.pathname === path ? "active" : "";


    // Determina el texto y enlace visible en función de la ruta actual
    let link;
    if (location.pathname === "/" || location.pathname === "/busquidypage" || location.pathname === "/sobrenosotrospage") {

        link = <Link className={isActive("/")} exact="true" to="/" style={{ color: "black" }}>Inicio</Link>;

    } else if (location.pathname === "/freelancer" || location.pathname === "/projectlist" || location.pathname === "/mypostulations" 
        || location.pathname === "/viewperfilfreelancer" || location.pathname === "/viewmoredetailsfreelancer") {

        link = <Link className={isActive("/freelancer")} to="/freelancer" style={{ color: "black" }}>Freelancer</Link>;

    } else if (location.pathname === "/empresa" || location.pathname === "/findfreelancer" || location.pathname === "/myprojects" 
        || location.pathname === "/viewperfilempresa") {

        link = <Link className={isActive("/empresa")} to="/empresa" style={{ color: "black" }}>Empresa</Link>;
    };

    // Función para limpiar el estado del formulario y errores
    const resetModalState = () => {
        setCorreo('');
        setContraseña('');
        setTipoUsuario('');
        setError('');
        setSuccess('');
        setCorreoError('');
        setContraseñaError('');
        setErrorTipoUsuario(false);
        setLoading(false);
    };
    
    // Función para manejar el registro de un usuario
    const handleRegister = async () => {
        let hasError = false;

        if (!tipoUsuario) {
            setErrorTipoUsuario(true);
            hasError = true;
        } else {
            setErrorTipoUsuario(false);
        }

        if (!correo || !/\S+@\S+\.\S+/.test(correo)) {
            setCorreoError("Por favor, ingresa un correo válido");
            hasError = true;
        } else {
            setCorreoError('');
        }

        if (!contraseña || contraseña.length < 6) {
            setContraseñaError("La contraseña debe tener al menos 6 caracteres");
            hasError = true;
        } else {
            setContraseñaError('');
        }

        if (hasError) return;

        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contraseña, tipo_usuario: tipoUsuario }),
            });

            const data = await response.json();

            if (response.ok) {
                setToastMessage("Usuario registrado exitosamente");
                setToastType("success");
                setShowToast(true);
            
                setTimeout(() => {
                    handleCloseSecondaryRegisterModal(); // Cierra el modal y limpia los datos
                    setShowToast(false); // Oculta el mensaje
                }, 2000); // Duración del mensaje
            } else {
                setToastMessage(data.error || "Error al registrar usuario");
                setToastType("error");
                setShowToast(true);
            
                setTimeout(() => {
                    setShowToast(false); // Oculta el mensaje automáticamente
                }, 2000); // Duración del mensaje
            }            
        } catch (error) {
            console.error("Error de red:", error);
            setError("Error en la conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar el inicio de sesión de un usuario
    const handleLogin = async () => {
        let hasError = false;

        if (!correo) {
            setCorreoError("Por favor, ingresa tu correo");
            hasError = true;
        } else if (!/\S+@\S+\.\S+/.test(correo)) {
            setCorreoError("Ingresa un correo válido");
            hasError = true;
        } else {
            setCorreoError('');
        }

        if (!contraseña) {
            setContraseñaError("Por favor, ingresa tu contraseña");
            hasError = true;
        } else if (contraseña.length < 6) {
            setContraseñaError("La contraseña debe tener al menos 6 caracteres");
            hasError = true;
        } else {
            setContraseñaError('');
        }

        if (hasError) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contraseña }),
            });

            const data = await response.json();

            if (response.ok) {
                const { token, tipo_usuario } = data;

                localStorage.setItem('token', token);
                localStorage.setItem('tipo_usuario', tipo_usuario);
                localStorage.setItem('correo', correo);

                handleCloseSecondaryModal(); // Cierra el modal y limpia los datos

                if (tipo_usuario?.toLowerCase() === 'empresa') {
                    navigate('/empresa');
                } else if (tipo_usuario?.toLowerCase() === 'freelancer') {
                    navigate('/freelancer');
                } else {
                    setError("Tipo de usuario desconocido");
                }
            } else {
                setError(data.error || "Error al iniciar sesión");
            }
        } catch (error) {
            console.error("Error de red: ", error);
            setError("Error de red: Intenta de nuevo");
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener datos protegidos desde la API
    const fetchProtectedData = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3001/api/protected-route', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
    
            console.log("Response headers:", response.headers);
            
            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.json();
                console.log("Datos protegidos: ", data);
            } else if (!response.ok) {
                console.error("No autorizado. Error:", response.status);
            } else {
                console.error("La respuesta no es JSON válida.");
            }
        } catch (error) {
            console.error("Error de red al acceder a la ruta protegida:", error);
        }
    };    

    // useEffect que ejecuta fetchProtectedData cuando el componente se monta
    useEffect(() => {
        // fetchProtectedData();
    }, []);

    // Alterna el estado de apertura del menú
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Manejadores para abrir y cerrar los diferentes modales de la aplicación
    const handleOpenLoginModal = () => {
        setShowRegisterModal(false);
        setShowSecondaryRegisterModal(false);
        setShowSecondaryModal(false);
        setShowLoginModal(true);  // Abre el modal de inicio de sesión
    };
    const handleCloseLoginModal = () => setShowLoginModal(false);  // Cierra el modal de inicio de sesión

    const handleOpenSecondaryModal = () => {
        setShowLoginModal(false);
        setShowSecondaryRegisterModal(false);
        setShowSecondaryModal(true);  // Abre el modal secundario
    };

    // Función para cerrar el modal secundario de inicio de sesión
    const handleCloseSecondaryModal = () => {
        resetModalState();
        setShowSecondaryModal(false);
    };

    const handleOpenRegisterModal = () => {
        setShowLoginModal(false);
        setShowSecondaryModal(false);
        setShowSecondaryRegisterModal(false);
        setShowRegisterModal(true);  // Abre el modal de registro
    };
    const handleCloseRegisterModal = () => setShowRegisterModal(false);  // Cierra el modal de registro

    const handleOpenSecondaryRegisterModal = () => {
        setShowRegisterModal(false);
        setShowSecondaryModal(false);
        setShowSecondaryRegisterModal(true);  // Abre el modal de registro secundario
    };

    // Función para cerrar el modal secundario de registro
    const handleCloseSecondaryRegisterModal = () => {
        resetModalState();
        setShowSecondaryRegisterModal(false);
    };
    
    return (
        <header className="navbar">
            <div className="navbar-general-content">
                {/* Logo */}
                <div className="navbar-logo">
                    <Link to="/">
                        <img src="/images/Busquidy.png" useMap="#image-map" alt="logo" />
                    </Link>
                    <div className="navbar-toggle">
                        <span className="menu-icon" onClick={toggleMenu}>&#9776;</span>
                    </div>
                </div>

                {/* Links del Navbar */}
                <nav className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    {link}

                    <Link className={isActive("/busquidypage")} to="/busquidypage" style={{ color: "#06535794" }}>Busquidy<i className="bi bi-plus"></i></Link>
                    <Link className={isActive("/sobrenosotrospage")} to="/sobrenosotrospage">Sobre Nosotros</Link>
                    <Link className={isActive("/comunidadpage")} to="#">Comunidad</Link>
                    
                    <div className="help-dropdown">
                        <button className="help-dropdown-btn" onClick={toggleHelpDropdown}>
                            ¡Ayuda! <i className={`bi bi-chevron-down ${isIconRotated ? 'rotated' : ''}`}></i>
                        </button>

                        {/* Desplegable de ayuda */}
                        {isHelpDropdownOpen && (
                            <div className="help-dropdown-content">
                                <Link className={isActive("/soporte-cliente")} to="/soporte-cliente">Soporte al Cliente</Link>
                                <Link className={isActive("/soporte-ia")} to="/soporte-ia">Soporte IA</Link>
                                <Link className={isActive("/busquidy-guia")} to="/busquidy-guia">Busquidy Guía</Link>
                            </div>
                        )}
                    </div>
                </nav>

                <div className={`navbar-auth ${isMenuOpen ? 'active' : ''}`}>
                    {/* Botón para mostrar el modal login */}
                    <button className="btn" onClick={handleOpenLoginModal}>Iniciar sesión</button>

                    {/* Modal de inicio de sesión */}
                    <Modal show={showLoginModal} onClose={handleCloseLoginModal} dismissOnClickOutside={true}>
                        <div className="modal-split">
                            <div className="modal-left">
                                <h2>El camino a el éxito comienza contigo aquí</h2>
                                <ul>
                                    <li>Diversas categorías para buscar</li>
                                    <li>Trabajo de calidad en tus proyectos</li>
                                    <li>Acceso a joven talento profesional</li>
                                </ul>
                            </div>
                            <div className="modal-right">
                                <h2>Inicia sesión con tu cuenta</h2>
                                <p>¿No tienes una cuenta? <a href="#" onClick={handleOpenRegisterModal}> Registrate aquí</a></p>
                                <button 
                                    style={{ width: "400px", marginLeft: "20px" }} 
                                    onClick={handleOpenSecondaryModal}>
                                    <img 
                                        src="/images/email.svg" 
                                        alt="Email" 
                                        style={{ height: "20px", marginRight: "10px" }} 
                                    />
                                    Continuar con Correo Electrónico
                                </button>
                                <button 
                                    style={{ width: "400px", marginLeft: "20px" }}
                                    className="google">
                                    <img 
                                        src="/images/google.svg.svg" 
                                        alt="Google" 
                                        style={{ height: "20px", marginRight: "10px" }} 
                                    />
                                    Continuar con Google
                                </button>
                                <button 
                                    style={{ width: "400px", marginLeft: "20px" }}
                                    className="microsoft">
                                    <img 
                                        src="/images/microsoft.svg" 
                                        alt="Microsoft" 
                                        style={{ height: "20px", marginRight: "10px" }} 
                                    />
                                    Continuar con Microsoft
                                </button>
                                <button 
                                    style={{ width: "400px", marginLeft: "20px" }}
                                    className="apple">
                                    <img 
                                        src="/images/apple.svg" 
                                        alt="Apple" 
                                        style={{ height: "20px", marginRight: "10px" }} 
                                    />
                                    Continuar con Apple
                                </button>
                                <div className="divider-wrapper">
                                    <div className="divider">
                                        <span >O</span>
                                    </div>
                                </div>
                                <div className="terms-container">
                                    <p>Al unirte, aceptas los <a href="#">Términos de servicio</a> de la plataforma, así como recibir correos electrónicos ocasionales. Lee nuestra <a href="#">Política de privacidad</a> para saber cómo utilizamos tus datos personales.</p>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    {/* Modal secundario de inicio de sesión */}
                    <Modal show={showSecondaryModal} onClose={handleCloseSecondaryModal} dismissOnClickOutside={true}>
                        <div className="modal-split">
                            <div className="modal-left">
                                <h2>Continuar con Correo Electrónico</h2>
                                <ul>
                                    <li>Inicio de sesión seguro</li>
                                    <li>Acceso fácil y rápido</li>
                                    <li>Protegeremos tus datos</li>
                                </ul>
                            </div>
                            <div className="modal-right">
                                <button
                                    type="button"
                                    style={{ width: "150px", border: "none" }}
                                    className="back-button"
                                    onClick={handleOpenLoginModal}
                                >
                                    ← volver
                                </button>

                                <h3>Ingresa tu correo y contraseña</h3>
                                <div className="login-form">
                                    <div className="input-container">
                                        <input
                                            type="email"
                                            placeholder="Correo Electrónico"
                                            value={correo}
                                            onChange={(e) => setCorreo(e.target.value)}
                                            style={{ marginBottom:"auto", borderColor: correoError ? "red" : "" }}
                                        />
                                        {correoError && <p style={{ color: "red", fontSize: "12px", marginLeft:"20px" }}>{correoError}</p>}
                                    </div>
                                    <div className="input-container">
                                        <input
                                            type="password"
                                            placeholder="Contraseña"
                                            value={contraseña}
                                            onChange={(e) => setContraseña(e.target.value)}
                                            style={{ marginBottom:"auto", borderColor: contraseñaError ? "red" : "" }}
                                        />
                                        {contraseñaError && <p style={{ color: "red", fontSize: "12px", marginLeft:"20px" }}>{contraseñaError}</p>}
                                    </div>
                                </div>

                                <a href="#" style={{ marginBottom: "20px" }}>¿Olvidaste tu contraseña?</a>
                                <button
                                    className="primary"
                                    onClick={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                                </button>

                                <p>¿No tienes una cuenta? <a href="#" onClick={handleOpenRegisterModal}>Regístrate</a></p>
                            </div>
                        </div>
                    </Modal>

                    {/* Botón para mostrar el modal register*/}
                    <button className="btn primary" onClick={handleOpenRegisterModal}>Registrarse</button>

                    {/* Modal de registro */}
                    <Modal show={showRegisterModal} onClose={handleCloseRegisterModal} dismissOnClickOutside={true}>
                        <div className="modal-split">
                            <div className="modal-left">
                                <h2>El camino a el éxito comienza contigo aquí</h2>
                                <ul>
                                    <li>Diversas categorías para buscar</li>
                                    <li>Trabajo de calidad en tus proyectos</li>
                                    <li>Acceso a joven talento profesional</li>
                                </ul>
                            </div>
                            <div className="modal-right">
                                <h2>Crea tu cuenta</h2>
                                <p>¿Ya tienes una cuenta? <a href="#" onClick={handleOpenLoginModal}> Iniciar sesión</a></p>
                                <button 
                                    style={{ width: "400px", marginLeft: "20px" }} 
                                    onClick={handleOpenSecondaryRegisterModal}>
                                    <img 
                                        src="/images/email.svg" 
                                        alt="Email" 
                                        style={{ height: "20px", marginRight: "10px" }} 
                                    />
                                    Continuar con Correo Electrónico
                                </button>
                                <button 
                                
                                    style={{ width: "400px", marginLeft: "20px" }}
                                    className="google">
                                    <img 
                                        src="/images/google.svg.svg" 
                                        alt="Google" 
                                        style={{ height: "20px", marginRight: "10px" }} 
                                    />
                                    Continuar con Google
                                </button>
                                <button 
                                    style={{ width: "400px", marginLeft: "20px" }}
                                    className="microsoft">
                                    <img 
                                        src="/images/microsoft.svg" 
                                        alt="Microsoft" 
                                        style={{ height: "20px", marginRight: "10px" }} 
                                    />
                                    Continuar con Microsoft
                                </button>
                                <button 
                                    style={{ width: "400px", marginLeft: "20px" }}
                                    className="apple">
                                    <img 
                                        src="/images/apple.svg" 
                                        alt="Apple" 
                                        style={{ height: "20px", marginRight: "10px" }} 
                                    />
                                    Continuar con Apple
                                </button>
                                <div className="divider-wrapper">
                                    <div className="divider">
                                        <span >O</span>
                                    </div>
                                </div>
                                <div className="terms-container">
                                    <p>Al unirte, aceptas los <a href="#">Términos de servicio</a> de la plataforma, así como recibir correos electrónicos ocasionales. Lee nuestra <a href="#">Política de privacidad</a> para saber cómo utilizamos tus datos personales.</p>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    {/* Modal secundario de registro */}
                    <Modal show={showSecondaryRegisterModal} onClose={handleCloseSecondaryRegisterModal} dismissOnClickOutside={true}>
                        <div className="modal-split">
                            <div className="modal-left">
                                <h2>Continuar con Correo Electrónico</h2>
                                <ul>
                                    <li>Registro fácil y rápido</li>
                                    <li>Acceso seguro a nuestra plataforma</li>
                                    <li>Tu privacidad es nuestra prioridad</li>
                                </ul>
                            </div>
                            <div className="modal-right">
                                <button style={{ width: "150px", border: "none" }} className="back-button" onClick={handleOpenRegisterModal}>← volver</button>
                                <h3>Ingresa tu correo, contraseña y tipo de usuario</h3>

                                {/* Campo Tipo de Usuario */}
                                <div className="register-form">
                                    <select 
                                        id="tipoUsuario" 
                                        name="tipoUsuario" 
                                        value={tipoUsuario} 
                                        onChange={(e) => setTipoUsuario(e.target.value)}
                                        style={{ borderColor: errorTipoUsuario ? "red" : "" }}
                                    >
                                        <option value="">Tipo de Usuario</option>
                                        <option value="empresa">Empresa</option>
                                        <option value="freelancer">Freelancer</option>
                                    </select>
                                    {errorTipoUsuario && <p style={{ color: "red", fontSize: "12px", marginLeft:"20px" }}>Por favor selecciona un tipo de usuario.</p>}
                                </div>

                                {/* Campo Correo Electrónico */}
                                <div className="register-form">
                                    <input 
                                        type="email" 
                                        placeholder="Correo Electrónico" 
                                        value={correo} 
                                        onChange={(e) => setCorreo(e.target.value)} 
                                        style={{ borderColor: correoError ? "red" : "" }}
                                    />
                                    {correoError && <p style={{ color: "red", fontSize: "12px", marginLeft:"20px" }}>Por favor ingresa un correo electrónico válido.</p>}
                                </div>

                                {/* Campo Contraseña */}
                                <div className="register-form">
                                    <input 
                                        type="password" 
                                        placeholder="Contraseña" 
                                        value={contraseña} 
                                        onChange={(e) => setContraseña(e.target.value)} 
                                        style={{ borderColor: contraseñaError ? "red" : "" }}
                                    />
                                    {contraseñaError && <p style={{ color: "red", fontSize: "12px", marginLeft:"20px" }}>Por favor ingresa una contraseña válida.</p>}
                                </div>

                                {/* Botón de Registro */}
                                <button 
                                    className="primary" 
                                    onClick={handleRegister}
                                    disabled={loading}
                                    style={{ marginLeft: "20px", padding: "10px" }}
                                >
                                    {loading ? "Registrando..." : "Registrarse"}
                                </button>

                                {/* Mensajes de error y éxito */}
                                {error && <div style={{ color: 'red' }}>{error}</div>}
                                {success && <div style={{ color: 'green' }}>{success}</div>}

                                <p>¿Ya tienes una cuenta? <a href="#" onClick={handleOpenLoginModal}>Iniciar sesión</a></p>
                            </div>
                        </div>
                    </Modal>
                    {showToast && (
                        <div className="toast-container">
                            <div className={`toast ${toastType === 'success' ? 'success' : 'error'}`}>
                            {toastMessage}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </header>
            
    );
}

export default Navbar;
