import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import get from 'lodash/get';
import { backendBaseUrl, backendEnv } from '@utils/env';
import { checkAuthToken } from "@utils/checkAuthToken";
import Link from 'next/link';
import {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId
} from '@utils/env';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const roleMapping: { [key: number]: string } = {
    99: "Super Admin",
    90: "Administrador",
    80: "Auditor",
    50: "Caja Chica",
    40: "Abogados",
    35: "Asistente",
    17: "Cliente Recurrente",
    10: "Cliente",
};

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

const Request: React.FC = () => {
    const [selectedLawyer, setSelectedLawyer] = useState<any>(null);
    const [status, setStatus] = useState(-1);
    const [observation, setObservation] = useState('');
    const router = useRouter();
    const { id } = router.query;
    const [solicitudData, setSolicitudData] = useState<any>(null);
    const [statusName, setStatusName] = useState("");
    const [lawyers, setLawyers] = useState<any[]>([]);
    const [peopleData, setPeopleData] = useState<any[]>([]);

    const [formData, setFormData] = useState<{
        cuenta: string;
        email: string;
        rol: string;
        userId: string;
        comprobantePagoURL: any,
    }>({
        cuenta: "",
        email: "",
        rol: "",
        userId: "",
        comprobantePagoURL: '',
    });

    const getStatusName = (status: number) => {
        switch (status) {
            case 0: return "Rechazada";
            case 1: return "Borrador";
            case 10: return "Enviada, pendiente de pago";
            case 12: return "Aprobada";
            case 19: return "Confirmando pago";
            case 20: return "Pagada";
            case 30: return "En proceso";
            case 70: return "Finalizada";
            default: return "";
        }
    };

    useEffect(() => {
        if (id) {
            // Usa el ID como necesites, por ejemplo, para obtener los detalles de la solicitud
            console.log('ID del registro:', id);
        }
    }, [id]);

    useEffect(() => {
        const fetchSolicitud = async () => {
            if (!id) return;

            try {
                const solicitudResponse = await axios.get('/api/get-request-id', {
                    params: { solicitudId: id },
                });

                console.log('Solicitud Data:', solicitudResponse.data); // Verifica los datos
                setSolicitudData(solicitudResponse.data);

                // Convertir solicitudData.status a número antes de pasarlo a getStatusName
                const statusNumber = parseInt(solicitudResponse.data.status, 10);
                setStatusName(getStatusName(statusNumber));

                const userData = checkAuthToken();
                if (!userData) {
                    throw new Error("User is not authenticated.");
                }
                const comprobantePagoURL = get(solicitudResponse.data, 'adjuntoComprobantePago', '');
                setFormData((prevData) => ({
                    ...prevData,
                    email: userData.email,
                    cuenta: userData.user_id,
                    comprobantePagoURL,
                }));

                // 2. Fetch User Data based on cuenta
                console.log("Cuenta ", userData.user_id);
                const userResponse = await axios.get('/api/get-user-cuenta', {
                    params: { userCuenta: userData.user_id },
                });

                const user = userResponse.data;

                const rawRole = get(user, 'solicitud.rol', null);
                if (rawRole === null || rawRole === undefined) {
                    console.warn('El rol no está definido en el objeto user:', user);
                }

                const stringRole =
                    typeof rawRole === 'string'
                        ? rawRole
                        : roleMapping[rawRole] || "Rol inválido";
                console.log('Rol recibido:', rawRole, 'Rol mapeado:', stringRole);
                setFormData((prevData) => ({
                    ...prevData,
                    rol: stringRole, // Asignar rol en formato string
                    userId: get(user, 'solicitud.id', ""),
                }));

                if (solicitudResponse.data.tipo === "new-fundacion" || solicitudResponse.data.tipo === "new-sociedad-empresa") {
                    const peopleResponse = await axios.get('/api/get-people-id', {
                        params: { solicitudId: id },
                    });
                    setPeopleData(peopleResponse.data);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchSolicitud();
    }, [id]);

    useEffect(() => {
        const fetchAllLawyers = async () => {
            let allLawyers: any[] = [];
            let currentPage = 1;
            const limitPerPage = 10;
            let hasMore = true;

            try {
                // Obtener los IDs de los abogados ya asignados en la solicitud
                const assignedLawyerIds = solicitudData?.abogados?.map((abogado: any) => abogado.id) || [];

                while (hasMore) {
                    const response = await axios.get('/api/user', {
                        params: {
                            limit: limitPerPage,
                            page: currentPage,
                        },
                    });

                    const usuarios = response.data.usuarios;

                    // Filtrar usuarios con `rol >= 35` y que no estén en `assignedLawyerIds`
                    const filteredLawyers = usuarios.filter((user: any) =>
                        user.rol >= 35 && !assignedLawyerIds.includes(user.id)
                    );

                    // Añadir los resultados filtrados al array total
                    allLawyers = [...allLawyers, ...filteredLawyers];

                    // Verificar si hay más páginas
                    const totalUsers = response.data.totalUsers;
                    const totalPages = Math.ceil(totalUsers / limitPerPage);

                    hasMore = currentPage < totalPages;
                    currentPage += 1; // Avanzar a la siguiente página
                }

                setLawyers(allLawyers); // Almacenar todos los abogados en el estado
            } catch (error) {
                console.error('Error fetching all lawyers:', error);
            }
        };

        if (solicitudData) {
            fetchAllLawyers();
        }
    }, [solicitudData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setArchivoFile(file);
    };

    const [archivoFile, setArchivoFile] = useState<File | null>(null);

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

    const handleValidation = () => {
        if (status === -1) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debes seleccionar un Estatus válido.",
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
            document.getElementById("statusSelect")?.classList.add("border-red-500");
            return false;
        } else {
            document.getElementById("statusSelect")?.classList.remove("border-red-500");
        }

        if (observation.trim() === '') {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debes agregar una Observación.",
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
            document.getElementById("observationTextarea")?.classList.add("border-red-500");
            return false;
        } else {
            document.getElementById("observationTextarea")?.classList.remove("border-red-500");
        }
        return true;
    };

    const handleUpdate = async () => {
        if (!handleValidation()) return;
        // Lógica para actualizar el estatus o realizar alguna acción
        try {
            let archivoURL = "";
            if (archivoFile) {
                archivoURL = await uploadFileToFirebase(archivoFile, `uploads/${id}/adjuntoDocumentoBitacora`);
            }

            const updatePayload = {
                solicitudId: id,
                status: status,
                observation: observation,
                adjuntoDocumentoBitacora: archivoURL || '',
            };

            const responseData = await axios.post('/api/update-request-bitacora', updatePayload);

            if (responseData.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Bitacora actualizada correctamente",
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
                    window.location.reload();
                });
                console.log("Los datos han sido guardados correctamente.");
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Error al actualizar la bitacora",
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
                console.log("Error al actualizar la solicitud.")
            }
        } catch (error) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Hubo un problema enviando la actualizacion de la bitacora. Por favor, inténtalo de nuevo más tarde.",
                showConfirmButton: false,
                timer: 1500,
            });
            console.error("Error creating request:", error);
        }
    };

    const handleBack = async () => {
        await router.push('/dashboard/requests');
    };

    useEffect(() => {
        const fetchAllLawyers = async () => {
            // Lógica para cargar abogados (sin cambios)
        };

        fetchAllLawyers();
    }, []);

    const handleAssignLawyer = async () => {
        if (!selectedLawyer) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debes seleccionar un abogado.",
                timer: 2500,
                showConfirmButton: false,
                background: '#2c2c3e',
                color: '#fff'
            });
            return;
        }

        try {
            const updatePayload = {
                solicitudId: id,
                id: selectedLawyer.id,
                nombre: selectedLawyer.nombre,
            };

            console.log('🚀 ~ handler ~ dataFront:', updatePayload);

            const responseData = await axios.post('/api/update-request-abogados', updatePayload);

            if (responseData.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Abogado asignado correctamente",
                    timer: 2500,
                    showConfirmButton: false,
                    background: '#2c2c3e',
                    color: '#fff',
                }).then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error al asignar abogado",
                    timer: 2500,
                    showConfirmButton: false,
                    background: '#2c2c3e',
                    color: '#fff',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Hubo un problema asignando el abogado.",
                timer: 1500,
                showConfirmButton: false,
                position: 'top-end'
            });
            console.error("Error assigning lawyer:", error);
        }
    };

    function mostrarDate(dateInput) {
        console.log("Valor de dateInput:", dateInput);

        // Verifica si el objeto tiene _seconds y _nanoseconds (formato Firestore Timestamp)
        if (dateInput && typeof dateInput._seconds === 'number' && typeof dateInput._nanoseconds === 'number') {
            const milliseconds = dateInput._seconds * 1000 + dateInput._nanoseconds / 1000000;
            const date = new Date(milliseconds);

            // Formatea la fecha en dd-mm-yyyy
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();

            return `${day}-${month}-${year}`;
        }

        // Verifica si `dateInput` es un Timestamp de Firestore
        if (dateInput && typeof dateInput.toDate === 'function') {
            const date = dateInput.toDate();
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }

        // Si dateInput ya es una instancia de Date
        if (dateInput instanceof Date) {
            const day = dateInput.getDate().toString().padStart(2, '0');
            const month = (dateInput.getMonth() + 1).toString().padStart(2, '0');
            const year = dateInput.getFullYear();
            return `${day}-${month}-${year}`;
        }

        // Si es una cadena de texto, intenta parsear como fecha
        if (typeof dateInput === 'string') {
            const date = new Date(dateInput);
            if (!isNaN(date.getTime())) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            }
        }

        console.warn("Formato de fecha inválido:", dateInput);
        return "Fecha inválida";
    }

    const handleDownload = async () => {
        try {
            let solicitudId = id;
            // Llamar a la API para obtener la URL del archivo
            const response = await axios.post(`${backendBaseUrl}/${backendEnv}/create-pacto-social-file/${solicitudId}`);

            if (response.data && response.data.fileUrl) {
                // Crear un enlace temporal para descargar el archivo
                const url = response.data.fileUrl;
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'pacto_social.docx'); // Establecer el nombre del archivo
                document.body.appendChild(link);

                // Simular clic para descargar el archivo
                link.click();

                // Verificar si `link` tiene un nodo padre antes de eliminarlo
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            } else {
                alert('No se pudo obtener el archivo. Por favor, inténtelo nuevamente.');
            }
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            alert('Hubo un error al intentar descargar el archivo.');
        }
    };

    const renderPersonName = (person: any) => {
        // Si es persona jurídica, mostrar nombreJuridico - nombreApellido
        if (person.personaJuridica && person.personaJuridica.nombreJuridico) {
            return `${person.personaJuridica.nombreJuridico} - ${person.nombreApellido}`;
        }
        // Si no es persona jurídica, mostrar solo el nombreApellido
        return person.nombreApellido;
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        let y = 20; // Posición inicial en Y
        const pageHeight = doc.internal.pageSize.height; // Altura de la página

        // Función auxiliar para manejar texto con saltos de página automáticos
        const addLine = (text: string) => {
            const margin = 10; // Margen izquierdo
            const maxWidth = doc.internal.pageSize.width - 2 * margin; // Ancho máximo del texto
            const lines = doc.splitTextToSize(text, maxWidth); // Divide el texto en líneas ajustadas al ancho
            lines.forEach(line => {
                if (y + 10 > pageHeight) {
                    doc.addPage();
                    y = 20; // Reinicia la posición Y en la nueva página
                }
                doc.text(line, margin, y);
                y += 7; // Ajusta el espacio entre líneas
            });
        };

        // Título del documento
        doc.setFontSize(20);
        addLine('Resumen de la Solicitud');
        y += 10;
        if (solicitudData.tipo === "new-sociedad-empresa") {
            // Información del Solicitante
            if (solicitudData) {
                doc.setFontSize(16);
                addLine('Información del Solicitante');
                doc.setFontSize(12);
                addLine(`Nombre: ${solicitudData.nombreSolicita || 'N/A'}`);
                addLine(`Teléfono: ${solicitudData.telefonoSolicita || 'N/A'}`);
                addLine(`Correo Electrónico: ${solicitudData.emailSolicita || 'N/A'}`);
                y += 10;
            }

            // Opciones para el nombre de la sociedad
            if (solicitudData?.empresa || solicitudData?.nombreSociedad_1) {
                doc.setFontSize(16);
                addLine('Opciones para el nombre de la sociedad:');
                doc.setFontSize(12);
                addLine(`1. ${solicitudData?.empresa?.nombreSociedad1 || solicitudData?.nombreSociedad_1 || 'N/A'}`);
                addLine(`2. ${solicitudData?.empresa?.nombreSociedad2 || solicitudData?.nombreSociedad_2 || 'N/A'}`);
                addLine(`3. ${solicitudData?.empresa?.nombreSociedad3 || solicitudData?.nombreSociedad_3 || 'N/A'}`);
                y += 10;
            }

            // Directores de la Sociedad
            if (peopleData.length > 0 || (solicitudData.directores && solicitudData.directores.length > 0)) {
                doc.setFontSize(16);
                addLine('Directores de la Sociedad:');
                doc.setFontSize(12);

                // **Fusionar directores propios y nominales en una sola lista**
                const allDirectors = [
                    ...peopleData.filter(person => person.director),
                    ...(solicitudData.directores || []).filter(director => director.servicio === 'Director Nominal'),
                    ...(solicitudData.directores || [])
                        .filter(director => director.servicio !== 'Director Nominal') // Excluir nominales
                        .map(director => peopleData.find(person => person.id === director.id_persona)) // Buscar en peopleData
                        .filter(Boolean) // Remover valores nulos
                ];

                // **Recorrer e imprimir todos los directores en una sola lista**
                allDirectors.forEach((director, index) => {
                    if (director.servicio === 'Director Nominal') {
                        addLine(`Director #${index + 1}: Director Nominal`);
                    } else {
                        addLine(`Director #${index + 1}: ${renderPersonName(director)}`);
                    }
                });

                y += 10;
            } else {
                addLine('No hay directores registrados.');
            }

            // Dignatarios de la Sociedad
            if (peopleData.length > 0 || (solicitudData.dignatarios && solicitudData.dignatarios.length > 0)) {
                doc.setFontSize(16);
                addLine('Dignatarios de la Sociedad:');
                doc.setFontSize(12);

                // **1️⃣ Obtener dignatarios propios desde `peopleData`**
                const dignatariosPropios = peopleData.filter(person => person.dignatario);

                // **2️⃣ Obtener dignatarios propios desde `solicitudData.dignatarios`, buscando en `peopleData`**
                const dignatariosDesdeSolicitud = (solicitudData.dignatarios ?? [])
                    .filter(dignatario => dignatario.servicio !== 'Dignatario Nominal') // Excluir nominales
                    .map(dignatario => {
                        const person = peopleData.find(person => person.id === dignatario.id_persona || person.id === dignatario.personId);
                        if (!person) return null; // Si no se encuentra en peopleData, se omite

                        return {
                            ...person,
                            servicio: dignatario.servicio, // Asegurar que tenga el servicio asignado
                            posiciones: dignatario.posiciones || dignatario.positions || [], // Tomar posiciones de ambos campos
                        };
                    })
                    .filter(Boolean); // Remover valores nulos

                // **3️⃣ Obtener dignatarios nominales desde `solicitudData.dignatarios`**
                const dignatariosNominales = (solicitudData.dignatarios ?? [])
                    .filter(dignatario => dignatario.servicio === 'Dignatario Nominal')
                    .map(dignatario => ({
                        ...dignatario,
                        posiciones: dignatario.posiciones || dignatario.positions || [], // Tomar posiciones de ambos campos
                    }));

                // **Evitar duplicados usando un Set para IDs**
                const dignatariosUnicosArray: any[] = [];
                const idsUnicos = new Set();

                [...dignatariosPropios, ...dignatariosDesdeSolicitud].forEach(dignatario => {
                    if (dignatario && dignatario.id && !idsUnicos.has(dignatario.id)) {
                        idsUnicos.add(dignatario.id);
                        dignatariosUnicosArray.push(dignatario);
                    }
                });

                // **Fusionar dignatarios propios y nominales**
                const todosLosDignatarios = [...dignatariosUnicosArray, ...dignatariosNominales];

                // **Generar el contenido en el PDF**
                todosLosDignatarios.forEach((dignatario, index) => {
                    let posiciones = dignatario.posiciones || [];

                    // **Concatenar y mostrar las posiciones correctamente**
                    let posicionesConcatenadas = "";
                    if (Array.isArray(posiciones)) {
                        if (posiciones.length > 0 && typeof posiciones[0] === "string") {
                            // **Caso 1: `positions` es un array de strings**
                            posicionesConcatenadas = posiciones.join(', ');
                        } else if (posiciones.length > 0 && typeof posiciones[0] === "string") {
                            // **Caso 2: `posiciones` es un array de objetos con `nombre`**
                            posicionesConcatenadas = posiciones.join(', ');
                        }
                    }

                    // **Imprimir en el PDF**
                    if (dignatario.servicio === 'Dignatario Nominal') {
                        addLine(`Dignatario #${index + 1}: Dignatario Nominal`);
                    } else {
                        addLine(`Dignatario #${index + 1}: ${renderPersonName(dignatario)}`);
                    }

                    if (posicionesConcatenadas) {
                        addLine(`  Posiciones: ${posicionesConcatenadas}`);
                    }
                });

                y += 10;
            } else {
                addLine('No hay dignatarios registrados.');
            }

            // Accionistas de la Sociedad
            if (peopleData.length > 0 || (solicitudData.accionistas && solicitudData.accionistas.length > 0)) {
                doc.setFontSize(16);
                addLine('Accionistas de la Sociedad:');
                doc.setFontSize(12);

                // **1️⃣ Obtener accionistas propios desde `peopleData`**
                const accionistasPropios = peopleData
                    .filter(person => person.accionista)
                    .map(person => ({
                        id: person.id,
                        nombre: renderPersonName(person),
                        porcentajeAcciones: person.accionista?.porcentajeAcciones || 'N/A'
                    }));

                // **2️⃣ Obtener accionistas desde `solicitudData.accionistas`, buscando en `peopleData`**
                const accionistasDesdeSolicitud = (solicitudData.accionistas ?? [])
                    .map(accionista => {
                        const person = peopleData.find(person => person.id === accionista.id_persona);
                        if (!person) return null; // Omitir si no se encuentra en `peopleData`

                        return {
                            id: person.id,
                            nombre: renderPersonName(person),
                            porcentajeAcciones: accionista.porcentaje || 'N/A'
                        };
                    })
                    .filter(Boolean); // Remover valores nulos

                // **Evitar duplicados usando un Set para IDs**
                const accionistasUnicosArray: any[] = [];
                const idsUnicos = new Set();

                [...accionistasPropios, ...accionistasDesdeSolicitud].forEach(accionista => {
                    if (accionista && accionista.id && !idsUnicos.has(accionista.id)) {
                        idsUnicos.add(accionista.id);
                        accionistasUnicosArray.push(accionista);
                    }
                });

                // **Generar el contenido en el PDF**
                accionistasUnicosArray.forEach((accionista, index) => {
                    addLine(`Accionista #${index + 1}. ${accionista.nombre} - ${accionista.porcentajeAcciones}% de las acciones`);
                });

                y += 10;
            } else {
                addLine('No hay accionistas registrados.');
            }

            // Capital y División de Acciones
            if (solicitudData?.capital) {
                doc.setFontSize(16);
                addLine('Capital y División de Acciones:');
                doc.setFontSize(12);
                addLine(`Capital social: ${solicitudData.capital.capital || 'N/A'}`);
                addLine(`Cantidad de Acciones: ${solicitudData.capital.cantidadAcciones || 'N/A'}`);
                addLine(`Acciones sin Valor Nominal: ${solicitudData.capital.accionesSinValorNominal || 'N/A'}`);
                addLine(`Valor por Acción: ${solicitudData.capital.valorPorAccion || 'N/A'}`);
                y += 10;
            }

            // Poder de la Sociedad
            if (peopleData.length > 0 || (solicitudData.poder && solicitudData.poder.length > 0)) {
                doc.setFontSize(16);
                addLine('Poder de la Sociedad:');
                doc.setFontSize(12);

                // **1️⃣ Obtener apoderados desde `peopleData`**
                const apoderadosPropios = peopleData
                    .filter(person => person.poder)
                    .map(person => ({
                        id: person.id,
                        nombre: renderPersonName(person)
                    }));

                // **2️⃣ Obtener apoderados desde `solicitudData.poder`, buscando en `peopleData`**
                const apoderadosDesdeSolicitud = (solicitudData.poder ?? [])
                    .map(poder => {
                        const person = peopleData.find(person => person.id === poder.id_persona);
                        if (!person) return null; // Omitir si no se encuentra en `peopleData`

                        return {
                            id: person.id,
                            nombre: renderPersonName(person)
                        };
                    })
                    .filter(Boolean); // Remover valores nulos

                // **Evitar duplicados usando un Set para IDs**
                const apoderadosUnicosArray: any[] = [];
                const idsUnicos = new Set();

                [...apoderadosPropios, ...apoderadosDesdeSolicitud].forEach(apoderado => {
                    if (apoderado && apoderado.id && !idsUnicos.has(apoderado.id)) {
                        idsUnicos.add(apoderado.id);
                        apoderadosUnicosArray.push(apoderado);
                    }
                });

                // **Generar el contenido en el PDF**
                apoderadosUnicosArray.forEach((apoderado, index) => {
                    addLine(`Poder #${index + 1}. ${apoderado.nombre}`);
                });

                y += 10;
            } else {
                addLine('No hay poder registrados.');
            }

            // Actividades de la Sociedad
            if (solicitudData?.actividades || solicitudData?.dentroPanama) {
                doc.setFontSize(16);
                addLine('Actividades de la Sociedad:');
                doc.setFontSize(12);

                // **1️⃣ Si la empresa YA TIENE LOCAL en Panamá**
                if (
                    solicitudData.actividades?.actividadesDentroPanama === 'SiYaTengoLocal' ||
                    solicitudData?.dentroPanama === 'Si, ya tengo la local'
                ) {
                    addLine('Actividades dentro de Panamá:');

                    addLine(`Nombre Comercial: ${solicitudData.actividades?.actividadesDentroPanamaData?.nombreComercial || solicitudData.avisOperacion?.aO_nombreComercial || 'N/A'}`);
                    addLine(`Dirección Comercial: ${solicitudData.actividades?.actividadesDentroPanamaData?.direccionComercial || solicitudData.avisOperacion?.aO_direccion || 'N/A'}`);
                    addLine(`Cómo llegar: ${solicitudData.actividades?.actividadesDentroPanamaData?.comoLlegar || solicitudData.avisOperacion?.aO_comoLlegar || 'N/A'}`);
                    addLine(`Provincia: ${solicitudData.actividades?.actividadesDentroPanamaData?.provincia || solicitudData.avisOperacion?.aO_provincia || 'N/A'}`);
                    addLine(`Teléfono: ${solicitudData.actividades?.actividadesDentroPanamaData?.telefono || solicitudData.avisOperacion?.aO_telefono || 'N/A'}`);

                    // **Validar contador**
                    if (
                        (solicitudData.actividades?.contador && solicitudData.actividades?.mantieneContador === 'Si') ||
                        (solicitudData.contador && solicitudData.contador.selectContador === 'Si')
                    ) {
                        addLine('Información del Contador:');
                        addLine(`Nombre: ${solicitudData.actividades?.contador?.nombreContador || solicitudData.contador?.contador_nombre || 'N/A'}`);
                        addLine(`Idoneidad: ${solicitudData.actividades?.contador?.idoneidadContador || solicitudData.contador?.contador_idoneidad || 'N/A'}`);
                        addLine(`Teléfono: ${solicitudData.actividades?.contador?.telefonoContador || solicitudData.contador?.contador_telefono || 'N/A'}`);
                    }
                }

                // **2️⃣ Si REQUIERE SOCIEDAD PRIMERO**
                else if (
                    solicitudData.actividades?.actividadesDentroPanama === 'SiRequieroSociedadPrimero' ||
                    solicitudData?.dentroPanama === 'Si, pero requiero la sociedad'
                ) {
                    addLine('Actividades Comerciales:');
                    addLine(`Actividad #1: ${solicitudData.actividades?.actividad1 || solicitudData.actividadComercial?.aC_1 || 'N/A'}`);
                    addLine(`Actividad #2: ${solicitudData.actividades?.actividad2 || solicitudData.actividadComercial?.aC_2 || 'N/A'}`);
                    addLine(`Actividad #3: ${solicitudData.actividades?.actividad3 || solicitudData.actividadComercial?.aC_3 || 'N/A'}`);

                    // **Validar contador**
                    if (
                        (solicitudData.actividades?.contador && solicitudData.actividades?.mantieneContador === 'Si') ||
                        (solicitudData.contador && solicitudData.contador.selectContador === 'Si')
                    ) {
                        addLine('Información del Contador:');
                        addLine(`Nombre: ${solicitudData.actividades?.contador?.nombreContador || solicitudData.contador?.contador_nombre || 'N/A'}`);
                        addLine(`Idoneidad: ${solicitudData.actividades?.contador?.idoneidadContador || solicitudData.contador?.contador_idoneidad || 'N/A'}`);
                        addLine(`Teléfono: ${solicitudData.actividades?.contador?.telefonoContador || solicitudData.contador?.contador_telefono || 'N/A'}`);
                    }
                }

                // **3️⃣ Si la empresa NO OPERA EN PANAMÁ (Offshore)**
                else if (
                    (solicitudData.actividades?.actividadesDentroPanama === 'No' && solicitudData.actividades?.actividadesOffshore) ||
                    (solicitudData?.dentroPanama === 'No' && solicitudData?.fueraPanama)
                ) {
                    addLine('Actividades Offshore:');
                    addLine(`Actividad Offshore #1: ${solicitudData.actividades?.actividadesOffshore?.actividadOffshore1 || solicitudData.fueraPanama?.aCF_1 || 'N/A'}`);
                    addLine(`Actividad Offshore #2: ${solicitudData.actividades?.actividadesOffshore?.actividadOffshore2 || solicitudData.fueraPanama?.aCF_2 || 'N/A'}`);
                    addLine(`Países donde se ejecutarán las actividades: ${solicitudData.actividades?.actividadesOffshore?.paisesActividadesOffshore || solicitudData.fueraPanama?.aCF_paises || 'N/A'}`);
                }

                // **4️⃣ Si la empresa es TENEDORA DE ACTIVOS**
                if (Array.isArray(solicitudData.actividades?.actividadTenedora)) {
                    doc.setFontSize(14);
                    addLine('Actividades de Tenedora de Activos:');
                    doc.setFontSize(12);

                    const actividadNombres = {
                        vehiculoInversion: 'Vehículo de Inversión',
                        portafolioBienesRaices: 'Portafolio de Bienes Raíces',
                        tenedoraActivos: 'Tenedora de Activos',
                        grupoEconomico: 'Como parte de una estructura o grupo económico',
                        duenoNaveAeronave: 'Dueño de Nave o Aeronave',
                    };

                    solicitudData.actividades.actividadTenedora.forEach((actividad, index) => {
                        const actividadTexto = actividadNombres[actividad] || actividad;
                        addLine(`Actividad #${index + 1}: ${actividadTexto}`);
                    });
                }

                y += 10;
            } else {
                addLine('No hay actividades registradas.');
            }

            // Fuentes de Ingresos
            if (solicitudData?.fuentesIngresos) {
                doc.setFontSize(16);
                addLine('Fuentes de Ingresos:');
                doc.setFontSize(12);
                const fuenteMap = {
                    ahorrosPersonales: 'Ahorros Personales',
                    herencia: 'Herencia',
                    ingresoInmueble: 'Ingreso por Inmueble',
                    ingresoNegocios: 'Ingreso por Negocios',
                    ventaActivos: 'Venta de Activos',
                };

                Object.entries(solicitudData.fuentesIngresos)
                    .filter(([, value]) => value === true)
                    .forEach(([key], index) => {
                        addLine(`Fuente ${index + 1}: ${fuenteMap[key] || key}`);
                    });

                if (solicitudData.fuentesIngresos.otro) {
                    addLine(`Otro: ${solicitudData.fuentesIngresos.otro}`);
                }
            }

            // Solicitud Adicional
            if (solicitudData?.solicitudAdicional?.solicitudAdicional || solicitudData?.solicitudAdicional) {
                doc.setFontSize(16);
                addLine('Solicitud Adicional:');
                doc.setFontSize(12);
                addLine(solicitudData?.solicitudAdicional?.solicitudAdicional || solicitudData?.solicitudAdicional);
            }
        } else if (solicitudData.tipo === "new-fundacion") {
            // Información del Solicitante
            if (solicitudData) {
                doc.setFontSize(16);
                addLine('Información del Solicitante');
                doc.setFontSize(12);
                addLine(`Nombre: ${solicitudData.nombreSolicita || 'N/A'}`);
                addLine(`Teléfono: ${solicitudData.telefonoSolicita || 'N/A'}`);
                addLine(`Correo Electrónico: ${solicitudData.emailSolicita || 'N/A'}`);
                y += 10;
            }

            // Opciones para el nombre de la fundación
            if (solicitudData?.fundacion) {
                doc.setFontSize(16);
                addLine('Opciones para el nombre de la Fundación:');
                doc.setFontSize(12);
                addLine(`1. ${solicitudData.fundacion.nombreFundacion1 || 'N/A'}`);
                addLine(`2. ${solicitudData.fundacion.nombreFundacion2 || 'N/A'}`);
                addLine(`3. ${solicitudData.fundacion.nombreFundacion3 || 'N/A'}`);
                y += 10;
            }

            // Fundadores de la Fundación
            if (peopleData.length > 0 || (solicitudData.fundadores && solicitudData.fundadores.length > 0)) {
                doc.setFontSize(16);
                addLine('Fundadores de la Fundación:');
                doc.setFontSize(12);

                // Combinar fundadores propios y nominales
                const allFundadores = [
                    ...peopleData.filter(person => person.fundador),
                    ...(solicitudData.fundadores || []).filter(fundador => fundador.servicio === 'Fundador Nominal'),
                ];

                allFundadores.forEach((fundador, index) => {
                    if (fundador.servicio === 'Fundador Nominal') {
                        addLine(`Fundador #${index + 1}: Fundador Nominal`);
                    } else {
                        addLine(`Fundador #${index + 1}: ${renderPersonName(fundador)}`);
                    }
                });

                y += 10;
            }

            // Dignatarios
            if (peopleData.length > 0 || (solicitudData.dignatarios && solicitudData.dignatarios.length > 0)) {
                doc.setFontSize(16);
                addLine('Dignatarios de la Fundación:');
                doc.setFontSize(12);

                const allDignatarios = [
                    ...peopleData.filter(person => person.dignatario),
                    ...(solicitudData.dignatarios || []).filter(dignatario => dignatario.servicio === 'Dignatario Nominal'),
                ];

                allDignatarios.forEach((dignatario, index) => {
                    if (dignatario.servicio === 'Dignatario Nominal') {
                        addLine(`Dignatario Nominal #${index + 1}:`);
                        const posicionesNominales = dignatario.posiciones || [];
                        const posicionesConcatenadasNominal = posicionesNominales.join(', ');
                        if (posicionesNominales.length > 0) {
                            addLine(`  Posiciones: ${posicionesConcatenadasNominal}`);
                        }
                    } else {
                        addLine(`Dignatario #${index + 1}: ${renderPersonName(dignatario)}`);
                        const posiciones = dignatario.dignatario?.posiciones || [];
                        const posicionesConcatenadas = posiciones.join(', ');
                        if (posiciones.length > 0) {
                            addLine(`  Posiciones: ${posicionesConcatenadas}`);
                        }
                    }
                });

                y += 10;
            } else {
                addLine('No hay dignatarios registrados.');
            }

            // Miembros de la Fundación
            if (peopleData.length > 0 || (solicitudData.miembros && solicitudData.miembros.length > 0)) {
                doc.setFontSize(16);
                addLine('Miembros de la Fundación:');
                doc.setFontSize(12);

                // Combinar miembros propios y nominales
                const allMiembros = [
                    ...peopleData.filter(person => person.miembro),
                    ...(solicitudData.miembros || []).filter(miembro => miembro.servicio === 'Miembro Nominal'),
                ];

                allMiembros.forEach((miembro, index) => {
                    if (miembro.servicio === 'Miembro Nominal') {
                        addLine(`Miembro #${index + 1}: Miembro Nominal`);
                    } else {
                        addLine(`Miembro #${index + 1}: ${renderPersonName(miembro)}`);
                    }
                });

                y += 10;
            } else {
                doc.setFontSize(16);
                addLine('Miembros de la Fundación:');
                doc.setFontSize(12);
                addLine('No hay miembros registrados.');
                y += 10;
            }

            // Protectores
            if (peopleData.some(person => person.protector)) {
                doc.setFontSize(16);
                addLine('Protectores de la Fundación:');
                doc.setFontSize(12);

                peopleData
                    .filter(person => person.protector)
                    .forEach((protector, index) => {
                        addLine(`Protector #${index + 1}: ${renderPersonName(protector)}`);
                    });

                y += 10;
            }

            // Beneficiarios
            if (peopleData.some(person => person.beneficiariosFundacion)) {
                doc.setFontSize(16);
                addLine('Beneficiarios de la Fundación:');
                doc.setFontSize(12);

                peopleData
                    .filter(person => person.beneficiariosFundacion)
                    .forEach((beneficiario, index) => {
                        addLine(`Beneficiario #${index + 1}: ${renderPersonName(beneficiario)}`);
                    });

                y += 10;
            }

            // Patrimonio inicial
            if (solicitudData.patrimonio) {
                doc.setFontSize(16);
                addLine('Patrimonio Inicial:');
                doc.setFontSize(12);
                addLine(`Capital Social: ${solicitudData.patrimonio || 'N/A'}`);
                y += 10;
            }

            // Poder de la Fundación
            if (peopleData.length > 0 && peopleData.some(person => person.poder)) {
                doc.setFontSize(16);
                addLine('Poder de la Fundación:');
                doc.setFontSize(12);

                peopleData
                    .filter(person => person.poder)
                    .forEach((person, index) => {
                        addLine(`Poder #${index + 1}: ${renderPersonName(person)}`);
                    });

                y += 10;
            }

            // Objetivos
            if (solicitudData.objetivos?.objetivos) {
                doc.setFontSize(16);
                addLine('Objetivos de la Fundación:');
                doc.setFontSize(12);

                solicitudData.objetivos.objetivos.forEach((objetivo, index) => {
                    addLine(`Objetivo #${index + 1}: ${objetivo}`);
                });

                y += 10;
            }

            // Fuentes de Ingresos
            if (solicitudData.ingresos?.ingresos) {
                doc.setFontSize(16);
                addLine('Fuentes de Ingresos:');
                doc.setFontSize(12);

                solicitudData.ingresos.ingresos.forEach((ingreso, index) => {
                    addLine(`Fuente de Ingreso #${index + 1}: ${ingreso}`);
                });

                if (solicitudData.ingresos.otroIngreso) {
                    addLine(`Otro: ${solicitudData.ingresos.otroIngreso}`);
                }

                y += 10;
            }

            // Activos de la Fundación
            if (solicitudData.activos?.activos) {
                doc.setFontSize(16);
                addLine('Activos de la Fundación:');
                doc.setFontSize(12);

                solicitudData.activos.activos.forEach((activo, index) => {
                    addLine(`Activo #${index + 1}: ${activo.nombre}`);
                    addLine(`Ubicación: ${activo.ubicacion}`);
                });

                y += 10;
            }

            // Solicitud Adicional
            if (solicitudData.solicitudAdicional?.solicitudAdicional) {
                doc.setFontSize(16);
                addLine('Solicitud Adicional:');
                doc.setFontSize(12);
                addLine(solicitudData.solicitudAdicional.solicitudAdicional);
            }
        } else if (solicitudData.tipo === "propuesta-legal" || solicitudData.tipo === "consulta-legal" || solicitudData.tipo === "consulta-escrita"
            || solicitudData.tipo === "consulta-virtual" || solicitudData.tipo === "consulta-presencial") {
            if (solicitudData) {
                doc.setFontSize(16);
                addLine('Información del Solicitante');
                doc.setFontSize(12);
                addLine(`Nombre: ${solicitudData.nombreSolicita || 'N/A'}`);
                addLine(`Cédula o Pasaporte: ${solicitudData.cedulaPasaporte || 'N/A'}`);
                addLine(`Teléfono: ${solicitudData.telefonoSolicita || 'N/A'}`);
                addLine(`Celular / WhatsApp: ${solicitudData.celularSolicita || solicitudData.telefonoWhatsApp || 'N/A'}`);
                addLine(`Correo Electrónico: ${solicitudData.emailSolicita || 'N/A'}`);
                y += 10;

                if (solicitudData.tipo === "propuesta-legal") {
                    doc.setFontSize(16);
                    addLine('Detalles de la Propuesta');
                    doc.setFontSize(12);
                } else {
                    doc.setFontSize(16);
                    addLine('Detalles de la Consulta');
                    doc.setFontSize(12);
                }
                if (solicitudData.tipo === "propuesta-legal" || solicitudData.tipo === "consulta-legal") {
                    const emailEmpresa = solicitudData?.emailRespuesta?.trim() || solicitudData?.aditionalEmail?.trim();
                    if (emailEmpresa) {
                        addLine(`Correo Electrónico para recibir respuesta: ${emailEmpresa}`);
                    }
                    addLine(`Propuesta dirigida a la empresa: ${solicitudData.empresaSolicita || solicitudData.nombreEmpresa || 'N/A'}`);
                    y += 10;
                }
                addLine(`Área Legal: ${solicitudData.areaLegal || solicitudData.areasLegales || 'N/A'}`);
                y += 10;
                addLine(`Detalles de la Solicitud de Propuesta: ${solicitudData.detallesPropuesta || solicitudData.descripcionConsulta || 'N/A'}`);
                y += 10;
                addLine(`Preguntas Específicas: ${solicitudData.preguntasEspecificas || solicitudData.preguntasConsulta || 'N/A'}`);
                y += 10;

                if (solicitudData.tipo === "consulta-virtual" || solicitudData.tipo === "consulta-presencial") {
                    doc.setFontSize(16);
                    addLine('Disponibilidad');
                    doc.setFontSize(12);
                    addLine(`Fecha 1: ${solicitudData.disponibilidad[0].fecha || 'N/A'} disponible desde las: ${solicitudData.disponibilidad[0].horaInicio || 'N/A'} hasta las: ${solicitudData.disponibilidad[0].horaFin || 'N/A'}`);
                    addLine(`Fecha 2: ${solicitudData.disponibilidad[1].fecha || 'N/A'} disponible desde las: ${solicitudData.disponibilidad[1].horaInicio || 'N/A'} hasta las: ${solicitudData.disponibilidad[1].horaFin || 'N/A'}`);
                    addLine(`Fecha 3: ${solicitudData.disponibilidad[2].fecha || 'N/A'} disponible desde las: ${solicitudData.disponibilidad[2].horaInicio || 'N/A'} hasta las: ${solicitudData.disponibilidad[2].horaFin || 'N/A'}`);

                    if (solicitudData.tipo === "consulta-presencial") {
                        addLine(`Desea que la consulta sea en nuestras oficinas: ${solicitudData.consultaOficina || 'N/A'}`);
                        if (solicitudData.consultaOficina === "Si") {
                            addLine(`El cliente desea que lo busquemos en esta dirección: ${solicitudData.direccionBuscar || 'N/A'}`);
                        }
                        if (solicitudData.consultaOficina === "No") {
                            addLine(`El cliente desea que la reunión sea en esta dirección: ${solicitudData.direccionIr || 'N/A'}`);
                        }
                    }
                }

            }
        } else if (solicitudData.tipo === "menores-al-extranjero") {

        } else if (solicitudData.tipo === "tramite-general") {
            doc.setFontSize(16);
            addLine('Información del Solicitante');
            doc.setFontSize(12);
            addLine(`Nombre: ${solicitudData.nombreSolicita || 'N/A'}`);
            addLine(`Cédula o Pasaporte: ${solicitudData.cedulaPasaporte || 'N/A'}`);
            addLine(`Teléfono: ${solicitudData.telefonoSolicita || 'N/A'}`);
            addLine(`Celular / WhatsApp: ${solicitudData.celularSolicita || solicitudData.telefonoWhatsApp || 'N/A'}`);
            addLine(`Correo Electrónico: ${solicitudData.emailSolicita || 'N/A'}`);
            y += 10;

            addLine(`Detalle el tipo de servicio que requiere: ${solicitudData?.solicitudBase?.detalle || solicitudData?.tipoServicio || 'N/A'}`);
            addLine(`Nivel de urgencia: ${solicitudData?.solicitudBase?.urgencia || solicitudData?.nivelUrgencia || 'N/A'}`);
            const nivelUregncia = solicitudData?.nivelUrgencia || solicitudData?.solicitudBase?.urgencia;
            if (nivelUregncia && nivelUregncia === "Atención Extraordinaria") {
                addLine(`Descripción de la situación: ${solicitudData?.solicitudBase?.detalle_urgencia || solicitudData?.descripcionExtra || 'N/A'}`);
            }
            y += 10;
            addLine(`Descripción del requerimiento o situación: ${solicitudData?.solicitudBase?.descripcion || solicitudData?.descripcion || 'N/A'}`);
        } else if (solicitudData.tipo === "solicitud-cliente-recurrente") {
            doc.setFontSize(16);
            addLine('Información del Solicitante');
            doc.setFontSize(12);
            addLine(`Nombre: ${solicitudData.nombreSolicita || 'N/A'}`);
            addLine(`Cédula o Pasaporte: ${solicitudData.cedulaPasaporte || 'N/A'}`);
            addLine(`Teléfono: ${solicitudData.telefonoSolicita || 'N/A'}`);
            addLine(`Celular / WhatsApp: ${solicitudData.celularSolicita || solicitudData.telefonoWhatsApp || 'N/A'}`);
            addLine(`Correo Electrónico: ${solicitudData.emailSolicita || 'N/A'}`);
            addLine(`Comentarios: ${solicitudData?.solicitudBase?.comentarios || solicitudData?.comentarios || 'N/A'}`);
            y += 10;
        } else if (solicitudData.tipo === "pension" || solicitudData.tipo === "pension-alimenticia") {
            if (solicitudData) {
                doc.setFontSize(16);
                addLine('Información del Solicitante');
                doc.setFontSize(12);
                addLine(`Nombre: ${solicitudData.nombreSolicita || 'N/A'}`);
                addLine(`Teléfono: ${solicitudData.telefonoSolicita || 'N/A'}`);
                addLine(`Teléfono Alternativo: ${solicitudData.telefonoSolicita2 || 'N/A'}`);
                addLine(`Cédula o Pasaporte: ${solicitudData.cedulaPasaporte || 'N/A'}`);
                addLine(`Correo Electrónico: ${solicitudData.emailSolicita || 'N/A'}`);
                y += 10;
            }

            doc.setFontSize(16);
            addLine('Información de la Solicitud');
            doc.setFontSize(12);
            addLine(`Tipo de Pensión: ${solicitudData.pensionType || 'N/A'}`);

            if (solicitudData.pensionType === 'Primera vez') {
                y += 5; // Espaciado entre secciones
                doc.setFontSize(14);
                addLine('Está solicitando pensión alimentaria por primera vez.');
                doc.setFontSize(12);
                y += 5;

                addLine(`¿Cuánto desea obtener de Pensión Alimenticia?: ${solicitudData.pensionAmount || 'N/A'}`);
                addLine(`¿Recibe usted algún aporte por parte del demandado?: ${solicitudData.receiveSupport || 'N/A'}`);

                if (solicitudData.receiveSupport === 'Sí') {
                    addLine(`¿Cuánto le están aportando de pensión alimenticia actualmente?: ${solicitudData.currentSupportAmount || 'N/A'}`);
                }

                addLine(`¿Qué tipo de pensión requiere solicitar?: ${solicitudData.pensionCategory || 'N/A'}`);
                y += 10;
            } else if (solicitudData.pensionType === 'Aumento') {
                y += 5; // Espaciado antes de la sección
                doc.setFontSize(14);
                addLine('Quiere solicitar un Aumento.');
                doc.setFontSize(12);
                y += 5;

                addLine(`¿Cuánto le están aportando de pensión alimenticia actualmente?: ${solicitudData.currentAmount || 'N/A'}`);
                addLine(`¿Cuánto desea solicitar de aumento?: ${solicitudData.increaseAmount || 'N/A'}`);
                addLine(`El monto total que desea recibir es el siguiente: ${solicitudData.totalAmount || 'N/A'}`);
                addLine(`¿Está usted de acuerdo con el monto total que recibirá?: ${solicitudData.agreesWithAmount || 'N/A'}`);

                if (solicitudData.agreesWithAmount === 'No') {
                    addLine(`Por favor explique por qué no está de acuerdo con el monto total: ${solicitudData.disagreementReason || 'N/A'}`);
                }

                addLine(`¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?: ${solicitudData.knowsCaseLocation || 'N/A'}`);

                if (solicitudData.knowsCaseLocation === 'Si') {
                    addLine(`Indique Juzgado: ${solicitudData.court || 'N/A'}`);
                    addLine(`Indique número de expediente: ${solicitudData.caseNumber || 'N/A'}`);
                    addLine(`Indique la fecha de la última sentencia: ${solicitudData.sentenceDate || 'N/A'}`);
                }

                if (solicitudData.knowsCaseLocation === 'No') {
                    addLine(`¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?: ${solicitudData.wantsInvestigation || 'N/A'}`);

                    if (solicitudData.wantsInvestigation === 'Si') {
                        addLine(`Especifique la provincia: ${solicitudData.province || 'N/A'}`);
                    }
                }

                y += 10;
            } else if (solicitudData.pensionType === 'Rebaja o Suspensión') {
                y += 5; // Espaciado antes de la sección
                doc.setFontSize(14);
                addLine('Quiere solicitar Rebaja o Suspensión');
                doc.setFontSize(12);
                y += 5;

                addLine(`¿Desea Disminuir o Suspender la pensión?: ${solicitudData.pensionSubType || 'N/A'}`);

                if (solicitudData.pensionSubType === 'Disminuir') {
                    addLine(`¿Cuánto le está aportando de pensión alimenticia actualmente?: ${solicitudData.currentAmount || 'N/A'}`);
                    addLine(`¿Cuánto desea reducir de la pensión asignada?: ${solicitudData.reduceAmount || 'N/A'}`);
                    addLine(`¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?: ${solicitudData.knowsCaseLocation || 'N/A'}`);

                    if (solicitudData.knowsCaseLocation === 'No') {
                        addLine(`¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?: ${solicitudData.wantsInvestigation || 'N/A'}`);

                        if (solicitudData.wantsInvestigation === 'Si') {
                            addLine(`Especifique la provincia: ${solicitudData.province || 'N/A'}`);
                        }
                    }

                    if (solicitudData.knowsCaseLocation === 'Si') {
                        addLine(`Indique Juzgado: ${solicitudData.court || 'N/A'}`);
                        addLine(`Indique número de expediente: ${solicitudData.caseNumber || 'N/A'}`);
                        addLine(`Indique la fecha de la última sentencia: ${solicitudData.sentenceDate || 'N/A'}`);
                    }
                }

                y += 10; // Espaciado antes de la siguiente sección
            } else if (solicitudData.pensionType === 'Desacato') {
                y += 5; // Espaciado antes de la sección
                doc.setFontSize(14);
                addLine('Quiere solicitar un Desacato.');
                doc.setFontSize(12);
                y += 5;

                addLine(`Indique el día de pago asignado por el juez: ${solicitudData.paymentDay || 'N/A'}`);
                addLine(`Indique la fecha en la que recibió la última mensualidad: ${solicitudData.lastPaymentDate || 'N/A'}`);
                addLine(`¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?: ${solicitudData.knowsCaseLocation || 'N/A'}`);

                if (solicitudData.knowsCaseLocation === 'No') {
                    addLine(`¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?: ${solicitudData.wantsInvestigation || 'N/A'}`);

                    if (solicitudData.wantsInvestigation === 'Si') {
                        addLine(`Especifique la provincia: ${solicitudData.province || 'N/A'}`);
                    }
                }

                if (solicitudData.knowsCaseLocation === 'Si') {
                    addLine(`Indique Juzgado: ${solicitudData.court || 'N/A'}`);
                    addLine(`Indique número de expediente: ${solicitudData.caseNumber || 'N/A'}`);
                    addLine(`Indique la fecha de la última sentencia: ${solicitudData.sentenceDate || 'N/A'}`);
                }

                y += 10; // Espaciado antes de la siguiente sección
            }

            if (solicitudData.demandante) {
                y += 5; // Espaciado antes de la sección
                doc.setFontSize(16);
                addLine('Información del Demandante');
                doc.setFontSize(12);
                y += 5;

                addLine(`Nombre Completo: ${solicitudData.demandante.nombreCompleto || 'N/A'}`);
                addLine(`Cédula: ${solicitudData.demandante.cedula || 'N/A'}`);
                addLine(`Correo Electrónico: ${solicitudData.demandante.email || 'N/A'}`);
                addLine(`Teléfono: ${solicitudData.demandante.telefonoSolicita || 'N/A'}`);
                addLine(`Dirección: ${solicitudData.demandante.direccion || 'N/A'}`);
                addLine(`Detalle Dirección: ${solicitudData.demandante.detalleDireccion || 'N/A'}`);
                addLine(`Nacionalidad: ${solicitudData.demandante.nacionalidad?.label || 'N/A'}`);
                addLine(`País de Residencia: ${solicitudData.demandante.paisDondeVive?.label || 'N/A'}`);
                addLine(`Provincia: ${solicitudData.demandante.provincia?.label || 'N/A'}`);
                addLine(`Corregimiento: ${solicitudData.demandante.corregimiento?.label || 'N/A'}`);
                addLine(`Estado Civil: ${solicitudData.demandante.estadoCivil?.label || 'N/A'}`);
                addLine(`Relación con el Demandado: ${solicitudData.demandante.relacionDemandado?.label || 'N/A'}`);

                addLine(`¿Mantiene usted ingresos por trabajo o como independiente?: ${solicitudData.demandante.mantieneIngresos?.label || 'N/A'}`);

                if (solicitudData.demandante.mantieneIngresos?.label === 'Sí') {
                    addLine(`  Lugar de Trabajo: ${solicitudData.demandante.lugarTrabajo || 'N/A'}`);
                    addLine(`  Ocupación: ${solicitudData.demandante.ocupacion || 'N/A'}`);
                    addLine(`  Ingresos Mensuales: ${solicitudData.demandante.ingresosMensuales || 'N/A'}`);
                    addLine(`  Vive en: ${solicitudData.demandante.viveEn?.label || 'N/A'}`);
                }

                addLine(`Estudia: ${solicitudData.demandante.estudia?.label || 'N/A'}`);

                if (solicitudData.demandante.estudia?.label === 'Sí') {
                    addLine(`  Lugar de Estudio: ${solicitudData.demandante.lugarEstudio || 'N/A'}`);
                    addLine(`  Año que Cursa: ${solicitudData.demandante.anoCursando || 'N/A'}`);
                    addLine(`  Tipo de Estudio: ${solicitudData.demandante.tipoEstudio?.label || 'N/A'}`);
                    addLine(`  Tiempo Completo: ${solicitudData.demandante.tiempoCompleto?.label || 'N/A'}`);
                    addLine(`  Parentesco con el Pensionado: ${solicitudData.demandante.parentescoPension?.label || 'N/A'}`);
                }

                addLine(`Representa a un Menor: ${solicitudData.demandante.representaMenor?.label || 'N/A'}`);

                y += 10; // Espaciado antes de la siguiente sección
            }

            if (solicitudData.demandado) {
                y += 5; // Espaciado antes de la sección
                doc.setFontSize(16);
                addLine('Información del Demandado');
                doc.setFontSize(12);
                y += 5;

                addLine(`Nombre Completo: ${solicitudData.demandado.nombreCompleto || 'N/A'}`);
                addLine(`Cédula: ${solicitudData.demandado.cedula || 'N/A'}`);
                addLine(`Teléfono: ${solicitudData.demandado.telefono || 'N/A'}`);
                addLine(`Nacionalidad: ${solicitudData.demandado.nacionalidad?.label || 'N/A'}`);
                addLine(`País de Residencia: ${solicitudData.demandado.paisDondeVive?.label || 'N/A'}`);
                addLine(`Provincia: ${solicitudData.demandado.provincia?.label || solicitudData.demandado?.provincia2 || 'N/A'}`);
                addLine(`Corregimiento: ${solicitudData.demandado.corregimiento?.label || solicitudData.demandado?.corregimiento2 || 'N/A'}`);
                addLine(`Estado Civil: ${solicitudData.demandado.estadoCivil?.label || 'N/A'}`);
                addLine(`¿Está Trabajando?: ${solicitudData.demandado.trabajando.label || 'No'}`);

                if (solicitudData.demandado.trabajando.value === 'si') {
                    addLine(`  Ocupación: ${solicitudData.demandado.ocupacion || 'N/A'}`);
                    addLine(`  Ingresos por Trabajo: ${solicitudData.demandado.ingresosTrabajo || 'N/A'}`);
                    addLine(`  Dirección de Trabajo: ${solicitudData.demandado.direccionTrabajo || 'N/A'}`);
                    addLine(`  Detalle Dirección de Trabajo: ${solicitudData.demandado.detalleDireccionTrabajo || 'N/A'}`);
                }

                y += 10; // Espaciado antes de la siguiente sección
            }

            if (solicitudData.gastosPensionado) {
                y += 5; // Espaciado antes de la sección
                doc.setFontSize(16);
                addLine('Información sobre Gastos del Pensionado');
                doc.setFontSize(12);
                y += 5;

                addLine(`Agua: ${solicitudData.gastosPensionado.agua || 'N/A'}`);
                addLine(`Luz: ${solicitudData.gastosPensionado.luz || 'N/A'}`);
                addLine(`Teléfono: ${solicitudData.gastosPensionado.telefono || 'N/A'}`);
                addLine(`Supermercado: ${solicitudData.gastosPensionado.supermercado || 'N/A'}`);
                addLine(`Vestuario: ${solicitudData.gastosPensionado.vestuario || 'N/A'}`);
                addLine(`Recreación: ${solicitudData.gastosPensionado.recreacion || 'N/A'}`);
                addLine(`Habitación: ${solicitudData.gastosPensionado.habitacion || 'N/A'}`);
                addLine(`Transporte: ${solicitudData.gastosPensionado.transporte || 'N/A'}`);
                addLine(`Meriendas: ${solicitudData.gastosPensionado.meriendas || 'N/A'}`);
                addLine(`Medicamentos: ${solicitudData.gastosPensionado.medicamentos || 'N/A'}`);
                addLine(`Atención Médica: ${solicitudData.gastosPensionado.atencionMedica || 'N/A'}`);
                addLine(`Cuota de Padres: ${solicitudData.gastosPensionado.cuotaPadres || 'N/A'}`);
                addLine(`Matrícula: ${solicitudData.gastosPensionado.matricula || 'N/A'}`);
                addLine(`Mensualidad Escolar: ${solicitudData.gastosPensionado.mensualidadEscolar || 'N/A'}`);
                addLine(`Útiles Escolares: ${solicitudData.gastosPensionado.utiles || 'N/A'}`);
                addLine(`Uniformes: ${solicitudData.gastosPensionado.uniformes || 'N/A'}`);
                addLine(`Textos o Libros: ${solicitudData.gastosPensionado.textosLibros || 'N/A'}`);
                addLine(`Otros Gastos: ${solicitudData.gastosPensionado.otros || 'N/A'}`);
                addLine(`Gastos Totales del Pensionado: ${solicitudData.gastosPensionado.sumaTotal || 'N/A'}`);

                y += 10; // Espaciado antes de la siguiente sección
            }

            if (solicitudData.firmaYEntrega) {
                y += 5; // Espaciado antes de la sección
                doc.setFontSize(16);
                addLine('Información sobre la Firma y Entrega');
                doc.setFontSize(12);
                y += 5;

                addLine('Por favor indícanos cómo deseas firmar y entregarnos los documentos para el proceso:');

                if (solicitudData.firmaYEntrega.deliveryOption === "home") {
                    y += 5;
                    addLine('Entrega y firma a domicilio.');
                    addLine(`Dirección: ${solicitudData.firmaYEntrega.direccion || 'N/A'}`);
                    addLine(`Día: ${solicitudData.firmaYEntrega.dia || 'N/A'}`);
                    addLine(`Número de teléfono: ${solicitudData.firmaYEntrega.telefonoSolicita || 'N/A'}`);
                    addLine(`Hora (Formato 24 horas): ${solicitudData.firmaYEntrega.hora || 'N/A'}`);
                }

                if (solicitudData.firmaYEntrega.deliveryOption === "office") {
                    y += 5;
                    addLine('Puedo ir a sus oficinas a firmar y entregar todo.');
                }

                y += 10; // Espaciado antes de la siguiente sección
            }

            if (solicitudData.solicitudAdicional) {
                y += 5; // Espaciado antes de la sección
                doc.setFontSize(16);
                addLine('Solicitud Adicional');
                doc.setFontSize(12);
                y += 5;

                addLine(`Descripción de la solicitud: ${solicitudData.solicitudAdicional.descripcion || 'N/A'}`);

                y += 10; // Espaciado antes de la siguiente sección
            }
        }

        if ((solicitudData.tipo !== "propuesta-legal" && solicitudData.tipo !== "consulta-legal" &&
            solicitudData.tipo !== "tramite-general" && solicitudData.tipo !== "solicitud-cliente-recurrente")
            && (solicitudData?.canasta?.items?.length > 0)) {
            doc.setFontSize(16);
            addLine('Costos:');
            doc.setFontSize(12);

            // **Recorrer los ítems y agregarlos como texto**
            solicitudData.canasta.items.forEach((item, index) => {
                addLine(`${index + 1}. ${item.item}: $${(item.precio || 0).toFixed(2)}`);
            });

            // **Subtotal y Total**
            addLine(`Subtotal: $${(solicitudData.canasta.subtotal || 0).toFixed(2)}`);
            addLine(`Total: $${(solicitudData.canasta.total || 0).toFixed(2)}`);

            y += 10; // Espacio después de los costos
        } else {
            addLine('No hay costos registrados.');
        }

        // Guardar el PDF
        doc.save('Resumen_Solicitud.pdf');
    };

    const generatePDFPersonas = () => {
        const doc = new jsPDF();
        let y = 20; // Posición inicial en Y
        const pageHeight = doc.internal.pageSize.height; // Altura de la página

        // Función auxiliar para manejar texto con saltos de página automáticos
        const addLine = (text: string) => {
            if (y + 10 > pageHeight) {
                doc.addPage();
                y = 20; // Reinicia la posición Y en la nueva página
            }
            doc.text(text, 10, y);
            y += 10;
        };

        // Título del documento
        doc.setFontSize(20);
        addLine('Información de las Personas');

        // Validar si existen datos en peopleData
        if (Array.isArray(peopleData) && peopleData.length > 0) {
            // Recorrer cada persona en el array
            peopleData.forEach((person, index) => {
                let fechaNacimiento = person.fechaNacimiento;

                // Verificar si userData.fechaNacimiento tiene el formato esperado de Firebase
                if (person.fechaNacimiento?._seconds) {
                    // Convertir el timestamp de Firebase a una fecha válida
                    const timestamp = person.fechaNacimiento._seconds * 1000; // Convertir segundos a milisegundos
                    fechaNacimiento = new Date(timestamp).toISOString().split('T')[0]; // Convertir a YYYY-MM-DD
                }
                doc.setFontSize(16);
                addLine(`Información del Representante Legal ${index + 1}:`);
                doc.setFontSize(12);
                addLine(`Tipo de Persona: ${person.tipoPersona || 'N/A'}`);
                if (person.tipoPersona === "Persona Jurídica") {
                    addLine(`Nombre de la persona jurídica / sociedad: ${person.personaJuridica.nombreJuridico || 'N/A'}`);
                    addLine(`País de la persona jurídica: ${person.personaJuridica.paisJuridico || 'N/A'}`);
                    addLine(`Número de registro: ${person.personaJuridica.registroJuridico || 'N/A'}`);
                    y += 10;
                }

                addLine(`Nombre: ${person.nombreApellido || 'N/A'}`);
                addLine(`Cédula o Pasaporte: ${person.cedulaPasaporte || 'N/A'}`);
                addLine(`Nacionalidad: ${person.nacionalidad || 'N/A'}`);
                addLine(`Sexo: ${person.sexo || 'N/A'}`);
                addLine(`País de Nacimiento: ${person.paisNacimiento || 'N/A'}`);
                addLine(`Fecha de Nacimiento: ${fechaNacimiento || 'N/A'}`);
                addLine(`Dirección: ${person.direccion || 'N/A'}`);
                addLine(`País de Residencia: ${person.paisResidencia || 'N/A'}`);
                addLine(`Profesión: ${person.profesion || 'N/A'}`);
                addLine(`Teléfono: ${person.telefono || 'N/A'}`);
                addLine(`Email: ${person.email || 'N/A'}`);
                y += 10;

                if (person.esPoliticamenteExpuesta === "Si") {
                    doc.setFontSize(16);
                    addLine(`Es una persona políticamente expuesta:`);
                    doc.setFontSize(12);
                    addLine(`Indicar qué cargo ocupa u ocupó: ${person.personaExpuestaCargo || 'N/A'}`);
                    addLine(`En qué fecha: ${person.personaExpuestaFecha || 'N/A'}`);
                    y += 10;
                }

                if (person.referenciasBancarias.bancoNombre !== "") {
                    doc.setFontSize(16);
                    addLine(`Referencias Bancarias ${index + 1}:`);
                    doc.setFontSize(12);
                    addLine(`Nombre del Banco: ${person.referenciasBancarias.bancoNombre || 'N/A'}`);
                    addLine(`Teléfono: ${person.referenciasBancarias.bancoTelefono || 'N/A'}`);
                    addLine(`Email: ${person.referenciasBancarias.bancoEmail || 'N/A'}`);
                    y += 10;
                }

                if (person.referenciasComerciales.comercialNombre !== "") {
                    doc.setFontSize(16);
                    addLine(`Referencias Comerciales ${index + 1}:`);
                    doc.setFontSize(12);
                    addLine(`Nombre del Comercial: ${person.referenciasComerciales.comercialNombre || 'N/A'}`);
                    addLine(`Teléfono: ${person.referenciasComerciales.comercialTelefono || 'N/A'}`);
                    addLine(`Email: ${person.referenciasComerciales.comercialEmail || 'N/A'}`);
                    y += 10;
                }

                if (person.beneficiarios && person.beneficiarios.length > 0) {
                    person.beneficiarios.forEach((beneficiario, index) => {
                        let fechaNacimiento = beneficiario.fechaNacimiento;

                        // Verificar si userData.fechaNacimiento tiene el formato esperado de Firebase
                        if (beneficiario.fechaNacimiento?._seconds) {
                            // Convertir el timestamp de Firebase a una fecha válida
                            const timestamp = beneficiario.fechaNacimiento._seconds * 1000; // Convertir segundos a milisegundos
                            fechaNacimiento = new Date(timestamp).toISOString().split('T')[0]; // Convertir a YYYY-MM-DD
                        }

                        doc.setFontSize(16);
                        addLine(`Información del Beneficiario Final ${index + 1}:`);
                        doc.setFontSize(12);
                        addLine(`Nombre: ${beneficiario.nombreApellido || 'N/A'}`);
                        addLine(`Cédula o Pasaporte: ${beneficiario.cedulaPasaporte || 'N/A'}`);
                        addLine(`Nacionalidad: ${beneficiario.nacionalidad || 'N/A'}`);
                        addLine(`Sexo: ${beneficiario.sexo || 'N/A'}`);
                        addLine(`País de Nacimiento: ${beneficiario.paisNacimiento || 'N/A'}`);
                        addLine(`Fecha de Nacimiento: ${fechaNacimiento || 'N/A'}`);
                        addLine(`Dirección: ${beneficiario.direccion || 'N/A'}`);
                        addLine(`País de Residencia: ${beneficiario.paisResidencia || 'N/A'}`);
                        addLine(`Profesión: ${beneficiario.profesion || 'N/A'}`);
                        addLine(`Teléfono: ${beneficiario.telefono || 'N/A'}`);
                        addLine(`Email: ${beneficiario.email || 'N/A'}`);
                        y += 10;

                        if (beneficiario.esPoliticamenteExpuesta === "Si") {
                            doc.setFontSize(16);
                            addLine(`Es una persona políticamente expuesta:`);
                            doc.setFontSize(12);
                            addLine(`Indicar qué cargo ocupa u ocupó: ${beneficiario.personaExpuestaCargo || 'N/A'}`);
                            addLine(`En qué fecha: ${beneficiario.personaExpuestaFecha || 'N/A'}`);
                            y += 10;
                        }

                        addLine(''); // Espacio entre registros
                    });
                }

                addLine(''); // Espacio entre registros
            });
        } else {
            addLine('No se encontraron personas asociadas.');
        }

        // Guardar el PDF
        doc.save('Información_Personas.pdf');
    };

    const handleClick = () => {
        const url = getEditUrl();
        if (url && url !== "#") {
            router.push(url);
        }
    };

    const getEditUrl = () => {
        if (solicitudData) {
            switch (solicitudData.tipo) {
                case "new-fundacion":
                    return `/request/fundacion?id=${id}`;
                case "new-sociedad-empresa":
                    return `/request/sociedad-empresa?id=${id}`;
                case "menores-al-extranjero":
                    return `/request/menores-extranjero?id=${id}`;
                case "pension":
                    return `/request/pension-alimenticia?id=${id}`;
                case "tramite-general":
                    return `/dashboard/tramite-general?id=${id}`;
                case "cliente-recurrente":
                case "solicitud-cliente-recurrente":
                    return `/request/corporativo?id=${id}`;
                default:
                    return `/request/consulta-propuesta?id=${id}`;
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 p-8 w-full items-start">
            <div className="flex flex-col gap-8 md:w-1/2">
                {/* Sección de Actualizar */}
                {(formData.rol !== "Cliente" && formData.rol !== "Cliente Recurrente") && (
                    <>
                        <div className="bg-gray-800 col-span-1 p-8 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-4">Actualizar:</h3>
                            <div className="mb-4">
                                <label className="block text-gray-300">Estatus</label>
                                <select
                                    id="statusSelect"
                                    className="w-full p-2 rounded bg-gray-900 text-white"
                                    value={status}
                                    onChange={(e) => setStatus(Number(e.target.value))}
                                >
                                    <option value="">Nueva Acción</option>
                                    <option value="0">Rechazada</option>
                                    <option value="1">Borrador</option>
                                    <option value="10">Enviada</option>
                                    <option value="12">Aprobada</option>
                                    <option value="19">Confirmando pago</option>
                                    <option value="20">Pagada</option>
                                    <option value="30">En proceso</option>
                                    <option value="70">Finalizada</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-300">Observación</label>
                                <textarea
                                    id="observationTextarea"
                                    className="w-full p-2 rounded bg-gray-900 text-white"
                                    value={observation}
                                    onChange={(e) => setObservation(e.target.value)}
                                    placeholder="Escriba su observación aquí"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-300">Adjuntar archivo</label>
                                <input
                                    type="file"
                                    name='adjuntoDocumentoBitacora'
                                    className="w-full p-2 rounded bg-gray-900 text-white"
                                    onChange={handleFileChange}
                                />
                                <p className="text-gray-400 mt-2">{archivoFile ? archivoFile.name : "Sin archivos seleccionados"}</p>
                            </div>
                            <div className="flex space-x-4 mt-2">
                                <button className="bg-gray-500 text-white px-4 py-2 rounded mt-2" onClick={handleBack}>Volver</button>
                                <button className="bg-profile text-white px-4 py-2 rounded mt-2" onClick={handleUpdate}>Actualizar</button>
                            </div>
                        </div>
                    </>
                )}


                {/* Sección de Asignar abogado */}
                {(formData.rol !== "Cliente" && formData.rol !== "Cliente Recurrente") && (
                    <>
                        <div className="bg-gray-800 col-span-1 p-8 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-4">Asignar abogado:</h3>
                            <select
                                className="w-full p-2 rounded bg-gray-900 text-white"
                                value={selectedLawyer ? selectedLawyer.id : ""}
                                onChange={(e) => {
                                    const lawyer = lawyers.find((l) => l.id === e.target.value);
                                    setSelectedLawyer(lawyer || null);
                                }}
                            >
                                <option value="">Seleccionar abogado</option>
                                {lawyers.map((lawyer) => (
                                    <option key={lawyer.id} value={lawyer.id}>
                                        {lawyer.nombre}
                                    </option>
                                ))}
                            </select>
                            <div className="flex space-x-4 mt-2">
                                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleBack}>Volver</button>
                                <button className="bg-profile text-white px-4 py-2 rounded" onClick={handleAssignLawyer}>Asignar</button>
                            </div>
                        </div>
                    </>
                )}

                {/*Información de la bitacora */}
                <div className="bg-gray-800 col-span-1 p-8 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Información de la bitacora</h3>
                    <table className="w-full text-gray-300">
                        <thead>
                            <tr className="border-b border-gray-600">
                                <th className="text-left">Tarea</th>
                                <th className="text-right">Fechas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudData?.bitacora?.map((entry, index) => {
                                let finalizacion = "Pendiente";

                                if (index < solicitudData?.bitacora.length - 1 && solicitudData.bitacora[index + 1].date) {
                                    finalizacion = mostrarDate(solicitudData.bitacora[index + 1].date);
                                }

                                return (
                                    <tr key={index} className="border-b border-gray-600">
                                        <td className="p-4">
                                            {index + 1} - {entry.accion || entry.observation}

                                            {entry.adjuntoDocumentoBitacora && (
                                                <div className="mt-2">
                                                    <a
                                                        href={entry.adjuntoDocumentoBitacora}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-profile text-white font-semibold py-2 px-4 rounded-lg"
                                                    >
                                                        Ver Documento Adjunto
                                                    </a>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <p>Inicio: {entry.date ? mostrarDate(entry.date) : "Fecha inválida"}</p>
                                            <p>Finalización: {finalizacion}</p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Sección de Información del Solicitante */}
            <div className="flex flex-col gap-8 md:w-1/2">
                <div className="bg-gray-800 col-span-1 p-8 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Información del solicitante</h3>
                    <p className="text-gray-300">
                        <strong>Nombre del solicitante:</strong> {solicitudData ? solicitudData.nombreSolicita : "Cargando..."}
                    </p>
                    <p className="text-gray-300">
                        <strong>Teléfono:</strong> {solicitudData ? solicitudData.telefonoSolicita : "Cargando..."}
                    </p>
                    <p className="text-gray-300">
                        <strong>Correo electrónico:</strong> {solicitudData ? solicitudData.emailSolicita : "Cargando..."}
                    </p>
                    <hr className='mt-2 mb-2' />
                    <p
                        className="text-purple-400 cursor-pointer mt-2 hover:underline"
                        onClick={handleClick}
                    >
                        Ver detalles de solicitud
                    </p>

                    <hr className='mt-2 mb-2' />
                    <p className="text-gray-300">
                        <strong>Estatus Actual:</strong> {solicitudData ? statusName : "Cargando..."}
                    </p>

                    <h3 className="text-lg font-bold text-white mt-6">Costos</h3>
                    <table className="w-full text-gray-300 mt-2">
                        <thead>
                            <tr className="border-b border-gray-600">
                                <th className="text-left">#</th>
                                <th className="text-left">Item</th>
                                <th className="text-right">Precio</th>
                            </tr>
                        </thead>
                        {/* <tbody>
                        <tr className="border-b border-gray-600">
                            <td>1</td>
                            <td>{solicitudData ? solicitudData.canasta.items[0].item : "Cargando..."}</td>
                            <td className="text-right">${solicitudData ? solicitudData.canasta.items[0].precio : "Cargando..."}</td>
                        </tr>

                    </tbody> */}
                        <tfoot>
                            {get(solicitudData, 'canasta.items', []).map((item, index) => (
                                <tr key={index} className="border-b border-gray-600">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{item.item}</td>
                                    <td className="text-right p-2">${item.precio}</td>
                                </tr>
                            ))}
                            <tr className="border-b border-gray-600">
                                <td colSpan={2} className="text-right">Subtotal</td>
                                <td className="text-right">
                                    ${solicitudData
                                        ? solicitudData?.canasta?.subtotal.toFixed(2) ?? "Cargando..."
                                        : solicitudData?.canasta?.items[0]?.subtotal.toFixed(2) ?? "Cargando..."}
                                </td>
                            </tr>
                            <tr className="border-b border-gray-600">
                                <td colSpan={2} className="text-right">Total</td>
                                <td className="text-right">
                                    ${solicitudData
                                        ? solicitudData?.canasta?.total.toFixed(2) ?? "Cargando..."
                                        : solicitudData?.canasta?.items[0]?.total.toFixed(2) ?? "Cargando..."}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="flex space-x-4 mt-2">
                        <button
                            onClick={generatePDF}
                            className="bg-profile text-white px-4 py-2 rounded mt-8"
                        >
                            Descargar Resumen PDF
                        </button>
                        {(formData.rol !== "Cliente" && formData.rol !== "Cliente Recurrente" && solicitudData && solicitudData?.tipo === "new-sociedad-empresa") && (
                            <>
                                <button
                                    className="bg-profile text-white px-4 py-2 rounded mt-8"
                                    onClick={handleDownload}
                                >
                                    Descargar Pacto Social
                                </button>
                            </>
                        )}
                    </div>

                    {(formData.rol !== "Cliente" && formData.rol !== "Cliente Recurrente" && solicitudData &&
                        solicitudData?.tipo === "new-sociedad-empresa" && solicitudData?.tipo === "new-fundacion") && (
                            <>
                                <div className="flex space-x-4 ">
                                    <button
                                        onClick={generatePDFPersonas}
                                        className="bg-profile text-white px-4 py-2 rounded mt-8"
                                    >
                                        Descargar información de las personas
                                    </button>

                                </div>
                            </>
                        )}
                </div>

                {(formData.rol !== "Cliente" && formData.rol !== "Cliente Recurrente") && (
                    <>
                        <div className="bg-gray-800 col-span-1 p-8 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-4">Comprobante de pago</h3>

                            {formData.comprobantePagoURL ? (
                                <p className="text-sm text-blue-500">
                                    <a href={formData.comprobantePagoURL} target="_blank" rel="noopener noreferrer">
                                        Ver documento actual
                                    </a>
                                </p>
                            ) : (
                                <p className="text-sm text-red-500">No hay comprobante de pago cargado.</p>
                            )}
                        </div>
                    </>
                )}
            </div>

        </div>
    );
};

export default Request;
