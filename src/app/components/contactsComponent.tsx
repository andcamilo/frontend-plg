import React, { useState, useEffect } from 'react';
import { Typography, Box, Link as MuiLink } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';

const ContactComponent: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Solo se ejecuta en cliente
    const userAgent = navigator.userAgent || navigator.vendor;
    const mobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    setIsMobile(mobile);
  }, []);

  const contactItems = [
    {
      icon: <EmailIcon sx={{ color: '#D81B60', mr: 2 }} />,
      label: 'info@panamalegalgroup.com ',
      link: 'mailto:info@panamalegalgroup.com ',
    },
    {
      icon: <WhatsAppIcon sx={{ color: '#25D366', mr: 2 }} />,
      label: '+507 6985-3352',
      link: "https://api.whatsapp.com/send/?phone=50769853352&text&type=phone_number&app_absent=0",
    },
    {
      icon: <InstagramIcon sx={{ color: '#C13584', mr: 2 }} />,
      label: 'Instagram Panama Legal Group',
      link: 'https://www.instagram.com/panamalegalgroup',
    },
    {
      icon: <LinkedInIcon sx={{ color: '#0077B5', mr: 2 }} />,
      label: 'LinkedIn Panama Legal Group',
      link: 'https://www.linkedin.com/company/panama-legal-group/',
    },
    {
      icon: <LanguageIcon sx={{ color: '#4FC3F7', mr: 2 }} />,
      label: 'Sitio Web Oficial',
      link: 'https://panamalegalgroup.com/contactenos/',
    },
    {
      icon: <PhoneIcon sx={{ color: '#03a9f4', mr: 2 }} />,
      label: '(507) 396-1402',
      link: 'tel:+5073961402',
      type: 'phone',
    },
    {
      icon: <LocationOnIcon sx={{ color: '#E53935', mr: 2 }} />,
      label: 'Calle 50, Ciudad de Panamá, Panamá',
      link: 'https://maps.app.goo.gl/12h1dsAyA4ScTLaz8',
    },
  ];

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', mt: 8 }}>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
        Contáctanos
      </Typography>

      {contactItems.map((item, index) => {
        const isPhone = item.type === 'phone';

        if (isPhone && !isMobile) {
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                backgroundColor: '#1F1F2E',
                borderRadius: '8px',
                px: 3,
                py: 2,
                mb: 2,
              }}
            >
              {item.icon}
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {item.label}
              </Typography>
            </Box>
          );
        }

        return (
          <MuiLink
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              backgroundColor: '#1F1F2E',
              borderRadius: '8px',
              px: 3,
              py: 2,
              mb: 2,
              '&:hover': {
                backgroundColor: '#292940',
                textDecoration: 'none',
              },
            }}
          >
            {item.icon}
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {item.label}
            </Typography>
          </MuiLink>
        );
      })}
    </Box>
  );
};

export default ContactComponent;
