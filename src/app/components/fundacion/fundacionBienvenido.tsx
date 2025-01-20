"use client";
import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/fundacionContext';
import ClipLoader from 'react-spinners/ClipLoader';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import { useRouter } from 'next/router';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import { checkAuthToken } from "@utils/checkAuthToken";
import axios from "axios";
import get from 'lodash/get';

const SociedadEmpresaBienvenido: React.FC = () => {
    const context = useContext(AppStateContext);
    const router = useRouter();
    const { id } = router.query;

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store, setStore } = context;
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const solicitudId = store.solicitudId || (Array.isArray(id) ? id[0] : id);
    const { fetchSolicitud } = useFetchSolicitud(solicitudId);

    const [formData, setFormData] = useState({
        cuenta: "",

    });

    useEffect(() => {
        const userData = checkAuthToken();
        console.log("userData ", userData)
        if (userData) {
            setFormData((prevData) => ({
                ...prevData,
                email: userData?.email,
                confirmEmail: userData?.email,
                cuenta: userData?.user_id,
            }));
            setIsLoggedIn(true);
        }
    }, []);

    useEffect(() => {
        // Solo actualiza store.solicitudId si aún no está configurado y si `id` está disponible como string
        if (!store.solicitudId && solicitudId) {
            setStore((prevState) => ({
                ...prevState,
                solicitudId: solicitudId,
            }));
        }

        // Llama a fetchSolicitud si store.solicitudId está disponible o si se acaba de establecer con `id`
        if (solicitudId) {
            fetchSolicitud();
        }
    }, [id, store.solicitudId]);

    useEffect(() => {
        if (store.request) {
            setStore((prevState) => ({
                ...prevState,
                ...(store.request?.nombreSolicita && { fundacion: true }),
                ...(store.request?.fundacion && { personas: true }),
                ...(store.request?.fundadores && { fundadores: true }),
                ...(store.request?.fundadores && { dignatarios: true }),
                ...(store.request?.dignatarios && { miembros: true }),
                ...(store.request?.miembros && { protector: true }),
                ...(store.request?.miembros && { beneficiarios: true }),
                ...(store.request?.beneficiariosFundacion && { patrimonio: true }),
                ...(store.request?.patrimonio && { poder: true }),
                ...(store.request?.patrimonio && { objetivos: true }),
                ...(store.request?.objetivos && { ingresos: true }),
                ...(store.request?.ingresos && { activos: true }),
                ...(store.request?.activos && { solicitudAdicional: true }),
            }));
        }
    }, [store.request, setStore]);

    useEffect(() => {
        if (formData.cuenta) {
            const fetchUser = async () => {
                try {
                    console.log("Cuenta ", formData.cuenta)
                    const response = await axios.get('/api/get-user-cuenta', {
                        params: { userCuenta: formData.cuenta },
                    });

                    const user = response.data;
                    console.log("Usuario ", user)
                    setStore((prevData) => ({
                        ...prevData,
                        rol: get(user, 'solicitud.rol', 0)
                    }));

                } catch (error) {
                    console.error('Failed to fetch solicitudes:', error);
                }
            };

            fetchUser();
        }
    }, [formData.cuenta]);

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
            <h1 className="text-white text-4xl font-bold texto_justificado">¡Bienvenidos a nuestro servicio de Solicitud de Fundaciones de Interés Privado en línea de Panamá!</h1>
            <p className="text-white mt-4 texto_justificado">
                Aquí puedes solicitar la creación de una Fundaciones de Interés Privado de forma sencilla y segura, totalmente en línea desde tu teléfono o computadora, y desde cualquier lugar del mundo. Las Fundaciones de Interés Privado son una excelente opción para proteger tus activos y llevar a cabo tus negocios de manera formal. Podrás optar por diferentes actividades fuera de la República de Panamá, o dentro de la República de Panamá.
            </p>

            <p className="text-white mt-4 texto_justificado">
                Podrás iniciar el trámite y continuar cuando desees.
            </p>

            <p className="text-white mt-4 texto_justificado">
                Si necesitas más información sobre las Fundaciones de Interés Privado puedes ir <a href="https://www.panamalegalgroup.com/sociedades-anonimas-en-panama/#" target="_blank">aquí</a>.
            </p>
            <p className="text-white mt-4 texto_justificado">
                También puedes obtener información <a href="/pag/faqs-sociedades" target="_blank">aquí</a>.
            </p>
            <p className="text-white mt-4 texto_justificado">
                Si necesitas asistencia previa o tienes dudas adicionales, también puedes contactarnos:
            </p>
            <p className="text-white mt-4">
                <a href="https://wa.me/50769853352" target="_blank" rel="nofollow" style={{ display: 'flex', alignItems: 'center', color: 'green', textDecoration: 'none' }}>
                    <WhatsAppIcon style={{ color: '#25D366', fontSize: '24px', marginRight: '8px' }} />
                    <span>WhatsApp</span>
                </a>
            </p>
            <p className="text-white mt-4 texto_justificado">
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
            <p className="text-white mt-4 texto_justificado">
                <strong>¿Cómo te vamos a facilitar la apertura?</strong>
            </p>

            <ol className="text-white mt-4 texto_justificado">
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
                    <b>Proceso de Registro:</b> ¡En un click! Una vez aprobada tu solicitud, procederemos con la creación legal de tu Fundación de Interés Privado.
                </li>
                <li>
                    <b>Actualizaciones en Tiempo Real:</b> Nosotros vamos a ti, sin que tengas que preguntar por tu trámite. Te mantenemos al tanto del progreso de tu solicitud a través de nuestra plataforma en línea.
                </li>
            </ol>

            <p className="text-white mt-4 texto_justificado">
                Estamos aquí para ayudarte a hacer realidad tus planes empresariales. Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos emocionados de ser parte de tu éxito empresarial!
            </p>

            <p className="text-white mt-4 texto_justificado">
                Iniciemos con la información general de la persona que está llenando el formulario, y es a quien le vamos a notificar avances. Puede ser cualquier persona mayor de edad, que no necesariamente será parte de la fundación.
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