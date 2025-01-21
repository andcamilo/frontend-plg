import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { backendBaseUrl } from '@utils/env';

// Definir todos los campos que corresponden al formulario
interface PersonData {
  solicitudId?: string;
  tipoPersona: string;
  nombreApellido: string;
  sexo: string;
  nacionalidad: string;
  cedulaPasaporte: string;
  paisNacimiento: string;
  fechaNacimiento: string;
  direccion: string;
  paisResidencia: string;
  profesion: string;
  telefono: string;
  email: string;
  esPoliticamenteExpuesta: string;
  personaExpuestaFecha: string;
  personaExpuestaCargo: string;
  
  // Persona Juridica
  nombreJuridico: string,
  paisJuridico: string,
  registroJuridico: string,

  // Referencias bancarias
  bancoNombre: string;
  bancoTelefono: string;
  bancoEmail: string;

  // Referencias comerciales
  comercialNombre: string;
  comercialTelefono: string;
  comercialEmail: string;

  adjuntoDocumentoCedulaPasaporteURL: string;
  adjuntoDocumentoCedulaPasaporte2URL: string;
}

const createPersontUrl = `${backendBaseUrl}/dev/create-person`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const personData: PersonData = req.body;

  try {
    console.log("🚀 ~ Sending person data:", personData);

    // Enviar la solicitud a la API de backend con todos los campos
    const response = await axios.post(createPersontUrl, personData);

    console.log("🚀 ~ Response data:", response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating person:', error);

    const errorMessage = error.response?.data?.message || 'Failed to create person';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
