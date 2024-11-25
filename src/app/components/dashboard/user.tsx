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
    firebaseAppId,
    backendBaseUrl
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

const User: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [puedeEditarEmail, setPuedeEditarEmail] = useState(false);
    const [archivoFile, setArchivoFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        rol: '',
        cedulaPasaporte: "",
        archivoURL: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setArchivoFile(file);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!id) {
                setPuedeEditarEmail(true);
                return;
            }

            try {
                const response = await axios.get('/api/get-user-id', {
                    params: { userId: id },
                });

                const user = response.data;

                const rolLabels = {
                    99: "Super Administrador",
                    90: "Administrador ",
                    80: "Auditor",
                    50: "Caja Chica",
                    45: "Solicitante de gastos",
                    40: "Abogado",
                    35: "Asistente",
                    17: "Cliente recurrente",
                };
                // Mapear el rol numérico al valor de rolLabels
                const mappedRol = rolLabels[user.solicitud.rol] || '';

                setFormData({
                    nombre: user.solicitud.nombre || '',
                    email: user.solicitud.email || '',
                    telefono: user.solicitud.telefonoSolicita || '',
                    rol: mappedRol,
                    archivoURL: user.solicitud.adjuntoFotoPerfil || "",
                    cedulaPasaporte: user.solicitud.cedulaPasaporte || "",
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [id]);

    /* useEffect(() => {
        console.log("Rol ", formData.rol)
        if (formData.rol === 99) {
            setPuedeEditarEmail(true);
        }
    }, [id]); */

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (id) {
            try {

                const rolLabels = {
                    "Super Administrador": 99,
                    "Administrador": 90,
                    "Auditor": 80,
                    "Caja Chica": 50,
                    "Solicitante de gastos": 45,
                    "Abogado": 40,
                    "Asistente": 35,
                    "Cliente recurrente": 17,
                };

                let archivoURL = formData.archivoURL;
                if (archivoFile) {
                    archivoURL = await uploadFileToFirebase(archivoFile, `uploads/${id}/adjuntoFotoPerfil`);
                    setFormData((prevData) => ({
                        ...prevData,
                        archivoURL: archivoURL,
                    }));
                }

                const responseData = {
                    userId: id,
                    nombre: formData.nombre,
                    telefonoSolicita: formData.telefono,
                    cedulaPasaporte: formData.cedulaPasaporte,
                    rol: rolLabels[formData.rol.trim()] || null,
                    adjuntoFotoPerfil: archivoURL,
                };

                const response = await axios.patch('/api/update-user', responseData);

                if (response.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Datos actualizados correctamente',
                        timer: 2000,
                        showConfirmButton: false,
                        background: '#2c2c3e',
                        color: '#fff',
                    });
                    router.reload();
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar los datos',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#2c2c3e',
                    color: '#fff',
                });
                console.error('Error updating user:', error);
            }
        } else {
            try {

                const rolLabels = {
                    "Super Administrador": 99,
                    "Administrador": 90,
                    "Auditor": 80,
                    "Caja Chica": 50,
                    "Solicitante de gastos": 45,
                    "Abogado": 40,
                    "Asistente": 35,
                    "Cliente recurrente": 17,
                };

                const responseData = {
                    nombre: formData.nombre,
                    email: formData.email,
                    telefonoSolicita: formData.telefono,
                    cedulaPasaporte: formData.cedulaPasaporte,
                    rol: rolLabels[formData.rol.trim()] || null,
                };

                /* const response = await axios.post("/api/create-user", responseData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }); */
                const response = await axios.post(
                    `${backendBaseUrl}/dev/create-users`,
                    responseData,
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Usuario creado correctamente',
                        timer: 2000,
                        showConfirmButton: false,
                        background: '#2c2c3e',
                        color: '#fff',
                    });
                   /*  router.reload(); */
                }

                const { userId } = response.data;
                console.log("User ID ",userId)
                if (!userId) {
                    console.error("El userId es undefined o inválido.");
                    return;
                }

                let archivoURL = formData.archivoURL;
                if (archivoFile) {
                    archivoURL = await uploadFileToFirebase(archivoFile, `uploads/${userId}/adjuntoFotoPerfil`);
                    setFormData((prevData) => ({
                        ...prevData,
                        archivoURL: archivoURL,
                    }));
                }

                const responseAdjunto = {
                    userId: userId,
                    nombre: formData.nombre,
                    email: formData.email,
                    telefonoSolicita: formData.telefono,
                    cedulaPasaporte: formData.cedulaPasaporte,
                    rol: rolLabels[formData.rol.trim()] || null,
                    adjuntoFotoPerfil: archivoURL,
                };

                const responseDataUpdate = await axios.post('/api/update-user', responseAdjunto);

                if (responseDataUpdate.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Usuario 22 creado correctamente',
                        timer: 2000,
                        showConfirmButton: false,
                        background: '#2c2c3e',
                        color: '#fff',
                    });
                    /* router.reload(); */
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear el nuevo usuario',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#2c2c3e',
                    color: '#fff',
                });
                console.error('Error updating user:', error);
            }
        }

    };

    const handleBack = () => {
        router.push('/dashboard/clients');
    };

    return (
        <div className="p-8 bg-gray-900 rounded-lg w-full">
            <h3 className="text-lg font-bold text-white mb-4">Datos básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-300 mb-1">Nombre *</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-800 text-white"
                        placeholder="Nombre"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 mb-1">Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-800 text-white"
                        placeholder="Email"
                        readOnly={!puedeEditarEmail}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                    <label className="block text-gray-300 mb-1">Cedula o Pasaporte</label>
                    <input
                        type="text"
                        name="cedulaPasaporte"
                        value={formData.cedulaPasaporte}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-800 text-white"
                        placeholder="Cedula o Pasaporte"
                    />
                </div>

                <div>
                    <label className="block text-gray-300 mb-1">Teléfono</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-800 text-white"
                        placeholder="Teléfono"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                    <label className="block text-gray-300 mb-1">Rol</label>
                    <select
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-800 text-white"
                    >
                        <option value="Administrador">Administrador</option>
                        <option value="Auditor">Auditor</option>
                        <option value="Caja Chica">Caja Chica</option>
                        <option value="Solicitante de gastos">Solicitante de gastos</option>
                        <option value="Abogado">Abogados</option>
                        <option value="Asistente">Asistente</option>
                        <option value="Cliente recurrente">Cliente recurrente</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="text-white block mb-2">Foto de perfil</label>
                    <input
                        type="file"
                        name="adjuntoDocumentoConsulta"
                        onChange={handleFileChange}
                        className="w-full p-2 bg-gray-800 text-white rounded-lg"
                    />
                    {formData.archivoURL && (
                        <p className="text-sm text-blue-500">
                            <a href={formData.archivoURL} target="_blank" rel="noopener noreferrer">
                                Ver documento actual
                            </a>
                        </p>
                    )}
                </div>
            </div>

            <div className="flex space-x-4 mt-6">
                <button
                    className="bg-gray-500 text-white px-6 py-3 rounded"
                    onClick={handleBack}
                >
                    Volver
                </button>
                <button
                    className="bg-pink-600 text-white px-6 py-3 rounded"
                    onClick={handleSave}
                >
                    Guardar
                </button>
            </div>
        </div>
    );
};

export default User;
