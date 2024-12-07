import React from "react";
import { useNavigate } from 'react-router-dom';
import "./LittleSearchSection.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

function LittleSearchSection() {
    const navigate = useNavigate();

    const handleSearch = () => {
        // Aquí puedes agregar lógica adicional si es necesario
        navigate('/projectlist'); // Redirige a la página de la lista de proyectos
    };

    return (
        <div className="littlesearch-section">
            <h1>¡Busca <span className="colordif">publicaciones</span> de tu interés!</h1>
            <h2>Encuentra el <span className="colordif">proyecto</span> que mejor encaje contigo</h2>
            <div className="littlesearch-bar">
                <div className="input-wrapper">
                    <i className="bi bi-briefcase"></i>
                    <input type="text" placeholder="Cargo o Categoría" />
                </div>
                <div className="input-wrapper">
                    <i className="bi bi-geo-alt"></i>
                    <input type="text" placeholder="Ubicación" />
                </div>
                {/* El botón de búsqueda */}
                <button className="littlesearch-button" onClick={handleSearch}>
                    <i className="bi bi-search"></i> Buscar
                </button>
            </div>
        </div>
    );
}

export default LittleSearchSection;
