import { z } from "zod";

// Schema para el timestamp de Firestore
const FirestoreTimestampSchema = z.object({
  _seconds: z.number(),
  _nanoseconds: z.number(),
});

// Schema para abogado
const AbogadoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  timeStamp: FirestoreTimestampSchema,
});

// Schema para entrada de bitácora
const BitacoraEntrySchema = z.object({
  accion: z.string(),
  date: FirestoreTimestampSchema,
});

// Schema para item de la canasta
const CanastaItemSchema = z.object({
  item: z.string(),
  precio: z.number(),
});

// Schema para la canasta
const CanastaSchema = z.object({
  items: z.array(CanastaItemSchema),
  subtotal: z.number(),
  total: z.number(),
});

// Schema principal para Solicitud
export const SolicitudSchema = z.object({
  id: z.string(),
  actualizarPorCorreo: z.boolean(),
  tipo: z.string(),
  emailSolicita: z.string(),
  nombreSolicita: z.string(),
  telefonoSolicita: z.string(),
  cedulaPasaporte: z.string(),
  precio: z.number(),
  subtotal: z.number(),
  total: z.number(),
  accion: z.string(),
  item: z.string(),
  abogados: z.array(AbogadoSchema),
  cuenta: z.string(),
  date: FirestoreTimestampSchema,
  bitacora: z.array(BitacoraEntrySchema),
  canasta: CanastaSchema,
  expediente: z.string(),
  status: z.number(),
  nombre: z.string(),
});

// Schema para el filtro de abogado
export const AbogadoFilterSchema = z.object({
  id: z.string(),
  nombre: z.string(),
});

// Schema específico para actualización de status (formulario)
export const SolicitudStatusUpdateSchema = z.object({
  id: z.string().optional(),
  status: z.string(), // El form maneja strings, convertimos después
  observation: z.string().optional(),
  file: z.any().optional(), // FileList o null
});

// Tipos inferidos de los schemas
export type Solicitud = z.infer<typeof SolicitudSchema>;
export type AbogadoFilter = z.infer<typeof AbogadoFilterSchema>;
export type SolicitudStatusUpdateForm = z.infer<
  typeof SolicitudStatusUpdateSchema
>;
