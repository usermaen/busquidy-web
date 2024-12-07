import React, { useEffect, useState } from "react";
import './Dashboard.css';

function Dashboard() {
    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [usuariosPremium, setUsuariosPremium] = useState(0);
    const [publicacionesActivas, setPublicacionesActivas] = useState(0);

    useEffect(() => {
        // Obtener usuarios
        fetch('http://localhost:3001/api/usuarios')
            .then(response => response.json())
            .then(data => {
                // Filtrar usuarios que no son administradores
                const usuariosSinAdmin = data.filter(usuario => usuario.tipo_usuario !== 'administrador');

                setTotalUsuarios(usuariosSinAdmin.length); // Total de usuarios sin el administrador

                // Contar usuarios premium dentro de los que no son administradores
                const premiumCount = usuariosSinAdmin.filter(usuario => usuario.premium === 'Sí').length;
                setUsuariosPremium(premiumCount); // Usuarios premium
            })
            .catch(error => console.error("Error al obtener usuarios:", error));
    
        // Obtener proyectos
        fetch('http://localhost:3001/api/proyectos')
            .then(response => response.json())
            .then(data => {
                // Contar publicaciones activas
                const activosCount = data.filter(proyecto => proyecto.estado_publicacion === "activo").length;
                setPublicacionesActivas(activosCount); // Publicaciones activas
            })
            .catch(error => console.error("Error al obtener proyectos:", error));
    }, []);    

    return (
        <div className="dashboard-container">
            <h1>Panel de Control</h1>
            <div className="stats-grid">
                <div className="stat-card-dashboard">
                    <h3>Total Usuarios</h3>
                    <p className="stat-value">{totalUsuarios}</p>
                </div>
                <div className="stat-card-dashboard">
                    <h3>Usuarios Premium</h3>
                    <p className="stat-value">{usuariosPremium}</p>
                </div>
                <div className="stat-card-dashboard">
                    <h3>Publicaciones Activas</h3>
                    <p className="stat-value">{publicacionesActivas}</p>
                </div>
                <div className="stat-card-dashboard">
                    <h3>Usuarios Activos</h3>
                    <p className="stat-value">-</p>
                </div>
                <div className="stat-card-dashboard">
                    <h3>Tareas Pendientes</h3>
                    <p className="stat-value">-</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
