import React from "react";
import "./EmpresaActionsCard.css";
import { Link } from "react-router-dom";

function EmpresaActionsCard() {
    return (
        <div className="empresa-actions-container">
            <h2 className="empresa-actions-title" style={{color:"white"}}> ¿Qué te gustaria hacer?</h2>
            <div className="empresa-actions-card">
                <div className="card">
                    <h3>Buscar FreeLancer</h3>
                    <p>Encuentra los mejores talentos para tu proyecto</p>
                    <Link to="/findfreelancer">
                        <button className="card-button">Buscar FreeLancer</button>
                    </Link>
                </div>
                <div className="card">
                    <h3>Publicar Proyecto</h3>
                    <p>Publica un proyecto y permite que los freelancers te encuentren</p>
                    <Link to="/myprojects">
                        <button className="card-button">Publicar Proyecto</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default EmpresaActionsCard;