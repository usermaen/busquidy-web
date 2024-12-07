import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyPostulationsTable.css';

const MyPostulationsTable = ({ id_usuario }) => {
    const [postulations, setPostulations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState("Estado");
    const itemsPerPage = 4;

    useEffect(() => {
        const fetchPostulations = async () => {
            if (!id_usuario || isNaN(id_usuario)) {
                console.error("ID de usuario inválido:", id_usuario);
                return; // No realizar la solicitud si el ID no es válido
            }
    
            try {
                const response = await axios.get(`http://localhost:3001/api/postulaciones/${id_usuario}`);
    
                if (response.data) {
                    setPostulations(response.data);
                }
            } catch (error) {
                console.error("Error al cargar las postulaciones:", error.response || error.message);
            }
        };
        fetchPostulations();
    }, [id_usuario]);
    

    // Calcular tiempo transcurrido
    const calculateTimeAgo = (postDate) => {
        const postDateObj = new Date(postDate);
        const now = new Date();
        const differenceInMs = now - postDateObj;
        const daysAgo = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
        if (daysAgo < 1) return "Hoy";
        if (daysAgo === 1) return "Hace 1 día";
        if (daysAgo < 7) return `Hace ${daysAgo} días`;
        if (daysAgo < 30) return `Hace ${Math.floor(daysAgo / 7)} semanas`;
        return `Hace ${Math.floor(daysAgo / 30)} meses`;
    };

    // Manejo de la paginación
    const handlePageChange = (page) => {
        if (page >= 1 && page <= Math.ceil(postulations.length / itemsPerPage)) {
            setCurrentPage(page);
        }
    };

    // Manejo del ordenamiento
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    // Eliminar una postulación
    const handleDeletePostulation = async (id_postulacion) => {
        try {
            const response = await fetch(`http://localhost:3001/api/delete-postulacion/${id_postulacion}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error("Detalles del error:", errorDetails);
                throw new Error('Error al eliminar postulacion');
            }            

            setPostulations(postulations.filter(p => p.id_postulacion !== id_postulacion));

        } catch (error) {
            console.error("Error al eliminar la postulación:", error);
        }
    };

    const currentPostulations = postulations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className='background-postulations'>
            <div className="postulaciones-container">
                <div className="header">
                    <div className="title-box">
                        <h3>Mis Postulaciones</h3>
                    </div>
                    <div className="sort-pagination-box">
                        <div className="sort">
                            <label htmlFor="sort">Ordenar por:</label>
                            <select id="sort" value={sortOption} onChange={handleSortChange}>
                                <option value="Estado">Estado</option>
                                <option value="Fecha">Fecha</option>
                                <option value="Empresa">Empresa</option>
                            </select>
                        </div>
                        <div className="pagination">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                &lt;
                            </button>
                            <span>{currentPage} de {Math.ceil(postulations.length / itemsPerPage)}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil(postulations.length / itemsPerPage)}>
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
                <div className="tabla-postulaciones">
                    {postulations.length === 0 ? (
                        <div className="no-postulaciones">
                            <p>No tienes postulaciones aún.</p>
                        </div>
                    ) : (
                        currentPostulations.map((postulation) => (
                            <div key={postulation.id_postulacion} className="postulacion-item">
                                <div className="postulacion-info">
                                    <img src={postulation.imageUrl || "https://via.placeholder.com/50"} alt="Logo Empresa" />
                                    <div>
                                        <p className="titulo">{postulation.titulo}</p>
                                        <p className="empresa">{postulation.nombre_empresa}</p>
                                    </div>
                                </div>
                                <div className="fecha">
                                    <p className="tiempo-transcurrido">{calculateTimeAgo(postulation.fecha_publicacion)}</p>
                                    <p className="fecha-original">{new Date(postulation.fecha_publicacion).toLocaleDateString('es-CL')}</p>
                                </div>
                                <p className="estado" title='Estado de postulación'>{postulation.estado_postulacion}</p>
                                <div className="acciones">
                                    <span className="ver" title='Ver publicación'>
                                        <i className="fas fa-eye"></i>
                                    </span>
                                    <span className="eliminar" title='Eliminar postulación' onClick={() => handleDeletePostulation(postulation.id_postulacion)}>
                                        <i className="fas fa-trash-alt"></i>
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyPostulationsTable;
