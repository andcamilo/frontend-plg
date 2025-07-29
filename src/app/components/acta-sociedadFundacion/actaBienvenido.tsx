"use client";
import React, { useState, useEffect, useContext, useRef } from "react";
import Swal from "sweetalert2";
import AppStateContext from "@context/actaSociedadFundacionContext";
import { checkAuthToken } from "@utils/checkAuthToken";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import ReCAPTCHA from 'react-google-recaptcha';
import CountrySelect from '@components/CountrySelect';
import '@fortawesome/fontawesome-free/css/all.css';
import { FaPlay } from 'react-icons/fa';

const ActaBienvenido: React.FC = () => {
    const context = useContext(AppStateContext);
    const [recaptchaToken, setRecaptchaToken] = useState(null);

    if (!context) {
        throw new Error("AppStateContext must be used within an AppStateProvider");
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        nombreCompleto: "",
        telefono: "",
        telefonoCodigo: 'PA',
        cedulaPasaporte: "",
        email: "",
        confirmEmail: "",
        notificaciones: "",
        terminosAceptados: false,
        cuenta: "",

    });

    const [errors, setErrors] = useState({
        nombreCompleto: false,
        telefono: false,
        cedulaPasaporte: false,
        email: false,
        confirmEmail: false
    });

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailNew, setIsEmailNew] = useState(true);

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

    const handleCountryChange = (name: string, value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prevData) => ({
                ...prevData,
                [name]: checked,
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);
    useEffect(() => {
        if (store.solicitudId) {
            fetchSolicitud();
        }
    }, [store.solicitudId]);

    useEffect(() => {
        if (store.request) {
            const nombreCompleto = get(store.request, 'nombreSolicita', '');
            const telefono = get(store.request, 'telefonoSolicita', '');
            const emailFromRequest = get(store.request, 'emailSolicita', '');
            const cedulaPasaporte = get(store.request, 'cedulaPasaporte', '') || get(store.request, 'documentoSolicita', '');

            setFormData((prevFormData) => ({
                ...prevFormData,
                nombreCompleto: nombreCompleto || prevFormData.nombreCompleto,
                telefono: telefono || prevFormData.telefono,
                email: emailFromRequest || prevFormData.email,
                confirmEmail: emailFromRequest || prevFormData.confirmEmail,
                cedulaPasaporte: cedulaPasaporte || prevFormData.cedulaPasaporte,
            }));
        }
    }, [store.request]);

    const validateEmails = () => formData.email === formData.confirmEmail;

    const nombreCompletoRef = useRef<HTMLInputElement>(null);
    const telefonoRef = useRef<HTMLInputElement>(null);
    const cedulaPasaporteRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const confirmEmailRef = useRef<HTMLInputElement>(null);

    const fieldValidations = [
        { field: "nombreCompleto", ref: nombreCompletoRef, errorMessage: "Por favor, ingrese el nombre completo." },
        { field: "telefono", ref: telefonoRef, errorMessage: "Por favor, ingrese el número de teléfono." },
        { field: "cedulaPasaporte", ref: cedulaPasaporteRef, errorMessage: "Por favor, ingrese la cédula o pasaporte." },
        { field: "email", ref: emailRef, errorMessage: "Por favor, ingrese el correo electrónico." },
        { field: "confirmEmail", ref: confirmEmailRef, errorMessage: "Por favor, confirme el correo electrónico." },
    ];

    const validateFields = () => {
        for (const { field, ref, errorMessage } of fieldValidations) {
            // Verifica si el campo está vacío
            if (!formData[field]) {
                setErrors((prevErrors) => ({ ...prevErrors, [field]: true }));

                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: errorMessage,
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                    toast: true,
                    background: '#2c2c3e',
                    color: '#fff',
                    customClass: {
                        popup: 'custom-swal-popup',
                        title: 'custom-swal-title',
                        icon: 'custom-swal-icon',
                        timerProgressBar: 'custom-swal-timer-bar'
                    }
                });

                // Scroll al campo en error
                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }

                return false;
            }

            // Validación adicional para el nombre completo (mínimo 3 letras)
            if (field === 'nombreCompleto' && formData.nombreCompleto.length < 3) {
                setErrors((prevErrors) => ({ ...prevErrors, [field]: true }));

                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "El nombre debe tener al menos 3 caracteres.",
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                    toast: true,
                    background: '#2c2c3e',
                    color: '#fff',
                    customClass: {
                        popup: 'custom-swal-popup',
                        title: 'custom-swal-title',
                        icon: 'custom-swal-icon',
                        timerProgressBar: 'custom-swal-timer-bar'
                    }
                });

                // Scroll al campo en error
                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recaptchaToken) {
            alert('Please complete the reCAPTCHA');
            return;
        }
        setIsLoading(true); // Empieza el loader

        // Validación genérica para los campos vacíos
        if (!validateFields()) {
            setIsLoading(false);
            return;
        }

        // Validación de coincidencia de correos
        if (!validateEmails()) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Los correos electrónicos no coinciden",
                showConfirmButton: false,
                timer: 1500,
            });
            setIsLoading(false);
            return;
        }

        if (!formData.terminosAceptados) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debes aceptar los términos y condiciones.",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                toast: true,
                background: '#2c2c3e',
                color: '#fff',
                customClass: {
                    popup: 'custom-swal-popup',
                    title: 'custom-swal-title',
                    icon: 'custom-swal-icon',
                    timerProgressBar: 'custom-swal-timer-bar'
                }
            });

            setIsLoading(false);
            return;
        }

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

    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    const sendCreateRequest = async (cuenta: string) => {
        try {
            const requestData = {
                nombreSolicita: formData.nombreCompleto,
                telefonoSolicita: `${formData.telefonoCodigo}${formData.telefono}` || '',
                cedulaPasaporte: formData.cedulaPasaporte,
                emailSolicita: formData.email,
                actualizarPorCorreo: formData.notificaciones === "yes",
                cuenta: cuenta || "",
                precio: 1700,
                subtotal: 1700,
                total: 1700,
                accion: "Creación de solicitud",
                tipo: "acta-sociedadFundacion",
                item: "Acta Sociedad / Fundación",
            };
            const response = await axios.post("/api/create-request-consultaPropuesta", requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { solicitudId, status } = response.data;

            if (status === "success" && solicitudId) {
                Swal.fire({
                    icon: "success",
                    title: "Ya puedes continuar cargando la información de los siguientes bloques...",
                    timer: 2500,
                    showConfirmButton: false,
                    background: '#2c2c3e',
                    color: '#fff',
                    customClass: {
                        popup: 'custom-swal-popup',
                        title: 'custom-swal-title-main',
                        icon: 'custom-swal-icon',
                        timerProgressBar: 'custom-swal-timer-bar'
                    }
                }).then(() => {
                    setStore((prevState) => ({
                        ...prevState,
                        solicitudId,
                        solicitud: true,
                        currentPosition: 2,
                    }));
                });
            }
        } catch (error) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Hubo un problema enviando la solicitud. Por favor, inténtalo de nuevo más tarde.",
                showConfirmButton: false,
                timer: 1500,
            });
            console.error("Error creating request:", error);
        }
    };

    const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

    const toggleModal = () => {
        setShowModal(!showModal); // Alterna el estado del modal
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-3xl font-bold flex items-center gap-3">
                ¡Bienvenidos a nuestro servicio de Cambios a Sociedades y Fundaciones en línea de Panamá!

                <div className="flex flex-col items-center">
                    <button
                        className="w-10 h-10 bg-white text-black rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        type="button"
                        onClick={toggleModal}
                    >
                        <FaPlay className="text-sm" />
                    </button>
                    <span className="hidden md:inline text-white text-xs mt-1">Ver video</span>
                </div>
            </h1>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
                        <div className="p-4 border-b border-gray-600 flex justify-between items-center">
                            <h2 className="text-white text-xl">Información del Solicitante</h2>
                            <button
                                className="text-white"
                                onClick={toggleModal} // Cierra el modal
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div className="p-4 text-white">
                            <h5 className="text-lg">Información</h5>
                            <p className="mt-2 texto_justificado">
                                Descubre en este Clip cada detalle que te ayudará a entender el tipo de información que debes anexar en esta sección.
                                <br />
                                <br />
                                ¡No dudes en explorar nuestros videos!
                            </p>
                            <h5 className="text-lg mt-4">Video</h5>
                            <iframe
                                width="100%"
                                height="315"
                                src="https://www.youtube.com/embed/S0Fg6EPzNp8"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="p-4 border-t border-gray-600 text-right">
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md"
                                onClick={toggleModal} // Cierra el modal
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-white mt-6 space-y-3 texto_justificado">
                <p>
                    Aquí podrás solicitar cambios a sociedades o fundaciones, tales como:
                </p>
                <ul className="list-disc list-inside ml-4">
                    <li>Cambios de Agente Residente</li>
                    <li>Cambios de Junta Directiva o Consejo Fundacional</li>
                    <li>Cambio de Nombre</li>
                    <li>Cambios de objeto de la sociedad</li>
                    <li>Asignación de poderes</li>
                    <li>Aumento o disminución de capital</li>
                    <li>Cualquier otro cambio dentro de un pacto social</li>
                </ul>

                <p>
                    <strong>Debes tomar en cuenta lo siguiente:</strong>
                </p>
                <ul className="list-disc list-inside ml-4">
                    <li>
                        Deberás estar al día con los pagos de Tasa Única para que se pueda inscribir cualquier cambio, podemos gestionar la solicitud del NIT y el pago de las tasas adeudadas.
                    </li>
                    <li>
                        Se gestionan los cambios con aprobación de todos o la mayoría de los accionistas, según lo permita el pacto, por lo que te pediremos copia de las acciones en caso de que no seas aún cliente de Panama Legal Group.
                    </li>
                    <li>
                        Si la sociedad está suspendida y requiere algún proceso de reactivación, pueden aplicar costos adicionales.
                    </li>
                </ul>

                <p>
                    A continuación, debes primero llenar los datos de la persona que realiza la solicitud. No es necesario que sea accionista, director ni dignatario de la sociedad para solicitarlo, sino la persona que sería el punto de contacto de nosotros para realizar las coordinaciones necesarias.
                </p>

                <p>
                    Nuestro equipo de expertos gestionará tu trámite de forma rápida y sencilla. Te contactaremos al iniciar el proceso una vez cancelado.
                </p>
            </div>

            <hr className="my-6" />

            <p className="text-white mt-4 texto_justificado">
                Aquí podrás agregar los datos de la persona que realizara la solicitud.
            </p>

            <hr className="mt-4" />
            <p className="text-white mt-4 texto_justificado">
                <small>* Aquí se incluye la información de la persona natural que estará en contacto con nosotros para cualquier coordinación.</small>
            </p>

            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative w-full">
                        <input
                            ref={nombreCompletoRef}
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreCompleto ? 'border-2 border-red-500' : ''}`}
                            placeholder="Nombre completo"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    </div>

                    <div className="flex gap-2">
                        <CountrySelect
                            name="telefonoCodigo"
                            value={formData.telefonoCodigo}
                            onChange={(value) => handleCountryChange('telefonoCodigo', value)}
                            className="w-contain"
                        />
                        <input
                            ref={telefonoRef}
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefono ? 'border-2 border-red-500' : ''}`}
                            placeholder="Número de teléfono"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    </div>

                    <div className="relative w-full mt-2">
                        <input
                            ref={cedulaPasaporteRef}
                            type="text"
                            name="cedulaPasaporte"
                            value={formData.cedulaPasaporte}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaporte ? 'border-2 border-red-500' : ''}`}
                            placeholder="Número de cédula o Pasaporte"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    </div>

                    <div className="relative w-full mt-2">
                        <input
                            ref={emailRef}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.email ? 'border-2 border-red-500' : ''}`}
                            placeholder="Dirección de correo electrónico"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    </div>

                    <div className="relative w-full mt-2">
                        <input
                            ref={confirmEmailRef}
                            type="email"
                            name="confirmEmail"
                            value={formData.confirmEmail}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.confirmEmail ? 'border-2 border-red-500' : ''}`}
                            placeholder="Confirmar correo electrónico"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-white">¿Deseas que te notifiquemos a tu correo?</p>
                    <label className="inline-flex items-center mt-4">
                        <input
                            type="radio"
                            name="notificaciones"
                            value="yes"
                            checked={formData.notificaciones === "yes"}
                            onChange={handleChange}
                            className="form-radio"
                        />
                        <span className="ml-2 text-white">Sí, enviarme las notificaciones por correo electrónico.</span>
                    </label>
                </div>
                <div className="mt-2">
                    <label className="inline-flex items-center mt-2">
                        <input
                            type="radio"
                            name="notificaciones"
                            value="no"
                            checked={formData.notificaciones === "no"}
                            onChange={handleChange}
                            className="form-radio"
                        />
                        <span className="ml-2 text-white">No, lo reviso directamente en el sistema.</span>
                    </label>
                </div>

                <div className="mt-4">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            name="terminosAceptados"
                            checked={formData.terminosAceptados}
                            onChange={handleChange}
                            className="form-checkbox"
                        />
                        <span className="ml-2 text-white">Acepto los términos y condiciones de este servicio.</span>
                    </label>
                </div>

                <div className="mt-4">
                    <ReCAPTCHA
                        sitekey="6LejlrwqAAAAAN_WiEXqKIAT3qhfqPm-y1wh3BPi"
                        onChange={handleRecaptchaChange}
                    />
                </div>

                {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
                    <>
                        <button className="bg-profile text-white w-full py-3 rounded-lg mt-4" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <ClipLoader size={24} color="#ffffff" />
                                    <span className="ml-2">Cargando...</span>
                                </div>
                            ) : (
                                "Guardar y continuar"
                            )}
                        </button>
                    </>
                )}

                {store.request.status >= 10 && (
                    <>
                        <button
                            className="bg-profile text-white w-full py-3 rounded-lg mt-6"
                            type="button"
                            onClick={() => {
                                setStore((prevState) => ({
                                    ...prevState,
                                    currentPosition: 3,
                                }));
                            }}
                        >
                            Continuar
                        </button>
                    </>
                )}

            </form>
        </div>
    );
};

export default ActaBienvenido;
