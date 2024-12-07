import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const [correo, setCorreo] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [contraseñaError, setContraseñaError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault(); // Evitar que el formulario se envíe

    let hasError = false;
    if (!correo) {
      setCorreoError("Por favor, ingresa tu correo");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      setCorreoError("Ingresa un correo válido");
      hasError = true;
    } else {
      setCorreoError('');
    }

    if (!contraseña) {
      setContraseñaError("Por favor, ingresa tu contraseña");
      hasError = true;
    } else {
      setContraseñaError('');
    }

    if (hasError) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, tipo_usuario } = data;

        localStorage.setItem('token', token);
        localStorage.setItem('tipo_usuario', tipo_usuario);
        localStorage.setItem('correo', correo);

        if (tipo_usuario?.toLowerCase() === 'administrador') {
          navigate('/adminhome');
        } else {
          setError("Tipo de usuario desconocido");
        }

      } else {
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error de red: ", error);
      setError("Error de red: Intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <h1>Inicio de sesión Administrador</h1>
      <form>
        <input
          type="email" // Cambié el tipo a "email"
          id="correo"
          name="correo"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          style={{ marginBottom: "auto", borderColor: correoError ? "red" : "" }}
          required
        />
        {correoError && <p style={{ color: "red", fontSize: "12px", marginLeft: "20px" }}>{correoError}</p>}
        <input
          type="password" // Cambié el tipo a "password"
          id="contraseña"
          name="contraseña"
          placeholder="Contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          style={{ marginBottom: "auto", borderColor: contraseñaError ? "red" : "" }}
          required
        />
        {contraseñaError && <p style={{ color: "red", fontSize: "12px", marginLeft: "20px" }}>{contraseñaError}</p>}
        <button
          onClick={handleAdminLogin}
          style={{ marginTop: "20px" }}
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>
      {error && <p style={{ color: "red", fontSize: "12px", marginLeft: "20px" }}>{error}</p>}
    </div>
  );
}

export default AdminLogin;
