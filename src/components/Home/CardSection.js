import React from "react";
import './CardSection.css';
import { Link } from "react-router-dom";

function CardSection({ userType }) {
    return (
        <div className="card-section">

            {/* Tarjeta FreeLancer */}
            <div className="card">
                <h2>FREELANCER</h2>
                <p>Busca proyectos o tareas de tu interés, publica tu CV y muestra tu perfil a las empresas.</p>
                <Link to="/freelancer">
                    <button>
                        {userType === "freelancer" ? "Ingresar" : "Ser FreeLancer"}
                    </button>
                </Link>
            </div>

            {/* Tarjeta Empresa */}
            <div className="card">
                <h2>EMPRESA</h2>
                <p>Publica proyectos y/o busca freelancers para que realicen tus proyectos.</p>
                <Link to="/empresa">
                    <button>
                        {userType === "empresa" ? "Ingresar" : "Ser Empresa"}
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default CardSection;
