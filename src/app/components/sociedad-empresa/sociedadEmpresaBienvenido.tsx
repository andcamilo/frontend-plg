"use client";
import React, { useState, useContext } from 'react';
import AppStateContext from '@context/sociedadesContext';
import ClipLoader from 'react-spinners/ClipLoader';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';



const SociedadEmpresaBienvenido: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store, setStore } = context;
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = () => {
        setIsLoading(true);
        setStore((prevState) => ({
            ...prevState,
            solicitante: true, 
            currentPosition: 2,
        }));
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">¡Bienvenidos a nuestro servicio de Solicitud de Sociedades en línea de Panamá!</h1>
            <p className="text-white mt-4">
                Aquí puedes solicitar la creación de una empresa de forma sencilla y segura, totalmente en línea desde tu teléfono o computadora, y desde cualquier lugar del mundo. Las sociedades anónimas son una excelente opción para proteger tus activos y llevar a cabo tus negocios de manera formal. Podrás optar por diferentes actividades fuera de la República de Panamá, o dentro de la República de Panamá.
            </p>

            <p className="text-white mt-4">
                Podrás iniciar el trámite y continuar cuando desees.
            </p>

            <p className="text-white mt-4">
                Si necesitas más información sobre las sociedades anónimas puedes ir <a href="https://www.panamalegalgroup.com/sociedades-anonimas-en-panama/#" target="_blank">aquí</a>.
            </p>
            <p className="text-white mt-4">
                También puedes obtener información <a href="/pag/faqs-sociedades" target="_blank">aquí</a>.
            </p>
            <p className="text-white mt-4">
                Si necesitas asistencia previa o tienes dudas adicionales, también puedes contactarnos:
            </p>
            <p className="text-white mt-4">
                <a href="https://wa.me/50769853352" target="_blank" rel="nofollow" style={{ display: 'flex', alignItems: 'center', color: 'green', textDecoration: 'none' }}>
                    <WhatsAppIcon style={{ color: '#25D366', fontSize: '24px', marginRight: '8px' }} />
                    <span>WhatsApp</span>
                </a>
            </p>
            <p className="text-white mt-4">
                Puedes solicitar tu consulta escrita, virtual o presencial <a href="/pag/consulta-legal">aquí</a>.
            </p>
            <p className="text-white mt-4">
                <a
                    href="mailto:info@panamalegalgroup.com"
                    target="_blank"
                    rel="nofollow"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'blue',
                        textDecoration: 'none',
                    }}
                >
                    <EmailIcon style={{ color: '#0000EE', fontSize: '24px', marginRight: '8px' }} />
                    <span>Email</span>
                </a>
            </p>
            <hr className="text-white mt-4"></hr>
            <p className="text-white mt-4">
                <strong>¿Cómo te vamos a facilitar la apertura?</strong>
            </p>

            <ol className="text-white mt-4">
                <li>
                    <b>Completa el Formulario:</b> ¡Dinos lo que quieres! Proporciona información básica sobre la empresa que quieres crear, como el nombre, dirección y actividad principal. Te guiamos en el formulario.
                </li>
                <li>
                    <b>Documentos Necesarios:</b> Te facilitamos la presentación de documentación para que lo realices de forma electrónica. Carga los documentos requeridos, como identificaciones de los socios, comprobante de domicilio, y otros documentos importantes.
                </li>
                <li>
                    <b>Realiza el pago:</b> Sabemos que no tienes tiempo de hacer filas, por esto habilitamos un servicio seguro de pagos en línea. Podrás realizar el pago con tarjeta de crédito, depósito o pago directo. Toma en cuenta que en caso de no ser pago con tarjeta, el proceso inicia desde el momento en que se realiza el pago y subes la información.
                </li>
                <li>
                    <b>Revisión Profesional:</b> No te preocupes si sientes que no has llenado bien la información. Nuestros abogados expertos revisarán tus documentos y te asesorarán en caso de necesitar ajustes.
                </li>
                <li>
                    <b>Proceso de Registro:</b> ¡En un click! Una vez aprobada tu solicitud, procederemos con la creación legal de tu sociedad anónima.
                </li>
                <li>
                    <b>Actualizaciones en Tiempo Real:</b> Nosotros vamos a ti, sin que tengas que preguntar por tu trámite. Te mantenemos al tanto del progreso de tu solicitud a través de nuestra plataforma en línea.
                </li>
            </ol>

            <p className="text-white mt-4">
                Estamos aquí para ayudarte a hacer realidad tus planes empresariales. Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos emocionados de ser parte de tu éxito empresarial!
            </p>

            <p className="text-white mt-4">
                Iniciemos con la información general de la persona que está llenando el formulario, y es a quien le vamos a notificar avances. Puede ser cualquier persona mayor de edad, que no necesariamente será parte de la sociedad.
            </p>

            <button
                className="bg-profile text-white w-full py-3 rounded-lg mt-4"
                type="button"
                disabled={isLoading}
                onClick={handleContinue}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <ClipLoader size={24} color="#ffffff" />
                        <span className="ml-2">Cargando...</span>
                    </div>
                ) : (
                    'Continuar'
                )}
            </button>

        </div>
    );
};

export default SociedadEmpresaBienvenido;