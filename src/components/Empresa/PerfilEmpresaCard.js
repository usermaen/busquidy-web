import React, { useState, useEffect } from "react";
import "./PerfilEmpresaCard.css";
import axios from "axios";

function PerfilEmpresaCard({ userType, id_usuario }) {
    const [perfilData, setPerfilData] = useState(null);
    const [activeSection, setActiveSection] = useState('empresa-info');
    
    useEffect(() => {
        cargarPerfilEmpresa();
    }, []);

    const cargarPerfilEmpresa = async () => {
        if (userType === 'empresa') {
            try {
                const response = await axios.get(`http://localhost:3001/api/perfil-empresa/${id_usuario}`);
                console.log('data:', response.data);
                setPerfilData(response.data);
            } catch (error) {
                console.error('Error al cargar perfil:', error);
            }
        } else {
            console.log('Esta función es exclusiva para usuarios de tipo Empresa.');
        }
    };

    const renderSection = () => {
        if (!perfilData) return <p>Cargando datos...</p>;

        switch (activeSection) {
            case 'empresa-info':
                return (
                    <div className="empresa-info-section">
                        <h2>Información de la Empresa</h2>
                        <div className="empresa-info">
                            <p><strong>Nombre de la Empresa:</strong> {perfilData.perfilEmpresa.nombre_empresa}</p>
                            <p><strong>RUT:</strong> {perfilData.perfilEmpresa.identificacion_fiscal}</p>
                            <p><strong>Dirección:</strong> {perfilData.perfilEmpresa.direccion}</p>
                            <p><strong>Teléfono:</strong> {perfilData.perfilEmpresa.telefono_contacto}</p>
                            <p><strong>Correo Electrónico:</strong> {perfilData.perfilEmpresa.correo_empresa}</p>
                            <p><strong>Página Web:</strong> <a href={perfilData.perfilEmpresa.pagina_web} target="_blank" rel="noopener noreferrer">{perfilData.perfilEmpresa.pagina_web}</a></p>
                            <p><strong>Descripción:</strong> {perfilData.perfilEmpresa.descripcion}</p>
                            <p><strong>Sector/Industria:</strong> {perfilData.perfilEmpresa.sector_industrial}</p>
                        </div>
                    </div>
                );
            case 'representante-info':
                return (
                    <div className="representante-info-section">
                        <h2>Información del Representante</h2>
                        <div className="representante-info">
                            <p><strong>Nombre Completo:</strong> {perfilData.perfilRepresentante.nombre_completo}</p>
                            <p><strong>Cargo:</strong> {perfilData.perfilRepresentante.cargo}</p>
                            <p><strong>Correo Electrónico:</strong> {perfilData.perfilRepresentante.correo_representante}</p>
                            <p><strong>Teléfono:</strong> {perfilData.perfilRepresentante.telefono_representante}</p>
                        </div>
                    </div>
                );
            case 'empresa-access':
                return (
                    <div className="empresa-access-info-section">
                        <h2>Información de Acceso</h2>
                        <div className="access-info">
                            <p><strong>Correo Electrónico:</strong> {perfilData.perfilUsuario.correo}</p>
                            <p><strong>Contraseña:</strong> ************</p>
                            <p><strong>Tipo de usuario:</strong> {perfilData.perfilUsuario.tipo_usuario}</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="perfil-empresa-container">
            <div className="sidebar">
                <ul>
                    <li onClick={() => setActiveSection('empresa-info')} className={activeSection === 'empresa-info' ? 'active' : ''}>Información de la Empresa</li>
                    <li onClick={() => setActiveSection('representante-info')} className={activeSection === 'representante-info' ? 'active' : ''}>Información del Representante</li>
                    <li onClick={() => setActiveSection('empresa-access')} className={activeSection === 'empresa-access' ? 'active' : ''}>Información de Acceso</li>
                </ul>
            </div>
            <div className="content">
                {renderSection()}
            </div>
        </div>
    );
}

export default PerfilEmpresaCard;
