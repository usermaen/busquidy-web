import React from "react";
import ModuleAdmin from "../../components/Admin/ModuleAdmin";
import Dashboard from "../../components/Admin/Dashboard";

function AdminHome() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <Dashboard />
                <ModuleAdmin />
            </div>
        </div>
    );
}

export default AdminHome;