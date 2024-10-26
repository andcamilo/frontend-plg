import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { solicitudId, actividades } = req.body;  // Obtenemos solicitudId y actividades del cuerpo de la solicitud

    // Verificar si se proporcionó el ID de la solicitud
    if (!solicitudId) {
        return res.status(400).json({ message: 'solicitudId es requerido' });
    }

    // Verificar si se proporcionó el campo `actividades`
    if (typeof actividades === 'undefined') {
        return res.status(400).json({ message: 'El campo actividades es requerido' });
    }

    console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
    console.log('🚀 ~ handler ~ actividades:', actividades);

    try {
        // Verificar si se ha proporcionado los campos obligatorios para actividades
        if (!actividades.actividadesDentroOFueraPanama) {
            return res.status(400).json({ message: 'El campo actividadesDentroPanama es requerido' });
        }

        let updatePayload: any = {
            solicitudId,
        };

        // Si la opción es "SiYaTengoLocal", incluir los campos de actividades dentro de Panamá
        if (actividades.actividadesDentroOFueraPanama === 'SiYaTengoLocal') {
            updatePayload.actividades = {
                actividadesDentroOFueraPanama: actividades.actividadesDentroOFueraPanama,
                actividadesDentroPanama: {
                    nombreComercial: actividades.actividadesDentroPanama.nombreComercial,
                    direccionComercial: actividades.actividadesDentroPanama.direccionComercial,
                    comoLlegar: actividades.actividadesDentroPanama.comoLlegar,
                    provincia: actividades.actividadesDentroPanama.provincia,
                    corregimiento: actividades.actividadesDentroPanama.corregimiento,
                    numeroLocal: actividades.actividadesDentroPanama.numeroLocal,
                    nombreEdificio: actividades.actividadesDentroPanama.nombreEdificio,
                    inversionSucursal: actividades.actividadesDentroPanama.inversionSucursal,
                    cantidadTrabajadores: actividades.actividadesDentroPanama.cantidadTrabajadores,
                    mantenerRotulo: actividades.actividadesDentroPanama.mantenerRotulo,
                    telefono: actividades.actividadesDentroPanama.telefono,
                    correoElectronico: actividades.actividadesDentroPanama.correoElectronico,
                },
                actividad1: actividades.actividad1,
                actividad2: actividades.actividad2,
                actividad3: actividades.actividad3,
                mantieneContador: actividades.mantieneContador,
                registrosContables: actividades.registrosContables,
                servicioDireccionComercial: actividades.servicioDireccionComercial,
            };
        }

        // Si la opción es "SiRequieroSociedadPrimero"
        if (actividades.actividadesDentroOFueraPanama === 'SiRequieroSociedadPrimero') {
            updatePayload.actividades = {
                actividadesDentroOFueraPanama: actividades.actividadesDentroOFueraPanama,
                actividad1: actividades.actividad1,
                actividad2: actividades.actividad2,
                actividad3: actividades.actividad3,
                mantieneContador: actividades.mantieneContador,
                registrosContables: actividades.registrosContables,
                servicioDireccionComercial: actividades.servicioDireccionComercial,
            };
        }

        // Si el contador se mantiene (mantieneContador es "Sí"), incluir los campos del contador
        if (actividades.mantieneContador === 'Si') {
            updatePayload.actividades.contador = {
                nombreContador: actividades.contador.nombreContador,
                idoneidadContador: actividades.contador.idoneidadContador,
                telefonoContador: actividades.contador.telefonoContador,
                correoContador: actividades.contador.correoContador,
            };
        }

        // Si la opción es "No" y la actividad seleccionada es "offshore"
        if (actividades.actividadesDentroOFueraPanama === 'No' && actividades.actividadesOffshore) {
            updatePayload.actividades = {
                actividadesDentroOFueraPanama: actividades.actividadesDentroOFueraPanama,
                actividadesOffshore: {
                    tipoActividades: actividades.actividadesOffshore.tipoActividades,
                    actividadOffshore1: actividades.actividadesOffshore.actividadOffshore1,
                    actividadOffshore2: actividades.actividadesOffshore.actividadOffshore2,
                    paisesActividadesOffshore: actividades.actividadesOffshore.paisesActividadesOffshore,
                },
            };
        }

        // Nueva lógica para "Tenedora de activos"
        if (actividades.actividadesDentroOFueraPanama === 'No' && actividades.actividadTenedora) {
            // Asegurarse de que actividadTenedora sea un array
            if (!Array.isArray(actividades.actividadTenedora)) {
                return res.status(400).json({ message: 'El campo actividadTenedora debe ser un array' });
            }

            updatePayload.actividades = {
                ...updatePayload.actividades,  // Mantener lo que ya esté en el payload
                actividadesDentroOFueraPanama: actividades.actividadesDentroOFueraPanama,
                actividadTenedora: actividades.actividadTenedora  // Asignar directamente el array
            };
        }


        // Enviar solicitud a la API externa (por ejemplo, AWS Lambda o Firebase)
        const externalApiResponse = await axios.patch(
            `http://localhost:4000/chris/update-sociedad-actividades`,  // URL de la API para actualizar las actividades
            updatePayload  // Enviar el cuerpo con solicitudId y actividades
        );

        // Retornar la respuesta de la API externa
        return res.status(200).json(externalApiResponse.data);
    } catch (error) {
        console.error('Error haciendo PATCH request a la API:', error.toJSON ? error.toJSON() : error);

        if (error.response) {
            return res.status(error.response.status).json({
                message: error.response.data?.message || 'La solicitud a la API externa falló',
            });
        } else {
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}
