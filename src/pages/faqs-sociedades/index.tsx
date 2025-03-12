import React, { useState } from 'react';
import HomeLayout from '@components/homeLayout';
import FaqComponent from '@/src/app/components/faqComponent';

const faqSociedadesItems = [
    {
      question: '¿Qué es una sociedad anónima y por qué debería considerar tener una en Panamá?',
      answer:
        'Una sociedad anónima es una entidad legal que permite la operación de negocios de manera formal y ofrece beneficios fiscales y de privacidad. En Panamá, es una excelente opción para proteger activos y realizar operaciones tanto dentro como fuera del país.',
    },
    {
      question: '¿Cuáles son los pasos para solicitar una sociedad anónima en línea?',
      answer: `El proceso es simple:
  
  Completa el formulario proporcionando información sobre tu empresa.
  Carga los documentos requeridos, como identificaciones y comprobante de domicilio.
  Realiza el pago a través de opciones como tarjeta de crédito, depósito o transferencia.
  Nuestros expertos revisarán los documentos y te asesorarán si es necesario.
  Una vez aprobada tu solicitud, procederemos con la creación legal de tu sociedad anónima.`,
    },
    {
      question: '¿Cuánto tiempo lleva obtener una sociedad anónima a través de este trámite en línea?',
      answer:
        'Por lo general, el proceso de inscripción toma entre 2 a 5 días hábiles, dependiendo de la documentación y aprobación gubernamental. Todas las sociedades requieren el Registro del RUC, ante la Dirección General de Ingresos, que puede demorar hasta cinco (5) días para su aprobación. Toma en cuenta que si requieres Aviso de Operación (sólo los casos que incluye actividades DENTRO de Panamá), se incluye un día más, y el proceso de inscripción municipal se presenta dentro de los dos días hábiles siguientes.',
    },
    {
      question: '¿Cuáles son los costos totales, incluidos los honorarios profesionales y otros gastos?',
      answer:
        'Los costos pueden variar según el tipo de sociedad y servicios adicionales que requieras. Te proporcionaremos un desglose claro de los costos una vez vas llenando el trámite según los requerimientos que realices.',
    },
    {
      question: '¿Qué garantía tengo de que mi solicitud será aprobada?',
      answer:
        'Si proporcionas información precisa y cumplimos con los requisitos legales, la sociedad se inscribe sin inconvenientes, por ello es importante que nos proveas la información requerida. Nuestro equipo experimentado te asistirá durante todo el proceso cuando lo necesites.',
    },
    {
      question: '¿Necesito estar físicamente en Panamá para completar el proceso de solicitud?',
      answer:
        'No, puedes completar todo el proceso en línea. No es necesario que estés físicamente en Panamá. Los casos que incluye que estés presente por ejemplo, si requieres alguna entrevista para apertura de cuenta bancaria, esto va a depender del banco, pero puedes tener tu sociedad o compañía inscrita aunque no estés en Panamá.',
    },
    {
      question: '¿Puedo llevar a cabo negocios fuera de Panamá con esta sociedad anónima?',
      answer:
        'Sí, puedes realizar operaciones comerciales tanto dentro como fuera de Panamá con una sociedad anónima establecida aquí.',
    },
    {
      question: '¿Qué responsabilidades continuas tendría una vez que mi sociedad anónima esté creada?',
      answer:
        'Deberás cumplir con requisitos legales periódicos, como presentar informes anuales y mantener un agente residente en Panamá, que incluye el pago de Tasa Única de US$300.00 dólares americanos, y adicionalmente US$350.00 dólares americanos por Agente Residente. Toma nota que los montos pueden estar sujetos a cambios. Esto es aparte de las declaraciones de renta o impuestos en los casos que operes DENTRO de Panamá.',
    },
  ];
  

const FaqPage: React.FC = () => {
    return (
      <HomeLayout>
        <FaqComponent faqItems={faqSociedadesItems} title={"Preguntas Frecuentes sobre la Solicitud de Sociedades Anónimas en Panamá en LEGIX:"} />
      </HomeLayout>
    );
  };
  
  export default FaqPage;
