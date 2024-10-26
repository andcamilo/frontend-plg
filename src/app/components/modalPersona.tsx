import React, { useState, useContext, useRef } from 'react';
import AppStateContext from '@context/sociedadesContext';
import AppStateContextFundacion from '@context/fundacionContext';
import axios from 'axios';
import Swal from 'sweetalert2';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children?: React.ReactNode; // Para que puedas pasar cualquier contenido al modal
}

const ModalPersona: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const sociedadContext = useContext(AppStateContext);
    const fundacionContext = useContext(AppStateContextFundacion);

    // Verificar si estamos trabajando con sociedad o fundación
    const context = sociedadContext?.store.solicitudId ? sociedadContext : fundacionContext;
    
    if (!context) {
        throw new Error('El contexto debe estar dentro de un proveedor de contexto (AppStateProvider o FundacionProvider)');
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        tipoPersona: 'Persona Natural',
        nombreApellido: '',
        sexo: 'Femenino',
        nacionalidad: 'Panamá',
        cedulaPasaporte: '',
        paisNacimiento: 'Panamá',
        fechaNacimiento: '',
        direccion: '',
        paisResidencia: 'Panamá',
        profesion: '',
        telefono: '',
        email: '',
        esPoliticamenteExpuesta: 'No',
        personaExpuestaFecha: '',
        personaExpuestaCargo: '',

        // Persona Jurídica  
        nombreJuridico: '',
        paisJuridico: 'Panamá',
        registroJuridico: '',

        // Referencias bancarias
        bancoNombre: '',
        bancoTelefono: '',
        bancoEmail: '',

        // Referencias comerciales
        comercialNombre: '',
        comercialTelefono: '',
        comercialEmail: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [mostrarBeneficiarios, setMostrarBeneficiarios] = useState(false);
    const [beneficiarios, setBeneficiarios] = useState([
        {
            nombreApellido: '',
            sexo: 'Femenino',
            cedulaPasaporte: '',
            nacionalidad: 'Panamá',
            paisNacimiento: 'Panamá',
            fechaNacimiento: '',
            direccion: '',
            paisResidencia: 'Panamá',
            profesion: '',
            telefono: '',
            email: '',
            esPoliticamenteExpuesta: 'No',
        },
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        // Limpiar el error del campo al escribir si ya no está vacío
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: false,
        }));
    };


    const handleBeneficiarioChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newBeneficiarios = [...beneficiarios];
        newBeneficiarios[index] = {
            ...newBeneficiarios[index],
            [name]: value,
        };
        setBeneficiarios(newBeneficiarios);

        // Limpiar el error del campo si ya no está vacío
        const newErrorsBeneficiarios = [...errorsBeneficiarios];
        newErrorsBeneficiarios[index] = {
            ...newErrorsBeneficiarios[index],
            [name]: value ? false : true,
        };
        setErrorsBeneficiarios(newErrorsBeneficiarios);
    };

    const agregarBeneficiario = () => {
        setMostrarBeneficiarios(true);

        // Verifica si el último beneficiario tiene los campos requeridos llenos
        if (beneficiarios.length === 0 || beneficiarios[beneficiarios.length - 1].nombreApellido !== '') {
            setBeneficiarios([...beneficiarios, {
                nombreApellido: '',
                sexo: 'Femenino',
                cedulaPasaporte: '',
                nacionalidad: 'Panamá',
                paisNacimiento: 'Panamá',
                fechaNacimiento: '',
                direccion: '',
                paisResidencia: 'Panamá',
                profesion: '',
                telefono: '',
                email: '',
                esPoliticamenteExpuesta: 'No',
            }]);

            // Agregar una entrada vacía de errores para el nuevo beneficiario
            setErrorsBeneficiarios([...errorsBeneficiarios, {
                nombreApellido: false,
                cedulaPasaporte: false,
                fechaNacimiento: false,
                direccion: false,
                profesion: false,
                telefono: false,
                email: false,
            }]);
        }
    };

    const eliminarBeneficiario = (index: number) => {
        const nuevosBeneficiarios = [...beneficiarios];
        nuevosBeneficiarios.splice(index, 1);

        const nuevosErroresBeneficiarios = [...errorsBeneficiarios];
        nuevosErroresBeneficiarios.splice(index, 1); // Eliminar también los errores del beneficiario correspondiente

        setBeneficiarios(nuevosBeneficiarios);
        setErrorsBeneficiarios(nuevosErroresBeneficiarios);
    };


    const [errors, setErrors] = useState({
        nombreJuridico: false,
        nombreApellido: false,
        cedulaPasaporte: false,
        fechaNacimiento: false,
        direccion: false,
        profesion: false,
        telefono: false,
        email: false,
        bancoNombre: false,
        bancoTelefono: false,
        bancoEmail: false,
        comercialNombre: false,
        comercialTelefono: false,
        comercialEmail: false,
    });

    const nombreJuridicoRef = useRef<HTMLInputElement>(null);
    const nombreApellidoRef = useRef<HTMLInputElement>(null);
    const cedulaPasaporteRef = useRef<HTMLInputElement>(null);
    const fechaNacimientoRef = useRef<HTMLInputElement>(null);
    const direccionRef = useRef<HTMLInputElement>(null);
    const profesionRef = useRef<HTMLInputElement>(null);
    const telefonoRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const bancoNombreRef = useRef<HTMLInputElement>(null);
    const bancoTelefonoRef = useRef<HTMLInputElement>(null);
    const bancoEmailRef = useRef<HTMLInputElement>(null);
    const comercialNombreRef = useRef<HTMLInputElement>(null);
    const comercialTelefonoRef = useRef<HTMLInputElement>(null);
    const comercialEmailRef = useRef<HTMLInputElement>(null);

    const fieldValidations = [
        { field: "nombreApellido", ref: nombreApellidoRef, errorMessage: "Por favor, ingrese el nombre y apellido." },
        { field: "cedulaPasaporte", ref: cedulaPasaporteRef, errorMessage: "Por favor, ingrese el número de cédula o pasaporte." },
        { field: "fechaNacimiento", ref: fechaNacimientoRef, errorMessage: "Por favor, ingrese la fecha de nacimiento." },
        { field: "direccion", ref: direccionRef, errorMessage: "Por favor, ingrese la dirección." },
        { field: "profesion", ref: profesionRef, errorMessage: "Por favor, ingrese su profesión." },
        { field: "telefono", ref: telefonoRef, errorMessage: "Por favor, ingrese el número de teléfono." },
        { field: "email", ref: emailRef, errorMessage: "Por favor, ingrese el correo electrónico." },
    ];

    const validateFields = () => {
        let isValid = true;

        // Validar que la persona tenga más de 18 años
        if (formData.fechaNacimiento !== "" && formData.nombreApellido !== "" && formData.cedulaPasaporte !== "") {
            const today = new Date();
            const birthDate = new Date(formData.fechaNacimiento);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();
            const dayDifference = today.getDate() - birthDate.getDate();

            // Restar un año si la persona aún no ha cumplido años este año
            if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
                age--;
            }

            if (age < 18) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "La persona debe ser mayor de 18 años.",
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

                setErrors((prevErrors) => ({ ...prevErrors, fechaNacimiento: true }));
                if (fechaNacimientoRef.current) {
                    fechaNacimientoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    fechaNacimientoRef.current.focus();
                }
                isValid = false;
            } else {
                setErrors((prevErrors) => ({ ...prevErrors, fechaNacimiento: false }));
            }
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, fechaNacimiento: true }));
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, ingrese la fecha de nacimiento.",
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
            isValid = false;
        }

        if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
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
                    timerProgressBar: 'custom-swal-timer-bar',
                },
            });

            setErrors((prevErrors) => ({ ...prevErrors, email: true }));
            if (emailRef.current) {
                emailRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                emailRef.current.focus();
            }
            isValid = false;
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, email: false }));
        }

        // Resto de las validaciones
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
                        timerProgressBar: 'custom-swal-timer-bar',
                    },
                });

                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }

                isValid = false;
                break;
            } else {
                setErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
            }
        }

        return isValid;
    };


    const [errorsBeneficiarios, setErrorsBeneficiarios] = useState(
        beneficiarios.map(() => ({
            nombreApellido: false,
            cedulaPasaporte: false,
            fechaNacimiento: false,
            direccion: false,
            profesion: false,
            telefono: false,
            email: false,
        }))
    );

    const validateBeneficiarios = () => {
        let isValid = true;
        const newErrorsBeneficiarios = [...errorsBeneficiarios];

        if (formData.tipoPersona !== 'Persona Jurídica' || !mostrarBeneficiarios) {
            // No validar beneficiarios si no es Persona Jurídica o no ha agregado beneficiarios
            return true;
        }

        beneficiarios.forEach((beneficiario, index) => {
            if (!beneficiario.nombreApellido) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, ingrese el nombre y apellido del Beneficiario ${index + 1}.`,
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

                const inputField = document.querySelector(`#beneficiario-${index}-nombreApellido`);
                if (inputField instanceof HTMLElement) {
                    inputField.scrollIntoView({ behavior: "smooth", block: "center" });
                    inputField.focus();
                }
                newErrorsBeneficiarios[index].nombreApellido = true;
                isValid = false;
                return;
            }

            if (!beneficiario.cedulaPasaporte) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, ingrese la cédula o pasaporte del Beneficiario ${index + 1}.`,
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

                const inputField = document.querySelector(`#beneficiario-${index}-cedulaPasaporte`);
                if (inputField instanceof HTMLElement) {
                    inputField.scrollIntoView({ behavior: "smooth", block: "center" });
                    inputField.focus();
                }
                newErrorsBeneficiarios[index].cedulaPasaporte = true;
                isValid = false;
                return;
            }

            if (!beneficiario.fechaNacimiento) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, ingrese la fecha de nacimiento del Beneficiario ${index + 1}.`,
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

                const inputField = document.querySelector(`#beneficiario-${index}-fechaNacimiento`);
                if (inputField instanceof HTMLElement) {
                    inputField.scrollIntoView({ behavior: "smooth", block: "center" });
                    inputField.focus();
                }
                newErrorsBeneficiarios[index].fechaNacimiento = true;
                isValid = false;
                return;
            }

            if (!beneficiario.direccion) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, ingrese la dirección del Beneficiario ${index + 1}.`,
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

                const inputField = document.querySelector(`#beneficiario-${index}-direccion`);
                if (inputField instanceof HTMLElement) {
                    inputField.scrollIntoView({ behavior: "smooth", block: "center" });
                    inputField.focus();
                }
                newErrorsBeneficiarios[index].direccion = true;
                isValid = false;
                return;
            }

            if (!beneficiario.profesion) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, ingrese la profesión del Beneficiario ${index + 1}.`,
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

                const inputField = document.querySelector(`#beneficiario-${index}-profesion`);
                if (inputField instanceof HTMLElement) {
                    inputField.scrollIntoView({ behavior: "smooth", block: "center" });
                    inputField.focus();
                }
                newErrorsBeneficiarios[index].profesion = true;
                isValid = false;
                return;
            }

            if (!beneficiario.telefono) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, ingrese el teléfono del Beneficiario ${index + 1}.`,
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

                const inputField = document.querySelector(`#beneficiario-${index}-telefono`);
                if (inputField instanceof HTMLElement) {
                    inputField.scrollIntoView({ behavior: "smooth", block: "center" });
                    inputField.focus();
                }
                newErrorsBeneficiarios[index].telefono = true;
                isValid = false;
                return;
            }

            if (!beneficiario.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(beneficiario.email)) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Por favor, ingrese un correo electrónico válido para el Beneficiario ${index + 1}.`,
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

                const inputField = document.querySelector(`#beneficiario-${index}-email`);
                if (inputField instanceof HTMLElement) {
                    inputField.scrollIntoView({ behavior: "smooth", block: "center" });
                    inputField.focus();
                }
                newErrorsBeneficiarios[index].email = true;
                isValid = false;
                return;
            }
        });

        setErrorsBeneficiarios(newErrorsBeneficiarios); // Actualiza el estado con los errores
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateFields()) {
            setIsLoading(false);
            return;
        }

        if (!validateBeneficiarios()) {
            setIsLoading(false);
            return;
        }

        try {
            // Crear el payload para enviar a la API
            const updatePayload = {
                solicitudId: store.solicitudId, // Identificador de la solicitud desde el contexto

                tipoPersona: formData.tipoPersona,
                nombreApellido: formData.nombreApellido,
                sexo: formData.sexo,
                nacionalidad: formData.nacionalidad,
                cedulaPasaporte: formData.cedulaPasaporte,
                paisNacimiento: formData.paisNacimiento,
                fechaNacimiento: formData.fechaNacimiento,
                direccion: formData.direccion,
                paisResidencia: formData.paisResidencia,
                profesion: formData.profesion,
                telefono: formData.telefono,
                email: formData.email,
                esPoliticamenteExpuesta: formData.esPoliticamenteExpuesta,
                personaExpuestaFecha: formData.personaExpuestaFecha,
                personaExpuestaCargo: formData.personaExpuestaCargo,
                beneficiarios,

                personaJuridica: {
                    nombreJuridico: formData.nombreJuridico,
                    paisJuridico: formData.paisJuridico,
                    registroJuridico: formData.registroJuridico,
                },

                referenciasBancarias: {
                    bancoNombre: formData.bancoNombre,
                    bancoTelefono: formData.bancoTelefono,
                    bancoEmail: formData.bancoEmail,
                },

                referenciasComerciales: {
                    comercialNombre: formData.comercialNombre,
                    comercialTelefono: formData.comercialTelefono,
                    comercialEmail: formData.comercialEmail,
                },

            };

            // Enviar los datos a la API para actualizar la solicitud
            const response = await axios.post('/api/create-person', updatePayload);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Persona creada',
                    text: 'Persona guardada correctamente.',
                    timer: 2000,  // Cierra la alerta automáticamente después de 2 segundos
                    showConfirmButton: false,  // Oculta el botón "OK"
                }).then(() => {
                    onClose();
                });
            } else {
                throw new Error('Error al crear la persona.');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            alert('Hubo un problema al crear la persona. Por favor, inténtelo de nuevo más tarde.');
        } finally {
            setIsLoading(false); // Desactivar el estado de carga
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg w-3/4 max-h-screen overflow-y-auto relative">
                <button className="text-white absolute top-2 right-4" onClick={onClose}>
                    X
                </button>

                <h2 className="text-white text-2xl font-bold mb-4">Personas</h2>
                <hr></hr>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Seleccionar */}
                        <div className="col-span-2">
                            <label className="text-white"><small>Seleccionar:</small></label>
                            <select
                                name="tipoPersona"
                                value={formData.tipoPersona}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            >
                                <option value="Persona Natural">Persona Natural</option>
                                <option value="Persona Jurídica">Persona Jurídica</option>
                            </select>
                        </div>

                        {/* Mostrar campos adicionales si es Persona Jurídica */}
                        {formData.tipoPersona === 'Persona Jurídica' && (
                            <>
                                {/* Nombre de la Persona Jurídica / Sociedad */}
                                <div className="col-span-2">
                                    <label className="text-white"><small>Nombre de la persona jurídica / sociedad</small></label>
                                    <input
                                        ref={nombreJuridicoRef}
                                        type="text"
                                        name="nombreJuridico"
                                        value={formData.nombreJuridico || ''}
                                        onChange={handleChange}
                                        className={`w-full p-2 border ${errors.nombreJuridico ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                        placeholder="Nombre de la persona jurídica"
                                    />
                                </div>

                                {/* País de la Persona Jurídica */}
                                <div className="col-span-1">
                                    <label className="text-white"><small>País de la persona jurídica</small></label>
                                    <select
                                        name="paisJuridico"
                                        value={formData.paisJuridico || 'Panamá'}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                    >
                                        {getCountries().map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Número de Registro de la Persona Jurídica */}
                                <div className="col-span-1">
                                    <label className="text-white"><small>Número de registro</small></label>
                                    <input
                                        type="text"
                                        name="registroJuridico"
                                        value={formData.registroJuridico || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                        placeholder="Número de registro"
                                    />
                                </div>

                                {/* Título de Información del Representante Legal */}
                                <div className="col-span-2">
                                    <h2 className="text-white text-2xl font-bold mb-2 mt-4">Información del Representante Legal</h2>
                                </div>
                            </>
                        )}

                        {/* Nombre y apellido completo */}
                        <div className="col-span-1">
                            <label className="text-white">Nombre y apellido completo</label>
                            <input
                                ref={nombreApellidoRef}
                                type="text"
                                name="nombreApellido"
                                value={formData.nombreApellido}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.nombreApellido ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                placeholder="Nombre completo"
                            />
                        </div>

                        {/* Sexo */}
                        <div className="col-span-1">
                            <label className="text-white"><small>Sexo</small></label>
                            <select
                                name="sexo"
                                value={formData.sexo}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            >
                                <option value="Femenino">Femenino</option>
                                <option value="Masculino">Masculino</option>
                            </select>
                        </div>

                        {/* Nacionalidad */}
                        <div className="col-span-1">
                            <label className="text-white"><small>Nacionalidad</small></label>
                            <select
                                name="nacionalidad"
                                value={formData.nacionalidad}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            >
                                {getCountries().map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Número de cédula o Pasaporte */}
                        <div className="col-span-1">
                            <label className="text-white">Cédula o Pasaporte</label>
                            <input
                                ref={cedulaPasaporteRef}
                                type="text"
                                name="cedulaPasaporte"
                                value={formData.cedulaPasaporte}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.cedulaPasaporte ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                placeholder="Cédula o Pasaporte"
                            />
                        </div>

                        {/* País de Nacimiento */}
                        <div className="col-span-1">
                            <label className="text-white"><small>País de Nacimiento</small></label>
                            <select
                                name="paisNacimiento"
                                value={formData.paisNacimiento}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            >
                                {getCountries().map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Fecha de Nacimiento */}
                        <div className="col-span-1">
                            <label className="text-white">Fecha de Nacimiento</label>
                            <input
                                ref={fechaNacimientoRef}
                                type="date"
                                name="fechaNacimiento"
                                value={formData.fechaNacimiento}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.fechaNacimiento ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                            />
                        </div>

                        {/* Dirección */}
                        <div className="col-span-2">
                            <label className="text-white">Dirección</label>
                            <input
                                ref={direccionRef}
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.direccion ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                placeholder="Dirección"
                            />
                        </div>

                        {/* País de Residencia */}
                        <div className="col-span-1">
                            <label className="text-white"><small>País de Residencia</small></label>
                            <select
                                name="paisResidencia"
                                value={formData.paisResidencia}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            >
                                {getCountries().map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Profesión */}
                        <div className="col-span-1">
                            <label className="text-white"><small>Profesión</small></label>
                            <input
                                ref={profesionRef}
                                type="text"
                                name="profesion"
                                value={formData.profesion}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.profesion ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                placeholder="Profesión"
                            /* required */
                            />
                        </div>
                        {/* Teléfono */}
                        <div className="col-span-1">
                            <label className="text-white">Teléfono</label>
                            <input
                                ref={telefonoRef}
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.telefono ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                placeholder="Teléfono"
                            />
                        </div>
                        {/* Email */}
                        <div className="col-span-1">
                            <label className="text-white">Email</label>
                            <input
                                ref={emailRef}
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                placeholder="Email"
                            />
                        </div>
                        {/* Persona políticamente expuesta */}
                        <div className="col-span-2">
                            <label className="text-white"><small>Es una persona políticamente expuesta:</small></label>
                            <select
                                name="esPoliticamenteExpuesta"
                                value={formData.esPoliticamenteExpuesta}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            >
                                <option value="No">No</option>
                                <option value="Si">Sí</option>
                            </select>
                        </div>
                        <p className="col-span-2">
                            * La persona expuesta políticamente son las personas nacionales o extranjeras que cumplen funciones públicas destacadas de alto nivel o con mando y jurisdicción en un Estado, como (pero sin limitarse) los jefes de Estado o de un gobierno, los políticos de alto perfil, los funcionarios gubernamentales, judiciales o militares de alta jerarquía, los ejecutivos de empresas o corporaciones estatales, los funcionarios públicos, que ocupen posiciones de elección popular, entre otros que ejerzan la toma de decisiones en las entidades públicas; personas que cumplen o a quienes se les han confiado funciones importantes por una organización institucional, como los miembros de la alta gerencia, es decir, directores, subdirectores y miembros de la junta directiva o funciones equivalentes.
                        </p>
                        {/* Mostrar campos adicionales si es Persona políticamente expuesta */}
                        {formData.esPoliticamenteExpuesta === 'Si' && (
                            <>
                                <div className="col-span-1">
                                    <label className="text-white"><small>Indicar qué cargo ocupa u ocupó</small></label>
                                    <input
                                        type="text"
                                        name="personaExpuestaCargo"
                                        value={formData.personaExpuestaCargo || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                        placeholder="Nombre de la persona jurídica"
                                    />
                                </div>

                                <div className="col-span-1">
                                    <label className="text-white"><small>En qué fecha</small></label>
                                    <input
                                        type="date"
                                        name="personaExpuestaFecha"
                                        value={formData.personaExpuestaFecha}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                    /* required */
                                    />
                                </div>
                            </>
                        )}

                        <hr className="col-span-2"></hr>
                        <h2 className="text-white text-2xl font-bold mb-4">Referencias Bancarias</h2>
                        <hr className="col-span-2"></hr>

                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Nombre del Banco */}
                            <div className="col-span-1">
                                <label className="text-white"><small>Nombre del Banco</small></label>
                                <input
                                    type="text"
                                    name="bancoNombre"
                                    value={formData.bancoNombre}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                    placeholder="Nombre del Banco"
                                /* required */
                                />
                            </div>
                            {/* Teléfono */}
                            <div className="col-span-1">
                                <label className="text-white"><small>Teléfono</small></label>
                                <input
                                    type="tel"
                                    name="bancoTelefono"
                                    value={formData.bancoTelefono}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                    placeholder="Teléfono"
                                /* required */
                                />
                            </div>
                            {/* Email */}
                            <div className="col-span-1">
                                <label className="text-white"><small>Email</small></label>
                                <input
                                    type="email"
                                    name="bancoEmail"
                                    value={formData.bancoEmail}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                    placeholder="Email"
                                /* required */
                                />
                            </div>
                        </div>
                        <p className="col-span-2">
                            * El Teléfono y Correo Electrónico que deben colocar es el de su enlace en el banco de tenerlo o el oficial del banco que ve su cuenta.
                        </p>
                        <hr className="col-span-2"></hr>
                        <h2 className="text-white text-2xl font-bold mb-4">Referencias Comerciales</h2>
                        <hr className="col-span-2"></hr>
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Nombre */}
                            <div className="col-span-1">
                                <label className="text-white"><small>Nombre</small></label>
                                <input
                                    type="text"
                                    name="comercialNombre"
                                    value={formData.comercialNombre}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                    placeholder="Nombre"
                                /* required */
                                />
                            </div>
                            {/* Teléfono */}
                            <div className="col-span-1">
                                <label className="text-white"><small>Teléfono</small></label>
                                <input
                                    type="tel"
                                    name="comercialTelefono"
                                    value={formData.comercialTelefono}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                    placeholder="Teléfono"
                                /* required */
                                />
                            </div>
                            {/* Email */}
                            <div className="col-span-1">
                                <label className="text-white"><small>Email</small></label>
                                <input
                                    type="email"
                                    name="comercialEmail"
                                    value={formData.comercialEmail}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                    placeholder="Email"
                                /* required */
                                />
                            </div>
                        </div>
                        <p className="col-span-2">
                            * Aquí debes poner el nombre y contacto de cualquier referencia comercial, si no se mantiene una referencia comercial porque no ha ejecutado actividades comerciales, según la ocupación, puede dejarlo en blanco.
                        </p>

                        <div className="col-span-2">
                            <label className="text-white"><small>Adjuntar copia de pasaporte o cédula *</small></label>
                            <input
                                type="file"
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-white"><small>Adjuntar copia de pasaporte o cédula *</small></label>
                            <input
                                type="file"
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            />
                        </div>

                        <p className="col-span-2">
                            * Es necesario adjuntar el pasaporte o cédula de identidad de la persona.
                        </p>

                        {/* Renderizar cada conjunto de campos para los beneficiarios */}
                        {mostrarBeneficiarios && beneficiarios.map((beneficiario, index) => (
                            <div key={index} className="col-span-2">
                                <hr className="col-span-2 mt-4"></hr>
                                <h2 className="text-white text-2xl font-bold mb-4 mt-4">Beneficiario Final {index + 1}</h2>
                                <hr className="col-span-2"></hr>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

                                    {/* Nombre y apellido completo */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>Nombre y apellido completo</small></label>
                                        <input
                                            id={`beneficiario-${index}-nombreApellido`}
                                            type="text"
                                            name="nombreApellido"
                                            value={beneficiario.nombreApellido}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className={`w-full p-2 border ${errorsBeneficiarios[index].nombreApellido ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                            placeholder="Nombre completo"
                                        />
                                    </div>

                                    {/* Sexo */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>Sexo</small></label>
                                        <select
                                            id={`beneficiario-${index}-sexo`}
                                            name="sexo"
                                            value={beneficiario.sexo}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                        >
                                            <option value="Femenino">Femenino</option>
                                            <option value="Masculino">Masculino</option>
                                        </select>
                                    </div>

                                    {/* Número de cédula o Pasaporte */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>Cédula o Pasaporte</small></label>
                                        <input
                                            id={`beneficiario-${index}-cedulaPasaporte`}
                                            type="text"
                                            name="cedulaPasaporte"
                                            value={beneficiario.cedulaPasaporte}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className={`w-full p-2 border ${errorsBeneficiarios[index].cedulaPasaporte ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                            placeholder="Cédula o Pasaporte"
                                        />
                                    </div>

                                    {/* Nacionalidad */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>Nacionalidad</small></label>
                                        <select
                                            id={`beneficiario-${index}-nacionalidad`}
                                            name="nacionalidad"
                                            value={beneficiario.nacionalidad}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                        >
                                            {getCountries().map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* País de Nacimiento */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>País de Nacimiento</small></label>
                                        <select
                                            id={`beneficiario-${index}-paisNacimiento`}
                                            name="paisNacimiento"
                                            value={beneficiario.paisNacimiento}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                        >
                                            {getCountries().map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Fecha de Nacimiento */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>Fecha de Nacimiento</small></label>
                                        <input
                                            id={`beneficiario-${index}-fechaNacimiento`}
                                            type="date"
                                            name="fechaNacimiento"
                                            value={beneficiario.fechaNacimiento}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className={`w-full p-2 border ${errorsBeneficiarios[index].fechaNacimiento ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                        />
                                    </div>

                                    {/* Dirección */}
                                    <div className="col-span-2">
                                        <label className="text-white"><small>Dirección / Address</small></label>
                                        <input
                                            id={`beneficiario-${index}-direccion`}
                                            type="text"
                                            name="direccion"
                                            value={beneficiario.direccion}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className={`w-full p-2 border ${errorsBeneficiarios[index].direccion ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                            placeholder="Dirección"
                                        />
                                    </div>

                                    {/* País de Residencia */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>País de Residencia</small></label>
                                        <select
                                            id={`beneficiario-${index}-paisResidencia`}
                                            name="paisResidencia"
                                            value={beneficiario.paisResidencia}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                        >
                                            {getCountries().map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Profesión */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>Profesión</small></label>
                                        <input
                                            id={`beneficiario-${index}-profesion`}
                                            type="text"
                                            name="profesion"
                                            value={beneficiario.profesion}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className={`w-full p-2 border ${errorsBeneficiarios[index].profesion ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                            placeholder="Profesión"
                                        />
                                    </div>

                                    {/* Teléfono */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>Teléfono</small></label>
                                        <input
                                            id={`beneficiario-${index}-telefono`}
                                            type="tel"
                                            name="telefono"
                                            value={beneficiario.telefono}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className={`w-full p-2 border ${errorsBeneficiarios[index].telefono ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                            placeholder="Teléfono"
                                        />
                                    </div>

                                    {/* Correo Electrónico */}
                                    <div className="col-span-1">
                                        <label className="text-white"><small>Correo Electrónico</small></label>
                                        <input
                                            id={`beneficiario-${index}-email`}
                                            type="email"
                                            name="email"
                                            value={beneficiario.email}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className={`w-full p-2 border ${errorsBeneficiarios[index].email ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                                            placeholder="Email"
                                        />
                                    </div>

                                    {/* Persona políticamente expuesta */}
                                    <div className="col-span-2">
                                        <label className="text-white"><small>Es una persona políticamente expuesta:</small></label>
                                        <select
                                            id={`beneficiario-${index}-esPoliticamenteExpuesta`}
                                            name="esPoliticamenteExpuesta"
                                            value={beneficiario.esPoliticamenteExpuesta}
                                            onChange={(e) => handleBeneficiarioChange(index, e)}
                                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                        >
                                            <option value="No">No</option>
                                            <option value="Si">Sí</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2 mt-4">
                                        <label className="text-white"><small>Adjuntar copia de pasaporte o cédula *</small></label>
                                        <input
                                            type="file"
                                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                        />
                                    </div>

                                    {/* Botón para eliminar el beneficiario */}
                                    <div className="col-span-2 flex justify-end mt-2">
                                        <button
                                            type="button"
                                            className="w-full bg-red-500 text-white py-1 px-3 rounded-lg"
                                            onClick={() => eliminarBeneficiario(index)}
                                        >
                                            Eliminar Beneficiario
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}


                        {/* Botón Agregar Beneficiarios */}
                        {formData.tipoPersona === 'Persona Jurídica' && (
                            <div className="col-span-2 justify-end mt-4">
                                <button
                                    type="button"
                                    className="w-full bg-profile text-white py-2 px-4 rounded-lg"
                                    onClick={agregarBeneficiario}
                                >
                                    Agregar Beneficiarios
                                </button>
                            </div>
                        )}

                    </div>

                    <div className="flex justify-end mt-4 space-x-4">
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
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalPersona;
