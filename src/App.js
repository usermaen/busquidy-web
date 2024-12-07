import React, { useEffect, useState } from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {jwtDecode} from 'jwt-decode';
import Home from "./pages/General/Home";
import AdminHome from "./pages/Admin/AdminHome";
import LoginAdmin from "./pages/Admin/LoginAdmin";
import FreeLancer from "./pages/Freelancer/FreeLancer";
import Empresa from "./pages/Empresa/Empresa";
import ProjectList from "./pages/Freelancer/ProjectList";
import ViewPerfilFreeLancer from "./pages/Freelancer/ViewPerfilFreeLancer";
import ViewPerfilEmpresa from "./pages/Empresa/ViewPerfilEmpresa";
import FindFreelancer from "./pages/Empresa/FindFreelancer";
import MyProjects from "./pages/Empresa/MyProjects";
import UserManagement from "./pages/Admin/UserManagement";
import ProjectManagement from "./pages/Admin/ProjectManagement";
import ReviewManagement from "./pages/Admin/ReviewManagement";
import SupportManagement from "./pages/Admin/SupportManagement";
import PaymentManagement from "./pages/Admin/PaymentManagement";
import NotificationManegement from "./pages/Admin/NotificationManegement";
import AuditAndSecurity from "./pages/Admin/AuditAndSecurity";
import MyPostulations from "./pages/Freelancer/MyPostulations";
import ViewCV from "./pages/Freelancer/ViewCV";
import LoadingScreen from "./components/LoadingScreen"; 
import BusquidyPage from "./pages/General/BusquidyPage";
import SobreNosotrosPage from "./pages/General/SobreNostrosPage";
import "./App.css";
import ViewMoreDetailsFreelancer from "./pages/Freelancer/ViewMoreDetailsFreelancer";
import ViewFreelancer from "./pages/Empresa/ViewFreelancer";

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const decoded = jwtDecode(token);

          // Verificar si el token ha expirado
          if (decoded.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
          } else {
            // Eliminar el token si está expirado
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error al decodificar el token:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setTimeout(() => setLoading(false), 500); // Retraso antes de ocultar la pantalla de carga
    };

    checkAuth();
    window.addEventListener('storage', checkAuth); // Escucha cambios en `localStorage` para sincronizar autenticación
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div id="root">

        {/* Contenido principal */}
        <div className="main-content">
          <Routes>
            <Route path= "/" element={<Home />} />
            <Route path= "/loginadmin" element={<LoginAdmin />} />
            <Route path= "/adminhome" element={<AdminHome />} />
            <Route path= "/freelancer" element={<FreeLancer />} />
            <Route path= "/empresa" element={<Empresa />} />
            <Route path= "/projectlist" element={<ProjectList />} />
            <Route path= "/viewperfilfreelancer" element={<ViewPerfilFreeLancer />} />
            <Route path= "/viewperfilempresa" element={<ViewPerfilEmpresa />} />
            <Route path= "/findfreelancer" element={<FindFreelancer />} />
            <Route path= "/myprojects" element={<MyProjects />} />
            <Route path= "/usermanagement" element={<UserManagement />} />
            <Route path= "/projectmanagement" element={<ProjectManagement />} />
            <Route path= "/reviewmanagement" element={<ReviewManagement />} />
            <Route path= "/supportmanagement" element={<SupportManagement />} />
            <Route path= "/paymentmanagement" element={<PaymentManagement />} />
            <Route path= "/notificationmanagement" element={<NotificationManegement />} />
            <Route path= "/auditandsecurity" element={<AuditAndSecurity />} />
            <Route path= "/mypostulations" element={<MyPostulations />} />
            <Route path= "/busquidypage" element={<BusquidyPage />} />
            <Route path= "/sobrenosotrospage" element={<SobreNosotrosPage />} />
            <Route path= "/viewmoredetailsfreelancer" element={<ViewMoreDetailsFreelancer />} />
            <Route path= "/viewfreelancer/:id" element={<ViewFreelancer />} />
            <Route path= "/viewcv" element={<ViewCV />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
