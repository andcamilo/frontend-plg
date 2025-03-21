import React, { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"; 
import axios from 'axios';
import Swal from 'sweetalert2';

const Client: React.FC = () => {
    const router = useRouter();
    const params = useParams();
  
    if (!params || !params.id) {
      return <div>Loading...</div>;
    }
    
    const { id } = params as { id: string };
    const [puedeEditarEmail, setPuedeEditarEmail] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        cedulaPasaporte: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!id) return;

            try {
                const response = await axios.get('/api/get-user-id', {
                    params: { userId: id },
                });

                const user = response.data;
                console.log("Cliente ", user)
                setFormData({
                    nombre: user.solicitud.nombre || '',
                    email: user.solicitud.email || '',
                    telefono: user.solicitud.telefonoSolicita || '', 
                    cedulaPasaporte: user.solicitud.cedulaPasaporte || '', 
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [id]);

    /* useEffect(() => {
        console.log("Rol ", formData.rol)
        if (formData.rol === 99) {
            setPuedeEditarEmail(true);
        }
    }, [id]); */


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const updatePayload = {
                userId: id,
                nombre: formData.nombre,
                telefonoSolicita: formData.telefono, 
                cedulaPasaporte: formData.cedulaPasaporte,
            };
            const response = await axios.patch('/api/update-user', updatePayload);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Datos actualizados correctamente',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#2c2c3e',
                    color: '#fff',
                });
                window.location.reload();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar los datos',
                timer: 2000,
                showConfirmButton: false,
                background: '#2c2c3e',
                color: '#fff',
            });
            console.error('Error updating user:', error);
        }
    };

    const handleBack = () => {
        router.push('/dashboard/clients');
    };

    return (
        <div className="p-8 bg-gray-900 rounded-lg w-full">
            <h3 className="text-lg font-bold text-white mb-4">Datos básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-300 mb-1">Nombre *</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-800 text-white"
                        placeholder="Nombre"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 mb-1">Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-800 text-white"
                        placeholder="Email"
                        readOnly={!puedeEditarEmail}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                    <label className="block text-gray-300 mb-1">Cedula o Pasaporte</label>
                    <input
                        type="text"
                        name="cedulaPasaporte"
                        value={formData.cedulaPasaporte}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-800 text-white"
                        placeholder="Cedula o Pasaporte"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 mb-1">Teléfono</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full p-3 rounded bg-gray-800 text-white"
                        placeholder="Teléfono"
                    />
                </div>
            </div>
            <div className="flex space-x-4 mt-6">
                <button
                    className="bg-gray-500 text-white px-6 py-3 rounded"
                    onClick={handleBack}
                >
                    Volver
                </button>
                <button
                    className="bg-pink-600 text-white px-6 py-3 rounded"
                    onClick={handleSave}
                >
                    Guardar
                </button>
            </div>
        </div>
    );
};

export default Client;
