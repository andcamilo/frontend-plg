import { useState, ChangeEvent, useEffect, useRef } from 'react';
import { FormDataPazSalvos } from '@/src/app/types/formDataPazSalvos';
import get from 'lodash/get';
import axios from 'axios';
import countryCodes from '@utils/countryCode';
import Swal from 'sweetalert2';
import { checkAuthToken } from "@utils/checkAuthToken";
import BannerPazsalvos from '@components/BannerPazsalvos';
import CountrySelect from '@components/CountrySelect';
import "@configuration/firebase";
import { initializeApp, getApps, getApp } from 'firebase/app';
import ReCAPTCHA from 'react-google-recaptcha';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import PaymentModal from '@/src/app/components/PaymentModal';
import RegisterPaymentForm from '@/src/app/components/RegisterPaymentForm';

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

export default function SolicitudPazSalvo() {
  const [formData, setFormData] = useState<FormDataPazSalvos>({
    nombreCompleto: "",
    email: "",
    cedulaPasaporte: "",
    telefono: "",
    telefonoCodigo: "PA",
    tipoConsulta: "Paz Salvo",
    tipoPazSalvo: "",
    terminosAceptados: false,
    notificaciones:false,
    cuenta: "",
    userId: "",
    soyPropietario: false,
    numeroCliente: "",
    tieneNumeroCliente: false,
    nacionalidad: "",
    numeroFinca: "",
    tomoRollo: "",
    documentoRedi: "",
    codigoUbicacion: "",
    ubicacionFinca: "",
    archivoCedulaImagenURL: "",
  });

  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [solicitudData, setSolicitudData] = useState<any>(null);
  const nombreCompletoRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const cedulaPasaporteRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const celularRef = useRef<HTMLInputElement>(null);
  const [cargoSinCliente, setCargoSinCliente] = useState(0);
  const [mostrarAdvertenciaCliente, setMostrarAdvertenciaCliente] = useState(false);
  const [archivoCedulaImagen, setArchivoCedulaImagen] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Payment modal and register payment modal logic
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRegisterPaymentModalOpen, setIsRegisterPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(25); // or calculate based on formData

  const handlePaymentClick = () => {
    setLoading(true);
    setIsPaymentModalOpen(true);
  };
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setLoading(false);
  };
 const handleSendAndPayLater = async () => {
  if (enviando) return;

  if (!terminosAceptados) {
    Swal.fire({
      icon: 'warning',
      title: 'Debes aceptar los términos y condiciones.',
      showConfirmButton: false,
      timer: 2500,
      background: '#2c2c3e',
      color: '#fff',
    });
    return;
  }

  if (!recaptchaToken) {
    Swal.fire({
      icon: 'warning',
      title: 'Por favor, completa el reCAPTCHA.',
      showConfirmButton: false,
      timer: 2500,
      background: '#2c2c3e',
      color: '#fff',
    });
    return;
  }

  const camposObligatorios = [
    'nombreCompleto',
    'email',
    'cedulaPasaporte',
    'telefono',
    'tipoConsulta',
    'tipoPazSalvo',
    'nacionalidad',
    'numeroFinca',
    'codigoUbicacion',
    'ubicacionFinca',
  ];

  for (const campo of camposObligatorios) {
    const valor = formData[campo];
    if (typeof valor === 'string' && valor.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: `El campo "${campo}" es obligatorio.`,
        showConfirmButton: false,
        timer: 2500,
        background: '#2c2c3e',
        color: '#fff',
      });
      return;
    }
  }

  setEnviando(true);

  try {
    const userData = checkAuthToken(); // verifica si está logueado
    const isLoggedIn = !!userData;

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
        timer: 2500,
        background: '#2c2c3e',
        color: '#fff',
      });
      return;
    } else if (!cuenta) {
      await sendCreateRequest("");
    }
  } catch (error) {
    console.error("API Error:", error);
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: "Hubo un problema verificando el correo. Por favor, inténtalo de nuevo más tarde.",
      showConfirmButton: false,
      timer: 1500,
      background: '#2c2c3e',
      color: '#fff',
    });
  } finally {
    setEnviando(false);
  }
};
  const handleSelectTipoSalvo = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      tipoPazSalvo: e.target.value,
      tieneNumeroCliente: false, // Resetea el estado al cambiar el tipo de paz y salvo
      numeroCliente: "", // Resetea el número de cliente al cambiar el tipo de paz y salvo
    }));

    const userData = checkAuthToken(); // obtiene datos si hay token válido


    if (userData) {
      const fetchUser = async () => {
        try {
          const response = await axios.get('/api/get-user-cuenta', {
            params: { userCuenta: userData.user_id },
          });
          const user = response.data;
          console.log(" usuario:", user);
          setFormData((prevData) => ({
            ...prevData,
            userId: get(user, "solicitud.id", ""),
            email: get(user, "solicitud.email", ""),
            nombreCompleto: get(user, "solicitud.nombre", ""),
            telefono: get(user, "solicitud.telefonoSolicita", ""),
            celular: get(user, "solicitud.telefonoSolicita", ""),
          }));
        } catch (error) {
          console.error('Failed to fetch solicitudes:', error);
        }
      };

      fetchUser();
    }
  }
  
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            setArchivoCedulaImagen(file);
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
    
  useEffect(() => {
    if (solicitudData) {
      setFormData((prev) => ({
        ...prev,
        nombreCompleto: solicitudData.nombreSolicita || "",
        email: solicitudData.emailSolicita || "",
        cedulaPasaporte: solicitudData.cedulaPasaporte || "",
        telefono: solicitudData.telefonoSolicita || "",
        telefonoCodigo: "PA",
        celular: solicitudData.celularSolicita || solicitudData.telefonoWhatsApp || "",
        celularCodigo: "PA",
        tipoConsulta: solicitudData.tipoConsulta || "Paz Salvo",
      }));
    }
  }, [solicitudData]);

  const [errors, setErrors] = useState({
    nombreCompleto: false,
    email: false,
    telefono: false,
    celular: false,
    cedulaPasaporte: false,
    detallesPropuesta: false,
    direccionBuscar: false,
    direccionIr: false,
    emailRespuesta: false,
  });

  /**
   * 
  preparo los datos para la solicitud
   */
  const sendCreateRequest = async (cuenta: string) => {
    try {
      let tipo = "paz-salvo";
      let item = "Paz y Salvo";
      let precio = 0;
      if (formData.tipoPazSalvo === "idaan") {
        precio = 25;
      } else if (formData.tipoPazSalvo === "aseo") {
        precio = 25;
      }
      if (formData.tipoPazSalvo === "idaan") item = "IDAAN";
      else if (formData.tipoPazSalvo === "aseo") item = "ASEO";
      const requestData = {
        actualizarPorCorreo: true, 
        accion: "Solicitud de Paz y Salvo",
        item: item,
        cuenta: formData.userId, 
        date: new Date().toISOString(), 
        expediente: "", 
        emailSolicita: formData.email, 
        nombreSolicita: formData.nombreCompleto, 
        status: 1,
        tipo: tipo,
        nacionalidad: formData.nacionalidad,
        cedulaPasaporte: formData.cedulaPasaporte,
        numeroFinca: formData.numeroFinca,
        tomoRollo: formData.tomoRollo,
        telefonoSolicita: `${countryCodes[formData.telefonoCodigo]}${formData.telefono}`,
        documentoRedi: formData.documentoRedi,
        codigoUbicacion: formData.codigoUbicacion,
        ubicacionFinca: formData.ubicacionFinca,
        numeroCliente: formData.numeroCliente,
        tieneNumeroCliente: formData.tieneNumeroCliente,
        tipoConsulta: formData.tipoConsulta,
        precio: precio,
        subtotal: precio,
        total: precio,
      };
      const response = await axios.post("/api/create-request-consultaPropuesta", // TODO: cambiar al create que corresponde a paz y salvo
        requestData, 
        {
          headers: {
            "Content-Type": "application/json",
          },
        });

      const { solicitudId, status } = response.data;

            let archivoURL = formData.archivoCedulaImagenURL;
            if (archivoCedulaImagen) {
                archivoURL = await uploadFileToFirebase(archivoCedulaImagen, `uploads/${solicitudId}/adjuntoDocumentoConsulta`);
                setFormData((prevData) => ({
                    ...prevData,
                    archivoURL: archivoURL,
                }));

                const updatePayload = {
                    solicitudId: solicitudId,
                    adjuntoDocumentoConsulta: archivoURL || '',
                };

                const responseData = await axios.post('/api/update-request-all', updatePayload);
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

        setFormData({
    nombreCompleto: "",
    email: "",
    cedulaPasaporte: "",
    telefono: "",
    telefonoCodigo: "PA",
    tipoConsulta: "Paz Salvo",
    tipoPazSalvo: "",
    terminosAceptados: false,
    cuenta: "",
    userId: "",
    soyPropietario: false,
    numeroCliente: "",
    tieneNumeroCliente: false,
    nacionalidad: "",
    numeroFinca: "",
    tomoRollo: "",
    documentoRedi: "",
    codigoUbicacion: "",
    ubicacionFinca: "",
    archivoCedulaImagenURL: "",
    notificaciones:false,

  });
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


  const handleInputChange = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  const alfanumericos = ['cedulaPasaporte', 'tomoRollo', 'documentoRedi', 'codigoUbicacion'];
  const alfanumericoRegex = /^[a-zA-Z0-9\s]*$/;
  const soloNumerosRegex = /^[0-9]*$/;
  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;

  // Permitir borrar el contenido completamente
  const trimmedValue = value.trimStart();

  // Validación por campo específico (solo si hay contenido)
  if (trimmedValue !== '') {
    if ((name === 'telefono' || name === 'numeroCliente') && !soloNumerosRegex.test(trimmedValue)) {
      Swal.fire({
        icon: 'warning',
        title: 'Formato inválido',
        text: 'Solo se permiten números en este campo.',
        background: '#2c2c3e',
        color: '#fff',
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }

    if (name === 'nombreCompleto' && !soloLetrasRegex.test(trimmedValue)) {
      Swal.fire({
        icon: 'warning',
        title: 'Formato inválido',
        text: 'Solo se permiten letras y espacios en el nombre.',
        background: '#2c2c3e',
        color: '#fff',
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }

    if (alfanumericos.includes(name) && !alfanumericoRegex.test(trimmedValue)) {
      Swal.fire({
        icon: 'warning',
        title: 'Formato inválido',
        text: 'Este campo solo permite letras, números y espacios.',
        background: '#2c2c3e',
        color: '#fff',
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }
  }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'soyPropietario'
          ? value === 'true'
          : value
    }));
    console.log(formData);
  };

  const handleCountryChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (

    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
      <h2 className="text-white text-4xl font-bold flex items-center">
        Solicitud de Gestión de Paz y Salvos
      </h2>
      <hr />
      <p className="text-white mt-4 texto_justificado">
        <strong>Bienvenido a nuestra sección de solicitudes para gestionar paz y salvos. </strong>
      </p>
      <p className="text-white mt-4 texto_justificado">
        A través de nuestra plataforma, podrás completar los datos para que nosotros presentemos tu solicitud en la institución que elijas.
        Solo debes llenar el formulario correspondiente, para IDAN o ASEO, y nos encargaremos de tramitar el paz y salvo que necesites. Es importante que tus cuentas estén al día, de lo contrario no se podrá emitir el certificado por insolvencia.
        Nuestro equipo de expertos gestionará tu trámite de forma rápida y sencilla.

      </p>
      <BannerPazsalvos />

      <form className="mt-4">
        {/* Tipo de Paz y Salvo */}
        <div className="mb-6">
          <label className="block text-white mb-2">¿Qué tipo de Paz y Salvo desea gestionar?</label>
          <select
            name="tipoSolicitud"
            value={formData.tipoPazSalvo}
            onChange={handleSelectTipoSalvo}
            className="w-full p-4 bg-gray-800 text-white rounded-lg"
          >
            <option value="">Seleccione una opción</option>
            <option value="idaan">IDAAN</option>
            <option value="aseo">ASEO</option>
          </select>
        </div>

        {/* ¿Tiene número de cliente? */}
{formData.tipoPazSalvo && (
  <div className="mb-6">
    <label className="text-white block mb-2">¿Tiene número de cliente?</label>
    <div className="flex space-x-4 text-white">
      <label>
        <input
          type="radio"
          name="tieneNumeroCliente"
          checked={formData.tieneNumeroCliente === true}
          onChange={() => {
            setFormData((prev) => ({ ...prev, tieneNumeroCliente: true }));
            setCargoSinCliente(0);
          }}
        />{' '}
        Sí
      </label>
      <label>
        <input
          type="radio"
          name="tieneNumeroCliente"
          value="no"
          checked={formData.tieneNumeroCliente === false}
          onChange={() => {
            setFormData((prev) => ({ ...prev, tieneNumeroCliente: false }));
            setCargoSinCliente(25);

            // 🎯 Alerta con el mismo diseño oscuro que el resto del formulario
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: 'Para Solicitar Paz y Salvo, necesita un número de cliente, Si no lo tiene, primero debe solicitar una inspección en su finca para que le asignen uno. Podemos ayudarte con esta gestión. El tiempo puede variar según la disponibilidad de la institución, esta gestión genera un recargo a la solicitud, se adiciona un cargo de $25.00.',
              background: '#2c2c3e',
              color: '#fff',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar',
            });
          }}
        />{' '}
        No
      </label>
    </div>

    {formData.tieneNumeroCliente === true && (
      <div className="mt-6">
        <label className="block text-white mb-2">Número de cliente:</label>
        <input
          type="text"
          name="numeroCliente"
          value={formData.numeroCliente}
          onChange={handleInputChange}
          className="w-full p-4 bg-gray-800 text-white rounded-lg"
          placeholder="Ingrese su número de cliente"
        />
      </div>
    )}
  </div>
)}
        {/* ¿Es propietario? */}
        {formData.tipoPazSalvo && (
          <div className="mb-6">
            <label className="text-white block mb-2">¿Es usted el propietario?</label>
            <div className="flex space-x-4 text-white">
              <label>
                <input
                  type="radio"
                  name="soyPropietario"
                  checked={formData.soyPropietario === true}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, soyPropietario: true }))
                  }
                />{' '}Sí
              </label>
              <label>
                <input
                  type="radio"
                  name="soyPropietario"
                  checked={formData.soyPropietario === false}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, soyPropietario: false }))
                  }
                />{' '}No
              </label>
            </div>
          </div>
        )}

