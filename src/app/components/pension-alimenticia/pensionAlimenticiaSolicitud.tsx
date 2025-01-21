"use client"
import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context'; // Import the context
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner
import axios from 'axios';
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
  }, [store.solicitudId]);

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

    setFormData((prevData) => {

      const numericValue = name === 'currentAmount' || name === 'increaseAmount' ? Number(value) : value;

      // Calculate the new totalAmount by summing currentAmount and increaseAmount
      const newTotalAmount = prevData.currentAmount + prevData.increaseAmount
      return {
        ...prevData,
        [name]: numericValue,
        totalAmount: newTotalAmount, // Always update totalAmount when currentAmount or increaseAmount changes
      };
    });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!store.solicitudId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se ha encontrado el ID de la solicitud. Intente nuevamente.',
      });
      return;
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
          icon: 'success',
          title: 'Formulario Enviado',
          text: 'Formulario enviado correctamente. Se habilitó la sección de Demandante.',
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
    }  finally {
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
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                  className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
            <p className="mt-4">
              Costo del trámite:
            </p>
            <p className="mt-4">
              US$600.00 incluyendo gastos.
            </p>
            <p className="mt-4">
              Método de pago: US$300.00 al momento de la solicitud y US$300.00 debe ser cancelado antes de la audiencia.
            </p>

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
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                  className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                  className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                  className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                  disabled={store.request.status >= 10 && store.rol < 20}
                />

                <label className="block font-bold mt-4">Indique número de expediente:</label>
                <input
                  type="text"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleChange}
                  className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                  disabled={store.request.status >= 10 && store.rol < 20}
                />

                <label className="block font-bold mt-4">Indique la fecha de la última sentencia:</label>
                <input
                  type="date"
                  name="sentenceDate"
                  value={formData.sentenceDate}
                  onChange={handleChange}
                  className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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

            <p className="mt-4">
              Costo del trámite:
            </p>
            <p className="mt-4">
              US$600.00 incluyendo gastos.
            </p>
            <p className="mt-4">
              Método de pago: US$300.00 al momento de la solicitud y US$300.00 debe ser cancelado antes de la audiencia.
            </p>

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
                className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
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
                  className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
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
                  className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
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
                  className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
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
                    className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
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
                    className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
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
                    className={"p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"}
                    disabled={store.request.status >= 10 && store.rol < 20}
                  />
                </div>
              </>
            )}

            <div className="mt-6">
              <p className="text-sm">
                Es necesario que tenga copia de la última sentencia emitida por el juzgado de lo contrario no podemos atender la solicitud sin esta información. Puede continuar con su solicitud pero recuerde que es importante que nos aporte dicha sentencia para continuar con el trámite correspondiente.
              </p>
            </div>

            <p className="mt-4">
              Costo del trámite:
            </p>
            <p className="mt-4">
              US$300.00 incluyendo gastos.
            </p>
            <p className="mt-4">
              Método de pago: US$150.00 al momento de la solicitud y US$150.00 debe ser cancelado antes de la audiencia.
            </p>
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

            {/* Día de pago asignado por el juez */}
            <div className="mt-6">
              <label className="block font-bold">Indique el día de pago asignada por el juez</label>
              <input
                type="text"
                name="paymentDay"
                value={formData.paymentDay}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>

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
                    className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                    className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                    className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                    disabled={store.request.status >= 10 && store.rol < 20}
                  />
                </div>

              </>
            )}

            {/* Nota importante */}
            <div className="mt-6">
              <p className="text-sm">
                Es necesario que tenga copia de la última sentencia emitida por el juzgado de lo contrario no podemos atender la solicitud sin esta información. Puede continuar con su solicitud pero recuerde que es importante que nos aporte dicha sentencia para continuar con el trámite correspondiente.
              </p>
            </div>

            <p className="mt-4">
              Costo del trámite:
            </p>
            <p className="mt-4">
              US$300.00 incluyendo gastos.
            </p>
            <p className="mt-4">
              Método de pago: US$150.00 al momento de la solicitud y US$150.00 debe ser cancelado antes de la audiencia.
            </p>
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
