import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import AppStateContext from '@context/sociedadesContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    const generatePDF = () => {
        const doc = new jsPDF();
        let y = 20; // Posición inicial en Y
        const pageHeight = doc.internal.pageSize.height; // Altura de la página

        // Función auxiliar para manejar texto con saltos de página automáticos
        const addLine = (text: string) => {
            if (y + 10 > pageHeight) {
                doc.addPage();
                y = 20; // Reinicia la posición Y en la nueva página
            }
            doc.text(text, 10, y);
            y += 10;
        };

        // Título del documento
        doc.setFontSize(20);
        addLine('Resumen de la Solicitud');

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

        // Opciones para el nombre de la sociedad
        if (solicitudData?.empresa) {
            doc.setFontSize(16);
            addLine('Opciones para el nombre de la sociedad:');
            doc.setFontSize(12);
            addLine(`1. ${solicitudData.empresa.nombreSociedad1 || 'N/A'}`);
            addLine(`2. ${solicitudData.empresa.nombreSociedad2 || 'N/A'}`);
            addLine(`3. ${solicitudData.empresa.nombreSociedad3 || 'N/A'}`);
            y += 10;
        }

        // Directores de la Sociedad
        if (peopleData.length > 0 || (solicitudData.directores && solicitudData.directores.length > 0)) {
            doc.setFontSize(16);
            addLine('Directores de la Sociedad:');
            doc.setFontSize(12);

            // Combinar directores propios y nominales
            const allDirectors = [
                ...peopleData.filter(person => person.director),
                ...(solicitudData.directores || []).filter(director => director.servicio === 'Director Nominal'),
            ];

            allDirectors.forEach((director, index) => {
                if (director.servicio === 'Director Nominal') {
                    addLine(`Director #${index + 1}: Director Nominal`);
                } else {
                    addLine(`Director #${index + 1}: ${renderPersonName(director)}`);
                }
            });

            y += 10;
        } else {
            addLine('No hay directores registrados.');
        }

        // Dignatarios de la Sociedad
        if (peopleData.length > 0 || (solicitudData.dignatarios && solicitudData.dignatarios.length > 0)) {
            doc.setFontSize(16);
            addLine('Dignatarios de la Sociedad:');
            doc.setFontSize(12);

            const allDignatarios = [
                ...peopleData.filter(person => person.dignatario),
                ...(solicitudData.dignatarios || []).filter(dignatario => dignatario.servicio === 'Dignatario Nominal'),
            ];

            allDignatarios.forEach((dignatario, index) => {
                if (dignatario.servicio === 'Dignatario Nominal') {
                    addLine(`Dignatario Nominal #${index + 1}:`);
                    const posicionesNominales = dignatario.posiciones || [];
                    const posicionesConcatenadasNominal = posicionesNominales.map(posicion => posicion.nombre).join(', ');
                    if (posicionesNominales.length > 0) {
                        addLine(`  Posiciones: ${posicionesConcatenadasNominal}`);
                    }
                } else {
                    addLine(`Dignatario #${index + 1}: ${renderPersonName(dignatario)}`);
                    const posiciones = dignatario.dignatario?.posiciones || [];
                    const posicionesConcatenadas = posiciones.map(posicion => posicion.nombre).join(', ');
                    if (posiciones.length > 0) {
                        addLine(`  Posiciones: ${posicionesConcatenadas}`);
                    }
                }
            });

            y += 10;
        } else {
            addLine('No hay dignatarios registrados.');
        }

        // Accionistas de la Sociedad
        if (peopleData.length > 0) {
            const accionistas = peopleData.filter(person => person.accionista);
            if (accionistas.length > 0) {
                doc.setFontSize(16);
                addLine('Accionistas de la Sociedad:');
                doc.setFontSize(12);
                accionistas.forEach((accionista, index) => {
                    const porcentaje = accionista.accionista?.porcentajeAcciones || 'N/A';
                    addLine(`${index + 1}. ${renderPersonName(accionista)} - ${porcentaje}% acciones`);
                });
                y += 10;
            }
        }

        // Capital y División de Acciones
        if (solicitudData?.capital) {
            doc.setFontSize(16);
            addLine('Capital y División de Acciones:');
            doc.setFontSize(12);
            addLine(`Capital social: ${solicitudData.capital.capital || 'N/A'}`);
            addLine(`Cantidad de Acciones: ${solicitudData.capital.cantidadAcciones || 'N/A'}`);
            addLine(`Acciones sin Valor Nominal: ${solicitudData.capital.accionesSinValorNominal || 'N/A'}`);
            addLine(`Valor por Acción: ${solicitudData.capital.valorPorAccion || 'N/A'}`);
            y += 10;
        }

        // Poder de la Sociedad
        if (peopleData.length > 0) {
            const poderes = peopleData.filter(person => person.poder);
            if (poderes.length > 0) {
                doc.setFontSize(16);
                addLine('Poder de la Sociedad:');
                doc.setFontSize(12);
                poderes.forEach((poder, index) => {
                    addLine(`${index + 1}. ${renderPersonName(poder)}`);
                });
                y += 10;
            }
        }

        // Actividades de la Sociedad
        if (solicitudData?.actividades) {
            doc.setFontSize(16);
            addLine('Actividades de la Sociedad:');
            doc.setFontSize(12);
            if (solicitudData.actividades.actividadesDentroPanama === 'SiYaTengoLocal') {
                addLine(`Nombre Comercial: ${solicitudData.actividades.actividadesDentroPanamaData.nombreComercial || 'N/A'}`);
                addLine(`Dirección Comercial: ${solicitudData.actividades.actividadesDentroPanamaData.direccionComercial || 'N/A'}`);
            } else if (solicitudData.actividades.actividadesDentroPanama === 'SiRequieroSociedadPrimero') {
                addLine(`Actividad #1: ${solicitudData.actividades.actividad1 || 'N/A'}`);
                addLine(`Actividad #2: ${solicitudData.actividades.actividad2 || 'N/A'}`);
                addLine(`Actividad #3: ${solicitudData.actividades.actividad3 || 'N/A'}`);
            } else if (solicitudData.actividades.actividadesDentroPanama === 'No' && solicitudData.actividades.actividadesOffshore) {
                addLine(`Actividad Offshore #1: ${solicitudData.actividades.actividadesOffshore.actividadOffshore1 || 'N/A'}`);
                addLine(`Actividad Offshore #2: ${solicitudData.actividades.actividadesOffshore.actividadOffshore2 || 'N/A'}`);
                addLine(`Países: ${solicitudData.actividades.actividadesOffshore.paisesActividadesOffshore || 'N/A'}`);
            }

            // Actividades de Tenedora de Activos
            if (Array.isArray(solicitudData.actividades.actividadTenedora)) {
                doc.setFontSize(14);
                addLine('Actividades de Tenedora de Activos:');
                doc.setFontSize(12);
                const actividadNombres = {
                    vehiculoInversion: 'Vehículo de Inversión',
                    portafolioBienesRaices: 'Portafolio de Bienes Raíces',
                    tenedoraActivos: 'Tenedora de Activos',
                    grupoEconomico: 'Como parte de una estructura o grupo económico',
                    duenoNaveAeronave: 'Dueño de Nave o Aeronave',
                };
                solicitudData.actividades.actividadTenedora.forEach((actividad, index) => {
                    const actividadTexto = actividadNombres[actividad] || actividad;
                    addLine(`Actividad #${index + 1}: ${actividadTexto}`);
                });
                y += 10;
            }
        }

        // Fuentes de Ingresos
        if (solicitudData?.fuentesIngresos) {
            doc.setFontSize(16);
            addLine('Fuentes de Ingresos:');
            doc.setFontSize(12);
            const fuenteMap = {
                ahorrosPersonales: 'Ahorros Personales',
                herencia: 'Herencia',
                ingresoInmueble: 'Ingreso por Inmueble',
                ingresoNegocios: 'Ingreso por Negocios',
                ventaActivos: 'Venta de Activos',
            };

            Object.entries(solicitudData.fuentesIngresos)
                .filter(([, value]) => value === true)
                .forEach(([key], index) => {
                    addLine(`Fuente ${index + 1}: ${fuenteMap[key] || key}`);
                });

            if (solicitudData.fuentesIngresos.otro) {
                addLine(`Otro: ${solicitudData.fuentesIngresos.otro}`);
            }
        }

        // Solicitud Adicional
        if (solicitudData?.solicitudAdicional?.solicitudAdicional) {
            doc.setFontSize(16);
            addLine('Solicitud Adicional:');
            doc.setFontSize(12);
            addLine(solicitudData.solicitudAdicional.solicitudAdicional);
        }

        // Guardar el PDF
        doc.save('Resumen_Solicitud.pdf');
    };

    if (!solicitudData) {
        return <p className="text-white">Cargando los detalles de la solicitud...</p>;
    }

    return (
        <div className="text-white">
            <h1 className="text-2xl font-bold mb-4">Resumen de la Solicitud</h1>
            <p>Aquí encontrarás el resumen de tu solicitud.</p>
            <hr></hr>

            <div className="mt-4" >
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
                {/* Actividades de la Sociedad */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Actividades de la Sociedad</h2>
                {solicitudData.actividades ? (
                    <>
                        {/* Si la opción es "SiYaTengoLocal", mostrar los datos comerciales */}
                        {solicitudData.actividades.actividadesDentroPanama === 'SiYaTengoLocal' && (
                            <>
                                <h5 className="text-xl font-bold mt-2 mb-4">Actividades dentro de Panamá</h5>
                                <div className="ml-6">
                                    {renderField('Nombre Comercial', solicitudData.actividades.actividadesDentroPanamaData.nombreComercial)}
                                    {renderField('Dirección Comercial', solicitudData.actividades.actividadesDentroPanamaData.direccionComercial)}
                                    {renderField('Cómo llegar', solicitudData.actividades.actividadesDentroPanamaData.comoLlegar)}
                                    {renderField('Provincia', solicitudData.actividades.actividadesDentroPanamaData.provincia)}
                                    {renderField('Corregimiento', solicitudData.actividades.actividadesDentroPanamaData.corregimiento)}
                                    {renderField('Número de Local', solicitudData.actividades.actividadesDentroPanamaData.numeroLocal)}
                                    {renderField('Nombre del Edificio', solicitudData.actividades.actividadesDentroPanamaData.nombreEdificio)}
                                    {renderField('Inversión de la sucursal', solicitudData.actividades.actividadesDentroPanamaData.inversionSucursal)}
                                    {renderField('Cantidad de Trabajadores', solicitudData.actividades.actividadesDentroPanamaData.cantidadTrabajadores)}
                                    {renderField('Mantener Rótulo', solicitudData.actividades.actividadesDentroPanamaData.mantenerRotulo)}
                                    {renderField('Teléfono', solicitudData.actividades.actividadesDentroPanamaData.telefono)}
                                    {renderField('Correo Electrónico', solicitudData.actividades.actividadesDentroPanamaData.correoElectronico)}
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
                        {solicitudData.actividades.actividadesDentroPanama === 'SiRequieroSociedadPrimero' && (
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
                        {solicitudData.actividades.actividadesDentroPanama === 'No' && solicitudData.actividades.actividadesOffshore && (
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

export default SociedadEmpresaResumen;