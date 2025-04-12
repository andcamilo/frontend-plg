import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqComponentProps {
  faqItems?: FaqItem[];
  title?: string;
}

const defaultFaqItems: FaqItem[] = [
  {
    question: '¿Qué es LEGIX?',
    answer:
      'Es una plataforma de trámites legales digitales y el producto digital de Panama Legal Group, que permite a los usuarios realizar una variedad de trámites legales de manera electrónica, simplificando el proceso y eliminando la necesidad de visitar físicamente las oficinas gubernamentales o legales. Esto nos permite gestionar los procesos de manera más eficiente y transparente, sin perder la atención personalizada.',
  },
  {
    question: '¿Cómo puedo rastrear el progreso de mi solicitud en tiempo real a través de su plataforma?',
    answer:
      'Nuestra plataforma en línea te permitirá seguir cada paso del proceso y recibir actualizaciones regulares garantizando así nuestro servicio. Una vez hayas realizado el ingreso de tus generales como solicitante, se te remitirá un correo electrónico con la contraseña para que ingreses con tu correo. Puedes ingresar a tu perfil en cualquier momento y dar seguimiento en línea de tu trámite. Nuestros abogados de igual forma se mantendrán en contacto contigo, manteniendo la atención personalizada que mereces. Puedes escoger también el envío de un correo por cada avance.',
  },
  {
    question: '¿Tienen algún tipo de política de devolución o garantía si mi solicitud no se gestiona?',
    answer:
      'En situaciones excepcionales donde una solicitud no puede ser aprobada por razones fuera de tu control, trabajaremos contigo para encontrar soluciones o ajustes necesarios, o la devolución de los fondos si es necesario. Comunica cualquier problema y trabajaremos juntos para resolverlo. Por supuesto, en aquellos casos que la firma por algún motivo no realice el proceso por alguna naturaleza, gestionamos una política de devolución.',
  },
  {
    question: '¿Qué pasa si necesito otros servicios no están en el formulario digital?',
    answer:
      '¡No pasa nada! Incluye al final del requerimiento cualquier otra asistencia que necesites, y nuestro personal idóneo se comunicará contigo para las gestiones correspondientes y así poder brindarte el apoyo que requieras. También puedes ir a nuestro trámite de Solicitud de Consultas.',
  },
  {
    question: '¿Incluirán más trámites digitales?',
    answer:
      'Sí, vamos a estar incluyendo distintos trámites digitales paulatinamente para brindar un mejor servicio a nuestros clientes.',
  },
  {
    question: '¿Cómo accedo a los trámites?',
    answer:
      'Escoge el proceso que necesites y llena la información general de quien solicita el proceso. Una vez que llenas la información, se te hará un registro automático, donde te llegará un correo electrónico con la clave para que puedas ingresar posteriormente a dar seguimiento a tu trámite, o solicitar otros trámites dentro de tu perfil. Mientras, podrás seguir con el proceso de solicitud de trámite.',
  },
  {
    question: '¿Qué información se introduce en los datos generales del solicitante?',
    answer:
      'Puede ser cualquier persona que tenga el acceso al formulario, y puede gestionarlo en nombre de terceros. Sería la persona que recibiría el acceso al sistema para dar el seguimiento al trámite. Puede ser cualquier representante, asistente o terceros interesados.',
  },
  {
    question: '¿Es segura la plataforma en términos de privacidad y protección de datos?',
    answer:
      'Sí, nos tomamos muy en serio la privacidad y la seguridad de tus datos. Utilizamos tecnologías de cifrado y seguimos las mejores prácticas de seguridad para proteger la información de nuestros usuarios, y sólo utilizamos la información para los fines de los trámites. Puedes verificar nuestras políticas de privacidad.',
  },
  {
    question: '¿Puedo obtener asesoramiento o solicitar propuestas legales en la plataforma?',
    answer:
      'Si, ofrecemos servicios de asesoramiento legal a través del trámite Consulta – Propuesta Legal. Podrás programar una consulta escrita, presencial o virtual, y si requieres cotizar una propuesta de algún trámite fuera de los presentados en la plataforma puedes solicitarla a través de esta opción.',
  },
  {
    question: '¿Cuáles son los costos asociados con el uso de la plataforma?',
    answer:
      'Los costos pueden variar según el tipo de trámite y los servicios adicionales que elijas. Algunos trámites pueden ser gratuitos, mientras que otros tendrán tarifas asociadas. Te proporcionaremos información detallada sobre los costos antes de confirmar tu trámite.',
  },
  {
    question: '¿Qué documentos necesito para realizar un trámite específico?',
    answer:
      'Cada trámite puede requerir documentos específicos. Nuestra plataforma te guiará a través de los requisitos y te proporcionará una lista de documentos necesarios antes de comenzar el proceso.',
  },
  {
    question: '¿Cuánto tiempo se tarda en completar un trámite en la plataforma?',
    answer:
      'El tiempo necesario para completar un trámite puede variar según su complejidad y la velocidad de respuesta de las entidades gubernamentales involucradas. Haremos todo lo posible para agilizar el proceso y te proporcionaremos actualizaciones en tiempo real sobre el estado de tu trámite.',
  },
  {
    question: '¿Qué sucede si tengo problemas técnicos mientras utilizo la plataforma?',
    answer:
      'Si experimentas problemas técnicos, puedes ponerse en contacto con nuestro servicio de soporte técnico. Estamos aquí para ayudarte a resolver cualquier problema y garantizar una experiencia fluida en la plataforma.',
  },
];

