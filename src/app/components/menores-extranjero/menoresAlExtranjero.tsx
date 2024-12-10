"use client";
import React, { useState, useEffect, useRef } from 'react';
import Swal from "sweetalert2";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import countryCodes from '@utils/countryCode';
import { checkAuthToken } from "@utils/checkAuthToken";
import { useRouter } from 'next/router';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId
} from '@utils/env';

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

const MenoresAlExtranjero: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [solicitudData, setSolicitudData] = useState<any>(null);

    const [formData, setFormData] = useState({
        nombreCompleto: "",
        email: "",
        cedulaPasaporte: "",
        telefono: "",
        telefonoCodigo: 'PA',
        nacionalidad: 'Panamá',
        terminosAceptados: false,
        ustedAutoriza: "Si",
        notificaciones: "",

        //Autorizante
        nombreCompletoAutorizante: "",
        emailAutorizante: "",
        telefonoAutorizante: "",
        cedulaPasaporteAutorizante: "",
        parentescoConMenor: "Padre",
        parentescoConMenorOtros: "",
        telefonoCodigoAutorizante: "PA",

        //Autorizacion a tercero
        autorizacionTercero: "No",
        quienesAutorizan: "Tutor Legal",

        //Tutor
        nombreCompletoTutor: "",
        emailTutor: "",
        cedulaPasaporteTutor: "",
        telefonoTutor: "",
        telefonoCodigoTutor: 'PA',

        //Padre
        nombreCompletoPadre: "",
        emailPadre: "",
        cedulaPasaportePadre: "",
        telefonoPadre: "",
        telefonoCodigoPadre: 'PA',

        //Madre
        nombreCompletoMadre: "",
        emailMadre: "",
        cedulaPasaporteMadre: "",
        telefonoMadre: "",
        telefonoCodigoMadre: 'PA',

        //Autorizado
        nombreCompletoAutorizado: "",
        emailAutorizado: "",
        telefonoAutorizado: "",
        cedulaPasaporteAutorizado: "",
        parentescoConMenorAutorizado: "Padre",
        parentescoAutorizadoOtros: "",
        telefonoCodigoAutorizado: "PA",
        nacionalidadAutorizado: 'Panamá',
        fechaSalidaMenor: "",
        fechaRetornoMenor: "",
        fechaFirmaNotaria: "",

        //Adjuntos
        adjuntoIdentificacionAutorizante: null as File | null,
        archivoAutorizanteURL: "",
        adjuntoTutelaMenor: null as File | null,
        archivoTutelaURL: "",
        adjuntoIdentificacionTutor: null as File | null,
        archivoTutorURL: "",
        adjuntoTutorTutelaMenor: null as File | null,
        archivoTutorTutelaURL: "",
        adjuntoIdentificacionPadre: null as File | null,
        archivoPadreURL: "",
        adjuntoIdentificacionMadre: null as File | null,
        archivoMadreURL: "",
        adjuntoIdentificacionAutorizado: null as File | null,
        archivoAutorizadoURL: "",
        adjuntoBoletosViaje: null as File | null,
        archivoBoletosViajeURL: "",
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

    const formatDateForInput = (dateString: string) => {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
    };

    // Actualiza formData cuando solicitudData cambia
    useEffect(() => {
        if (solicitudData) {
            setFormData({
                nombreCompleto: solicitudData.nombreSolicita || "",
                email: solicitudData.emailSolicita || "",
                cedulaPasaporte: solicitudData.cedulaPasaporte || "",
                telefono: solicitudData.telefonoSolicita || "",
                telefonoCodigo: 'PA',
                nacionalidad: solicitudData.nacionalidad || "",
                terminosAceptados: false,
                ustedAutoriza: solicitudData.ustedAutoriza || "",
                notificaciones: solicitudData.notificaciones || "",

                //Autorizante
                ...(solicitudData.autorizante && {
                    nombreCompletoAutorizante: solicitudData.autorizante.nombreCompletoAutorizante || "",
                    emailAutorizante: solicitudData.autorizante.emailAutorizante || "",
                    telefonoAutorizante: solicitudData.autorizante.telefonoAutorizante || "",
                    cedulaPasaporteAutorizante: solicitudData.autorizante.cedulaPasaporteAutorizante || "",
                    parentescoConMenor: solicitudData.autorizante.parentescoConMenor || "Padre",
                    parentescoConMenorOtros: solicitudData.autorizante.parentescoConMenorOtros || "",
                    telefonoCodigoAutorizante: solicitudData.autorizante.telefonoCodigoAutorizante || "PA",
                }),

                //Autorizacion a tercero
                autorizacionTercero: solicitudData?.autorizacionTercero || "No",
                quienesAutorizan: solicitudData?.quienesAutorizan || "Tutor Legal",

                //Tutor
                ...(solicitudData.tutor && {
                    nombreCompletoTutor: solicitudData.tutor.nombreCompletoTutor || "",
                    emailTutor: solicitudData.tutor.emailTutor || "",
                    cedulaPasaporteTutor: solicitudData.tutor.cedulaPasaporteTutor || "",
                    telefonoTutor: solicitudData.tutor.telefonoTutor || "",
                    telefonoCodigoTutor: 'PA',
                }),

                //Padre
                ...(solicitudData.padre && {
                    nombreCompletoPadre: solicitudData.padre.nombreCompletoPadre || "",
                    emailPadre: solicitudData.padre.emailPadre || "",
                    cedulaPasaportePadre: solicitudData.padre.cedulaPasaportePadre || "",
                    telefonoPadre: solicitudData.padre.telefonoPadre || "",
                    telefonoCodigoPadre: solicitudData.padre.telefonoCodigoPadre || 'PA',
                }),

                //Madre
                ...(solicitudData.madre && {
                    nombreCompletoMadre: solicitudData.madre.nombreCompletoMadre || "",
                    emailMadre: solicitudData.madre.emailMadre || "",
                    cedulaPasaporteMadre: solicitudData.madre.cedulaPasaporteMadre || "",
                    telefonoMadre: solicitudData.madre.telefonoMadre || "",
                    telefonoCodigoMadre: 'PA',
                }),

                //Autorizado
                nombreCompletoAutorizado: solicitudData.autorizado.nombreCompletoAutorizado || "",
                emailAutorizado: solicitudData.autorizado.emailAutorizado || "",
                telefonoAutorizado: solicitudData.autorizado.telefonoAutorizado || "",
                cedulaPasaporteAutorizado: solicitudData.autorizado.cedulaPasaporteAutorizado || "",
                parentescoConMenorAutorizado: solicitudData.autorizado.parentescoConMenorAutorizado || "Padre",
                parentescoAutorizadoOtros: solicitudData.autorizado.parentescoAutorizadoOtros || "",
                telefonoCodigoAutorizado: "PA",
                nacionalidadAutorizado: solicitudData.autorizado.nacionalidadAutorizado || 'Panamá',
                fechaSalidaMenor: solicitudData.autorizado.fechaSalidaMenor ? formatDateForInput(solicitudData.autorizado.fechaSalidaMenor) : "",
                fechaRetornoMenor: solicitudData.autorizado.fechaRetornoMenor ? formatDateForInput(solicitudData.autorizado.fechaRetornoMenor) : "",
                fechaFirmaNotaria: solicitudData.autorizado.fechaFirmaNotaria ? formatDateForInput(solicitudData.autorizado.fechaFirmaNotaria) : "",

                //Adjuntos
                adjuntoIdentificacionAutorizante: null as File | null,
                archivoAutorizanteURL: solicitudData?.adjuntoIdentificacionAutorizante || "",
                adjuntoTutelaMenor: null as File | null,
                archivoTutelaURL: solicitudData?.adjuntoTutelaMenor || "",
                adjuntoIdentificacionTutor: null as File | null,
                archivoTutorURL: solicitudData?.adjuntoIdentificacionTutor || "",
                adjuntoTutorTutelaMenor: null as File | null,
                archivoTutorTutelaURL: solicitudData?.adjuntoTutorTutelaMenor || "",
                adjuntoIdentificacionPadre: null as File | null,
                archivoPadreURL: solicitudData?.adjuntoIdentificacionPadre || "",
                adjuntoIdentificacionMadre: null as File | null,
                archivoMadreURL: solicitudData?.adjuntoIdentificacionMadre || "",
                adjuntoIdentificacionAutorizado: null as File | null,
                archivoAutorizadoURL: solicitudData?.adjuntoIdentificacionAutorizado || "",
                adjuntoBoletosViaje: null as File | null,
                archivoBoletosViajeURL: solicitudData?.adjuntoBoletosViaje || "",
            });

            if (solicitudData.menores) {
                const menoresData = solicitudData.menores.map((menor: any) => ({
                    nombreCompletoMenor: menor.nombreCompletoMenor || "",
                    cedulaPasaporteMenor: menor.cedulaPasaporteMenor || "",
                    AdjuntoIdentificacionMenor: menor.AdjuntoIdentificacionMenorURL || ""
                }));
                setMenores(menoresData);
            }
        }
    }, [solicitudData]);

    useEffect(() => {
        if (formData.archivoAutorizanteURL) {
        } else if (formData.archivoTutelaURL) {
        } else if (formData.archivoTutorURL) {
        } else if (formData.archivoTutorTutelaURL) {
        } else if (formData.archivoAutorizadoURL) {
        }
    }, [formData.archivoAutorizanteURL, formData.archivoTutelaURL, formData.archivoTutorURL,
    formData.archivoTutorTutelaURL, formData.archivoAutorizadoURL]);

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
        nombreCompleto: false,
        email: false,
        telefono: false,
        cedulaPasaporte: false,
        telefonoAutorizante: false,
        nombreCompletoAutorizante: false,
        emailAutorizante: false,
        cedulaPasaporteAutorizante: false,
        parentescoConMenorOtros: false,
        adjuntoIdentificacionAutorizante: false,
        adjuntoTutelaMenor: false,
        nombreCompletoTutor: false,
        emailTutor: false,
        telefonoTutor: false,
        cedulaPasaporteTutor: false,
        telefonoAutorizanteTutor: false,
        adjuntoIdentificacionTutor: false,
        adjuntoTutorTutelaMenor: false,
        adjuntoIdentificacionPadre: false,
        adjuntoIdentificacionMadre: false,
        nombreCompletoMadre: false,
        emailMadre: false,
        telefonoMadre: false,
        cedulaPasaporteMadre: false,
        nombreCompletoPadre: false,
        emailPadre: false,
        telefonoPadre: false,
        cedulaPasaportePadre: false,
        menores: [{ nombreCompletoMenor: false, cedulaPasaporteMenor: false, AdjuntoIdentificacionMenor: false }],
        nombreCompletoAutorizado: false,
        telefonoAutorizado: false,
        emailAutorizado: false,
        cedulaPasaporteAutorizado: false,
        parentescoConMenorAutorizado: false,
        parentescoAutorizadoOtros: false,
        adjuntoIdentificacionAutorizado: false,
        fechaSalidaMenor: false,
        fechaRetornoMenor: false,
        fechaFirmaNotaria: false,
        adjuntoBoletosViaje: false,
    });

    // Estado para almacenar múltiples menores
    const [menores, setMenores] = useState<Menor[]>([
        { nombreCompletoMenor: "", cedulaPasaporteMenor: "", AdjuntoIdentificacionMenor: null }
    ]);

    const menoresRefs = useRef<Array<{ nombreCompletoMenor: HTMLInputElement | null; cedulaPasaporteMenor: HTMLInputElement | null; AdjuntoIdentificacionMenor: HTMLInputElement | null }>>([]);
    useEffect(() => {
        // Aseguramos que el array de referencias tenga el mismo tamaño que el número de menores
        menoresRefs.current = menores.map((_, index) => ({
            nombreCompletoMenor: menoresRefs.current[index]?.nombreCompletoMenor || null,
            cedulaPasaporteMenor: menoresRefs.current[index]?.cedulaPasaporteMenor || null,
            AdjuntoIdentificacionMenor: menoresRefs.current[index]?.AdjuntoIdentificacionMenor || null,
        }));
    }, [menores]);


    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailNew, setIsEmailNew] = useState(true);
    const [archivoFile, setArchivoFile] = useState<File | null>(null);
    const [archivoTutelaFile, setArchivoTutelaFile] = useState<File | null>(null);
    const [archivoTutorFile, setArchivoTutorFile] = useState<File | null>(null);
    const [archivoTutorTutelaFile, setArchivoTutorTutelaFile] = useState<File | null>(null);
    const [archivoPadreFile, setArchivoPadreFile] = useState<File | null>(null);
    const [archivoMadreFile, setArchivoMadreFile] = useState<File | null>(null);
    const [archivoAutorizadoFile, setArchivoAutorizadoFile] = useState<File | null>(null);
    const [archivoBoletosViajeFile, setArchivoBoletosViajeFile] = useState<File | null>(null);

    const [item, setItem] = useState("Salida de Menores al Extranjero");
    const [precio, setPrecio] = useState(75);
    const [subtotal, setSubtotal] = useState(75);
    const [total, setTotal] = useState(75);

    const nombreCompletoRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const cedulaPasaporteRef = useRef<HTMLInputElement>(null);
    const telefonoRef = useRef<HTMLInputElement>(null);
    const nombreCompletoAutorizanteRef = useRef<HTMLInputElement>(null);
    const emailAutorizanteRef = useRef<HTMLInputElement>(null);
    const telefonoAutorizanteRef = useRef<HTMLInputElement>(null);
    const cedulaPasaporteAutorizanteRef = useRef<HTMLInputElement>(null);
    const parentescoConMenorOtrosRef = useRef<HTMLInputElement>(null);
    const adjuntoIdentificacionAutorizanteRef = useRef<HTMLInputElement>(null);
    const adjuntoTutelaMenorRef = useRef<HTMLInputElement>(null);
    const nombreCompletoTutorRef = useRef<HTMLInputElement>(null);
    const emailTutorRef = useRef<HTMLInputElement>(null);
    const cedulaPasaporteTutorRef = useRef<HTMLInputElement>(null);
    const telefonoTutorRef = useRef<HTMLInputElement>(null);
    const adjuntoIdentificacionTutorRef = useRef<HTMLInputElement>(null);
    const adjuntoTutorTutelaMenorRef = useRef<HTMLInputElement>(null);
    const adjuntoIdentificacionPadreRef = useRef<HTMLInputElement>(null);
    const adjuntoIdentificacionMadreRef = useRef<HTMLInputElement>(null);
    const nombreCompletoMadreRef = useRef<HTMLInputElement>(null);
    const emailMadreRef = useRef<HTMLInputElement>(null);
    const cedulaPasaporteMadreRef = useRef<HTMLInputElement>(null);
    const telefonoMadreRef = useRef<HTMLInputElement>(null);
    const nombreCompletoPadreRef = useRef<HTMLInputElement>(null);
    const emailPadreRef = useRef<HTMLInputElement>(null);
    const cedulaPasaportePadreRef = useRef<HTMLInputElement>(null);
    const telefonoPadreRef = useRef<HTMLInputElement>(null);
    const nombreCompletoAutorizadoRef = useRef<HTMLInputElement>(null);
    const emailAutorizadoRef = useRef<HTMLInputElement>(null);
    const telefonoAutorizadoRef = useRef<HTMLInputElement>(null);
    const cedulaPasaporteAutorizadoRef = useRef<HTMLInputElement>(null);
    const parentescoAutorizadoOtrosRef = useRef<HTMLInputElement>(null);
    const adjuntoIdentificacionAutorizadoRef = useRef<HTMLInputElement>(null);
    const fechaSalidaMenorRef = useRef<HTMLInputElement>(null);
    const fechaRetornoMenorRef = useRef<HTMLInputElement>(null);
    const fechaFirmaNotariaRef = useRef<HTMLInputElement>(null);
    const adjuntoBoletosViajeRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: false,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        const fieldName = e.target.name;

        if (fieldName === "AdjuntoIdentificacionAutorizante") {
            setArchivoFile(file);
            // Eliminar el error visual si se carga un archivo
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoIdentificacionAutorizante: false,
            }));
        } else if (fieldName === "adjuntoTutelaMenor") {
            setArchivoTutelaFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoTutelaMenor: false,
            }));
        } else if (fieldName === "adjuntoIdentificacionTutor") {
            setArchivoTutorFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoIdentificacionTutor: false,
            }));
        } else if (fieldName === "adjuntoTutorTutelaMenor") {
            setArchivoTutorTutelaFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoTutorTutelaMenor: false,
            }));
        } else if (fieldName === "adjuntoIdentificacionPadre") {
            setArchivoPadreFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoIdentificacionPadre: false,
            }));
        } else if (fieldName === "adjuntoIdentificacionMadre") {
            setArchivoMadreFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoIdentificacionMadre: false,
            }));
        } else if (fieldName.startsWith("AdjuntoIdentificacionMenor")) {
            const index = parseInt(fieldName.replace("AdjuntoIdentificacionMenor", ""));
            const updatedMenores = [...menores];
            updatedMenores[index] = { ...updatedMenores[index], AdjuntoIdentificacionMenor: file };
            setMenores(updatedMenores);
        } else if (fieldName === "adjuntoIdentificacionAutorizado") {
            setArchivoAutorizadoFile(file);
            // Eliminar el error visual si se carga un archivo
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoIdentificacionAutorizado: false,
            }));
        } else if (fieldName === "adjuntoBoletosViaje") {
            setArchivoBoletosViajeFile(file);
            // Eliminar el error visual si se carga un archivo
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoBoletosViaje: false,
            }));
        }
    };


    const validateFields = () => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.nombreCompleto) {
            setErrors((prevErrors) => ({ ...prevErrors, nombreCompleto: true }));
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

        const fieldValidations = [

            { field: "cedulaPasaporte", ref: cedulaPasaporteRef, errorMessage: "Por favor, ingrese el número de cédula o pasaporte." },
            { field: "telefono", ref: telefonoRef, errorMessage: "Por favor, ingrese el número de teléfono." },
        ];

        for (const { field, ref, errorMessage } of fieldValidations) {
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
                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }
                return false;
            }
        }

        if (formData.ustedAutoriza === "No") {
            if (!formData.nombreCompletoAutorizante) {
                setErrors((prevErrors) => ({ ...prevErrors, nombreCompletoAutorizante: true }));
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "Por favor, ingrese el nombre completo del autorizante.",
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
                nombreCompletoAutorizanteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                nombreCompletoAutorizanteRef.current?.focus();
                return false;
            }

            if (!formData.emailAutorizante) {
                setErrors((prevErrors) => ({ ...prevErrors, emailAutorizante: true }));
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "Por favor, ingrese el correo electrónico del autorizante.",
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
                emailAutorizanteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                emailAutorizanteRef.current?.focus();
                return false;
            } else if (!emailPattern.test(formData.emailAutorizante)) {
                setErrors((prevErrors) => ({ ...prevErrors, emailAutorizante: true }));
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "Por favor, ingrese un correo electrónico válido para el autorizante.",
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
                emailAutorizanteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                emailAutorizanteRef.current?.focus();
                return false;
            }

            if (!formData.telefonoAutorizante) {
                fieldValidations.push(
                    { field: "telefonoAutorizante", ref: telefonoAutorizanteRef, errorMessage: "Por favor, ingrese el número de teléfono del autorizante." },
                );
            }

            if (!formData.cedulaPasaporteAutorizante) {
                fieldValidations.push(
                    { field: "cedulaPasaporteAutorizante", ref: cedulaPasaporteAutorizanteRef, errorMessage: "Por favor, ingrese el número de cédula o pasaporte del autorizante." },
                );
            }

            for (const { field, ref, errorMessage } of fieldValidations) {
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
                    if (ref.current) {
                        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                        ref.current.focus();
                    }
                    return false;
                }
            }
        }

        if (!archivoFile) {
            setErrors((prevErrors) => ({ ...prevErrors, adjuntoIdentificacionAutorizante: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Es necesario Adjuntar la identificación del Autorizante.",
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
            adjuntoIdentificacionAutorizanteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            adjuntoIdentificacionAutorizanteRef.current?.focus();
            return false;
        }

        if (formData.parentescoConMenor === "Otros") {
            fieldValidations.push(
                { field: "parentescoConMenorOtros", ref: parentescoConMenorOtrosRef, errorMessage: "Por favor, Indique el Parentesco con el Menor." },
            );
        }

        if (formData.parentescoConMenor === "Tutor Legal") {
            if (!archivoTutelaFile) {
                fieldValidations.push(
                    { field: "adjuntoTutelaMenor", ref: adjuntoTutelaMenorRef, errorMessage: "Es necesario Adjuntar Copia de Resolución que designa la tutela total del menor." },
                );
            }
        }

        for (const { field, ref, errorMessage } of fieldValidations) {
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
                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }
                return false;
            }
        }

        if (formData.autorizacionTercero === "Si") {
            if (formData.quienesAutorizan === "Tutor Legal") {
                if (!formData.nombreCompletoTutor) {
                    setErrors((prevErrors) => ({ ...prevErrors, nombreCompletoTutor: true }));
                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: "Por favor, ingrese el nombre completo del Tutor.",
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
                    nombreCompletoTutorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    nombreCompletoTutorRef.current?.focus();
                    return false;
                }

                if (!formData.emailTutor) {
                    setErrors((prevErrors) => ({ ...prevErrors, emailTutor: true }));
                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: "Por favor, ingrese el correo electrónico del Tutor.",
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
                    emailTutorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    emailTutorRef.current?.focus();
                    return false;
                } else if (!emailPattern.test(formData.emailTutor)) {
                    setErrors((prevErrors) => ({ ...prevErrors, emailTutor: true }));
                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: "Por favor, ingrese un correo electrónico válido para el autorizante.",
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
                    emailTutorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    emailTutorRef.current?.focus();
                    return false;
                }

                if (!formData.telefonoTutor) {
                    fieldValidations.push(
                        { field: "telefonoTutor", ref: telefonoTutorRef, errorMessage: "Por favor, ingrese el número de teléfono del Tutor." },
                    );
                }

                if (!formData.cedulaPasaporteTutor) {
                    fieldValidations.push(
                        { field: "cedulaPasaporteTutor", ref: cedulaPasaporteTutorRef, errorMessage: "Por favor, ingrese el número de cédula o pasaporte del Tutor." },
                    );
                }

                if (!archivoTutorFile) {
                    fieldValidations.push(
                        { field: "adjuntoIdentificacionTutor", ref: adjuntoIdentificacionTutorRef, errorMessage: "Es necesario Adjuntar la identificación del Tutor." },
                    );
                }

                if (!archivoTutorTutelaFile) {
                    fieldValidations.push(
                        { field: "adjuntoTutorTutelaMenor", ref: adjuntoTutorTutelaMenorRef, errorMessage: "Es necesario Adjuntar Copia de Resolución que designa la tutela total del menor." },
                    );
                }

                for (const { field, ref, errorMessage } of fieldValidations) {
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
                        if (ref.current) {
                            ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                            ref.current.focus();
                        }
                        return false;
                    }
                }
            }

            if (formData.quienesAutorizan === "Padres" &&
                (formData.parentescoConMenor === "Padre" || formData.parentescoConMenor === "Otros")) {
                if (!formData.nombreCompletoMadre) {
                    setErrors((prevErrors) => ({ ...prevErrors, nombreCompletoMadre: true }));
                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: "Por favor, ingrese el nombre completo del Madre.",
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
                    nombreCompletoMadreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    nombreCompletoMadreRef.current?.focus();
                    return false;
                }

                if (!formData.emailMadre) {
                    setErrors((prevErrors) => ({ ...prevErrors, emailMadre: true }));
                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: "Por favor, ingrese el correo electrónico del Madre.",
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
                    emailMadreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    emailMadreRef.current?.focus();
                    return false;
                } else if (!emailPattern.test(formData.emailMadre)) {
                    setErrors((prevErrors) => ({ ...prevErrors, emailMadre: true }));
                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: "Por favor, ingrese un correo electrónico válido para el autorizante.",
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
                    emailMadreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    emailMadreRef.current?.focus();
                    return false;
                }

                if (!formData.telefonoMadre) {
                    fieldValidations.push(
                        { field: "telefonoMadre", ref: telefonoMadreRef, errorMessage: "Por favor, ingrese el número de teléfono del Madre." },
                    );
                }

                if (!formData.cedulaPasaporteMadre) {
                    fieldValidations.push(
                        { field: "cedulaPasaporteMadre", ref: cedulaPasaporteMadreRef, errorMessage: "Por favor, ingrese el número de cédula o pasaporte del Madre." },
                    );
                }

                if (!archivoMadreFile) {
                    fieldValidations.push(
                        { field: "adjuntoIdentificacionMadre", ref: adjuntoIdentificacionMadreRef, errorMessage: "Es necesario Adjuntar la identificación de la Madre." },
                    );
                }

                for (const { field, ref, errorMessage } of fieldValidations) {
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
                        if (ref.current) {
                            ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                            ref.current.focus();
                        }
                        return false;
                    }
                }
            }

            if (formData.quienesAutorizan === "Padres" &&
                (formData.parentescoConMenor === "Madre" || formData.parentescoConMenor === "Otros")) {
                if (!formData.nombreCompletoPadre) {
                    setErrors((prevErrors) => ({ ...prevErrors, nombreCompletoPadre: true }));
                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: "Por favor, ingrese el nombre completo del Padre.",
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
                    nombreCompletoPadreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    nombreCompletoPadreRef.current?.focus();
                    return false;
                }

                if (!formData.emailPadre) {
                    setErrors((prevErrors) => ({ ...prevErrors, emailPadre: true }));
                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: "Por favor, ingrese el correo electrónico del Padre.",
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
                    emailPadreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    emailPadreRef.current?.focus();
                    return false;
                } else if (!emailPattern.test(formData.emailPadre)) {
                    setErrors((prevErrors) => ({ ...prevErrors, emailPadre: true }));
                    Swal.fire({
                        position: "top-end",
                        icon: "warning",
                        title: "Por favor, ingrese un correo electrónico válido para el autorizante.",
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
                    emailPadreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    emailPadreRef.current?.focus();
                    return false;
                }

                if (!formData.telefonoPadre) {
                    fieldValidations.push(
                        { field: "telefonoPadre", ref: telefonoPadreRef, errorMessage: "Por favor, ingrese el número de teléfono del Padre." },
                    );
                }

                if (!formData.cedulaPasaportePadre) {
                    fieldValidations.push(
                        { field: "cedulaPasaportePadre", ref: cedulaPasaportePadreRef, errorMessage: "Por favor, ingrese el número de cédula o pasaporte del Padre." },
                    );
                }

                if (!archivoPadreFile) {
                    fieldValidations.push(
                        { field: "adjuntoIdentificacionPadre", ref: adjuntoIdentificacionPadreRef, errorMessage: "Es necesario Adjuntar la identificación del Padre." },
                    );
                }

                for (const { field, ref, errorMessage } of fieldValidations) {
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
                        if (ref.current) {
                            ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                            ref.current.focus();
                        }
                        return false;
                    }
                }
            }
        }

        if (!formData.nombreCompletoAutorizado) {
            setErrors((prevErrors) => ({ ...prevErrors, nombreCompletoAutorizado: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese el nombre completo del autorizado.",
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
            nombreCompletoAutorizadoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            nombreCompletoAutorizadoRef.current?.focus();
            return false;
        }

        if (!formData.emailAutorizado) {
            setErrors((prevErrors) => ({ ...prevErrors, emailAutorizado: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese el correo electrónico del autorizado.",
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
            emailAutorizadoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            emailAutorizadoRef.current?.focus();
            return false;
        } else if (!emailPattern.test(formData.emailAutorizado)) {
            setErrors((prevErrors) => ({ ...prevErrors, emailAutorizado: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese un correo electrónico válido para el autorizado.",
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
            emailAutorizadoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            emailAutorizadoRef.current?.focus();
            return false;
        }

        if (!formData.cedulaPasaporteAutorizado) {
            fieldValidations.push(
                { field: "cedulaPasaporteAutorizado", ref: cedulaPasaporteAutorizadoRef, errorMessage: "Por favor, ingrese el número de cédula o pasaporte del autorizado." },
            );
        }

        if (!formData.telefonoAutorizado) {
            fieldValidations.push(
                { field: "telefonoAutorizado", ref: telefonoAutorizadoRef, errorMessage: "Por favor, ingrese el número de teléfono del autorizado." },
            );
        }

        if (!archivoAutorizadoFile) {
            fieldValidations.push(
                { field: "adjuntoIdentificacionAutorizado", ref: adjuntoIdentificacionAutorizadoRef, errorMessage: "Es necesario Adjuntar la identificación del Autorizado." },
            );
        }

        if (formData.parentescoConMenorAutorizado === "Otros") {
            fieldValidations.push(
                { field: "parentescoAutorizadoOtros", ref: parentescoAutorizadoOtrosRef, errorMessage: "Por favor, Indique el Parentesco con el Menor." },
            );
        }

        if (!formData.fechaSalidaMenor) {
            fieldValidations.push(
                { field: "fechaSalidaMenor", ref: fechaSalidaMenorRef, errorMessage: "Por favor, Indique la fehca de salida del Menor." },
            );
        }

        if (!formData.fechaRetornoMenor) {
            fieldValidations.push(
                { field: "fechaRetornoMenor", ref: fechaRetornoMenorRef, errorMessage: "Por favor, Indique la fehca de retorno del Menor." },
            );
        }

        if (!formData.fechaFirmaNotaria) {
            fieldValidations.push(
                { field: "fechaFirmaNotaria", ref: fechaFirmaNotariaRef, errorMessage: "Por favor, Indique la fecha que desea asistir a firmar a la notaría." },
            );
        }

        if (!archivoBoletosViajeFile) {
            fieldValidations.push(
                { field: "adjuntoBoletosViaje", ref: adjuntoBoletosViajeRef, errorMessage: "Es necesario Adjuntar los boletos del viaje" },
            );
        }

        for (const { field, ref, errorMessage } of fieldValidations) {
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
                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }
                return false;
            }
        }
        return true;
    };

    const validateMenores = () => {
        let isValid = true;
        const newErrors = menores.map((_) => ({
            nombreCompletoMenor: false,
            cedulaPasaporteMenor: false,
            AdjuntoIdentificacionMenor: false,
        }));

        for (let index = 0; index < menores.length; index++) {
            const menor = menores[index];

            // Validación del Nombre Completo
            if (!menor.nombreCompletoMenor) {
                newErrors[index].nombreCompletoMenor = true;
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, ingrese el nombre completo del menor ${index + 1}.`,
                    showConfirmButton: false,
                    timer: 2500,
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
                menoresRefs.current[index].nombreCompletoMenor?.scrollIntoView({ behavior: "smooth", block: "center" });
                menoresRefs.current[index].nombreCompletoMenor?.focus();
                isValid = false;
                break;
            } else {
                newErrors[index].nombreCompletoMenor = false;
            }

            // Validación de Cédula/Pasaporte
            if (!menor.cedulaPasaporteMenor) {
                newErrors[index].cedulaPasaporteMenor = true;
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, ingrese la cédula o pasaporte del menor ${index + 1}.`,
                    showConfirmButton: false,
                    timer: 2500,
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
                menoresRefs.current[index].cedulaPasaporteMenor?.scrollIntoView({ behavior: "smooth", block: "center" });
                menoresRefs.current[index].cedulaPasaporteMenor?.focus();
                isValid = false;
                break;
            } else {
                newErrors[index].cedulaPasaporteMenor = false;
            }

            // Validación del Adjunto
            if (!menor.AdjuntoIdentificacionMenor) {
                newErrors[index].AdjuntoIdentificacionMenor = true;
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, adjunte la identificación del menor ${index + 1}.`,
                    showConfirmButton: false,
                    timer: 2500,
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
                menoresRefs.current[index].AdjuntoIdentificacionMenor?.scrollIntoView({ behavior: "smooth", block: "center" });
                menoresRefs.current[index].AdjuntoIdentificacionMenor?.focus();
                isValid = false;
                break;
            } else {
                newErrors[index].AdjuntoIdentificacionMenor = false;
            }
        }

        setErrors((prevErrors) => ({ ...prevErrors, menores: newErrors }));
        return isValid;
    };


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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validateFields() || !validateMenores()) {
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

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    };

    const sendCreateRequest = async (cuenta: string) => {
        try {
            const requestData = {
                nombreSolicita: formData.nombreCompleto,
                telefonoSolicita: `${countryCodes[formData.telefonoCodigo]}${formData.telefono}`,
                cedulaPasaporte: formData.cedulaPasaporte || "",
                emailSolicita: formData.email,
                nacionalidad: formData.nacionalidad,
                actualizarPorCorreo: formData.notificaciones === "yes",
                ...(formData.ustedAutoriza === "No" && {
                    autorizante: {
                        nombreCompletoAutorizante: formData.nombreCompletoAutorizante,
                        emailAutorizante: formData.emailAutorizante,
                        telefonoAutorizante: formData.telefonoAutorizante,
                        cedulaPasaporteAutorizante: formData.cedulaPasaporteAutorizante,
                        parentescoConMenor: formData.parentescoConMenor,
                        ...(formData.parentescoConMenor === "Otros" && {
                            parentescoConMenorOtros: formData.parentescoConMenorOtros,
                        }),
                    }
                }),
                ...(formData.autorizacionTercero === "Si" && {
                    ...(formData.quienesAutorizan === "Tutor Legal" && {
                        tutor: {
                            nombreCompletoTutor: formData.nombreCompletoTutor,
                            emailTutor: formData.emailTutor,
                            telefonoTutor: formData.telefonoTutor,
                            cedulaPasaporteTutor: formData.cedulaPasaporteTutor,
                        }
                    }),
                    ...(formData.quienesAutorizan === "Padres" && {
                        ...((formData.parentescoConMenor === "Padre" || formData.parentescoConMenor === "Otros") && {
                            madre: {
                                nombreCompletoMadre: formData.nombreCompletoMadre,
                                emailMadre: formData.emailMadre,
                                telefonoMadre: formData.telefonoMadre,
                                cedulaPasaporteMadre: formData.cedulaPasaporteMadre,
                            }
                        }),
                        ...((formData.parentescoConMenor === "Madre" || formData.parentescoConMenor === "Otros") && {
                            padre: {
                                nombreCompletoPadre: formData.nombreCompletoPadre,
                                emailPadre: formData.emailPadre,
                                telefonoPadre: formData.telefonoPadre,
                                cedulaPasaportePadre: formData.cedulaPasaportePadre,
                            }
                        }),

                    }),
                }),
                autorizado: {
                    nombreCompletoAutorizado: formData.nombreCompletoAutorizado,
                    emailAutorizado: formData.emailAutorizado,
                    telefonoAutorizado: formData.telefonoAutorizado,
                    cedulaPasaporteAutorizado: formData.cedulaPasaporteAutorizado,
                    nacionalidadAutorizado: formData.nacionalidadAutorizado,
                    parentescoConMenorAutorizado: formData.parentescoConMenorAutorizado,
                    ...(formData.parentescoConMenorAutorizado === "Otros" && {
                        parentescoAutorizadoOtros: formData.parentescoAutorizadoOtros,
                    }),
                    fechaSalidaMenor: formatDate(formData.fechaSalidaMenor),
                    fechaRetornoMenor: formatDate(formData.fechaRetornoMenor),
                    fechaFirmaNotaria: formatDate(formData.fechaFirmaNotaria),
                },
                cuenta: cuenta || "",
                precio: precio,
                subtotal: subtotal,
                total: total,
                accion: "Creación de solicitud",
                tipo: "menores-al-extranjero",
                item: item
            };

            const response = await axios.post("/api/create-request-consultaPropuesta", requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { solicitudId, status } = response.data;

            let archivoURL = formData.archivoAutorizanteURL;
            let archivoTutelaURL = formData.archivoTutelaURL;
            let archivoTutorURL = formData.archivoTutorURL;
            let archivoTutorTutelaURL = formData.archivoTutorTutelaURL;
            let archivoPadreURL = formData.archivoPadreURL;
            let archivoMadreURL = formData.archivoMadreURL;
            let archivoAutorizadoURL = formData.archivoAutorizadoURL;
            let archivoBoletosViajeURL = formData.archivoBoletosViajeURL;

            if (archivoFile) {
                archivoURL = await uploadFileToFirebase(archivoFile, `uploads/${solicitudId}/AdjuntoIdentificacionAutorizante`);
            }

            if (archivoTutelaFile && formData.parentescoConMenor === "Tutor Legal") {
                archivoTutelaURL = await uploadFileToFirebase(archivoTutelaFile, `uploads/${solicitudId}/AdjuntoTutelaLegal`);
            }

            if (archivoTutorFile) {
                archivoTutorURL = await uploadFileToFirebase(archivoTutorFile, `uploads/${solicitudId}/AdjuntoIdentificacionTutor`);
            }

            if (archivoTutorTutelaFile) {
                archivoTutorTutelaURL = await uploadFileToFirebase(archivoTutorTutelaFile, `uploads/${solicitudId}/AdjuntoTutorTutela`);
            }

            if (archivoPadreFile) {
                archivoPadreURL = await uploadFileToFirebase(archivoPadreFile, `uploads/${solicitudId}/AdjuntoIdentificacionPadre`);
            }

            if (archivoMadreFile) {
                archivoMadreURL = await uploadFileToFirebase(archivoMadreFile, `uploads/${solicitudId}/AdjuntoIdentificacionMadre`);
            }

            if (archivoAutorizadoFile) {
                archivoAutorizadoURL = await uploadFileToFirebase(archivoAutorizadoFile, `uploads/${solicitudId}/AdjuntoIdentificacionAutorizado`);
            }

            if (archivoBoletosViajeFile) {
                archivoBoletosViajeURL = await uploadFileToFirebase(archivoBoletosViajeFile, `uploads/${solicitudId}/AdjuntoBoletosViaje`);
            }


            setFormData((prevData) => ({
                ...prevData,
                archivoAutorizanteURL: archivoURL,
                ...(formData.parentescoConMenor === "Tutor Legal" && {
                    archivoTutelaURL: archivoTutelaURL,
                }),
                ...(formData.autorizacionTercero === "Si" && {
                    ...(formData.quienesAutorizan === "Tutor Legal" && {
                        archivoTutorURL: archivoTutorURL,
                        archivoTutorTutelaURL: archivoTutorTutelaURL,
                    }),
                }),
                ...(formData.autorizacionTercero === "Si" && {
                    ...((formData.quienesAutorizan === "Padres" &&
                        (formData.parentescoConMenor === "Padre" || formData.parentescoConMenor === "Otros")) && {
                        archivoMadreURL: archivoMadreURL,
                    }),
                    ...((formData.quienesAutorizan === "Padres" &&
                        (formData.parentescoConMenor === "Madre" || formData.parentescoConMenor === "Otros")) && {
                        archivoPadreURL: archivoPadreURL,
                    }),
                }),
                archivoAutorizadoURL: archivoAutorizadoURL,
                archivoBoletosViajeURL: archivoBoletosViajeURL,
            }));

            const menoresURLs = await Promise.all(menores.map(async (menor, index) => {
                if (menor.AdjuntoIdentificacionMenor) {
                    const archivoMenorURL = await uploadFileToFirebase(
                        menor.AdjuntoIdentificacionMenor,
                        `uploads/${solicitudId}/AdjuntoIdentificacionMenor${index}`
                    );
                    return { ...menor, AdjuntoIdentificacionMenorURL: archivoMenorURL };
                }
                return menor;
            }));

            // Actualiza el estado de menores con las URLs de Firebase
            setMenores(menoresURLs);

            setFormData((prevData) => ({
                ...prevData,
                menores: menoresURLs,
            }));

            const updatePayload = {
                solicitudId: solicitudId,
                adjuntoIdentificacionAutorizante: archivoURL || '',
                ...(formData.parentescoConMenor === "Tutor Legal" && {
                    adjuntoTutelaMenor: archivoTutelaURL,
                }),
                ...(formData.autorizacionTercero === "Si" && {
                    ...(formData.quienesAutorizan === "Tutor Legal" && {
                        archivoTutorURL: archivoTutorURL,
                        archivoTutorTutelaURL: archivoTutorTutelaURL,
                    }),
                }),
                ...(formData.autorizacionTercero === "Si" && {
                    ...((formData.quienesAutorizan === "Padres" &&
                        (formData.parentescoConMenor === "Padre" || formData.parentescoConMenor === "Otros")) && {
                        archivoMadreURL: archivoMadreURL,
                    }),
                    ...((formData.quienesAutorizan === "Padres" &&
                        (formData.parentescoConMenor === "Madre" || formData.parentescoConMenor === "Otros")) && {
                        archivoPadreURL: archivoPadreURL,
                    }),
                }),
                menores: menoresURLs.map((menor) => ({
                    nombreCompletoMenor: menor.nombreCompletoMenor,
                    cedulaPasaporteMenor: menor.cedulaPasaporteMenor,
                    AdjuntoIdentificacionMenorURL: menor.AdjuntoIdentificacionMenorURL || "",
                })),
                adjuntoIdentificacionAutorizado: archivoAutorizadoURL || '',
                adjuntoBoletosViaje: archivoBoletosViajeURL || '',
            };

            await axios.post('/api/update-request-all', updatePayload);

            if (status === "success" && solicitudId) {
                Swal.fire({
                    icon: "success",
                    title: "Solicitud enviada correctamente",
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
                window.location.href = "/dashboard/requests";
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

    const getCountries = () => {
        return [
            'Panama', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia',
            'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus',
            'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
            'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
            'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
            'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
            'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
            'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
            'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
            'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan',
            'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
            'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
            'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
            'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
            'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
            'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Papua New Guinea', 'Paraguay', 'Peru',
            'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
            'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
            'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
            'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden',
            'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
            'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates',
            'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
            'Yemen', 'Zambia', 'Zimbabwe'
        ];
    };

    interface Menor {
        nombreCompletoMenor: string;
        cedulaPasaporteMenor: string;
        AdjuntoIdentificacionMenor: File | null;
        AdjuntoIdentificacionMenorURL?: string;
    }

    // Función para agregar un menor
    const handleAddMenor = () => {
        setMenores([...menores, { nombreCompletoMenor: "", cedulaPasaporteMenor: "", AdjuntoIdentificacionMenor: null }]);
    };

    // Función para eliminar un menor
    const handleRemoveMenor = (index: number) => {
        const nuevosMenores = menores.filter((_, i) => i !== index);
        setMenores(nuevosMenores);
    };

    // Función para manejar cambios en los campos de cada menor
    const handleMenorChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const nuevosMenores = [...menores];
        nuevosMenores[index] = { ...nuevosMenores[index], [name]: value };
        setMenores(nuevosMenores);
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold mb-4">¡Bienvenido a la Solicitud de Autorización de Salida de Menores al Extranjero!</h1>
            <hr className='mt-4 mb-2' />
            <label className="block text-white mb-4">En esta sección podrás Gestionar la autorizar de salida de un menor del país ya sea con alguno de los padres o un tercero, podrás hacerlo de forma rápida y sencilla, luego que completes la información solicitada serás contactado por uno de nuestros Abogados para Firmar ante notario.</label>
            <h2 className="text-white text-2xl font-semibold">Información Personal</h2>

            <form onSubmit={handleSubmit} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative w-full">
                        <label className="block text-white mb-2">Nombre completo:</label>
                        <input
                            ref={nombreCompletoRef}
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreCompleto ? 'border-2 border-red-500' : ''}`}
                        />
                    </div>

                    <div className="relative w-full">
                        <label className="block text-white mb-2">Correo electrónico:</label>
                        <input
                            ref={emailRef}
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.email ? 'border-2 border-red-500' : ''}`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="relative w-full">
                        <label className="block text-white mb-2">Número de cédula o pasaporte:</label>
                        <input
                            ref={cedulaPasaporteRef}
                            type="text"
                            name="cedulaPasaporte"
                            value={formData.cedulaPasaporte}
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaporte ? 'border-2 border-red-500' : ''}`}
                            placeholder="Número de cédula o pasaporte"
                        />
                    </div>

                    <div className="relative w-full">
                        <label className="block text-white mb-2">Nacionalidad:</label>
                        <select
                            name="nacionalidad"
                            value={formData.nacionalidad}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                        >
                            {getCountries().map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col w-full">
                        <label className="block text-white">Número de teléfono:</label>
                        <div className="flex gap-2 mt-2">
                            <select
                                name="telefonoCodigo"
                                value={formData.telefonoCodigo}
                                onChange={handleInputChange}
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
                                onChange={handleInputChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefono ? 'border-2 border-red-500' : ''}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-6 mt-4">
                    <h2 className="block text-white text-lg font-semibold mb-2">Es usted Quien Autoriza:</h2>
                    <select
                        name="ustedAutoriza"
                        value={formData.ustedAutoriza}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-gray-800 text-white rounded-lg"
                    >
                        <option value="Si">Si</option>
                        <option value="No">No</option>
                    </select>
                </div>

                {formData.ustedAutoriza === "No" && (
                    <>
                        <hr className='mb-2' />
                        <h2 className="text-white text-2xl font-semibold mb-2">Información del Autorizante</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="relative w-full">
                                <label className="block text-white mb-2">Nombre completo del Autorizante:</label>
                                <input
                                    ref={nombreCompletoAutorizanteRef}
                                    type="text"
                                    name="nombreCompletoAutorizante"
                                    value={formData.nombreCompletoAutorizante || ""}
                                    onChange={handleInputChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreCompletoAutorizante ? 'border-2 border-red-500' : ''}`}
                                />
                            </div>

                            <div className="relative w-full">
                                <label className="block text-white mb-2">Dirección de correo electrónico del Autorizante:</label>
                                <input
                                    ref={emailAutorizanteRef}
                                    type="text"
                                    name="emailAutorizante"
                                    value={formData.emailAutorizante || ""}
                                    onChange={handleInputChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.emailAutorizante ? 'border-2 border-red-500' : ''}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="flex flex-col w-full">
                                <label className="block text-white">Número de teléfono del Autorizante:</label>
                                <div className="flex gap-2 mt-2">
                                    <select
                                        name="telefonoCodigoAutorizante"
                                        value={formData.telefonoCodigoAutorizante}
                                        onChange={handleInputChange}
                                        className="p-4 bg-gray-800 text-white rounded-lg"
                                    >
                                        {Object.entries(countryCodes).map(([code, dialCode]) => (
                                            <option key={code} value={code}>{code}: {dialCode}</option>
                                        ))}
                                    </select>
                                    <input
                                        ref={telefonoAutorizanteRef}
                                        type="text"
                                        name="telefonoAutorizante"
                                        value={formData.telefonoAutorizante || ""}
                                        onChange={handleInputChange}
                                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoAutorizante ? 'border-2 border-red-500' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="relative w-full">
                                <label className="block text-white mb-2">Cédula o pasaporte del Autorizante:</label>
                                <input
                                    ref={cedulaPasaporteAutorizanteRef}
                                    type="text"
                                    name="cedulaPasaporteAutorizante"
                                    value={formData.cedulaPasaporteAutorizante || ""}
                                    onChange={handleInputChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaporteAutorizante ? 'border-2 border-red-500' : ''}`}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative w-full">
                        <label className="block text-white mb-2">Parentesco con el menor:</label>
                        <select
                            name="parentescoConMenor"
                            value={formData.parentescoConMenor || "Padre"}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                        >
                            <option value="Padre">Padre</option>
                            <option value="Madre">Madre</option>
                            <option value="Tutor Legal">Tutor Legal</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>

                    <div className="relative w-full">
                        <label className="text-white block mb-2">Adjuntar identificación del Autorizante:</label>
                        <input
                            ref={adjuntoIdentificacionAutorizanteRef}
                            type="file"
                            name="AdjuntoIdentificacionAutorizante"
                            onChange={handleFileChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionAutorizante ? 'border-2 border-red-500' : ''}`}
                        />
                        {formData.archivoAutorizanteURL && (
                            <p className="text-sm text-blue-500">
                                <a href={formData.archivoAutorizanteURL} target="_blank" rel="noopener noreferrer">
                                    Ver documento actual
                                </a>
                            </p>
                        )}
                    </div>
                </div>

                {formData.parentescoConMenor === "Tutor Legal" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="relative w-full">
                                <label className="text-white block mb-2">Adjuntar Copia de Resolución que designa la tutela total del menor:</label>
                                <input
                                    ref={adjuntoTutelaMenorRef}
                                    type="file"
                                    name="adjuntoTutelaMenor"
                                    onChange={handleFileChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoTutelaMenor ? 'border-2 border-red-500' : ''}`}
                                />
                                {formData.archivoTutelaURL && (
                                    <p className="text-sm text-blue-500">
                                        <a href={formData.archivoTutelaURL} target="_blank" rel="noopener noreferrer">
                                            Ver documento actual
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
                {formData.parentescoConMenor === "Otros" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="relative w-full">
                                <label className="block text-white mb-2">Indique el Parentesco:</label>
                                <input
                                    ref={parentescoConMenorOtrosRef}
                                    type="text"
                                    name="parentescoConMenorOtros"
                                    value={formData.parentescoConMenorOtros || ""}
                                    onChange={handleInputChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.parentescoConMenorOtros ? 'border-2 border-red-500' : ''}`}
                                />
                            </div>
                        </div>
                    </>
                )}

                {formData.parentescoConMenor !== "Tutor Legal" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="relative w-full">
                                <label className="block text-white mb-2">La autorización va dirigida a un tercero:</label>
                                <select
                                    name="autorizacionTercero"
                                    value={formData.autorizacionTercero || "No"}
                                    onChange={handleInputChange}
                                    className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                >
                                    <option value="No">No</option>
                                    <option value="Si">Si</option>

                                </select>
                            </div>
                        </div>

                        {formData.autorizacionTercero === "Si" && (
                            <>
                                <label className="block text-white mb-4 mt-4">Si la Autorización va dirigida a un tercero ambos padres deben Estar presentes al momento de cierre ante Notario o se debe demostrar que el Autorizante tiene la guarda y custodia total del menor.</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="relative w-full">
                                        <label className="block text-white mb-2">Quienes autorizan la salida del menor:</label>
                                        <select
                                            name="quienesAutorizan"
                                            value={formData.quienesAutorizan || "Tutor Legal"}
                                            onChange={handleInputChange}
                                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                        >
                                            <option value="Tutor Legal">Tutor Legal</option>
                                            <option value="Padres">Padres</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.quienesAutorizan === "Tutor Legal" && (
                                    <>
                                        <hr className='mb-2 mt-4' />
                                        <h2 className="text-white text-2xl font-semibold mb-2">Información del Tutor Legal</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="relative w-full">
                                                <label className="block text-white mb-2">Nombre completo del Tutor:</label>
                                                <input
                                                    ref={nombreCompletoTutorRef}
                                                    type="text"
                                                    name="nombreCompletoTutor"
                                                    value={formData.nombreCompletoTutor || ""}
                                                    onChange={handleInputChange}
                                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreCompletoTutor ? 'border-2 border-red-500' : ''}`}
                                                />
                                            </div>

                                            <div className="relative w-full">
                                                <label className="block text-white mb-2">Dirección de correo electrónico del Tutor:</label>
                                                <input
                                                    ref={emailTutorRef}
                                                    type="text"
                                                    name="emailTutor"
                                                    value={formData.emailTutor || ""}
                                                    onChange={handleInputChange}
                                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.emailTutor ? 'border-2 border-red-500' : ''}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="flex flex-col w-full">
                                                <label className="block text-white">Número de teléfono del Tutor:</label>
                                                <div className="flex gap-2 mt-2">
                                                    <select
                                                        name="telefonoCodigoTutor"
                                                        value={formData.telefonoCodigoTutor}
                                                        onChange={handleInputChange}
                                                        className="p-4 bg-gray-800 text-white rounded-lg"
                                                    >
                                                        {Object.entries(countryCodes).map(([code, dialCode]) => (
                                                            <option key={code} value={code}>{code}: {dialCode}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        ref={telefonoTutorRef}
                                                        type="text"
                                                        name="telefonoTutor"
                                                        value={formData.telefonoTutor || ""}
                                                        onChange={handleInputChange}
                                                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoTutor ? 'border-2 border-red-500' : ''}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative w-full">
                                                <label className="block text-white mb-2">Cédula o pasaporte del Tutor:</label>
                                                <input
                                                    ref={cedulaPasaporteTutorRef}
                                                    type="text"
                                                    name="cedulaPasaporteTutor"
                                                    value={formData.cedulaPasaporteTutor || ""}
                                                    onChange={handleInputChange}
                                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaporteTutor ? 'border-2 border-red-500' : ''}`}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="relative w-full">
                                                <label className="text-white block mb-2">Adjuntar identificación del Tutor:</label>
                                                <input
                                                    ref={adjuntoIdentificacionTutorRef}
                                                    type="file"
                                                    name="adjuntoIdentificacionTutor"
                                                    onChange={handleFileChange}
                                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionTutor ? 'border-2 border-red-500' : ''}`}
                                                />
                                                {formData.archivoTutorURL && (
                                                    <p className="text-sm text-blue-500">
                                                        <a href={formData.archivoTutorURL} target="_blank" rel="noopener noreferrer">
                                                            Ver documento actual
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="relative w-full">
                                                <label className="text-white block mb-2">Adjuntar Copia de Resolución que designa la tutela total del menor:</label>
                                                <input
                                                    ref={adjuntoTutorTutelaMenorRef}
                                                    type="file"
                                                    name="adjuntoTutorTutelaMenor"
                                                    onChange={handleFileChange}
                                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoTutorTutelaMenor ? 'border-2 border-red-500' : ''}`}
                                                />
                                                {formData.archivoTutorTutelaURL && (
                                                    <p className="text-sm text-blue-500">
                                                        <a href={formData.archivoTutorTutelaURL} target="_blank" rel="noopener noreferrer">
                                                            Ver documento actual
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {formData.quienesAutorizan === "Padres" && (
                                    <>
                                        {(formData.parentescoConMenor === "Padre" || formData.parentescoConMenor === "Otros") && (
                                            <>
                                                <hr className='mb-2 mt-4' />
                                                <h2 className="text-white text-2xl font-semibold mb-2">Información de la Madre</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div className="relative w-full">
                                                        <label className="block text-white mb-2">Nombre completo de la Madre:</label>
                                                        <input
                                                            ref={nombreCompletoMadreRef}
                                                            type="text"
                                                            name="nombreCompletoMadre"
                                                            value={formData.nombreCompletoMadre || ""}
                                                            onChange={handleInputChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreCompletoMadre ? 'border-2 border-red-500' : ''}`}
                                                        />
                                                    </div>

                                                    <div className="relative w-full">
                                                        <label className="block text-white mb-2">Dirección de correo electrónico de la Madre:</label>
                                                        <input
                                                            ref={emailMadreRef}
                                                            type="text"
                                                            name="emailMadre"
                                                            value={formData.emailMadre || ""}
                                                            onChange={handleInputChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.emailMadre ? 'border-2 border-red-500' : ''}`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                    <div className="flex flex-col w-full">
                                                        <label className="block text-white">Número de teléfono de la Madre:</label>
                                                        <div className="flex gap-2 mt-2">
                                                            <select
                                                                name="telefonoCodigoMadre"
                                                                value={formData.telefonoCodigoMadre}
                                                                onChange={handleInputChange}
                                                                className="p-4 bg-gray-800 text-white rounded-lg"
                                                            >
                                                                {Object.entries(countryCodes).map(([code, dialCode]) => (
                                                                    <option key={code} value={code}>{code}: {dialCode}</option>
                                                                ))}
                                                            </select>
                                                            <input
                                                                ref={telefonoMadreRef}
                                                                type="text"
                                                                name="telefonoMadre"
                                                                value={formData.telefonoMadre || ""}
                                                                onChange={handleInputChange}
                                                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoMadre ? 'border-2 border-red-500' : ''}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="relative w-full">
                                                        <label className="block text-white mb-2">Cédula o pasaporte de la Madre:</label>
                                                        <input
                                                            ref={cedulaPasaporteMadreRef}
                                                            type="text"
                                                            name="cedulaPasaporteMadre"
                                                            value={formData.cedulaPasaporteMadre || ""}
                                                            onChange={handleInputChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaporteMadre ? 'border-2 border-red-500' : ''}`}
                                                        />
                                                    </div>

                                                    <div className="relative w-full">
                                                        <label className="text-white block mb-2">Adjuntar identificación de la Madre:</label>
                                                        <input
                                                            ref={adjuntoIdentificacionMadreRef}
                                                            type="file"
                                                            name="adjuntoIdentificacionMadre"
                                                            onChange={handleFileChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionMadre ? 'border-2 border-red-500' : ''}`}
                                                        />
                                                        {formData.archivoMadreURL && (
                                                            <p className="text-sm text-blue-500">
                                                                <a href={formData.archivoMadreURL} target="_blank" rel="noopener noreferrer">
                                                                    Ver documento actual
                                                                </a>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {(formData.parentescoConMenor === "Madre" || formData.parentescoConMenor === "Otros") && (
                                            <>
                                                <hr className='mb-2 mt-4' />
                                                <h2 className="text-white text-2xl font-semibold mb-2">Información del Padre</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div className="relative w-full">
                                                        <label className="block text-white mb-2">Nombre completo del Padre:</label>
                                                        <input
                                                            ref={nombreCompletoPadreRef}
                                                            type="text"
                                                            name="nombreCompletoPadre"
                                                            value={formData.nombreCompletoPadre || ""}
                                                            onChange={handleInputChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreCompletoPadre ? 'border-2 border-red-500' : ''}`}
                                                        />
                                                    </div>

                                                    <div className="relative w-full">
                                                        <label className="block text-white mb-2">Dirección de correo electrónico del Padre:</label>
                                                        <input
                                                            ref={emailPadreRef}
                                                            type="text"
                                                            name="emailPadre"
                                                            value={formData.emailPadre || ""}
                                                            onChange={handleInputChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.emailPadre ? 'border-2 border-red-500' : ''}`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                    <div className="flex flex-col w-full">
                                                        <label className="block text-white">Número de teléfono del Padre:</label>
                                                        <div className="flex gap-2 mt-2">
                                                            <select
                                                                name="telefonoCodigoPadre"
                                                                value={formData.telefonoCodigoPadre}
                                                                onChange={handleInputChange}
                                                                className="p-4 bg-gray-800 text-white rounded-lg"
                                                            >
                                                                {Object.entries(countryCodes).map(([code, dialCode]) => (
                                                                    <option key={code} value={code}>{code}: {dialCode}</option>
                                                                ))}
                                                            </select>
                                                            <input
                                                                ref={telefonoPadreRef}
                                                                type="text"
                                                                name="telefonoPadre"
                                                                value={formData.telefonoPadre || ""}
                                                                onChange={handleInputChange}
                                                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoPadre ? 'border-2 border-red-500' : ''}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="relative w-full">
                                                        <label className="block text-white mb-2">Cédula o pasaporte del Padre:</label>
                                                        <input
                                                            ref={cedulaPasaportePadreRef}
                                                            type="text"
                                                            name="cedulaPasaportePadre"
                                                            value={formData.cedulaPasaportePadre || ""}
                                                            onChange={handleInputChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaportePadre ? 'border-2 border-red-500' : ''}`}
                                                        />
                                                    </div>

                                                    <div className="relative w-full">
                                                        <label className="text-white block mb-2">Adjuntar identificación del Padre:</label>
                                                        <input
                                                            ref={adjuntoIdentificacionPadreRef}
                                                            type="file"
                                                            name="adjuntoIdentificacionPadre"
                                                            onChange={handleFileChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionPadre ? 'border-2 border-red-500' : ''}`}
                                                        />
                                                        {formData.archivoPadreURL && (
                                                            <p className="text-sm text-blue-500">
                                                                <a href={formData.archivoPadreURL} target="_blank" rel="noopener noreferrer">
                                                                    Ver documento actual
                                                                </a>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                <hr className='mb-2 mt-4' />
                <h2 className="text-white text-2xl font-semibold mb-2">Información del Menor</h2>
                {menores.map((menor, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="relative w-full">
                            <label className="block text-white mb-2">Nombre completo del Menor:</label>
                            <input
                                ref={(el) => {
                                    if (menoresRefs.current[index]) {
                                        menoresRefs.current[index].nombreCompletoMenor = el;
                                    }
                                }}
                                type="text"
                                name="nombreCompletoMenor"
                                value={menor.nombreCompletoMenor}
                                onChange={(e) => handleMenorChange(index, e)}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.menores[index]?.nombreCompletoMenor ? 'border-2 border-red-500' : ''}`}
                            />
                        </div>

                        <div className="relative w-full">
                            <label className="block text-white mb-2">Cédula o pasaporte del Menor:</label>
                            <input
                                ref={(el) => {
                                    if (menoresRefs.current[index]) {
                                        menoresRefs.current[index].cedulaPasaporteMenor = el;
                                    }
                                }}
                                type="text"
                                name="cedulaPasaporteMenor"
                                value={menor.cedulaPasaporteMenor}
                                onChange={(e) => handleMenorChange(index, e)}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.menores[index]?.cedulaPasaporteMenor ? 'border-2 border-red-500' : ''}`}
                            />
                        </div>

                        <div className="relative w-full">
                            <label className="text-white block mb-2">Adjuntar identificación del Menor:</label>
                            <input
                                ref={(el) => {
                                    if (menoresRefs.current[index]) {
                                        menoresRefs.current[index].AdjuntoIdentificacionMenor = el;
                                    }
                                }}
                                type="file"
                                name={`AdjuntoIdentificacionMenor${index}`}
                                onChange={handleFileChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.menores[index]?.AdjuntoIdentificacionMenor ? 'border-2 border-red-500' : ''}`}
                            />
                            {(typeof menor.AdjuntoIdentificacionMenor === "string" && menor.AdjuntoIdentificacionMenor) ? (
                                // Renderiza el enlace si `AdjuntoIdentificacionMenor` es una URL
                                <p className="text-sm text-blue-500">
                                    <a href={menor.AdjuntoIdentificacionMenor} target="_blank" rel="noopener noreferrer">
                                        Ver documento
                                    </a>
                                </p>
                            ) : (
                                // Renderiza el enlace de vista previa si es un archivo de tipo `File`
                                menor.AdjuntoIdentificacionMenor && (
                                    <p className="text-sm text-blue-500">
                                        <a href={URL.createObjectURL(menor.AdjuntoIdentificacionMenor)} target="_blank" rel="noopener noreferrer">
                                            Ver documento
                                        </a>
                                    </p>
                                )
                            )}
                        </div>

                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveMenor(index)}
                                className="bg-red-600 text-white p-2 rounded-lg mt-4 md:col-span-3"
                            >
                                Eliminar Menor
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={handleAddMenor}
                    className="bg-gray-600 text-white p-3 rounded-lg mt-4"
                >
                    Adicionar Menor
                </button>

                <hr className='mb-2 mt-4' />
                <h2 className="text-white text-2xl font-semibold mb-2">Información del Autorizado</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative w-full">
                        <label className="block text-white mb-2">Nombre completo:</label>
                        <input
                            ref={nombreCompletoAutorizadoRef}
                            type="text"
                            name="nombreCompletoAutorizado"
                            value={formData.nombreCompletoAutorizado}
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreCompletoAutorizado ? 'border-2 border-red-500' : ''}`}
                        />
                    </div>

                    <div className="relative w-full">
                        <label className="block text-white mb-2">Correo electrónico:</label>
                        <input
                            ref={emailAutorizadoRef}
                            type="text"
                            name="emailAutorizado"
                            value={formData.emailAutorizado}
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.emailAutorizado ? 'border-2 border-red-500' : ''}`}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="relative w-full">
                        <label className="block text-white mb-2">Número de cédula o pasaporte:</label>
                        <input
                            ref={cedulaPasaporteAutorizadoRef}
                            type="text"
                            name="cedulaPasaporteAutorizado"
                            value={formData.cedulaPasaporteAutorizado}
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaporteAutorizado ? 'border-2 border-red-500' : ''}`}
                            placeholder="Número de cédula o pasaporte"
                        />
                    </div>

                    <div className="relative w-full">
                        <label className="block text-white mb-2">Nacionalidad:</label>
                        <select
                            name="nacionalidadAutorizado"
                            value={formData.nacionalidadAutorizado}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                        >
                            {getCountries().map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col w-full">
                        <label className="block text-white">Número de teléfono:</label>
                        <div className="flex gap-2 mt-2">
                            <select
                                name="telefonoCodigoAutorizado"
                                value={formData.telefonoCodigoAutorizado}
                                onChange={handleInputChange}
                                className="p-4 bg-gray-800 text-white rounded-lg"
                            >
                                {Object.entries(countryCodes).map(([code, dialCode]) => (
                                    <option key={code} value={code}>{code}: {dialCode}</option>
                                ))}
                            </select>
                            <input
                                ref={telefonoAutorizadoRef}
                                type="text"
                                name="telefonoAutorizado"
                                value={formData.telefonoAutorizado}
                                onChange={handleInputChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoAutorizado ? 'border-2 border-red-500' : ''}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative w-full">
                        <label className="text-white block mb-2">Adjuntar identificación del Autorizante:</label>
                        <input
                            ref={adjuntoIdentificacionAutorizadoRef}
                            type="file"
                            name="adjuntoIdentificacionAutorizado"
                            onChange={handleFileChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionAutorizado ? 'border-2 border-red-500' : ''}`}
                        />
                        {formData.archivoAutorizadoURL && (
                            <p className="text-sm text-blue-500">
                                <a href={formData.archivoAutorizadoURL} target="_blank" rel="noopener noreferrer">
                                    Ver documento actual
                                </a>
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-6 mt-4">
                    <label className="block text-white mb-2">Parentesco con el menor:</label>
                    <select
                        name="parentescoConMenorAutorizado"
                        value={formData.parentescoConMenorAutorizado || "Padre"}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-gray-800 text-white rounded-lg"
                    >
                        <option value="Padre">Padre</option>
                        <option value="Madre">Madre</option>
                        <option value="Tutor Legal">Tutor Legal</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>

                {formData.parentescoConMenorAutorizado === "Otros" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="relative w-full">
                                <label className="block text-white mb-2">Indique el Parentesco:</label>
                                <input
                                    ref={parentescoAutorizadoOtrosRef}
                                    type="text"
                                    name="parentescoAutorizadoOtros"
                                    value={formData.parentescoAutorizadoOtros || ""}
                                    onChange={handleInputChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.parentescoAutorizadoOtros ? 'border-2 border-red-500' : ''}`}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="relative w-full">
                        <label className="text-white block mb-2">Indique la fecha de salida del menor:</label>
                        <input
                            ref={fechaSalidaMenorRef}
                            type="date"
                            name="fechaSalidaMenor"
                            value={formData.fechaSalidaMenor || ""}
                            placeholder="dd/mm/aaaa"
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.fechaSalidaMenor ? 'border-2 border-red-500' : ''}`}
                        />
                    </div>

                    <div className="relative w-full">
                        <label className="text-white block mb-2">Indique la fecha de retorno del menor:</label>
                        <input
                            ref={fechaRetornoMenorRef}
                            type="date"
                            name="fechaRetornoMenor"
                            value={formData.fechaRetornoMenor || ""}
                            placeholder="dd/mm/aaaa"
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.fechaRetornoMenor ? 'border-2 border-red-500' : ''}`}
                        />
                    </div>

                    <div className="relative w-full">
                        <label className="text-white block mb-2">Indique la fecha que desea asistir a firmar a la notaría:</label>
                        <input
                            ref={fechaFirmaNotariaRef}
                            type="date"
                            name="fechaFirmaNotaria"
                            value={formData.fechaFirmaNotaria || ""}
                            placeholder="dd/mm/aaaa"
                            onChange={handleInputChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.fechaFirmaNotaria ? 'border-2 border-red-500' : ''}`}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative w-full mt-4">
                        <label className="text-white block mb-2">Adjunte los boletos del viaje:</label>
                        <input
                            ref={adjuntoBoletosViajeRef}
                            type="file"
                            name="adjuntoBoletosViaje"
                            onChange={handleFileChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoBoletosViaje ? 'border-2 border-red-500' : ''}`}
                        />
                        {formData.archivoBoletosViajeURL && (
                            <p className="text-sm text-blue-500">
                                <a href={formData.archivoBoletosViajeURL} target="_blank" rel="noopener noreferrer">
                                    Ver documento actual
                                </a>
                            </p>
                        )}
                    </div>
                </div>

                {/* Tabla de costos */}
                <div className="mt-6 mt-4">
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
            </form>
        </div >

    );
};

export default MenoresAlExtranjero;