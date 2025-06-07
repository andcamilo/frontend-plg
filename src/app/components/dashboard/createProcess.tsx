import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import get from 'lodash/get';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { auth } from "@configuration/firebase";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CreateProcessFormSI from './CreateProcessFormSI';
import CreateProcessFormNO from './CreateProcessFormNO';

const Actions: React.FC<{ id: string }> = ({ id }) => {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Quiere eliminar este Cliente?",
      icon: 'warning',
      showCancelButton: true,
      background: '#2c2c3e',
      color: '#fff',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/delete-user`, { params: { userId: id } });
        Swal.fire({
          title: 'Eliminado',
          text: 'La solicitud ha sido eliminada.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          willClose: () => window.location.reload(),
        });
      } catch (error) {
        console.error('Error al eliminar la solicitud:', error);
        Swal.fire('Error', 'No se pudo eliminar la solicitud.', 'error');
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Link href={`/dashboard/client/${id}`}>
        <EditIcon className="cursor-pointer" titleAccess="Editar" />
      </Link>
      <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
    </div>
  );
};

const CreateProcessForm: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const rowsPerPage = 10;
  const [form, setForm] = useState({ email: '', tipoTramite: '', tipoSolicitud: '' });
  const [form2, setForm2] = useState({
    nombre: '',
    apellido: '',
    email: '',
    tipoServicio: '',
    nivelUrgencia: '',
    descripcion: '',
    descripcionExtra: '',
    documentos: [null as File | null],
    archivoURLs: ['', '', '']
  });
  const [isDigitalizado, setIsDigitalizado] = useState('SI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmergentFieldVisible, setIsEmergentFieldVisible] = useState(false);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState('');
  const [emailExists, setEmailExists] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsDigitalizado(e.target.value);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleForm2Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm2(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'nivelUrgencia') {
      setIsEmergentFieldVisible(value === 'Atención Extraordinaria');
    }
  };

  const handleForm2FileChange = (index: number, file: File | null) => {
    setForm2(prev => {
      const newDocumentos = [...prev.documentos];
      newDocumentos[index] = file;
      return { ...prev, documentos: newDocumentos };
    });
  };

  const handleFormSubmitSI = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Use selectedSolicitudId from state
      const response = await axios.post('/api/create-record', {
        email: form.email,
        phone: '',
        tipoTramite: form.tipoTramite,
        lawyer: auth.currentUser?.email || '',
        solicitud: selectedSolicitudId // <-- use the selected one
      });

      if (response.data) {
        await Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'El registro ha sido creado correctamente.',
          icon: 'success',
          background: '#2c2c3e',
          color: '#fff',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        setForm({ email: '', tipoTramite: '', tipoSolicitud: '' });
      }
    } catch (error) {
      console.error('Error creating record:', error);
      await Swal.fire({
        title: 'Error al Crear Registro',
        text: 'No se pudo crear el registro. Por favor, intente nuevamente.',
        icon: 'error',
        background: '#2c2c3e',
        color: '#fff',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Intentar de nuevo'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmitNo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 0. Validate email
      const emailResult = await axios.get("/api/validate-email", {
        params: {
          email: form2.email,
          isLogged: "false",
        },
      });
      const { cuenta, isLogged } = emailResult.data;
      if (isLogged && cuenta) {
        await Swal.fire({
          icon: "error",
          title: "Este correo ya está en uso. Por favor, inicia sesión para continuar.",
          showConfirmButton: false,
          timer: 2000,
        });
        setIsSubmitting(false);
        return;
      }

      // 1. Create the request tramite
      const requestData = {
        emailSolicita: form2.email,
        tipoServicio: form2.tipoServicio,
        nivelUrgencia: form2.nivelUrgencia,
        descripcion: form2.descripcion,
        ...(form2.nivelUrgencia === "Atención Extraordinaria" && {
          descripcionExtra: form2.descripcionExtra || "",
        }),
        precio: 0,
        subtotal: 0,
        total: 0,
        accion: "Creación de solicitud",
        tipo: "tramite-general",
        item: "Tramite General",
      };

      const tramiteResponse = await axios.post("/api/create-request-tramite", requestData, {
        headers: { "Content-Type": "application/json" },
      });

      const solicitudId = tramiteResponse.data?.uid;
      if (!solicitudId) throw new Error("No se recibió solicitudId");

      const recordData = {
        solicitudId,
        solicitud: solicitudId,
        name: form2.nombre,
        lastName: form2.apellido,
        email: form2.email,
        phone: '',
        tipoServicio: form2.tipoServicio,
        nivelUrgencia: form2.nivelUrgencia,
        descripcion: form2.descripcion,
        ...(form2.descripcionExtra && { descripcionExtra: form2.descripcionExtra }),
        lawyer: auth.currentUser?.email || '',
      };

      const recordResponse = await axios.post("/api/create-record", recordData, {
        headers: { "Content-Type": "application/json" },
      });

      if (recordResponse.data) {
        await Swal.fire({
          icon: "success",
          title: "Solicitud enviada correctamente",
          timer: 2500,
          showConfirmButton: false,
        });
        setForm2({
          nombre: '',
          apellido: '',
          email: '',
          tipoServicio: '',
          nivelUrgencia: '',
          descripcion: '',
          descripcionExtra: '',
          documentos: [null],
          archivoURLs: ['', '', ''],
        });
        setIsEmergentFieldVisible(false);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al enviar la solicitud",
        text: "Por favor, inténtalo nuevamente.",
      });
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchSolicitudes = async () => {
      if (form.email && form.tipoSolicitud) {
        const db = getFirestore();
        const solicitudesRef = collection(db, "solicitudes");
        const q = query(
          solicitudesRef,
          where("emailSolicita", "==", form.email),
          where("tipo", "==", form.tipoSolicitud)
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSolicitudes(results);
        setSelectedSolicitudId(results[0]?.id || '');
        // Optional: log for debugging
        console.log("🚀 ~ fetchSolicitudes ~ querySnapshot:", querySnapshot);
      } else {
        setSolicitudes([]);
        setSelectedSolicitudId('');
      }
    };
    fetchSolicitudes();
  }, [form.email, form.tipoSolicitud]);

  useEffect(() => {
    const checkEmailExists = async () => {
      if (form.email) {
        const db = getFirestore();
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('email', '==', form.email));
        const querySnapshot = await getDocs(q);
        setEmailExists(!querySnapshot.empty);
      } else {
        setEmailExists(false);
      }
    };
    checkEmailExists();
  }, [form.email]);

  return (
    <>
      <div className="flex flex-col gap-4 p-8 w-full">
        <div className="bg-component text-[#b8b8b8] px-10 py-6 rounded-lg w-full flex flex-col gap-4 mb-8">
          <label className="text-lg font-bold text-white mb-2">¿El trámite ya está digitalizado en la plataforma?</label>
          <select
            value={isDigitalizado}
            onChange={handleSelectChange}
            className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          >
            <option value="SI">SI</option>
            <option value="NO">NO</option>
          </select>
          {isDigitalizado === 'SI' ? (
            <CreateProcessFormSI
              isSubmitting={isSubmitting}
              form={form}
              setForm={setForm}
              solicitudes={solicitudes}
              selectedSolicitudId={selectedSolicitudId}
              setSelectedSolicitudId={setSelectedSolicitudId}
              handleFormChange={handleFormChange}
              handleFormSubmitSI={handleFormSubmitSI}
              emailExists={emailExists}
            />
          ) : (
            <CreateProcessFormNO
              isSubmitting={isSubmitting}
              form2={form2}
              setForm2={setForm2}
              isEmergentFieldVisible={isEmergentFieldVisible}
              handleForm2Change={handleForm2Change}
              handleForm2FileChange={handleForm2FileChange}
              handleFormSubmitNo={handleFormSubmitNo}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CreateProcessForm;
