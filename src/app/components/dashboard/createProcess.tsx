import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import get from 'lodash/get';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { auth } from "@configuration/firebase";

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
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', tipoTramite: '' });
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
      const response = await axios.post('/api/create-record', {
        name: form.nombre,
        lastName: form.apellido,
        email: form.email,
        phone: '',
        tipoTramite: form.tipoTramite
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
        setForm({ nombre: '', apellido: '', email: '', tipoTramite: '' });
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

      // 2. Send all required fields to /api/create-record
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
        lawyer: auth.currentUser?.email || ''
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
            <form onSubmit={handleFormSubmitSI} className="flex flex-col gap-4">
              <label className="font-bold text-white">Nombre:</label>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={form.nombre}
                onChange={handleFormChange}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              />
              <label className="font-bold text-white">Apellido:</label>
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={form.apellido}
                onChange={handleFormChange}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              />
              <label className="font-bold text-white">Correo electrónico:</label>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={handleFormChange}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              />
              <label className="font-bold text-white">Tipo de trámite :</label>
              <select
                name="tipoTramite"
                value={form.tipoTramite}
                onChange={handleFormChange}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              >
                <option value="">Seleccione un tipo de trámite</option>
                <optgroup label="Corporativo">
                  <option value="Sociedades XXXX">Sociedades XXXX</option>
                  <option value="Sociedades ABC">Sociedades ABC</option>
                  <option value="Fundación 123">Fundación 123</option>
                  <option value="Solicitud de Cambios sociedades">Solicitud de Cambios sociedades</option>
                  <option value="Fundación gfd">Fundación gfd</option>
                  <option value="Trámite marca">Trámite marca</option>
                </optgroup>
                <optgroup label="Propiedad Intelectual">
                  <option value="Trámite marca">Trámite marca</option>
                  <option value="Patente xyz">Patente xyz</option>
                  <option value="Derecho de autor">Derecho de autor</option>
                </optgroup>
                <optgroup label="Dirección General de ingresos">
                  <option value="Registro de Ruc">Registro de Ruc</option>
                  <option value="Paz y Salvos">Paz y Salvos</option>
                  <option value="Actualización de correos">Actualización de correos</option>
                  <option value="Solicitud de vivienda Principal">Solicitud de vivienda Principal</option>
                </optgroup>
                <optgroup label="Familia">
                  <option value="Pensión andrea">Pensión andrea</option>
                  <option value="Pensión xyz">Pensión xyz</option>
                  <option value="Desacato">Desacato</option>
                  <option value="pension">Pension</option>
                </optgroup>
                <optgroup label="Laboral">
                  <option value="Contrato">Contrato</option>
                  <option value="Permiso de menor abc">Permiso de menor abc</option>
                  <option value="Conciliaciones">Conciliaciones</option>
                  <option value="Citaciones XYX">Citaciones XYX</option>
                </optgroup>
                <optgroup label="Migración">
                  <option value="Salidas de menores">Salidas de menores</option>
                  <option value="Residencias">Residencias</option>
                  <option value="Visas">Visas</option>
                  <option value="Naturalización">Naturalización</option>
                </optgroup>
                <option value="Propiedades">Propiedades</option>
                <option value="Consultas y Propuestas">Consultas y Propuestas</option>
                <option value="Otros">Otros</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-profile text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2 flex items-center justify-center ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleFormSubmitNo} className="flex flex-col gap-4">
              <label className="font-bold text-white">Nombre:</label>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={form2.nombre}
                onChange={handleForm2Change}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              />
              <label className="font-bold text-white">Apellido:</label>
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={form2.apellido}
                onChange={handleForm2Change}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              />
              <label className="font-bold text-white">Correo electrónico:</label>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={form2.email}
                onChange={handleForm2Change}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              />

              <label className="font-bold text-white">Tipo de Servicio:</label>
              <select
                name="tipoServicio"
                value={form2.tipoServicio}
                onChange={handleForm2Change}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              >
                <option value="">Seleccione un tipo de servicio</option>
                <option value="Revisión o Elaboración de Contrato">Revisión o Elaboración de Contrato</option>
                <option value="Laboral">Laboral</option>
                <option value="Consulta o Investigación Legal">Consulta o Investigación Legal</option>
                <option value="DGI">DGI</option>
                <option value="Caja de Seguro Social">Caja de Seguro Social</option>
                <option value="Municipio">Municipio</option>
                <option value="Migración">Migración</option>
                <option value="Temas Bancarios">Temas Bancarios</option>
                <option value="Varios">Varios</option>
                <option value="Otros">Otros</option>
              </select>

              <label className="font-bold text-white">Nivel de Urgencia:</label>
              <select
                name="nivelUrgencia"
                value={form2.nivelUrgencia}
                onChange={handleForm2Change}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              >
                <option value="">Seleccione nivel de urgencia</option>
                <option value="Bajo">Bajo: No excede 15 días hábiles</option>
                <option value="Medio">Medio: No excede 7 días hábiles</option>
                <option value="Alto">Alto: No excede 72 horas</option>
                <option value="Atención Extraordinaria">Atención Extraordinaria: No excede 24 horas</option>
              </select>
              <small className="text-gray-400 mt-1 mb-4">
                * Por favor tomar nota de que los tiempos aquí establecidos son respecto al proceso de la firma, sin embargo, los trámites también dependerán de la institución pública en los casos que aplique, para la cual daremos seguimiento, pero no podemos garantizar tiempos de ejecución de ellas.
              </small>

              {isEmergentFieldVisible && (
                <>
                  <label className="font-bold text-white">Descripción Extra:</label>
                  <textarea
                    name="descripcionExtra"
                    placeholder="Por favor, detalle la urgencia de su solicitud"
                    value={form2.descripcionExtra}
                    onChange={handleForm2Change}
                    className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                    rows={3}
                    required
                  />
                  <small className="text-gray-400 mt-1 mb-4">
                    * En caso de que requiera este nivel de urgencia, por favor incluya la descripción de la situación y por qué el tiempo establecido.
                  </small>
                </>
              )}

              <label className="font-bold text-white">Descripción del Trámite:</label>
              <textarea
                name="descripcion"
                placeholder="Ingrese descripción del trámite"
                value={form2.descripcion}
                onChange={handleForm2Change}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                rows={3}
                required
              />

              <label className="font-bold text-white">Documentos Adjuntos:</label>
              {form2.documentos.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="file"
                    onChange={e => handleForm2FileChange(idx, e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-white"
                    style={{ colorScheme: 'dark' }}
                  />
                  {form2.documentos.length > 1 && idx > 0 && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setForm2(prev => {
                          const newDocumentos = prev.documentos.filter((_, i) => i !== idx);
                          return { ...prev, documentos: newDocumentos };
                        });
                      }} 
                      className="text-2xl text-white"
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {form2.documentos.length < 3 && (
                <button 
                  type="button" 
                  onClick={() => {
                    setForm2(prev => ({
                      ...prev,
                      documentos: [...prev.documentos, null]
                    }));
                  }} 
                  className="text-2xl text-white"
                >
                  +
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-profile text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2 flex items-center justify-center ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateProcessForm;
