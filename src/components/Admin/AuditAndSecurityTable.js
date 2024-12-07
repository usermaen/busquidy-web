import React, { useState } from "react";
import './AuditAndSecurityTable.css'; // CSS para auditoría y seguridad

function AuditAndSecurityTable() {
    const [activities, setActivities] = useState([
        // Datos de ejemplo, deberías reemplazar esto con datos reales
        { id: 1, action: "Usuario creado", user: "freelancer1", timestamp: "2024-10-17 10:00" },
        { id: 2, action: "Publicación aprobada", user: "empresa1", timestamp: "2024-10-17 10:30" },
        { id: 3, action: "Intento de acceso no autorizado", user: "desconocido", timestamp: "2024-10-17 11:00" },
    ]);

    return (
        <div className="audit-security">
            <h1>Auditoría y Seguridad</h1>
            <h2>Historial de Actividades</h2>
            <table className="audit-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Acción</th>
                        <th>Usuario</th>
                        <th>Fecha y Hora</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map((activity) => (
                        <tr key={activity.id}>
                            <td>{activity.id}</td>
                            <td>{activity.action}</td>
                            <td>{activity.user}</td>
                            <td>{activity.timestamp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AuditAndSecurityTable;
