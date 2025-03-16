import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import AppStateContext from '@context/fundacionContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import get from 'lodash/get';

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

                console.log('Solicitud Data:', solicitudResponse.data);
                setSolicitudData(solicitudResponse.data);

                const peopleResponse = await axios.get('/api/get-people-id', {
                    params: { solicitudId: store.solicitudId },
                });

                console.log('People Data:', peopleResponse.data);
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

    const generatePDF = () => {
        const doc = new jsPDF();
        let y = 20; // Posición inicial en Y
        const pageHeight = doc.internal.pageSize.height; // Altura de la página

        // Función para agregar texto y manejar saltos de página
        const addLine = (text: string) => {
            if (y + 10 > pageHeight) {
                doc.addPage();
                y = 20;
            }
            doc.text(text, 10, y);
            y += 10;
        };

        // Título principal
        doc.setFontSize(20);
        addLine('Resumen de la Fundación');

        // Información del Solicitante
        if (solicitudData) {
            doc.setFontSize(16);
            addLine('Información del Solicitante');
            doc.setFontSize(12);
            addLine(`Nombre: ${solicitudData.nombreSolicita || 'N/A'}`);
            addLine(`Teléfono: ${solicitudData.telefonoSolicita || 'N/A'}`);
            addLine(`Correo Electrónico: ${solicitudData.emailSolicita || 'N/A'}`);
            y += 10;
        }

        // Opciones para el nombre de la fundación
        if (solicitudData?.fundacion) {
            doc.setFontSize(16);
            addLine('Opciones para el nombre de la Fundación:');
            doc.setFontSize(12);
            addLine(`1. ${solicitudData.fundacion.nombreFundacion1 || 'N/A'}`);
            addLine(`2. ${solicitudData.fundacion.nombreFundacion2 || 'N/A'}`);
            addLine(`3. ${solicitudData.fundacion.nombreFundacion3 || 'N/A'}`);
            y += 10;
        }

        // Fundadores de la Fundación
        if ((solicitudData.fundadores && peopleData.length > 0) || (solicitudData.fundadores && solicitudData.fundadores.length > 0)) {
            doc.setFontSize(16);
            addLine('Fundadores de la Fundación:');
            doc.setFontSize(12);

            // Combinar fundadores propios y nominales
            const allFundadores = [
                ...peopleData.filter(person => person.fundador),
                ...(solicitudData.fundadores || []).filter(fundador => fundador.servicio === 'Fundador Nominal'),
            ];

            allFundadores.forEach((fundador, index) => {
                if (fundador.servicio === 'Fundador Nominal') {
                    addLine(`Fundador #${index + 1}: Fundador Nominal`);
                } else {
                    addLine(`Fundador #${index + 1}: ${renderPersonName(fundador)}`);
                }
            });

            y += 10;
        }

        // Dignatarios
        if ((solicitudData.dignatarios && peopleData.length > 0) || (solicitudData.dignatarios && solicitudData.dignatarios.length > 0)) {
            doc.setFontSize(16);
            addLine('Dignatarios de la Fundación:');
            doc.setFontSize(12);

            const allDignatarios = [
                ...peopleData.filter(person => person.dignatario),
                ...(solicitudData.dignatarios || []).filter(dignatario => dignatario.servicio === 'Dignatario Nominal'),
            ];

            allDignatarios.forEach((dignatario, index) => {
                if (dignatario.servicio === 'Dignatario Nominal') {
                    addLine(`Dignatario Nominal #${index + 1}:`);
                    const posicionesNominales = dignatario.posiciones || [];
                    const posicionesConcatenadasNominal = posicionesNominales.join(', ');
                    if (posicionesNominales.length > 0) {
                        addLine(`  Posiciones: ${posicionesConcatenadasNominal}`);
                    }
                } else {
                    addLine(`Dignatario #${index + 1}: ${renderPersonName(dignatario)}`);
                    const posiciones = dignatario.dignatario?.posiciones || [];
                    const posicionesConcatenadas = posiciones.join(', ');
                    if (posiciones.length > 0) {
                        addLine(`  Posiciones: ${posicionesConcatenadas}`);
                    }
                }
            });

            y += 10;
        } else {
            addLine('No hay dignatarios registrados.');
        }

        // Miembros de la Fundación
        if ((solicitudData.miembros && peopleData.length > 0) || (solicitudData.miembros && solicitudData.miembros.length > 0)) {
            doc.setFontSize(16);
            addLine('Miembros de la Fundación:');
            doc.setFontSize(12);

            // Combinar miembros propios y nominales
            const allMiembros = [
                ...peopleData.filter(person => person.miembro),
                ...(solicitudData.miembros || []).filter(miembro => miembro.servicio === 'Miembro Nominal'),
            ];

            allMiembros.forEach((miembro, index) => {
                if (miembro.servicio === 'Miembro Nominal') {
                    addLine(`Miembro #${index + 1}: Miembro Nominal`);
                } else {
                    addLine(`Miembro #${index + 1}: ${renderPersonName(miembro)}`);
                }
            });

            y += 10;
        } else {
            doc.setFontSize(16);
            addLine('Miembros de la Fundación:');
            doc.setFontSize(12);
            addLine('No hay miembros registrados.');
            y += 10;
        }

        // Protectores
        if (peopleData.some(person => person.protector)) {
            doc.setFontSize(16);
            addLine('Protectores de la Fundación:');
            doc.setFontSize(12);

            peopleData
                .filter(person => person.protector)
                .forEach((protector, index) => {
                    addLine(`Protector #${index + 1}: ${renderPersonName(protector)}`);
                });

            y += 10;
        }

        // Beneficiarios
        if (peopleData.some(person => person.beneficiariosFundacion)) {
            doc.setFontSize(16);
            addLine('Beneficiarios de la Fundación:');
            doc.setFontSize(12);

            peopleData
                .filter(person => person.beneficiariosFundacion)
                .forEach((beneficiario, index) => {
                    addLine(`Beneficiario #${index + 1}: ${renderPersonName(beneficiario)}`);
                });

            y += 10;
        }

        // Patrimonio inicial
        if (solicitudData.patrimonio) {
            doc.setFontSize(16);
            addLine('Patrimonio Inicial:');
            doc.setFontSize(12);
            addLine(`Capital Social: ${solicitudData.patrimonio || 'N/A'}`);
            y += 10;
        }

        // Poder de la Fundación
        if ((solicitudData.poder && peopleData.length > 0) && peopleData.some(person => person.poder)) {
            doc.setFontSize(16);
            addLine('Poder de la Fundación:');
            doc.setFontSize(12);

            peopleData
                .filter(person => person.poder)
                .forEach((person, index) => {
                    addLine(`Poder #${index + 1}: ${renderPersonName(person)}`);
                });

            y += 10;
        }

        // Objetivos
        if (solicitudData.objetivos?.objetivos) {
            doc.setFontSize(16);
            addLine('Objetivos de la Fundación:');
            doc.setFontSize(12);

            solicitudData.objetivos.objetivos.forEach((objetivo, index) => {
                addLine(`Objetivo #${index + 1}: ${objetivo}`);
            });

            y += 10;
        }

        // Fuentes de Ingresos
        if (solicitudData.ingresos?.ingresos) {
            doc.setFontSize(16);
            addLine('Fuentes de Ingresos:');
            doc.setFontSize(12);

            solicitudData.ingresos.ingresos.forEach((ingreso, index) => {
                addLine(`Fuente de Ingreso #${index + 1}: ${ingreso}`);
            });

            if (solicitudData.ingresos.otroIngreso) {
                addLine(`Otro: ${solicitudData.ingresos.otroIngreso}`);
            }

            y += 10;
        }

        // Activos de la Fundación
        if (solicitudData.activos?.activos) {
            doc.setFontSize(16);
            addLine('Activos de la Fundación:');
            doc.setFontSize(12);

            solicitudData.activos.activos.forEach((activo, index) => {
                addLine(`Activo #${index + 1}: ${activo.nombre}`);
                addLine(`Ubicación: ${activo.ubicacion}`);
            });

            y += 10;
        }

        // Solicitud Adicional
        if (solicitudData.solicitudAdicional?.solicitudAdicional) {
            doc.setFontSize(16);
            addLine('Solicitud Adicional:');
            doc.setFontSize(12);
            addLine(solicitudData.solicitudAdicional.solicitudAdicional);
        }

        // Guardar el PDF
        doc.save('Resumen_Fundacion.pdf');
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
                <h2 className="text-3xl font-bold mb-4">Información del Solicitante</h2>
                {renderField('Nombre del Solicitante', solicitudData.nombreSolicita)}
                {renderField('Teléfono', solicitudData.telefonoSolicita)}
                {renderField('Correo Electrónico', solicitudData.emailSolicita)}
                <h2 className="text-3xl font-bold mb-4">Opciones para el nombre de la Fundación:</h2>
                {solicitudData.fundacion ? (
                    <>
                        <div className="ml-6">
                            {renderField('  1 ', solicitudData.fundacion.nombreFundacion1)}
                            {renderField('  2 ', solicitudData.fundacion.nombreFundacion2)}
                            {renderField('  3 ', solicitudData.fundacion.nombreFundacion3)}
                        </div>
                    </>
                ) : (
                    <p>No hay opciones para el nombre de la fundación registrados.</p>
                )}
                <hr className='mt-4 mb-4'></hr>

                {/* Fundadores de la fundación */}
                <h2 className="text-3xl font-bold mb-4">Fundadores de la Sociedad</h2>
                {((solicitudData.fundadores && peopleData.length > 0) || (solicitudData.fundadores && solicitudData.fundadores.length > 0)) ? (
                    // Mostrar primero los Fundadores propios y luego los nominales
                    [...peopleData.filter(person => person.fundador), ...(solicitudData.fundadores ?? []).filter(fundador => fundador.servicio === 'Fundador Nominal')].map((fundador, index) => {
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
                {((solicitudData.dignatarios && peopleData.length > 0) || (solicitudData.dignatarios && solicitudData.dignatarios.length > 0)) ? (
                    // Mostrar primero los dignatarios propios y luego los nominales
                    [...peopleData.filter(person => person.dignatario), ...(solicitudData.dignatarios ?? []).filter(dignatario => dignatario.servicio === 'Dignatario Nominal')].map((dignatario, index) => {
                        // Verificar si el dignatario es nominal
                        if (dignatario.servicio === 'Dignatario Nominal') {
                            // Obtener las posiciones del dignatario nominal
                            const posicionesNominales = dignatario.posiciones || [];
                            const posicionesConcatenadasNominal = posicionesNominales.join(', ');

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
                        const posicionesConcatenadas = posiciones.join(', ');

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
                <h2 className="text-3xl font-bold mb-4">Miembros de la Fundación</h2>
                {((solicitudData.miembros && peopleData.length > 0) || (solicitudData.miembros && solicitudData.miembros.length > 0)) ? (
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
                {(solicitudData.protectores && peopleData.length > 0) ? (
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
                <h2 className="text-3xl font-bold mb-4">Beneficiarios de la Fundación</h2>
                {(solicitudData.beneficiariosFundacion && peopleData.length > 0) ? (
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
                {(solicitudData.poder && peopleData.length > 0) ? (
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
                {solicitudData.objetivos ? (
                    <>
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
                    </>
                ) : (
                    <p>No hay objetivos de la fundación registrados.</p>
                )}

                {(solicitudData.objetivos && solicitudData.objetivos.mantieneContador && solicitudData.objetivos.mantieneContador === 'Si') && (
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

                <hr className='mt-4 mb-4'></hr>
                <h2 className="text-3xl font-bold mb-4">Costos</h2>
                <table className="w-full mt-4 text-white border border-gray-600">
                    <thead>
                        <tr className="border-b border-gray-600">
                            <th className="text-left p-2">#</th>
                            <th className="text-left p-2">Item</th>
                            <th className="text-right p-2">Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {get(solicitudData, 'canasta.items', []).map((item, index) => (
                            <tr key={index} className="border-b border-gray-600">
                                <td className="p-2">{index + 1}</td>
                                <td className="p-2">{item.item}</td>
                                <td className="text-right p-2">${item.precio}</td>
                            </tr>
                        ))}
                        <tr className="border-b border-gray-600">
                            <td colSpan={2} className="text-right p-2">Subtotal</td>
                            <td className="text-right p-2">${get(solicitudData, 'canasta.subtotal', 0).toFixed(2)}</td>
                        </tr>
                        <tr className="border-b border-gray-600">
                            <td colSpan={2} className="text-right p-2">Total</td>
                            <td className="text-right p-2">${get(solicitudData, 'canasta.total', 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <button
                    onClick={generatePDF}
                    className="mt-6 px-4 py-2 bg-profile text-white font-bold rounded hover:bg-profile-600"
                >
                    Descargar Resumen PDF
                </button>

            </div>
        </div>
    );
};

export default FundacionResumen;