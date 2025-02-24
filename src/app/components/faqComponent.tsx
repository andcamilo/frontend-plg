import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FaqComponent: React.FC = () => {
  const [expanded, setExpanded] = useState<number | false>(false);
  const [allExpanded, setAllExpanded] = useState(false);

  const faqItems = [
    {
        question: '¿Qué es LEGIX?',
        answer:
            'Es una plataforma de trámites legales digitales y el producto digital de Panama Legal Group, que permite a los usuarios realizar una variedad de trámites legales de manera electrónica.',
    },
    {
        question: '¿Cómo puedo rastrear el progreso de mi solicitud en tiempo real?',
        answer:
            'Nuestra plataforma en línea te permitirá seguir cada paso del proceso y recibir actualizaciones regulares garantizando así nuestro servicio.',
    },
    {
        question: '¿Tienen algún tipo de política de devolución o garantía?',
        answer:
            'En situaciones excepcionales donde una solicitud no puede ser aprobada por razones fuera de tu control, trabajaremos contigo para encontrar soluciones o ajustes necesarios.',
    },
    {
        question: '¿Qué pasa si necesito otros servicios no están en el formulario digital?',
        answer:
            'Incluye cualquier asistencia que necesites al final del requerimiento y nuestro personal se comunicará contigo para brindarte el apoyo correspondiente.',
    },
    {
        question: '¿Incluirán más trámites digitales?',
        answer:
            'Sí, estaremos incluyendo nuevos trámites digitales para brindar un mejor servicio.',
    },
    {
        question: '¿Cómo accedo a los trámites?',
        answer:
            'Escoge el proceso y llena la información general, recibirás un correo electrónico con la clave para dar seguimiento.',
    },
    {
        question: '¿Qué información se introduce en los datos generales del solicitante?',
        answer:
            'Puede ser cualquier persona que tenga el acceso al formulario, y puede gestionarlo en nombre de terceros.',
    },
    {
        question: '¿Es segura la plataforma en términos de privacidad y protección de datos?',
        answer:
            'Sí, utilizamos tecnologías de cifrado y seguimos las mejores prácticas de seguridad para proteger la información de nuestros usuarios.',
    },
    {
        question: '¿Puedo obtener asesoramiento o solicitar propuestas legales en la plataforma?',
        answer:
            'Sí, ofrecemos servicios de asesoramiento legal a través del trámite Consulta – Propuesta Legal.',
    },
    {
        question: '¿Cuáles son los costos asociados con el uso de la plataforma?',
        answer:
            'Los costos pueden variar según el tipo de trámite y los servicios adicionales que elijas.',
    },
    {
        question: '¿Qué documentos necesito para realizar un trámite específico?',
        answer:
            'Cada trámite puede requerir documentos específicos, nuestra plataforma te guiará a través de los requisitos.',
    },
    {
        question: '¿Cuánto tiempo se tarda en completar un trámite?',
        answer:
            'El tiempo necesario para completar un trámite puede variar según su complejidad y la velocidad de respuesta de las entidades gubernamentales involucradas.',
    },
    {
        question: '¿Qué sucede si tengo problemas técnicos mientras utilizo la plataforma?',
        answer:
            'Si experimentas problemas técnicos, puedes contactarte con nuestro servicio de soporte técnico para resolver cualquier inconveniente.',
    },
];

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
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
      <Typography
        variant="h4"
        sx={{
          color: 'white',
          fontWeight: 'bold',
          mb: 4,
        }}
      >
        FAQ
      </Typography>
      {faqItems.map((item, index) => (
        <Accordion
          key={index}
          expanded={allExpanded || expanded === index}
          onChange={handleChange(index)}
          sx={{
            backgroundColor: 'rgb(33, 33, 33)',
            color: 'white',
            mb: 2,
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            '&:before': {
              display: 'none', // Remove the default border effect in MUI Accordion
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

      {/* Button to view all FAQs */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Button
          variant="text"
          sx={{
            color: 'white',
            textTransform: 'uppercase',
            '&:hover': {
              color: '#03a9f4', // Light blue hover effect
            },
          }}
          onClick={handleExpandAll}
        >
          {allExpanded ? 'Colapsar todas las FAQ' : 'Ver todas las FAQ'}
        </Button>
      </div>
    </div>
  );
};

export default FaqComponent;
