import React, { useEffect, useState } from "react";
import "./ViewProjects.css";
import axios from "axios";
import ModalPublicarProyecto from "./ModalPublicarProyecto";
import ModalCreateProject from "./ModalCreateProject";
import MessageModal from "../MessageModal";
import LoadingScreen from "../LoadingScreen";
import { toast } from 'react-toastify';

// Modal de Confirmación
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-project">
      <div className="modal-content-project">
        <p>{message}</p>
        <div className="modal-actions-project">
          <button onClick={onClose} className="cancel-btn-project">Cancelar</button>
          <button onClick={onConfirm} className="confirm-btn-project">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

function ViewProjects({ userType, id_usuario }) {
    // Estados
    const [projects, setProjects] = useState([]);
    const [sortOption, setSortOption] = useState('Fecha');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [showModalPublicar, setShowModalPublicar] = useState(false);
    const [projectToPublish, setProjectToPublish] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModalProject, setShowModalProject] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState('');
    const [isPerfilIncompleto, setIsPerfilIncompleto] = useState(null);

    // Función para agregar un nuevo proyecto a la lista
    const addProject = (newProject) => {
        // Asegúrate de que el nuevo proyecto tenga todos los campos necesarios
        const formattedProject = {
            ...newProject,
            estado_publicacion: "sin publicar", // Estado por defecto para nuevos proyectos
            fecha_creacion: new Date().toISOString(), // Fecha actual para ordenamiento
            id_proyecto: newProject.id_proyecto || newProject.id, // Por si el backend devuelve el ID con diferente nombre
        };
    
        setProjects(prevProjects => {
            const updatedProjects = [...prevProjects, formattedProject];
            // Reordenar los proyectos según la opción de ordenamiento actual
            return updatedProjects.sort((a, b) => {
                if (sortOption === 'Estado') {
                    return a.estado_publicacion.localeCompare(b.estado_publicacion);
                } else { // 'Fecha'
                    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
                }
            });
        });
        window.location.reload();
    };

    useEffect(() => {
        // Verifica si el perfil está completo o no, después de que `isPerfilIncompleto` cambie
        if (isPerfilIncompleto !== null) {
            if (isPerfilIncompleto === false) {
                setShowModalProject(true);
                setIsPerfilIncompleto(null);
            } else if (isPerfilIncompleto === true) {
                setMessage('Por favor, completa tu perfil de empresa antes de crear un proyecto.');
                setShowMessageModal(true);
            }
        }
    }, [isPerfilIncompleto]); // Este efecto se ejecuta cuando cambia `isPerfilIncompleto`

    const openModalProject = async () => {
        if (userType === 'empresa') {
            try {
                const response = await axios.get(`http://localhost:3001/api/empresa/${id_usuario}`);
                
                if (response.data && typeof response.data.isPerfilIncompleto === "boolean") {
                    setIsPerfilIncompleto(response.data.isPerfilIncompleto);
                } else {
                    console.error("La respuesta del servidor no es la esperada:", response.data);
                    setMessage('Error al verificar el perfil de la empresa. Inténtalo de nuevo más tarde.');
                    setShowMessageModal(true);
                }

            } catch (error) {
                console.error("Error al verificar el perfil de la empresa:", error);
                setMessage('Error al verificar el perfil de la empresa. Inténtalo de nuevo más tarde.');
                setShowMessageModal(true);
            }
        } else if (userType === 'freelancer' || userType === 'administrador') {
            setMessage('Esta función es exclusiva para usuarios de tipo Empresa.');
            setShowMessageModal(true);
        } else {
            setMessage('Debes iniciar sesión como Empresa para desbloquear esta función.');
            setShowMessageModal(true);
        }
    };

    const closeMessageModal = () => {
        setShowMessageModal(false);
    };
    
    const projectsPerPage = 4;

    // Cargar proyectos
    const cargarProyectos = async () => {
        if (userType === 'empresa') {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`http://localhost:3001/api/proyectos/${id_usuario}`);
                if (!response.ok) {
                    // Silenciar ciertos códigos de error si es necesario
                    if (response.status === 404) {
                        console.warn('No hay proyectos para mostrar.');
                        setProjects([]); // Si no hay proyectos, devuelve un arreglo vacío
                    } else {
                        throw new Error('Error inesperado al cargar proyectos.');
                    }
                } else {
                    const data = await response.json();
                    setProjects(data);
                }
            } catch (error) {
                console.error('Error al cargar proyectos:', error.message);
                setError(error.message);
                toast.error('Algo salió mal al cargar los proyectos.');
            } finally {
                setLoading(false);
            }
        }
    };    

    // Funciones de Publicación
    const openModalPublicar = (id_proyecto) => {
        setProjectToPublish(id_proyecto);
        setShowModalPublicar(true);
    };

    // Funciones de Eliminación
    const confirmDeleteProject = (id_proyecto) => {
        setProjectToDelete(id_proyecto);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/proyecto/${projectToDelete}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el proyecto');
            }

            setProjects(prevProjects => 
                prevProjects.filter(project => project.id_proyecto !== projectToDelete)
            );
            
            toast.success('Proyecto eliminado correctamente');
            setDeleteModalOpen(false);
            setProjectToDelete(null);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Funciones de ordenamiento y paginación
    const handleSortChange = (event) => {
        setSortOption(event.target.value);
        setCurrentPage(1); // Reset a la primera página al cambiar el orden
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Función para obtener el color del estado
    const getStatusColor = (status) => {
        switch(status) {
            case 'activo': return 'status-active';
            case 'pendiente': return 'status-pending';
            case 'finalizado': return 'status-completed';
            default: return 'status-default';
        }
    };

    // Ordenar y paginar proyectos
    const sortedProjects = [...projects].sort((a, b) => {
        switch(sortOption) {
            case 'Estado':
                return a.estado_publicacion.localeCompare(b.estado_publicacion);
            case 'Fecha':
                return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
            default:
                return 0;
        }
    });

    const totalPages = Math.ceil(sortedProjects.length / projectsPerPage);
    const currentProjects = sortedProjects.slice(
        (currentPage - 1) * projectsPerPage, 
        currentPage * projectsPerPage
    );

    // Efecto para cargar proyectos
    useEffect(() => {
        if (userType && id_usuario) {
            cargarProyectos();
        }
    }, [userType, id_usuario]);

    // Placeholder functions
    const handleViewDetails = (id_proyecto) => {
        // Implementar lógica de ver detalles
    };

    const handleEdit = (id_proyecto) => {
        // Implementar lógica de edición
    };

    return (
        <div className="view-projects-container">
            {loading && <LoadingScreen />}
            
            {!loading && (
                <>
                    <div className="header">
                        <div className="title-box">
                            <h3>Gestionar Proyectos</h3>
                        </div>
                        <button className="publish-project-btn" onClick={openModalProject}>
                            <i className="bi bi-plus" style={{fontSize:"24px"}}></i>Crear proyecto
                        </button>
                        <div className="sort-pagination-box">
                            <div className="sort">
                                <label htmlFor="sort">Ordenar por:</label>
                                <select id="sort" value={sortOption} onChange={handleSortChange}>
                                    <option value="Estado">Estado</option>
                                    <option value="Fecha">Fecha</option>
                                </select>
                            </div>
                            <div className="pagination">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                >
                                    &lt;
                                </button>
                                <span>{currentPage} de {totalPages}</span>
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="projects-list">
                        {currentProjects.length > 0 ? (
                            currentProjects.map((project) => (
                                <div key={project.id_proyecto} className="project-card">
                                    {/* Botón "Publicar" */}
                                    {project.estado_publicacion === "sin publicar" && (
                                        <button
                                            onClick={() => openModalPublicar(project.id_proyecto)}
                                            className="publish-btn"
                                        >
                                            Publicar
                                        </button>
                                    )}
                                    <h3>{project.titulo}</h3>
                                    <p>{project.descripcion}</p>
                                    <div className="project-details">
                                        <span
                                            className={`project-estado ${getStatusColor(
                                                project.estado_publicacion
                                            )}`}
                                        >
                                            {project.estado_publicacion}
                                        </span>
                                        <span className="project-budget">${project.presupuesto}</span>
                                    </div>
                                    <div className="project-actions">
                                        <button onClick={() => handleViewDetails(project.id_proyecto)}>
                                            <i className="bi bi-info-circle"></i> Ver Detalles
                                        </button>
                                        <button onClick={() => handleEdit(project.id_proyecto)}>
                                            <i className="bi bi-pencil"></i> Editar
                                        </button>
                                        <button
                                            onClick={() => confirmDeleteProject(project.id_proyecto)}
                                            className="delete-btn"
                                        >
                                            <i className="bi bi-trash"></i> Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-projects">No has publicado ningún proyecto aún.</p>
                        )}
                    </div>

                    {showModalProject && (
                        <ModalCreateProject 
                            closeModal={() => setShowModalProject(false)}
                            addProject={addProject}
                            id_usuario={id_usuario} 
                        />
                    )}

                    {showMessageModal && (
                        <MessageModal message={message} closeModal={closeMessageModal} />
                    )}

                    {/* Modal de Publicación */}
                    {showModalPublicar && (
                        <ModalPublicarProyecto 
                            closeModal={() => setShowModalPublicar(false)}
                            id_usuario={id_usuario}
                            id_proyecto={projectToPublish}
                        />
                    )}

                    {/* Modal de Confirmación de Eliminación */}
                    <ConfirmModal 
                        isOpen={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={handleDelete}
                        message="¿Estás seguro que deseas eliminar este proyecto?"
                    />
                </>
            )}
        </div>
    );
}

export default ViewProjects;