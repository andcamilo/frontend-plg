"use client";
import React, { useState, useContext, useRef, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/fundacionContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import countryCodes from '@utils/countryCode';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
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

const FundacionObjetivos: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext debe ser usado dentro de un AppStateProvider');
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        selectedObjetivos: [] as string[],
        mantieneContador: 'No',
        nombreContador: '',
        idoneidadContador: '',
        telefonoContador: '',
        telefonoContadorCodigo: 'PA',
        correoContador: '',
        adjuntoDocumentoContribuyente: null as File | null, // Para el archivo de RUC
        otroObjetivo: '',
        adjuntoDocumentoContribuyenteURL: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [mostrarOtro, setMostrarOtro] = useState(false); // Controlar si se muestra el campo "Otros"
    const [inputError, setInputError] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({
        nombreContador: false,
        idoneidadContador: false,
        telefonoContador: false,
        correoContador: false,
        adjuntoDocumentoContribuyente: false,
    });

    const nombreContadorRef = useRef<HTMLInputElement>(null);
    const idoneidadContadorRef = useRef<HTMLInputElement>(null);
    const telefonoContadorRef = useRef<HTMLInputElement>(null);
    const correoContadorRef = useRef<HTMLInputElement>(null);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;

        if (value === 'otros') {
            setMostrarOtro(checked); // Mostrar u ocultar el campo "Otro"
            if (checked) {
                setFormData((prevData) => ({
                    ...prevData,
                    selectedObjetivos: [...prevData.selectedObjetivos, value], // Agregar "otros" a selectedObjetivos si está marcado
                }));
            } else {
                setFormData((prevData) => ({
                    ...prevData,
                    selectedObjetivos: prevData.selectedObjetivos.filter((item) => item !== value), // Remover "otros" si está desmarcado
                    otroObjetivo: '', // Limpiar el valor de "otroObjetivo" si se desmarca "Otros"
                }));
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                selectedObjetivos: checked
                    ? [...prevData.selectedObjetivos, value]
                    : prevData.selectedObjetivos.filter((item) => item !== value),
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (name === 'otroObjetivo' && value.trim() !== '') {
            setInputError(false); // Quitar el error si el usuario escribe en "Otro"
        }
    };

    const [adjuntoDocumentoContribuyente, setArchivoRUC] = useState<File | null>(null);
    const [adjuntoDocumentoContribuyenteURL, setArchivoRUCURL] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setArchivoRUC(file);

        if (file) {
            try {
                const path = `uploads/${store.solicitudId}/adjuntoDocumentoContribuyente`;
                const downloadURL = await uploadFileToFirebase(file, path);

                setFormData((prevData) => ({
                    ...prevData,
                    adjuntoDocumentoContribuyenteURL: downloadURL,
                }));

                // Quitar el error del campo de archivo si ya se subió un archivo
                setFieldErrors((prevErrors) => ({
                    ...prevErrors,
                    adjuntoDocumentoContribuyente: false,
                }));
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
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

    const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);
    useEffect(() => {
        if (store.solicitudId) {
            fetchSolicitud();
        }
    }, [store.solicitudId]);

    useEffect(() => {
        if (store.request) {
            const objetivosData = get(store.request, 'objetivos', {});
            const selectedObjetivos = get(objetivosData, 'objetivos', []);
            setArchivoRUCURL(objetivosData.adjuntoDocumentoContribuyenteURL || '');

            if (objetivosData && Object.keys(objetivosData).length > 0) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    selectedObjetivos: selectedObjetivos,
                    mantieneContador: objetivosData.mantieneContador || 'No',
                    nombreContador: objetivosData.nombreContador || '',
                    idoneidadContador: objetivosData.idoneidadContador || '',
                    telefonoContador: objetivosData.telefonoContador || '',
                    correoContador: objetivosData.correoContador || '',
                    otroObjetivo: objetivosData.otroObjetivo || '',
                }));

                // Verificar si "otros" está seleccionado y mostrar el campo si es así
                if (selectedObjetivos.includes("otros") && objetivosData.otroObjetivo) {
                    setMostrarOtro(true);
                }
            }
        }
    }, [store.request]);

    const showAlert = (message: string, ref: React.RefObject<HTMLInputElement>) => {
        Swal.fire({
            position: "top-end",
            icon: "warning",
            title: message,
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
                timerProgressBar: 'custom-swal-timer-bar',
            },
        });
        ref.current?.scrollIntoView({ behavior: 'smooth' });
        ref.current?.focus();
    };

    const validateFields = () => {
        // Verificar si el archivo adjuntoDocumentoContribuyente es necesario y está vacío
        if (!adjuntoDocumentoContribuyente) {
            setFieldErrors((prevErrors) => ({
                ...prevErrors,
                adjuntoDocumentoContribuyente: true,
            }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Es necesario adjuntar el Registro Único de Contribuyente.",
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
                    timerProgressBar: 'custom-swal-timer-bar',
                },
            });
            return false;
        }

        // Resto de las validaciones para otros campos
        if (formData.selectedObjetivos.length === 0) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe seleccionar al menos un objetivo.",
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
                    timerProgressBar: 'custom-swal-timer-bar',
                },
            });
            return false;
        }

        // Validaciones para el contador
        if (formData.mantieneContador === 'Si') {
            if (!formData.nombreContador) {
                setFieldErrors((prevErrors) => ({ ...prevErrors, nombreContador: true }));
                showAlert("Por favor, ingrese el nombre del contador.", nombreContadorRef);
                return false;
            }
            if (!formData.idoneidadContador) {
                setFieldErrors((prevErrors) => ({ ...prevErrors, idoneidadContador: true }));
                showAlert("Por favor, ingrese la idoneidad del contador.", idoneidadContadorRef);
                return false;
            }
            if (!formData.telefonoContador) {
                setFieldErrors((prevErrors) => ({ ...prevErrors, telefonoContador: true }));
                showAlert("Por favor, ingrese el teléfono del contador.", telefonoContadorRef);
                return false;
            }
            if (!formData.correoContador) {
                setFieldErrors((prevErrors) => ({ ...prevErrors, correoContador: true }));
                showAlert("Por favor, ingrese el correo electrónico del contador.", correoContadorRef);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateFields()) {
            return;
        }

        setIsLoading(true);

        try {
            let adjuntoDocumentoContribuyenteURLFinal = adjuntoDocumentoContribuyenteURL;

            // Subir el archivo si se ha seleccionado uno nuevo
            if (adjuntoDocumentoContribuyente) {
                adjuntoDocumentoContribuyenteURLFinal = await uploadFileToFirebase(adjuntoDocumentoContribuyente, `uploads/${store.solicitudId}/RUC`);
            }

            const updatePayload = {
                solicitudId: store.solicitudId,
                objetivos: {
                    objetivos: formData.selectedObjetivos,
                    ...(mostrarOtro && { otroObjetivo: formData.otroObjetivo }),
                    mantieneContador: formData.mantieneContador,
                    ...(formData.mantieneContador === 'Si' && {
                        nombreContador: formData.nombreContador,
                        idoneidadContador: formData.idoneidadContador,
                        telefonoContador: `${countryCodes[formData.telefonoContadorCodigo]}${formData.telefonoContador}` || '',
                        correoContador: formData.correoContador,
                    }),
                    adjuntoDocumentoContribuyenteURL: adjuntoDocumentoContribuyenteURLFinal, // Guardar la URL del archivo en el payload
                },
            };

            const response = await axios.patch('/api/update-request-fundacion', updatePayload);

            if (response.status === 200) {
                setStore((prevState) => ({
                    ...prevState,
                    ingresos: true,
                    currentPosition: 13,
                }));

                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Objetivos guardados correctamente.",
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                    toast: true,
                    background: '#2c2c3e',
                    color: '#fff',
                });
            } else {
                throw new Error('Error al actualizar la solicitud.');
            }
        } catch (error) {
            console.error('Error al actualizar la solicitud:', error);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Hubo un problema al actualizar la solicitud. Por favor, inténtelo de nuevo más tarde.",
                showConfirmButton: false,
                timer: 2500,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">
                Objetivos
                <span className="ml-2">
                    <i className="fa fa-info-circle"></i>
                </span>
            </h1>
            <p className="text-gray-300 mt-4">
                Aquí podrás agregar la información sobre los objetivos de la nueva Fundación de Interés Privado.
            </p>

            <form className="mt-4" onSubmit={handleSubmit}>
                <h2 className="text-gray-300 mb-2">Detalle los fines de la Fundación (objetivos):</h2>

                {/* Lista de objetivos */}
                <div className="flex flex-col space-y-2">
                    {[
                        { label: 'Dueña de Propiedad / Owner of Property', value: 'propiedad' },
                        { label: 'Vehículo de inversión / Investment vehicle', value: 'vehiculoInversion' },
                        { label: 'Dueño de nave o aeronave / Ownership of a vessel or aircraft', value: 'naveAeronave' },
                        { label: 'Portafolio Bienes y Raices / Real Estate Investment', value: 'portafolioBienesRaices' },
                        { label: 'Tenedora de activos / Holding Asset', value: 'tenedoraActivos' },
                        { label: 'Parte de una estructura / Part of a structure', value: 'parteEstructura' },
                        { label: 'Tenedora de Cuentas bancarias / Holding of Bank Account', value: 'tenedoraCuentasBancarias' },
                        { label: 'Otros / Others', value: 'otros' },
                    ].map((objective) => (
                        <div className="flex items-start" key={objective.value}>
                            <input
                                type="checkbox"
                                id={objective.value}
                                name="objetivos"
                                value={objective.value}
                                checked={formData.selectedObjetivos.includes(objective.value)}
                                onChange={handleCheckboxChange}
                                className="mr-3"
                                disabled={store.request.status >= 10 && store.rol < 20}
                            />
                            <label htmlFor={objective.value} className="text-white">
                                {objective.label}
                            </label>
                        </div>
                    ))}

                    {mostrarOtro && (
                        <input
                            type="text"
                            name="otroObjetivo"
                            value={formData.otroObjetivo}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${inputError ? 'border border-red-500' : ''}`}
                            placeholder="Especifique el objetivo"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    )}
                </div>

                {/* Campo para seleccionar si se mantiene contador */}
                <div className="mt-4">
                    <h3 className="text-white font-bold">Contador</h3>
                    <p className="text-gray-400 text-sm">
                        La Dirección General de Ingresos requiere incluir quién es el contador que lleva los libros de la fundación.
                    </p>

                    <label className="text-white block mb-2">¿Mantiene un contador?</label>
                    <select
                        name="mantieneContador"
                        value={formData.mantieneContador}
                        onChange={handleChange}
                        className="w-full p-4 bg-gray-800 text-white rounded-lg"
                    >
                        <option value="No">No</option>
                        <option value="Si">Sí</option>
                    </select>
                </div>

                {/* Mostrar campos adicionales solo si mantiene un contador */}
                {formData.mantieneContador === 'Si' && (
                    <>
                        <div className="mt-4">
                            <p className="text-white font-bold">Favor indicar la información del contador:</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-white block mb-2">Nombre</label>
                                <input
                                    ref={nombreContadorRef}
                                    type="text"
                                    name="nombreContador"
                                    value={formData.nombreContador}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.nombreContador ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Ingrese el nombre del contador"
                                    disabled={store.request.status >= 10 && store.rol < 20}
                                />
                            </div>

                            <div>
                                <label className="text-white block mb-2">Idoneidad</label>
                                <input
                                    ref={idoneidadContadorRef}
                                    type="text"
                                    name="idoneidadContador"
                                    value={formData.idoneidadContador}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.idoneidadContador ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Ingrese la idoneidad del contador"
                                    disabled={store.request.status >= 10 && store.rol < 20}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="flex flex-col col-span-1">
                                <label className="text-white block mb-2">Teléfono</label>
                                <div className="flex gap-2">
                                    <select
                                        name="telefonoContadorCodigo"
                                        value={formData.telefonoContadorCodigo}
                                        onChange={handleChange}
                                        className="p-4 bg-gray-800 text-white rounded-lg"
                                    >
                                        {Object.entries(countryCodes).map(([code, dialCode]) => (
                                            <option key={code} value={code}>{code}: {dialCode}</option>
                                        ))}
                                    </select>
                                    <input
                                        ref={telefonoContadorRef}
                                        type="text"
                                        name="telefonoContador"
                                        value={formData.telefonoContador}
                                        onChange={handleChange}
                                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.telefonoContador ? 'border-2 border-red-500' : ''}`}
                                        placeholder="Ingrese el teléfono del contador"
                                        disabled={store.request.status >= 10 && store.rol < 20}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-white block mb-2">Correo Electrónico</label>
                                <input
                                    ref={correoContadorRef}
                                    type="email"
                                    name="correoContador"
                                    value={formData.correoContador}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.correoContador ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Ingrese el correo electrónico del contador"
                                    disabled={store.request.status >= 10 && store.rol < 20}
                                />
                            </div>
                        </div>
                    </>
                )}

                {formData.mantieneContador === 'No' && (
                    <div className="mt-4">
                        <p className="text-white font-bold">
                            Le prestamos los servicios de inclusión de contador para la DGI. El costo es de US$200.00. El costo no incluye los servicios de documentación contable ni declaración de renta. Incluye el servicio anual de contador como contacto ante la Dirección General de Ingresos.
                        </p>
                    </div>
                )}

                {/* Campo para subir el archivo de RUC */}
                <div className="mt-4">
                    <label className="text-white block mb-2">Registro Único de Contribuyente:</label>
                    <p className="text-gray-400 text-sm">
                        Adjuntar copia de factura de agua, luz o teléfono para los fines de confirmación del domicilio por parte de la Dirección General de Ingresos.
                    </p>
                    <input
                        type="file"
                        name="adjuntoDocumentoContribuyente"
                        onChange={handleFileChange}
                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.adjuntoDocumentoContribuyente ? 'border-2 border-red-500' : ''}`}
                    />
                    {formData.adjuntoDocumentoContribuyenteURL && (
                        <p className="text-sm text-blue-500">
                            <a href={formData.adjuntoDocumentoContribuyenteURL} target="_blank" rel="noopener noreferrer">
                                Ver documento actual
                            </a>
                        </p>
                    )}
                </div>

                {(store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
                    <>
                        <button
                            className="bg-gray-600 text-white w-full py-3 rounded-lg mt-6 hover:bg-gray-500"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <ClipLoader size={24} color="#ffffff" />
                                    <span className="ml-2">Cargando...</span>
                                </div>
                            ) : (
                                'Guardar y continuar'
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
                                    currentPosition: 13,
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

export default FundacionObjetivos;
