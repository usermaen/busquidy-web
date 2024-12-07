import React, { useState, useEffect } from "react";
import './ModalCreatePerfilEmpresa.css';
import axios from 'axios';

function ModalCreatePerfilEmpresa({ closeModal, id_usuario }) {
    // Estados para el formulario
    const [step, setStep] = useState(1);
    const [errorMessage, setErrorMessage] = useState("");
    const [empresaData, setEmpresaData] = useState({
        nombre_empresa: "",
        identificacion_fiscal: "",
        direccion: "",
        telefono_contacto: "",
        correo_empresa: "",
        pagina_web: "",
        descripcion: "",
        sector_industrial: ""
    });
    const [representanteData, setRepresentanteData] = useState({
        nombre_completo: "",
        cargo: "",
        correo_representante: "",
        telefono_representante: ""
    });

    // Manejar cambios en los inputs
    const handleChange = (e, isRepresentante = false) => {
        const { name, value } = e.target;
        if (isRepresentante) {
            setRepresentanteData({ ...representanteData, [name]: value });
        } else {
            setEmpresaData({ ...empresaData, [name]: value });
        }
    };

    useEffect(() => {
        console.log('id_usuario en ModalCreatePerfilEmpresa:', id_usuario);
      }, [id_usuario]);

    // Enviar datos al backend
    const envioDatosPerfilEmpresa = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3001/api/create-perfil-empresa', 
                {
                    empresaData: empresaData,
                    representanteData: representanteData,
                    id_usuario: id_usuario,
                },
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            
            console.log("Perfil creado exitosamente", response.data);
            closeModal(); // Cerrar el modal después de crear el perfil
            window.location.reload();
        } catch (error) {
            console.error("Error al crear el perfil de la empresa:", error);
            setErrorMessage("Error de conexión o error inesperado en la creación del perfil.");
        }
        console.log("Datos de empresa que se envían:", empresaData);
        console.log("Datos del representante empresa que se envían:", representanteData);
    };


    // Cambiar entre los pasos
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    

    return (
        <div className="perfil-empresa-overlay">
            <div className="perfil-empresa-content">
                <button onClick={closeModal} className="close-button">X</button>
                
                <form onSubmit={envioDatosPerfilEmpresa}>
                    {step === 1 && (
                        <div className="perfil-empresa-form-step">
                            <h2>Información de la Empresa</h2>
                            <div className="grupos-empresa-container">
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="nombre_empresa">Nombre de la Empresa</label>
                                    <input
                                        type="text"
                                        id="nombre_empresa"
                                        name="nombre_empresa"
                                        value={empresaData.nombre_empresa}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="identificacion_fiscal">Identificación Fiscal</label>
                                    <input
                                        type="text"
                                        id="identificacion_fiscal"
                                        name="identificacion_fiscal"
                                        value={empresaData.identificacion_fiscal}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grupos-empresa-container">
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="direccion">Dirección</label>
                                    <input
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        value={empresaData.direccion}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="telefono_contacto">Teléfono de contacto</label>
                                    <input
                                        type="text"
                                        id="telefono_contacto"
                                        name="telefono_contacto"
                                        value={empresaData.telefono_contacto}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grupos-empresa-container">
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="correo_empresa">Correo de la empresa</label>
                                    <input
                                        type="text"
                                        id="correo_empresa"
                                        name="correo_empresa"
                                        value={empresaData.correo_empresa}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="pagina_web">Página web</label>
                                    <input
                                        type="text"
                                        id="pagina_web"
                                        name="pagina_web"
                                        value={empresaData.pagina_web}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ width:"770px", marginLeft:"10px"}}>
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="sector_industrial">Sector industrial</label>
                                    <input
                                        type="text"
                                        id="sector_industrial"
                                        name="sector_industrial"
                                        value={empresaData.sector_industrial}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{width:"770px", marginLeft:"10px", marginBottom:"20px"}}>
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="descripcion">Descripción de la empresa</label>
                                    <input
                                        id="descripcion"
                                        name="descripcion"
                                        placeholder="Escribe una descripción de la empresa"
                                        value={empresaData.descripcion}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="perfil-empresa-form-actions">
                                <button type="button" onClick={nextStep}>Siguiente</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="perfil-empresa-form-step">
                            <h2>Información del Representante</h2>
                            <div style={{marginLeft:"20px"}}>
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="nombre_completo">Nombre Completo</label>
                                    <input
                                        type="text"
                                        id="nombre_completo"
                                        name="nombre_completo"
                                        value={representanteData.nombre_completo}
                                        onChange={(e) => handleChange(e, true)}
                                        required
                                    />
                                </div>
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="cargo">Cargo</label>
                                    <input
                                        type="text"
                                        id="cargo"
                                        name="cargo"
                                        value={representanteData.cargo}
                                        onChange={(e) => handleChange(e, true)}
                                        required
                                    />
                                </div>
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="correo_representante">Correo del Representante</label>
                                    <input
                                        type="email"
                                        id="correo_representante"
                                        name="correo_representante"
                                        value={representanteData.correo_representante}
                                        onChange={(e) => handleChange(e, true)}
                                        required
                                    />
                                </div>
                                <div className="perfil-empresa-form-group">
                                    <label htmlFor="telefono_representante">Teléfono del Representante</label>
                                    <input
                                        type="text"
                                        id="telefono_representante"
                                        name="telefono_representante"
                                        value={representanteData.telefono_representante}
                                        onChange={(e) => handleChange(e, true)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="perfil-empresa-form-actions">
                                <button type="button" onClick={prevStep}>Anterior</button>
                                <button type="submit">Guardar</button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default ModalCreatePerfilEmpresa;
