import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
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

interface ModalAccionistasDeclaracionProps {
    onClose: () => void;
    idSolicitud?: string;
}

const ModalAccionistasDeclaracion: React.FC<ModalAccionistasDeclaracionProps> = ({ onClose, idSolicitud }) => {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store } = context;
    const solicitudId = store.solicitudId || idSolicitud;

    interface Persona {
        id: string;
        nombre?: string;
        nombreApellido?: string;
        tipo?: string;
        tipoPersona?: string;
        personaJuridica?: {
            nombreJuridico?: string;
        };
        accionista?: any;
    }

    const [personas, setPersonas] = useState<Persona[]>([]);
    const [formData, setFormData] = useState({
        seleccionar: '',
        archivo: null as File | null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [archivoFile, setArchivoFile] = useState<File | null>(null);

    const fetchAccionistas = async () => {
        try {
            const response = await axios.get(`/api/get-people-id`, {
                params: { solicitudId }
            });

            const personas = response.data || [];

            // Solo incluir accionistas activos que NO tengan declaración jurada subida
            const accionistasSinDeclaracion = personas.filter((persona: any) =>
                persona.accionista?.accionista === true &&
                !persona.adjuntoDeclaracionJurada
            );

            setPersonas(accionistasSinDeclaracion);
        } catch (error) {
            console.error('Error fetching accionistas:', error);
        }
    };

    useEffect(() => {
        fetchAccionistas();
    }, [solicitudId]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;

        if (name === 'archivo' && files) {
            setFormData(prev => ({ ...prev, archivo: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.seleccionar) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor selecciona un accionista.",
                showConfirmButton: false,
                timer: 2500,
                background: '#2c2c3e',
                color: '#fff',
                toast: true,
            });
            return;
        }

        if (!archivoFile) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor adjunte la declaración jurada.",
                showConfirmButton: false,
                timer: 2500,
                background: '#2c2c3e',
                color: '#fff',
                toast: true,
            });
            return;
        }

        let archivoURL = '';

        if (archivoFile) {
            archivoURL = await uploadFileToFirebase(archivoFile, `uploads/${store.solicitudId}/declaraciones/${formData.seleccionar}`);
        }

        const bodyToSend = {
            peopleId: formData.seleccionar,
            adjuntoDeclaracionJurada: archivoURL,
            declaracionJurada: true,
        };

        setIsLoading(true);

        try {
            const response = await axios.post('/api/update-people', bodyToSend);

            if (response.status === 200) {
                onClose();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Declaración jurada cargada correctamente para el accionista.",
                    showConfirmButton: false,
                    timer: 3500,
                    timerProgressBar: true,
                    toast: true,
                    background: '#2c2c3e',
                    color: '#fff',
                });
            } else {
                throw new Error('Error al subir el archivo.');
            }
        } catch (error) {
            console.error('Error al subir archivo:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setArchivoFile(file);
        setFormData(prev => ({ ...prev, archivo: file }));
    };

    const uploadFileToFirebase = (file: File, path: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, path);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                () => { }, // puedes omitir el progreso si no lo necesitas
                (error) => reject(error),
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg w-1/2 relative">
                <button className="text-white absolute top-2 right-4" onClick={onClose}>X</button>
                <h2 className="text-white text-2xl font-bold mb-4">Declaración Jurada Accionista</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-white block mb-2">Seleccionar Accionista</label>
                        <select
                            name="seleccionar"
                            value={formData.seleccionar}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        >
                            <option value="">Seleccione un accionista</option>
                            {personas.map((persona: any) => (
                                <option key={persona.id} value={persona.id}>
                                    {(persona.tipoPersona === 'Persona Jurídica' || persona.tipo === 'Persona Jurídica')
                                        ? `${(persona?.personaJuridica?.nombreJuridico || persona?.nombre_PersonaJuridica)} - ${persona?.nombreApellido || persona?.nombre}`
                                        : persona?.nombreApellido || persona?.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="text-white block mb-2">Adjuntar Declaración jurada</label>
                        <input
                            type="file"
                            name="archivo"
                            onChange={handleFileChange}
                            className="w-full p-2 bg-gray-800 text-white rounded-lg"
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                            type="button"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                        <button
                            className="bg-profile text-white py-2 px-4 rounded-lg"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Cargando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAccionistasDeclaracion;