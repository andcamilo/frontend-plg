import React, { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import axios from "axios";
import Swal from "sweetalert2";
import { checkAuthToken } from "@utils/checkAuthToken";
import get from 'lodash/get';
import { useRouter } from 'next/router';
import {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId
} from "@utils/env";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

const SolicitudForm: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [solicitudData, setSolicitudData] = useState<any>(null);

    const [formData, setFormData] = useState<{
        nombre: string;
        email: string;
        telefono: string;
        comentarios: string;
        cuenta: string;
        rol: number;
    }>({
        nombre: "",
        email: "",
        telefono: "",
        comentarios: "",
        cuenta: "",
        rol: -1,
    });

    useEffect(() => {
        if (id) {
            const fetchSolicitud = async () => {
                try {
                    const response = await axios.get('/api/get-request-id', {
                        params: { solicitudId: id },
                    });
                    setSolicitudData(response.data); // Establece solicitudData una vez obtenida
                } catch (error) {
                    console.error('Error fetching solicitud:', error);
                }
            };
            fetchSolicitud();
            console.log('ID del registro:', id);
        }
    }, [id]);

    useEffect(() => {
        if (solicitudData) {
            setFormData((prevData) => ({
                ...prevData,
                nombre: solicitudData.nombreSolicita || "",
                email: solicitudData.emailSolicita || "",
                telefono: solicitudData.telefonoSolicita || "",
                comentarios: solicitudData.comentarios || solicitudData.solicitudBase.comentarios || "",
            }));
        }
    }, [solicitudData]);


    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const userData = checkAuthToken();
        console.log("userData ", userData)
        if (userData) {
            setFormData((prevData) => ({
                ...prevData,
                email: userData?.email,
                cuenta: userData?.user_id,
            }));
            setIsLoggedIn(true);
        }
    }, []);

    useEffect(() => {
        if (formData.cuenta) {
            const fetchSolicitud = async () => {
                try {
                    const response = await axios.get('/api/get-user-cuenta', {
                        params: { userCuenta: formData.cuenta },
                    });

                    const user = response.data;
                    console.log("Usuario ", user)
                    setFormData((prevData) => ({
                        ...prevData,
                        nombre: user.solicitud?.nombre || "",
                        telefono: user.solicitud?.telefonoSolicita || "",
                        rol: get(user, 'solicitud.rol', 0)
                    }));
                } catch (error) {
                    console.error('Error fetching solicitud:', error);
                }
            };
            fetchSolicitud();
            console.log('ID del registro:', formData.cuenta);
        }
    }, [formData.cuenta]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

    };

    const [isNombreInvalid, setisNombreInvalid] = useState(false);
    const [isTelefonoInvalid, setisTelefonoInvalid] = useState(false);
    const [isEmailInvalid, setisEmailInvalid] = useState(false);

    const validateFields = () => {
        let isValid = true;

        if (formData.nombre.trim().length < 3) {
            setisNombreInvalid(true);
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese el nombre.",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                toast: true,
                background: "#2c2c3e",
                color: "#fff",
            });
            isValid = false;
        } else {
            setisNombreInvalid(false);
        }

        if (!formData.email.trim()) {
            setisEmailInvalid(true);
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese el correo electrónico.",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                toast: true,
                background: "#2c2c3e",
                color: "#fff",
                customClass: {
                    popup: 'custom-swal-popup',
                    title: 'custom-swal-title',
                    icon: 'custom-swal-icon',
                    timerProgressBar: 'custom-swal-timer-bar'
                }
            });
            isValid = false;
        } else {
            setisEmailInvalid(false);
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setisEmailInvalid(true);
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese un correo electrónico válido.",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                toast: true,
                background: "#2c2c3e",
                color: "#fff",
                customClass: {
                    popup: 'custom-swal-popup',
                    title: 'custom-swal-title',
                    icon: 'custom-swal-icon',
                    timerProgressBar: 'custom-swal-timer-bar'
                }
            });
            isValid = false;
        } else {
            setisEmailInvalid(false);
        }

        if (formData.telefono.trim().length < 3) {
            setisTelefonoInvalid(true);
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese el teléfono.",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                toast: true,
                background: "#2c2c3e",
                color: "#fff",
                customClass: {
                    popup: 'custom-swal-popup',
                    title: 'custom-swal-title',
                    icon: 'custom-swal-icon',
                    timerProgressBar: 'custom-swal-timer-bar'
                }
            });
            isValid = false;
        } else {
            setisTelefonoInvalid(false);
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateFields()) {
            return; // Detener si hay errores de validación
        }

        setIsLoading(true);
        console.log("Email ssss ", formData.email)
        try {
            const emailResult = await axios.get("/api/validate-email", {
                params: {
                    email: formData.email,
                    isLogged: isLoggedIn.toString(),
                },
            });

            const { cuenta, isLogged } = emailResult.data;

            if (isLogged && cuenta) {
                await sendCreateRequest(cuenta);
            } else if (!isLogged && cuenta) {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Este correo ya está en uso. Por favor, inicia sesión para continuar.",
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else if (!cuenta) {
                await sendCreateRequest("");
            }
        } catch (error) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Hubo un problema verificando el correo. Por favor, inténtalo de nuevo más tarde.",
                showConfirmButton: false,
                timer: 1500,
            });
            console.error("API Error:", error);
        } finally {
            setIsLoading(false);
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 2000); // Simulación de espera
    };

    const sendCreateRequest = async (cuenta: string) => {
        try {
            const requestData = {
                emailSolicita: formData.email,
                nombreSolicita: formData.nombre,
                telefonoSolicita: formData.telefono,
                comentarios: formData.comentarios,
                cuenta: cuenta,
                precio: 0,
                subtotal: 0,
                total: 0,
                accion: "Creación de solicitud",
                tipo: "cliente-recurrente",
                item: "Cliente Recurrente",
            };

            // Crear la solicitud inicial
            const response = await axios.post("/api/create-request-tramite", requestData, {
                headers: { "Content-Type": "application/json" },
            });

            const { solicitudId } = response.data;

            // Actualizar la solicitud con las URLs de los archivos
            const updatePayload = {
                solicitudId,
                archivoURLs: "",
            };

            const updateResponse = await axios.post("/api/update-request-all", updatePayload);

            if (updateResponse.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Solicitud enviada correctamente",
                    timer: 2500,
                    showConfirmButton: false,
                }).then(() => {
                    window.location.href = "/dashboard/requests";
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error al enviar la solicitud",
                text: "Por favor, inténtalo nuevamente.",
            });
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const nombreClass = `w-full p-4 bg-gray-800 text-white rounded-lg h-20 ${isNombreInvalid ? "border-2 border-red-500" : ""
        }`;
    const telefonoClass = `w-full p-4 bg-gray-800 text-white rounded-lg h-20 ${isTelefonoInvalid ? 'border-2 border-red-500' : ""
        }`;
    const emailClass = `w-full p-4 bg-gray-800 text-white rounded-lg h-20 ${isEmailInvalid ? 'border-2 border-red-500' : ""
        }`;

    return (
        <div className="w-full h-full p-8 bg-[#070707]">
            <h1 className="text-white text-3xl font-bold mb-6">Solicitud Cliente Recurrente</h1>
            <p className="text-white mb-6">
                ¡Bienvenido de nuevo! Nos complace ayudarte con tus solicitudes recurrentes. Para agilizar el proceso y garantizar un servicio rápido, por favor completa el siguiente formulario. Tu satisfacción es nuestra prioridad y agradecemos tu confianza continua en nuestros servicios.
            </p>
            <p className="text-white mb-6">
                Si tienes alguna preferencia específica o detalles adicionales, siéntete libre de incluirlos en los campos proporcionados. Gracias por elegirnos nuevamente, ¡esperamos poder atenderte!
            </p>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                    {/* Nombre */}
                    <div className="flex flex-col">
                        <label className="text-white mb-2">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className={nombreClass}
                        />
                    </div>

                    {/* E-mail */}
                    <div className="flex flex-col">
                        <label className="text-white mb-2">E-mail *</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={emailClass}
                            disabled={!!(formData.email && formData.rol < 99)} // Condición para bloquear el campo
                        />
                    </div>

                    {/* Teléfono */}
                    <div className="flex flex-col">
                        <label className="text-white mb-2">Teléfono</label>
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className={telefonoClass}
                        />
                    </div>

                    {/* Comentarios */}
                    <div className="flex flex-col">
                        <label className="text-white mb-2">Comentarios *</label>
                        <textarea
                            name="comentarios"
                            value={formData.comentarios}
                            onChange={handleChange}
                            className="p-4 bg-gray-800 text-white rounded-lg h-24"

                        />
                    </div>
                </div>

                {/* Botón */}
                <div className="flex mt-6">
                    <button
                        type="submit"
                        className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
                    >
                        Enviar
                    </button>
                </div>
            </form>
        </div>

    );

};

export default SolicitudForm;
