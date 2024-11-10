import React, { useState } from 'react';
import HomeLayout from '@components/homeLayout';

const FaqComponent: React.FC = () => {
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    const toggleQuestion = (questionNumber: number) => {

        setOpenQuestion(openQuestion === questionNumber ? null : questionNumber);
    };

    return (
        <HomeLayout>
            <div className="flex flex-col p-8 w-full min-h-screen">

                <div className="flex items-center w-full cursor-pointer" onClick={() => toggleQuestion(1)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        1. ¿Qué es LEGIX?
                    </div>
                </div>

                {openQuestion === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Es una plataforma de trámites legales digitales y el producto digital de Panama Legal Group, que permite a los usuarios realizar una variedad de trámites legales de manera electrónica.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(2)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        2. ¿Cómo puedo rastrear el progreso de mi solicitud en tiempo real?
                    </div>
                </div>

                {openQuestion === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Nuestra plataforma en línea te permitirá seguir cada paso del proceso y recibir actualizaciones regulares garantizando así nuestro servicio.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(3)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        3. ¿Tienen algún tipo de política de devolución o garantía?
                    </div>
                </div>

                {openQuestion === 3 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            En situaciones excepcionales donde una solicitud no puede ser aprobada por razones fuera de tu control, trabajaremos contigo para encontrar soluciones o ajustes necesarios.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(4)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        4. ¿Qué pasa si necesito otros servicios no están en el formulario digital?
                    </div>
                </div>

                {openQuestion === 4 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Incluye cualquier asistencia que necesites al final del requerimiento y nuestro personal se comunicará contigo para brindarte el apoyo correspondiente.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(5)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        5. ¿Incluirán más trámites digitales?
                    </div>
                </div>

                {openQuestion === 5 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Sí, estaremos incluyendo nuevos trámites digitales para brindar un mejor servicio.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(6)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        6. ¿Cómo accedo a los trámites?
                    </div>
                </div>

                {openQuestion === 6 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Escoge el proceso y llena la información general, recibirás un correo electrónico con la clave para dar seguimiento.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(7)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        7. ¿Qué información se introduce en los datos generales del solicitante?
                    </div>
                </div>

                {openQuestion === 7 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Puede ser cualquier persona que tenga el acceso al formulario, y puede gestionarlo en nombre de terceros.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(8)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        8. ¿Es segura la plataforma en términos de privacidad y protección de datos?
                    </div>
                </div>

                {openQuestion === 8 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Sí, utilizamos tecnologías de cifrado y seguimos las mejores prácticas de seguridad para proteger la información de nuestros usuarios.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(9)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        9. ¿Puedo obtener asesoramiento o solicitar propuestas legales en la plataforma?
                    </div>
                </div>

                {openQuestion === 9 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Sí, ofrecemos servicios de asesoramiento legal a través del trámite Consulta – Propuesta Legal.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(10)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        10. ¿Cuáles son los costos asociados con el uso de la plataforma?
                    </div>
                </div>

                {openQuestion === 10 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Los costos pueden variar según el tipo de trámite y los servicios adicionales que elijas.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(11)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        11. ¿Qué documentos necesito para realizar un trámite específico?
                    </div>
                </div>

                {openQuestion === 11 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Cada trámite puede requerir documentos específicos, nuestra plataforma te guiará a través de los requisitos.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(12)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        12. ¿Cuánto tiempo se tarda en completar un trámite?
                    </div>
                </div>

                {openQuestion === 12 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            El tiempo necesario para completar un trámite puede variar según su complejidad y la velocidad de respuesta de las entidades gubernamentales involucradas.
                        </div>
                    </div>
                )}

                <div className="flex items-center w-full cursor-pointer mt-3" onClick={() => toggleQuestion(13)}>
                    <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                        13. ¿Qué sucede si tengo problemas técnicos mientras utilizo la plataforma?
                    </div>
                </div>

                {openQuestion === 13 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
                        <div className="lg:col-span-3 text-justify mx-auto">
                            Si experimentas problemas técnicos, puedes contactarte con nuestro servicio de soporte técnico para resolver cualquier inconveniente.
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-8">
                    <div className="lg:col-span-3 text-justify mx-auto">
                        Estamos aquí para responder a tus preguntas. ¡Contáctanos si necesitas más información <a href="mailto:info@panamalegalgroup.com" className="text-blue-500">aquí</a> o al
                        <a href="https://wa.me/50769853352" target="_blank" rel="noopener noreferrer" className="text-blue-500"> WhatsApp</a>!
                    </div>
                </div>

            </div>
        </HomeLayout >
    );
};

export default FaqComponent;
