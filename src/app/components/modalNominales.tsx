import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
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

const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
};

interface ModalNominalesProps {
    onClose: () => void;
    abogadosDisponibles: any[];
    solicitudData: any;
    email: string;
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

const ModalNominales: React.FC<ModalNominalesProps> = ({ onClose, abogadosDisponibles, solicitudData, email }) => {

    console.log("Solicitud recibida:", solicitudData);
    console.log("abogadosDisponibles:", abogadosDisponibles);
    const solicitudId = solicitudData.id;
    const emailAbogado = email;

    const tipoSolicitudMap: Record<string, string> = {
        'propuesta-legal': 'Propuesta Legal',
        'consulta-legal': 'Propuesta Legal',
        'consulta-escrita': 'Consulta Escrita',
        'consulta-virtual': 'Consulta Virtual',
        'consulta-presencial': 'Consulta Presencial',
        'new-fundacion-interes-privado': 'Fundación de Interés Privado',
        'new-fundacion': 'Fundación de Interés Privado',
        'new-sociedad-empresa': 'Sociedad / Empresa',
        'menores-al-extranjero': 'Salida de Menores al Extranjero',
        'pension-alimenticia': 'Pensión Alimenticia',
        'pension': 'Pensión Alimenticia',
        'tramite-general': 'Trámite General',
        'pension-desacato': 'Pensión Desacato',
        'solicitud-cliente-recurrente': 'Solicitud Cliente Recurrente',
    };

    const tipoLegible = tipoSolicitudMap[solicitudData.tipo] || 'Tipo desconocido';

    const [formData, setFormData] = useState<any>({
        tipoSolicitud: tipoLegible || solicitudData.tipo,
        nombreSociedadFundacion: '',
        tipoSociedadFundacion: '',
        poseeNominales: 'No',
        poseeDirectoresNominales: 'No',
        directoresNominales: [],
        poseeDignatariosNominales: 'No',
        dignatariosNominales: [],
        poseeMiembrosNominales: 'No',
        miembrosNominales: [],
        agenteResidente: '',
        agenteResidenteNombre: '',
        poseeAvisoOperacion: 'No',
        avisoOperacionFile: null,
        archivoAvisoOperacion: '',
        libroAccionesFile: null,
        archivoLibroAcciones: '',
        acciones: [],
        reglamentoInternoFile: null,
        archivoReglamentoInterno: '',
        ruc: '',
        rucFile: null,
        archivoRUC: '',
        nit: '',
        nitFile: null,
        archivoNIT: '',
        fechaConstitucion: '',
        escrituraFile: null,
        archivoEscritura: '',
        correoResponsable: solicitudData.emailSolicita || '',
        correoAdicional: '',
        periodoPago: '',
    });

    const [expedienteExiste, setExpedienteExiste] = useState<boolean | null>(null);
    const [expedienteId, setExpedienteId] = useState<string | null>(null);

    useEffect(() => {
        const verificarExpediente = async () => {
            try {
                const db = getFirestore();
                const expedienteRef = collection(db, 'expediente');
                const q = query(expedienteRef, where('solicitud', '==', solicitudId));
                const querySnapshot = await getDocs(q);
                const exists = !querySnapshot.empty;
                setExpedienteExiste(exists);

                if (exists) {
                    const doc = querySnapshot.docs[0];
                    const data = doc.data();
                    setExpedienteId(doc.id);

                    setFormData((prev: any) => ({
                        ...prev,
                        ...data,
                        nombreSociedadFundacion: data.nombreSociedadFundacion,
                        acciones:
                            data.archivosAcciones && data.archivosAcciones.length > 0
                                ? data.archivosAcciones.map((url: string) => ({ archivo: null, url }))
                                : [{ archivo: null, url: '' }],
                        archivosAcciones: data.archivosAcciones || [],
                    }));
                }
            } catch (error) {
                console.error('Error al verificar expediente:', error);
                Swal.fire('Error', 'No se pudo verificar ni cargar el expediente.', 'error');
            }
        };

        verificarExpediente();
    }, [solicitudId]);

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, /* files */ } = e.target;
        if (type === 'file') {
            /* setFormData((prev) => ({ ...prev, [name]: files ? files[0] : null })); */
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const agregarNominal = (tipo: 'directoresNominales' | 'dignatariosNominales' | 'miembrosNominales',) => {
        setFormData((prev: any) => ({
            ...prev,
            [tipo]: [...prev[tipo], { abogado: '', otro: '', cargo: '' }],
        }));
    };

    const actualizarNominal = (tipo: 'directoresNominales' | 'dignatariosNominales' | 'miembrosNominales', index: number, campo: string, valor: string) => {
        const copia = [...formData[tipo]];
        copia[index][campo] = valor;
        setFormData((prev: any) => ({ ...prev, [tipo]: copia }));
    };

    const eliminarNominal = (tipo: 'directoresNominales' | 'dignatariosNominales' | 'miembrosNominales', index: number) => {
        const copia = [...formData[tipo]];
        copia.splice(index, 1);
        setFormData((prev: any) => ({ ...prev, [tipo]: copia }));
    };

    const agregarAccion = () => {
        setFormData((prev: any) => ({
            ...prev,
            acciones: [...prev.acciones, { archivo: null, url: '' }],
        }));
    };

    const actualizarAccionArchivo = (index: number, archivo: File) => {
        const nuevas = [...formData.acciones];
        nuevas[index].archivo = archivo;
        setFormData((prev: any) => ({ ...prev, acciones: nuevas }));
    };

    const eliminarAccion = (index: number) => {
        if (formData.acciones.length === 1) return;
        const nuevas = [...formData.acciones];
        nuevas.splice(index, 1);
        setFormData((prev: any) => ({ ...prev, acciones: nuevas }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let datosLimpios = { ...formData };

        if (datosLimpios.tipoNominal === 'director' || datosLimpios.tipoNominal === 'miembro') {
            delete datosLimpios.cargo;
        }

        const {
            rucFile,
            nitFile,
            escrituraFile,
            ...restoDatos
        } = datosLimpios;

        let otrosDatos = { ...restoDatos };

        try {
            let expedienteIdFinal = expedienteId;

            if (!expedienteExiste) {
                const createPayload = {
                    name: solicitudData?.nombreSolicita,
                    lastName: "",
                    email: solicitudData?.emailSolicita,
                    solicitud: solicitudId,
                    lawyer: emailAbogado,
                    descripcion: '',
                    phone: "",
                    ...otrosDatos
                };

                const createResponse = await axios.post('/api/create-record', createPayload);

                if (createResponse.data.status !== 'success') {
                    throw new Error(createResponse.data.message || 'No se pudo crear el expediente.');
                }

                expedienteIdFinal = createResponse.data.recordId;
            }

            if (rucFile) {
                otrosDatos.archivoRUC = await uploadFileToFirebase(rucFile, `uploads/${expedienteIdFinal}/ruc`);
            }

            if (nitFile) {
                otrosDatos.archivoNIT = await uploadFileToFirebase(nitFile, `uploads/${expedienteIdFinal}/nit`);
            }

            if (escrituraFile) {
                otrosDatos.archivoEscritura = await uploadFileToFirebase(escrituraFile, `uploads/${expedienteIdFinal}/escritura`);
            }

            if (formData.avisoOperacionFile) {
                otrosDatos.archivoAvisoOperacion = await uploadFileToFirebase(
                    formData.avisoOperacionFile,
                    `uploads/${expedienteIdFinal}/aviso-operacion`
                );
            }

            if (formData.libroAccionesFile) {
                otrosDatos.archivoLibroAcciones = await uploadFileToFirebase(
                    formData.libroAccionesFile,
                    `uploads/${expedienteIdFinal}/libro-acciones`
                );
            }

            const nuevasAcciones: string[] = [];

            for (let i = 0; i < formData.acciones.length; i++) {
                const accion = formData.acciones[i];

                if (accion.archivo) {
                    const url = await uploadFileToFirebase(
                        accion.archivo,
                        `uploads/${expedienteIdFinal}/acciones/${i}`
                    );
                    nuevasAcciones.push(url);
                } else if (accion.url) {
                    nuevasAcciones.push(accion.url);
                }
            }

            if (nuevasAcciones.length > 0) {
                otrosDatos.archivosAcciones = nuevasAcciones;
            }

            if (formData.reglamentoInternoFile) {
                otrosDatos.archivoReglamentoInterno = await uploadFileToFirebase(
                    formData.reglamentoInternoFile,
                    `uploads/${expedienteIdFinal}/reglamento-interno`
                );
            }

            delete otrosDatos.acciones;

            const finalPayload = {
                name: solicitudData?.nombreSolicita,
                lastName: "",
                email: solicitudData?.emailSolicita,
                solicitud: solicitudId,
                lawyer: emailAbogado,
                descripcion: '',
                phone: "",
                ...otrosDatos
            };

            console.log("✅ finalPayload:", finalPayload);
            console.log("✅ EXPEDIENTE ID:", expedienteIdFinal);
            await axios.post(`/api/update-record?id=${expedienteIdFinal}`, finalPayload);

            Swal.fire('Éxito', expedienteExiste ? 'Expediente actualizado' : 'Expediente creado exitosamente', 'success');
            onClose();
        } catch (error) {
            console.error('Error al enviar:', error);
            Swal.fire('Error', 'No se pudo procesar el expediente.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const styledInput = "w-full p-2 border border-gray-700 rounded bg-gray-800 text-white";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg w-3/4 max-h-screen overflow-y-auto relative">
                <button className="text-white absolute top-2 right-4" onClick={onClose}>X</button>
                <h2 className="text-white text-2xl font-bold mb-4">Información Servicios Nominales</h2>
                <hr className="mb-4" />
                <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="col-span-2">
                        <label className="text-white">Tipo: {formData.tipoSolicitud}</label>
                    </div>

                    <div className="col-span-2">
                        <label className="text-white">Nombre de la Sociedad/Fundación</label>
                        <input name="nombreSociedadFundacion" value={formData.nombreSociedadFundacion} onChange={handleChange} className={styledInput} />
                    </div>

                    <div className="col-span-2">
                        <label className="text-white">Tipo de Sociedad/Fundación</label>
                        <select name="tipoSociedadFundacion" value={formData.tipoSociedadFundacion} onChange={handleChange} className={styledInput}>
                            <option value="">Seleccione tipo</option>
                            <option>S.A.</option>
                            <option>INC</option>
                            <option>CORP</option>
                            <option>Sociedad Offshore</option>
                            <option>Tenedora de Activos</option>
                            <option>Fundación Interés Privado</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="text-white">¿Posee servicio de nominales?</label>
                        <select name="poseeNominales" value={formData.poseeNominales} onChange={handleChange} className={styledInput}>
                            <option>No</option>
                            <option>Si</option>
                        </select>
                    </div>

                    {formData.poseeNominales === 'Si' && (
                        <>
                            {/* DIRECTORES NOMINALES */}
                            <div className="col-span-2">
                                <label className="text-white block mb-1">¿Posee Directores nominales?</label>
                                <select name="poseeDirectoresNominales" value={formData.poseeDirectoresNominales} onChange={handleChange} className={styledInput}>
                                    <option>No</option>
                                    <option>Si</option>
                                </select>
                            </div>
                            {formData.poseeDirectoresNominales === 'Si' && (
                                <>
                                    {formData.directoresNominales.map((dir: any, i: number) => (
                                        <div key={i} className="col-span-2 flex flex-col md:flex-row md:items-center gap-2">
                                            <div className="flex-1">
                                                <select
                                                    value={dir.abogado}
                                                    onChange={(e) => actualizarNominal('directoresNominales', i, 'abogado', e.target.value)}
                                                    className={styledInput}
                                                >
                                                    <option value="">Seleccione abogado</option>
                                                    {abogadosDisponibles.map((a) => (
                                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                                    ))}
                                                    <option value="otros">Otros</option>
                                                </select>
                                                {dir.abogado === 'otros' && (
                                                    <input
                                                        placeholder="Nombre otro"
                                                        value={dir.otro}
                                                        onChange={(e) => actualizarNominal('directoresNominales', i, 'otro', e.target.value)}
                                                        className={`${styledInput} mt-2`}
                                                    />
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => eliminarNominal('directoresNominales', i)}
                                                className="bg-red-600 text-white rounded px-3 py-1 text-sm h-fit"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    ))}
                                    {formData.directoresNominales.length < 5 && (
                                        <button type="button" onClick={() => agregarNominal('directoresNominales')} className="bg-profile text-white py-1 px-3 rounded-lg mt-2">Agregar Director Nominal</button>
                                    )}
                                </>
                            )}

                            {/* DIGNATARIOS NOMINALES */}
                            <div className="col-span-2">
                                <label className="text-white block mb-1">¿Posee Dignatarios nominales?</label>
                                <select name="poseeDignatariosNominales" value={formData.poseeDignatariosNominales} onChange={handleChange} className={styledInput}>
                                    <option>No</option>
                                    <option>Si</option>
                                </select>
                            </div>
                            {formData.poseeDignatariosNominales === 'Si' && (
                                <>
                                    {formData.dignatariosNominales.map((dig: any, i: number) => (
                                        <div key={i} className="col-span-2 flex flex-col md:flex-row md:items-center gap-2">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <select
                                                        value={dig.abogado}
                                                        onChange={(e) => actualizarNominal('dignatariosNominales', i, 'abogado', e.target.value)}
                                                        className={styledInput}
                                                    >
                                                        <option value="">Seleccione abogado</option>
                                                        {abogadosDisponibles.map((a) => (
                                                            <option key={a.id} value={a.id}>{a.nombre}</option>
                                                        ))}
                                                        <option value="otros">Otros</option>
                                                    </select>
                                                    {dig.abogado === 'otros' && (
                                                        <input
                                                            placeholder="Nombre otro"
                                                            value={dig.otro}
                                                            onChange={(e) => actualizarNominal('dignatariosNominales', i, 'otro', e.target.value)}
                                                            className={`${styledInput} mt-2`}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <select
                                                        value={dig.cargo}
                                                        onChange={(e) => actualizarNominal('dignatariosNominales', i, 'cargo', e.target.value)}
                                                        className={styledInput}
                                                    >
                                                        <option value="">Seleccione cargo</option>
                                                        <option>Presidente</option>
                                                        <option>Secretario</option>
                                                        <option>Tesorero</option>
                                                        <option>Representante Legal</option>
                                                        <option>Otro</option>
                                                    </select>
                                                    {dig.cargo === 'Otro' && (
                                                        <input
                                                            placeholder="Nombre del cargo"
                                                            value={dig.cargoOtro}
                                                            onChange={(e) => actualizarNominal('dignatariosNominales', i, 'cargoOtro', e.target.value)}
                                                            className={`${styledInput} mt-2`}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => eliminarNominal('dignatariosNominales', i)}
                                                className="bg-red-600 text-white rounded px-3 py-1 text-sm h-fit"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    ))}
                                    {formData.dignatariosNominales.length < 5 && (
                                        <button type="button" onClick={() => agregarNominal('dignatariosNominales')} className="bg-profile text-white py-1 px-3 rounded-lg mt-2">Agregar Dignatario Nominal</button>
                                    )}
                                </>
                            )}

                            {/* MIEMBROS NOMINALES */}
                            <div className="col-span-2">
                                <label className="text-white block mb-1">¿Posee Miembros nominales?</label>
                                <select name="poseeMiembrosNominales" value={formData.poseeMiembrosNominales} onChange={handleChange} className={styledInput}>
                                    <option>No</option>
                                    <option>Si</option>
                                </select>
                            </div>
                            {formData.poseeMiembrosNominales === 'Si' &&
                                !['new-sociedad-empresa', 'Sociedad / Empresa'].includes(solicitudData.tipo) && (
                                    <>
                                        {formData.miembrosNominales.map((mbr: any, i: number) => (
                                            <div key={i} className="col-span-2 flex flex-col md:flex-row md:items-center gap-2">
                                                <div className="flex-1">
                                                    <select
                                                        value={mbr.abogado}
                                                        onChange={(e) => actualizarNominal('miembrosNominales', i, 'abogado', e.target.value)}
                                                        className={styledInput}
                                                    >
                                                        <option value="">Seleccione abogado</option>
                                                        {abogadosDisponibles.map((a) => (
                                                            <option key={a.id} value={a.id}>{a.nombre}</option>
                                                        ))}
                                                        <option value="otros">Otros</option>
                                                    </select>
                                                    {mbr.abogado === 'otros' && (
                                                        <input
                                                            placeholder="Nombre otro"
                                                            value={mbr.otro}
                                                            onChange={(e) => actualizarNominal('miembrosNominales', i, 'otro', e.target.value)}
                                                            className={`${styledInput} mt-2`}
                                                        />
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarNominal('miembrosNominales', i)}
                                                    className="bg-red-600 text-white rounded px-3 py-1 text-sm h-fit"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        ))}
                                        {formData.miembrosNominales.length < 5 && (
                                            <button type="button" onClick={() => agregarNominal('miembrosNominales')} className="bg-profile text-white py-1 px-3 rounded-lg mt-2">Agregar Miembro Nominal</button>
                                        )}
                                    </>
                                )}
                        </>
                    )}

                    {/* Agente Residente */}
                    <div className="col-span-2">
                        <label className="text-white">Agente Residente</label>
                        <select name="agenteResidente" value={formData.agenteResidente} onChange={handleChange} className={styledInput}>
                            <option value="">Seleccione agente residente</option>
                            <option value="Panama Legal Group">Panama Legal Group</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    {formData.agenteResidente === 'otros' && (
                        <>
                            <div className="col-span-1">
                                <input name="agenteResidenteNombre" className={styledInput} placeholder="Nombre agente" value={formData.agenteResidenteNombre} onChange={handleChange} />
                            </div>
                            <div className="col-span-1"></div>
                        </>
                    )}

                    {/* Posee aviso de operación */}
                    {['new-sociedad-empresa', 'Sociedad / Empresa'].includes(solicitudData.tipo) && (
                        <div className="col-span-2">
                            <label className="text-white">¿Posee la sociedad aviso de operaciones?</label>
                            <select
                                name="poseeAvisoOperacion"
                                value={formData.poseeAvisoOperacion}
                                onChange={handleChange}
                                className={styledInput}
                            >
                                <option>No</option>
                                <option>Si</option>
                            </select>
                        </div>
                    )}

                    {/* Campo de adjunto solo si selecciona "Si" */}
                    {formData.poseeAvisoOperacion === 'Si' &&
                        ['new-sociedad-empresa', 'Sociedad / Empresa'].includes(solicitudData.tipo) && (
                            <div className="col-span-2">
                                <label className="text-white">Adjunte el Aviso de Operación de la sociedad</label>
                                <input
                                    type="file"
                                    className={styledInput}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setFormData((prev) => ({
                                            ...prev,
                                            avisoOperacionFile: file,
                                        }));
                                    }}
                                />
                                {formData.archivoAvisoOperacion && (
                                    <p className="text-sm text-blue-500 mt-1">
                                        <a href={formData.archivoAvisoOperacion} target="_blank" rel="noopener noreferrer">
                                            Ver documento actual
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}

                    {/* LIBRO DE ACCIONES - Solo para sociedades */}
                    {(formData.tipoSolicitud === 'Sociedad / Empresa' || formData.tipoSolicitud === 'new-sociedad-empresa') && (
                        <div className="col-span-2">
                            <label className="text-white">Agregar Libro de acciones</label>
                            <input
                                type="file"
                                className={styledInput}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    setFormData((prev) => ({
                                        ...prev,
                                        libroAccionesFile: file,
                                    }));
                                }}
                            />
                            {formData.archivoLibroAcciones && (
                                <p className="text-sm text-blue-500 mt-1">
                                    <a href={formData.archivoLibroAcciones} target="_blank" rel="noopener noreferrer">
                                        Ver documento actual
                                    </a>
                                </p>
                            )}
                        </div>
                    )}

                    {/* ACCIONES - adjuntos dinámicos */}
                    {(formData.tipoSolicitud === 'Sociedad / Empresa' || formData.tipoSolicitud === 'new-sociedad-empresa') && (
                        <div className="col-span-2">
                            <label className="text-white">Agregar acciones</label>

                            {formData.acciones.map((accion: any, i: number) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 mt-2">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            className={styledInput}
                                            onChange={(e) => {
                                                const archivo = e.target.files?.[0];
                                                if (archivo) actualizarAccionArchivo(i, archivo);
                                            }}
                                        />
                                        {accion.url && (
                                            <p className="text-sm text-blue-500 mt-1">
                                                <a href={accion.url} target="_blank" rel="noopener noreferrer">
                                                    Ver documento actual
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                    {formData.acciones.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => eliminarAccion(i)}
                                            className="bg-red-600 text-white rounded px-3 py-1 text-sm h-fit"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={agregarAccion}
                                className="bg-profile text-white py-1 px-3 rounded-lg mt-2"
                            >
                                Agregar acción
                            </button>
                        </div>
                    )}

                    {/* REGLAMENTO INTERNO - Solo fundaciones */}
                    {(formData.tipoSolicitud === 'Fundación de Interés Privado' ||
                        formData.tipoSolicitud === 'fundacion-interes-privado' || formData.tipoSolicitud === 'new-fundacion') && (
                            <div className="col-span-2">
                                <label className="text-white">Agregar reglamento interno (Adjuntar Fundaciones)</label>
                                <input
                                    type="file"
                                    className={styledInput}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        setFormData((prev) => ({
                                            ...prev,
                                            reglamentoInternoFile: file,
                                        }));
                                    }}
                                />
                                {formData.archivoReglamentoInterno && (
                                    <p className="text-sm text-blue-500 mt-1">
                                        <a href={formData.archivoReglamentoInterno} target="_blank" rel="noopener noreferrer">
                                            Ver documento actual
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}

                    <div className="col-span-1">
                        <label className="text-white block mb-1">Número RUC</label>
                        <input
                            name="ruc"
                            value={formData.ruc}
                            onChange={handleChange}
                            className={styledInput}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-white block mb-1 invisible">Archivo RUC</label>
                        <input
                            type="file"
                            className={styledInput}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setFormData((prev) => ({
                                    ...prev,
                                    rucFile: file,
                                }));
                            }}
                        />
                        {formData.archivoRUC && (
                            <p className="text-sm text-blue-500 mt-1">
                                <a href={formData.archivoRUC} target="_blank" rel="noopener noreferrer">
                                    Ver documento actual
                                </a>
                            </p>
                        )}
                    </div>

                    <div className="col-span-1">
                        <label className="text-white block mb-1">Número NIT</label>
                        <input
                            name="nit"
                            value={formData.nit}
                            onChange={handleChange}
                            className={styledInput}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-white block mb-1 invisible">Archivo NIT</label>
                        <input
                            type="file"
                            className={styledInput}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setFormData((prev) => ({
                                    ...prev,
                                    nitFile: file,
                                }));
                            }}
                        />
                        {formData.archivoNIT && (
                            <p className="text-sm text-blue-500 mt-1">
                                <a href={formData.archivoNIT} target="_blank" rel="noopener noreferrer">
                                    Ver documento actual
                                </a>
                            </p>
                        )}
                    </div>

                    <div className="col-span-1">
                        <label className="text-white block mb-1">Fecha de constitución</label>
                        <input
                            type="date"
                            name="fechaConstitucion"
                            value={formData.fechaConstitucion}
                            onChange={handleChange}
                            className={styledInput}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-white block mb-1">Adjuntar escritura pública</label>
                        <input
                            type="file"
                            className={styledInput}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setFormData((prev) => ({
                                    ...prev,
                                    escrituraFile: file,
                                }));
                            }}
                        />
                        {formData.archivoEscritura && (
                            <p className="text-sm text-blue-500 mt-1">
                                <a href={formData.archivoEscritura} target="_blank" rel="noopener noreferrer">
                                    Ver documento actual
                                </a>
                            </p>
                        )}
                    </div>

                    <div className="col-span-1">
                        <label className="text-white block mb-1">Correo del responsable</label>
                        <input
                            name="correoResponsable"
                            value={formData.correoResponsable}
                            onChange={handleChange}
                            className={styledInput}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-white block mb-1">Correo adicional</label>
                        <input
                            name="correoAdicional"
                            value={formData.correoAdicional}
                            onChange={handleChange}
                            className={styledInput}
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-white block mb-1">Periodo de pago</label>
                        <select
                            name="periodoPago"
                            value={formData.periodoPago}
                            onChange={handleChange}
                            className={styledInput}
                        >
                            <option value="">Seleccione periodo pago</option>
                            <option>1er semestre</option>
                            <option>2do semestre</option>
                        </select>
                    </div>

                    <div className="col-span-2 flex justify-end mt-4 space-x-4">
                        <button className="bg-gray-500 text-white py-2 px-4 rounded-lg" type="button" onClick={onClose}>Cerrar</button>
                        <button type="submit" className={`px-6 py-2 font-semibold rounded-lg transition ${isLoading ? 'bg-profile text-gray-400 cursor-not-allowed' : 'bg-profile text-white hover:bg-profile-dark'}`} disabled={isLoading}>
                            {isLoading ? 'Cargando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalNominales;