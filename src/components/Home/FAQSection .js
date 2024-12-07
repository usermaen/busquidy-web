import React, { useState } from 'react';
import './FAQSection.css';

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        { question: '¿Por qué debería contratar a un freelancer?', answer: 'Contratar a un freelancer te permite flexibilidad...' },
        { question: '¿En qué se diferencia Busquidy de otras plataformas?', answer: 'Busquidy se enfoca en un servicio premium...' },
        { question: '¿Cuánto cuesta registrarse?', answer: 'Registrarse en Busquidy es completamente gratis...' },
        { question: '¿Cómo puedo comunicarme con mi freelancer?', answer: 'Puedes comunicarte a través del chat integrado...' },
        { question: '¿Qué métodos de pago ofrece Busquidy?', answer: 'Ofrecemos pagos a través de tarjetas de crédito, PayPal...' },
        { question: '¿Cómo sé que recibiré el trabajo?', answer: 'Busquidy garantiza que recibirás el trabajo o tu dinero de vuelta...' },
        { question: '¿Qué debo hacer si tengo problemas con un freelancer?', answer: 'Contáctanos a través de soporte para resolver cualquier conflicto...' },
        { question: '¿Puedo trabajar con freelancers de habla hispana?', answer: 'Sí, en Busquidy puedes filtrar freelancers por idioma.' }
    ];

    return (
        <div className="faq-container">
            <h2 className="faq-title">Preguntas Frecuentes <i className="bi bi-question-circle"></i></h2> 
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                >
                    <div className="faq-question" onClick={() => toggleFAQ(index)}>
                        {faq.question}
                        <span>{activeIndex === index ? '−' : '+'}</span>
                    </div>
                    <div className="faq-answer">
                        {faq.answer}
                    </div>
                </div>
            ))}

            <p>¿Tienes una pregunta diferente? Puedes consultar <a href='#'>aquí</a></p>
        </div>
    );
};

export default FAQSection;
