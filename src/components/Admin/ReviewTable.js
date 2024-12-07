import React from "react";
import './ReviewTable.css';

const reviews = [
    // Ejemplo de datos de reseñas
    { id: 1, reviewer: "Freelancer A", reviewee: "Empresa A", rating: 5, comment: "Gran experiencia!", offensive: false },
    { id: 2, reviewer: "Freelancer B", reviewee: "Empresa B", rating: 2, comment: "No cumplió con lo acordado.", offensive: false },
    { id: 3, reviewer: "Empresa A", reviewee: "Freelancer C", rating: 4, comment: "Buen trabajo.", offensive: false },
];

function ReviewsTable() {
    return (
        <table className="reviews-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Revisor</th>
                    <th>Revisado</th>
                    <th>Calificación</th>
                    <th>Comentario</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {reviews.map((review) => (
                    <tr key={review.id}>
                        <td>{review.id}</td>
                        <td>{review.reviewer}</td>
                        <td>{review.reviewee}</td>
                        <td>{review.rating}</td>
                        <td>{review.comment}</td>
                        <td>
                            <button className="delete-btn">Eliminar</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default ReviewsTable;
