import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompanyReviewModal.css';
import MessageModal from '../MessageModal';

const CompanyReviewModal = ({
  isOpen,
  onClose,
  id_identificador,
  id_usuario,
  userType,
  onReviewButtonClick
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isPerfilIncompleto, setIsPerfilIncompleto] = useState(null);
  const [showModalProject, setShowModalProject] = useState(false);

  const closeMessageModal = () => {
    setShowMessageModal(false);
  };

  const handleRatingChange = (selectedRating) => {
    setRating(selectedRating);
  };

  useEffect(() => {
    if (isPerfilIncompleto !== null) {
      if (isPerfilIncompleto === false) {
        setShowModalProject(true);
        setIsPerfilIncompleto(null);
      } else if (isPerfilIncompleto === true) {
        setMessage('Por favor, completa tu perfil para reseñar.');
        setShowMessageModal(true);
      }
    }
  }, [isPerfilIncompleto]);

  const verifyUserProfile = async () => {
    try {
      let response;
      if (userType === 'empresa') {
        response = await axios.get(`http://localhost:3001/api/empresa/${id_usuario}`);
      } else if (userType === 'freelancer') {
        response = await axios.get(`http://localhost:3001/api/freelancer/${id_usuario}`);
      } else {
        throw new Error('Tipo de usuario no válido');
      }

      if (response.data && typeof response.data.isPerfilIncompleto === "boolean") {
        return response.data.isPerfilIncompleto;
      } else {
        throw new Error("Respuesta del servidor inesperada");
      }
    } catch (error) {
      console.error(`Error al verificar el perfil de ${userType}:`, error);
      setMessage(`Error al verificar el perfil. Inténtalo de nuevo más tarde.`);
      setShowMessageModal(true);
      return null;
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Validate user type and login status
    if (!['empresa', 'freelancer'].includes(userType)) {
      setError('Tiene que iniciar sesión para reseñar.');
      return;
    }

    // Check if profile is complete
    const perfilIncompleto = await verifyUserProfile();
    if (perfilIncompleto === true) {
      setMessage('Por favor, completa tu perfil para reseñar.');
      setShowMessageModal(true);
      return;
    } else if (perfilIncompleto === null) {
      // Error occurred during profile verification
      return;
    }

    // Validate rating
    if (rating === 0) {
      setError('Por favor, selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/reviews', {
        id_usuario: id_usuario,
        calificacion: rating,
        comentario: comment,
        id_identificador: id_identificador
      });
    
      // Si el backend no genera errores
      setMessage('Reseña enviada exitosamente');
      setShowMessageModal(true);
      setTimeout(() => {
        onClose(); // Cierra el modal después de que el mensaje sea visible
      }, 1000); 
    
      // Reset form
      setRating(0);
      setComment('');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        // Usar el mensaje que viene del backend
        setError(err.response.data.message);
      } else {
        // Mensaje genérico para errores inesperados
        setError('No puedes reseñar a un usuario del mismo tipo.');
      }
    } finally {
      setIsSubmitting(false);
    }    
  };

  const StarRating = () => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => handleRatingChange(star)}
            className={`star ${star <= rating ? 'selected' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const ReviewButton = () => {
    // Only show for freelancers
    if (userType !== 'freelancer') {
      return null;
    }

    return (
      <button 
        className="review-button"
        onClick={onReviewButtonClick}
      >
        Dejar Reseña
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <h2>Califica a la Empresa</h2>
       
        <form onSubmit={handleSubmitReview}>
          <div className="form-group-resena">
            <label>Calificación</label>
            <StarRating />
          </div>

          <div className="form-group-resena">
            <label>Comentario (Opcional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu experiencia con la empresa"
              rows="4"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions-resena">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
            </button>
          </div>
        </form>
        {showMessageModal && (
          <MessageModal message={message} closeModal={closeMessageModal} />
        )}
      </div>

      {/* Render review button conditionally */}
      <ReviewButton />
    </div>
  );
};

export default CompanyReviewModal;