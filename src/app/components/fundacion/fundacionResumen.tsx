import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import AppStateContext from '@context/fundacionContext';

const FundacionResumen: React.FC = () => {
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
                <h2 className="text-2xl font-bold mb-4">Opciones para el nombre de la Fundación:</h2>
                <div className="ml-6">
                    {renderField('  1 ', solicitudData.fundacion.nombreFundacion1)}
                    {renderField('  2 ', solicitudData.fundacion.nombreFundacion2)}
                    {renderField('  3 ', solicitudData.fundacion.nombreFundacion3)}
                </div>
                <hr className='mt-4 mb-4'></hr>

                {/* Fundadores de la fundación */}
                <h2 className="text-2xl font-bold mb-4">Fundadores de la Sociedad</h2>
                {(peopleData.length > 0 || (solicitudData.fundadores && solicitudData.fundadores.length > 0)) ? (
                    // Mostrar primero los Fundadores propios y luego los nominales
                    [...peopleData.filter(person => person.fundador), ...solicitudData.fundadores.filter(fundador => fundador.servicio === 'Fundador Nominal')]
                        .map((fundador, index) => {
                            // Verificar si el Fundador es nominal
                            if (fundador.servicio === 'Fundador Nominal') {
                                return (
                                    <div key={index}>
                                        {renderField(`Fundador #${index + 1}`, 'Fundador Nominal')}
                                    </div>
                                );
                            }
                            return (
                                <div key={index}>
                                    {renderField(`Fundador #${index + 1}`, renderPersonName(fundador))}
                                </div>
                            );
                        })
                ) : (
                    <p>No hay fundadores registrados.</p>
                )}

                {/* Dignatarios de la Fundación */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Dignatarios de la Fundación</h2>
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
                {/* Miembros de la Fundación */}
                <h2 className="text-2xl font-bold mb-4">Miembros de la Fundación</h2>
                {(peopleData.length > 0 || (solicitudData.miembros && solicitudData.miembros.length > 0)) ? (
                    // Mostrar primero los Fundadores propios y luego los nominales
                    [...peopleData.filter(person => person.miembro), ...solicitudData.miembros.filter(miembro => miembro.servicio === 'Miembro Nominal')]
                        .map((miembro, index) => {
                            // Verificar si el Fundador es nominal
                            if (miembro.servicio === 'Miembro Nominal') {
                                return (
                                    <div key={index}>
                                        {renderField(`Miembro #${index + 1}`, 'Miembro Nominal')}
                                    </div>
                                );
                            }
                            return (
                                <div key={index}>
                                    {renderField(`Miembro #${index + 1}`, renderPersonName(miembro))}
                                </div>
                            );
                        })
                ) : (
                    <p>No hay miembros registrados.</p>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Protectores de la Fundación */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Protectores de la Fundación</h2>
                {peopleData.length > 0 ? (
                    peopleData
                        .filter(person => person.protector)
                        .map((person, index) => {
                            const cargoProtector = person.protector?.cargo;

                            return (
                                <div key={index} className="mb-4">
                                    {renderField(`Protector #${index + 1}`, renderPersonName(person))}

                                    {/* Mostrar porcentaje de acciones si está disponible */}
                                    {cargoProtector && (
                                        <div className="ml-6">
                                            <strong>Cargo: </strong>
                                            <span>{cargoProtector}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                ) : (
                    <p>No hay protectores registrados.</p>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Beneficiarios de la Fundación */}
                <h2 className="text-2xl font-bold mb-4">Beneficiarios de la Fundación</h2>
                {peopleData.length > 0 ? (
                    peopleData
                        .filter(person => person.beneficiariosFundacion)
                        .map((person, index) => (
                            <div key={index}>
                                {renderField(`Poder #${index + 1}`, renderPersonName(person))}
                            </div>
                        ))
                ) : (
                    <p>No hay poder registrados.</p>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Patrimonio inicial */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Patrimonio inicial</h2>
                {renderField('Capital social en dólares', solicitudData.patrimonio)}

                <hr className='mt-4 mb-4'></hr>
                {/* Poder de la Fundación */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Poder de la Fundación</h2>
                {peopleData.length > 0 ? (
                    peopleData
                        .filter(person => person.poder)
                        .map((person, index) => (
                            <div key={index}>
                                {renderField(`Poder #${index + 1}`, renderPersonName(person))}
                            </div>
                        ))
                ) : (
                    <p>No hay poder registrados.</p>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Objetivos de la Fundación */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Objetivos de la Fundación</h2>
                {
                    Array.isArray(solicitudData.objetivos.objetivos) && (
                        <>
                            <div className="ml-6">
                                {/* Definir el diccionario fuera del JSX */}
                                {(() => {
                                    const objetivosNombres = {
                                        propiedad: 'Dueña de Propiedad / Owner of Property',
                                        vehiculoInversion: 'Vehículo de inversión / Investment vehicle',
                                        naveAeronave: 'Dueño de nave o aeronave / Ownership of a vessel or aircraft',
                                        portafolioBienesRaices: 'Portafolio Bienes y Raices / Real Estate Investment',
                                        tenedoraActivos: 'Tenedora de activos / Holding Asset',
                                        parteEstructura: 'Parte de una estructura / Part of a structure',
                                        tenedoraCuentasBancarias: 'Tenedora de Cuentas bancarias / Holding of Bank Account',
                                    };

                                    {/* Iterar sobre el array actividadTenedora y renderizar cada elemento */ }
                                    return solicitudData.objetivos.objetivos.map((objetivo, index) => (
                                        <div key={index}>
                                            {renderField(`Objetivo #${index + 1}`, objetivosNombres[objetivo] || objetivo)}
                                        </div>
                                    ));
                                })()}
                            </div>
                        </>
                    )
                }
                {(solicitudData.objetivos.mantieneContador && solicitudData.objetivos.mantieneContador === 'Si') && (
                    <>
                        <h5 className="text-xl font-bold mt-2 mb-4">Información del contador</h5>
                        <div className="ml-6">
                            {renderField('Nombre del Contador', solicitudData.objetivos.nombreContador)}
                            {renderField('Idoneidad', solicitudData.objetivos.idoneidadContador)}
                            {renderField('Teléfono', solicitudData.objetivos.telefonoContador)}
                            {renderField('Correo Electrónico', solicitudData.objetivos.correoContador)}
                        </div>
                    </>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Fuentes de Ingresos */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Fuentes de Ingresos</h2>
                {solicitudData.ingresos ? (
                    <>
                        {/* Mostrar las fuentes de ingresos que están en el array */}
                        {solicitudData.ingresos.ingresos && Array.isArray(solicitudData.ingresos.ingresos) &&
                            solicitudData.ingresos.ingresos.map((ingreso, index) => {
                                // Mapeo de los nombres de las fuentes
                                const fuenteMap = {
                                    propiedad: 'Propiedad',
                                    vehiculo: 'Vehículo',
                                    inmuebles: 'Ingreso por Inmueble',
                                    cuentasBancarias: 'Cuentas Bancarias',
                                    inversiones: 'Inversiones',
                                };

                                return (
                                    <div key={index}>
                                        {renderField(`Fuente de Ingreso #${index + 1}`, fuenteMap[ingreso] || ingreso)}
                                    </div>
                                );
                            })
                        }

                        {/* Validación especial para la fuente de ingreso 'otro', que es una cadena */}
                        {solicitudData.ingresos.otroIngreso && solicitudData.ingresos.otroIngreso.trim() !== '' && (
                            <div>
                                {renderField(`Fuente de Ingreso #${solicitudData.ingresos.ingresos.length + 1}`, solicitudData.ingresos.otroIngreso)}
                            </div>
                        )}
                    </>
                ) : (
                    <p>No hay fuentes de ingresos registradas.</p>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Activos de la Fundación */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Activos de la Fundación</h2>
                {solicitudData.activos && Array.isArray(solicitudData.activos.activos) ? (
                    solicitudData.activos.activos.map((activo, index) => (
                        <div key={index} className="mb-4">
                            {renderField(`Activo #${index + 1}`, activo.nombre)}
                            {renderField(`Ubicación`, activo.ubicacion)}
                        </div>
                    ))
                ) : (
                    <p>No hay activos registrados.</p>
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

export default FundacionResumen;