import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchFilters from "./SearchFilters";
import MessageModal from "../MessageModal";
import { useNavigate } from "react-router-dom";
import "./FreelancerList.css";

function FreelancerList({ userType, id_usuario }) {
    const [freelancers, setFreelancers] = useState([]);
    const [filteredFreelancers, setFilteredFreelancers] = useState([]);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const contactarFreelancer = (correo, telefono) => {
        if (userType === 'empresa') {
            if (correo && telefono) {
                setMessage(`Puedes contactar a este freelancer por correo: ${correo} o por teléfono: ${telefono}`);
            } else if (correo) {
                setMessage(`Puedes contactar a este freelancer por correo: ${correo}`);
            } else if (telefono) {
                setMessage(`Puedes contactar a este freelancer por teléfono: ${telefono}`);
            } else {
                setMessage('Este freelancer no tiene datos de contacto disponibles.');
            }
            setShowMessageModal(true);
        } else if (userType === 'freelancer') {
            setMessage('Esta función es exclusiva para usuarios de tipo empresa.');
            setShowMessageModal(true);
        } else {
            setMessage('Debes iniciar sesión como empresa para desbloquear esta función.');
            setShowMessageModal(true);
        }
    };

    const verPerfilFreelancer = (idFreelancer) => {
        if (userType === 'empresa') {
            navigate(`/viewfreelancer/${idFreelancer}`);
        } else if (userType === 'freelancer') {
            setMessage('Esta función es exclusiva para usuarios de tipo empresa.');
            setShowMessageModal(true);
        } else {
            setMessage('Debes iniciar sesión como empresa para desbloquear esta función.');
            setShowMessageModal(true);
        }
    };

    const closeMessageModal = () => {
        setShowMessageModal(false);
    };

    const cargarFreelancers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/freelancer');
            const freelancerData = response.data.map(freelancer => ({
                id: freelancer.id_freelancer,
                nombre: freelancer.nombre,
                apellido: freelancer.apellido,
                nacionalidad: freelancer.nacionalidad,
                ubicacion: `${freelancer.ciudad || 'Sin Especificar'}, ${freelancer.comuna || 'Sin Especificar'}`,                
                correo: freelancer.correo_contacto,
                telefono: freelancer.telefono_contacto,
                calificacion: freelancer.calificacion_promedio,
                descripcion: freelancer.descripcion,
                habilidades: freelancer.habilidades || '' // Agregar campo de habilidades
            }));
            setFreelancers(freelancerData);
            setFilteredFreelancers(freelancerData);
        } catch (error) {
            console.error('Error al cargar la lista de freelancers:', error);
        }
    };

    const verificarPerfilFreelancer = async () => {
        if (userType === 'freelancer') {
            try {
                const response = await axios.get(`http://localhost:3001/api/freelancer/${id_usuario}`);
                if (response.data.isPerfilIncompleto) {
                    setMessage('Completa tu perfil para aparecer en la lista de freelancers.');
                    setShowMessageModal(true);
                }
            } catch (error) {
                console.error("Error al verificar el perfil del freelancer:", error);
            }
        }
    };

    const handleFilterChange = (filters) => {
        let result = [...freelancers];

        // Filtrar por nombre
        if (filters.search) {
            result = result.filter(f => 
                `${f.nombre} ${f.apellido}`.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // Filtrar por ubicación
        if (filters.location) {
            result = result.filter(f => 
                f.ubicacion.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Filtrar por calificación
        if (filters.rating) {
            result = result.filter(f => 
                Math.floor(f.calificacion) >= filters.rating
            );
        }

        // Filtrar por habilidades
        if (filters.skills) {
            const skillsArray = filters.skills.toLowerCase().split(',').map(s => s.trim());
            result = result.filter(f => 
                skillsArray.some(skill => 
                    f.habilidades.toLowerCase().includes(skill)
                )
            );
        }

        setFilteredFreelancers(result);
    };

    useEffect(() => {
        cargarFreelancers();
        if (id_usuario && userType === 'freelancer') {
            verificarPerfilFreelancer();
        }
    }, [id_usuario, userType]);

    return (
        <div className="freelancer-page-container">
            <SearchFilters onFilterChange={handleFilterChange} />
            
            <div className="background-freelancer-list">
                <div className="cards-freelancer-container">
                    {filteredFreelancers.length > 0 ? (
                        filteredFreelancers.map((freelancer) => (
                            <div key={freelancer.id} className="card-freelancer">
                                <div className="card-freelancer-header">
                                    <img
                                        src="https://via.placeholder.com/100"
                                        alt="Freelancer"
                                        className="card-freelancer-image"
                                    />
                                    <div className="freelancer-info-header">
                                        <h3>{freelancer.nombre} {freelancer.apellido}</h3>
                                        <p className="location">
                                            <i className="fas fa-map-marker-alt"></i> {freelancer.ubicacion}
                                        </p>
                                        <div className="ratings">
                                            <span className="stars">⭐⭐⭐⭐⭐</span>
                                            <span className="reviews">({freelancer.calificacion})</span>
                                            <span className="verified">
                                                <i className="fas fa-check-circle"></i> Identidad verificada
                                            </span>
                                            <span className="popular">
                                                <i className="fas fa-fire"></i> Popular
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-freelancer-info">
                                    <p>{freelancer.descripcion}</p>
                                    <div className="card-freelancer-buttons">
                                        <button className="view-profile" onClick={() => verPerfilFreelancer(freelancer.id)}>Ver Perfil</button>
                                        <button className="apply" onClick={() => contactarFreelancer(freelancer.correo, freelancer.telefono)}>Contactar</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No se encontraron freelancers que coincidan con los filtros.</p>
                    )}
                </div>
            </div>

            {showMessageModal && (
                <MessageModal message={message} closeModal={closeMessageModal} />
            )}
        </div>
    );
}

export default FreelancerList;