import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { groupBy, sumBy } from 'lodash';

const PaymentAnalytics = () => {
  const [proyectosPagos, setProyectosPagos] = useState([]);
  const [suscripcionesPagos, setSuscripcionesPagos] = useState([]);
  const [tipoVisualizacion, setTipoVisualizacion] = useState('barras');
  const [tipoGrafico, setTipoGrafico] = useState('general');
  const [filtroProyectos, setFiltroProyectos] = useState('todos');
  const [filtroSuscripciones, setFiltroSuscripciones] = useState('todos');

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const [proyectosResponse, suscripcionesResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/pagos-proyectos'),
          axios.get('http://localhost:3001/api/pagos-suscripciones')
        ]);
        setProyectosPagos(proyectosResponse.data);
        setSuscripcionesPagos(suscripcionesResponse.data);
      } catch (error) {
        console.error('Error al cargar los pagos:', error);
      }
    };

    fetchPagos();
  }, []);

  // Filtrar pagos de proyectos
  const filteredProyectosPagos = proyectosPagos.filter(pago => {
    if (filtroProyectos === 'completados') 
      return pago.estado_pago === 'completado';
    if (filtroProyectos === 'pendientes') 
      return pago.estado_pago === 'pendiente';
    return true;
  });

  // Filtrar pagos de suscripciones
  const filteredSuscripcionesPagos = suscripcionesPagos.filter(pago => {
    if (filtroSuscripciones === 'activas') 
      return pago.estado_suscripcion === 'activa';
    if (filtroSuscripciones === 'vencidas') 
      return pago.estado_suscripcion === 'expirada';
    return true;
  });

  // Agrupar pagos de proyectos por mes
  const groupedProyectosPagos = groupBy(filteredProyectosPagos, pago => {
    const fecha = new Date(pago.fecha_pago);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  });

  // Agrupar pagos de suscripciones por mes
  const groupedSuscripcionesPagos = groupBy(filteredSuscripcionesPagos, pago => {
    const fecha = new Date(pago.fecha_pago);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  });

  // Obtener meses únicos de ambos conjuntos de pagos
  const uniqueMonths = [...new Set([
    ...Object.keys(groupedProyectosPagos),
    ...Object.keys(groupedSuscripcionesPagos)
  ])].sort();

  // Preparar datos para gráfico de barras de proyectos
  const proyectosBarData = uniqueMonths.map(mes => ({
    mes,
    Proyectos: sumBy(groupedProyectosPagos[mes] || [], 'monto')
  }));

  // Preparar datos para gráfico de barras de suscripciones
  const suscripcionesBarData = uniqueMonths.map(mes => ({
    mes,
    Suscripciones: sumBy(groupedSuscripcionesPagos[mes] || [], 'monto')
  }));

  // Preparar datos para gráfico de pastel general
  const generalPieData = [
    {
      name: 'Proyectos',
      value: sumBy(filteredProyectosPagos, 'monto'),
      color: '#0088FE'
    },
    {
      name: 'Suscripciones',
      value: sumBy(filteredSuscripcionesPagos, 'monto'),
      color: '#00C49F'
    }
  ];

  // Preparar datos para gráfico de pastel de proyectos
  const proyectosPieData = [
    {
      name: 'Proyectos Pagados',
      value: sumBy(filteredProyectosPagos.filter(p => p.estado_pago === 'completado'), 'monto'),
      color: '#0088FE'
    },
    {
      name: 'Proyectos Pendientes',
      value: sumBy(filteredProyectosPagos.filter(p => p.estado_pago === 'pendiente'), 'monto'),
      color: '#00C49F'
    }
  ];

  // Preparar datos para gráfico de pastel de suscripciones
  const suscripcionesPieData = [
    {
      name: 'Suscripciones Activas',
      value: sumBy(filteredSuscripcionesPagos.filter(s => s.estado_suscripcion === 'activa'), 'monto'),
      color: '#FFBB28'
    },
    {
      name: 'Suscripciones Vencidas',
      value: sumBy(filteredSuscripcionesPagos.filter(s => s.estado_suscripcion === 'expirada'), 'monto'),
      color: '#FF8042'
    }
  ];

  const renderBarChart = (data, dataKeys, names) => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [
            new Intl.NumberFormat('es-CL', { 
              style: 'currency', 
              currency: 'CLP' 
            }).format(value), 
            name
          ]}
        />
        <Legend />
        {Array.isArray(dataKeys) ? 
          dataKeys.map((key, index) => (
            <Bar key={key} dataKey={key} fill={['#8884d8', '#82ca9d'][index]} name={names[index]} />
          )) : 
          <Bar dataKey={dataKeys} fill="#8884d8" name={names} />
        }
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = (data) => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine
          outerRadius={120}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          isAnimationActive
          label={({ name, percent, value }) => `${name}: ${(percent * 100).toFixed(0)}% (${
            new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP'
            }).format(value)
          })`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [
            new Intl.NumberFormat('es-CL', { 
              style: 'currency', 
              currency: 'CLP' 
            }).format(value), 
            'Monto'
          ]}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderContent = () => {
    const renderChartContent = () => {
      const chartTypeButtons = (
        <div className="chart-type-buttons">
          <button 
            onClick={() => setTipoGrafico('general')}
            className={`chart-type-btn ${tipoGrafico === 'general' ? 'active' : ''}`}
          >
            General
          </button>
          <button 
            onClick={() => setTipoGrafico('proyectos')}
            className={`chart-type-btn ${tipoGrafico === 'proyectos' ? 'active' : ''}`}
          >
            Proyectos
          </button>
          <button 
            onClick={() => setTipoGrafico('suscripciones')}
            className={`chart-type-btn ${tipoGrafico === 'suscripciones' ? 'active' : ''}`}
          >
            Suscripciones
          </button>
        </div>
      );

      if (tipoVisualizacion === 'barras') {
        return (
          <div className="chart-section">
            <div className="chart-filters">
              <div className="filter-group">
                <label>Proyectos:</label>
                <select 
                  value={filtroProyectos} 
                  onChange={(e) => setFiltroProyectos(e.target.value)}
                  className="custom-select"
                >
                  <option value="todos">Todos</option>
                  <option value="completados">Completados</option>
                  <option value="pendientes">Pendientes</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Suscripciones:</label>
                <select 
                  value={filtroSuscripciones} 
                  onChange={(e) => setFiltroSuscripciones(e.target.value)}
                  className="custom-select"
                >
                  <option value="todos">Todos</option>
                  <option value="activas">Activas</option>
                  <option value="vencidas">Vencidas</option>
                </select>
              </div>
            </div>
            {chartTypeButtons}
            <div className="chart-content">
              {tipoGrafico === 'proyectos' && renderBarChart(proyectosBarData, 'Proyectos', 'Pagos de Proyectos')}
              {tipoGrafico === 'suscripciones' && renderBarChart(suscripcionesBarData, 'Suscripciones', 'Pagos de Suscripciones')}
              {tipoGrafico === 'general' && renderBarChart(
                uniqueMonths.map(mes => ({
                  mes,
                  Proyectos: sumBy(groupedProyectosPagos[mes] || [], 'monto'),
                  Suscripciones: sumBy(groupedSuscripcionesPagos[mes] || [], 'monto')
                })), 
                ['Proyectos', 'Suscripciones'], 
                ['Pagos de Proyectos', 'Pagos de Suscripciones']
              )}
            </div>
          </div>
        );
      } else {
        return (
          <div className="chart-section">
            <div className="chart-filters">
              <div className="filter-group">
                <label>Proyectos:</label>
                <select 
                  value={filtroProyectos} 
                  onChange={(e) => setFiltroProyectos(e.target.value)}
                  className="custom-select"
                >
                  <option value="todos">Todos</option>
                  <option value="completados">Completados</option>
                  <option value="pendientes">Pendientes</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Suscripciones:</label>
                <select 
                  value={filtroSuscripciones} 
                  onChange={(e) => setFiltroSuscripciones(e.target.value)}
                  className="custom-select"
                >
                  <option value="todos">Todos</option>
                  <option value="activas">Activas</option>
                  <option value="vencidas">Vencidas</option>
                </select>
              </div>
            </div>
            {chartTypeButtons}
            <div className="chart-content">
              {tipoGrafico === 'general' && renderPieChart(generalPieData)}
              {tipoGrafico === 'proyectos' && renderPieChart(proyectosPieData)}
              {tipoGrafico === 'suscripciones' && renderPieChart(suscripcionesPieData)}
            </div>
          </div>
        );
      }
    };

    return renderChartContent();
  };

  return (
    <div className="payment-analytics">
      <h2>Análisis de Pagos</h2>
      <div className="chart-controls">
        <div className="visualization-toggle">
          <button 
            onClick={() => setTipoVisualizacion('barras')}
            className={`viz-toggle-btn ${tipoVisualizacion === 'barras' ? 'active' : ''}`}
          >
            Gráfico de Barras
          </button>
          <button 
            onClick={() => setTipoVisualizacion('pastel')}
            className={`viz-toggle-btn ${tipoVisualizacion === 'pastel' ? 'active' : ''}`}
          >
            Gráfico de Pastel
          </button>
        </div>
      </div>
      <div className="chart-container">
        {renderContent()}
      </div>
      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Proyectos</h3>
          <p>{sumBy(filteredProyectosPagos, 'monto').toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
        </div>
        <div className="stat-card">
          <h3>Total Suscripciones</h3>
          <p>{sumBy(filteredSuscripcionesPagos, 'monto').toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
        </div>
        <div className="stat-card">
          <h3>Total General</h3>
          <p>{(sumBy(filteredProyectosPagos, 'monto') + sumBy(filteredSuscripcionesPagos, 'monto')).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalytics;