import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import AppStateContext from '@context/sociedadesContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import get from 'lodash/get';

const SociedadEmpresaResumen: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store } = context;
    const [solicitudData, setSolicitudData] = useState<any>(null);
    const [peopleData, setPeopleData] = useState<any[]>([]);
    const [mostrarAdjuntos, setMostrarAdjuntos] = useState(false);

    useEffect(() => {
        const fetchSolicitudAndPeople = async () => {
            try {
                /* const solicitudResponse = await axios.get('/api/get-request-id', {
                    params: { solicitudId: store.solicitudId },
                }); */

                const peopleResponse = await axios.get('/api/get-people-id', {
                    params: { solicitudId: store.solicitudId },
                });

                console.log('Solicitud Data:', store.request);
                console.log('People Data:', peopleResponse.data);

                setSolicitudData(store.request);
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
        if ((person?.personaJuridica || person.nombre_PersonaJuridica) &&
            (person?.personaJuridica?.nombreJuridico || person.nombre_PersonaJuridica)) {
            return `${person?.personaJuridica?.nombreJuridico || person.nombre_PersonaJuridica} - ${person?.nombreApellido || person.nombre}`;
        }
        // Si no es persona jurídica, mostrar solo el nombreApellido
        return person?.nombreApellido || person?.nombre;
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
        if (solicitudData?.empresa || solicitudData?.nombreSociedad_1) {
            doc.setFontSize(16);
            addLine('Opciones para el nombre de la sociedad:');
            doc.setFontSize(12);
            addLine(`1. ${solicitudData?.empresa?.nombreSociedad1 || solicitudData?.nombreSociedad_1 || 'N/A'}`);
            addLine(`2. ${solicitudData?.empresa?.nombreSociedad2 || solicitudData?.nombreSociedad_2 || 'N/A'}`);
            addLine(`3. ${solicitudData?.empresa?.nombreSociedad3 || solicitudData?.nombreSociedad_3 || 'N/A'}`);
            y += 10;
        }

        // Directores de la Sociedad
        if (peopleData.length > 0 || (solicitudData.directores && solicitudData.directores.length > 0)) {
            doc.setFontSize(16);
            addLine('Directores de la Sociedad:');
            doc.setFontSize(12);

            // **Fusionar directores propios y nominales en una sola lista**
            const allDirectors = [
                ...peopleData.filter(person => person.director),
                ...(solicitudData.directores || []).filter(director => director.servicio === 'Director Nominal'),
                ...(solicitudData.directores || [])
                    .filter(director => director.servicio !== 'Director Nominal') // Excluir nominales
                    .map(director => peopleData.find(person => person.id === director.id_persona)) // Buscar en peopleData
                    .filter(Boolean) // Remover valores nulos
            ];

            // **Recorrer e imprimir todos los directores en una sola lista**
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

            // **1️⃣ Obtener dignatarios propios desde `peopleData`**
            const dignatariosPropios = peopleData.filter(person => person.dignatario);

            // **2️⃣ Obtener dignatarios propios desde `solicitudData.dignatarios`, buscando en `peopleData`**
            const dignatariosDesdeSolicitud = (solicitudData.dignatarios ?? [])
                .filter(dignatario => dignatario.servicio !== 'Dignatario Nominal') // Excluir nominales
                .map(dignatario => {
                    const person = peopleData.find(person => person.id === dignatario.id_persona || person.id === dignatario.personId);
                    if (!person) return null; // Si no se encuentra en peopleData, se omite

                    return {
                        ...person,
                        servicio: dignatario.servicio, // Asegurar que tenga el servicio asignado
                        posiciones: dignatario.posiciones || dignatario.positions || [], // Tomar posiciones de ambos campos
                    };
                })
                .filter(Boolean); // Remover valores nulos

            // **3️⃣ Obtener dignatarios nominales desde `solicitudData.dignatarios`**
            const dignatariosNominales = (solicitudData.dignatarios ?? [])
                .filter(dignatario => dignatario.servicio === 'Dignatario Nominal')
                .map(dignatario => ({
                    ...dignatario,
                    posiciones: dignatario.posiciones || dignatario.positions || [], // Tomar posiciones de ambos campos
                }));

            // **Evitar duplicados usando un Set para IDs**
            const dignatariosUnicosArray: any[] = [];
            const idsUnicos = new Set();

            [...dignatariosPropios, ...dignatariosDesdeSolicitud].forEach(dignatario => {
                if (dignatario && dignatario.id && !idsUnicos.has(dignatario.id)) {
                    idsUnicos.add(dignatario.id);
                    dignatariosUnicosArray.push(dignatario);
                }
            });

            // **Fusionar dignatarios propios y nominales**
            const todosLosDignatarios = [...dignatariosUnicosArray, ...dignatariosNominales];

            // **Generar el contenido en el PDF**
            todosLosDignatarios.forEach((dignatario, index) => {
                let posiciones = dignatario.posiciones || [];

                // **Concatenar y mostrar las posiciones correctamente**
                let posicionesConcatenadas = "";
                if (Array.isArray(posiciones)) {
                    if (posiciones.length > 0 && typeof posiciones[0] === "string") {
                        // **Caso 1: `positions` es un array de strings**
                        posicionesConcatenadas = posiciones.join(', ');
                    } else if (posiciones.length > 0 && typeof posiciones[0] === "object" && posiciones[0]?.nombre) {
                        // **Caso 2: `posiciones` es un array de objetos con `nombre`**
                        posicionesConcatenadas = posiciones.join(', ');
                    }
                }

                // **Imprimir en el PDF**
                if (dignatario.servicio === 'Dignatario Nominal') {
                    addLine(`Dignatario #${index + 1}: Dignatario Nominal`);
                } else {
                    addLine(`Dignatario #${index + 1}: ${renderPersonName(dignatario)}`);
                }

                if (posicionesConcatenadas) {
                    addLine(`  Posiciones: ${posicionesConcatenadas}`);
                }
            });

            y += 10;
        } else {
            addLine('No hay dignatarios registrados.');
        }

        // Accionistas de la Sociedad
        if (peopleData.length > 0 || (solicitudData.accionistas && solicitudData.accionistas.length > 0)) {
            doc.setFontSize(16);
            addLine('Accionistas de la Sociedad:');
            doc.setFontSize(12);

            // **1️⃣ Obtener accionistas propios desde `peopleData`**
            const accionistasPropios = peopleData
                .filter(person => person.accionista)
                .map(person => ({
                    id: person.id,
                    nombre: renderPersonName(person),
                    porcentajeAcciones: person.accionista?.porcentajeAcciones || 'N/A'
                }));

            // **2️⃣ Obtener accionistas desde `solicitudData.accionistas`, buscando en `peopleData`**
            const accionistasDesdeSolicitud = (solicitudData.accionistas ?? [])
                .map(accionista => {
                    const person = peopleData.find(person => person.id === accionista.id_persona);
                    if (!person) return null; // Omitir si no se encuentra en `peopleData`

                    return {
                        id: person.id,
                        nombre: renderPersonName(person),
                        porcentajeAcciones: accionista.porcentaje || 'N/A'
                    };
                })
                .filter(Boolean); // Remover valores nulos

            // **Evitar duplicados usando un Set para IDs**
            const accionistasUnicosArray: any[] = [];
            const idsUnicos = new Set();

            [...accionistasPropios, ...accionistasDesdeSolicitud].forEach(accionista => {
                if (accionista && accionista.id && !idsUnicos.has(accionista.id)) {
                    idsUnicos.add(accionista.id);
                    accionistasUnicosArray.push(accionista);
                }
            });

            // **Generar el contenido en el PDF**
            accionistasUnicosArray.forEach((accionista, index) => {
                addLine(`Accionista #${index + 1}. ${accionista.nombre} - ${accionista.porcentajeAcciones}% de las acciones`);
            });

            y += 10;
        } else {
            addLine('No hay accionistas registrados.');
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
        if (peopleData.length > 0 || (solicitudData.poder && solicitudData.poder.length > 0)) {
            doc.setFontSize(16);
            addLine('Poder de la Sociedad:');
            doc.setFontSize(12);

            // **1️⃣ Obtener apoderados desde `peopleData`**
            const apoderadosPropios = peopleData
                .filter(person => person.poder)
                .map(person => ({
                    id: person.id,
                    nombre: renderPersonName(person)
                }));

            // **2️⃣ Obtener apoderados desde `solicitudData.poder`, buscando en `peopleData`**
            const apoderadosDesdeSolicitud = (solicitudData.poder ?? [])
                .map(poder => {
                    const person = peopleData.find(person => person.id === poder.id_persona);
                    if (!person) return null; // Omitir si no se encuentra en `peopleData`

                    return {
                        id: person.id,
                        nombre: renderPersonName(person)
                    };
                })
                .filter(Boolean); // Remover valores nulos

            // **Evitar duplicados usando un Set para IDs**
            const apoderadosUnicosArray: any[] = [];
            const idsUnicos = new Set();

            [...apoderadosPropios, ...apoderadosDesdeSolicitud].forEach(apoderado => {
                if (apoderado && apoderado.id && !idsUnicos.has(apoderado.id)) {
                    idsUnicos.add(apoderado.id);
                    apoderadosUnicosArray.push(apoderado);
                }
            });

            // **Generar el contenido en el PDF**
            apoderadosUnicosArray.forEach((apoderado, index) => {
                addLine(`Poder #${index + 1}. ${apoderado.nombre}`);
            });

            y += 10;
        } else {
            addLine('No hay poder registrados.');
        }

        // Actividades de la Sociedad
        if (solicitudData?.actividades || solicitudData?.dentroPanama) {
            doc.setFontSize(16);
            addLine('Actividades de la Sociedad:');
            doc.setFontSize(12);

            // **1️⃣ Si la empresa YA TIENE LOCAL en Panamá**
            if (
                solicitudData.actividades?.actividadesDentroPanama === 'SiYaTengoLocal' ||
                solicitudData?.dentroPanama === 'Si, ya tengo la local'
            ) {
                addLine('Actividades dentro de Panamá:');

                addLine(`Nombre Comercial: ${solicitudData.actividades?.actividadesDentroPanamaData?.nombreComercial || solicitudData.avisOperacion?.aO_nombreComercial || 'N/A'}`);
                addLine(`Dirección Comercial: ${solicitudData.actividades?.actividadesDentroPanamaData?.direccionComercial || solicitudData.avisOperacion?.aO_direccion || 'N/A'}`);
                addLine(`Cómo llegar: ${solicitudData.actividades?.actividadesDentroPanamaData?.comoLlegar || solicitudData.avisOperacion?.aO_comoLlegar || 'N/A'}`);
                addLine(`Provincia: ${solicitudData.actividades?.actividadesDentroPanamaData?.provincia || solicitudData.avisOperacion?.aO_provincia || 'N/A'}`);
                addLine(`Teléfono: ${solicitudData.actividades?.actividadesDentroPanamaData?.telefono || solicitudData.avisOperacion?.aO_telefono || 'N/A'}`);

                // **Validar contador**
                if (
                    (solicitudData.actividades?.contador && solicitudData.actividades?.mantieneContador === 'Si') ||
                    (solicitudData.contador && solicitudData.contador.selectContador === 'Si')
                ) {
                    addLine('Información del Contador:');
                    addLine(`Nombre: ${solicitudData.actividades?.contador?.nombreContador || solicitudData.contador?.contador_nombre || 'N/A'}`);
                    addLine(`Idoneidad: ${solicitudData.actividades?.contador?.idoneidadContador || solicitudData.contador?.contador_idoneidad || 'N/A'}`);
                    addLine(`Teléfono: ${solicitudData.actividades?.contador?.telefonoContador || solicitudData.contador?.contador_telefono || 'N/A'}`);
                }
            }

            // **2️⃣ Si REQUIERE SOCIEDAD PRIMERO**
            else if (
                solicitudData.actividades?.actividadesDentroPanama === 'SiRequieroSociedadPrimero' ||
                solicitudData?.dentroPanama === 'Si, pero requiero la sociedad'
            ) {
                addLine('Actividades Comerciales:');
                addLine(`Actividad #1: ${solicitudData.actividades?.actividad1 || solicitudData.actividadComercial?.aC_1 || 'N/A'}`);
                addLine(`Actividad #2: ${solicitudData.actividades?.actividad2 || solicitudData.actividadComercial?.aC_2 || 'N/A'}`);
                addLine(`Actividad #3: ${solicitudData.actividades?.actividad3 || solicitudData.actividadComercial?.aC_3 || 'N/A'}`);

                // **Validar contador**
                if (
                    (solicitudData.actividades?.contador && solicitudData.actividades?.mantieneContador === 'Si') ||
                    (solicitudData.contador && solicitudData.contador.selectContador === 'Si')
                ) {
                    addLine('Información del Contador:');
                    addLine(`Nombre: ${solicitudData.actividades?.contador?.nombreContador || solicitudData.contador?.contador_nombre || 'N/A'}`);
                    addLine(`Idoneidad: ${solicitudData.actividades?.contador?.idoneidadContador || solicitudData.contador?.contador_idoneidad || 'N/A'}`);
                    addLine(`Teléfono: ${solicitudData.actividades?.contador?.telefonoContador || solicitudData.contador?.contador_telefono || 'N/A'}`);
                }
            }

            // **3️⃣ Si la empresa NO OPERA EN PANAMÁ (Offshore)**
            else if (
                (solicitudData.actividades?.actividadesDentroPanama === 'No' && solicitudData.actividades?.actividadesOffshore) ||
                (solicitudData?.dentroPanama === 'No' && solicitudData?.fueraPanama)
            ) {
                addLine('Actividades Offshore:');
                addLine(`Actividad Offshore #1: ${solicitudData.actividades?.actividadesOffshore?.actividadOffshore1 || solicitudData.fueraPanama?.aCF_1 || 'N/A'}`);
                addLine(`Actividad Offshore #2: ${solicitudData.actividades?.actividadesOffshore?.actividadOffshore2 || solicitudData.fueraPanama?.aCF_2 || 'N/A'}`);
                addLine(`Países donde se ejecutarán las actividades: ${solicitudData.actividades?.actividadesOffshore?.paisesActividadesOffshore || solicitudData.fueraPanama?.aCF_paises || 'N/A'}`);
            }

            // **4️⃣ Si la empresa es TENEDORA DE ACTIVOS**
            if (Array.isArray(solicitudData.actividades?.actividadTenedora)) {
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
            }

            y += 10;
        } else {
            addLine('No hay actividades registradas.');
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
        if (solicitudData?.solicitudAdicional?.solicitudAdicional || solicitudData?.solicitudAdicional) {
            doc.setFontSize(16);
            addLine('Solicitud Adicional:');
            doc.setFontSize(12);
            addLine(solicitudData?.solicitudAdicional?.solicitudAdicional || solicitudData?.solicitudAdicional);
        }

        // Costos de la Sociedad
        if (solicitudData?.canasta?.items?.length > 0) {
            doc.setFontSize(16);
            addLine('Costos:');
            doc.setFontSize(12);

            // **Recorrer los ítems y agregarlos como texto**
            solicitudData.canasta.items.forEach((item, index) => {
                addLine(`${index + 1}. ${item.item}: $${(item.precio || 0).toFixed(2)}`);
            });

            // **Subtotal y Total**
            addLine(`Subtotal: $${(solicitudData.canasta.subtotal || 0).toFixed(2)}`);
            addLine(`Total: $${(solicitudData.canasta.total || 0).toFixed(2)}`);

            y += 10; // Espacio después de los costos
        } else {
            addLine('No hay costos registrados.');
        }

        // Guardar el PDF
        doc.save('Resumen_Solicitud.pdf');
    };

    const generateInfoPersonas = () => {
        const doc = new jsPDF();
        let y = 20;
        const pageHeight = doc.internal.pageSize.height;

        const addLine = (text: string) => {
            if (y + 10 > pageHeight) {
                doc.addPage();
                y = 20;
            }
            doc.text(text, 10, y);
            y += 10;
        };

        // Título
        doc.setFontSize(20);
        addLine('Información de las Personas de la Sociedad');

        // Información de cada persona
        peopleData.forEach((persona: any, index: number) => {
            doc.setFontSize(14);
            addLine(`Persona #${index + 1}`);
            doc.setFontSize(12);

            addLine(`Nombre Completo: ${persona.nombreApellido || 'N/A'}`);
            addLine(`Cédula o Pasaporte: ${persona.cedulaPasaporte || 'N/A'}`);
            addLine(`Fecha de Nacimiento: ${persona.fechaNacimiento ? new Date(persona.fechaNacimiento._seconds * 1000).toLocaleDateString() : 'N/A'}`);
            addLine(`Sexo: ${persona.sexo || 'N/A'}`);
            addLine(`Nacionalidad: ${persona.nacionalidad || 'N/A'}`);
            addLine(`País de Nacimiento: ${persona.paisNacimiento || 'N/A'}`);
            addLine(`País de Residencia: ${persona.paisResidencia || 'N/A'}`);
            addLine(`Dirección: ${persona.direccion || 'N/A'}`);
            addLine(`Teléfono: ${persona.telefono || 'N/A'}`);
            addLine(`Correo Electrónico: ${persona.email || 'N/A'}`);
            addLine(`Profesión: ${persona.profesion || 'N/A'}`);
            addLine(`Tipo de Persona: ${persona.tipoPersona || 'N/A'}`);

            // Persona Jurídica
            if (persona.tipoPersona === "Persona Jurídica") {
                doc.setFontSize(14);
                addLine(`--- Información Jurídica ---`);
                doc.setFontSize(12);
                addLine(`Nombre Jurídico: ${persona.personaJuridica.nombreJuridico || 'N/A'}`);
                addLine(`País Jurídico: ${persona.personaJuridica.paisJuridico || 'N/A'}`);
                addLine(`Registro Jurídico: ${persona.personaJuridica.registroJuridico || 'N/A'}`);
            }

            // Referencias bancarias
            if (persona.referenciasBancarias) {
                doc.setFontSize(14);
                addLine(`--- Referencia Bancaria ---`);
                doc.setFontSize(12);
                addLine(`Banco: ${persona.referenciasBancarias.bancoNombre || 'N/A'}`);
                addLine(`Teléfono: ${persona.referenciasBancarias.bancoTelefono || 'N/A'}`);
                addLine(`Correo: ${persona.referenciasBancarias.bancoEmail || 'N/A'}`);
            }

            // Referencias comerciales
            if (persona.referenciasComerciales) {
                doc.setFontSize(14);
                addLine(`--- Referencia Comercial ---`);
                doc.setFontSize(12);
                addLine(`Nombre: ${persona.referenciasComerciales.comercialNombre || 'N/A'}`);
                addLine(`Teléfono: ${persona.referenciasComerciales.comercialTelefono || 'N/A'}`);
                addLine(`Correo: ${persona.referenciasComerciales.comercialEmail || 'N/A'}`);
            }

            // Expuesta políticamente
            addLine(`Es persona políticamente expuesta: ${persona.esPoliticamenteExpuesta || 'No'}`);
            if (persona.esPoliticamenteExpuesta === 'Sí') {
                addLine(`Cargo: ${persona.personaExpuestaCargo || 'N/A'}`);
                addLine(`Fecha: ${persona.personaExpuestaFecha || 'N/A'}`);
            }

            // Roles
            if (persona.director?.esActivo) {
                addLine(`Director: Sí `);
            }

            if (persona.dignatario?.dignatario) {
                addLine(`Dignatario: Sí`);
                if (persona.dignatario.posiciones?.length) {
                    addLine(`Posiciones: ${persona.dignatario.posiciones.join(', ')}`);
                }
            }

            if (persona.accionista?.accionista) {
                addLine(`Accionista: Sí `);
                addLine(`Porcentaje: ${persona.accionista?.porcentajeAcciones || 'N/A'}%`);
            }

            if (persona.poder?.poder) {
                addLine(`Apoderado: Sí`);
            }

            y += 10;
        });

        // Guardar
        doc.save('Información_Personas.pdf');
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
                <h2 className="text-3xl font-bold mb-4">Información del Solicitante</h2>
                {renderField('Nombre del Solicitante', solicitudData.nombreSolicita)}
                {renderField('Teléfono', solicitudData.telefonoSolicita)}
                {renderField('Correo Electrónico', solicitudData.emailSolicita)}
                <h2 className="text-3xl font-bold mb-4">Opciones para el nombre de la sociedad:</h2>
                {solicitudData.empresa || solicitudData.nombreSociedad_1 ? (
                    <>
                        <div className="ml-6">
                            {renderField('  1 ', solicitudData?.empresa?.nombreSociedad1 || solicitudData.nombreSociedad_1)}
                            {renderField('  2 ', solicitudData?.empresa?.nombreSociedad2 || solicitudData.nombreSociedad_2)}
                            {renderField('  3 ', solicitudData?.empresa?.nombreSociedad3 || solicitudData.nombreSociedad_3)}
                        </div>
                    </>
                ) : (
                    <p>No hay opciones para el nombre de la sociedad.</p>
                )}
                <hr className='mt-4 mb-4'></hr>

                {/* Directores de la Sociedad */}
                <h2 className="text-3xl font-bold mb-4">Directores de la Sociedad</h2>

                {((solicitudData.directores && peopleData.length > 0) || (solicitudData.directores?.length ?? 0) > 0) ? (() => {
                    // Obtener directores propios desde peopleData
                    const directoresPropios = peopleData.filter(person => person.director);

                    // Obtener directores nominales desde solicitudData
                    const directoresNominales = (solicitudData.directores ?? []).filter(director => director.servicio === 'Director Nominal');

                    // Obtener directores propios desde solicitudData (con búsqueda en peopleData)
                    const directoresDesdeSolicitud = (solicitudData.directores ?? [])
                        .filter(director => director.servicio !== 'Director Nominal') // Excluir nominales
                        .map(director => peopleData.find(person => person.id === director.id_persona || person.id === director.personId))
                        .filter(Boolean); // Remover valores nulos

                    // **Evitar duplicados usando un Set para IDs**
                    const directoresUnicosArray: any[] = [];
                    const idsUnicos = new Set();

                    [...directoresPropios, ...directoresDesdeSolicitud].forEach(director => {
                        if (director && director.id && !idsUnicos.has(director.id)) {
                            idsUnicos.add(director.id);
                            directoresUnicosArray.push(director);
                        }
                    });

                    // Agregar directores nominales al final
                    const todosLosDirectores = [...directoresUnicosArray, ...directoresNominales];

                    return (
                        <>
                            {todosLosDirectores.map((director, index) => (
                                <div key={index}>
                                    {renderField(`Director #${index + 1}`,
                                        director.servicio === 'Director Nominal' ? 'Director Nominal' : renderPersonName(director)
                                    )}
                                </div>
                            ))}
                        </>
                    );
                })() : (
                    <p>No hay directores registrados.</p>
                )}

                {/* Dignatarios de la Sociedad */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Dignatarios de la Sociedad</h2>
                {((solicitudData.dignatarios && peopleData.length > 0) || (solicitudData.dignatarios?.length ?? 0) > 0) ? (
                    // Mostrar primero los dignatarios propios y luego los nominales
                    [...peopleData.filter(person => person.dignatario), ...(solicitudData.dignatarios ?? []).filter(dignatario => dignatario.servicio === 'Dignatario Nominal')]
                        .map((dignatario, index) => {
                            // Verificar si el dignatario es nominal
                            if (dignatario.servicio === 'Dignatario Nominal' && dignatario.posiciones) {
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

                {solicitudData.dignatarios && (() => {
                    const dignatariosList = solicitudData.dignatarios
                        .map((dignatario, index) => {
                            if (dignatario.servicio === 'Dignatario Nominal') {
                                // 🔹 Dignatario Nominal: No necesita buscar en `peopleData`
                                const posicionesNominales = dignatario.positions || [];
                                const posicionesConcatenadasNominal = posicionesNominales.join(', '); // Concatenar posiciones directamente

                                return (
                                    <div key={index} className="mb-4">
                                        {renderField(`Dignatario #${index + 1}`, 'Dignatario Nominal')}

                                        {/* Mostrar posiciones concatenadas si existen */}
                                        {posicionesNominales.length > 0 && (
                                            <div className="ml-6">
                                                <strong>Posiciones: </strong>
                                                <span>{posicionesConcatenadasNominal}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            } else {
                                // 🔹 Dignatario Propio: Buscar en `peopleData`
                                const person = peopleData.find(person => person.id === dignatario.id_persona);
                                if (!person) return null; // Omitir si no se encuentra en `peopleData`

                                const posiciones = dignatario.positions || [];
                                const posicionesConcatenadas = posiciones.join(', '); // Concatenar posiciones directamente

                                return (
                                    <div key={index} className="mb-4">
                                        {renderField(`Dignatario #${index + 1}`, renderPersonName(person))}

                                        {/* Mostrar posiciones concatenadas si existen */}
                                        {posiciones.length > 0 && (
                                            <div className="ml-6">
                                                <strong>Posiciones: </strong>
                                                <span>{posicionesConcatenadas}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        })
                        .filter(Boolean); // Remover elementos nulos

                    return dignatariosList.length > 0 ? dignatariosList : null;
                })()}

                <hr className='mt-4 mb-4'></hr>

                {/* Accionistas de la Sociedad */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Accionistas de la Sociedad</h2>
                {(solicitudData.accionistas && peopleData.length > 0) ? (
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

                {solicitudData.accionistas && peopleData.length > 0 && (() => {
                    const accionistasList = solicitudData.accionistas
                        .map((accionista, index) => {
                            const person = peopleData.find(person => person.id === accionista.id_persona);
                            if (!person) return null; // Omitir si no se encuentra en `peopleData`

                            const porcentajeAcciones = accionista.porcentajeAcciones || 0; // Tomar el porcentaje de acciones

                            return (
                                <div key={index} className="mb-4">
                                    {renderField(`Accionista #${index + 1}`, renderPersonName(person))}

                                    {/* Mostrar porcentaje de acciones si está disponible */}
                                    {porcentajeAcciones > 0 && (
                                        <div className="ml-6">
                                            <strong>Porcentaje de acciones: </strong>
                                            <span>{porcentajeAcciones}%</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                        .filter(Boolean); // Remover elementos nulos

                    return accionistasList.length > 0 ? accionistasList : null;
                })()}

                <hr className='mt-4 mb-4'></hr>
                {/* Capital y división de Acciones */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Capital y división de Acciones</h2>
                {solicitudData.capital ? (
                    <>
                        {renderField('Capital social en dólares', solicitudData.capital.capital)}
                        {renderField('Cantidad de Acciones', solicitudData.capital.cantidadAcciones)}
                        {renderField('Acciones sin Valor Nominal', solicitudData.capital.accionesSinValorNominal)}
                        {renderField('Valor de cada acción (debe totalizar el capital social)', solicitudData.capital.valorPorAccion)}
                    </>
                ) : (
                    <p>No hay capital registradas.</p>
                )}

                <hr className='mt-4 mb-4'></hr>
                {/* Poder de la Sociedad */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Poder de la Sociedad</h2>
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

                {solicitudData.poder && peopleData.length > 0 && (() => {
                    const apoderadosList = solicitudData.poder
                        .map((poder, index) => {
                            const person = peopleData.find(person => person.id === poder.id_persona);
                            if (!person) return null; // Omitir si no se encuentra en `peopleData`

                            return (
                                <div key={index}>
                                    {renderField(`Poder #${index + 1}`, renderPersonName(person))}
                                </div>
                            );
                        })
                        .filter(Boolean); // Remover elementos nulos

                    return apoderadosList.length > 0 ? apoderadosList : null;
                })()}

                <hr className='mt-4 mb-4'></hr>
                {/* Actividades de la Sociedad */}
                <h2 className="text-2xl font-bold mt-2 mb-4">Actividades de la Sociedad</h2>
                {solicitudData.actividades || solicitudData.dentroPanama ? (
                    <>
                        {/* Si la opción es "SiYaTengoLocal", mostrar los datos comerciales */}
                        {(solicitudData.actividades?.actividadesDentroPanama === 'SiYaTengoLocal') ||
                            (solicitudData?.dentroPanama === 'Si, ya tengo la local') && (
                                <>
                                    <h5 className="text-xl font-bold mt-2 mb-4">Actividades dentro de Panamá</h5>
                                    <div className="ml-6">
                                        {renderField('Nombre Comercial', solicitudData.actividades?.actividadesDentroPanamaData.nombreComercial || solicitudData.avisOperacion.aO_nombreComercial)}
                                        {renderField('Dirección Comercial', solicitudData.actividades?.actividadesDentroPanamaData.direccionComercial || solicitudData.avisOperacion.aO_direccion)}
                                        {renderField('Cómo llegar', solicitudData.actividades?.actividadesDentroPanamaData.comoLlegar || solicitudData.avisOperacion.aO_comoLlegar)}
                                        {renderField('Provincia', solicitudData.actividades?.actividadesDentroPanamaData.provincia || solicitudData.avisOperacion.aO_provincia)}
                                        {renderField('Corregimiento', solicitudData.actividades?.actividadesDentroPanamaData.corregimiento || solicitudData.avisOperacion.aO_corregimiento)}
                                        {renderField('Número de Local', solicitudData.actividades?.actividadesDentroPanamaData.numeroLocal || solicitudData.avisOperacion.aO_local)}
                                        {renderField('Nombre del Edificio', solicitudData.actividades?.actividadesDentroPanamaData.nombreEdificio || solicitudData.avisOperacion.aO_edificio)}
                                        {renderField('Inversión de la sucursal', solicitudData.actividades?.actividadesDentroPanamaData.inversionSucursal || solicitudData.avisOperacion.aO_inversion)}
                                        {renderField('Cantidad de Trabajadores', solicitudData.actividades?.actividadesDentroPanamaData.cantidadTrabajadores || solicitudData.avisOperacion.aO_trabajadores)}
                                        {renderField('Mantener Rótulo', solicitudData.actividades?.actividadesDentroPanamaData.mantenerRotulo || solicitudData.avisOperacion.aO_rotulo)}
                                        {renderField('Teléfono', solicitudData.actividades?.actividadesDentroPanamaData.telefono || solicitudData.avisOperacion.aO_telefono)}
                                        {renderField('Correo Electrónico', solicitudData.actividades?.actividadesDentroPanamaData.correoElectronico || solicitudData.avisOperacion.aO_email)}
                                        {renderField('Actividad #1', solicitudData.actividades?.actividad1 || solicitudData.actividadComercial.aC_1)}
                                        {renderField('Actividad #2', solicitudData.actividades?.actividad2 || solicitudData.actividadComercial.aC_2)}
                                        {renderField('Actividad #3', solicitudData.actividades?.actividad3 || solicitudData.actividadComercial.aC_3)}
                                    </div>
                                    {((solicitudData.actividades?.contador && solicitudData.actividades?.mantieneContador === 'Si') ||
                                        (solicitudData.contador && solicitudData.contador.selectContador === 'Si')
                                    ) && (
                                            <>
                                                <h5 className="text-xl font-bold mt-2 mb-4">Información del contador</h5>
                                                <div className="ml-6">
                                                    {renderField('Nombre del Contador', solicitudData.actividades?.contador.nombreContador || solicitudData.contador.contador_nombre)}
                                                    {renderField('Idoneidad', solicitudData.actividades?.contador.idoneidadContador || solicitudData.contador.contador_idoneidad)}
                                                    {renderField('Teléfono', solicitudData.actividades?.contador.telefonoContador || solicitudData.contador.contador_telefono)}
                                                    {renderField('Correo Electrónico', solicitudData.actividades?.contador.correoContador || solicitudData.contador.contador_email)}
                                                </div>
                                            </>
                                        )}
                                </>
                            )}

                        {/* Si la opción es "SiRequieroSociedadPrimero", mostrar solo las actividades */}
                        {(solicitudData.actividades?.actividadesDentroPanama === 'SiRequieroSociedadPrimero') ||
                            (solicitudData?.dentroPanama === 'Si, pero requiero la sociedad') && (
                                <>
                                    <h4 className="text-xl font-bold mt-2 mb-4">Actividades Comerciales</h4>
                                    <div className="ml-6">
                                        {renderField('Actividad #1', solicitudData.actividades?.actividad1 || solicitudData.actividadComercial.aC_1)}
                                        {renderField('Actividad #2', solicitudData.actividades?.actividad2 || solicitudData.actividadComercial.aC_2)}
                                        {renderField('Actividad #3', solicitudData.actividades?.actividad3 || solicitudData.actividadComercial.aC_3)}
                                    </div>
                                    {((solicitudData.actividades?.contador && solicitudData.actividades?.mantieneContador === 'Si') ||
                                        (solicitudData.contador && solicitudData.contador.selectContador === 'Si')) && (
                                            <>
                                                <h5 className="text-xl font-bold mt-2 mb-4">Información del contador</h5>
                                                <div className="ml-6">
                                                    {renderField('Nombre del Contador', solicitudData.actividades?.contador.nombreContador || solicitudData.contador.contador_nombre)}
                                                    {renderField('Idoneidad', solicitudData.actividades?.contador.idoneidadContador || solicitudData.contador.contador_idoneidad)}
                                                    {renderField('Teléfono', solicitudData.actividades?.contador.telefonoContador || solicitudData.contador.contador_telefono)}
                                                    {renderField('Correo Electrónico', solicitudData.actividades?.contador.correoContador || solicitudData.contador.contador_email)}
                                                </div>
                                            </>
                                        )}
                                </>
                            )}

                        {/* Si la opción es "No" y es "offshore", mostrar las actividades offshore */}
                        {((solicitudData.actividades?.actividadesDentroPanama === 'No' && solicitudData.actividades?.actividadesOffshore) ||
                            (solicitudData?.dentroPanama === 'No' && solicitudData?.fueraPanama)) && (
                                <>
                                    <h3 className="text-xl font-bold mt-2 mb-4">Actividades Offshore</h3>
                                    <div className="ml-6">
                                        {renderField('Actividad Offshore #1', get(solicitudData, 'actividades.actividadesOffshore.actividadOffshore1', get(solicitudData, 'fueraPanama.aCF_1', 'N/A')))}
                                        {renderField('Actividad Offshore #2', get(solicitudData, 'actividades.actividadesOffshore.actividadOffshore2', get(solicitudData, 'fueraPanama.aCF_2', 'N/A')))}
                                        {renderField('Países donde se ejecutarán las actividades', get(solicitudData, 'actividades.actividadesOffshore.paisesActividadesOffshore', get(solicitudData, 'fueraPanama.aCF_paises', 'N/A')))}
                                    </div>
                                </>
                            )}

                        {/* Si la opción es "No" y es "tenedora de activos", mostrar las opciones de tenedora de activos */}
                        {
                            Array.isArray(solicitudData.actividades?.actividadTenedora) && (
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
                        {renderField('Solicitud Adicional', solicitudData?.solicitudAdicional?.solicitudAdicional || solicitudData.solicitudAdicional)}
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

                {((mostrarAdjuntos && solicitudData.actividades) || (mostrarAdjuntos && solicitudData.solicitudAdicional.archivoURL)) && (
                    <>
                        <hr className='mt-2 mb-2' />
                        <p className="font-semibold mb-2">Archivos Adjuntos:</p>
                        <ul className="space-y-2 text-sm">
                            {solicitudData.actividades.adjuntoDocumentoContribuyente && (
                                <li>
                                    <strong>Registro Único de Contribuyente:</strong>{' '}
                                    <a href={solicitudData.actividades.adjuntoDocumentoContribuyente} target="_blank" rel="noopener noreferrer" className="text-blue-400 no-underline hover:underline">
                                        Ver archivo adjunto
                                    </a>
                                </li>
                            )}

                            {solicitudData.solicitudAdicional.archivoURL && (
                                <li>
                                    <strong>Solicitud Adicional:</strong>{' '}
                                    <a href={solicitudData.solicitudAdicional.archivoURL} target="_blank" rel="noopener noreferrer" className="text-blue-400 no-underline hover:underline">
                                        Ver archivo adjunto
                                    </a>
                                </li>
                            )}
                        </ul>
                        <hr className='mt-2 mb-2' />
                    </>
                )}

                <div className="flex gap-x-3 mt-4">
                    <button
                        className="bg-profile text-white px-4 py-2 rounded"
                        onClick={() => setMostrarAdjuntos(prev => !prev)}
                    >
                        {mostrarAdjuntos ? 'Ocultar archivos adjuntos' : 'Ver archivos adjuntos'}
                    </button>

                    <button
                        onClick={generatePDF}
                        className="px-4 py-2 bg-profile text-white font-bold rounded hover:bg-profile-600"
                    >
                        Descargar Resumen PDF
                    </button>

                    <button
                        onClick={generateInfoPersonas}
                        className="px-4 py-2 bg-profile text-white font-bold rounded hover:bg-profile-600"
                    >
                        Descargar Información de las Personas
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SociedadEmpresaResumen;