import React, { useState } from "react";
import PaymentTable from "../../components/Admin/PaymentTable";
import PaymentAnalytics from "../../components/Admin/PaymentAnalytics";
import './PaymentManagement.css'

function PaymentManagement() {
    const [activeTab, setActiveTab] = useState('tabla');

    return (
        <div className="payment-management">
            <h1 style={{textAlign:"center"}}>Gestión de Pagos y Transacciones</h1>
            <div className="payment-tabs">
                <button 
                    onClick={() => setActiveTab('tabla')}
                    className={activeTab === 'tabla' ? 'active' : ''}
                >
                    Tabla de Pagos
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={activeTab === 'analytics' ? 'active' : ''}
                >
                    Análisis de Pagos
                </button>
            </div>
            <div className="payment-content">
                {activeTab === 'tabla' ? <PaymentTable /> : <PaymentAnalytics />}
            </div>
        </div>
    );
}

export default PaymentManagement;