import React from "react";
import "./InfoSectionEmpresa.css";

function InfoSectionEmpresa() {
    return(
        <div>
            
            {/* Primer sección de información */}
            <div className="como-funciona-empresa-container">
                <h2 className="como-funciona-empresa-title">¿Cómo funciona nuestra plataforma?</h2>
                <div className="como-funciona-empresa-cards-container">
                    <div className="como-funciona-empresa-card">
                        <div className="como-funciona-empresa-icon">🔍</div>
                        <h3 className="como-funciona-empresa-card-title">Búsqueda simple</h3>
                        <p className="como-funciona-empresa-card-description">Usa la barra de búsqueda para encontrar los servicios que necesitas.</p>
                    </div>
                    <div className="como-funciona-empresa-card">
                        <div className="como-funciona-empresa-icon">✔️</div>
                        <h3 className="como-funciona-empresa-card-title">Selección simple</h3>
                        <p className="como-funciona-empresa-card-description">Elige un servicio en base a las calificaciones y comentarios.</p>
                    </div>
                    <div className="como-funciona-empresa-card">
                        <div className="como-funciona-empresa-icon">💳</div>
                        <h3 className="como-funciona-empresa-card-title">Pago fácil</h3>
                        <p className="como-funciona-empresa-card-description">Paga de manera segura con nuestras opciones de pago.</p>
                    </div>
                </div>
            </div>

            {/* Segunda sección de información */}
            <div className="info-freelancer-empresa-container">
                <h2 className="info-freelancer-empresa-title">
                    Freelancers competentes en todos los campos a solo un clic
                </h2>
                <div className=""></div>
                <div className="info-freelancer-empresa-content">
                    <div className="info-freelancer-empresa-item">
                        <span className="info-freelancer-empresa-icon">✔️</span>
                        <div>
                            <h3 className="info-freelancer-empresa-item-title">Trabajo de calidad – eficiente y confiable</h3>
                            <p className="info-freelancer-empresa-item-description">
                                Recibe entregas puntuales y de alta calidad, ya sea un trabajo a corto plazo o un proyecto complejo.
                            </p>
                        </div>
                    </div>
                    <div className="info-freelancer-empresa-item">
                        <span className="info-freelancer-empresa-icon">✔️</span>
                        <div>
                            <h3 className="info-freelancer-empresa-item-title">Seguridad en cada pedido</h3>
                            <p className="info-freelancer-empresa-item-description">
                                Pagos protegidos mediante tecnología SSL. Las transacciones no se liberan hasta que se apruebe la entrega.
                            </p>
                        </div>
                    </div>
                    <div className="info-freelancer-empresa-item">
                        <span className="info-freelancer-empresa-icon">✔️</span>
                        <div>
                            <h3 className="info-freelancer-empresa-item-title">Locales o globales</h3>
                            <p className="info-freelancer-empresa-item-description">
                                Trabaja con expertos de habla español o con talento profesional internacional, de acuerdo a tus preferencias y requisitos.
                            </p>
                        </div>
                    </div>
                    <div className="info-freelancer-empresa-item">
                        <span className="info-freelancer-empresa-icon">✔️</span>
                        <div>
                            <h3 className="info-freelancer-empresa-item-title">24/7 – soporte continuo a cualquier hora del día</h3>
                            <p className="info-freelancer-empresa-item-description">
                                ¿Tienes alguna pregunta? Nuestro equipo de soporte está disponible a cualquier hora del día, en todo momento y en todo lugar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default InfoSectionEmpresa;