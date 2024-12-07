import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <h2>Cargando...</h2>
      <div className="spinner"></div> 
    </div>
  );
};

export default LoadingScreen;
