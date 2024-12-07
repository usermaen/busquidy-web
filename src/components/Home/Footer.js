import React, { useState } from "react";
import "./Footer.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

function Footer() {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleColumn = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <footer className="footer">
            <div className="footer-columns">
                {/* Primera columna */}
                <div className={`footer-column ${activeIndex === 0 ? "active" : ""}`}>
                    <h3 onClick={() => toggleColumn(0)}>
                        Categorías
                        <i className={`bi bi-chevron-down icon ${activeIndex === 0 ? "active" : ""}`}></i>
                    </h3>
                    <ul>
                        <li><a href="#">Programación y tecnología</a></li>
                        <li><a href="#">Marketing digital</a></li>
                        <li><a href="#">Diseño Gráfico</a></li>
                        <li><a href="#">Asistencia Virtual</a></li>
                        <li><a href="#">Animación y 3D</a></li>
                        <li><a href="#">Edición de Video</a></li>
                        <li><a href="#">Ver más+</a></li>
                    </ul>
                </div>

                {/* Segunda columna */}
                <div className={`footer-column ${activeIndex === 1 ? "active" : ""}`}>
                    <h3 onClick={() => toggleColumn(1)}>
                        Acerca de nosotros
                        <i className={`bi bi-chevron-down icon ${activeIndex === 1 ? "active" : ""}`}></i>
                    </h3>
                    <ul>
                        <li><a href="#">Sobre nosotros</a></li>
                        <li><a href="#">Únete a Busquidy</a></li>
                        <li><a href="#">Políticas de Busquidy</a></li>
                        <li><a href="#">Términos de servicio</a></li>
                        <li><a href="#">Política de privacidad</a></li>
                    </ul>
                </div>

                {/* Tercera columna */}
                <div className={`footer-column ${activeIndex === 2 ? "active" : ""}`}>
                    <h3 onClick={() => toggleColumn(2)}>
                        Soporte
                        <i className={`bi bi-chevron-down icon ${activeIndex === 2 ? "active" : ""}`}></i>
                    </h3>
                    <ul>
                        <li><a href="#">Soporte al cliente</a></li>
                        <li><a href="#">Soporte IA</a></li>
                        <li><a href="#">Busquidy guía</a></li>
                    </ul>
                </div>

                {/* Cuarta columna */}
                <div className={`footer-column ${activeIndex === 3 ? "active" : ""}`}>
                    <h3 onClick={() => toggleColumn(3)}>
                        Plataforma
                        <i className={`bi bi-chevron-down icon ${activeIndex === 3 ? "active" : ""}`}></i>
                    </h3>
                    <ul>
                        <li><a href="#">Comunidad</a></li>
                        <li><a href="#">Busquidy Pro</a></li>
                        <li><a href="#">Certificado Busquidy</a></li>
                        <li><a href="#">FreeLancer</a></li>
                        <li><a href="#">Empresa</a></li>
                    </ul>
                </div>

                {/* Quinta columna */}
                <div className="footer-column social-media">
                    <h3>Síguenos</h3>
                    <div className="social-icons">
                        <a href="#"><i className="bi bi-facebook"></i></a>
                        <a href="#"><i className="bi bi-instagram"></i></a>
                        <a href="#"><i className="bi bi-tiktok"></i></a>
                        <a href="#"><i className="bi bi-twitter-x"></i></a>
                    </div>
                    <div className="app-stores">
                        <button className="btn-stores">
                            <img src="/images/googlePlay.svg" alt="Google Play" />
                        </button>
                        <button className="btn-stores">
                            <img src="/images/appleStore.svg" alt="App Store" />
                        </button>
                    </div>
                </div>
            </div>
            {/* Sección de copyright */}
            <div className="footer-bottom">
                <p>Copyright © 2024 Busquidy. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;
