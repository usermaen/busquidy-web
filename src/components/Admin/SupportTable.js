import React from "react";
import './SupportTable.css'; // CSS para la tabla

const supportRequests = [
    // Ejemplo de datos de solicitudes de soporte
    { id: 1, user: "Freelancer A", issue: "No puedo acceder a mi cuenta.", status: "Pendiente" },
    { id: 2, user: "Empresa B", issue: "Problemas con la publicación.", status: "Resuelto" },
    { id: 3, user: "Freelancer C", issue: "Solicitud de reembolso.", status: "En Progreso" },
];

function SupportTable() {
    return (
        <table className="support-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Problema</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {supportRequests.map((request) => (
                    <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>{request.user}</td>
                        <td>{request.issue}</td>
                        <td>{request.status}</td>
                        <td>
                            <button className="resolve-btn">Resolver</button>
                            <button className="delete-btn">Eliminar</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default SupportTable;
