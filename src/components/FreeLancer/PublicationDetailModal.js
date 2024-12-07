import React, {useState} from 'react';
import { FaLocationArrow, FaClock, FaMoneyBillAlt, FaStar,   FaTimes } from 'react-icons/fa';
import './PublicationDetailModal.css';
import { BsBookmarkPlus } from 'react-icons/bs';
import CompanyReviewModal from './CompanyReviewModal';

function PublicationDetailModal({ publication, isApplied, onClose, onApply, id_publicacion, id_usuario, userType }) {

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <>
      <div className="publication-detail-modal-overlay">
        <div className="publication-detail-modal">
          <button className="close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
          
          <div className="modal-header">
            <h2>{publication.titulo}</h2>
          </div>
          
          <div className="modal-meta-info">
            <div className="meta-item">
              <FaLocationArrow />
              <span>{publication.ubicacion}</span>
            </div>
            <div className="meta-item">
              <FaClock />
              <span>{publication.duracion_estimada}</span>
            </div>
            <div className="meta-item">
              <FaMoneyBillAlt />
              <span>{publication.presupuesto}</span>
            </div>
            <div className="meta-item">
              <FaStar />
              <span>{publication.rating} ⭐</span>
            </div>
          </div>
          
          <div className="modal-section">
            <h3>Descripción del Proyecto</h3>
            <p>{publication.descripcion}</p>
          </div>
          
          <div className="modal-section">
            <h3>Empresa</h3>
            <p>{publication.empresa}</p>
          </div>
          
          <div className="modal-section">
            <h3>Habilidades Requeridas</h3>
            {publication.habilidades ? (
              <ul>
                {publication.habilidades.split(',').map((skill, index) => (
                  <li key={index}>{skill.trim()}</li>
                ))}
              </ul>
            ) : (
              <p>No se especificaron habilidades requeridas.</p>
            )}
          </div>
          
          <button
              className="apply-button"
              disabled={isApplied}
              onClick={async () => {
              const result = await onApply(id_publicacion); // Asegurarnos de pasar id_publicacion
            }}
          >
              {isApplied ? 'Ya Aplicaste' : 'Postularme'}
          </button>
          <button 
            className="review-company-button"
            onClick={() => setIsReviewModalOpen(true)}
          >
            <strong>Dejar Reseña</strong>
          </button>
        </div>

        <CompanyReviewModal 
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewButtonClick={() => setIsReviewModalOpen(true)}
          id_identificador={id_publicacion}
          id_usuario={id_usuario}
          userType={userType}
        />
      </div>
    </>
  );
}

export default PublicationDetailModal;