import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import AppStateContext from '@context/sociedadesContext';

const SociedadEmpresaResumen: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store } = context;
    const [solicitudData, setSolicitudData] = useState<any>(null);
    const [peopleData, setPeopleData] = useState<any[]>([]);

    useEffect(() => {
        const fetchSolicitudAndPeople = async () => {
            try {
                const solicitudResponse = await axios.get('/api/get-request-id', {
                    params: { solicitudId: store.solicitudId },
                });

                const peopleResponse = await axios.get('/api/get-people-id', {
                    params: { solicitudId: store.solicitudId },
                });

                console.log('Solicitud Data:', solicitudResponse.data);
                console.log('People Data:', peopleResponse.data);

                setSolicitudData(solicitudResponse.data);
                setPeopleData(peopleResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchSolicitudAndPeople();
    }, []);

    const renderField = (label: string, value: any) => {
        if (value) {
            return (
                <div className="mb-4">
                    <strong>{label}: </strong>
                    <span>{value}</span>
                </div>
            );
        }
        return null;
    };

    const renderPersonName = (person: any) => {
        // Si es persona jurídica, mostrar nombreJuridico - nombreApellido
        if (person.personaJuridica && person.personaJuridica.nombreJuridico) {
            return `${person.personaJuridica.nombreJuridico} - ${person.nombreApellido}`;
        }
        // Si no es persona jurídica, mostrar solo el nombreApellido
        return person.nombreApellido;
    };

    if (!solicitudData) {
        return <p className="text-white">Cargando los detalles de la solicitud...</p>;
    }

    return (
        <div className="text-white">
            <h1 className="text-2xl font-bold mb-4">Resumen de la Solicitud</h1>
            <p>Aquí encontrarás el resumen de tu solicitud.</p>
            <hr></hr>

            <div className="mt-4">
                <h2 className="text-2xl font-bold mb-4">Información del Solicitante</h2>
                {renderField('Nombre del Solicitante', solicitudData.nombreSolicita)}
                {renderField('Teléfono', solicitudData.telefonoSolicita)}
                {renderField('Correo Electrónico', solicitudData.emailSolicita)}
                <h2 className="text-2xl font-bold mb-4">Opciones para el nombre de la sociedad:</h2>
                <div className="ml-6">
                    {renderField('  1 ', solicitudData.empresa.nombreSociedad1)}
                    {renderField('  2 ', solicitudData.empresa.nombreSociedad2)}
                    {renderField('  3 ', solicitudData.empresa.nombreSociedad3)}
                </div>
                <hr className='mt-4 mb-4'></hr>

                {/* Directores de la Sociedad */}
                <h2 className="text-2xl font-bold mb-4">Directores de la Sociedad</h2>
                {(peopleData.length > 0 || (solicitudData.directores && solicitudData.directores.length > 0)) ? (
                    // Mostrar primero los directores propios y luego los nominales
                    [...peopleData.filter(person => person.director), ...solicitudData.directores.filter(director => director.servicio === 'Director Nominal')]
                        .map((director, index) => {
                            // Verificar si el director es nominal
                            if (director.servicio === 'Director Nominal') {
                                return (
                                    <div key={index}>
                                        {renderField(`Director #${index + 1}`, 'Director Nominal')}
                                    </div>
                                );
                            }
                            return (
                                <div key={index}>
                                    {renderField(`Director #${index + 1}`, renderPersonName(director))}
                                </div>
                            );
                        })
                ) : (
                    <p>No hay directores registrados.</p>
                )}

                {/* Dignatarios de la Sociedad */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Dignatarios de la Sociedad</h2>
                {(peopleData.length > 0 || (solicitudData.dignatarios && solicitudData.dignatarios.length > 0)) ? (
                    // Mostrar primero los dignatarios propios y luego los nominales
                    [...peopleData.filter(person => person.dignatario), ...solicitudData.dignatarios.filter(dignatario => dignatario.servicio === 'Dignatario Nominal')]
                        .map((dignatario, index) => {
                            // Verificar si el dignatario es nominal
                            if (dignatario.servicio === 'Dignatario Nominal') {
                                // Obtener las posiciones del dignatario nominal
                                const posicionesNominales = dignatario.posiciones || [];
                                const posicionesConcatenadasNominal = posicionesNominales.map((posicion: any) => posicion.nombre).join(', ');

                                return (
                                    <div key={index} className="mb-4">
                                        {renderField(`Dignatario Nominal #${index + 1}`, 'Dignatario Nominal')}

                                        {/* Mostrar posiciones concatenadas si hay */}
                                        {posicionesNominales.length > 0 && (
                                            <div className="ml-6">
                                                <strong>Posiciones: </strong>
                                                <span>{posicionesConcatenadasNominal}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Obtener las posiciones del dignatario propio
                            const posiciones = dignatario.dignatario?.posiciones || [];
                            const posicionesConcatenadas = posiciones.map((posicion: any) => posicion.nombre).join(', ');

                            return (
                                <div key={index} className="mb-4">
                                    {renderField(`Dignatario #${index + 1}`, renderPersonName(dignatario))}

                                    {/* Mostrar posiciones concatenadas si hay */}
                                    {posiciones.length > 0 && (
                                        <div className="ml-6">
                                            <strong>Posiciones: </strong>
                                            <span>{posicionesConcatenadas}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                ) : (
                    <p>No hay dignatarios registrados.</p>
                )}

                <hr className='mt-4 mb-4'></hr>

                {/* Accionistas de la Sociedad */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Accionistas de la Sociedad</h2>
                {peopleData.length > 0 ? (
                    peopleData
                        .filter(person => person.accionista)  // Filtrar solo las personas que tienen el campo accionista
                        .map((person, index) => {
                            // Obtener el porcentaje de acciones del accionista
                            const porcentajeAcciones = person.accionista?.porcentajeAcciones;

                            return (
                                <div key={index} className="mb-4">
                                    {renderField(`Accionista #${index + 1}`, renderPersonName(person))}

                                    {/* Mostrar porcentaje de acciones si está disponible */}
                                    {porcentajeAcciones && (
                                        <div className="ml-6">
                                            <strong>Porcentaje de acciones: </strong>
                                            <span>{porcentajeAcciones}%</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                ) : (
                    <p>No hay accionistas registrados.</p>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Capital y división de Acciones */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Capital y división de Acciones</h2>
                {renderField('Capital social en dólares', solicitudData.capital.capital)}
                {renderField('Cantidad de Acciones', solicitudData.capital.cantidadAcciones)}
                {renderField('Acciones sin Valor Nominal', solicitudData.capital.accionesSinValorNominal)}
                {renderField('Valor de cada acción (debe totalizar el capital social)', solicitudData.capital.valorPorAccion)}

                <hr className='mt-4 mb-4'></hr>
                {/* Poder de la Sociedad */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Poder de la Sociedad</h2>
                {peopleData.length > 0 ? (
                    peopleData
                        .filter(person => person.poder)  // Filtrar solo las personas que tienen el campo accionista
                        .map((person, index) => (
                            <div key={index}>
                                {renderField(`Poder #${index + 1}`, renderPersonName(person))}
                            </div>
                        ))
                ) : (
                    <p>No hay poder registrados.</p>
                )}
                <hr className='mt-4 mb-4'></hr>
                {/* Actividades de la Sociedad */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Actividades de la Sociedad</h2>
                {solicitudData.actividades ? (
                    <>
                        {/* Si la opción es "SiYaTengoLocal", mostrar los datos comerciales */}
                        {solicitudData.actividades.actividadesDentroOFueraPanama === 'SiYaTengoLocal' && (
                            <>
                                <h5 className="text-xl font-bold mt-2 mb-4">Actividades dentro de Panamá</h5>
                                <div className="ml-6">
                                    {renderField('Nombre Comercial', solicitudData.actividades.actividadesDentroPanama.nombreComercial)}
                                    {renderField('Dirección Comercial', solicitudData.actividades.actividadesDentroPanama.direccionComercial)}
                                    {renderField('Cómo llegar', solicitudData.actividades.actividadesDentroPanama.comoLlegar)}
                                    {renderField('Provincia', solicitudData.actividades.actividadesDentroPanama.provincia)}
                                    {renderField('Corregimiento', solicitudData.actividades.actividadesDentroPanama.corregimiento)}
                                    {renderField('Número de Local', solicitudData.actividades.actividadesDentroPanama.numeroLocal)}
                                    {renderField('Nombre del Edificio', solicitudData.actividades.actividadesDentroPanama.nombreEdificio)}
                                    {renderField('Inversión de la sucursal', solicitudData.actividades.actividadesDentroPanama.inversionSucursal)}
                                    {renderField('Cantidad de Trabajadores', solicitudData.actividades.actividadesDentroPanama.cantidadTrabajadores)}
                                    {renderField('Mantener Rótulo', solicitudData.actividades.actividadesDentroPanama.mantenerRotulo)}
                                    {renderField('Teléfono', solicitudData.actividades.actividadesDentroPanama.telefono)}
                                    {renderField('Correo Electrónico', solicitudData.actividades.actividadesDentroPanama.correoElectronico)}
                                    {renderField('Actividad #1', solicitudData.actividades.actividad1)}
                                    {renderField('Actividad #2', solicitudData.actividades.actividad2)}
                                    {renderField('Actividad #3', solicitudData.actividades.actividad3)}
                                </div>
                                {(solicitudData.actividades.contador && solicitudData.actividades.mantieneContador === 'Si') && (
                                    <>
                                        <h5 className="text-xl font-bold mt-2 mb-4">Información del contador</h5>
                                        <div className="ml-6">
                                            {renderField('Nombre del Contador', solicitudData.actividades.contador.nombreContador)}
                                            {renderField('Idoneidad', solicitudData.actividades.contador.idoneidadContador)}
                                            {renderField('Teléfono', solicitudData.actividades.contador.telefonoContador)}
                                            {renderField('Correo Electrónico', solicitudData.actividades.contador.correoContador)}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Si la opción es "SiRequieroSociedadPrimero", mostrar solo las actividades */}
                        {solicitudData.actividades.actividadesDentroOFueraPanama === 'SiRequieroSociedadPrimero' && (
                            <>
                                <h4 className="text-xl font-bold mt-2 mb-4">Actividades Comerciales</h4>
                                <div className="ml-6">
                                    {renderField('Actividad #1', solicitudData.actividades.actividad1)}
                                    {renderField('Actividad #2', solicitudData.actividades.actividad2)}
                                    {renderField('Actividad #3', solicitudData.actividades.actividad3)}
                                </div>
                                {(solicitudData.actividades.contador && solicitudData.actividades.mantieneContador === 'Si') && (
                                    <>
                                        <h5 className="text-xl font-bold mt-2 mb-4">Información del contador</h5>
                                        <div className="ml-6">
                                            {renderField('Nombre del Contador', solicitudData.actividades.contador.nombreContador)}
                                            {renderField('Idoneidad', solicitudData.actividades.contador.idoneidadContador)}
                                            {renderField('Teléfono', solicitudData.actividades.contador.telefonoContador)}
                                            {renderField('Correo Electrónico', solicitudData.actividades.contador.correoContador)}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Si la opción es "No" y es "offshore", mostrar las actividades offshore */}
                        {solicitudData.actividades.actividadesDentroOFueraPanama === 'No' && solicitudData.actividades.actividadesOffshore && (
                            <>
                                <h3 className="text-xl font-bold mt-2 mb-4">Actividades Offshore</h3>
                                <div className="ml-6">
                                    {renderField('Actividad Offshore #1', solicitudData.actividades.actividadesOffshore.actividadOffshore1)}
                                    {renderField('Actividad Offshore #2', solicitudData.actividades.actividadesOffshore.actividadOffshore2)}
                                    {renderField('Países donde se ejecutarán las actividades', solicitudData.actividades.actividadesOffshore.paisesActividadesOffshore)}
                                </div>
                            </>
                        )}

                        {/* Si la opción es "No" y es "tenedora de activos", mostrar las opciones de tenedora de activos */}
                        {
                            Array.isArray(solicitudData.actividades.actividadTenedora) && (
                                <>
                                    <h3 className="text-xl font-bold mt-2 mb-4">Actividades de Tenedora de Activos</h3>
                                    <div className="ml-6">
                                        {/* Definir el diccionario fuera del JSX */}
                                        {(() => {
                                            const actividadNombres = {
                                                vehiculoInversion: 'Vehículo de Inversión',
                                                portafolioBienesRaices: 'Portafolio de Bienes Raíces',
                                                tenedoraActivos: 'Tenedora de Activos',
                                                grupoEconomico: 'Como parte de una estructura o grupo económico',
                                                duenoNaveAeronave: 'Dueño de Nave o Aeronave',
                                            };

                                            {/* Iterar sobre el array actividadTenedora y renderizar cada elemento */ }
                                            return solicitudData.actividades.actividadTenedora.map((actividad, index) => (
                                                <div key={index}>
                                                    {renderField(`Actividad #${index + 1}`, actividadNombres[actividad] || actividad)}
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </>
                            )
                        }

                    </>
                ) : (
                    <p>No hay actividades registradas.</p>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Fuentes de Ingresos */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Fuentes de Ingresos</h2>

                {solicitudData.fuentesIngresos ? (
                    <>
                        {/* Mostrar las fuentes de ingresos que son booleanas y están en true */}
                        {Object.entries(solicitudData.fuentesIngresos)
                            .filter(([key, value]) => value === true)  // Filtrar solo las que son true
                            .map(([key], index) => {
                                // Mapeo de los nombres de las fuentes
                                const fuenteMap = {
                                    ahorrosPersonales: 'Ahorros Personales',
                                    herencia: 'Herencia',
                                    ingresoInmueble: 'Ingreso por Inmueble',
                                    ingresoNegocios: 'Ingreso por Negocios',
                                    ventaActivos: 'Venta de Activos',
                                };

                                return (
                                    <div key={key}>
                                        {renderField(`Fuente de Ingreso #${index + 1}`, fuenteMap[key] || key)}
                                    </div>
                                );
                            })
                        }

                        {/* Validación especial para la fuente de ingreso 'otro', que es una cadena */}
                        {solicitudData.fuentesIngresos.otro && solicitudData.fuentesIngresos.otro.trim() !== '' && (
                            <div>
                                {renderField(`Fuente de Ingreso #${Object.keys(solicitudData.fuentesIngresos).filter(key => solicitudData.fuentesIngresos[key] === true).length + 1}`, solicitudData.fuentesIngresos.otro)}
                            </div>
                        )}
                    </>
                ) : (
                    <p>No hay fuentes de ingresos registradas.</p>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Solicitud Adicional */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Solicitud Adicional</h2>
                {solicitudData.solicitudAdicional && (
                    <>
                        {renderField('Solicitud Adicional', solicitudData.solicitudAdicional.solicitudAdicional)}
                    </>
                )}

            </div>
        </div>
    );
};

export default SociedadEmpresaResumen;