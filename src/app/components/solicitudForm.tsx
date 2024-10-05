import React from 'react';

interface SolicitudFormProps {
  formData: {
    pensionType: string;
    pensionAmount?: number;
    receiveSupport?: string;
    currentSupportAmount?: number;
    pensionCategory?: string;
    currentAmount?: number;
    increaseAmount?: number;
    totalAmount?: number;
    agreesWithAmount?: string;
    knowsCaseLocation?: string;
    wantsInvestigation?: string;
    pensionSubType?: string;
    reduceAmount?: number;
    suspensionReason?: string;
    paymentDay?: string;
    lastPaymentDate?: string;
    courtName?: string;
    caseNumber?: string;
    sentenceDate?: string;
    sentenceFile?: File;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SolicitudForm: React.FC<SolicitudFormProps> = ({ formData, handleChange, handleFileChange }) => {
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
                value={formData.pensionAmount || ''}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                placeholder="Introduzca el monto"
              />
            </div>

            <div className="mt-6">
              <label className="block font-bold">¿Recibe usted algún aporte por parte del demandado?</label>
              <select
                name="receiveSupport"
                value={formData.receiveSupport || 'No'}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                  value={formData.currentSupportAmount || ''}
                  onChange={handleChange}
                  className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                  placeholder="Introduzca el monto"
                />
              </div>
            )}

            <div className="mt-6">
              <label className="block font-bold">¿Qué tipo de pensión requiere solicitar?</label>
              <select
                name="pensionCategory"
                value={formData.pensionCategory || ''}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
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
                value={formData.currentAmount || ''}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                placeholder="Introduzca el monto actual"
              />
            </div>

            <div className="mt-6">
              <label className="block font-bold">¿Cuánto desea solicitar de aumento?</label>
              <input
                type="number"
                name="increaseAmount"
                value={formData.increaseAmount || ''}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                placeholder="Introduzca el monto de aumento"
              />
            </div>

            <div className="mt-6">
              <label className="block font-bold">El monto total que desea recibir es el siguiente</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount || ''}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
                placeholder="Introduzca el monto total"
              />
            </div>

            <div className="mt-6">
              <label className="block font-bold">¿Está usted de acuerdo con el monto total que recibirá?</label>
              <select
                name="agreesWithAmount"
                value={formData.agreesWithAmount || ''}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
              >
                <option value="Si">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        );
      // Add more cases like 'Rebaja o Suspensión', 'Desacato', etc. following the same pattern.
      default:
        return null;
    }
  };

  return <>{renderForm()}</>;
};

export default SolicitudForm;
