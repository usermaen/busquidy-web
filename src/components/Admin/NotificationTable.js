import React, { useState } from "react";
import './NotificationTable.css'; // CSS para la gestión de notificaciones

function NotificationTable() {
    const [notification, setNotification] = useState("");
    const [recipients, setRecipients] = useState("");

    const handleSendNotification = (e) => {
        e.preventDefault();
        // Aquí puedes agregar la lógica para enviar la notificación
        alert(`Notificación enviada a ${recipients}: ${notification}`);
        setNotification("");
        setRecipients("");
    };

    return (
        <div className="notification-management">
            <h1>Gestión de Anuncios o Notificaciones</h1>
            <form onSubmit={handleSendNotification} className="notification-form">
                <textarea
                    placeholder="Escribe tu notificación o anuncio aquí..."
                    value={notification}
                    onChange={(e) => setNotification(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Destinatarios (freelancers, empresas, etc.)"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    required
                />
                <button type="submit">Enviar Notificación</button>
            </form>
        </div>
    );
}

export default NotificationTable;
