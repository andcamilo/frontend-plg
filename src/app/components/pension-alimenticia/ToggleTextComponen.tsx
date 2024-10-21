import React, { useState } from 'react';

const ToggleTextComponent: React.FC = () => {
  const [isTextVisible, setIsTextVisible] = useState(false);

  const handleToggle = () => {
    setIsTextVisible(!isTextVisible);
  };

  return (
    <div className="mt-6">
      <button
        className="bg-purple-600 text-white py-2 px-4 rounded-md mb-4"
        onClick={handleToggle}
      >
        ¿Cómo Funciona el Proceso? {isTextVisible ? '▲' : '▼'}
      </button>
      
      {isTextVisible && (
        <div className="bg-gray-800 p-4 rounded-lg text-white">
          <p>
            Usted llena la información y del trámite de Solicitud de Pensión Alimenticia y Procede a realizar el pago que corresponde al 50% para que iniciemos el proceso. Este trámite puede realizarlo personalmente sin abogado, sin embargo, nosotros proporcionamos el trámite de solicitud digital y asistencia al proceso para que usted sólo reciba avances del mismo, y no tenga que perder su apreciado tiempo en él. Pueden existir gastos adicionales dependiendo de la complejidad y en caso de que surjan otros procesos conexos, que serán aprobados previamente por usted, esta solicitud sólo incluye el proceso de pensión en PRIMERA instancia, y no incluye otros trámites como Guarda y Crianza, apelaciones, divorcio, entre otros.
          </p>
          <p className="mt-4">
            En el proceso se coordina el lugar y fecha de recaudo de documentos originales, así como la firma de la documentación pertinente.
          </p>
          <p className="mt-4">
            Se presenta el proceso ante el RUE o juzgado que corresponde al área donde vive la persona que va a recibir la pensión alimenticia.
          </p>
          <p className="mt-4">
            El Registro Único de Entrada (RUE) recibe la solicitud de pensión alimenticia, lo reparte y entrega al despacho judicial determinado. De no contar con Registro Único de Entrada, el trámite se presenta ante el Juzgado de Niñez y Adolescencia, Juzgado Municipal de Familia, o Juzgado Municipal Mixto en turno. En los casos de Revisión de Pensión, se gestiona en el mismo Juzgado.
          </p>
          <p className="mt-4">
            El juzgado le da entrada al expediente y procede a admitirlo mediante una resolución denominada “auto”. Existen casos en que puede no admitirlo, ya sea por falta de competencia del juzgado o porque existe un conocimiento previo del caso. A su vez, puede ordenar la corrección de la solicitud por defectos de forma o falta de requisitos. Si el usuario interesado no corrige, la solicitud se archiva. Escenario Alternativo: Los usuarios podrán ir voluntariamente, si guardan buena relación, a la vía de mediación judicial; el juez podrá proponer la mediación y el expediente será enviado a través de un formulario de derivación al Centro de Mediación Judicial.
          </p>
          <p className="mt-4">
            Admitida la demanda se procederá a realizar las notificaciones:
            <ul className="list-disc list-inside pl-4">
              <li>Se gira boleta de citación a cargo del demandado</li>
              <li>Si el demandado reside en la misma provincia que el beneficiario, se hará por medio de notificador del Centro de Comunicaciones Judiciales (CCJ), mismo que notifica de forma personal a ambas partes.</li>
              <li>Si el demandado reside en provincia distinta al beneficiario, se envía al juzgado más cercano al domicilio del demandado un “Exhorto”.</li>
              <li>Si el demandado reside en país extranjero, el juzgado enviará una “carta rogatoria”.</li>
            </ul>
          </p>
          <p className="mt-4">
            Audiencia: Declarada abierta la audiencia, el juez procede a conciliar a las partes. De no haber acuerdo, las partes presentarán sus pruebas y el juez fijará la pensión.
          </p>
          <p className="mt-4">
            La pensión será provisional si se considera necesario la práctica de pruebas adicionales. Luego de practicadas las mismas, se fijará pensión definitiva.
          </p>
          <p className="mt-4">
            La pensión puede ser modificada luego de un (1) año de haber sido fijada.
          </p>
          <p className="mt-4">
            <strong>APELACIÓN:</strong> La parte que considera que la resolución del juez no es justa, puede proceder a apelar.
            <ul className="list-disc list-inside pl-4">
              <li>El recurso de apelación podrá interponerse al momento de la notificación o por escrito, dentro de tres (3) días.</li>
              <li>Si el usuario que apela no sustenta, se declara desierto el recurso.</li>
              <li>Resuelto el recurso, el expediente es devuelto a su juzgado de origen.</li>
            </ul>
          </p>
        </div>
      )}
    </div>
  );
};

export default ToggleTextComponent;
