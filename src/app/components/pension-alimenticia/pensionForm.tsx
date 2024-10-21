import React, { useContext } from 'react';
import AppStateContext from '@context/context'; // Import the context

const PensionForm: React.FC = () => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;
  const formData = store.solictud;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const numericValue = name === 'currentAmount' || name === 'increaseAmount' ? Number(value) : value;
    const newTotalAmount = formData.currentAmount + formData.increaseAmount;

    setStore((prevState) => ({
      ...prevState,
      solicitud: {
        ...prevState.solictud,
        [name]: numericValue,
        totalAmount: newTotalAmount,
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setStore((prevState) => ({
      ...prevState,
      solicitud: {
        ...prevState.solictud,
        sentenceFile: file,
      },
    }));
  };


  const renderPensionCategoryMessage = () => {
    switch (formData.pensionCategory) {
      case 'Hijos menores de edad':
        return (
          <div className="mt-8">
            <p className="mt-4">
              <strong>
                Los menores de edad se presentan a través de alguno de sus padres, tutor o quien mantenga la patria potestad.
              </strong>
            </p>
            <p className="mt-4">
              <strong>Requisitos:</strong> Por favor prepare los siguientes documentos e información para gestionar la solicitud de pensión de alimentos de menores de edad.
            </p>
            <ul className="list-disc list-inside mt-4">
              <li>Copia de la cédula o documento de identidad de la persona solicitante</li>
              <li>Certificado(s) de Nacimiento de la(s) persona(s) que va(n) a recibir o reciben la pensión alimenticia.</li>
            </ul>
          </div>
        );
      case 'Mayores de edad hasta 25 años con estudios en curso':
        return (
          <div className="mt-8">
            <p className="mt-4">
              <strong>Por favor prepare los siguientes documentos e información para gestionar la solicitud de pensión de alimentos de mayores de edad.</strong>
            </p>
            <ul className="list-disc list-inside mt-4">
              <li>Copia de la cédula o documento de identidad de la persona solicitante;</li>
              <li>Certificado(s) de Nacimiento de la(s) persona(s) que va(n) a recibir la pensión alimenticia;</li>
              <li>
                <strong>NO APLICAN:</strong> En caso de trabajar, debe demostrar que su ingreso no es suficiente para subsistir para poder solicitar la pensión. En caso de matrimonio o unión de hecho, pierde el derecho de pensión alimenticia.
              </li>
              <li>Copia de los créditos actualizados y recibos de matrícula del estudiante mayor de edad. Deben ser cursados con buenas calificaciones y tiempo completo.</li>
            </ul>
          </div>
        );
        
      case 'Mujer embarazada (ayuda prenatal)':
        return (
          <div className="mt-8">
            <p className="mt-4">
              <strong>
                Por favor prepare los siguientes documentos e información para gestionar la solicitud de pensión de alimentos de menores de edad, y además debe tomar en cuenta lo siguiente:
              </strong>
            </p>
            <ul className="list-disc list-inside mt-4">
              <li>Copia de la cédula o documento de identidad de la persona solicitante;</li>
              <li>Deberá hacer una declaración jurada ante el juez, una vez se admita el proceso. Le estaríamos guiando en este punto,</li>
              <li>La pensión cubre el período de embarazo hasta 3 meses de nacido. Después de los 3 meses se establece una pensión alimenticia no prenatal.</li>
              <li>Aportar prueba de embarazo.</li>
              <li>Se contemplará para fijar la pensión:</li>
              <ul className="list-inside pl-5">
                <li>a. Control médico, medicamentos y gastos parto.</li>
                <li>b. Vestidos adecuados para la maternidad.</li>
                <li>c. Gastos de mobiliario y ropa del recién nacido.</li>
              </ul>
              <li>En casos de haber incurrido en estos gastos, favor aportar los recibos o facturas de los mismos.</li>
            </ul>
          </div>
        );
      
      case 'Personas con discapacidad':
        return (
          <div className="mt-8">
            <p className="mt-4">
              <strong>Por favor prepare los siguientes documentos e información para gestionar la solicitud de pensión de alimentos de menores de edad.</strong>
            </p>
            <ul className="list-disc list-inside mt-4">
              <li>Copia de la cédula o documento de identidad de la persona solicitante;</li>
              <li>Certificado(s) de Nacimiento de la(s) persona(s) que va(n) a recibir la pensión alimenticia;</li>
              <li>Diagnóstico médico.</li>
            </ul>
          </div>
        );
      
      case 'En condición de Cónyuge':
        return (
          <div className="mt-8">
          </div>
        );
      case 'Padres o ascendientes de grado más próximo (abuelos)':
        return (
          <div className="mt-8">
            <p className="mt-4">
              <strong>Por favor prepare los siguientes documentos e información para gestionar la solicitud de pensión de alimentos de menores de edad.</strong>
            </p>
            <ul className="list-disc list-inside mt-4">
              <li>Copia de la cédula o documento de identidad de la persona solicitante;</li>
              <li>Certificado(s) de Nacimiento de la(s) persona(s) que va(n) a recibir la pensión alimenticia;</li>
              <li>
                En el caso de ascendientes, aplica cuando la persona obligada haya fallecido, sea de paradero desconocido, privado de libertad, o tenga discapacidad grave o enfermedad y no pueda cubrir la pensión.
              </li>
              <li>Sólo es hasta segundo grado de parentesco.</li>
            </ul>
          </div>
        );
        
      case 'Hermanos':
        return (
          <div className="mt-8">
            <p className="mt-4">
              <strong>Por favor prepare los siguientes documentos e información para gestionar la solicitud de pensión de alimentos de menores de edad.</strong>
            </p>
            <ul className="list-disc list-inside mt-4">
              <li>Copia de la cédula o documento de identidad de la persona solicitante;</li>
              <li>
                Sólo aplica para cubrir las necesidades básicas para quien deba recibirlos, siempre que sea menor de edad o mayor de edad con alguna discapacidad.
              </li>
            </ul>
          </div>
        );
        
      default:
        return null;
    }
  };



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
              />
            </div>

            <div className="mt-6">
              <label className="block font-bold">¿Recibe usted algún aporte por parte del demandado?</label>
              <select
                name="receiveSupport"
                value={formData.receiveSupport}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
              >
                <option value="No">No</option>
                <option value="Sí">Sí</option>
              </select>
            </div>

            {formData.receiveSupport === 'Sí' && (
              <div className="mt-6">
                <label className="block font-bold">¿Cuánto le están aportando de pensión alimenticia actualmente?</label>
                <input
                  type="number"
                  name="currentSupportAmount"
                  value={formData.currentSupportAmount}
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
                value={formData.pensionCategory}
                onChange={handleChange}
                className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
              >
                <option value="Hijos menores de edad">Hijos menores de edad</option>
                <option value="Mayores de edad hasta 25 años con estudios en curso">
                  Mayores de edad hasta 25 años con estudios en curso
                </option>
              </select>
            </div>

            {renderPensionCategoryMessage()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mt-6">
        <label className="block font-bold">Seleccione la opción que más le convenga:</label>
        <div className="mt-2 space-y-2">
          {['Primera vez', 'Aumento', 'Rebaja o Suspensión', 'Desacato'].map((option) => (
            <label key={option} className="block">
              <input
                type="radio"
                name="pensionType"
                value={option}
                onChange={handleChange}
                checked={formData.pensionType === option}
                className="form-radio"
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
        </div>
      </div>


      {renderForm()}
    </div>
  );
};

export default PensionForm;
