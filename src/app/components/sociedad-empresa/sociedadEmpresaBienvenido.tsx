"use client";
import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import ClipLoader from 'react-spinners/ClipLoader';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import { checkAuthToken } from "@utils/checkAuthToken";
import axios from "axios";
import get from 'lodash/get';
import BannerOpcionesSociedad from "../BannerOpcionesSociedad";
import BotonesPreguntasYContactos from '@components/botonesPreguntasYContactos';

const SociedadEmpresaBienvenido: React.FC = () => {
    const context = useContext(AppStateContext);
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string | undefined;

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
                ...(store.request?.nombreSolicita && { empresa: true }),
                ...(store.request?.empresa && { personas: true }),
                ...(store.request?.directores && { directores: true }),
                ...(store.request?.directores && { dignatarios: true }),
                ...(store.request?.dignatarios && { accionistas: true }),
                ...(store.request?.accionistas && { capital: true }),
                ...(store.request?.capital && { poder: true }),
                ...(store.request?.capital && { actividades: true }),
                ...(store.request?.actividades && { ingresos: true }),
                ...(store.request?.fuentesIngresos && { solicitudAdicional: true }),
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
            <h1 className="text-white text-3xl font-bold texto_justificado">¡Bienvenidos a nuestro servicio de Solicitud de Sociedades en línea de Panamá!</h1>
            <p className="text-white mt-4 texto_justificado">
                Solicita la creación de una empresa de forma sencilla y segura, totalmente en línea, a través de tu teléfono o computadora, y desde cualquier lugar del mundo.
            </p>

            <p className="text-white mt-4 texto_justificado">
                Las sociedades anónimas son una excelente opción para llevar a cabo tus negocios en cualquier lugar del mundo o administrar tus activos. Podrás optar por diferentes actividades fuera o dentro de la República de Panamá.
            </p>

            <BannerOpcionesSociedad />
            <p className="text-white mt-4 texto_justificado">
                ¡Estamos emocionados de ser parte de tu éxito empresarial!
            </p>
            <p className="text-white mt-4 texto_justificado">
                Iniciemos con la información general de la persona que está llenando el formulario, y es a quien le vamos a notificar avances. Puede ser cualquier persona mayor de edad, que no necesariamente será parte de la sociedad. Podrás iniciar el trámite, guardarlo, y continuar cuando desees. Cada formulario tendrá un video de guía.
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

            <BotonesPreguntasYContactos
                primerTexto={
                    <>
                        Acerca de las<br /> Sociedades Anónimas
                    </>
                }
                primerHref="https://panamalegalgroup.com/sociedades-anonimas-en-panama/"
                preguntasHref="/faqs-sociedades"
            />

        </div>
    );
};

export default SociedadEmpresaBienvenido;