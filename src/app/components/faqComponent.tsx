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
