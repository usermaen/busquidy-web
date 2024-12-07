import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import "./UserTable.css"; // Asegúrate de crear este archivo CSS

const UserTable = () => {
    
    const [usuarios, setUsuarios] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "ascending"
    });
    const [searchTerm, setSearchTerm] = useState("");

    // Función para cargar la lista de usuarios desde la base de datos
    const cargarUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/usuarios');
            
            // Agrega este console.log para verificar los datos recibidos
            console.log('Datos de usuarios:', response.data);
            
            // Ajusta la ruta según tu configuración del servidor
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error al cargar la lista de usuarios:', error);
        }
    };


    // Función para eliminar un usuario
    const eliminarUsuario = async (id_usuario) => {
        try {
            // Ajusta la ruta según tu configuración del servidor
            await axios.delete(`http://localhost:3001/api/usuarios/${id_usuario}`);

            // Recarga la lista de usuarios después de la eliminación
            cargarUsuarios();
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
        }
    };
    

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const sortData = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const getSortedData = () => {
        const filteredData = usuarios.filter(
        (usuario) =>
            usuario.tipo_usuario.toLowerCase() !== "administrador" &&
            (searchTerm === "" ||
            Object.values(usuario).some(
                (value) =>
                value &&
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            ))
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

    return (
        <div className="user-management">
        <div className="user-container">
            <div className="header-section">
            <h1>Gestión de Usuarios</h1>
            <div className="search-container">
                <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                />
            </div>
            </div>

            <div className="table-container">
            <table className="user-table">
                <thead>
                <tr>
                    {[
                    { key: "id_usuario", label: "ID Usuario" },
                    { key: "idRol", label: "ID Rol" },
                    { key: "correo", label: "Correo Electrónico" },
                    { key: "premium", label: "Premium" },
                    { key: "tipo_usuario", label: "Rol" },
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
                    getSortedData().map((usuario) => (
                    <tr key={usuario.id_usuario}>
                        <td>{usuario.id_usuario}</td>
                        <td>{usuario.idRol}</td>
                        <td>{usuario.correo}</td>
                        <td>
                            <span className={`badge ${usuario.premium === 'Sí' ? "premium" : "no-premium"}`}>
                                {usuario.premium}
                            </span>
                        </td>
                        <td>{usuario.tipo_usuario}</td>
                        <td>
                        <div className="action-buttons">
                            <button className="edit-user-btn">
                                <Pencil size={16} />
                            </button>
                            <button 
                            className="delete-btn"
                            onClick={() => eliminarUsuario(usuario.id_usuario)}
                            >
                                <i className="bi bi-trash" style={{margin:"0 auto", fontSize:"16px"}}></i>
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={6} className="empty-message">
                        No hay usuarios registrados en la base de datos
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
    };

export default UserTable;