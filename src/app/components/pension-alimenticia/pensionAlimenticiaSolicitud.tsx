"use client"
import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context'; // Import the context
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner
import axios from 'axios';
import Link from 'next/link';
import PensionCategoryMessage from './PensionCategoryMessage'
import { useFetchSolicitud } from '@utils/fetchCurrentRequest'
import get from 'lodash/get';

interface FormData {
  pensionType: string;          // 'Primera vez' or other pension types
  pensionAmount: number;        // Amount requested for pension
  receiveSupport: string;       // 'Si' or 'No' (yes or no question)
  pensionCategory: string;      // Category of the pension
  currentSupportAmount: number; // Support amount currently received

  // Aumento
  currentAmount: number;        // Current pension amount
  increaseAmount: number;       // Amount requested for increase
  totalAmount: number;          // Total amount after increase
  agreesWithAmount: string;     // 'Si' or 'No' for agreement on total amount
  disagreementReason: string;   // Reason for disagreement

  // Case location and court info
  province: string;             // Province name
  court: string;                // Court name for case

  // Rebaja o Suspensión
  pensionSubType: string;       // 'Disminuir' or 'Suspender'
  reduceAmount: number;         // Amount requested for reduction
  knowsCaseLocation: string;    // 'Si' or 'No'
  wantsInvestigation: string;   // 'Si' or 'No'
  suspensionReason: string;     // Reason for suspension

  // Desacato
  desacatoDescription: string;  // Description of desacato
  paymentDay: string;           // Day assigned for payment by the court
  lastPaymentDate: string;      // Last date when the pension was paid
  medidaPorElJuez: string;
  numeroExpediente: string;
  numeroJuzgado: string;
  provinceDesacato: string;
  provinceExpediente: string;
  fechaPago: string;
  terminoPago: string;
  servicioPLG: string;

  // For Desacato or Rebaja o Suspensión
  courtName: string;            // Name of the court
  caseNumber: string;           // Case number
  sentenceDate: string;         // Date of the last sentence
  sentenceFile: File | null;    // Scanned file of the sentence, can be null

  // General fields
  reason: string;               // Reason for reduction/suspension


}

