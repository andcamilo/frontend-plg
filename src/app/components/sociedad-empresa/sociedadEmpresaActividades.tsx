"use client";
import React, { useState, useContext, useRef } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/sociedadesContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const Actividades: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext debe ser usado dentro de un AppStateProvider');
    }

    const { store, setStore } = context;

    interface FormData {
        actividadesDentroPanama: string;
        nombreComercial: string;
        direccionComercial: string;
        comoLlegar: string;
        provincia: string;
        corregimiento: string;
        numeroLocal: string;
        nombreEdificio: string;
        inversionSucursal: string;
        cantidadTrabajadores: string;
        mantenerRotulo: string;
        telefono: string;
        correoElectronico: string;
        actividad1: string;
        actividad2: string;
        actividad3: string;
        mantieneContador: string;
        nombreContador: string;
        idoneidadContador: string;
        telefonoContador: string;
        correoContador: string;
        registrosContables: string;
        servicioDireccionComercial: boolean;
        tipoActividades: string;
        actividadOffshore1: string;
        actividadOffshore2: string;
        paisesActividadesOffshore: string;
        actividadTenedora: string[];  // <- Define que es un array de strings
    }

    const [formData, setFormData] = useState<FormData>({
        actividadesDentroPanama: 'SiYaTengoLocal',
        nombreComercial: '',
        direccionComercial: '',
        comoLlegar: '',
        provincia: 'Panamá',
        corregimiento: 'Ancón',
        numeroLocal: '',
        nombreEdificio: '',
        inversionSucursal: '',
        cantidadTrabajadores: '',
        mantenerRotulo: 'Si',
        telefono: '',
        correoElectronico: '',
        actividad1: '',
        actividad2: '',
        actividad3: '',
        mantieneContador: 'Si',
        nombreContador: '',
        idoneidadContador: '',
        telefonoContador: '',
        correoContador: '',
        registrosContables: 'Oficina Agente Residente',
        servicioDireccionComercial: false,
        tipoActividades: 'offshore',
        actividadOffshore1: '',
        actividadOffshore2: '',
        paisesActividadesOffshore: '',
        actividadTenedora: [],  // <- Asegúrate de inicializar como un array vacío
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fieldValidations = [
        // Validaciones generales para "SiYaTengoLocal"
        { field: 'nombreComercial', errorMessage: 'Por favor, ingrese el nombre comercial.' },
        { field: 'direccionComercial', errorMessage: 'Por favor, ingrese la dirección comercial.' },
        { field: 'comoLlegar', errorMessage: 'Por favor, especifique cómo llegar.' },
        { field: 'numeroLocal', errorMessage: 'Por favor, ingrese el número de local.' },
        { field: 'nombreEdificio', errorMessage: 'Por favor, ingrese el nombre del edificio.' },
        { field: 'inversionSucursal', errorMessage: 'Por favor, ingrese la inversión de la sucursal.' },
        { field: 'cantidadTrabajadores', errorMessage: 'Por favor, ingrese la cantidad de trabajadores.' },
        { field: 'telefono', errorMessage: 'Por favor, ingrese el teléfono.' },
        { field: 'correoElectronico', errorMessage: 'Por favor, ingrese el correo electrónico.' },
        // Campos de actividades
        { field: 'actividad1', errorMessage: 'Por favor, ingrese la actividad 1.' },
        { field: 'actividad2', errorMessage: 'Por favor, ingrese la actividad 2.' },
        { field: 'actividad3', errorMessage: 'Por favor, ingrese la actividad 3.' },
        // Validaciones para el contador
        { field: 'nombreContador', errorMessage: 'Por favor, ingrese el nombre del contador.' },
        { field: 'idoneidadContador', errorMessage: 'Por favor, ingrese la idoneidad del contador.' },
        { field: 'telefonoContador', errorMessage: 'Por favor, ingrese el teléfono del contador.' },
        { field: 'correoContador', errorMessage: 'Por favor, ingrese el correo electrónico del contador.' },
        // Validaciones para las actividadOffshore
        { field: 'actividadOffshore1', errorMessage: 'Por favor, ingrese la actividad offshore 1.' },
        { field: 'actividadOffshore2', errorMessage: 'Por favor, ingrese la actividad offshore 2.' },
        { field: 'paisesActividadesOffshore', errorMessage: 'Por favor, ingrese los países de las actividades offshore.' },
    ];

    const [fieldErrors, setFieldErrors] = useState({
        nombreComercial: false,
        direccionComercial: false,
        comoLlegar: false,
        numeroLocal: false,
        nombreEdificio: false,
        inversionSucursal: false,
        cantidadTrabajadores: false,
        telefono: false,
        correoElectronico: false,
        actividad1: false,
        actividad2: false,
        actividad3: false,
        nombreContador: false,
        idoneidadContador: false,
        telefonoContador: false,
        correoContador: false,
        actividadOffshore1: false,
        actividadOffshore2: false,
        paisesActividadesOffshore: false,
    });

    const formRefs = {
        nombreComercial: useRef<HTMLTextAreaElement>(null),
        direccionComercial: useRef<HTMLTextAreaElement>(null),
        comoLlegar: useRef<HTMLTextAreaElement>(null),
        numeroLocal: useRef<HTMLInputElement>(null),
        nombreEdificio: useRef<HTMLInputElement>(null),
        inversionSucursal: useRef<HTMLInputElement>(null),
        cantidadTrabajadores: useRef<HTMLInputElement>(null),
        telefono: useRef<HTMLInputElement>(null),
        correoElectronico: useRef<HTMLInputElement>(null),
        actividad1: useRef<HTMLInputElement>(null),
        actividad2: useRef<HTMLInputElement>(null),
        actividad3: useRef<HTMLInputElement>(null),
        nombreContador: useRef<HTMLInputElement>(null),
        idoneidadContador: useRef<HTMLInputElement>(null),
        telefonoContador: useRef<HTMLInputElement>(null),
        correoContador: useRef<HTMLInputElement>(null),
        actividadOffshore1: useRef<HTMLInputElement>(null),
        actividadOffshore2: useRef<HTMLInputElement>(null),
        paisesActividadesOffshore: useRef<HTMLTextAreaElement>(null),
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;

        setFormData((prevData) => {
            if (checked) {
                // Añadir el valor si el checkbox está marcado
                return {
                    ...prevData,
                    actividadTenedora: [...prevData.actividadTenedora, value], // Añade el nuevo valor
                };
            } else {
                // Eliminar el valor si el checkbox está desmarcado
                return {
                    ...prevData,
                    actividadTenedora: prevData.actividadTenedora.filter((item) => item !== value), // Filtra para eliminar el valor
                };
            }
        });
    };



    // Manejador para el cambio de opciones
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        // Eliminar el error cuando el campo empieza a llenarse
        setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [name]: false, // Remueve el borde rojo cuando se empieza a llenar el campo
        }));
    };

    const validateFields = () => {
        let fieldsToValidate: string[] = [];

        if (formData.actividadesDentroPanama === 'SiYaTengoLocal') {
            fieldsToValidate = [
                'nombreComercial', 'direccionComercial', 'comoLlegar', 'numeroLocal',
                'nombreEdificio', 'inversionSucursal', 'cantidadTrabajadores',
                'telefono', 'correoElectronico', 'actividad1', 'actividad2', 'actividad3'
            ];
        } else if (formData.actividadesDentroPanama === 'SiRequieroSociedadPrimero') {
            fieldsToValidate = ['actividad1', 'actividad2', 'actividad3'];

        } else if (formData.actividadesDentroPanama === 'No') {
            if (formData.tipoActividades === 'offshore') {
                fieldsToValidate = ['actividadOffshore1', 'actividadOffshore2', 'paisesActividadesOffshore'];
            } else if (formData.tipoActividades === 'tenedoraActivos') {
                fieldsToValidate = ['actividadTenedora'];
            }
        }

        // Validar los campos del contador solo si las actividades están dentro de Panamá y mantieneContador es 'Si'
        if (formData.actividadesDentroPanama !== 'No' && formData.mantieneContador === 'Si') {
            fieldsToValidate.push('nombreContador', 'idoneidadContador', 'telefonoContador', 'correoContador');
        }

        // Lógica para iterar sobre los campos que deben ser validados
        for (const { field, errorMessage } of fieldValidations.filter(({ field }) => fieldsToValidate.includes(field))) {
            if (!formData[field]) {
                setFieldErrors((prevErrors) => ({
                    ...prevErrors,
                    [field]: true, // Marca el campo con error
                }));

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
                        timerProgressBar: 'custom-swal-timer-bar',
                    },
                });

                // Enfocar el campo con error
                const ref = formRefs[field];
                if (ref && ref.current) {
                    ref.current.scrollIntoView({ behavior: 'smooth' });
                    ref.current.focus();
                }

                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validateFields()) {
            setIsLoading(false);
            return;
        }

        try {
            const updatePayload: any = {
                solicitudId: store.solicitudId,
                actividades: {
                    actividadesDentroOFueraPanama: formData.actividadesDentroPanama,
                    ...(formData.actividadesDentroPanama !== 'No' && {
                        actividadesDentroPanama: {
                            nombreComercial: formData.nombreComercial,
                            direccionComercial: formData.direccionComercial,
                            comoLlegar: formData.comoLlegar,
                            provincia: formData.provincia,
                            corregimiento: formData.corregimiento,
                            numeroLocal: formData.numeroLocal,
                            nombreEdificio: formData.nombreEdificio,
                            inversionSucursal: formData.inversionSucursal,
                            cantidadTrabajadores: formData.cantidadTrabajadores,
                            mantenerRotulo: formData.mantenerRotulo,
                            telefono: formData.telefono,
                            correoElectronico: formData.correoElectronico,
                        },

                        actividad1: formData.actividad1,
                        actividad2: formData.actividad2,
                        actividad3: formData.actividad3,
                        mantieneContador: formData.mantieneContador,
                        contador: {
                            nombreContador: formData.nombreContador,
                            idoneidadContador: formData.idoneidadContador,
                            telefonoContador: formData.telefonoContador,
                            correoContador: formData.correoContador,
                        },
                        registrosContables: formData.registrosContables,
                        servicioDireccionComercial: formData.servicioDireccionComercial,
                    }),

                    // Incluir campos para offshore
                    ...(formData.tipoActividades === 'offshore' && {
                        actividadesOffshore: {
                            tipoActividades: formData.tipoActividades,
                            actividadOffshore1: formData.actividadOffshore1,
                            actividadOffshore2: formData.actividadOffshore2,
                            paisesActividadesOffshore: formData.paisesActividadesOffshore,
                        }
                    }),

                    // Incluir campos para tenedora de activos
                    ...(formData.tipoActividades === 'tenedoraActivos' && {
                        actividadTenedora: formData.actividadTenedora
                    })
                }
            };

            console.log('🚀 ~ Payload enviado:', updatePayload);

            // Enviar los datos a la API
            const response = await axios.patch('/api/update-sociedad-actividades', updatePayload);

            if (response.status === 200) {
                console.log('🚀 ~ Respuesta exitosa:', response.data);
                setStore((prevState) => ({
                    ...prevState,
                    ingresos: true,
                    currentPosition: 11,
                }));
            } else {
                throw new Error('Error al actualizar la solicitud.');
            }
        } catch (error) {
            console.error('Error al actualizar la solicitud:', error.response || error.message);
            alert('Hubo un problema al actualizar la solicitud. Por favor, inténtelo de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">
                Actividades
                <span className="ml-2">
                    <i className="fa fa-info-circle"></i>
                </span>
            </h1>
            <p className="text-gray-300 mt-4">
                Aquí podrás agregar la información de las actividades de la nueva sociedad / empresa.
            </p>
            <hr></hr>
            <form className="mt-4" onSubmit={handleSubmit}>
                <p className="text-gray-300 mb-2">
                    ¿La sociedad va a ejecutar actividades DENTRO de la República de Panamá?
                </p>

                <div className="flex flex-col space-y-4 mb-4">
                    <div className="flex items-start">
                        <input
                            type="radio"
                            id="SiYaTengoLocal"
                            name="actividadesDentroPanama"
                            value="SiYaTengoLocal"
                            checked={formData.actividadesDentroPanama === 'SiYaTengoLocal'}
                            onChange={handleChange}
                            className="mr-3"
                        />
                        <label htmlFor="SiYaTengoLocal" className="text-white">
                            <span className="font-bold">Sí, ya tengo la local / dirección de dónde voy a ejecutar las actividades comerciales</span>
                            <br />
                            <span className="text-gray-400 text-sm">
                                Quiere decir que va a ejecutar el comercio dentro de Panamá. Implica obtener un Aviso de Operación y Registro Municipal. Se utilizarán las actividades mencionadas en el punto subsiguiente.
                            </span>
                        </label>
                    </div>

                    <div className="flex items-start">
                        <input
                            type="radio"
                            id="SiRequieroSociedadPrimero"
                            name="actividadesDentroPanama"
                            value="SiRequieroSociedadPrimero"
                            checked={formData.actividadesDentroPanama === 'SiRequieroSociedadPrimero'}
                            onChange={handleChange}
                            className="mr-3"
                        />
                        <label htmlFor="SiRequieroSociedadPrimero" className="text-white">
                            <span className="font-bold">Sí, pero requiero la sociedad primero para gestionar el local donde se ejecutarán las actividades comerciales</span>
                            <br />
                            <span className="text-gray-400 text-sm">
                                Quiere decir que se gestionará el Aviso de Operación posterior al registro de la sociedad / empresa.
                            </span>
                        </label>
                    </div>

                    <div className="flex items-start">
                        <input
                            type="radio"
                            id="No"
                            name="actividadesDentroPanama"
                            value="No"
                            checked={formData.actividadesDentroPanama === 'No'}
                            onChange={handleChange}
                            className="mr-3"
                        />
                        <label htmlFor="No" className="text-white">
                            <span className="font-bold">No</span>
                            <br />
                            <span className="text-gray-400 text-sm">
                                Quiere decir que su sociedad / empresa NO estará ejecutando actividades comerciales dentro de Panamá.
                            </span>
                        </label>
                    </div>
                </div>

                {/* Mostrar campos adicionales solo si se selecciona la opción "SiYaTengoLocal" */}
                {formData.actividadesDentroPanama === 'SiYaTengoLocal' && (
                    <>
                        <div className="mt-4">
                            <label className="text-white block mb-2">Nombre Comercial que desea para su negocio</label>
                            <textarea
                                ref={formRefs.nombreComercial}
                                name="nombreComercial"
                                value={formData.nombreComercial}
                                onChange={handleChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.nombreComercial ? 'border-2 border-red-500' : ''}`}
                                placeholder="Ingrese el nombre comercial"
                            />
                            {/* Solo muestra el mensaje de error una vez */}
                            {error === 'Por favor, ingrese el nombre comercial.' && <p className="text-red-500">{error}</p>}

                            <small className="text-gray-400">
                                * No tiene que ser el mismo que el Nombre de la Sociedad, pero puede serlo.
                            </small>
                        </div>


                        <div className="mt-4">
                            <label className="text-white block mb-2">Dirección donde va a ejecutar las actividades comerciales</label>
                            <textarea
                                ref={formRefs.direccionComercial}
                                name="direccionComercial"
                                value={formData.direccionComercial}
                                onChange={handleChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.direccionComercial ? 'border-2 border-red-500' : ''}`}
                                placeholder="Ingrese la dirección comercial"
                            />
                            {error === 'Por favor, ingrese la dirección comercial.' && <p className="text-red-500">{error}</p>}

                            <small className="text-gray-400">
                                * Local comercial, oficina o apartamento. Incluir urbanización, calle.
                            </small>
                        </div>

                        <div className="mt-4">
                            <label className="text-white block mb-2">Especifique cómo llegar</label>
                            <textarea
                                ref={formRefs.comoLlegar}
                                name="comoLlegar"
                                value={formData.comoLlegar}
                                onChange={handleChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.comoLlegar ? 'border-2 border-red-500' : ''}`}
                                placeholder="Especifique cómo llegar"
                            /* required */
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-white block mb-2">Provincia</label>
                                <select
                                    name="provincia"
                                    value={formData.provincia}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                >
                                    <option value="Panamá">Panamá</option>
                                    <option value="Colón">Colón</option>
                                    {/* Agrega más provincias si es necesario */}
                                </select>
                            </div>

                            <div>
                                <label className="text-white block mb-2">Corregimiento</label>
                                <select
                                    name="corregimiento"
                                    value={formData.corregimiento}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                >
                                    <option value="Ancón">Ancón</option>
                                    <option value="San Felipe">San Felipe</option>
                                    {/* Agrega más corregimientos si es necesario */}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-white block mb-2">Número de Local, Oficina, casa o Apartamento</label>
                            <input
                                ref={formRefs.numeroLocal}
                                type="text"
                                name="numeroLocal"
                                value={formData.numeroLocal}
                                onChange={handleChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.numeroLocal ? 'border-2 border-red-500' : ''}`}
                                placeholder="Ingrese el número de local"
                            /* required */
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-white block mb-2">Nombre del Edificio</label>
                            <input
                                ref={formRefs.nombreEdificio}
                                type="text"
                                name="nombreEdificio"
                                value={formData.nombreEdificio}
                                onChange={handleChange}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.nombreEdificio ? 'border-2 border-red-500' : ''}`}
                                placeholder="Ingrese el nombre del edificio"
                            /* required */
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-white block mb-2">Inversión de la sucursal</label>
                                <input
                                    ref={formRefs.inversionSucursal}
                                    type="number"
                                    name="inversionSucursal"
                                    value={formData.inversionSucursal}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.inversionSucursal ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Monto de la inversión"
                                /* required */
                                />
                            </div>

                            <div>
                                <label className="text-white block mb-2">¿Cuántos trabajadores tendría?</label>
                                <input
                                    ref={formRefs.cantidadTrabajadores}
                                    type="number"
                                    name="cantidadTrabajadores"
                                    value={formData.cantidadTrabajadores}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.cantidadTrabajadores ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Número de trabajadores"
                                /* required */
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-white block mb-2">¿Va a mantener rótulo su negocio?</label>
                            <select
                                name="mantenerRotulo"
                                value={formData.mantenerRotulo}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-800 text-white rounded-lg"
                            >
                                <option value="Si">Sí</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-white block mb-2">Teléfono</label>
                                <input
                                    ref={formRefs.telefono}
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.telefono ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Ingrese el teléfono"
                                /* required */
                                />
                            </div>

                            <div>
                                <label className="text-white block mb-2">Correo Electrónico</label>
                                <input
                                    ref={formRefs.correoElectronico}
                                    type="email"
                                    name="correoElectronico"
                                    value={formData.correoElectronico}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.correoElectronico ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Ingrese el correo electrónico"
                                /* required */
                                />
                            </div>
                        </div>
                    </>
                )}

                {(formData.actividadesDentroPanama === 'SiRequieroSociedadPrimero' || formData.actividadesDentroPanama === 'SiYaTengoLocal') && (
                    <>
                        <div className="mt-4">
                            <label className="text-white block mb-2">Detalle las Actividades que va a realizar (actividad comercial)</label>

                            <div className="mt-2">
                                <label className="text-white block mb-2">Actividad #1</label>
                                <input
                                    ref={formRefs.actividad1}
                                    type="text"
                                    name="actividad1"
                                    value={formData.actividad1}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.actividad1 ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Ingrese la actividad comercial"
                                /* required */
                                />
                            </div>

                            <div className="mt-4">
                                <label className="text-white block mb-2">Actividad #2</label>
                                <input
                                    ref={formRefs.actividad2}
                                    type="text"
                                    name="actividad2"
                                    value={formData.actividad2}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.actividad2 ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Ingrese la segunda actividad"
                                />
                            </div>

                            <div className="mt-4">
                                <label className="text-white block mb-2">Actividad #3</label>
                                <input
                                    ref={formRefs.actividad3}
                                    type="text"
                                    name="actividad3"
                                    value={formData.actividad3}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.actividad3 ? 'border-2 border-red-500' : ''}`}
                                    placeholder="Ingrese la tercera actividad"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-white font-bold">Contador</h3>
                            <p className="text-gray-400 text-sm">
                                La Dirección General de Ingresos requiere incluir quién es el contador que lleva los libros de la empresa.
                            </p>
                        </div>

                        <div className="mt-4">
                            <label className="text-white block mb-2">¿Mantiene un contador?</label>
                            <select
                                name="mantieneContador"
                                value={formData.mantieneContador}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-800 text-white rounded-lg"
                            >
                                <option value="Si">Sí</option>
                                <option value="No">No</option>
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
                                            ref={formRefs.nombreContador}
                                            type="text"
                                            name="nombreContador"
                                            value={formData.nombreContador}
                                            onChange={handleChange}
                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.nombreContador ? 'border-2 border-red-500' : ''}`}
                                            placeholder="Ingrese el nombre del contador"
                                        /* required */
                                        />
                                    </div>

                                    <div>
                                        <label className="text-white block mb-2">Idoneidad</label>
                                        <input
                                            ref={formRefs.idoneidadContador}
                                            type="text"
                                            name="idoneidadContador"
                                            value={formData.idoneidadContador}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                            placeholder="Ingrese la idoneidad del contador"
                                        /* required */
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="text-white block mb-2">Teléfono</label>
                                        <input
                                            ref={formRefs.telefonoContador}
                                            type="text"
                                            name="telefonoContador"
                                            value={formData.telefonoContador}
                                            onChange={handleChange}
                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.telefonoContador ? 'border-2 border-red-500' : ''}`}
                                            placeholder="Ingrese el teléfono del contador"
                                        /* required */
                                        />
                                    </div>

                                    <div>
                                        <label className="text-white block mb-2">Correo Electrónico</label>
                                        <input
                                            ref={formRefs.correoContador}
                                            type="email"
                                            name="correoContador"
                                            value={formData.correoContador}
                                            onChange={handleChange}
                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.correoContador ? 'border-2 border-red-500' : ''}`}
                                            placeholder="Ingrese el correo electrónico del contador"
                                        /* required */
                                        />
                                    </div>
                                </div>

                            </>
                        )}

                        {formData.mantieneContador === 'No' && (
                            <>
                                <div className="mt-4">
                                    <p className="text-white font-bold">Le prestamos los servicios de inclusión de contador para la DGI. El costo es de US$200.00. El costo no incluye los servicios de documentación contable ni declaración de renta. Incluye el servicio anual de contador como contacto ante la Dirección General de Ingresos.</p>
                                </div>
                            </>
                        )}

                        <div className="mt-4">
                            <h3 className="text-white font-bold">Registro Único de Contribuyente</h3>
                            <p className="text-gray-400 text-sm">
                                * Adjuntar copia de factura de agua, luz o teléfono para los fines de confirmación del domicilio por parte de la Dirección General de Ingresos.
                                Este requisito es obligatorio para las sociedades que van a obtener Aviso de Operación y ya tiene local. Para las demás, es opcional incluir la
                                información de cuál sería la dirección de la empresa.
                            </p>
                            <input
                                type="file"
                                name="archivoRUC"
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-800 text-white rounded-lg"
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-white block mb-2">¿Dónde va a mantener los registros contables de la sociedad?</label>
                            <select
                                name="registrosContables"
                                value={formData.registrosContables}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-800 text-white rounded-lg"
                            >
                                <option value="Oficina Agente Residente">En las Oficinas del Agente Residente de la Sociedad</option>
                                <option value="Otra">Otra</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <label className="text-white block mb-2">¿Desea servicio de Dirección Comercial?</label>
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="servicioDireccionComercial"
                                    name="servicioDireccionComercial"
                                    checked={formData.servicioDireccionComercial}
                                    onChange={(e) => setFormData({ ...formData, servicioDireccionComercial: e.target.checked })}
                                    className="mr-3"
                                />
                                <label htmlFor="servicioDireccionComercial" className="text-white">
                                    <span className="text-sm">
                                        Le brindamos servicio de dirección comercial en caso de que su sociedad lo requiera, sin embargo, no ejecutamos ni somos parte de la ejecución
                                        de sus actividades comerciales. Si desea este servicio, se le adicionará un costo anual de 250.00 dólares.
                                    </span>
                                </label>
                            </div>
                        </div>
                    </>
                )}

                {formData.actividadesDentroPanama === 'No' && (
                    <>
                        <div className="mt-4">
                            <h3 className="text-white font-bold">Favor confirme las actividades de la sociedad:</h3>
                            <div className="mt-2">
                                <label className="text-white block mb-2">Tipo de Actividades</label>
                                <select
                                    name="tipoActividades"
                                    value={formData.tipoActividades}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-800 text-white rounded-lg"
                                >
                                    <option value="offshore">Actividades comerciales offshore</option>
                                    <option value="tenedoraActivos">Tenedora de activos</option>
                                </select>
                            </div>
                        </div>


                        {/* Mostrar los campos si se selecciona "Actividades comerciales offshore" */}
                        {formData.tipoActividades === 'offshore' && (
                            <>
                                <div className="mt-4">
                                    <label className="text-white block mb-2">Detalle las actividades comerciales:</label>

                                    <div className="mt-2">
                                        <label className="text-white block mb-2">Actividad #1</label>
                                        <input
                                            ref={formRefs.actividadOffshore1}
                                            type="text"
                                            name="actividadOffshore1"
                                            value={formData.actividadOffshore1}
                                            onChange={handleChange}
                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.actividadOffshore1 ? 'border-2 border-red-500' : ''}`}
                                            placeholder="Ingrese la primera actividad comercial"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="text-white block mb-2">Actividad #2</label>
                                        <input
                                            ref={formRefs.actividadOffshore2}
                                            type="text"
                                            name="actividadOffshore2"
                                            value={formData.actividadOffshore2}
                                            onChange={handleChange}
                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.actividadOffshore2 ? 'border-2 border-red-500' : ''}`}
                                            placeholder="Ingrese la segunda actividad comercial"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="text-white block mb-2">Países principales donde ejecutará las actividades comerciales:</label>
                                        <textarea
                                            ref={formRefs.paisesActividadesOffshore}
                                            name="paisesActividadesOffshore"
                                            value={formData.paisesActividadesOffshore}
                                            onChange={handleChange}
                                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${fieldErrors.paisesActividadesOffshore ? 'border-2 border-red-500' : ''}`}
                                            placeholder="Ingrese los países principales"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Mostrar las opciones de checkbox para "Tenedora de activos" */}
                        {formData.tipoActividades === 'tenedoraActivos' && (
                            <>
                                <div className="mt-4">
                                    <h3 className="text-white font-bold">Seleccione una o más opciones:</h3>
                                    <div className="flex flex-col space-y-2 mt-2">
                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id="vehiculoInversion"
                                                name="actividadTenedora"
                                                value="vehiculoInversion"
                                                checked={Array.isArray(formData.actividadTenedora) && formData.actividadTenedora.includes('vehiculoInversion')}
                                                onChange={handleCheckboxChange}
                                                className="mr-3"
                                            />
                                            <label htmlFor="vehiculoInversion" className="text-white">Vehículo de Inversión</label>
                                        </div>

                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id="portafolioBienesRaices"
                                                name="actividadTenedora"
                                                value="portafolioBienesRaices"
                                                checked={Array.isArray(formData.actividadTenedora) && formData.actividadTenedora.includes('portafolioBienesRaices')}
                                                onChange={handleCheckboxChange}
                                                className="mr-3"
                                            />
                                            <label htmlFor="portafolioBienesRaices" className="text-white">Portafolio de Bienes Raíces</label>
                                        </div>

                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id="tenedoraActivos"
                                                name="actividadTenedora"
                                                value="tenedoraActivos"
                                                checked={Array.isArray(formData.actividadTenedora) && formData.actividadTenedora.includes('tenedoraActivos')}
                                                onChange={handleCheckboxChange}
                                                className="mr-3"
                                            />
                                            <label htmlFor="tenedoraActivos" className="text-white">Tenedora de Activos</label>
                                        </div>

                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id="grupoEconomico"
                                                name="actividadTenedora"
                                                value="grupoEconomico"
                                                checked={Array.isArray(formData.actividadTenedora) && formData.actividadTenedora.includes('grupoEconomico')}
                                                onChange={handleCheckboxChange}
                                                className="mr-3"
                                            />
                                            <label htmlFor="grupoEconomico" className="text-white">Como parte de una estructura o grupo económico</label>
                                        </div>

                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                id="duenoNaveAeronave"
                                                name="actividadTenedora"
                                                value="duenoNaveAeronave"
                                                checked={Array.isArray(formData.actividadTenedora) && formData.actividadTenedora.includes('duenoNaveAeronave')}
                                                onChange={handleCheckboxChange}
                                                className="mr-3"
                                            />
                                            <label htmlFor="duenoNaveAeronave" className="text-white">Dueño de Nave o Aeronave</label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                    </>
                )}
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
            </form>
        </div>
    );
};

export default Actividades;
