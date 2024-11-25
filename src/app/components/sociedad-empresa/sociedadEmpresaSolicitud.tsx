"use client";
import React, { useState, useEffect, useContext, useRef } from "react";
import Swal from "sweetalert2";
import AppStateContext from "@context/sociedadesContext";
import { checkAuthToken } from "@utils/checkAuthToken";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import countryCodes from '@utils/countryCode';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest'; 
import get from 'lodash/get';

const SociedadEmpresaSolicitante: React.FC = () => {
    const context = useContext(AppStateContext);

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
        const userEmail = checkAuthToken();
        if (userEmail) {
            setFormData((prevData) => ({
                ...prevData,
                email: userEmail,
                confirmEmail: userEmail,
            }));
            setIsLoggedIn(true);
        }
    }, []);

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
            const emailSolicitante = get(store.request, 'emailSolicita', ''); 
            const cedulaPasaporte = get(store.request, 'cedulaPasaporte', '');

            setFormData((prevFormData) => ({
                ...prevFormData,
                nombreCompleto, 
                telefono, 
                /* emailSolicitante,  */
                cedulaPasaporte,
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
                await sendCreateRequest(""); // Send empty or default cuenta
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

    const sendCreateRequest = async (cuenta: string) => {
        try {
            const requestData = {
                nombreSolicita: formData.nombreCompleto,
                telefonoSolicita: `${countryCodes[formData.telefonoCodigo]}${formData.telefono}` || '',
                cedulaPasaporte: formData.cedulaPasaporte,
                emailSolicita: formData.email,
                actualizarPorCorreo: formData.notificaciones === "yes",
                cuenta: cuenta || "",
                precio: 150,
                subtotal: 150,
                total: 150,
                accion: "Creación de solicitud",
                tipo: "new-sociedad-empresa",
            };
            console.log("Cuenta front ", cuenta)
            const response = await axios.post("/api/create-request-empresa", requestData, {
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
                        empresa: true,
                        currentPosition: 3,
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

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">Información del Solicitante</h1>
            <p className="text-white mt-4">
                Aquí podrás agregar los datos de la persona que realizara la solicitud.
            </p>
            <hr className="mt-4" />
            <p className="text-white mt-4">
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
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            name="telefonoCodigo"
                            value={formData.telefonoCodigo}
                            onChange={handleChange}
                            className="p-4 bg-gray-800 text-white rounded-lg"
                        >
                            {Object.entries(countryCodes).map(([code, dialCode]) => (
                                <option key={code} value={code}>{code}: {dialCode}</option>
                            ))}
                        </select>
                        <input
                            ref={telefonoRef}
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefono ? 'border-2 border-red-500' : ''}`}
                            placeholder="Número de teléfono"
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
            </form>
        </div>
    );
};

export default SociedadEmpresaSolicitante;
