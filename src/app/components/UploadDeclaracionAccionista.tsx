import React from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';
import axios from 'axios';
import DownloadIcon from '@mui/icons-material/Download';

interface Props {
    personaId: string;
    solicitudId: string;
    nombreAccionista: string;
    onUploaded?: () => void; // callback opcional para refrescar datos si lo deseas
}

const UploadDeclaracionAccionista: React.FC<Props> = ({ personaId, solicitudId, nombreAccionista, onUploaded }) => {

    const handleDownload = async () => {
        try {
            // Llamar a la API para obtener la URL del archivo
            const response = await axios.post('/api/create-declaracion-jurada-file', { nombreAccionista });
            console.log("Nombre Accionista", nombreAccionista)
            if (response.data && response.data.fileUrl) {
                // Crear un enlace temporal para descargar el archivo
                const url = response.data.fileUrl;
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'declaracion_jurada.docx'); // Establecer el nombre del archivo
                document.body.appendChild(link);

                // Simular clic para descargar el archivo
                link.click();

                // Verificar si `link` tiene un nodo padre antes de eliminarlo
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            } else {
                alert('No se pudo obtener el archivo. Por favor, inténtelo nuevamente.');
            }
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            alert('Hubo un error al intentar descargar el archivo.');
        }
    };

    return (
        <div className="flex flex-col gap-1 text-white text-xs items-start">
            <button
                onClick={handleDownload}
                className="bg-gray-600 text-white py-1 px-2 rounded text-xs mb-1 hover:bg-profile transition-colors flex items-center gap-1"
            >
                <DownloadIcon style={{ fontSize: '14px' }} />
                Descargar declaración
            </button>

        </div>
    );
};

export default UploadDeclaracionAccionista;