const FaqComponent: React.FC<FaqComponentProps> = ({
  faqItems,
  title = 'Preguntas Frecuentes LEGIX',
}) => {
  const [expanded, setExpanded] = useState<number | false>(false);
  const [allExpanded, setAllExpanded] = useState(false);

  const items = faqItems && faqItems.length > 0 ? faqItems : defaultFaqItems;

  const handleChange = (panel: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleExpandAll = () => {
    if (allExpanded) {
      setExpanded(false);
      setAllExpanded(false);
    } else {
      setExpanded(-1);
      setAllExpanded(true);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 4 }}>
        {title}
      </Typography>

      {items.map((item, index) => (
        <Accordion
          key={index}
          expanded={allExpanded || expanded === index}
          onChange={handleChange(index)}
          sx={{
            backgroundColor: '#1F1F2E',
            color: 'white',
            mb: 2,
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            '&:before': {
              display: 'none',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
            aria-controls={`panel${index + 1}-content`}
            id={`panel${index + 1}-header`}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {index + 1}. {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: 'white' }}>{item.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button
          variant="text"
          sx={{
            color: 'white',
            textTransform: 'uppercase',
            '&:hover': {
              color: '#03a9f4',
            },
          }}
          onClick={handleExpandAll}
        >
          {allExpanded ? 'Colapsar todas las FAQ' : 'Ver todas las FAQ'}
        </Button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
          Estamos aquí para responder a tus preguntas y hacer que el proceso de solicitud de sociedad anónima sea lo más sencillo posible. ¡Contáctanos si necesitas más información!
          {/* <a href="mailto:info@legix.net" style={{ color: '#D81B60', fontWeight: 'bold', textDecoration: 'none' }}> AQUÍ</a> o al 
          <a href="https://api.whatsapp.com/send/?phone=50769853352&text&type=phone_number&app_absent=0" style={{ color: '#D81B60', fontWeight: 'bold', textDecoration: 'none' }}> WHATSAPP</a>! */}
        </Typography>
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link
          href="/contacts"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-profile text-white font-semibold py-4 px-2 rounded-lg transition-colors block h-24 flex items-center justify-center text-center"
        >
          Contáctanos
        </Link>
      </div>
    </div>
  );
};

export default FaqComponent;
