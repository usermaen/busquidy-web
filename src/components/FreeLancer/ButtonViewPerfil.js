import React from "react";
import './ButtonViewPerfil.css'
import { Link } from "react-router-dom";

function ButtonViewPerfil() {
    return(
        <div className="freelancer-view-more-content">
            <Link to="/viewmoredetailsfreelancer">
                <button className="freelancer-view-more-btn">Ver más Información</button>
            </Link>
            <div className="espacio"></div>
        </div>
    );
}

export default ButtonViewPerfil;