import React from 'react';

const PensionAlimenticiaForm: React.FC = () => {
  return (
    <div className="w-1/2 h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
      <h1 className="text-white text-4xl font-bold">¡Bienvenido a la Solicitud de Pensión Alimenticia en Línea!</h1>
      <p className="text-white mt-4">
        Estimado cliente, por favor asegúrese de leer la descripción a continuación antes de solicitar el trámite y para aclarar dudas. Si usted requiere una consulta con uno de nuestros abogados de familia antes de proceder, por favor solicite su cita aquí. La misma puede ser virtual o presencial.
      </p>
      <h2 className="text-white text-2xl font-bold mt-8">Nombre del solicitante/contacto:</h2>
      <p className="text-white mt-2">
        * Puede ser la misma persona, o bien un amigo o un familiar que ayude a quien solicita la pensión, y quien sea el punto de contacto para las coordinaciones pertinentes:
      </p>
      <form className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" className="p-4 bg-gray-800 text-white rounded-lg" placeholder="Nombre completo" />
          <input type="text" className="p-4 bg-gray-800 text-white rounded-lg" placeholder="Número de teléfono" />
          <input type="text" className="p-4 bg-gray-800 text-white rounded-lg" placeholder="Número de teléfono alternativo" />
          <input type="email" className="p-4 bg-gray-800 text-white rounded-lg" placeholder="Dirección de correo electrónico" />
          <input type="email" className="p-4 bg-gray-800 text-white rounded-lg" placeholder="Confirmar correo electrónico" />
        </div>
        {/* More form fields as needed */}
      </form>
      <p className="text-white mt-2">
        Si en vez de realizar una consulta completa con nuestros abogados, sólo quieres saber si aplicas o no para esta solicitud antes de continuar, puedes enviarnos un resumen de tu caso, y en 48 horas o menos te confirmaremos si puedes proceder o no. Haz click aquí para enviar resumen de tu caso:
      </p>

      {/* Condiciones del servicio */}
      <div className="mt-8 text-white">
        <h2 className="text-3xl font-bold">Condiciones del servicio</h2>
        <p className="mt-4">
          Le recordamos las Condiciones del servicio de este trámite, por favor leer atentamente y analizar bien su entendimiento:
        </p>
        <ul className="list-disc list-inside mt-4">
          <li>Todos los datos recaudados serán utilizados únicamente para el proceso que se solicita. Ejecutamos el proceso de manejo de esta información conforme a la Ley de Protección de Datos Personales y su Reglamentación.</li>
          <li>Este es un trámite digital que permite agilizar y facilitar el acceso al trámite de Solicitud de Pensión Alimenticia, nuestros abogados ejecutarán el proceso ante las autoridades según lo establecido en la Ley, y mantendrán constante contacto y actualización con el cliente.</li>
          <li>El cliente podrá solicitar, una vez contratado el servicio, reuniones de seguimiento con el abogado asignado a su caso.</li>
          <li>El costo del servicio en este trámite sólo se limita al Proceso de Solicitud de Pensión Alimenticia en primera instancia, no incluye Apelaciones ni otros procesos conexos como Divorcio, Guarda y Crianza, entre otros. Según la complejidad del caso, podrían surgir otros gastos de la cual serán presentados al cliente para su aprobación previa.</li>
          <li>Usted podrá ver el seguimiento de su trámite en línea con su número de trámite, y podrá recibir notificaciones a su correo electrónico si así lo escoge.</li>
          <li>Una vez se inicie el trámite, nuestro equipo se pondrá en contacto con usted para coordinar la visita de entrega o retiro de documentos originales y firmas correspondientes.</li>
        </ul>
        <p className="mt-4">
          * Podemos notificar a tu correo cuando se registra algún avance de tu trámite, o puedes revisarlo en el sistema directamente. Además, nuestros abogados y equipo legal estarán en contacto contigo. ¿Deseas que te notifiquemos a tu correo?
        </p>
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input type="radio" name="notification" className="form-radio" />
            <span className="ml-2">Sí, enviarme las notificaciones por correo electrónico.</span>
          </label>
          <br />
          <label className="inline-flex items-center mt-2">
            <input type="radio" name="notification" className="form-radio" />
            <span className="ml-2">No, lo reviso directamente en el sistema.</span>
          </label>
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox" />
            <span className="ml-2">Acepto los términos y condiciones de este servicio.</span>
          </label>
        </div>
        <div className="mt-4">
          <div className="g-recaptcha" data-sitekey="your-site-key"></div>
        </div>
        <button className="bg-profile text-white w-full py-3 rounded-lg mt-4">Guardar y continuar</button>
      </div>
    </div>
  );
}

export default PensionAlimenticiaForm;