{/* Encabezado */}
<div className="mb-6">
  <h2 className="text-white text-2xl font-semibold">Información Personal</h2>
  <p className="text-white text-sm">* Coméntanos tu información como solicitante para poder contactarte.</p>
</div>
<hr className="mb-4" />

{/* Grid principal de 2 columnas */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
  {/* Fila 1 */}
  <div className="w-full">
    <label className="block text-white mb-2">Nombre completo (persona natural):</label>
    <input
      ref={nombreCompletoRef}
      type="text"
      name="nombreCompleto"
      value={formData.nombreCompleto}
      onChange={handleInputChange}
      className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreCompleto ? 'border-2 border-red-500' : ''}`}
    />
  </div>
  <div className="w-full">
    <label className="block text-white mb-2">Dirección de correo electrónico:</label>
    <input
      ref={emailRef}
      type="text"
      name="email"
      value={formData.email}
      onChange={handleInputChange}
      className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.email ? 'border-2 border-red-500' : ''}`}
    />
  </div>

  {/* Fila 2 */}
  <div className="w-full">
    <label className="block text-white mb-2">Número de cédula o Pasaporte:</label>
    <input
      ref={cedulaPasaporteRef}
      type="text"
      name="cedulaPasaporte"
      value={formData.cedulaPasaporte}
      onChange={handleInputChange}
      placeholder="Número de cédula o Pasaporte"
      className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaporte ? 'border-2 border-red-500' : ''}`}
    />
  </div>
  <div className="w-full">
    <label className="block text-white mb-2">Adjuntar imagen de la cédula:</label>
    <input
      type="file"
      name="cedulaImagen"
      accept="image/*"
      onChange={handleFileChange}
      className="w-full p-4 bg-gray-800 text-white rounded-lg"
    />
    {formData.archivoCedulaImagenURL && (
      <p className="text-sm text-blue-500">
        <Link href={formData.archivoCedulaImagenURL} target="_blank" rel="noopener noreferrer">
          Ver documento actual
        </Link>
      </p>
    )}
  </div>

  {/* Fila 3 */}
  <div className="w-full">
    <label className="block text-white mb-2">Número de teléfono:</label>
    <div className="flex gap-2">
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
      />
    </div>
  </div>

          <div className="w-full">
            <label className="block text-white mb-2">Nacionalidad:</label>
            <select
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleInputChange}
              className="w-full p-4 bg-gray-800 text-white rounded-lg"
            >
              <option value="" disabled hidden>
                Selecciona tu nacionalidad
              </option>
              {getCountries().map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

  {/* Fila 4: Número de finca, Tomo/Rollo, Redi, Ubicación */}
  <div className="md:col-span-2">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-white mb-2">Número de Finca:</label>
        <input
          type="text"
          name="numeroFinca"
          value={formData.numeroFinca}
          onChange={handleInputChange}
          placeholder=""
          className="p-3 rounded bg-gray-800 w-full text-white"
        />
      </div>
      <div>
        <label className="block text-white mb-2">Tomo/Rollo:</label>
        <input
          type="text"
          name="tomoRollo"
          value={formData.tomoRollo}
          onChange={handleInputChange}
          placeholder=""
          className="p-3 rounded bg-gray-800 w-full text-white"
        />
      </div>
      <div>
        <label className="block text-white mb-2">Documento Redi:</label>
        <input
          type="text"
          name="documentoRedi"
          value={formData.documentoRedi}
          onChange={handleInputChange}
          placeholder=""
          className="p-3 rounded bg-gray-800 w-full text-white"
        />
      </div>
      <div>
        <label className="block text-white mb-2">Código de Ubicación:</label>
        <input
          type="text"
          name="codigoUbicacion"
          value={formData.codigoUbicacion}
          onChange={handleInputChange}
          placeholder=""
          className="p-3 rounded bg-gray-800 w-full text-white"
        />
      </div>
    </div>
  </div>

  {/* Fila 5: Ubicación de finca, ocupa toda la fila */}
  <div className="md:col-span-2">
    <label className="block text-white mb-2 mt-4">Domicilio/Ubicación de la Finca:</label>
    <textarea
      name="ubicacionFinca"
      value={formData.ubicacionFinca}
      onChange={handleInputChange}
      className="p-3 rounded bg-gray-800 w-full text-white"
      placeholder="Domicilio y Ubicación de la Finca"
    />
  </div>
</div>
  <div className="mt-4">
  <p className="text-white">¿Deseas que te notifiquemos a tu correo?</p>
  <label className="inline-flex items-center mt-4">
    <input
      type="radio"
      name="notificaciones"
      value="true"
      checked={formData.notificaciones === true}
      onChange={() =>
        setFormData((prev) => ({ ...prev, notificaciones: true }))
      }
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
      value="false"
      checked={formData.notificaciones === false}
      onChange={() =>
        setFormData((prev) => ({ ...prev, notificaciones: false }))
      }
      className="form-radio"
    />
    <span className="ml-2 text-white">No, lo reviso directamente en el sistema.</span>
  </label>
</div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={terminosAceptados}
            onChange={(e) => setTerminosAceptados(e.target.checked)}
            className="form-checkbox"
          />
          <span className="ml-2 text-white">Acepto los términos y condiciones de este servicio.</span>
        </label>

<div className="mt-4">
  <ReCAPTCHA
    sitekey="6LejlrwqAAAAAN_WiEXqKIAT3qhfqPm-y1wh3BPi" 
    onChange={(token) => setRecaptchaToken(token)}
  />
</div>

{formData.tipoPazSalvo && (
  <div className="mt-6">
    <h2 className="text-white text-2xl font-semibold">Costos del trámite</h2>
    <table className="w-full mt-4 text-white border border-gray-600">
      <thead>
        <tr className="border-b border-gray-600">
          <th className="text-left p-2">#</th>
          <th className="text-left p-2">Trámite</th>
          <th className="text-right p-2">Precio</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-gray-600">
          <td className="p-2">1</td>
          <td className="p-2">{formData.tipoPazSalvo === "idaan" ? "IDAAN" : "ASEO"}</td>
          <td className="text-right p-2">${formData.tipoPazSalvo === "idaan" ? "25.00" : "25.00"}</td>
        </tr>
        {cargoSinCliente > 0 && (
          <tr className="border-b border-gray-600">
            <td className="p-2">2</td>
            <td className="p-2">Cargo adicional (Inspección)</td>
            <td className="text-right p-2">${cargoSinCliente.toFixed(2)}</td>
          </tr>
        )}
        <tr className="border-b border-gray-600">
          <td colSpan={2} className="text-right p-2 font-semibold">Total</td>
          <td className="text-right p-2 font-semibold">
            ${(formData.tipoPazSalvo === "idaan"
              ? 25
              : 20) + cargoSinCliente}.00
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)}
        {/* Payment and Register Payment Buttons */}
        <div className="flex flex-col gap-2 mt-6">
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

        {/* RegisterPaymentForm Modal */}
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
        </form>
    </div>
  );
}
