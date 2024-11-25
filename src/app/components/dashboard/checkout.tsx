import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Swal from 'sweetalert2';
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

const Checkout: React.FC = () => {
   
    

    const router = useRouter();
    const { id } = router.query;
    const [solicitudData, setSolicitudData] = useState<any>(null);
    const [statusName, setStatusName] = useState("");
    

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

    const handleUpdate = async () => {
        
        if (!archivoFile) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe agregar el Comprobande de Pago.",
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

        try {
            let archivoURL = "";
            if (archivoFile) {
                archivoURL = await uploadFileToFirebase(archivoFile, `uploads/${id}/adjuntoComprobantePago`);
            }

            const updatePayload = {
                solicitudId: id,
                status: "19",
                adjuntoComprobantePago: archivoURL || '',
            };

            const responseData = await axios.post('/api/update-request-all', updatePayload);

            if (responseData.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Comprobante de pago enviado correctamente",
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
                    /* window.location.reload(); */
                    handleBack();
                });
                console.log("Los datos han sido guardados correctamente.");
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Error al enviar el Comprobante de pago",
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
            }
        } catch (error) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Hubo un problema enviando el Comprobante de pago. Por favor, inténtalo de nuevo más tarde.",
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

    return (
        <div className="flex flex-col md:flex-row gap-8 p-8 w-full items-start">
            <div className="flex flex-col gap-8 md:w-1/2">
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

                {/* Sección de Actualizar */}
                <div className="bg-gray-800 col-span-1 p-8 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Depósitos y transferencias bancarias</h3>

                    <div className="text-gray-300 mb-6">
                        <p className="font-bold">Transferencia o Depósito Local:</p>
                        <p><span className="font-bold">Banco General</span></p>
                        <p><span className="font-bold">Beneficiario:</span> Panama Legal Group</p>
                        <p><span className="font-bold">Cuenta Corriente:</span> 03-10-01-112249-3</p>

                        <p className="font-bold mt-4">Transferencia Internacional:</p>
                        <p><span className="font-bold">BANCO INTERMEDIARIO:</span> CITIBANK NEW YORK, N.Y. SWIFT CITIUS33, ABA 021000089</p>
                        <p><span className="font-bold">Banco Beneficiario:</span> BANK IN PANAMA</p>
                        <p><span className="font-bold">Banco General, S.A:</span> - Panama SWIFT BAGEPAPA</p>
                        <p><span className="font-bold">Beneficiario:</span> Panama Legal Group</p>
                        <p><span className="font-bold">Cuenta Corriente:</span> 03-10-01-112249-3</p>

                        <p className="mt-4">* Puedes subir la transferencia o depósito aquí, nuestro equipo realizará la verificación y dará inicio a tu trámite en no más de 24 horas laborables.</p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Adjuntar comprobante de pago <span className="text-red-500">*</span></label>
                        <input
                            type="file"
                            name="adjuntoComprobantePago"
                            className="w-full p-2 rounded bg-gray-900 text-white"
                            onChange={handleFileChange}
                        />
                        <p className="text-gray-400 mt-2">{archivoFile ? archivoFile.name : "Sin archivos seleccionados"}</p>
                    </div>

                    <div className="flex space-x-4 mt-2">
                        <button className="bg-gray-500 text-white px-4 py-2 rounded mt-2" onClick={handleBack}>Volver</button>
                        <button className="bg-profile text-white px-4 py-2 rounded mt-2" onClick={handleUpdate}>Enviar</button>
                    </div>
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
            </div>
        </div>
    );
};

export default Checkout;
