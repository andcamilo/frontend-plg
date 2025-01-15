import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FaqComponent: React.FC = () => {
  const [expanded, setExpanded] = useState<number | false>(false);
  const [allExpanded, setAllExpanded] = useState(false); // State to track whether all FAQs are expanded

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
      // Collapse all FAQs
      setExpanded(false);
      setAllExpanded(false);
    } else {
      // Expand all FAQs
      setExpanded(-1); // Special value to indicate all are expanded
      setAllExpanded(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Typography variant="h4" className="text-white font-bold mb-4">
        FAQ
      </Typography>
      {faqItems.map((item, index) => (
        <Accordion
          key={index}
          className="bg-component text-white mb-2"
          expanded={allExpanded || expanded === index}
          onChange={handleChange(index)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon className="text-white" />}
            aria-controls={`panel${index + 1}-content`}
            id={`panel${index + 1}-header`}
          >
            <Typography variant="h6" className="font-bold">
              {index + 1}. {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{item.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Button to view all FAQs */}
      <div className="text-center mt-8">
        <Button variant="text" className="text-white" onClick={handleExpandAll}>
          {allExpanded ? 'Colapsar todas las FAQ' : 'Ver todas las FAQ'}
        </Button>
      </div>
    </div>
  );
};

export default FaqComponent;