const PensionAlimenticiaSolicitud: React.FC = () => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;
  const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);
  const [email, setEmail] = useState<String>("")
  const [customerID, setCustomerID] = useState<String>("")
  const [formData, setFormData] = useState<FormData>({
    // For 'Primera vez'
    pensionType: 'Primera vez',
    pensionAmount: 0,
    receiveSupport: 'No',
    pensionCategory: 'Hijos menores de edad',
    currentSupportAmount: 0,

    // For 'Aumento'
    currentAmount: 0,
    increaseAmount: 0,
    totalAmount: 0,
    agreesWithAmount: 'Si',
    disagreementReason: '',
    province: '',
    court: '',

    // For 'Rebaja o Suspensión'
    pensionSubType: 'Disminuir',
    reduceAmount: 0,
    knowsCaseLocation: 'No',
    wantsInvestigation: 'No',
    suspensionReason: '',

    // For 'Desacato'
    desacatoDescription: '',
    paymentDay: '',
    lastPaymentDate: '',
    medidaPorElJuez: "",
    numeroExpediente: "",
    numeroJuzgado: "",
    provinceDesacato: "",
    provinceExpediente: "",
    fechaPago: "",
    terminoPago: "",
    servicioPLG: "No",

    // New fields for 'Desacato' or 'Rebaja o Suspensión'
    courtName: '',
    caseNumber: '',
    sentenceDate: '',
    sentenceFile: null, // Defaulting to null since there's no file initially

    // General fields
    reason: '',


  });



  useEffect(() => {
    if (store.solicitudId) {
      fetchSolicitud();
    }
    console.log("Store Request ", store.request)
  }, [store.solicitudId]);

  useEffect(() => {
    if (store.request) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        pensionType: get(store.request, 'pensionType', 'Primera vez'),
        pensionAmount: get(store.request, 'pensionAmount', 0),
        currentSupportAmount: get(store.request, 'currentSupportAmount', 0),
        currentAmount: get(store.request, 'currentAmount', 0),
        increaseAmount: get(store.request, 'increaseAmount', 0),
        totalAmount: get(store.request, 'totalAmount', 0),
        agreesWithAmount: get(store.request, 'agreesWithAmount', 'No'),
        disagreementReason: get(store.request, 'disagreementReason', ''),
        desacatoDescription: get(store.request, 'desacatoDescription', ''),
        paymentDay: get(store.request, 'paymentDay', ''),
        lastPaymentDate: get(store.request, 'lastPaymentDate', ''),
        pensionCategory: get(store.request, 'pensionCategory', 'Hijos menores de edad'),

        medidaPorElJuez: get(store.request, 'medidaPorElJuez', ''),
        numeroExpediente: get(store.request, 'numeroExpediente', ''),
        numeroJuzgado: get(store.request, 'numeroJuzgado', ''),
        provinceDesacato: get(store.request, 'provinceDesacato', ''),
        provinceExpediente: get(store.request, 'provinceExpediente', ''),
        fechaPago: get(store.request, 'fechaPago', ''),
        terminoPago: get(store.request, 'terminoPago', ''),
        servicioPLG: get(store.request, 'servicioPLG', ''),

        courtName: get(store.request, 'courtName', ''),
        caseNumber: get(store.request, 'caseNumber', ''),
        emailSolicita: get(store.request, 'emailSolicita', ''),
        expediente: get(store.request, 'expediente', ''),
        knowsCaseLocation: get(store.request, 'knowsCaseLocation', 'No'),
      }));
    }
  }, [store.request]);

  useEffect(() => {
    if (store.request) {
      const solicitud = get(store.request, 'solicitud', {});

      const emailSolicita = get(store.request, 'emailSolicita', "");
      if (emailSolicita) {
        setEmail(emailSolicita);
      }

      if (solicitud && Object.keys(solicitud).length > 0) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...solicitud, // Spread the solicitud data to overwrite corresponding fields in formData
        }));
      }
    }
  }, [store.request]);

  useEffect(() => {
    const fetchCustomerID = async () => {
      if (!email) return;

      try {
        console.log("joaaa entre")
        const response = await axios.get(`/api/get-contact-id`, {
          params: { email },
        });

        console.log("🚀 ~ fetchCustomerID ~ response:", response)

        const contactId = get(response, 'data.contactId', null);
        console.log("🚀 ~ fetchCustomerID ~ contactId:", contactId)

        if (contactId) {
          setCustomerID(contactId);
          console.log("Customer ID fetched successfully:", contactId);
        } else {
          console.error("Customer ID not found for the provided email.");
        }
      } catch (error) {
        console.error("Error fetching Customer ID:", error);
      }
    };

    fetchCustomerID();
  }, [email]);

  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericValue = name === 'currentAmount' || name === 'increaseAmount' || name === 'totalAmount'
      ? Number(value)
      : value;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: numericValue,
      };

      // Si el cambio afecta totalAmount, lo recalculamos
      if (name === 'currentAmount' || name === 'increaseAmount') {
        updatedData.totalAmount = updatedData.currentAmount + updatedData.increaseAmount;
      }

      // **🚀 Aquí se quita el error si el campo ya tiene un valor válido**
      if (invalidFields[name] && value !== '') {
        setInvalidFields(prev => {
          const updatedInvalidFields = { ...prev };
          delete updatedInvalidFields[name]; // Eliminar el campo de errores
          return updatedInvalidFields;
        });
      }

      return updatedData;
    });
  };

  const [invalidFields, setInvalidFields] = useState<{ [key: string]: boolean }>({});

  // Función para resaltar en rojo y desplazarse al campo con error
  const highlightField = (fieldName: string) => {
    setInvalidFields(prev => ({ ...prev, [fieldName]: true }));

    const field = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    if (field) {
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      field.focus();
    }
  };

  const showAlert = (message: string, fieldName: string) => {
    if (!invalidFields[fieldName]) { // 🚀 Solo mostrar alerta si el campo aún no está marcado como inválido
      Swal.fire({
        icon: 'warning',
        title: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        background: '#2c2c3e',
        color: '#fff'
      });

      setInvalidFields(prev => ({ ...prev, [fieldName]: true })); // Marcar como inválido
    }

    const field = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    if (field) {
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      field.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvalidFields({});

    if (!store.solicitudId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se ha encontrado el ID de la solicitud. Intente nuevamente.',
      });
      return;
    }

    if (formData.pensionType === 'Primera vez') {
      if (!formData.pensionAmount || formData.pensionAmount <= 0) {
        showAlert('Debe ingresar un monto válido para la pensión.', 'pensionAmount');
        return;
      }

      if (formData.receiveSupport === 'Sí' && (!formData.currentSupportAmount || formData.currentSupportAmount <= 0)) {
        showAlert('Debe ingresar el monto del apoyo recibido actualmente.', 'currentSupportAmount');
        return;
      }

      if (!formData.pensionCategory) {
        showAlert('Debe seleccionar una categoría de pensión.', 'pensionCategory');
        return;
      }
    }

    let newInvalidFields: { [key: string]: boolean } = {};
    if (formData.pensionType === 'Aumento') {
      // Validar monto actual de pensión
      if (!formData.currentAmount || formData.currentAmount <= 0) {
        newInvalidFields.currentAmount = true;
        showAlert('Debe ingresar el monto actual de la pensión.', 'currentAmount');
        return;
      }

      // Validar monto de aumento solicitado
      if (!formData.increaseAmount || formData.increaseAmount <= 0) {
        newInvalidFields.currentAmount = true;
        showAlert('Debe ingresar un monto válido para el aumento.', 'increaseAmount');
        return;
      }

      // Validar monto total calculado
      if (!formData.totalAmount || formData.totalAmount <= 0) {
        newInvalidFields.currentAmount = true;
        showAlert('Debe asegurarse de que el monto total sea válido.', 'totalAmount');
        return;
      }

      // Validar campo "disagreementReason" si el usuario NO está de acuerdo con el monto total
      if (formData.agreesWithAmount === 'No' && !formData.disagreementReason.trim()) {
        newInvalidFields.currentAmount = true;
        showAlert('Debe explicar la razón por la que no está de acuerdo con el monto total.', 'disagreementReason');
        return;
      }

      // Validaciones cuando NO sabe dónde está radicado el expediente
      if (formData.knowsCaseLocation === 'No') {
        if (!formData.wantsInvestigation) {
          newInvalidFields.currentAmount = true;
          showAlert('Debe indicar si desea que se investigue dónde está radicado el expediente.', 'wantsInvestigation');
          return;
        }

        if (formData.wantsInvestigation === 'Si' && !formData.province) {
          newInvalidFields.currentAmount = true;
          showAlert('Debe seleccionar una provincia para la investigación.', 'province');
          return;
        }
      }

      // Validaciones cuando SÍ sabe dónde está radicado el expediente
      if (formData.knowsCaseLocation === 'Si') {
        if (!formData.court.trim()) {
          newInvalidFields.currentAmount = true;
          showAlert('Debe indicar el juzgado donde se encuentra el expediente.', 'court');
          return;
        }

        if (!formData.caseNumber.trim()) {
          newInvalidFields.currentAmount = true;
          showAlert('Debe ingresar el número de expediente.', 'caseNumber');
          return;
        }

        if (!formData.sentenceDate) {
          newInvalidFields.currentAmount = true;
          showAlert('Debe indicar la fecha de la última sentencia.', 'sentenceDate');
          return;
        }
      }

      if (Object.keys(newInvalidFields).length > 0) {
        setInvalidFields(newInvalidFields); // 🚀 Actualizar estado con errores
        return;
      }
    }

    if (formData.pensionType === 'Rebaja o Suspensión') {
      if (!formData.currentAmount || formData.currentAmount <= 0) {
        showAlert('Debe ingresar el monto actual de la pensión.', 'currentAmount');
        return;
      }

      if (formData.pensionSubType === 'Disminuir' && (!formData.reduceAmount || formData.reduceAmount <= 0)) {
        showAlert('Debe ingresar un monto válido para la reducción.', 'reduceAmount');
        return;
      }

      if (formData.pensionSubType === 'Suspender' && !formData.suspensionReason.trim()) {
        showAlert('Debe indicar la razón de la suspensión.', 'suspensionReason');
        return;
      }

      if (formData.knowsCaseLocation === 'Sí') {
        if (!formData.courtName.trim()) {
          showAlert('Debe indicar el juzgado donde está radicado el expediente.', 'courtName');
          return;
        }
        if (!formData.caseNumber.trim()) {
          showAlert('Debe ingresar el número de expediente.', 'caseNumber');
          return;
        }
        if (!formData.sentenceDate) {
          showAlert('Debe indicar la fecha de la última sentencia.', 'sentenceDate');
          return;
        }
      }

      if (formData.knowsCaseLocation === 'No') {
        if (!formData.wantsInvestigation) {
          showAlert('Debe indicar si desea que se investigue la ubicación del expediente.', 'wantsInvestigation');
          return;
        }
        if (formData.wantsInvestigation === 'Sí' && !formData.province) {
          showAlert('Debe seleccionar una provincia para la investigación.', 'province');
          return;
        }
      }
    }

    if (formData.pensionType === 'Desacato' && desacatoMensaje === "Desacato Válido") {
      if (!formData.paymentDay.trim()) {
        showAlert('Debe indicar el día de pago asignado por el juez.', 'paymentDay');
        return;
      }

      if (!formData.lastPaymentDate) {
        showAlert('Debe indicar la fecha de la última mensualidad recibida.', 'lastPaymentDate');
        return;
      }

      if (!formData.medidaPorElJuez) {
        showAlert('Debe indicar si posee una sentencia o certificado de mediación.', 'medidaPorElJuez');
        return;
      }

      if (formData.medidaPorElJuez === "Sí") {
        if (!formData.numeroExpediente.trim()) {
          showAlert('Debe ingresar el número de expediente.', 'numeroExpediente');
          return;
        }
        if (!formData.numeroJuzgado.trim()) {
          showAlert('Debe ingresar el número de juzgado.', 'numeroJuzgado');
          return;
        }
        if (!formData.provinceDesacato) {
          showAlert('Debe seleccionar una provincia.', 'provinceDesacato');
          return;
        }
        if (!formData.fechaPago) {
          showAlert('Debe indicar la fecha de pago.', 'fechaPago');
          return;
        }
        if (!formData.terminoPago) {
          showAlert('Debe indicar el término de pago.', 'terminoPago');
          return;
        }
      }

      if (formData.medidaPorElJuez === "No") {

        if (formData.servicioPLG === "Sí") {

          if (!formData.provinceDesacato) {
            showAlert('Debe seleccionar una provincia.', 'provinceDesacato');
            return;
          }
          if (!formData.fechaPago) {
            showAlert('Debe indicar la fecha de pago.', 'fechaPago');
            return;
          }
          if (!formData.terminoPago) {
            showAlert('Debe indicar el término de pago.', 'terminoPago');
            return;
          }
        }
      }

    }

    setIsLoading(true); // Set loading to true when the request starts

    try {
      const updatePayload = {
        solicitudId: store.solicitudId,
        solicitud: {
          ...formData,
        },
        pensionType: formData.pensionType
      };

      console.log("🚀 ~ handleSubmit ~ updatePayload:", updatePayload);

      const response = await axios.patch('/api/update-request', updatePayload);

      if (response.status === 200 && response.data.status === 'success') {
        setStore((prevState) => ({
          ...prevState,
          demandante: true,
          currentPosition: 3
        }));

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Información de la solicitud actualizada correctamente.",
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
      } else {
        throw new Error('Error al actualizar la solicitud.');
      }

    } catch (error) {
      console.error('Error updating request:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar la solicitud. Por favor, inténtelo de nuevo más tarde.',
      });
    } finally {
      try {
        console.log("hola mundillo")
        if (customerID) {
          console.log("🚀 ~ handleSubmit ~ customerID:", customerID)

          const invoicePayload = {
            customer_id: customerID,
            pensionType: formData.pensionType,
          };

          const invoiceResponse = await axios.post('/api/create-invoice', invoicePayload);
          console.log("🚀 ~ handleSubmit ~ invoiceResponse:", invoiceResponse)

          if (invoiceResponse.status === 200) {
            console.log("Invoice created successfully:", invoiceResponse.data);
          } else {
            console.error("Error creating invoice:", invoiceResponse);
          }
        }
      } catch (invoiceError) {
        console.error("Error creating invoice:", invoiceError);
      }
    }
    setIsLoading(false); // Set loading to false after the request is complete

  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      e.target.value = "0";
      setFormData((prevFormData) => ({
        ...prevFormData,
        [e.target.name]: 0,
      }));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "0") {
      e.target.value = "";
    }
  };

  const [desacatoMensaje, setDesacatoMensaje] = useState<JSX.Element | string>("");

  useEffect(() => {
    if (formData.paymentDay && formData.lastPaymentDate) {
      const today = new Date();

      // Convertir lastPaymentDate correctamente evitando el desfase de zona horaria
      const [year, month, day] = formData.lastPaymentDate.split("-").map(Number);
      const lastPayment = new Date(year, month - 1, day); // Meses en JS van de 0 a 11

      const paymentDay = parseInt(formData.paymentDay, 10);

      if (!isNaN(paymentDay)) {
        // Calcular la primera fecha de pago vencida (mes siguiente al último pago)
        const firstMissedPayment = new Date(lastPayment);
        firstMissedPayment.setMonth(firstMissedPayment.getMonth() + 1); // Avanza un mes correctamente
        firstMissedPayment.setDate(1); // Evita desbordes de días
        firstMissedPayment.setDate(paymentDay); // Ajusta el día de pago correctamente

        console.log("Fecha 1 (último pago ingresado por el usuario):", lastPayment);
        console.log("Fecha 1.1 (primer pago vencido):", firstMissedPayment);

        // Calcular la segunda fecha de pago vencida (dos meses después del último pago)
        const secondMissedPayment = new Date(firstMissedPayment);
        secondMissedPayment.setMonth(secondMissedPayment.getMonth() + 1); // Avanza otro mes correctamente

        console.log("Fecha 2 (segundo pago vencido):", secondMissedPayment);

        // Verificar si el pago ya se venció
        const isLate = today > firstMissedPayment; // Si la fecha actual ya pasó la primera fecha de pago
        const isStillValid = today < secondMissedPayment; // Si aún no ha pasado la segunda fecha de pago

        if (isLate && isStillValid) {
          setDesacatoMensaje("Desacato Válido");
        } else if (isLate && !isStillValid) {
          // Guardamos JSX en el estado en lugar de texto plano
          setDesacatoMensaje(
            <span>
              El lapso para solicitar Desacato de Pensión Alimenticia ha caducado, ya que se debe presentar antes de que se cumplan dos fechas de pago (
              <strong>{firstMissedPayment.toLocaleDateString()}</strong> y <strong>{secondMissedPayment.toLocaleDateString()}</strong>).
              <br />
              Por lo tanto, le recomendamos solicitar una consulta con nuestros expertos que le darán una orientación más completa para proceder con su requerimiento.
              <br />
              <Link
                href="/request/consulta-propuesta"
                className="text-blue-500 underline hover:text-blue-700"
              >
                Consulta y Propuesta
              </Link>
            </span>
          );
        } else {
          setDesacatoMensaje("Aún no llega su fecha de pago");
        }
      }
    }
  }, [formData.paymentDay, formData.lastPaymentDate]);

  // Forms for each pension type
  const renderForm = () => {
    switch (formData.pensionType) {
      case 'Primera vez':
        return (
          <div className="mt-6">
            <h3 className="text-xl font-bold">Formulario de Primera vez</h3>
            <p>Complete el siguiente formulario para solicitar pensión por primera vez.</p>

            <div className="mt-6">
              <label className="block font-bold">¿Cuánto desea obtener de Pensión Alimenticia?</label>
              <input
                type="number"
                name="pensionAmount"
                value={formData.pensionAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.pensionAmount ? 'border-red-500' : ''}`}
                placeholder="Introduzca el monto"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>

            <div className="mt-6">
              <label className="block font-bold">¿Recibe usted algún aporte por parte del demandado?</label>
              <select
                name="receiveSupport"
                value={formData.receiveSupport}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                disabled={store.request.status >= 10 && store.rol < 20}
              >
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>

            {formData.receiveSupport === 'Sí' && (
              <div className="mt-6">
                <label className="block font-bold">
                  ¿Cuánto le están aportando de pensión alimenticia actualmente?
                </label>
                <input
                  type="number"
                  name="currentSupportAmount"
                  value={formData.currentSupportAmount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.currentSupportAmount ? 'border-red-500' : ''}`}
                  placeholder="Introduzca el monto"
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
            )}

            <div className="mt-6">
              <label className="block font-bold">¿Qué tipo de pensión requiere solicitar?</label>
              <select
                name="pensionCategory"
                value={formData.pensionCategory}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                disabled={store.request.status >= 10 && store.rol < 20}
              >
                <option value="Hijos menores de edad">Hijos menores de edad</option>
                <option value="Mayores de edad hasta 25 años con estudios en curso">
                  Mayores de edad hasta 25 años con estudios en curso
                </option>
                <option value="Mujer embarazada (ayuda prenatal)">
                  Mujer embarazada (ayuda prenatal)
                </option>
                <option value="Personas con discapacidad">Personas con discapacidad</option>
                <option value="En condición de Cónyuge">En condición de Cónyuge</option>
                <option value="Padres o ascendientes de grado más próximo (abuelos)">
                  Padres o ascendientes de grado más próximo (abuelos)
                </option>
                <option value="Hermanos">Hermanos</option>
              </select>
            </div>


            <PensionCategoryMessage pensionCategory={formData.pensionCategory} />

          </div>
        );
      case 'Aumento':
        return (
          <div className="mt-6">
            <h3 className="text-xl font-bold">Formulario de Aumento</h3>
            <p>Complete el siguiente formulario para solicitar un aumento de la pensión.</p>

            <div className="mt-6">
              <label className="block font-bold">¿Cuánto le están aportando de pensión alimenticia actualmente?</label>
              <input
                type="number"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.currentAmount ? 'border-red-500' : ''}`}
                placeholder="Introduzca el monto actual"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>

            <div className="mt-6">
              <label className="block font-bold">¿Cuánto desea solicitar de aumento?</label>
              <input
                type="number"
                name="increaseAmount"
                value={formData.increaseAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.increaseAmount ? 'border-red-500' : ''}`}
                placeholder="Introduzca el monto de aumento"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>

            <div className="mt-6">
              <label className="block font-bold">El monto total que desea recibir es el siguiente</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                placeholder="Introduzca el monto total"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>

            <div className="mt-6">
              <label className="block font-bold">¿Está usted de acuerdo con el monto total que recibirá?</label>
              <select
                name="agreesWithAmount"
                value={formData.agreesWithAmount}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                disabled={store.request.status >= 10 && store.rol < 20}
              >
                <option value="Si">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Conditional field that appears when "No" is selected */}
            {formData.agreesWithAmount === 'No' && (
              <div className="mt-6">
                <label className="block font-bold">Por favor explique por qué no está de acuerdo con el monto total</label>
                <textarea
                  name="disagreementReason"
                  value={formData.disagreementReason}
                  onChange={handleChange}
                  className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.disagreementReason ? 'border-red-500' : ''}`}
                  placeholder="Explique la razón por la cual no está de acuerdo"
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
            )}

            <div className="mt-6">
              <label className="block font-bold">
                ¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?
              </label>
              <select
                name="knowsCaseLocation"
                value={formData.knowsCaseLocation}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                disabled={store.request.status >= 10 && store.rol < 20}
              >
                <option value="No">No</option>
                <option value="Si">Sí</option>
              </select>
            </div>

            {formData.knowsCaseLocation === 'No' && (
              <div className="mt-6">
                <label className="block font-bold">
                  ¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?
                </label>
                <select
                  name="wantsInvestigation"
                  value={formData.wantsInvestigation}
                  onChange={handleChange}
                  className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                  disabled={store.request.status >= 10 && store.rol < 20}
                >
                  <option value="No">No</option>
                  <option value="Si">Sí</option>
                </select>
              </div>
            )}

            {/* Scenario when investigation is required */}
            {formData.knowsCaseLocation === 'No' && formData.wantsInvestigation === 'Si' && (
              <div className="mt-6">
                <label className="block font-bold">Especifique la provincia.</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.province ? 'border-red-500' : ''}`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Bocas del Toro">Bocas del Toro</option>
                  <option value="Chiriquí">Chiriquí</option>
                  <option value="Coclé">Coclé</option>
                  <option value="Colón">Colón</option>
                  <option value="Darién">Darién</option>
                  <option value="Herrera">Herrera</option>
                  <option value="Los Santos">Los Santos</option>
                  <option value="Panamá">Panamá</option>
                  <option value="Panamá Oeste">Panamá Oeste</option>
                  <option value="Veraguas">Veraguas</option>
                </select>
              </div>
            )}
            {formData.knowsCaseLocation === 'Si' && (
              <div className="mt-6">
                <label className="block font-bold">Indique Juzgado:</label>
                <input
                  type="text"
                  name="court"
                  value={formData.court}
                  onChange={handleChange}
                  className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.court ? 'border-red-500' : ''}`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />

                <label className="block font-bold mt-4">Indique número de expediente:</label>
                <input
                  type="text"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.caseNumber ? 'border-red-500' : ''}`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />

                <label className="block font-bold mt-4">Indique la fecha de la última sentencia:</label>
                <input
                  type="date"
                  name="sentenceDate"
                  value={formData.sentenceDate}
                  onChange={handleChange}
                  className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.sentenceDate ? 'border-red-500' : ''}`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />

              </div>
            )}





            <div className="mt-6">
              <p className="text-sm">
                Es necesario que tenga copia de la última sentencia emitida por el juzgado de lo contrario no podemos atender la solicitud sin esta información,
                puede continuar con su solicitud pero recuerde que es importante que nos aporte dicha sentencia para continuar con el trámite correspondiente.
              </p>
            </div>

          </div>


        );

      case 'Rebaja o Suspensión':
        return (
          <>
            <div className="mt-6">
              <label className="block font-bold">¿Desea Disminuir o Suspender la pensión?</label>
              <select
                name="pensionSubType"
                value={formData.pensionSubType}
                onChange={handleChange}
                className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
                disabled={store.request.status >= 10 && store.rol < 20}
              >
                <option value="Disminuir">Disminuir</option>
                <option value="Suspender">Suspender</option>
              </select>
            </div>

            <div className="mt-6">
              <label className="block font-bold">¿Cuánto le está aportando de pensión alimenticia actualmente?</label>
              <input
                type="number"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.currentAmount ? 'border-red-500' : ''}`}
                placeholder="Introduzca el monto"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>

            {formData.pensionSubType === 'Disminuir' && (
              <div className="mt-6">
                <label className="block font-bold">¿Cuánto desea reducir de la pensión asignada?</label>
                <input
                  type="number"
                  name="reduceAmount"
                  value={formData.reduceAmount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.reduceAmount ? 'border-red-500' : ''}`}
                  placeholder="Introduzca el monto"
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
            )}

            {formData.pensionSubType === 'Suspender' && (
              <div className="mt-6">
                <label className="block font-bold">¿Por qué desea suspender la pensión alimenticia?</label>
                <textarea
                  name="suspensionReason"
                  value={formData.suspensionReason}
                  onChange={handleChange}
                  className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.suspensionReason ? 'border-red-500' : ''}`}
                  placeholder="Detalle el motivo"
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
            )}

            {/* Logic for the 'knowsCaseLocation' and 'wantsInvestigation' */}
            <div className="mt-6">
              <label className="block font-bold">¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?</label>
              <select
                name="knowsCaseLocation"
                value={formData.knowsCaseLocation}
                onChange={handleChange}
                className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
                disabled={store.request.status >= 10 && store.rol < 20}
              >
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>

            {formData.knowsCaseLocation === 'No' && (
              <div className="mt-6">
                <label className="block font-bold">¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?</label>
                <select
                  name="wantsInvestigation"
                  value={formData.wantsInvestigation}
                  onChange={handleChange}
                  className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
                  disabled={store.request.status >= 10 && store.rol < 20}
                >
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              </div>
            )}

            {formData.knowsCaseLocation === 'No' && formData.wantsInvestigation === 'Sí' && (
              <div className="mt-6">
                <label className="block font-bold">Especifique la provincia.</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.province ? 'border-red-500' : ''}`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Bocas del Toro">Bocas del Toro</option>
                  <option value="Chiriquí">Chiriquí</option>
                  <option value="Coclé">Coclé</option>
                  <option value="Colón">Colón</option>
                  <option value="Darién">Darién</option>
                  <option value="Herrera">Herrera</option>
                  <option value="Los Santos">Los Santos</option>
                  <option value="Panamá">Panamá</option>
                  <option value="Panamá Oeste">Panamá Oeste</option>
                  <option value="Veraguas">Veraguas</option>
                </select>
              </div>
            )}

            {formData.knowsCaseLocation === 'Sí' && (
              <>
                <div className="mt-6">
                  <label className="block font-bold">Indique Juzgado:</label>
                  <input
                    type="text"
                    name="courtName"
                    value={formData.courtName}
                    onChange={handleChange}
                    className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.courtName ? 'border-red-500' : ''}`}
                    disabled={store.request.status >= 10 && store.rol < 20}
                  />
                </div>

                <div className="mt-6">
                  <label className="block font-bold">Indique número de expediente:</label>
                  <input
                    type="text"
                    name="caseNumber"
                    value={formData.caseNumber}
                    onChange={handleChange}
                    className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.caseNumber ? 'border-red-500' : ''}`}
                    disabled={store.request.status >= 10 && store.rol < 20}
                  />
                </div>

                <div className="mt-6">
                  <label className="block font-bold">Indique la fecha de la última sentencia:</label>
                  <input
                    type="date"
                    name="sentenceDate"
                    value={formData.sentenceDate}
                    onChange={handleChange}
                    className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.sentenceDate ? 'border-red-500' : ''}`}
                    disabled={store.request.status >= 10 && store.rol < 20}
                  />
                </div>
              </>
            )}
          </>
        );

      case 'Desacato':
        return (
          <div className="mt-6">
            <h3 className="text-xl font-bold">Formulario de Desacato</h3>
            <p className="mt-4">
              El desacato de pensión alimenticia se solicita una vez ya hayas obtenido una sentencia o una mediación certificada por el juzgado. Sino posees este paso debes realizar la solicitud por primera vez.
            </p>
            <p className="mt-4">
              Ten en cuenta que para hacer uso de esta opción la solicitud debe presentarse al momento que incurra en el no pago de la pensión en los 30 días correspondientes. Por ejemplo, si no cancelaron la pensión correspondiente al mes de diciembre debes solicitar el desacato en el mes enero antes que se cumplan los 30 días luego del no pago, si ya pasó el plazo reglamentario debes solicitar otro proceso por lo tanto te recomendamos pautar una cita con nuestros expertos.
            </p>

            <p className="mt-4">
              Puedes solicitar tu Propuesta o Consulta Escrita, Virtual o Presencial{" "}
              <Link
                href="/request/consulta-propuesta"
                className="text-blue-500 underline hover:text-blue-700"
              >
                aquí
              </Link>
            </p>

            {/* Día de pago asignado por el juez */}
            <div className="mt-6">
              <label className="block font-bold">Indique el día de pago asignado por el juez</label>
              <input
                type="text"
                name="paymentDay"
                value={formData.paymentDay}
                onChange={handleChange}
                className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.paymentDay ? 'border-red-500' : ''}`}
                placeholder="Introduzca el día"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>

            {/* Fecha en la que recibió la última mensualidad */}
            <div className="mt-6">
              <label className="block font-bold">Indique la fecha en la que recibió la última mensualidad</label>
              <input
                type="date"
                name="lastPaymentDate"
                value={formData.lastPaymentDate}
                onChange={handleChange}
                className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.lastPaymentDate ? 'border-red-500' : ''}`}
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>

            {/* Mostrar mensaje de validación */}
            {desacatoMensaje && desacatoMensaje === "Desacato Válido" && (
              <>
                <div className="mt-6">
                  <label className="block font-bold">¿Posees una sentencia o certificado de mediación emitida por el juzgado?</label>
                  <select
                    name="medidaPorElJuez"
                    value={formData.medidaPorElJuez}
                    onChange={handleChange}
                    className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                    disabled={store.request.status >= 10 && store.rol < 20}
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                </div>
                {formData.medidaPorElJuez === "Sí" && (
                  <>
                    <div className="mt-6">
                      <label className="block font-bold">Indique el número de expediente:</label>
                      <input
                        type="text"
                        name="numeroExpediente"
                        value={formData.numeroExpediente}
                        onChange={handleChange}
                        className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.numeroExpediente ? 'border-red-500' : ''}`}
                        placeholder="Número de expediente"
                        disabled={store.request.status >= 10 && store.rol < 20}
                      />
                    </div>
                    <div className="mt-6">
                      <label className="block font-bold">Número de Juzgado donde se encuentra el expediente:</label>
                      <input
                        type="text"
                        name="numeroJuzgado"
                        value={formData.numeroJuzgado}
                        onChange={handleChange}
                        className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.numeroJuzgado ? 'border-red-500' : ''}`}
                        placeholder="Número de Juzgado"
                        disabled={store.request.status >= 10 && store.rol < 20}
                      />
                    </div>
                    <label className="mt-6 block font-bold">Especifique la provincia.</label>
                    <select
                      name="provinceDesacato"
                      value={formData.provinceDesacato}
                      onChange={handleChange}
                      className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.provinceDesacato ? 'border-red-500' : ''}`}
                      disabled={store.request.status >= 10 && store.rol < 20}
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="Bocas del Toro">Bocas del Toro</option>
                      <option value="Chiriquí">Chiriquí</option>
                      <option value="Coclé">Coclé</option>
                      <option value="Colón">Colón</option>
                      <option value="Darién">Darién</option>
                      <option value="Herrera">Herrera</option>
                      <option value="Los Santos">Los Santos</option>
                      <option value="Panamá">Panamá</option>
                      <option value="Panamá Oeste">Panamá Oeste</option>
                      <option value="Veraguas">Veraguas</option>
                    </select>
                    <div className="mt-6">
                      <label className="block font-bold">Indique las fechas de pago</label>
                      <input
                        type="date"
                        name="fechaPago"
                        value={formData.fechaPago}
                        onChange={handleChange}
                        className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.fechaPago ? 'border-red-500' : ''}`}
                        disabled={store.request.status >= 10 && store.rol < 20}
                      />
                    </div>
                    <div className="mt-6">
                      <label className="block font-bold">Término de pago</label>
                      <input
                        type="date"
                        name="terminoPago"
                        value={formData.terminoPago}
                        onChange={handleChange}
                        className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.terminoPago ? 'border-red-500' : ''}`}
                        disabled={store.request.status >= 10 && store.rol < 20}
                      />
                    </div>
                  </>
                )}

                {formData.medidaPorElJuez === "No" && (
                  <>
                    <div className="mt-6">
                      <label className="block font-bold">¿Desea que la firma Panamá Legal Group le preste el servicio para solicitar la sentencia o certificación de mediación?</label>
                      <select
                        name="servicioPLG"
                        value={formData.servicioPLG}
                        onChange={handleChange}
                        className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                        disabled={store.request.status >= 10 && store.rol < 20}
                      >
                        <option value="No">No</option>
                        <option value="Sí">Sí</option>
                      </select>
                    </div>

                    {formData.servicioPLG === "No" && (
                      <>
                        <p className="mt-4 texto_justificado">
                          Es necesario tener copia de la sentencia o certificado de mediación para poder proceder con el trámite de desacato,le invitamos a conseguir la información correspondiente para continuar con la solicitud, en Panama Legal Groupsiempre estamos dispuestos a ayudarte con tus trámites.
                        </p>
                      </>
                    )}
                    {formData.servicioPLG === "Sí" && (
                      <>
                        <p className="mt-4 texto_justificado">
                          Este servicio posee un costo adicional al trámite, se le anexará a su cuenta 200$ por la investigación y la búsqueda de la sentencia en los juzgados de familia, tenga en cuenta que este costo aplica para la Ciudad de Panamá en caso que el expediente se encuentre fuera de la ciudad puede incurrir en el aumento de la tarifa.
                        </p>

                        <label className="mt-6 block font-bold">Especifique la provincia.</label>
                        <select
                          name="provinceDesacato"
                          value={formData.provinceDesacato}
                          onChange={handleChange}
                          className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.provinceDesacato ? 'border-red-500' : ''}`}
                          disabled={store.request.status >= 10 && store.rol < 20}
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="Bocas del Toro">Bocas del Toro</option>
                          <option value="Chiriquí">Chiriquí</option>
                          <option value="Coclé">Coclé</option>
                          <option value="Colón">Colón</option>
                          <option value="Darién">Darién</option>
                          <option value="Herrera">Herrera</option>
                          <option value="Los Santos">Los Santos</option>
                          <option value="Panamá">Panamá</option>
                          <option value="Panamá Oeste">Panamá Oeste</option>
                          <option value="Veraguas">Veraguas</option>
                        </select>
                        <div className="mt-6">
                          <label className="block font-bold">Indique las fechas de pago</label>
                          <input
                            type="date"
                            name="fechaPago"
                            value={formData.fechaPago}
                            onChange={handleChange}
                            className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.fechaPago ? 'border-red-500' : ''}`}
                            disabled={store.request.status >= 10 && store.rol < 20}
                          />
                        </div>
                        <div className="mt-6">
                          <label className="block font-bold">Término de pago</label>
                          <input
                            type="date"
                            name="terminoPago"
                            value={formData.terminoPago}
                            onChange={handleChange}
                            className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.terminoPago ? 'border-red-500' : ''}`}
                            disabled={store.request.status >= 10 && store.rol < 20}
                          />
                        </div>
                      </>
                    )}

                  </>
                )}
              </>
            )}

            {desacatoMensaje && desacatoMensaje === "Desacato Válido" && (
              <>
                {/* Saber si conoce dónde está radicado el expediente */}
                <div className="mt-6">
                  <label className="block font-bold">¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?</label>
                  <select
                    name="knowsCaseLocation"
                    value={formData.knowsCaseLocation}
                    onChange={handleChange}
                    className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                    disabled={store.request.status >= 10 && store.rol < 20}
                  >
                    <option value="No">No</option>
                    <option value="Sí">Sí</option>
                  </select>
                </div>

                {/* Si elige "No" mostrar los campos de la imagen sin cambios */}
                {formData.knowsCaseLocation === 'No' && (
                  <>
                    <div className="mt-6">
                      <label className="block font-bold">¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?</label>
                      <select
                        name="wantsInvestigation"
                        value={formData.wantsInvestigation}
                        onChange={handleChange}
                        className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                        disabled={store.request.status >= 10 && store.rol < 20}
                      >
                        <option value="No">No</option>
                        <option value="Sí">Sí</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Si elige "Sí" mostrar los campos adicionales */}
                {formData.knowsCaseLocation === 'Sí' && (
                  <>
                    <div className="mt-6">
                      <label className="block font-bold">Indique Juzgado:</label>
                      <input
                        type="text"
                        name="courtName"
                        value={formData.courtName}
                        onChange={handleChange}
                        className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.courtName ? 'border-red-500' : ''}`}
                        placeholder="Indique Juzgado"
                        disabled={store.request.status >= 10 && store.rol < 20}
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block font-bold">Indique número de expediente si lo tiene:</label>
                      <input
                        type="text"
                        name="caseNumber"
                        value={formData.caseNumber}
                        onChange={handleChange}
                        className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.caseNumber ? 'border-red-500' : ''}`}
                        placeholder="Número de expediente"
                        disabled={store.request.status >= 10 && store.rol < 20}
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block font-bold">Indique la fecha de la última sentencia:</label>
                      <input
                        type="date"
                        name="sentenceDate"
                        value={formData.sentenceDate}
                        onChange={handleChange}
                        className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.sentenceDate ? 'border-red-500' : ''}`}
                        disabled={store.request.status >= 10 && store.rol < 20}
                      />
                    </div>

                  </>
                )}

                {formData.wantsInvestigation === 'No' && (
                  <>
                    {/* Nota importante */}
                    <div className="mt-6">
                      <p className="text-sm">
                        Es necesario que tenga copia de la última sentencia emitida por el juzgado de lo contrario no podemos atender la solicitud sin esta información. Puede continuar con su solicitud pero recuerde que es importante que nos aporte dicha sentencia para continuar con el trámite correspondiente.
                      </p>
                    </div>

                  </>
                )}
                {formData.wantsInvestigation === 'Sí' && (
                  <>
                    {/* Nota importante */}
                    <div className="mt-6">
                      <p className="text-sm">
                        Nuestros expertos se encargan de ubicar el juzgado junto con la última sentencia obtenida, ten en cuenta que esta investigación tiene un costo de 250$ si la sentencia fue emitida en la ciudad de panamá, si debemos movilizarnos a otras provincias incurre en un gasto adicional.
                      </p>
                    </div>

                    <label className="mt-6 block font-bold">Especifique la provincia.</label>
                    <select
                      name="provinceExpediente"
                      value={formData.provinceExpediente}
                      onChange={handleChange}
                      className={`p-4 mt-2 w-full bg-gray-800 text-white rounded-lg ${invalidFields.provinceExpediente ? 'border-red-500' : ''
                        }`}
                      disabled={store.request.status >= 10 && store.rol < 20}
                    >
                      <option value="">Seleccione una opción</option>
                      <optgroup label="Provincias">
                        <option value="Bocas del Toro">Bocas del Toro</option>
                        <option value="Chiriquí">Chiriquí</option>
                        <option value="Coclé">Coclé</option>
                        <option value="Colón">Colón</option>
                        <option value="Darién">Darién</option>
                        <option value="Herrera">Herrera</option>
                        <option value="Los Santos">Los Santos</option>
                        <option value="Panamá">Panamá</option>
                        <option value="Panamá Oeste">Panamá Oeste</option>
                        <option value="Veraguas">Veraguas</option>
                      </optgroup>
                      <optgroup label="Comarcas Indígenas">
                        <option value="Guna Yala">Guna Yala</option>
                        <option value="Emberá-Wounaan">Emberá-Wounaan</option>
                        <option value="Ngäbe-Buglé">Ngäbe-Buglé</option>
                        <option value="Naso Tjër Di">Naso Tjër Di</option>
                        <option value="Guna de Madugandí">Guna de Madugandí</option>
                        <option value="Guna de Wargandí">Guna de Wargandí</option>
                      </optgroup>
                    </select>
                  </>
                )}
              </>
            )}

            {desacatoMensaje && desacatoMensaje !== "Desacato Válido" && (
              <p className={`mt-2 font-bold text-red-500`}>{desacatoMensaje}</p>
            )}

          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      <h1 className="text-3xl font-bold">Información de la Solicitud</h1>
      <p className="mt-4">
        En esta sección debes indicar si deseas realizar la solicitud de pensión alimenticia por primera vez, solicitar un aumento,
        rebaja o suspensión en caso que el pensionado sea mayor de edad.
      </p>
      <p className="mt-4">
        Por favor confirmar si usted está solicitando una pensión alimenticia por primera vez, o desea solicitar un AUMENTO o DISMINUCIÓN de Pensión Alimenticia a través del Proceso de Revisión de Pensión Alimenticia. Si usted lo que desea es interponer un DESACATO por incumplimiento de pago de Pensión Alimenticia, por favor vaya al proceso de Desacato de Pensión:
      </p>
      <p className="mt-4">
        <strong>Nota:</strong> Tenga en cuenta que la Pensión Alimenticia corresponde al 50% de cada una de las partes. Si usted desea
        que el demandado aporte 500$, debe solicitar la pensión por al menos 1000$.
      </p>

      {/* Pension Type Selection */}
      <div className="mt-6">
        <label className="block font-bold">Seleccione la opción que más le convenga:</label>
        <div className="mt-2 space-y-2">
          {['Primera vez', 'Aumento', 'Rebaja o Suspensión', 'Desacato'].map(option => (
            <label key={option} className="block">
              <input
                type="radio"
                name="pensionType"
                value={option}
                onChange={handleChange}
                checked={formData.pensionType === option}
                className="form-radio"
              />
              <span className="ml-2">{option === 'Primera vez' ? 'Estoy solicitando Pensión Alimenticia por PRIMERA VEZ' : `Quiero solicitar ${option}`}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Render the appropriate form */}
      {renderForm()}

      {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
        <>
          <button
            className="bg-profile text-white w-full py-3 rounded-lg mt-8"
            onClick={handleSubmit}
            disabled={isLoading} // Disable button when loading
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
                currentPosition: 3,
              }));
            }}
          >
            Continuar
          </button>
        </>
      )}
    </div>
  );
};

export default PensionAlimenticiaSolicitud;
