import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { backendBaseUrl } from '@utils/env';
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

const Request: React.FC = () => {
    const [selectedLawyer, setSelectedLawyer] = useState<any>(null);
    const [status, setStatus] = useState(-1);
    const [observation, setObservation] = useState('');
    const router = useRouter();
    const { id } = router.query;
    const [solicitudData, setSolicitudData] = useState<any>(null);
    const [statusName, setStatusName] = useState("");
    const [lawyers, setLawyers] = useState<any[]>([]);

    const getStatusName = (status: number) => {
        switch (status) {
            case 0: return "Rechazada";
            case 1: return "Borrador";
            case 10: return "Enviada";
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
            const response = await axios.post(`${backendBaseUrl}/chris/create-fundacion-file/${solicitudId}`);
            console.log("URL ", response)
            console.log("URL ", response.data)
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

    return (
        <div className="flex flex-col md:flex-row gap-8 p-8 w-full items-start">
            <div className="flex flex-col gap-8 md:w-1/2">
                {/* Sección de Actualizar */}
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

                {/* Sección de Asignar abogado */}
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
            <div className="bg-gray-800 p-8 rounded-lg md:w-1/2">
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
                <p className="text-purple-400 cursor-pointer mt-2">Ver detalles de solicitud</p>
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
                    <tbody>
                        <tr className="border-b border-gray-600">
                            <td>1</td>
                            <td>{solicitudData ? solicitudData.canasta.items[0].item : "Cargando..."}</td>
                            <td className="text-right">${solicitudData ? solicitudData.canasta.items[0].precio : "Cargando..."}</td>
                        </tr>

                    </tbody>
                    <tfoot>
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
                    <button className="bg-profile text-white px-4 py-2 rounded mt-8">Descargar Resumen PDF</button>

                    <button
                        className="bg-profile text-white px-4 py-2 rounded mt-8"
                        onClick={handleDownload}
                    >
                        Descargar Pacto Social
                    </button>
                </div>


            </div>
        </div>
    );
};

export default Request;
