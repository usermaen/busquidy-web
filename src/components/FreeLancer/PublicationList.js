import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PublicationCard from './PublicationCard';
import MessageModal from '../MessageModal';
import './PublicationList.css';

function PublicationList({ userType, id_usuario, filters }) {
    const [publications, setPublications] = useState([]);
    const [filteredPublications, setFilteredPublications] = useState([]);
    const [appliedPublications, setAppliedPublications] = useState([]);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState('');
   
    // Fetch applied publications for the current user
    useEffect(() => {
        const fetchAppliedPublications = async () => {
            if (userType === 'freelancer' && id_usuario) {
                try {
                    const response = await axios.get(`http://localhost:3001/api/postulaciones/${id_usuario}`);
                    setAppliedPublications(response.data.map(app => app.id_publicacion));
                } catch (error) {
                    console.error('Error fetching applied publications:', error);
                }
            }
        };
        fetchAppliedPublications();
    }, [userType, id_usuario]);

    // Fetch publications
    useEffect(() => {
        const fetchPublications = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/publicacion');
                const activePublications = response.data.filter(pub => pub.estado_publicacion === 'activo');
                setPublications(activePublications);
            } catch (error) {
                console.error('Error fetching publications:', error);
            }
        };
        fetchPublications();
    }, []);

    // Filter publications when filters change or publications are updated
    useEffect(() => {
        let result = publications;

        // Text search
        if (filters.searchText) {
            result = result.filter(pub => 
                pub.titulo.toLowerCase().includes(filters.searchText.toLowerCase())
            );
        }

        // Project Size
        // if (filters.projectSize !== 'todos') {
        //     result = result.filter(pub => 
        //         pub.tamano_proyecto.toLowerCase() === filters.projectSize.toLowerCase()
        //     );
        // }

        // Sort By
        if (filters.sortBy === 'fecha') {
            result = result.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
        } else if (filters.sortBy === 'salario') {
            result = result.sort((a, b) => b.presupuesto - a.presupuesto);
        }

        // Date Filter
        const today = new Date();
        if (filters.date === 'hoy') {
            result = result.filter(pub => {
                const pubDate = new Date(pub.fecha_publicacion);
                return pubDate.toDateString() === today.toDateString();
            });
        } else if (filters.date === 'semana') {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            result = result.filter(pub => {
                const pubDate = new Date(pub.fecha_publicacion);
                return pubDate >= oneWeekAgo;
            });
        } else if (filters.date === 'mes') {
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setMonth(today.getMonth() - 1);
            result = result.filter(pub => {
                const pubDate = new Date(pub.fecha_publicacion);
                return pubDate >= oneMonthAgo;
            });
        }

        // Modality
        // if (filters.modality !== 'todos') {
        //     result = result.filter(pub => 
        //         pub.modalidad.toLowerCase() === filters.modality.toLowerCase()
        //     );
        // }

        // // Disability
        // if (filters.disability !== 'todos') {
        //     result = result.filter(pub => 
        //         pub.discapacidad.toString().toLowerCase() === filters.disability.toLowerCase()
        //     );
        // }

        // Experience
        // if (filters.experience !== 'todos') {
        //     result = result.filter(pub => {
        //         const experienceMap = {
        //             'sin-experiencia': 0,
        //             '1ano': 1,
        //             '2ano': 2,
        //             '3-4ano': 4,
        //             '5-10ano': 10,
        //             'mas10anos': 11
        //         };
        //         return pub.experiencia_requerida === experienceMap[filters.experience];
        //     });
        // }

        // // Career
        // if (filters.career !== 'todos') {
        //     result = result.filter(pub => 
        //         pub.carrera.toLowerCase() === filters.career.toLowerCase()
        //     );
        // }

        // // Region
        // if (filters.region !== 'todos') {
        //     result = result.filter(pub => 
        //         pub.region.toLowerCase() === filters.region.toLowerCase()
        //     );
        // }

        // // Commune
        // if (filters.commune !== 'todos') {
        //     result = result.filter(pub => 
        //         pub.comuna.toLowerCase() === filters.commune.toLowerCase()
        //     );
        // }

        // // Workday
        // if (filters.workday !== 'todos') {
        //     result = result.filter(pub => 
        //         pub.jornada.toLowerCase() === filters.workday.toLowerCase()
        //     );
        // }

        // // Work Area
        // if (filters.workArea !== 'todos') {
        //     result = result.filter(pub => 
        //         pub.area_trabajo.toLowerCase() === filters.workArea.toLowerCase()
        //     );
        // }

        setFilteredPublications(result);
    }, [publications, filters]);

    // Function to handle job application
    const postulacion = async (id_publicacion) => {
        try {
            if (userType !== 'freelancer') {
                setMessage('Solo los freelancers pueden postular a publicaciones.');
                setShowMessageModal(true);
                return { success: false, message }
            }

            const response = await axios.post(`http://localhost:3001/api/postulacion/${id_publicacion}`, {
                id_usuario,
                id_publicacion: id_publicacion
            });

            if (response.status === 201) {
                setMessage('Postulación enviada exitosamente.');
                setShowMessageModal(true);
                setAppliedPublications([...appliedPublications, id_publicacion]);
                return { success: true }
            }
        } catch (error) {
            console.error('Error applying to publication:', error);
            setMessage('Error al enviar la postulación.');
            setShowMessageModal(true);
            return { success: false };
        }
    };

    // Close message modal
    const handleCloseModal = () => {
        setShowMessageModal(false);
        setMessage('');
    };

    return (
        <div className="publication-list-container">
            <div className="publication-list">
                {filteredPublications.map(publication => (
                    <PublicationCard 
                        key={publication.id_publicacion}
                        publication={publication}
                        isApplied={appliedPublications.includes(publication.id_publicacion)}
                        onApply={postulacion}
                        id_usuario={id_usuario}
                        userType={userType}
                    />
                ))}

                {showMessageModal && (
                    <MessageModal 
                        message={message} 
                        closeModal={handleCloseModal} 
                    />
                )}
            </div>
        </div>
    );
}

export default PublicationList;