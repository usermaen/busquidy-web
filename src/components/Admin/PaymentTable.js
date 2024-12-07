import React, { useEffect, useState } from "react";
import axios from "axios";
import './PaymentTable.css';

function PaymentTable() {
    const [pagoProyecto, setPagoProyecto] = useState([]);
    const [pagoSuscripcion, setPagoSuscripcion] = useState([]);
    
    // Filtro y búsqueda para pagos de proyectos
    const [filtroProyecto, setFiltroProyecto] = useState({
        searchTerm: '',
        estado: '',
        metodo: '',
        fechaInicio: '',
        fechaFin: ''
    });
    
    // Filtro y búsqueda para pagos de suscripciones
    const [filtroSuscripcion, setFiltroSuscripcion] = useState({
        searchTerm: '',
        estado: '',
        plan: '',
        fechaInicio: '',
        fechaFin: ''
    });

    // Cargar datos de pagos de proyectos
    const cargarPagosProyectos = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/pagos-proyectos`);
            setPagoProyecto(response.data);
        } catch (error) {
            console.error('Error al cargar los pagos de proyectos:', error);
        }
    };

    // Cargar datos de pagos de suscripciones
    const cargarPagosSuscripciones = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/pagos-suscripciones`);
            setPagoSuscripcion(response.data);
        } catch (error) {
            console.error('Error al cargar los pagos de suscripciones:', error);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        cargarPagosProyectos();
        cargarPagosSuscripciones();
    }, []);

    function formatDateToLocale(dateString) {
        if (!dateString) return 'Fecha no disponible';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CL', {
            dateStyle: 'short', // Formato corto como dd-mm-yyyy
        }).format(date);
    }    


    // Función de filtrado para pagos de proyectos
    const filtrarPagosProyectos = (pagos) => {
        return pagos.filter(pago => {
            const matchSearchTerm = filtroProyecto.searchTerm === '' || 
                Object.values(pago).some(valor => 
                    valor.toString().toLowerCase().includes(filtroProyecto.searchTerm.toLowerCase())
                );
            
            const matchEstado = filtroProyecto.estado === '' || pago.estado_pago === filtroProyecto.estado;
            const matchMetodo = filtroProyecto.metodo === '' || pago.metodo_pago === filtroProyecto.metodo;
            
            const matchFechaInicio = !filtroProyecto.fechaInicio || 
                new Date(pago.fecha_pago) >= new Date(filtroProyecto.fechaInicio);
            
            const matchFechaFin = !filtroProyecto.fechaFin || 
                new Date(pago.fecha_pago) <= new Date(filtroProyecto.fechaFin);

            return matchSearchTerm && matchEstado && matchMetodo && matchFechaInicio && matchFechaFin;
        });
    };

    // Función de filtrado para pagos de suscripciones
    const filtrarPagosSuscripciones = (pagos) => {
        return pagos.filter(pago => {
            const matchSearchTerm = filtroSuscripcion.searchTerm === '' || 
                Object.values(pago).some(valor => 
                    valor.toString().toLowerCase().includes(filtroSuscripcion.searchTerm.toLowerCase())
                );
            
            const matchEstado = filtroSuscripcion.estado === '' || pago.estado_pago === filtroSuscripcion.estado;
            const matchPlan = filtroSuscripcion.plan === '' || pago.plan_suscripcion === filtroSuscripcion.plan;
            
            const matchFechaInicio = !filtroSuscripcion.fechaInicio || 
                new Date(pago.fecha_pago) >= new Date(filtroSuscripcion.fechaInicio);
            
            const matchFechaFin = !filtroSuscripcion.fechaFin || 
                new Date(pago.fecha_pago) <= new Date(filtroSuscripcion.fechaFin);

            return matchSearchTerm && matchEstado && matchPlan && matchFechaInicio && matchFechaFin;
        });
    };

    // Renderizar filtros para pagos de proyectos
    function renderFiltrosProyecto() {
        return (
            <div className="filtros-container">
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={filtroProyecto.searchTerm}
                    onChange={(e) => setFiltroProyecto({...filtroProyecto, searchTerm: e.target.value})}
                    className="filtro-input"
                />
                <select 
                    value={filtroProyecto.estado}
                    onChange={(e) => setFiltroProyecto({...filtroProyecto, estado: e.target.value})}
                    className="filtro-select"
                >
                    <option value="">Estado de Pago</option>
                    <option value="Completado">Completado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Fallido">Fallido</option>
                </select>
                <select 
                    value={filtroProyecto.metodo}
                    onChange={(e) => setFiltroProyecto({...filtroProyecto, metodo: e.target.value})}
                    className="filtro-select"
                >
                    <option value="">Método de Pago</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Transferencia">Transferencia</option>
                </select>
                <input 
                    type="date" 
                    value={filtroProyecto.fechaInicio}
                    onChange={(e) => setFiltroProyecto({...filtroProyecto, fechaInicio: e.target.value})}
                    className="filtro-input"
                />
                <input 
                    type="date" 
                    value={filtroProyecto.fechaFin}
                    onChange={(e) => setFiltroProyecto({...filtroProyecto, fechaFin: e.target.value})}
                    className="filtro-input"
                />
            </div>
        );
    }

    // Renderizar filtros para pagos de suscripciones
    function renderFiltrosSuscripcion() {
        return (
            <div className="filtros-container">
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={filtroSuscripcion.searchTerm}
                    onChange={(e) => setFiltroSuscripcion({...filtroSuscripcion, searchTerm: e.target.value})}
                    className="filtro-input"
                />
                <select 
                    value={filtroSuscripcion.estado}
                    onChange={(e) => setFiltroSuscripcion({...filtroSuscripcion, estado: e.target.value})}
                    className="filtro-select"
                >
                    <option value="">Estado de Pago</option>
                    <option value="completado">Completado</option>
                    <option value="fallido">Fallido</option>
                    <option value="pendiente">Pendiente</option>
                </select>
                <select 
                    value={filtroSuscripcion.plan}
                    onChange={(e) => setFiltroSuscripcion({...filtroSuscripcion, plan: e.target.value})}
                    className="filtro-select"
                >
                    <option value="">Plan de Suscripción</option>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                </select>
                <input 
                    type="date" 
                    value={filtroSuscripcion.fechaInicio}
                    onChange={(e) => setFiltroSuscripcion({...filtroSuscripcion, fechaInicio: e.target.value})}
                    className="filtro-input"
                />
                <input 
                    type="date" 
                    value={filtroSuscripcion.fechaFin}
                    onChange={(e) => setFiltroSuscripcion({...filtroSuscripcion, fechaFin: e.target.value})}
                    className="filtro-input"
                />
            </div>
        );
    }

    // Renderizar tabla de pagos de proyectos
    function renderPagoProyectoTable() {
        const pagosFiltrados = filtrarPagosProyectos(pagoProyecto);

        return (
            <div>
                <h2>Pagos de Proyectos</h2>
                {renderFiltrosProyecto()}
                <table className="payment-table">
                    <thead>
                        <tr>
                            <th>ID Pago</th>
                            <th>ID Usuario</th>
                            <th>Correo Electrónico</th>
                            <th>Monto</th>
                            <th>Fecha de Pago</th>
                            <th>Estado de Pago</th>
                            <th>Método de Pago</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosFiltrados.map((pago) => (
                            <tr key={pago.id_pago}>
                                <td>{pago.id_pago}</td>
                                <td>{pago.id_usuario}</td>
                                <td>{pago.correo}</td>
                                <td>{pago.monto}</td>
                                <td>{formatDateToLocale(pago.fecha_pago)}</td>
                                <td>{pago.estado_pago}</td>
                                <td>{pago.metodo_pago}</td>
                                <td>
                                    <button className="refund-btn">Reembolsar</button>
                                    <button className="dispute-btn">Resolver Disputa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pagosFiltrados.length === 0 && (
                    <div className="no-results">No se encontraron resultados</div>
                )}
            </div>
        );
    }

    // Renderizar tabla de pagos de suscripciones
    function renderPagoSuscripcionTable() {
        const pagosFiltrados = filtrarPagosSuscripciones(pagoSuscripcion);

        return (
            <div>
                <h2>Pagos de Suscripciones</h2>
                {renderFiltrosSuscripcion()}
                <table className="payment-table">
                    <thead>
                        <tr>
                            <th>ID Pago</th>
                            <th>ID Usuario</th>
                            <th>Correo Electrónico</th>
                            <th>Monto</th>
                            <th>Plan Suscripción</th>
                            <th>Fecha de Pago</th>
                            <th>Estado de Pago</th>
                            <th>Estado de Suscripción</th>
                            <th>Método de Pago</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosFiltrados.map((pago) => (
                            <tr key={pago.id_pago}>
                                <td>{pago.id_pago}</td>
                                <td>{pago.id_usuario}</td>
                                <td>{pago.correo}</td>
                                <td>{pago.monto}</td>
                                <td>{pago.plan_suscripcion}</td>
                                <td>{formatDateToLocale(pago.fecha_pago)}</td>
                                <td>{pago.estado_pago}</td>
                                <td>
                                    <span className={`badge ${((pago.estado_suscripcion || '').toLowerCase().replace(/\s+/g, '-'))}`}>
                                            {pago.estado_suscripcion || 'Sin definir'}
                                    </span>
                                </td>
                                <td>{pago.metodo_pago}</td>
                                <td>{formatDateToLocale(pago.fecha_inicio)}</td>
                                <td>{formatDateToLocale(pago.fecha_fin)}</td>
                                <td>
                                    <button className="refund-btn">Reembolsar</button>
                                    <button className="dispute-btn">Resolver Disputa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pagosFiltrados.length === 0 && (
                    <div className="no-results">No se encontraron resultados</div>
                )}
            </div>
        );
    }

    return (
        <div className="payment-tables-container">
            {renderPagoProyectoTable()}
            {renderPagoSuscripcionTable()}
        </div>
    );
}

export default PaymentTable;