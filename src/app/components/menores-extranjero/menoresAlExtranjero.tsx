"use client";
import React, { useState, useEffect, useRef, useContext } from 'react';
import Swal from "sweetalert2";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import AppStateContext from "@context/menoresContext";
import { checkAuthToken } from "@utils/checkAuthToken";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import WidgetLoader from '@/src/app/components/widgetLoader';
import SaleComponent from '@/src/app/components/saleComponent';
import CountrySelect from '@components/CountrySelect';
import ReCAPTCHA from 'react-google-recaptcha';
import { Modal, Box, Button } from "@mui/material";
import BotonesPreguntasYContactos from '@components/botonesPreguntasYContactos';
import Link from 'next/link';
import BannerOpcionesMenores from '@components/BannerOpcionesMenores'; 
import { FaPlay } from 'react-icons/fa';
import {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId
} from '@utils/env';
import get from 'lodash/get';
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

const MenoresAlExtranjero: React.FC = () => {
    const router = useRouter();
    const params = useParams();

    const id = params?.id as string | undefined;
    const [solicitudData, setSolicitudData] = useState<any>(null);

    const context = useContext(AppStateContext);
    const [recaptchaToken, setRecaptchaToken] = useState(null);

    if (!context) {
        throw new Error("AppStateContext must be used within an AppStateProvider");
    }

    const { store, setStore } = context;

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
        pago: false,
        cuenta: "",
        tipoConsulta: "Menores al Extranjero",

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
        quienesAutorizan: "Padres",

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
        adjuntoPasaporteAutorizante: null as File | null,
        archivoPasaporteAutorizanteURL: "",
        adjuntoTutelaMenor: null as File | null,
        archivoTutelaURL: "",
        adjuntoIdentificacionTutor: null as File | null,
        archivoTutorURL: "",
        adjuntoPasaporteTutor: null as File | null,
        archivoPasaporteTutorURL: "",
        adjuntoTutorTutelaMenor: null as File | null,
        archivoTutorTutelaURL: "",
        adjuntoIdentificacionPadre: null as File | null,
        archivoPadreURL: "",
        adjuntoPasaportePadre: null as File | null,
        archivoPasaportePadreURL: "",
        adjuntoIdentificacionMadre: null as File | null,
        archivoMadreURL: "",
        adjuntoPasaporteMadre: null as File | null,
        archivoPasaporteMadreURL: "",
        adjuntoIdentificacionAutorizado: null as File | null,
        archivoAutorizadoURL: "",
        adjuntoPasaporteAutorizado: null as File | null,
        archivoPasaporteAutorizadoURL: "",
        adjuntoBoletosViaje: null as File | null,
        archivoBoletosViajeURL: "",
        adjuntoCustodiaTotal: null as File | null,
        archivoCustodiaTotalURL: "",
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
                tipoConsulta: "Menores al Extranjero",
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
                adjuntoPasaporteAutorizante: null as File | null,
                archivoPasaporteAutorizanteURL: solicitudData?.adjuntoPasaporteAutorizante || "",
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
                    AdjuntoIdentificacionMenor: menor.AdjuntoIdentificacionMenorURL || "",
                    AdjuntoPasaporteMenor: menor.AdjuntoPasaporteMenorURL || "",
                    AdjuntoCertificadoNacimientoMenor: menor.AdjuntoCertificadoNacimientoMenorURL || ""
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
                    console.error("File upload error:", error);
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (urlError) {
                        console.error("Error fetching download URL:", urlError);
                        reject(urlError);
                    }
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
        adjuntoPasaporteAutorizante: false,
        adjuntoTutelaMenor: false,
        nombreCompletoTutor: false,
        emailTutor: false,
        telefonoTutor: false,
        cedulaPasaporteTutor: false,
        telefonoAutorizanteTutor: false,
        adjuntoIdentificacionTutor: false,
        adjuntoPasaporteTutor: false,
        adjuntoTutorTutelaMenor: false,
        adjuntoIdentificacionPadre: false,
        adjuntoPasaportePadre: false,
        adjuntoIdentificacionMadre: false,
        adjuntoPasaporteMadre: false,
        nombreCompletoMadre: false,
        emailMadre: false,
        telefonoMadre: false,
        cedulaPasaporteMadre: false,
        nombreCompletoPadre: false,
        emailPadre: false,
        telefonoPadre: false,
        cedulaPasaportePadre: false,
        menores: [{
            nombreCompletoMenor: false,
            cedulaPasaporteMenor: false,
            AdjuntoIdentificacionMenor: false,
            AdjuntoPasaporteMenor: false,
            AdjuntoCertificadoNacimientoMenor: false,
        }],
        nombreCompletoAutorizado: false,
        telefonoAutorizado: false,
        emailAutorizado: false,
        cedulaPasaporteAutorizado: false,
        parentescoConMenorAutorizado: false,
        parentescoAutorizadoOtros: false,
        adjuntoIdentificacionAutorizado: false,
        adjuntoPasaporteAutorizado: false,
        fechaSalidaMenor: false,
        fechaRetornoMenor: false,
        fechaFirmaNotaria: false,
        adjuntoBoletosViaje: false,
    });

    // Estado para almacenar múltiples menores
    const [menores, setMenores] = useState<Menor[]>([
        {
            nombreCompletoMenor: "",
            cedulaPasaporteMenor: "",
            AdjuntoIdentificacionMenor: null,
            AdjuntoPasaporteMenor: null,
            AdjuntoCertificadoNacimientoMenor: null
        }
    ]);

    const menoresRefs = useRef<Array<{
        nombreCompletoMenor: HTMLInputElement | null; cedulaPasaporteMenor: HTMLInputElement | null; AdjuntoIdentificacionMenor: HTMLInputElement | null;
        AdjuntoPasaporteMenor: HTMLInputElement | null; AdjuntoCertificadoNacimientoMenor: HTMLInputElement | null
    }>>([]);
    useEffect(() => {
        // Aseguramos que el array de referencias tenga el mismo tamaño que el número de menores
        menoresRefs.current = menores.map((_, index) => ({
            nombreCompletoMenor: menoresRefs.current[index]?.nombreCompletoMenor || null,
            cedulaPasaporteMenor: menoresRefs.current[index]?.cedulaPasaporteMenor || null,
            AdjuntoIdentificacionMenor: menoresRefs.current[index]?.AdjuntoIdentificacionMenor || null,
            AdjuntoPasaporteMenor: menoresRefs.current[index]?.AdjuntoPasaporteMenor || null,
            AdjuntoCertificadoNacimientoMenor: menoresRefs.current[index]?.AdjuntoCertificadoNacimientoMenor || null,
        }));
    }, [menores]);


    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailNew, setIsEmailNew] = useState(true);
    const [archivoFile, setArchivoFile] = useState<File | null>(null);
    const [archivoPasaporteAutorizanteFile, setArchivoPasaporteAutorizanteFile] = useState<File | null>(null);
    const [archivoTutelaFile, setArchivoTutelaFile] = useState<File | null>(null);
    const [archivoTutorFile, setArchivoTutorFile] = useState<File | null>(null);
    const [archivoPasaporteTutorFile, setArchivoPasaporteTutorFile] = useState<File | null>(null);
    const [archivoTutorTutelaFile, setArchivoTutorTutelaFile] = useState<File | null>(null);
    const [archivoPadreFile, setArchivoPadreFile] = useState<File | null>(null);
    const [archivoPasaportePadreFile, setArchivoPasaportePadreFile] = useState<File | null>(null);
    const [archivoMadreFile, setArchivoMadreFile] = useState<File | null>(null);
    const [archivoPasaporteMadreFile, setArchivoPasaporteMadreFile] = useState<File | null>(null);
    const [archivoCustodiaTotalFile, setArchivoCustodiaTotalFile] = useState<File | null>(null);
    const [archivoAutorizadoFile, setArchivoAutorizadoFile] = useState<File | null>(null);
    const [archivoPasaporteAutorizadoFile, setArchivoPasaporteAutorizadoFile] = useState<File | null>(null);
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
    const adjuntoPasaporteAutorizanteRef = useRef<HTMLInputElement>(null);
    const adjuntoTutelaMenorRef = useRef<HTMLInputElement>(null);
    const nombreCompletoTutorRef = useRef<HTMLInputElement>(null);
    const emailTutorRef = useRef<HTMLInputElement>(null);
    const cedulaPasaporteTutorRef = useRef<HTMLInputElement>(null);
    const telefonoTutorRef = useRef<HTMLInputElement>(null);
    const adjuntoIdentificacionTutorRef = useRef<HTMLInputElement>(null);
    const adjuntoPasaporteTutorRef = useRef<HTMLInputElement>(null);
    const adjuntoTutorTutelaMenorRef = useRef<HTMLInputElement>(null);
    const adjuntoIdentificacionPadreRef = useRef<HTMLInputElement>(null);
    const adjuntoPasaportePadreRef = useRef<HTMLInputElement>(null);
    const adjuntoIdentificacionMadreRef = useRef<HTMLInputElement>(null);
    const adjuntoPasaporteMadreRef = useRef<HTMLInputElement>(null);
    const adjuntoCustodiaTotalRef = useRef<HTMLInputElement>(null);
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
    const adjuntoPasaporteAutorizadoRef = useRef<HTMLInputElement>(null);
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
        } else if (fieldName === "AdjuntoPasaporteAutorizante") {
            setArchivoPasaporteAutorizanteFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoPasaporteAutorizante: false,
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
        } else if (fieldName === "adjuntoPasaporteTutor") {
            setArchivoPasaporteTutorFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoPasaporteTutor: false,
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
        } else if (fieldName === "adjuntoPasaportePadre") {
            setArchivoPasaportePadreFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoPasaportePadre: false,
            }));
        } else if (fieldName === "adjuntoIdentificacionMadre") {
            setArchivoMadreFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoIdentificacionMadre: false,
            }));
        } else if (fieldName === "adjuntoPasaporteMadre") {
            setArchivoPasaporteMadreFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoPasaporteMadre: false,
            }));
        } else if (fieldName === "adjuntoCustodiaTotal") {
            setArchivoCustodiaTotalFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoCustodiaTotal: false,
            }));
        } else if (fieldName.startsWith("AdjuntoIdentificacionMenor")) {
            const index = parseInt(fieldName.replace("AdjuntoIdentificacionMenor", ""));
            const updatedMenores = [...menores];
            updatedMenores[index] = { ...updatedMenores[index], AdjuntoIdentificacionMenor: file };
            setMenores(updatedMenores);
        } else if (fieldName.startsWith("AdjuntoPasaporteMenor")) {
            const index = parseInt(fieldName.replace("AdjuntoPasaporteMenor", ""));
            const updatedMenores = [...menores];
            updatedMenores[index] = { ...updatedMenores[index], AdjuntoPasaporteMenor: file };
            setMenores(updatedMenores);
        } else if (fieldName.startsWith("AdjuntoCertificadoNacimientoMenor")) {
            const index = parseInt(fieldName.replace("AdjuntoCertificadoNacimientoMenor", ""));
            const updatedMenores = [...menores];
            updatedMenores[index] = { ...updatedMenores[index], AdjuntoCertificadoNacimientoMenor: file };
            setMenores(updatedMenores);
        } else if (fieldName === "adjuntoIdentificacionAutorizado") {
            setArchivoAutorizadoFile(file);
            // Eliminar el error visual si se carga un archivo
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoIdentificacionAutorizado: false,
            }));
        } else if (fieldName === "adjuntoPasaporteAutorizado") {
            setArchivoPasaporteAutorizadoFile(file);
            setErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoPasaporteAutorizado: false,
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

        if (!archivoPasaporteAutorizanteFile) {
            setErrors((prevErrors) => ({ ...prevErrors, adjuntoPasaporteAutorizante: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Es necesario Adjuntar el pasaporte del Autorizante.",
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
            adjuntoPasaporteAutorizanteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            adjuntoPasaporteAutorizanteRef.current?.focus();
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
                    { field: "adjuntoTutelaMenor", ref: adjuntoTutelaMenorRef, errorMessage: "Es necesario Adjuntar Copia de Resolución o Declaración Jurada que designa la tutela total del menor." },
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

                if (!archivoPasaporteTutorFile) {
                    fieldValidations.push(
                        { field: "adjuntoPasaporteTutor", ref: adjuntoPasaporteTutorRef, errorMessage: "Es necesario Adjuntar el pasaporte del Tutor." },
                    );
                }

                if (!archivoTutorTutelaFile) {
                    fieldValidations.push(
                        { field: "adjuntoTutorTutelaMenor", ref: adjuntoTutorTutelaMenorRef, errorMessage: "Es necesario Adjuntar Copia de Resolución o Declaración Jurada que designa la tutela total del menor." },
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

                if (!archivoPasaporteMadreFile) {
                    fieldValidations.push(
                        { field: "adjuntoPasaporteMadre", ref: adjuntoPasaporteMadreRef, errorMessage: "Es necesario Adjuntar el pasaporte de la Madre." },
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

            if ((formData.quienesAutorizan === "Madre" || formData.quienesAutorizan === "Padre")) {

                if (!archivoCustodiaTotalFile) {
                    fieldValidations.push(
                        { field: "adjuntoCustodiaTotal", ref: adjuntoCustodiaTotalRef, errorMessage: "Es necesario Adjuntar la custodia total del menor." },
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

                if (!archivoPasaportePadreFile) {
                    fieldValidations.push(
                        { field: "adjuntoPasaportePadre", ref: adjuntoPasaportePadreRef, errorMessage: "Es necesario Adjuntar el pasaporte del Padre." },
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

        // Validar datos del menor 
        const validacionMenores = validateMenores();
        if (!validacionMenores) {
            return false;
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

        if (!archivoPasaporteAutorizadoFile) {
            fieldValidations.push(
                { field: "adjuntoPasaporteAutorizado", ref: adjuntoPasaporteAutorizadoRef, errorMessage: "Es necesario Adjuntar el pasaporte del Autorizado." },
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
            AdjuntoPasaporteMenor: false,
            AdjuntoCertificadoNacimientoMenor: false,
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

            // Validación del Pasaporte del Menor
            if (!menor.AdjuntoPasaporteMenor) {
                newErrors[index].AdjuntoPasaporteMenor = true;
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, adjunte el pasaporte del menor ${index + 1}.`,
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
                menoresRefs.current[index].AdjuntoPasaporteMenor?.scrollIntoView({ behavior: "smooth", block: "center" });
                menoresRefs.current[index].AdjuntoPasaporteMenor?.focus();
                isValid = false;
                break;
            } else {
                newErrors[index].AdjuntoPasaporteMenor = false;
            }

            // Validación del Certificado de Nacimiento del Menor
            if (!menor.AdjuntoCertificadoNacimientoMenor) {
                newErrors[index].AdjuntoCertificadoNacimientoMenor = true;
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, adjunte el certificado de nacimiento del menor ${index + 1}.`,
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
                menoresRefs.current[index].AdjuntoCertificadoNacimientoMenor?.scrollIntoView({ behavior: "smooth", block: "center" });
                menoresRefs.current[index].AdjuntoCertificadoNacimientoMenor?.focus();
                isValid = false;
                break;
            } else {
                newErrors[index].AdjuntoCertificadoNacimientoMenor = false;
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

        if (!validateFields() || !validateMenores()) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

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

        if (!recaptchaToken) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, complete el reCAPTCHA.",
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

    const [open, setOpen] = useState(false);

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const sendCreateRequest = async (cuenta: string) => {
        try {
            const requestData = {
                nombreSolicita: formData.nombreCompleto,
                telefonoSolicita: `${formData.telefonoCodigo} ${formData.telefono}`.trim(),
                cedulaPasaporte: formData.cedulaPasaporte || "",
                emailSolicita: formData.email,
    
                nacionalidad: formData.nacionalidad,
                actualizarPorCorreo: formData.notificaciones === "yes",
                ...(formData.ustedAutoriza === "No" && {
                    autorizante: {
                        nombreCompletoAutorizante: formData.nombreCompletoAutorizante,
                        emailAutorizante: formData.emailAutorizante,
                        telefonoAutorizante: `${formData.telefonoCodigoAutorizante} ${formData.telefonoAutorizante}`.trim(),
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
                            telefonoTutor: `${formData.telefonoCodigoTutor} ${formData.telefonoTutor}`.trim(),
                            cedulaPasaporteTutor: formData.cedulaPasaporteTutor,
                        }
                    }),
                    ...(formData.quienesAutorizan === "Padres" && {
                        ...((formData.parentescoConMenor === "Padre" || formData.parentescoConMenor === "Otros") && {
                            madre: {
                                nombreCompletoMadre: formData.nombreCompletoMadre,
                                emailMadre: formData.emailMadre,
                                telefonoMadre: `${formData.telefonoCodigoMadre} ${formData.telefonoMadre}`.trim(),
                                cedulaPasaporteMadre: formData.cedulaPasaporteMadre,
                            }
                        }),
                        ...((formData.parentescoConMenor === "Madre" || formData.parentescoConMenor === "Otros") && {
                            padre: {
                                nombreCompletoPadre: formData.nombreCompletoPadre,
                                emailPadre: formData.emailPadre,
                                telefonoPadre: `${formData.telefonoCodigoPadre} ${formData.telefonoPadre}`.trim(),
                                cedulaPasaportePadre: formData.cedulaPasaportePadre,
                            }
                        }),

                    }),
                }),
                autorizado: {
                    nombreCompletoAutorizado: formData.nombreCompletoAutorizado,
                    emailAutorizado: formData.emailAutorizado,
                    telefonoAutorizado: `${formData.telefonoCodigoAutorizado} ${formData.telefonoAutorizado}`.trim(),
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
                tipoConsulta: "Menores al Extranjero",
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
            console.log("🔍 solicitudId recibido:", solicitudId);

            let archivoURL = formData.archivoAutorizanteURL;
            let archivoPasaporteAutotizanteURL = formData.archivoPasaporteAutorizanteURL;
            let archivoTutelaURL = formData.archivoTutelaURL;
            let archivoTutorURL = formData.archivoTutorURL;
            let archivoPasaporteTutorURL = formData.archivoPasaporteTutorURL;
            let archivoTutorTutelaURL = formData.archivoTutorTutelaURL;
            let archivoPadreURL = formData.archivoPadreURL;
            let archivoPasaportePadreURL = formData.archivoPasaportePadreURL;
            let archivoMadreURL = formData.archivoMadreURL;
            let archivoPasaporteMadreURL = formData.archivoPasaporteMadreURL;
            let archivoAutorizadoURL = formData.archivoAutorizadoURL;
            let archivoPasaporteAutorizadoURL = formData.archivoPasaporteAutorizadoURL;
            let archivoBoletosViajeURL = formData.archivoBoletosViajeURL;
            let archivoCustodiaTotalURL = formData.archivoCustodiaTotalURL;

            if (archivoFile) {
                archivoURL = await uploadFileToFirebase(archivoFile, `uploads/${solicitudId}/AdjuntoIdentificacionAutorizante`);
            }

            if (archivoPasaporteAutorizanteFile) {
                archivoPasaporteAutotizanteURL = await uploadFileToFirebase(archivoPasaporteAutorizanteFile, `uploads/${solicitudId}/AdjuntoPasaporteAutorizante`);
            }

            if (archivoTutelaFile && formData.parentescoConMenor === "Tutor Legal") {
                archivoTutelaURL = await uploadFileToFirebase(archivoTutelaFile, `uploads/${solicitudId}/AdjuntoTutelaLegal`);
            }

            if (archivoTutorFile) {
                archivoTutorURL = await uploadFileToFirebase(archivoTutorFile, `uploads/${solicitudId}/AdjuntoIdentificacionTutor`);
            }

            if (archivoPasaporteTutorFile) {
                archivoPasaporteTutorURL = await uploadFileToFirebase(archivoPasaporteTutorFile, `uploads/${solicitudId}/AdjuntoPasaporteTutor`);
            }

            if (archivoTutorTutelaFile) {
                archivoTutorTutelaURL = await uploadFileToFirebase(archivoTutorTutelaFile, `uploads/${solicitudId}/AdjuntoTutorTutela`);
            }

            if (archivoPadreFile) {
                archivoPadreURL = await uploadFileToFirebase(archivoPadreFile, `uploads/${solicitudId}/AdjuntoIdentificacionPadre`);
            }

            if (archivoPasaportePadreFile) {
                archivoPasaportePadreURL = await uploadFileToFirebase(archivoPasaportePadreFile, `uploads/${solicitudId}/AdjuntoPasaportePadre`);
            }

            if (archivoMadreFile) {
                archivoMadreURL = await uploadFileToFirebase(archivoMadreFile, `uploads/${solicitudId}/AdjuntoIdentificacionMadre`);
            }

            if (archivoPasaporteMadreFile) {
                archivoPasaporteMadreURL = await uploadFileToFirebase(archivoPasaporteMadreFile, `uploads/${solicitudId}/AdjuntoPasaporteMadre`);
            }

            if (archivoPasaporteAutorizanteFile) {
                archivoCustodiaTotalURL = await uploadFileToFirebase(archivoPasaporteAutorizanteFile, `uploads/${solicitudId}/AdjuntoCustodiaTotal`);
            }

            if (archivoAutorizadoFile) {
                archivoAutorizadoURL = await uploadFileToFirebase(archivoAutorizadoFile, `uploads/${solicitudId}/AdjuntoIdentificacionAutorizado`);
            }

            if (archivoPasaporteAutorizadoFile) {
                archivoPasaporteAutorizadoURL = await uploadFileToFirebase(archivoPasaporteAutorizadoFile, `uploads/${solicitudId}/AdjuntoPasaporteAutorizado`);
            }

            if (archivoBoletosViajeFile) {
                archivoBoletosViajeURL = await uploadFileToFirebase(archivoBoletosViajeFile, `uploads/${solicitudId}/AdjuntoBoletosViaje`);
            }

            setFormData((prevData) => ({
                ...prevData,
                archivoAutorizanteURL: archivoURL,
                archivoPasaporteAutotizanteURL: archivoPasaporteAutotizanteURL,
                ...(formData.parentescoConMenor === "Tutor Legal" && {
                    archivoTutelaURL: archivoTutelaURL,
                    archivoPasaporteTutorURL: archivoPasaporteTutorURL,
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
                        archivoPasaporteMadreURL: archivoPasaporteMadreURL,
                    }),
                    ...((formData.quienesAutorizan === "Padres" &&
                        (formData.parentescoConMenor === "Madre" || formData.parentescoConMenor === "Otros")) && {
                        archivoPadreURL: archivoPadreURL,
                        archivoPasaportePadreURL: archivoPasaportePadreURL,
                    }),
                }),
                archivoAutorizadoURL: archivoAutorizadoURL,
                archivoPasaporteAutorizadoURL: archivoPasaporteAutorizadoURL,
                archivoBoletosViajeURL: archivoBoletosViajeURL,
            }));

            const menoresURLs = await Promise.all(
                menores.map(async (menor, index) => {
                    const identificacionURL = menor.AdjuntoIdentificacionMenor
                        ? await uploadFileToFirebase(menor.AdjuntoIdentificacionMenor, `uploads/${solicitudId}/AdjuntoIdentificacionMenor${index}`)
                        : "";

                    const pasaporteURL = menor.AdjuntoPasaporteMenor
                        ? await uploadFileToFirebase(menor.AdjuntoPasaporteMenor, `uploads/${solicitudId}/AdjuntoPasaporteMenor${index}`)
                        : "";

                    const certificadoNacimientoURL = menor.AdjuntoCertificadoNacimientoMenor
                        ? await uploadFileToFirebase(menor.AdjuntoCertificadoNacimientoMenor, `uploads/${solicitudId}/AdjuntoCertificadoNacimientoMenor${index}`)
                        : "";

                    return {
                        ...menor,
                        AdjuntoIdentificacionMenorURL: identificacionURL,
                        AdjuntoPasaporteMenorURL: pasaporteURL,
                        AdjuntoCertificadoNacimientoMenorURL: certificadoNacimientoURL,
                    };
                })
            );

            // Actualiza el estado de menores con las URLs de Firebase
            setMenores(menoresURLs);

            setFormData((prevData) => ({
                ...prevData,
                menores: menoresURLs,
            }));

            const updatePayload = {
                solicitudId: solicitudId,
                adjuntoIdentificacionAutorizante: archivoURL || '',
                adjuntoPasaporteAutorizante: archivoPasaporteAutotizanteURL || '',
                ...((formData.quienesAutorizan === "Padre" || formData.quienesAutorizan === "Madre") && {
                    archivoCustodiaTotalURL: archivoCustodiaTotalURL,
                }),
                ...(formData.parentescoConMenor === "Tutor Legal" && {
                    adjuntoTutelaMenor: archivoTutelaURL,
                }),
                ...(formData.autorizacionTercero === "Si" && {
                    ...(formData.quienesAutorizan === "Tutor Legal" && {
                        archivoTutorURL: archivoTutorURL,
                        archivoPasaporteTutorURL: archivoPasaporteTutorURL,
                        archivoTutorTutelaURL: archivoTutorTutelaURL,
                    }),
                }),
                ...(formData.autorizacionTercero === "Si" && {
                    ...((formData.quienesAutorizan === "Padres" &&
                        (formData.parentescoConMenor === "Padre" || formData.parentescoConMenor === "Otros")) && {
                        archivoMadreURL: archivoMadreURL,
                        adjuntoPasaporteMadre: archivoPasaporteMadreURL,
                    }),
                    ...((formData.quienesAutorizan === "Padres" &&
                        (formData.parentescoConMenor === "Madre" || formData.parentescoConMenor === "Otros")) && {
                        archivoPadreURL: archivoPadreURL,
                        archivoPasaportePadreURL: archivoPasaportePadreURL,
                    }),
                }),
                menores: menoresURLs.map((menor) => ({
                    nombreCompletoMenor: menor.nombreCompletoMenor,
                    cedulaPasaporteMenor: menor.cedulaPasaporteMenor,
                    AdjuntoIdentificacionMenorURL: menor.AdjuntoIdentificacionMenorURL || "",
                    AdjuntoPasaporteMenorURL: menor.AdjuntoPasaporteMenorURL || "",
                    AdjuntoCertificadoNacimientoMenorURL: menor.AdjuntoCertificadoNacimientoMenorURL || "",
                })),
                adjuntoIdentificacionAutorizado: archivoAutorizadoURL || '',
                archivoPasaporteAutorizadoURL: archivoPasaporteAutorizadoURL || "",
                adjuntoBoletosViaje: archivoBoletosViajeURL || '',
            };
            await axios.post('/api/update-request-all', updatePayload);
            if (status === "success" && solicitudId) {
                handleOpen();
                setStore((prevState) => ({
                    ...prevState,
                    solicitudId,
                }));
            }

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
                setStore((prevState) => ({
                    ...prevState,
                    solicitudId,
                }));
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

    const handleCountryChange = (name: string, value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
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
        AdjuntoPasaporteMenor: File | null;
        AdjuntoPasaporteMenorURL?: string;
        AdjuntoCertificadoNacimientoMenor: File | null;
        AdjuntoCertificadoNacimientoMenorURL?: string;
    }

    // Función para agregar un menor
    const handleAddMenor = () => {
        setMenores([...menores, { nombreCompletoMenor: "", cedulaPasaporteMenor: "", AdjuntoIdentificacionMenor: null, AdjuntoPasaporteMenor: null, AdjuntoCertificadoNacimientoMenor: null, }]);
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

    const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

    const toggleModal = () => {
        setShowModal(!showModal); // Alterna el estado del modal
    };

    // Estados para los modales y loading
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
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
    const [loading, setLoading] = useState(false);

    // Handlers para los botones
    const handlePaymentClick = () => {
        setLoading(true);
        setIsPaymentModalOpen(true);
    };
    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setLoading(false);
    };
    const handleSendAndPayLater = async () => {
        setLoading(true);
        // Aquí va la lógica para enviar y pagar más tarde
        setTimeout(() => setLoading(false), 1000);
    };
    const handleRegisterPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterPaymentForm({
            ...registerPaymentForm,
            [e.target.name]: e.target.value,
        });
    };
    const handleRegisterPaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí va la lógica para registrar el pago
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
            <h1 className="text-white text-3xl font-bold flex items-center">
                ¡Bienvenido a la Solicitud de Autorización de Salida de Menores al Extranjero!
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

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
                        <div className="p-4 border-b border-gray-600 flex justify-between items-center">
                            <h2 className="text-white text-xl">¡Bienvenido a la Solicitud de Salida de Menores al Extranjero en Línea!</h2>
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
                                src="https://www.youtube.com/embed/Ok0k9X6nl_w"
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
            <hr className='mt-4 mb-2' />
            <p className="text-white mt-4 texto_justificado">
                En este formulario podrás completar la información necesaria para solicitar la autorización de salida de un menor del país.
            </p>

            <p className="text-white mt-4 texto_justificado">
                La solicitud puede ser completada por cualquier persona, incluso si no está directamente involucrada en el trámite, pero deberá ingresar correctamente los datos de los padres o  del tutor legal del menor, seguido de los datos de la persona a quien se dirigirá la autorización.
            </p>

            <p className="text-white mt-4 texto_justificado">
                A continuación, te mostramos las distintas opciones disponibles para gestionar esta solicitud.
            </p>

            <BannerOpcionesMenores />

            <p className="text-white mt-4 texto_justificado">
                <strong className="text-red-500">IMPORTANTE:</strong> Este trámite es exclusivo para permisos de salida del país. Para otros procesos legales como custodia, patria potestad o conflictos judiciales, se debe solicitar asesoría legal especializada.
            </p>

            <p className="text-white mt-4 texto_justificado">
                Si tienes dudas sobre tu caso, consulta con nuestros abogados aquí:&nbsp;
                <Link href="/request/consulta-propuesta" style={{ color: '#D81B60', fontWeight: 'bold', textDecoration: 'none' }}>
                    consultas y propuestas
                </Link>.
            </p>

            <h2 className="text-white text-2xl mt-4 font-semibold">Información Personal</h2>
            <p className="text-white mt-2 texto_justificado">
                En este espacio, ingresa los datos de la persona que gestionará esta solicitud en la plataforma. Puede ser tu asistente, un familiar o tú mismo. Esta persona será responsable de verificar el avance del trámite, aunque no sea quien autoriza la salida del menor.
            </p>
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                        />
                    </div>

                    <div className="relative w-full">
                        <label className="block text-white mb-2">Nacionalidad:</label>
                        <select
                            name="nacionalidad"
                            value={formData.nacionalidad}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-6 mt-4">
                    <h2 className="block text-white text-lg font-semibold mb-2">¿Indica si eres el autorizante de la salida del menor?</h2>
                    <p className="text-white mt-2 texto_justificado">
                        Elige sí, en caso de autorizar la salida, si no lo eres, proporciona los datos del Papá, Mamá, tutor legal, Padres en caso que la autorización sea dirigida a un tercero .
                    </p>
                    <select
                        name="ustedAutoriza"
                        value={formData.ustedAutoriza}
                        onChange={handleInputChange}
                        className="w-full p-4 bg-gray-800 text-white rounded-lg"
                        disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="flex flex-col w-full">
                                <label className="block text-white">Número de teléfono del Autorizante:</label>
                                <div className="flex gap-2 mt-2">
                                    <CountrySelect
                                        name="telefonoCodigoAutorizante"
                                        value={formData.telefonoCodigoAutorizante}
                                        onChange={(value) => handleCountryChange('telefonoCodigoAutorizante', value)}
                                        className="w-contain"
                                    />
                                    <input
                                        ref={telefonoAutorizanteRef}
                                        type="text"
                                        name="telefonoAutorizante"
                                        value={formData.telefonoAutorizante || ""}
                                        onChange={handleInputChange}
                                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoAutorizante ? 'border-2 border-red-500' : ''}`}
                                        disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                        >
                            <option value="Padre">Papá</option>
                            <option value="Madre">Mamá</option>
                            <option value="Tutor Legal">Tutor Legal</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative w-full">
                        <label className="text-white block mb-2">Adjuntar identificación del Autorizante:</label>
                        <input
                            ref={adjuntoIdentificacionAutorizanteRef}
                            type="file"
                            name="AdjuntoIdentificacionAutorizante"
                            onChange={handleFileChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionAutorizante ? 'border-2 border-red-500' : ''}`}
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                        />
                        {formData.archivoAutorizanteURL && (
                            <p className="text-sm text-blue-500">
                                <a href={formData.archivoAutorizanteURL} target="_blank" rel="noopener noreferrer">
                                    Ver documento actual
                                </a>
                            </p>
                        )}
                    </div>

                    <div className="relative w-full">
                        <label className="text-white block mb-2">Adjuntar pasaporte del Autorizante:</label>
                        <input
                            ref={adjuntoPasaporteAutorizanteRef}
                            type="file"
                            name="AdjuntoPasaporteAutorizante"
                            onChange={handleFileChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoPasaporteAutorizante ? 'border-2 border-red-500' : ''}`}
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                        />
                        {formData.archivoPasaporteAutorizanteURL && (
                            <p className="text-sm text-blue-500">
                                <a href={formData.archivoPasaporteAutorizanteURL} target="_blank" rel="noopener noreferrer">
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
                                <label className="text-white block mb-2">Adjuntar Copia de Resolución o Declaración Jurada que designa la tutela total del menor:</label>
                                <input
                                    ref={adjuntoTutelaMenorRef}
                                    type="file"
                                    name="adjuntoTutelaMenor"
                                    onChange={handleFileChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoTutelaMenor ? 'border-2 border-red-500' : ''}`}
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                            value={formData.quienesAutorizan || "Padres"}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                if (e.target.value === "Padre" || e.target.value === "Madre") {
                                                    Swal.fire({
                                                        icon: "warning",
                                                        title: "Importante",
                                                        html: `<p class="texto_justificado text-base leading-relaxed">Se debe comprobar que posees la custodia total del menor, en caso de muerte de alguno de los padres adjunta acta de defunción, de lo contrario ambos padres deben firmar la autorización.</p>`,
                                                        confirmButtonText: "Entendido",
                                                        background: '#2c2c3e',
                                                        color: '#fff',
                                                        customClass: {
                                                            popup: 'custom-swal-popup w-[600px] h-auto py-10 px-8', 
                                                            title: 'custom-swal-title',
                                                            icon: 'custom-swal-icon',
                                                            confirmButton: 'bg-profile text-white px-4 py-2 rounded-lg'
                                                        }
                                                    });
                                                }
                                            }}
                                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                        >
                                            <option value="Padres">Padres</option>
                                            {(formData.parentescoConMenor === "Padre") && (
                                                <option value="Padre">Papá</option>
                                            )}

                                            {(formData.parentescoConMenor === "Madre") && (
                                                <option value="Madre">Mamá</option>
                                            )}

                                            <option value="Tutor Legal">Tutor Legal</option>
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
                                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="flex flex-col w-full">
                                                <label className="block text-white">Número de teléfono del Tutor:</label>
                                                <div className="flex gap-2 mt-2">
                                                    <CountrySelect
                                                        name="telefonoCodigoTutor"
                                                        value={formData.telefonoCodigoTutor}
                                                        onChange={(value) => handleCountryChange('telefonoCodigoTutor', value)}
                                                        className="w-contain"
                                                    />
                                                    <input
                                                        ref={telefonoTutorRef}
                                                        type="text"
                                                        name="telefonoTutor"
                                                        value={formData.telefonoTutor || ""}
                                                        onChange={handleInputChange}
                                                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoTutor ? 'border-2 border-red-500' : ''}`}
                                                        disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                                <label className="text-white block mb-2">Adjuntar pasaporte del Tutor:</label>
                                                <input
                                                    ref={adjuntoPasaporteTutorRef}
                                                    type="file"
                                                    name="adjuntoPasaporteTutor"
                                                    onChange={handleFileChange}
                                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoPasaporteTutor ? 'border-2 border-red-500' : ''}`}
                                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                />
                                                {formData.archivoPasaporteTutorURL && (
                                                    <p className="text-sm text-blue-500">
                                                        <a href={formData.archivoPasaporteTutorURL} target="_blank" rel="noopener noreferrer">
                                                            Ver documento actual
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="relative w-full">
                                                <label className="text-white block mb-2">Adjuntar Copia de Resolución o Declaración Jurada que designa la tutela total del menor:</label>
                                                <input
                                                    ref={adjuntoTutorTutelaMenorRef}
                                                    type="file"
                                                    name="adjuntoTutorTutelaMenor"
                                                    onChange={handleFileChange}
                                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoTutorTutelaMenor ? 'border-2 border-red-500' : ''}`}
                                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div className="flex flex-col w-full">
                                                        <label className="block text-white">Número de teléfono de la Madre:</label>
                                                        <div className="flex gap-2 mt-2">
                                                            <CountrySelect
                                                                name="telefonoCodigoMadre"
                                                                value={formData.telefonoCodigoMadre}
                                                                onChange={(value) => handleCountryChange('telefonoCodigoMadre', value)}
                                                                className="w-contain"
                                                            />
                                                            <input
                                                                ref={telefonoMadreRef}
                                                                type="text"
                                                                name="telefonoMadre"
                                                                value={formData.telefonoMadre || ""}
                                                                onChange={handleInputChange}
                                                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoMadre ? 'border-2 border-red-500' : ''}`}
                                                                disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div className="relative w-full">
                                                        <label className="text-white block mb-2">Adjuntar identificación de la Madre:</label>
                                                        <input
                                                            ref={adjuntoIdentificacionMadreRef}
                                                            type="file"
                                                            name="adjuntoIdentificacionMadre"
                                                            onChange={handleFileChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionMadre ? 'border-2 border-red-500' : ''}`}
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                        />
                                                        {formData.archivoMadreURL && (
                                                            <p className="text-sm text-blue-500">
                                                                <a href={formData.archivoMadreURL} target="_blank" rel="noopener noreferrer">
                                                                    Ver documento actual
                                                                </a>
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="relative w-full">
                                                        <label className="text-white block mb-2">Adjuntar pasaporte de la Madre:</label>
                                                        <input
                                                            ref={adjuntoPasaporteMadreRef}
                                                            type="file"
                                                            name="adjuntoPasaporteMadre"
                                                            onChange={handleFileChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoPasaporteMadre ? 'border-2 border-red-500' : ''}`}
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                        />
                                                        {formData.archivoPasaporteMadreURL && (
                                                            <p className="text-sm text-blue-500">
                                                                <a href={formData.archivoPasaporteMadreURL} target="_blank" rel="noopener noreferrer">
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
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div className="flex flex-col w-full">
                                                        <label className="block text-white">Número de teléfono del Padre:</label>
                                                        <div className="flex gap-2 mt-2">
                                                            <CountrySelect
                                                                name="telefonoCodigoPadre"
                                                                value={formData.telefonoCodigoPadre}
                                                                onChange={(value) => handleCountryChange('telefonoCodigoPadre', value)}
                                                                className="w-contain"
                                                            />

                                                            <input
                                                                ref={telefonoPadreRef}
                                                                type="text"
                                                                name="telefonoPadre"
                                                                value={formData.telefonoPadre || ""}
                                                                onChange={handleInputChange}
                                                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoPadre ? 'border-2 border-red-500' : ''}`}
                                                                disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div className="relative w-full">
                                                        <label className="text-white block mb-2">Adjuntar identificación del Padre:</label>
                                                        <input
                                                            ref={adjuntoIdentificacionPadreRef}
                                                            type="file"
                                                            name="adjuntoIdentificacionPadre"
                                                            onChange={handleFileChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionPadre ? 'border-2 border-red-500' : ''}`}
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                        />
                                                        {formData.archivoPadreURL && (
                                                            <p className="text-sm text-blue-500">
                                                                <a href={formData.archivoPadreURL} target="_blank" rel="noopener noreferrer">
                                                                    Ver documento actual
                                                                </a>
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="relative w-full">
                                                        <label className="text-white block mb-2">Adjuntar pasaporte del Padre:</label>
                                                        <input
                                                            ref={adjuntoPasaportePadreRef}
                                                            type="file"
                                                            name="adjuntoPasaportePadre"
                                                            onChange={handleFileChange}
                                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoPasaportePadre ? 'border-2 border-red-500' : ''}`}
                                                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                        />
                                                        {formData.archivoPasaportePadreURL && (
                                                            <p className="text-sm text-blue-500">
                                                                <a href={formData.archivoPasaportePadreURL} target="_blank" rel="noopener noreferrer">
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

                                {(formData.quienesAutorizan === "Madre" || formData.quienesAutorizan === "Padre") && (
                                    <>
                                        {/* CONTENIDO DE CUSTODIA */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 z-10 relative">
                                            <div className="relative w-full">
                                                <label className="text-white block mb-2">Adjuntar la custodia total del menor:</label>
                                                <input
                                                    ref={adjuntoCustodiaTotalRef}
                                                    type="file"
                                                    name="adjuntoCustodiaTotal"
                                                    onChange={handleFileChange}
                                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionMadre ? 'border-2 border-red-500' : ''}`}
                                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                                />
                                                {formData.archivoCustodiaTotalURL && (
                                                    <p className="text-sm text-blue-500">
                                                        <a href={formData.archivoCustodiaTotalURL} target="_blank" rel="noopener noreferrer">
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

                <hr className='mb-2 mt-4' />
                <h2 className="text-white text-2xl font-semibold mb-2">Información del Menor</h2>
                {menores.map((menor, index) => (
                    <div key={index} className="mt-4">

                        {/* Primera línea: nombre y cédula/pasaporte */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                />
                            </div>
                        </div>

                        {/* Segunda línea: archivos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                            {/* Identificación */}
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
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                />
                                {menor.AdjuntoIdentificacionMenor && (
                                    <p className="text-sm text-blue-500">
                                        <a
                                            href={typeof menor.AdjuntoIdentificacionMenor === "string" ? menor.AdjuntoIdentificacionMenor : URL.createObjectURL(menor.AdjuntoIdentificacionMenor)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Ver documento
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Pasaporte */}
                            <div className="relative w-full">
                                <label className="text-white block mb-2">Adjuntar pasaporte del Menor:</label>
                                <input
                                    ref={(el) => {
                                        if (menoresRefs.current[index]) {
                                            menoresRefs.current[index].AdjuntoPasaporteMenor = el;
                                        }
                                    }}
                                    type="file"
                                    name={`AdjuntoPasaporteMenor${index}`}
                                    onChange={handleFileChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.menores[index]?.AdjuntoPasaporteMenor ? 'border-2 border-red-500' : ''}`}
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                />
                                {menor.AdjuntoPasaporteMenor && (
                                    <p className="text-sm text-blue-500">
                                        <a
                                            href={typeof menor.AdjuntoPasaporteMenor === "string" ? menor.AdjuntoPasaporteMenor : URL.createObjectURL(menor.AdjuntoPasaporteMenor)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Ver documento
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Certificado de nacimiento */}
                            <div className="relative w-full">
                                <label className="text-white block mb-2">Adjuntar certificado de nacimiento del Menor:</label>
                                <input
                                    ref={(el) => {
                                        if (menoresRefs.current[index]) {
                                            menoresRefs.current[index].AdjuntoCertificadoNacimientoMenor = el;
                                        }
                                    }}
                                    type="file"
                                    name={`AdjuntoCertificadoNacimientoMenor${index}`}
                                    onChange={handleFileChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.menores[index]?.AdjuntoCertificadoNacimientoMenor ? 'border-2 border-red-500' : ''}`}
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                                />
                                {menor.AdjuntoCertificadoNacimientoMenor && (
                                    <p className="text-sm text-blue-500">
                                        <a
                                            href={typeof menor.AdjuntoCertificadoNacimientoMenor === "string" ? menor.AdjuntoCertificadoNacimientoMenor : URL.createObjectURL(menor.AdjuntoCertificadoNacimientoMenor)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Ver documento
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Botón eliminar menor */}
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveMenor(index)}
                                className="bg-red-600 text-white p-2 rounded-lg mt-4"
                                disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                        />
                    </div>

                    <div className="relative w-full">
                        <label className="block text-white mb-2">Nacionalidad:</label>
                        <select
                            name="nacionalidadAutorizado"
                            value={formData.nacionalidadAutorizado}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            <CountrySelect
                                name="telefonoCodigoAutorizado"
                                value={formData.telefonoCodigoAutorizado}
                                onChange={(value) => handleCountryChange('telefonoCodigoAutorizado', value)}
                                className="w-contain"
                            />
                            <input
                                ref={telefonoAutorizadoRef}
                                type="text"
                                name="telefonoAutorizado"
                                value={formData.telefonoAutorizado}
                                onChange={handleInputChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefonoAutorizado ? 'border-2 border-red-500' : ''}`}
                                disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="relative w-full">
                        <label className="text-white block mb-2">Adjuntar identificación del Autorizado:</label>
                        <input
                            ref={adjuntoIdentificacionAutorizadoRef}
                            type="file"
                            name="adjuntoIdentificacionAutorizado"
                            onChange={handleFileChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoIdentificacionAutorizado ? 'border-2 border-red-500' : ''}`}
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                        />
                        {formData.archivoAutorizadoURL && (
                            <p className="text-sm text-blue-500">
                                <a href={formData.archivoAutorizadoURL} target="_blank" rel="noopener noreferrer">
                                    Ver documento actual
                                </a>
                            </p>
                        )}
                    </div>
                    <div className="relative w-full">
                        <label className="text-white block mb-2">Adjuntar pasaporte del Autorizado:</label>
                        <input
                            ref={adjuntoPasaporteAutorizadoRef}
                            type="file"
                            name="adjuntoPasaporteAutorizado"
                            onChange={handleFileChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.adjuntoPasaporteAutorizado ? 'border-2 border-red-500' : ''}`}
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
                        />
                        {formData.archivoPasaporteAutorizadoURL && (
                            <p className="text-sm text-blue-500">
                                <a href={formData.archivoPasaporteAutorizadoURL} target="_blank" rel="noopener noreferrer">
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
                        disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                                    disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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
                            disabled={solicitudData && solicitudData.status >= 10 && store.rol < 20}
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

                <div className="mt-4">
                    <ReCAPTCHA
                        sitekey="6LejlrwqAAAAAN_WiEXqKIAT3qhfqPm-y1wh3BPi"
                        onChange={handleRecaptchaChange}
                    />
                </div>

                {!solicitudData && (
                    <>
                        <button className="bg-profile text-white w-full py-3 rounded-lg mt-4" type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <ClipLoader size={24} color="#ffffff" />
                                    <span className="ml-2">Cargando...</span>
                                </div>
                            ) : (
                                "Enviar y pagar"
                            )}
                        </button>
                    </>
                )}

                {/* Botones de pago al final del formulario */}
                <div className="mt-8 flex flex-col gap-4">
                    <button
                        type="button"
                        onClick={handlePaymentClick}
                        disabled={loading}
                        className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                    >
                        {loading ? 'Cargando...' : 'Pagar en línea'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSendAndPayLater}
                        disabled={loading}
                        className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                    >
                        {loading ? 'Procesando...' : 'Enviar y pagar más tarde'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsRegisterPaymentModalOpen(true)}
                        className="bg-profile text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                    >
                        Registrar Pago
                    </button>
                    <button
                        type="button"
                        className="bg-gray-500 text-white w-full py-3 rounded-lg"
                        onClick={() => window.location.href = "/dashboard/requests"}
                    >
                        Salir
                    </button>
                </div>

                {/* PaymentModal */}
                {isPaymentModalOpen && (
                    <PaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={handleClosePaymentModal}
                        saleAmount={total}
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

                <BotonesPreguntasYContactos
                    primerTexto={
                        <>
                            Acerca de las<br /> Salidas de Menores al Extranjero
                        </>
                    }
                    primerHref="https://panamalegalgroup.com/abogadosdefamiliapanama/"
                    preguntasHref="/NoMostrarBoton"
                />
            </form>
        </div >

    );
};

export default MenoresAlExtranjero;