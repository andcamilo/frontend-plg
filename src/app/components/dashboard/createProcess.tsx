import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import get from 'lodash/get';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import Link from 'next/link';

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
  const [form2, setForm2] = useState({ nombre: '', apellido: '', email: '', tipoTramite: '', otro: '', descripcion: '', adjuntos: [null as File | null] });
  const [isDigitalizado, setIsDigitalizado] = useState('SI');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        let allUsers: any[] = [];
        let page = 1;
        const limit = 10;

        // Acumula todos los registros de la API usando el `while`
        while (true) {
          const response = await axios.get('/api/user', {
            params: {
              limit,
              page,
            },
          });

          const usuarios = get(response, 'data.usuarios', []);
          allUsers = [...allUsers, ...usuarios];

          if (usuarios.length < limit) break; // Detiene el loop si no hay más registros
          page++;
        }

        const statusLabels = {
          0: "Inactivo",
          1: "Activo",
        };

        const statusClasses = {
          0: "status-rechazada",
          1: "status-confirmando-pago",
        };

        // Filtra los usuarios con rol <= 17
        const filteredUsers = allUsers.filter(
          (user: any) => user.rol <= 17 || user.rol === "cliente"
        );

        // Aplica la paginación localmente
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedData = filteredUsers.slice(startIndex, endIndex);

        // Formatea los datos para la tabla
        const formattedData = paginatedData.map((user: any) => ({
          cliente: (
            <div>
              <p className="font-bold">{get(user, 'nombre', 'N/A')}</p>
              <p className="text-sm" style={{ color: '#ff007f' }}>
                {get(user, 'email', 'N/A')}
              </p>
            </div>
          ),
          "Cedula/Pasaporte": user.cedulaPasaporte || "N/A",
          fecha: new Date(user.date._seconds * 1000).toLocaleDateString(),
          estatus: (
            <span
              className={`status-badge ${
                statusClasses[get(user, 'status', 'N/A')] || 'status-desconocido'
              }`}
            >
              {statusLabels[get(user, 'status', 'N/A')] || 'Desconocido'}
            </span>
          ),
          Opciones: <Actions id={user.id} />,
        }));

        setData(formattedData);
        setTotalRecords(filteredUsers.length);
        setTotalPages(Math.ceil(filteredUsers.length / rowsPerPage));
        setHasPrevPage(currentPage > 1);
        setHasNextPage(currentPage < Math.ceil(filteredUsers.length / rowsPerPage));
      } catch (error) {
        console.error('Error fetching people:', error);
      }
    };

    fetchAllData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleForm2Change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'adjuntos' && files) {
      setForm2({ ...form2, adjuntos: Array.from(files) });
    } else {
      setForm2({ ...form2, [name]: value });
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsDigitalizado(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Formulario enviado',
      text: `Nombre: ${form.nombre}\nApellido: ${form.apellido}\nCorreo electrónico: ${form.email}\nTipo de trámite: ${form.tipoTramite}`,
      icon: 'success',
      background: '#2c2c3e',
      color: '#fff',
    });
    setForm({ nombre: '', apellido: '', email: '', tipoTramite: '' });
  };

  const handleForm2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Formulario enviado',
      text: `Nombre: ${form2.nombre}\nApellido: ${form2.apellido}\nCorreo electrónico: ${form2.email}\nTipo de trámite: ${form2.tipoTramite}\nOtro: ${form2.otro}\nDescripción: ${form2.descripcion}\nAdjuntos: ${form2.adjuntos.length}`,
      icon: 'success',
      background: '#2c2c3e',
      color: '#fff',
    });
    setForm2({ nombre: '', apellido: '', email: '', tipoTramite: '', otro: '', descripcion: '', adjuntos: [null as File | null] });
  };

  const handleForm2FileChange = (index: number, file: File | null) => {
    const newAdjuntos = [...form2.adjuntos];
    newAdjuntos[index] = file;
    setForm2({ ...form2, adjuntos: newAdjuntos });
  };

  const handleAddAdjunto = () => {
    setForm2({ ...form2, adjuntos: [...form2.adjuntos, null] });
  };

  const handleRemoveAdjunto = (index: number) => {
    const newAdjuntos = form2.adjuntos.filter((_, i) => i !== index);
    setForm2({ ...form2, adjuntos: newAdjuntos });
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-8 w-full">
        {/* Select to toggle forms */}
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
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
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
                <option value="Consulta - Propuesta Legal">Consulta - Propuesta Legal</option>
                <option value="Sociedades Anónimas">Sociedades Anónimas</option>
                <option value="Fundaciones de Interés Privado">Fundaciones de Interés Privado</option>
                <option value="Permiso de Salida de Menores al Extranjero">Permiso de Salida de Menores al Extranjero</option>
                <option value="Pensión Alimenticia y Desacato">Pensión Alimenticia y Desacato</option>
              </select>
              <button
                type="submit"
                className="bg-profile text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors mt-2"
              >
                Enviar
              </button>
            </form>
          ) : (
            <form onSubmit={handleForm2Submit} className="flex flex-col gap-4">
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
              <label className="font-bold text-white">Tipo de trámite :</label>
              <select
                name="tipoTramite"
                value={form2.tipoTramite}
                onChange={handleForm2Change}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                required
              >
                <option value="">Seleccione un tipo de trámite</option>
                <option value="Consulta - Propuesta Legal">Consulta - Propuesta Legal</option>
                <option value="Sociedades Anónimas">Sociedades Anónimas</option>
                <option value="Fundaciones de Interés Privado">Fundaciones de Interés Privado</option>
                <option value="Permiso de Salida de Menores al Extranjero">Permiso de Salida de Menores al Extranjero</option>
                <option value="Pensión Alimenticia y Desacato">Pensión Alimenticia y Desacato</option>
                <option value="Otro">Otro</option>
              </select>
              {form2.tipoTramite === 'Otro' && (
                <>
                  <label className="font-bold text-white">Otro:</label>
                  <input
                    type="text"
                    name="otro"
                    placeholder="Otro"
                    value={form2.otro}
                    onChange={handleForm2Change}
                    className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                  />
                </>
              )}
              <label className="font-bold text-white">Ingrese descripcion del tramite:</label>
              <textarea
                name="descripcion"
                placeholder="Ingrese descripcion del tramite"
                value={form2.descripcion}
                onChange={handleForm2Change}
                className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
                rows={3}
              />
              <label className="font-bold text-white">Agregar adjuntos:</label>
              {form2.adjuntos.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="file"
                    onChange={e => handleForm2FileChange(idx, e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-white"
                    style={{ colorScheme: 'dark' }}
                  />
                  {idx > 0 && (
                    <button type="button" onClick={() => handleRemoveAdjunto(idx)} className="text-2xl text-white">-</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddAdjunto} className="text-2xl text-white">+</button>
              <button
                type="submit"
                className="bg-profile text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors mt-2"
              >
                Enviar
              </button>
            </form>
          )}
        </div>


      </div>
    </>
  );
};

export default CreateProcessForm;
