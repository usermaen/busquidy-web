import React, { useState } from 'react';
import { FaLocationArrow, FaClock, FaMoneyBillAlt, FaStar } from 'react-icons/fa';
import { BsBookmarkPlus } from 'react-icons/bs';
import PublicationDetailModal from './PublicationDetailModal';
import './PublicationCard.css';

function PublicationCard({ publication, isApplied, onApply, id_usuario, userType }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className={`publication-card ${isApplied ? 'applied' : ''}`}
        onClick={openModal}
      >
        <div className="publication-header">
          <h3>{publication.titulo}</h3>
          <button className="bookmark-button">
            <BsBookmarkPlus />
          </button>
        </div>
        <div className="publication-info">
          <p><FaLocationArrow /> {publication.ubicacion}</p>
          <p><FaClock /> {publication.duracion_estimada}</p>
          <p><FaMoneyBillAlt /> {publication.presupuesto}</p>
          <p><FaStar /> {publication.rating} ⭐</p>
        </div>
        <div className="publication-company">
          <p>{publication.empresa}</p>
        </div>
      </div>

      {isModalOpen && (
        <PublicationDetailModal
            publication={publication}
            isApplied={isApplied}
            onClose={closeModal}
            onApply={onApply} // Pasar directamente onApply
            id_publicacion={publication.id_publicacion} // Pasar id_publicacion explícitamente
            id_usuario={id_usuario}
            userType={userType}
        />
      )}
    </>
  );
}

export default PublicationCard;