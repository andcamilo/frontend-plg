"use client";
import React, { useState } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const SociedadEmpresaEmpresa: React.FC = () => {
    const [formData, setFormData] = useState({
        nombreSociedad1: '',
        nombreSociedad2: '',
        nombreSociedad3: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulación del envío de los datos
        setTimeout(() => {
            console.log('Datos enviados:', formData);
            setIsLoading(false);
            alert('Información de la empresa guardada correctamente');
        }, 2000);
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">
                Información de la Sociedad / Empresa
                <span className="ml-2">
                    <i className="fa fa-info-circle"></i>
                </span>
            </h1>
            <p className="text-gray-300 mt-4">
                TRES POSIBLES NOMBRES DE LA MISMA. DEBE TERMINAR EN S.A O PUEDE TERMINAR EN INC, CORP.
            </p>

            <hr className="mt-4 text-gray-600" />

            <p className="text-gray-400 mt-4 text-sm">
                * Es posible que el nombre principal que elija esté tomado en el registro público, por lo que la asignación del nombre seguiría el orden que nos provea.
                <br />
                * Aquí dejamos espacio para tu creatividad, comparte tres opciones de nombre para la sociedad. Tomaremos el orden que nos indicas como prioridad. Esto es porque el nombre que puedes proporcionar, puede que ya esté tomado para otras sociedades. En caso de que los tres estén tomados, nos comunicaremos contigo para indicarte opciones alternas o que tú nos proporciones otras. Pueden terminar en Inc, Corp, o S.A. Si la terminación no se provee en el nombre por parte del cliente, incluiremos S.A.
            </p>

            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                    <input
                        type="text"
                        name="nombreSociedad1"
                        value={formData.nombreSociedad1}
                        onChange={handleChange}
                        className="p-4 bg-gray-800 text-white rounded-lg"
                        placeholder="Nombre Sociedad (1)"
                        required
                    />
                    <input
                        type="text"
                        name="nombreSociedad2"
                        value={formData.nombreSociedad2}
                        onChange={handleChange}
                        className="p-4 bg-gray-800 text-white rounded-lg"
                        placeholder="Nombre Sociedad (2)"
                    />
                    <input
                        type="text"
                        name="nombreSociedad3"
                        value={formData.nombreSociedad3}
                        onChange={handleChange}
                        className="p-4 bg-gray-800 text-white rounded-lg"
                        placeholder="Nombre Sociedad (3)"
                    />
                </div>

                <button
                    className="bg-gray-600 text-white w-full py-3 rounded-lg mt-4 hover:bg-gray-500"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <ClipLoader size={24} color="#ffffff" />
                            <span className="ml-2">Cargando...</span>
                        </div>
                    ) : (
                        'Guardar y continuar'
                    )}
                </button>
            </form>
        </div>
    );
};

export default SociedadEmpresaEmpresa;
