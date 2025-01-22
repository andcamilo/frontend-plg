import React, { useState } from 'react';
import HomeLayout from '@components/homeLayout';

const FaqComponent: React.FC = () => {
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);
    const [allExpanded, setAllExpanded] = useState(false);

    const faqItems = [
        {
            question: '¿Qué es LEGIX?',
            answer:
                'Es una plataforma de trámites legales digitales y el producto digital de Panama Legal Group, que permite a los usuarios realizar una variedad de trámites legales de manera electrónica.',
        },
        {
            question: '¿Cómo puedo rastrear el progreso de mi solicitud en tiempo real?',
            answer:
                'Nuestra plataforma en línea te permitirá seguir cada paso del proceso y recibir actualizaciones regulares garantizando así nuestro servicio.',
        },
        {
            question: '¿Tienen algún tipo de política de devolución o garantía?',
            answer:
                'En situaciones excepcionales donde una solicitud no puede ser aprobada por razones fuera de tu control, trabajaremos contigo para encontrar soluciones o ajustes necesarios.',
        },
        {
            question: '¿Qué pasa si necesito otros servicios no están en el formulario digital?',
            answer:
                'Incluye cualquier asistencia que necesites al final del requerimiento y nuestro personal se comunicará contigo para brindarte el apoyo correspondiente.',
        },
        {
            question: '¿Incluirán más trámites digitales?',
            answer:
                'Sí, estaremos incluyendo nuevos trámites digitales para brindar un mejor servicio.',
        },
        {
            question: '¿Cómo accedo a los trámites?',
            answer:
                'Escoge el proceso y llena la información general, recibirás un correo electrónico con la clave para dar seguimiento.',
        },
        {
            question: '¿Qué información se introduce en los datos generales del solicitante?',
            answer:
                'Puede ser cualquier persona que tenga el acceso al formulario, y puede gestionarlo en nombre de terceros.',
        },
        {
            question: '¿Es segura la plataforma en términos de privacidad y protección de datos?',
            answer:
                'Sí, utilizamos tecnologías de cifrado y seguimos las mejores prácticas de seguridad para proteger la información de nuestros usuarios.',
        },
        {
            question: '¿Puedo obtener asesoramiento o solicitar propuestas legales en la plataforma?',
            answer:
                'Sí, ofrecemos servicios de asesoramiento legal a través del trámite Consulta – Propuesta Legal.',
        },
        {
            question: '¿Cuáles son los costos asociados con el uso de la plataforma?',
            answer:
                'Los costos pueden variar según el tipo de trámite y los servicios adicionales que elijas.',
        },
        {
            question: '¿Qué documentos necesito para realizar un trámite específico?',
            answer:
                'Cada trámite puede requerir documentos específicos, nuestra plataforma te guiará a través de los requisitos.',
        },
        {
            question: '¿Cuánto tiempo se tarda en completar un trámite?',
            answer:
                'El tiempo necesario para completar un trámite puede variar según su complejidad y la velocidad de respuesta de las entidades gubernamentales involucradas.',
        },
        {
            question: '¿Qué sucede si tengo problemas técnicos mientras utilizo la plataforma?',
            answer:
                'Si experimentas problemas técnicos, puedes contactarte con nuestro servicio de soporte técnico para resolver cualquier inconveniente.',
        },
    ];

    const toggleQuestion = (questionNumber: number) => {
        if (allExpanded) return; // Prevent toggling individual questions if all are expanded
        setOpenQuestion(openQuestion === questionNumber ? null : questionNumber);
    };

    const handleExpandAll = () => {
        if (allExpanded) {
            setOpenQuestion(null);
            setAllExpanded(false);
        } else {
            setOpenQuestion(-1); // Indicate all questions expanded
            setAllExpanded(true);
        }
    };

    return (
        <HomeLayout>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
                <h1 style={{ color: 'white', fontWeight: 'bold', marginBottom: '24px', fontSize: '2rem' }}>FAQ</h1>

                {faqItems.map((item, index) => (
                    <div
                        key={index}
                        className="bg-[#212121] text-white mb-4 rounded-lg overflow-hidden"
                        style={{
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <div
                            className="cursor-pointer p-4 flex justify-between items-center"
                            onClick={() => toggleQuestion(index)}
                        >
                            <h2 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{index + 1}. {item.question}</h2>
                            <span
                                style={{
                                    transform: openQuestion === index || allExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.3s ease',
                                }}
                            >
                                ▼
                            </span>
                        </div>

                        {(openQuestion === index || allExpanded) && (
                            <div className="p-4 text-justify text-white">
                                {item.answer}
                            </div>
                        )}
                    </div>
                ))}

                {/* Button to toggle all questions */}
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <button
                        className="text-white uppercase text-sm"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'color 0.3s ease',
                        }}
                        onClick={handleExpandAll}
                    >
                        {allExpanded ? 'Colapsar todas las FAQ' : 'Ver todas las FAQ'}
                    </button>
                </div>
            </div>
        </HomeLayout>
    );
};

export default FaqComponent;
