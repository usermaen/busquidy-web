import React from "react";
import "./InfoSectionFreelancer.css";

function InfoSectionFreelancer() {
    return(
        <div>
            
            {/* Primer sección de información */}
            <div className="como-funciona-freelancer-container">
                <h2 className="como-funciona-freelancer-title">¿Cómo funciona nuestra plataforma?</h2>
                <div className="como-funciona-freelancer-cards-container">
                    <div className="como-funciona-freelancer-card">
                        <div className="como-funciona-freelancer-icon">🔍</div>
                        <h3 className="como-funciona-freelancer-card-title">Búsqueda simple</h3>
                        <p className="como-funciona-freelancer-card-description">Usa la barra de búsqueda para encontrar los servicios que necesitas.</p>
                    </div>
                    <div className="como-funciona-freelancer-card">
                        <div className="como-funciona-freelancer-icon">✔️</div>
                        <h3 className="como-funciona-freelancer-card-title">Selección simple</h3>
                        <p className="como-funciona-freelancer-card-description">Elige un servicio en base a las calificaciones y comentarios.</p>
                    </div>
                    <div className="como-funciona-freelancer-card">
                        <div className="como-funciona-freelancer-icon">💳</div>
                        <h3 className="como-funciona-freelancer-card-title">Pago fácil</h3>
                        <p className="como-funciona-freelancer-card-description">Paga de manera segura con nuestras opciones de pago.</p>
                    </div>
                </div>
            </div>

            <div className="info-freelancer-wrapper">
                <div className="info-freelancer-image">
                    <img src="/images/freelancer.png" alt="Persona feliz" />
                </div>
                <div className="info-freelancer-section">
                    <div className="info-freelancer-content">
                        <h2>Si buscas trabajo ¡Nuestra plataforma es tu mejor aliada!</h2>
                        <p>Miles de ofertas de empleo están esperándote</p>
                        <h3>Te ayudamos a encontrar un empleo mejor</h3>
                        <p>Haz que tu currículum sea visible para miles de empresas en nuestra bolsa de trabajo</p>
                        <ul className="info-freelancer-benefits">
                            <li>✔️ Registro gratuito. Encuentra tu próximo trabajo hoy.</li>
                            <li>✔️ Ofertas cada día. Empleos que se ajustan a tu perfil.</li>
                            <li>✔️ Alertas personalizadas. Crea alertas y te avisaremos.</li>
                            <li>✔️ Completa tu perfil. Gana visibilidad y destaca como profesional.</li>
                        </ul>
                        <button className="info-freelancer-button">Crea tu cuenta gratis</button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default InfoSectionFreelancer;