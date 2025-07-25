"use client";
import React, { useState, useEffect, useRef, useContext } from 'react';
import Swal from "sweetalert2";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import countryCodes from '@utils/countryCode';
import get from 'lodash/get';
import Link from 'next/link';
import { checkAuthToken } from "@utils/checkAuthToken";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useParams } from "next/navigation";
import "@configuration/firebase";
import { useRouter } from "next/navigation";
import AppStateContext from "@context/consultaContext";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import CountrySelect from '@components/CountrySelect';
import ReCAPTCHA from 'react-google-recaptcha';
import WidgetLoader from '@/src/app/components/widgetLoader';
import SaleComponent from '@/src/app/components/saleComponent';
import BannerOpcionesConsulta from '@components/BannerOpcionesConsulta';
import { FaPlay } from 'react-icons/fa';
import {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId,
    firebaseProjectId
  } from '@utils/env';
import PaymentModal from '@/src/app/components/PaymentModal';
import RegisterPaymentForm from '@/src/app/components/RegisterPaymentForm';

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

const ConsultaPropuesta: React.FC = () => {
    const params = useParams();

    const id = params?.id as string | undefined;
    const [solicitudData, setSolicitudData] = useState<any>(null);
    const context = useContext(AppStateContext);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [showPaymentWidget, setShowPaymentWidget] = useState<boolean>(false);
    const [showPaymentButtons, setShowPaymentButtons] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    if (!context) {
        throw new Error("AppStateContext must be used within an AppStateProvider");
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        nombreSolicita: "",
        email: "",
        cedulaPasaporte: "",
        telefono: "",
        telefonoCodigo: 'PA',
        celular: "",
        celularCodigo: 'PA',
        emailRespuesta: "",
        empresa: "",
        tipoConsulta: "Propuesta Legal",
        areaLegal: "Migración",
        detallesPropuesta: "",
        preguntasEspecificas: "",
        notificaciones: "",
        terminosAceptados: false,
        archivoURL: "",
        consultaOficina: "Si",
        buscarCliente: "Si",
        direccionBuscar: "",
        direccionIr: "",
        cuenta: "",
        userId: "",
    });

    const [disponibilidad, setDisponibilidad] = React.useState([
        { fecha: "", horaInicio: "", horaFin: "" },
        { fecha: "", horaInicio: "", horaFin: "" },
        { fecha: "", horaInicio: "", horaFin: "" },
    ]);

    const handleDisponibilidadChange = (index, field, value) => {
        const updatedDisponibilidad = [...disponibilidad];
        updatedDisponibilidad[index][field] = value;
        setDisponibilidad(updatedDisponibilidad);

        // Eliminar errores al corregir los campos
        setErrorsDisponibilidad((prevErrors) => {
            const updatedErrors = [...prevErrors];
            updatedErrors[index][field] = false;
            return updatedErrors;
        });
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };


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

    // Actualiza formData cuando solicitudData cambia
    useEffect(() => {
        if (solicitudData) {
            setFormData({
                nombreSolicita: solicitudData.nombreSolicita || "",
                email: solicitudData.emailSolicita || "",
                cedulaPasaporte: solicitudData.cedulaPasaporte || "",
                telefono: solicitudData.telefonoSolicita || "",
                telefonoCodigo: 'PA',
                celular: solicitudData.celularSolicita || solicitudData.telefonoWhatsApp || "",
                celularCodigo: 'PA',
                emailRespuesta: solicitudData.emailRespuesta || solicitudData.aditionalEmail || "",
                empresa: solicitudData.empresaSolicita || solicitudData.nombreEmpresa || "",
                tipoConsulta: solicitudData.tipoConsulta === "Propuesta-Legal" ? "Propuesta Legal" : (solicitudData.tipoConsulta || "Propuesta Legal"),
                areaLegal: solicitudData.areaLegal || solicitudData.areasLegales || "Migración",
                detallesPropuesta: solicitudData.detallesPropuesta || solicitudData.descripcionConsulta || "",
                preguntasEspecificas: solicitudData.preguntasEspecificas || solicitudData.preguntasConsulta || "",
                notificaciones: solicitudData.actualizarPorCorreo === "si" ? "yes" : (solicitudData.actualizarPorCorreo || "No"),
                terminosAceptados: false,
                archivoURL: solicitudData.adjuntoDocumentoConsulta || "",
                consultaOficina: solicitudData.consultaOficina || "Si",
                buscarCliente: solicitudData.buscarCliente || "Si",
                direccionBuscar: solicitudData.direccionBuscar || "",
                direccionIr: solicitudData.direccionIr || "",
                cuenta: "",
                userId: "",
            });
            if (solicitudData.tipo !== "propuesta-legal" && solicitudData.tipo !== "consulta-legal"
                && solicitudData.tipo !== "consulta-escrita") {
                setDisponibilidad(solicitudData.disponibilidad.map((item) => ({
                    fecha: item.fecha || "",
                    horaInicio: item.horaInicio || "",
                    horaFin: item.horaFin || "",
                })));
            }
        }
    }, [solicitudData]);

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
                        rol: get(user, 'solicitud.rol', 0),
                    }));
                    setFormData((prevData) => ({
                        ...prevData,
                        userId: get(user, "solicitud.id", ""),
                    }));

                } catch (error) {
                    console.error('Failed to fetch solicitudes:', error);
                }
            };

            fetchUser();
        }
    }, [formData.cuenta]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setArchivoFile(file);
    };

    const uploadFileToFirebase = (file: File, path: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    const [errors, setErrors] = useState({
        nombreSolicita: false,
        email: false,
        telefono: false,
        celular: false,
        cedulaPasaporte: false,
        detallesPropuesta: false,
        direccionBuscar: false,
        direccionIr: false,
        emailRespuesta: false,
    });

    const [errorsDisponibilidad, setErrorsDisponibilidad] = useState(
        disponibilidad.map(() => ({ fecha: false, horaInicio: false, horaFin: false }))
    );

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailNew, setIsEmailNew] = useState(true);
    const [archivoFile, setArchivoFile] = useState<File | null>(null);

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

    const nombreCompletoRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const emailRespuestaRef = useRef<HTMLInputElement>(null);
    const cedulaPasaporteRef = useRef<HTMLInputElement>(null);
    const telefonoRef = useRef<HTMLInputElement>(null);
    const detallesPropuestaRef = useRef<HTMLTextAreaElement>(null);
    const direccionBuscarRef = useRef<HTMLInputElement>(null);
    const direccionIrRef = useRef<HTMLInputElement>(null);
    const fechaRefs = useRef([]);
    const horaInicioRefs = useRef([]);
    const horaFinRefs = useRef([]);

    fechaRefs.current = disponibilidad.map((_, i) => fechaRefs.current[i] || React.createRef());
    horaInicioRefs.current = disponibilidad.map((_, i) => horaInicioRefs.current[i] || React.createRef());
    horaFinRefs.current = disponibilidad.map((_, i) => horaFinRefs.current[i] || React.createRef());

    const [item, setItem] = useState("Propuesta Legal");
    const [precio, setPrecio] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [servicioAdicional, setServicioAdicional] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        // Eliminar el error cuando el campo se llena
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: false,
        }));

        if (name === "tipoConsulta") {
            switch (value) {
                case "Propuesta Legal":
                    setItem("Propuesta Legal");
                    setPrecio(0);
                    setSubtotal(0);
                    setTotal(0);
                    break;
                case "Consulta Escrita":
                    setItem("Consulta Escrita");
                    setPrecio(175);
                    setSubtotal(175);
                    setTotal(175);
                    setServicioAdicional(false);
                    break;
                case "Consulta Virtual":
                    setItem("Consulta Virtual");
                    setPrecio(50);
                    setSubtotal(50);
                    setTotal(50);
                    setServicioAdicional(false);
                    break;
                case "Consulta Presencial":
                    setItem("Consulta Presencial");
                    setPrecio(75);
                    setSubtotal(80);
                    setTotal(80);
                    setServicioAdicional(true);
                    break;
                default:
                    break;
            }
        }
    };

    const [mostrarEmailRespuesta, setMostrarEmailRespuesta] = useState(false);

    useEffect(() => {
        if (formData.emailRespuesta && formData.emailRespuesta.trim() !== "") {
            setMostrarEmailRespuesta(true);
        } else {
            setMostrarEmailRespuesta(false);
        }
    }, [formData.emailRespuesta]);

    const toggleEmailRespuesta = () => {
        setMostrarEmailRespuesta(prev => !prev);
    };

    // Actualizar el subtotal y el total cuando cambian las condiciones
    useEffect(() => {
        let newSubtotal;
        let newTotal;
        let newPrecio;

        // Verificar condición para agregar "Servicio Adicional"
        if (formData.consultaOficina === "Si" && formData.buscarCliente === "Si" && formData.tipoConsulta === "Consulta Presencial") {
            newPrecio = 75;
            newSubtotal = newPrecio + 5;

            setItem("Consulta Presencial");
            setPrecio(newPrecio);
            setSubtotal(newSubtotal);
            setTotal(newSubtotal);
            setServicioAdicional(true); // Mostrar el segundo item en la tabla
        } else if (formData.consultaOficina === "Si" && formData.buscarCliente === "No" && formData.tipoConsulta === "Consulta Presencial") {
            newPrecio = 75;
            newSubtotal = newPrecio;

            setItem("Consulta Presencial");
            setPrecio(newPrecio);
            setSubtotal(newSubtotal);
            setTotal(newSubtotal);
            setServicioAdicional(false);
        }

        if (formData.consultaOficina === "No") {
            newPrecio = 100;

            setItem("Consulta Presencial");
            setPrecio(newPrecio);
            setSubtotal(newPrecio);
            setTotal(newPrecio);
            setServicioAdicional(false);
        }

        if (formData.tipoConsulta === "Consulta Escrita") {
            setItem("Consulta Escrita");
            setPrecio(175);
            setSubtotal(175);
            setTotal(175);
            setServicioAdicional(false);
        }

        if (formData.tipoConsulta === "Consulta Virtual") {
            setItem("Consulta Virtual");
            setPrecio(50);
            setSubtotal(50);
            setTotal(50);
            setServicioAdicional(false);
        }

    }, [precio, formData.consultaOficina, formData.buscarCliente, formData.tipoConsulta]);



    const handleCountryChange = (name: string, value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validateFields = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Validación de nombreSolicita
        if (!formData.nombreSolicita) {
            setErrors((prevErrors) => ({ ...prevErrors, nombreSolicita: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese el nombre completo.",
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
            nombreCompletoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            nombreCompletoRef.current?.focus();
            return false;
        }

        // Validación de email  
        if (!formData.email) {
            setErrors((prevErrors) => ({ ...prevErrors, email: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese el correo electrónico.",
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
            emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            emailRef.current?.focus();
            return false;
        } else if (!emailPattern.test(formData.email)) {
            setErrors((prevErrors) => ({ ...prevErrors, email: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese un correo electrónico válido.",
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
            emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            emailRef.current?.focus();
            return false;
        }

        // Validación de los demás campos
        const fieldValidations = [
            { field: "cedulaPasaporte", ref: cedulaPasaporteRef, errorMessage: "Por favor, ingrese el número de cédula o pasaporte." },
            { field: "telefono", ref: telefonoRef, errorMessage: "Por favor, ingrese el número de teléfono." },
            { field: "detallesPropuesta", ref: detallesPropuestaRef, errorMessage: "Por favor, ingrese los detalles de la propuesta.", condition: formData.tipoConsulta === "Propuesta Legal" }
        ];

        for (const { field, ref, errorMessage, condition = true } of fieldValidations) {
            if (condition && !formData[field]) {
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
                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }
                return false;
            }
        }

        if (!formData.emailRespuesta && mostrarEmailRespuesta) {
            setErrors((prevErrors) => ({ ...prevErrors, emailRespuesta: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese el correo electrónico.",
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
            emailRespuestaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            emailRespuestaRef.current?.focus();
            return false;
        } else if (!emailPattern.test(formData.emailRespuesta) && mostrarEmailRespuesta) {
            setErrors((prevErrors) => ({ ...prevErrors, emailRespuesta: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese un correo electrónico válido.",
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
            emailRespuestaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            emailRespuestaRef.current?.focus();
            return false;
        }

        if (formData.tipoConsulta === "Consulta Presencial" || formData.tipoConsulta === "Consulta Virtual") {
            for (let i = 0; i < disponibilidad.length; i++) {
                const { fecha, horaInicio, horaFin } = disponibilidad[i];

                if (!fecha) {
                    setErrorsDisponibilidad((prevErrors) => {
                        const newErrors = [...prevErrors];
                        newErrors[i] = { ...newErrors[i], fecha: true };
                        return newErrors;
                    });

                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: `Por favor, seleccione una fecha para la opción ${i + 1}.`,
                        showConfirmButton: false,
                        timer: 3500,
                        timerProgressBar: true,
                        toast: true,
                        background: '#2c2c3e',
                        color: '#fff',
                    });

                    document.getElementById(`fecha-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    document.getElementById(`fecha-${i}`)?.focus();
                    return false;
                }

                if (!horaInicio) {
                    setErrorsDisponibilidad((prevErrors) => {
                        const newErrors = [...prevErrors];
                        newErrors[i] = { ...newErrors[i], horaInicio: true };
                        return newErrors;
                    });

                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: `Por favor, seleccione una hora de inicio para la opción ${i + 1}.`,
                        showConfirmButton: false,
                        timer: 3500,
                        timerProgressBar: true,
                        toast: true,
                        background: '#2c2c3e',
                        color: '#fff',
                    });

                    document.getElementById(`horaInicio-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    document.getElementById(`horaInicio-${i}`)?.focus();
                    return false;
                }

                if (!horaFin) {
                    setErrorsDisponibilidad((prevErrors) => {
                        const newErrors = [...prevErrors];
                        newErrors[i] = { ...newErrors[i], horaFin: true };
                        return newErrors;
                    });

                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: `Por favor, seleccione una hora de fin para la opción ${i + 1}.`,
                        showConfirmButton: false,
                        timer: 3500,
                        timerProgressBar: true,
                        toast: true,
                        background: '#2c2c3e',
                        color: '#fff',
                    });

                    document.getElementById(`horaFin-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                    document.getElementById(`horaFin-${i}`)?.focus();
                    return false;
                }
            }
        }

        // Validación de fechas y horarios para Consulta Presencial
        if (formData.tipoConsulta === "Consulta Presencial" || formData.tipoConsulta === "Consulta Virtual") {
            for (let i = 0; i < disponibilidad.length; i++) {
                const { fecha, horaInicio, horaFin } = disponibilidad[i];

                if (!fecha || !horaInicio || !horaFin || horaInicio >= horaFin) {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        [`disponibilidad${i}`]: true
                    }));

                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: `Por favor, complete correctamente la fecha y los horarios para la opción ${i + 1}.`,
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

                    return false;
                }
            }
        }

        if (formData.consultaOficina === "Si" && formData.buscarCliente === "Si" &&
            !formData.direccionBuscar && formData.tipoConsulta === "Consulta Presencial") {
            setErrors((prevErrors) => ({ ...prevErrors, direccionBuscar: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese la Dirección.",
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
            direccionBuscarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            direccionBuscarRef.current?.focus();
            return false;
        }

        if (formData.consultaOficina === "No" && !formData.direccionIr
            && formData.tipoConsulta === "Consulta Presencial") {
            setErrors((prevErrors) => ({ ...prevErrors, direccionIr: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese la Dirección.",
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
            direccionIrRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            direccionIrRef.current?.focus();
            return false;
        }

        // Validación de términos y condiciones
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
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!recaptchaToken) {
            alert('Please complete the reCAPTCHA');
            return;
        }

        setIsLoading(true);

        if (!validateFields()) {
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
            } else if (!cuenta) {
                await sendCreateRequest("");
            }
        } catch (error) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Hubo un problema verificando el correo. Por favor, inténtalo de nuevo más tarde.",
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
            console.error("API Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (formData.archivoURL) {
            // Si archivoURL ya tiene una URL, se puede mostrar el archivo cargado en el formulario
            console.log("Archivo adjunto cargado:", formData.archivoURL);
        }
    }, [formData.archivoURL]);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Add new useEffect for store updates
    useEffect(() => {
        if (store.solicitudId) {
            console.log("SolicitudId updated in store:", store.solicitudId);
            // Ensure the modal only opens after we have the solicitudId
            if (!open) {
                handleOpen();
            }
        }
    }, [store.solicitudId, open]);

    // Keep existing useEffect for logging
    useEffect(() => {
        console.log("Modal open state:", open);
        console.log("Store context:", store);
        console.log("Form data:", formData);
        console.log("Solicitud data:", solicitudData);
        console.log("Is logged in:", isLoggedIn);
    }, [open, store, formData, solicitudData, isLoggedIn]);

    const prepararDatos = () => {
        return disponibilidad.map((item) => ({
            fecha: item.fecha,
            horaInicio: item.horaInicio,
            horaFin: item.horaFin,
        }));
    };

    const sendCreateRequest = async (cuenta: string) => {
        try {
            const datosPreparados = prepararDatos();
            let tipo = "propuesta-legal";
            let item = "Propuesta Legal";
            console.log("Dispo ", datosPreparados)
            // Validar el tipoConsulta y asignar valores específicos a tipo e item
            if (formData.tipoConsulta === "Consulta Escrita") {
                tipo = "consulta-escrita";
                item = "Consulta Escrita";
            } else if (formData.tipoConsulta === "Consulta Virtual") {
                tipo = "consulta-virtual";
                item = "Consulta Virtual";
            } else if (formData.tipoConsulta === "Consulta Presencial") {
                tipo = "consulta-presencial";
                item = "Consulta Presencial";
            }

            const requestData = {
                nombreSolicita: formData.nombreSolicita,
                telefonoSolicita: `${countryCodes[formData.telefonoCodigo]}${formData.telefono}`,
                celularSolicita: `${countryCodes[formData.celularCodigo]}${formData.celular}`,
                cedulaPasaporte: formData.cedulaPasaporte || "",
                emailSolicita: formData.email,
                empresaSolicita: formData.empresa || "",
                tipoConsulta: formData.tipoConsulta,
                areaLegal: formData.areaLegal || "",
                detallesPropuesta: formData.detallesPropuesta || "",
                preguntasEspecificas: formData.preguntasEspecificas || "",
                actualizarPorCorreo: formData.notificaciones === "yes",
                emailRespuesta: formData.emailRespuesta || "",
                ...(formData.tipoConsulta === "Consulta Virtual" && {
                    disponibilidad: datosPreparados,
                }),
                ...(formData.tipoConsulta === "Consulta Presencial" && {
                    disponibilidad: datosPreparados,
                    consultaOficina: formData.consultaOficina || "",
                    ...(formData.consultaOficina === "Si" && {
                        buscarCliente: formData.buscarCliente || "",
                    }),
                    ...(formData.buscarCliente === "Si" && {
                        direccionBuscar: formData.direccionBuscar || "",
                    }),
                    ...(formData.consultaOficina === "No" && {
                        direccionIr: formData.direccionIr || "",
                    }),
                }),
                cuenta: cuenta || "",
                precio: precio,
                subtotal: subtotal,
                total: total,
                accion: "Creación de solicitud",
                tipo: tipo,
                item: item,
                ...(formData.tipoConsulta === "Propuesta Legal" && {
                    status: 20,
                }),
                ...(formData.tipoConsulta !== "Propuesta Legal" && {
                    status: 1,
                }),
            };
            console.log("Cuenta front ", cuenta)
            const response = await axios.post("/api/create-request-consultaPropuesta", requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { solicitudId, status } = response.data;

            let archivoURL = formData.archivoURL;
            if (archivoFile) {
                archivoURL = await uploadFileToFirebase(archivoFile, `uploads/${solicitudId}/adjuntoDocumentoConsulta`);
                setFormData((prevData) => ({
                    ...prevData,
                    archivoURL: archivoURL,
                }));

                const updatePayload = {
                    solicitudId: solicitudId,
                    adjuntoDocumentoConsulta: archivoURL || '',
                };

                const responseData = await axios.post('/api/update-request-all', updatePayload);
            }

            if (formData.tipoConsulta !== "Propuesta Legal") {
                if (status === "success" && solicitudId) {
                    handleOpen();
                    setStore((prevState) => ({
                        ...prevState,
                        solicitudId,
                    }));
                }
            } else {
                if (status === "success" && solicitudId) {
                    Swal.fire({
                        icon: "success",
                        title: "Propuesta enviada correctamente",
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
                    });
                    setStore((prevState) => ({
                        ...prevState,
                        solicitudId,
                    }));
                    window.location.href = "/dashboard/requests";
                }
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

    // PaymentModal state
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Update the payment button click handler
    const handlePaymentClick = () => {
        setLoading(true);
        setIsPaymentModalOpen(true);
        setShowPaymentWidget(false); // Hide widget if open
        setShowPaymentButtons(false);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setLoading(false);
        setShowPaymentButtons(true);
    };

    // Handle "Enviar y pagar más tarde" button click
    const handleSendAndPayLater = async () => {
        setLoading(true);
        try {
            // Update the solicitudId status to 10 using the update-request-all endpoint
            if (store.solicitudId) {
                const response = await fetch('/api/update-request-all', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        solicitudId: store.solicitudId,
                        status: 10
                    }),
                });

                if (response.ok) {
                    console.log('Solicitud status updated to 10 successfully');
                    // Redirect to login page on success
                    router.push('/login');
                } else {
                    console.error('Failed to update solicitud status');
                }
            } else {
                console.error('No solicitudId found in store');
            }
        } catch (error) {
            console.error('Error updating solicitud status:', error);
        } finally {
            setLoading(false);
        }
    };

    // Registrar Pago modal state and form
    const [isRegisterPaymentModalOpen, setIsRegisterPaymentModalOpen] = useState(false);
    const [registerPaymentForm, setRegisterPaymentForm] = useState({
        factura: '',
        monto: '',
        fecha: '',
        correo: '',
        customer_id: '',
        payment_mode: '',
        amount: '',
        invoice_id: '',
        amount_applied: '',
    });

    const handleRegisterPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterPaymentForm({
            ...registerPaymentForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegisterPaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement submit logic (API call, etc.)
        setIsRegisterPaymentModalOpen(false);
        setRegisterPaymentForm({ 
            factura: '', 
            monto: '', 
            fecha: '', 
            correo: '',
            customer_id: '',
            payment_mode: '',
            amount: '',
            invoice_id: '',
            amount_applied: '',
        });
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h2 className="text-white text-4xl font-bold flex items-center">
                Solicitud de Propuesta o Consulta Legal
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
            </h2>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
                        <div className="p-4 border-b border-gray-600 flex justify-between items-center">
                            <h2 className="text-white text-xl">Solicitud de Propuesta o Consulta Legal</h2>
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
                                src="https://www.youtube.com/embed/J3jwv5SKWrI"
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

            <hr />
            <p className="text-white mt-4 texto_justificado">
                <strong>Sabemos que puedes tener muchas dudas antes de realizar un trámite, o sólo requieres información de alguna situación o alguna propuesta de los servicios que ofrecemos, por ello, este trámite te permite hacer alguna de las siguientes solicitudes:</strong>
            </p>

            <BannerOpcionesConsulta />

            <p className="text-white mt-4 texto_justificado">
                <strong className="text-red-500">IMPORTANTE:</strong> Si elige la opción de Consultas (Escrita, Presencial o Virtual) debe tener en cuenta que la misma tiene una duración máxima de 1 hora y 30 minutos, en caso que se extienda por más tiempo esto incurrirá en aumento en su tarifa que deberán ser cancelados al momento de finalizar dicha consulta. Por lo tanto le pedimos que sea bien específico al momento de enviar el formulario para que sus dudas sean aclaradas en el tiempo propuesto y no incurrir en gastos adicionales.
            </p>

            <p className="text-white mt-4 texto_justificado">
                Si desea reprogramar una Consulta o Propuesta Virtual/Presencial, debe hacerlo con un lapso de tiempo mínimo de 5 horas antes de la fecha programada; de lo contrario, su solicitud no podrá ser reagendada y deberá esperar a ser contactado por uno de nuestros especialistas para reprogramar. Además, si incurre en esta falta, no se permitirá el reembolso de su dinero una vez que haya cancelado fuera del tiempo reglamentario. Tenga en cuenta que solo podrá hacer uso de esta opción una vez; asegúrese de que en las fechas seleccionadas podrá asistir a su consulta.
            </p>

            <p className="text-white mt-4 texto_justificado">
                Si tienes alguna duda de nuestros servicios, pueden contactarnos a:{" "}
                <Link href="mailto:info@panamalegalgroup.com" className="text-blue-500">
                    info@panamalegalgroup.com
                </Link>
            </p>

            <p className="text-white mt-4 ">
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Link
                        href="https://wa.me/50769853352"
                        target="_blank"
                        rel="nofollow"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'green',
                            textDecoration: 'none'
                        }}
                    >
                        <WhatsAppIcon style={{ color: '#25D366', fontSize: '24px', marginRight: '8px' }} />
                        <span>WhatsApp</span>
                    </Link>
                </span>
            </p>

            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-6">
                    <h2 className="block text-white text-lg font-semibold mb-2">Tipo de consulta:</h2>
                    <select
                        name="tipoConsulta"
                        value={formData.tipoConsulta}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-gray-800 text-white rounded-lg"
                        disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                    >
                        <option value="Propuesta Legal">Propuesta Legal</option>
                        <option value="Consulta Escrita">Consulta Escrita</option>
                        <option value="Consulta Virtual">Consulta Virtual</option>
                        <option value="Consulta Presencial">Consulta Presencial</option>
                    </select>
                </div>


                <div className="mb-6">
                    <h2 className="text-white text-2xl font-semibold">Información Personal</h2>
                    <>
                        <p className="text-white text-sm">* Coméntanos tu información como solicitante de la propuesta para poder contactarte.</p>
                    </>


                </div>
                <hr className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative w-full">
                        <label className="block text-white mb-2">Nombre completo de a quién va dirigida la Propuesta (persona natural):</label>
                        <input
                            ref={nombreCompletoRef}
                            type="text"
                            name="nombreSolicita"
                            value={formData.nombreSolicita}
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreSolicita ? 'border-2 border-red-500' : ''}`}
                            disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                        />
                    </div>

                    <div className="relative w-full">
                        <label className="block text-white mb-2">Dirección de correo electrónico:</label>
                        <input
                            ref={emailRef}
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.email ? 'border-2 border-red-500' : ''}`}
                            disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="relative w-full">
                        <label className="block text-white mb-2">Número de cédula o Pasaporte:</label>
                        <input
                            ref={cedulaPasaporteRef}
                            type="text"
                            name="cedulaPasaporte"
                            value={formData.cedulaPasaporte}
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaporte ? 'border-2 border-red-500' : ''}`}
                            placeholder="Número de cédula o Pasaporte"
                            disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                        />
                    </div>
                    <div className="flex flex-col col-span-1">
                        <label className="block text-white w-full">Número de teléfono:</label>
                        <div className="flex gap-2 mt-2">

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
                                onChange={handleInputChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefono ? 'border-2 border-red-500' : ''}`}
                                disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col col-span-1">
                        <label className="block text-white w-full">Número de celular / WhatsApp:</label>
                        <div className="flex gap-2 mt-2">
                            <CountrySelect
                                name="celularCodigo"
                                value={formData.celularCodigo}
                                onChange={(value) => handleCountryChange('celularCodigo', value)}
                                className="w-contain"
                            />
                            <input
                                type="text"
                                name="celular"
                                value={formData.celular}
                                onChange={handleInputChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.celular ? 'border-2 border-red-500' : ''}`}
                                disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                            />
                        </div>
                    </div>
                </div>

                {formData.tipoConsulta === "Propuesta Legal" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative w-full">
                                <button
                                    type="button"
                                    className="bg-profile text-white w-full py-4 rounded-lg mt-8"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleEmailRespuesta();
                                    }}
                                >
                                    {mostrarEmailRespuesta
                                        ? "Quitar correo electrónico para envío de propuesta"
                                        : "Adicionar correo electrónico para envío de propuesta"}
                                </button>
                            </div>

                            {mostrarEmailRespuesta && (
                                <div className="relative w-full">
                                    {/* <label className="block text-white mb-2"></label> */}
                                    <input
                                        ref={emailRespuestaRef}
                                        type="text"
                                        name="emailRespuesta"
                                        value={formData.emailRespuesta}
                                        onChange={handleInputChange}
                                        className={`w-full mt-8 p-4 bg-gray-800 text-white rounded-lg ${errors.emailRespuesta ? 'border-2 border-red-500' : ''}`}
                                        placeholder="Correo electrónico adicional para envío de propuesta:"
                                        disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="relative w-full mt-6">
                            <label className="block text-white mb-2">Si la propuesta va dirigida a una empresa, por favor incluya el nombre:</label>
                            <input
                                type="text"
                                name="empresa"
                                value={formData.empresa}
                                onChange={handleInputChange}
                                className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                            />
                        </div>
                    </>
                )}

                <div className="mb-6 mt-4">
                    <h2 className="text-white text-2xl font-semibold">Detalles de la Consulta</h2>
                </div>

                <div className="mb-6">
                    <label className="block text-white text-lg font-semibold mb-2">Área Legal:</label>
                    <select
                        name="areaLegal"
                        value={formData.areaLegal || ""}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-gray-800 text-white rounded-lg"
                        disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                    >
                        <option value="Migración">Migración</option>
                        <option value="Sociedades">Sociedades</option>
                        <option value="Comercial">Comercial</option>
                        <option value="Familia">Familia</option>
                        <option value="Penal">Penal</option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Bienes Raíces o Inmuebles">Bienes Raíces o Inmuebles</option>
                        <option value="Laboral">Laboral</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-white text-lg font-semibold mb-2">Detalles de la Solicitud de Propuesta:</label>
                    <textarea
                        ref={detallesPropuestaRef}
                        name="detallesPropuesta"
                        value={formData.detallesPropuesta}
                        onChange={handleInputChange}
                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.detallesPropuesta ? 'border-2 border-red-500' : ''}`}
                        rows={4}
                        disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                    ></textarea>
                </div>

                <div className="mb-6">
                    <label className="block text-white text-lg font-semibold mb-2">Preguntas Específicas:</label>
                    <textarea
                        name="preguntasEspecificas"
                        value={formData.preguntasEspecificas || ""}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-gray-800 text-white rounded-lg"
                        rows={4}
                        disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                    ></textarea>
                </div>

                {formData.tipoConsulta !== "Propuesta Legal" && (
                    <>
                        <div className="mb-4">
                            <label className="text-white block mb-2">Adjuntar algún documento que crea relevante.</label>
                            <input
                                type="file"
                                name="adjuntoDocumentoConsulta"
                                onChange={handleFileChange}
                                className="w-full p-2 bg-gray-800 text-white rounded-lg"
                                disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                            />
                            {formData.archivoURL && (
                                <p className="text-sm text-blue-500">
                                    <Link
                                        href={formData.archivoURL}
                                        target={formData.archivoURL.startsWith('/') ? undefined : '_blank'}
                                        rel={formData.archivoURL.startsWith('/') ? undefined : 'noopener noreferrer'}
                                    >
                                        Ver documento actual
                                    </Link>
                                </p>
                            )}
                        </div>

                        {formData.tipoConsulta !== "Consulta Escrita" && (
                            <>
                                <h2 className="text-white text-2xl font-semibold">Calendario y Disponibilidad</h2>
                                <p className="text-white text-sm texto_justificado">* Escoge tres fechas y un rango de horas en las que estás disponible, y te confirmaremos dentro de las próximas 24 horas.</p>
                                <hr className='mt-2 mb-2' />
                                <p className="text-white text-sm texto_justificado"><strong className="text-red-500">IMPORTANTE:</strong> Las consultas tienen una duración máxima de 1 hora 30 minutos, si la consulta requiere más tiempo ten en cuenta que puede incurrir en nuevos cargos.</p>
                                <hr className='mt-2 mb-2' />

                                <div className="mb-6">
                                    <h3 className="text-white text-lg font-semibold mb-4">Selecciona tu disponibilidad</h3>
                                    {disponibilidad.map((item, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex space-x-4">
                                                <div>
                                                    <label className="block text-white">Fecha {index + 1}:</label>
                                                    <input
                                                        id={`fecha-${index}`}
                                                        type="date"
                                                        value={item.fecha}
                                                        onChange={(e) => handleDisponibilidadChange(index, "fecha", e.target.value)}
                                                        className={`w-full mt-4 p-4 bg-gray-800 text-white rounded-lg ${errorsDisponibilidad[index]?.fecha ? 'border-2 border-red-500' : ''}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-white">Hora Inicio:</label>
                                                    <input
                                                        id={`horaInicio-${index}`}
                                                        type="time"
                                                        value={item.horaInicio}
                                                        onChange={(e) => handleDisponibilidadChange(index, "horaInicio", e.target.value)}
                                                        className={`w-full mt-4 p-4 bg-gray-800 text-white rounded-lg ${errorsDisponibilidad[index]?.horaInicio ? 'border-2 border-red-500' : ''}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-white">Hora Fin:</label>
                                                    <input
                                                        id={`horaFin-${index}`}
                                                        type="time"
                                                        value={item.horaFin}
                                                        onChange={(e) => handleDisponibilidadChange(index, "horaFin", e.target.value)}
                                                        className={`w-full mt-4 p-4 bg-gray-800 text-white rounded-lg ${errorsDisponibilidad[index]?.horaFin ? 'border-2 border-red-500' : ''}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>

                                {formData.tipoConsulta === "Consulta Presencial" && (
                                    <>
                                        <div className="mb-6 mt-4">
                                            <label className="block text-white text-lg font-semibold mb-2">¿Desea que la consulta sea en las oficinas de Panamá Legal Group o en una dirección específica?</label>
                                            <select
                                                name="consultaOficina"
                                                value={formData.consultaOficina || ""}
                                                onChange={handleInputChange}
                                                className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                                disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                                            >
                                                <option value="Si">Sí, en las oficinas de Panamá Legal Group.</option>
                                                <option value="No">No, otra dirección.</option>

                                            </select>
                                        </div>
                                        {formData.consultaOficina === "Si" && (
                                            <>
                                                <div className="mb-6">
                                                    <label className="block text-white text-lg font-semibold mb-2">¿Desea que lo busquemos a un lugar en específico para llegar a nuestras oficinas?</label>
                                                    <select
                                                        name="buscarCliente"
                                                        value={formData.buscarCliente || ""}
                                                        onChange={handleInputChange}
                                                        className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                                        disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                                                    >
                                                        <option value="Si">Sí</option>
                                                        <option value="No">No</option>

                                                    </select>
                                                </div>

                                                {formData.buscarCliente === "Si" && (
                                                    <>
                                                        <label className="block text-white text-lg font-semibold mb-3">Este servicio es válido para la Ciudad de Panamá, si se encuentra fuera de la Ciudad le anexáremos el cargo a su Solicitud.</label>
                                                        <div className="relative w-full">
                                                            <label className="block text-white mb-2">Indique la Dirección:</label>
                                                            <input
                                                                ref={direccionBuscarRef}
                                                                type="text"
                                                                name="direccionBuscar"
                                                                value={formData.direccionBuscar}
                                                                onChange={handleInputChange}
                                                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.direccionBuscar ? 'border-2 border-red-500' : ''}`}
                                                                disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                                                            />
                                                        </div>

                                                    </>
                                                )}
                                                {formData.buscarCliente === "No" && (
                                                    <>
                                                        <label className="block text-white text-lg font-semibold mb-3">Le estaremos confirmando la hora que lo estará atendiendo el abogado en nuestras oficinas de Panama Legal Group.</label>
                                                    </>
                                                )}

                                            </>
                                        )}
                                        {formData.consultaOficina === "No" && (
                                            <>
                                                <p className="text-white mb-4 texto_justificado"><strong className="text-red-500">NOTA:</strong> El traslado de nuestros abogados a un lugar especifico puede incurrir en gastos, tenga en cuenta que si debe movilizarse fuera de la ciudad se le anexaran gastos adicionales.</p>
                                                <div className="relative w-full">
                                                    <label className="block text-white mb-2">Indique la Dirección:</label>
                                                    <input
                                                        ref={direccionIrRef}
                                                        type="text"
                                                        name="direccionIr"
                                                        value={formData.direccionIr}
                                                        onChange={handleInputChange}
                                                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.direccionIr ? 'border-2 border-red-500' : ''}`}
                                                        disabled={solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) < 20}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {/* Tabla de costos */}
                        <div className="mt-6">
                            <h2 className="text-white text-2xl font-semibold">Costos</h2>
                            <table className="w-full mt-4 text-white border border-gray-600">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="text-left p-2">#</th>
                                        <th className="text-left p-2">Item</th>
                                        <th className="text-right p-2">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-600">
                                        <td className="p-2">1</td>
                                        <td className="p-2">{item}</td>
                                        <td className="text-right p-2">${precio}</td>
                                    </tr>
                                    {/* Mostrar Servicio Adicional si aplica */}
                                    {servicioAdicional && (
                                        <tr className="border-b border-gray-600">
                                            <td className="p-2">2</td>
                                            <td className="p-2">Servicio Adicional</td>
                                            <td className="text-right p-2">$5.00</td>
                                        </tr>
                                    )}
                                    <tr className="border-b border-gray-600">
                                        <td colSpan={2} className="text-right p-2">Subtotal</td>
                                        <td className="text-right p-2">${subtotal.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-600">
                                        <td colSpan={2} className="text-right p-2">Total</td>
                                        <td className="text-right p-2">${total.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                <div className="mt-4">
                    <p className="text-white">¿Deseas que te notifiquemos a tu correo?</p>
                    <label className="inline-flex items-center mt-4">
                        <input
                            type="radio"
                            name="notificaciones"
                            value="yes"
                            checked={formData.notificaciones === "yes"}
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                {formData.tipoConsulta === "Propuesta Legal" && (
                    <>
                        {((solicitudData && solicitudData.status < 10) || (solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) > 19)) && (
                            <>
                                <button className="bg-profile text-white w-full py-3 rounded-lg mt-4" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <ClipLoader size={24} color="#ffffff" />
                                            <span className="ml-2">Cargando...</span>
                                        </div>
                                    ) : (
                                        "Enviar Solicitud"
                                    )}
                                </button>
                            </>
                        )}

                        {!solicitudData && (
                            <>
                                <button className="bg-profile text-white w-full py-3 rounded-lg mt-4" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <ClipLoader size={24} color="#ffffff" />
                                            <span className="ml-2">Cargando...</span>
                                        </div>
                                    ) : (
                                        "Enviar Solicitud"
                                    )}
                                </button>
                            </>
                        )}

                        {solicitudData && solicitudData.status >= 10 && (
                            <>
                                <button
                                    className="bg-profile text-white w-full py-3 rounded-lg mt-6"
                                    type="button"
                                    onClick={() => {
                                        window.location.href = "/dashboard/requests";
                                    }}
                                >
                                    Volver
                                </button>
                            </>
                        )}
                    </>
                )}

                {formData.tipoConsulta !== "Propuesta Legal" && (
                    <>
                        {!solicitudData && (
                            <>
                                {showPaymentButtons && (
                                    <div className="mt-8">
                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={handlePaymentClick}
                                                disabled={loading}
                                                className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                                            >
                                                {loading ? 'Cargando...' : 'Pagar en línea'}
                                            </button>

                                            <button
                                                onClick={handleSendAndPayLater}
                                                disabled={loading}
                                                className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                                            >
                                                {loading ? 'Procesando...' : 'Enviar y pagar más tarde'}
                                            </button>

                                            <button
                                                className="bg-profile text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                                                onClick={() => setIsRegisterPaymentModalOpen(true)}
                                            >
                                                Registrar Pago
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showPaymentWidget && <WidgetLoader />}

                                {store.token && (
                                    <div className="mt-8"><SaleComponent saleAmount={150} /></div>
                                )}

                            </>
                        )}

                        {((solicitudData && solicitudData.status < 10) || (solicitudData && solicitudData.status >= 10 && (store?.rol ?? Number.POSITIVE_INFINITY) > 19)) && (
                            <>
                                {showPaymentButtons && (
                                    <div className="mt-8">
                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={handlePaymentClick}
                                                disabled={loading}
                                                className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                                            >
                                                {loading ? 'Cargando...' : 'Pagar en línea'}
                                            </button>

                                            <button
                                                onClick={handleSendAndPayLater}
                                                disabled={loading}
                                                className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                                            >
                                                {loading ? 'Procesando...' : 'Enviar y pagar más tarde'}
                                            </button>

                                            <button
                                                className="bg-profile text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                                                onClick={() => setIsRegisterPaymentModalOpen(true)}
                                            >
                                                Registrar Pago
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showPaymentWidget && <WidgetLoader />}

                                {store.token && (
                                    <div className="mt-8"><SaleComponent saleAmount={150} /></div>
                                )}

                            </>
                        )}

                        {solicitudData && solicitudData.status >= 10 && (
                            <>
                                <button
                                    className="bg-profile text-white w-full py-3 rounded-lg mt-6"
                                    type="button"
                                    onClick={() => {
                                        window.location.href = "/dashboard/requests";
                                    }}
                                >
                                    Volver
                                </button>
                            </>
                        )}
                    </>
                )}

            </form>

            {/* PaymentModal */}
            {isPaymentModalOpen && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={handleClosePaymentModal}
                    saleAmount={150}
                />
            )}

            {/* Registrar Pago Modal */}
            {isRegisterPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-900 rounded-lg w-11/12 max-w-md p-6 relative">
                        <button
                            className="absolute top-2 right-2 text-white text-xl"
                            onClick={() => setIsRegisterPaymentModalOpen(false)}
                        >
                            ✕
                        </button>
                        <h2 className="text-white text-2xl font-bold mb-4">Registrar Pago</h2>
                        <RegisterPaymentForm
                            onClose={() => setIsRegisterPaymentModalOpen(false)}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default ConsultaPropuesta;
