import React from "react";
import { Link } from "react-router-dom";
import './ModuleAdmin.css';

function ModuleAdmin() {
    const modules = [
        { title: 'Gestión de Usuarios', route: '/usermanagement' },
        { title: 'Gestión de Proyectos', route: '/projectmanagement' },
        { title: 'Reseñas y Calificaciones', route: '/reviewmanagement' },
        { title: 'Soporte y Moderación', route: '/supportmanagement' },
        { title: 'Pagos y Transacciones', route: '/paymentmanagement' },
        { title: 'Anuncios y Notificaciones', route: '/notificationmanagement' },
        { title: 'Auditoría y Seguridad', route: '/auditandsecurity' }
    ];

    return (
        <div className="module-container">
            <h2>Módulos de Administración</h2>
            <div className="modules-grid">
                {modules.map((module, index) => (
                    <Link key={index} to={module.route} className="module-card">
                        <h3>{module.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default ModuleAdmin;