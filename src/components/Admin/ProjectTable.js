import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Pencil, XCircle } from "lucide-react";
import axios from "axios";
import { toast } from 'react-toastify';
import MessageModal from "../MessageModal";
import './ProjectTable.css'

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

function ProjectTable() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [projectToDespost, setProjectToDespost] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null);

    // Cargar proyectos
    const cargarAdminProyectos = async () => {
        try {
            setError(null);
            const response = await axios.get(`http://localhost:3001/api/proyectos`);
            setProjects(response.data);
        } catch (error) {
            setError(error.message);
            console.error('Error al cargar los proyectos:', error);
        }
    };

    useEffect(() => {
        cargarAdminProyectos();
    }, []);

    // Funciones para manejar "despublicar"
    const confirmDespostProject = (id_proyecto) => {
        setMessage("¿Estás seguro que deseas despublicar este proyecto?");
        setActionType("despublicar");
        setProjectToDespost(id_proyecto);
        setDeleteModalOpen(true);
    };

    const handleDespost = async () => {
        try {
            setLoading(true);
            const response = await axios.put(
                `http://localhost:3001/api/update-proyecto-state/${projectToDespost}`,
                { estado_publicacion: "cancelado" } // Asegúrate de que este campo coincida con tu base de datos
            );
    
            if (response.status !== 200) {
                throw new Error("Error al despublicar el proyecto");
            }
    
            // Actualizar el estado local
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project.id_proyecto === projectToDespost
                        ? { ...project, estado_publicacion: "cancelado" }
                        : project
                )
            );
    
            toast.success("Proyecto despublicado correctamente");
            setDeleteModalOpen(false);
            setProjectToDespost(null);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Funciones de Eliminación
    const confirmDeleteProject = (id_proyecto) => {
        setMessage("¿Estás seguro que deseas eliminar este proyecto?")
        setProjectToDelete(id_proyecto);
        setDeleteModalOpen(true);
    };

    const handleDeleteProjects = async () => {
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

    // Manejar confirmación de acciones desde el modal
    const handleModalConfirm = () => {
        if (actionType === "eliminar") {
            handleDeleteProjects();
        } else if (actionType === "despublicar") {
            handleDespost();
        }
    };

    const closeMessageModal = () => {
        setShowMessageModal(false);
    };

    const sortData = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const getSortedData = () => {
        const filteredData = projects.filter(
            (project) =>
                searchTerm === "" ||
                Object.values(project).some(
                    (value) =>
                        value &&
                        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
        );

        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronUp className="sort-icon" />;
        }
        return sortConfig.direction === "ascending" ? (
            <ChevronUp className="sort-icon active" />
        ) : (
            <ChevronDown className="sort-icon active" />
        );
    };

    // Función para formatear fechas de manera segura
    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    return (
        <div className="project-management">
            <div className="project-container">
                <div className="header-section">
                    <h1>Gestión de Proyectos</h1>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar proyectos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="project-table">
                        <thead>
                            <tr>
                                {[
                                    { key: "id_proyecto", label: "ID Proyecto" },
                                    { key: "id_empresa", label: "ID Empresa" },
                                    { key: "titulo", label: "Título" },
                                    { key: "estado", label: "Estado" },
                                    { key: "fecha_creacion", label: "Fecha Creación" },
                                    { key: "fecha_publicacion", label: "Fecha Publicación" },
                                    { key: "categoria", label: "Categoría" },
                                    { key: "publicaciones", label: "Publicaciones" },
                                    { key: "acciones", label: "Acciones" }
                                ].map((column) => (
                                    <th
                                        key={column.key}
                                        className={column.key !== "acciones" ? "sortable" : ""}
                                        onClick={() => column.key !== "acciones" && sortData(column.key)}
                                    >
                                        <div className="th-content">
                                            <span>{column.label}</span>
                                            {column.key !== "acciones" && (
                                                <SortIcon columnKey={column.key} />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {getSortedData().length > 0 ? (
                                getSortedData().map((project) => (
                                    <tr key={project.id_proyecto}>
                                        <td>{project.id_proyecto}</td>
                                        <td>{project.id_empresa}</td>
                                        <td>{project.titulo || 'Sin título'}</td>
                                        <td>
                                            <span className={`badge ${((project.estado_publicacion || '').toLowerCase().replace(/\s+/g, '-'))}`}>
                                                {project.estado_publicacion || 'Sin definir'}
                                            </span>
                                        </td>
                                        <td>
                                            {project.fecha_creacion 
                                                ? formatDate(project.fecha_creacion) 
                                                : 'No publicado'}
                                        </td>
                                        <td>
                                            {project.fecha_publicacion 
                                                ? formatDate(project.fecha_publicacion) 
                                                : 'No publicado'}
                                        </td>
                                        <td>{project.categoria || 'No especificada'}</td>
                                        <td>
                                            {project.publicaciones && project.publicaciones.length > 0 ? (
                                                <ul>
                                                    {project.publicaciones.map((pub, index) => (
                                                        <li key={index}>
                                                            {pub.titulo || `Publicación ${index + 1}`}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="no-publications">Sin publicaciones</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="reject-btn" 
                                                    title="Despublicar"
                                                    onClick={() => confirmDespostProject(project.id_proyecto)}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                                <button className="edit-btn" title="Modificar">
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    className="delete-btn" 
                                                    title="Eliminar"
                                                    onClick={() => confirmDeleteProject(project.id_proyecto)}
                                                >
                                                        <i className="bi bi-trash" style={{margin:"0 auto", fontSize:"16px"}}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="empty-message">
                                        No hay proyectos registrados en la base de datos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {showMessageModal && (
                <MessageModal message={message} closeModal={closeMessageModal} />
            )}
            {/* Modal de Confirmación de Eliminación */}
            <ConfirmModal 
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setActionType(null);
                }}
                onConfirm={handleModalConfirm}
                message={message}
            />
        </div>
    );
}

export default ProjectTable;