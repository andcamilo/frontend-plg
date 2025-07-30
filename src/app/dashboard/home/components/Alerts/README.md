# Sistema de Alertas LEGIX - Frontend

Este sistema de alertas ha sido actualizado para sincronizarse completamente con el backend documentado en `ALERTS_SYSTEM.md`. Permite múltiples unidades de tiempo y campos adicionales.

## 🔄 Sincronización con Backend

El frontend está **100% sincronizado** con la especificación del backend:

- Usa nombres de campos exactos: `reminderUnit`, `reminderValue`, `reminderText`, `isActive`
- Envía datos en el formato esperado por la API
- Mantiene retrocompatibilidad con `reminderDays`

## Características

### Unidades de Tiempo Soportadas

- **Horas (`hours`)**: Para recordatorios inmediatos (1-48 horas recomendado)
- **Días (`days`)**: Para recordatorios a corto plazo (1-30 días recomendado)
- **Semanas (`weeks`)**: Para recordatorios a mediano plazo (1-8 semanas recomendado)
- **Meses (`months`)**: Para recordatorios a largo plazo (1-12 meses recomendado)

### Campos de Datos (según backend)

```typescript
interface AlertData {
  reminderValue: number; // Valor numérico (1-999)
  reminderUnit: "hours" | "days" | "weeks" | "months";
  reminderText?: string; // Texto personalizado (máx 500 chars)
  isActive?: boolean; // Si la alerta está activa (default: true)
  id?: string; // ID único de la alerta
}
```

### Componentes Principales

#### `AlertForm.tsx`

Formulario principal para crear y editar alertas. **Coincide con backend**:

- Campo numérico para `reminderValue`
- Selector dropdown para `reminderUnit`
- Campo de texto para `reminderText` (opcional)
- Checkbox para `isActive`
- Validación con Zod según especificaciones

#### `AlertFormCreate.tsx`

Componente para crear nuevas alertas. **Envía al backend**:

```typescript
// Nuevo formato (recomendado)
{
  "cuenta": "user123",
  "email": "user@example.com",
  "solicitudId": "solicitud_id",
  "reminderValue": 2,
  "reminderUnit": "weeks",
  "reminderText": "Recordatorio personalizado",
  "isActive": true
}
```

#### `AlertFormEdit.tsx`

Componente para editar alertas existentes. **Actualiza backend**:

```typescript
// Nuevo formato (recomendado)
{
  "alertId": "alert_id",
  "solicitudId": "solicitud_id",
  "cuenta": "user123",
  "reminderValue": 1,
  "reminderUnit": "months",
  "reminderText": "Nuevo texto",
  "isActive": false
}
```

#### `AlertDisplay.tsx`

Componente para mostrar alertas de forma visual. **Muestra datos del backend**:

- Formato legible del tiempo según `reminderValue` + `reminderUnit`
- Muestra `reminderText` si está disponible
- Colores automáticos basados en urgencia
- Dos variantes: compacta y completa

### Utilidades Actualizadas

#### `time-converter.util.ts`

Funciones para conversión entre unidades de tiempo usando `ReminderUnit`:

- `convertToMinutes(value, reminderUnit)`: Convierte a minutos
- `convertFromMinutes(minutes, reminderUnit)`: Convierte desde minutos
- `getBestTimeUnit(minutes)`: Determina la mejor unidad para mostrar

#### `alert-data-transformer.util.ts`

Transformación de datos backend ↔ frontend usando tipos correctos:

- Maneja estructura nueva: `reminderValue` + `reminderUnit` + `reminderText` + `isActive`
- Mantiene compatibilidad con `reminderDays` legacy
- Convierte `reminderMinutes` a mejor unidad de tiempo

#### `alert-display.util.ts`

Funciones para mostrar alertas usando `ReminderUnit`:

- `formatAlertTime(value, reminderUnit)`: "2 semanas", "1 mes", etc.
- `getAlertDescription(value, reminderUnit)`: "Recordatorio en 2 semanas"
- `getAlertColorClass(value, reminderUnit)`: Clases CSS por urgencia

### Esquemas de Validación (Sincronizados con Backend)

#### `alerts.schema.ts`

```typescript
// Tipos que coinciden exactamente con el backend
export const reminderUnits = ["hours", "days", "weeks", "months"] as const;
export type ReminderUnit = (typeof reminderUnits)[number];

// Schema de entrada (formulario)
export const alertsInputSchema = z.object({
  reminderValue: z
    .string()
    .refine((val) => parseInt(val) > 0 && parseInt(val) <= 999),
  reminderUnit: z.enum(reminderUnits),
  reminderText: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  id: z.string().optional(),
});

// Schema procesado (envío al backend)
export const alertsSchema = z.object({
  reminderValue: z.number().min(1).max(999),
  reminderUnit: z.enum(reminderUnits),
  reminderText: z.string().optional(),
  isActive: z.boolean().default(true),
  id: z.string().optional(),
});
```

### Servicios de API (Coinciden con Backend)

#### `alerts.service.ts`

**Envía datos exactamente como los espera el backend**:

```typescript
// POST /alerts - Crear alerta
export const createAlert = async ({
  cuenta,
  email,
  solicitudId,
  reminderValue, // ✅ Campo backend
  reminderUnit, // ✅ Campo backend (no timeUnit)
  reminderText, // ✅ Campo backend
  isActive = true, // ✅ Campo backend
}) => {
  const body = {
    cuenta,
    email,
    solicitudId,
    reminderValue,
    reminderUnit, // ✅ Coincide con backend
    isActive,
  };

  // Agregar reminderText solo si se proporciona
  if (reminderText?.trim()) {
    body.reminderText = reminderText.trim();
  }

  // Compatibilidad legacy: enviar reminderDays cuando unit = "days"
  if (reminderUnit === "days") {
    body.reminderDays = reminderValue;
  }
};
```

### Hooks de React Query (Actualizados)

#### `useAlerts.query.ts`

```typescript
// Tipos actualizados para coincidir con backend
export const useCreateAlertMutation = () => {
  return useMutation({
    mutationFn: (alert: {
      solicitudId: string;
      reminderValue: number;
      reminderUnit: ReminderUnit; // ✅ Correcto
      reminderText?: string; // ✅ Nuevo campo
      isActive?: boolean; // ✅ Nuevo campo
    }) => createAlert({ ...alert, cuenta, email }),
  });
};
```

## Uso Actualizado

### Crear una Nueva Alerta

```tsx
import AlertFormCreate from "./components/Alerts/AlertFormCreate";

// Formulario completo con todos los campos del backend
<AlertFormCreate />;

// Los datos se envían como:
// {
//   reminderValue: 2,
//   reminderUnit: "weeks",
//   reminderText: "Revisar documentos",
//   isActive: true
// }
```

### Mostrar una Alerta

```tsx
import AlertDisplay from "./components/Alerts/AlertDisplay";

// Muestra tiempo + texto personalizado si existe
<AlertDisplay
  alert={{
    reminderValue: 2,
    reminderUnit: "weeks",
    reminderText: "Revisar documentos pendientes",
  }}
  variant="full"
/>;
```

## Retrocompatibilidad 100% Garantizada

### Con Backend Legacy

- ✅ Envía `reminderDays` cuando `reminderUnit = "days"`
- ✅ Lee alertas antiguas con solo `reminderDays`
- ✅ Convierte `reminderMinutes` a mejor unidad

### Con Estructura Antigua

```typescript
// ANTES (legacy)
{
  "reminderDays": 14
}

// DESPUÉS (equivalente automático)
{
  "reminderValue": 2,
  "reminderUnit": "weeks"  // Más descriptivo
}

// O mantener días si es más claro
{
  "reminderValue": 14,
  "reminderUnit": "days"
}
```

## Ejemplos de Datos Reales

### Estructura Backend Actual

```typescript
// Crear alerta - Request Body
{
  "cuenta": "user123",
  "email": "user@example.com",
  "solicitudId": "solicitud_123",
  "reminderValue": 6,
  "reminderUnit": "hours",
  "reminderText": "Revisar documentos urgentes",
  "isActive": true
}

// Respuesta del Backend
{
  "status": "success",
  "message": "Alert created and added to solicitud successfully",
  "alertId": "alert_id_generado",
  "reminderDateTime": "2025-02-10T10:00:00.000Z",
  "reminderValue": 6,
  "reminderUnit": "hours",
  "alertsCount": 1
}
```

### Casos de Uso Típicos

```typescript
// Urgente: Revisar en pocas horas
{ reminderValue: 4, reminderUnit: "hours", reminderText: "Documentos urgentes" }

// Normal: Seguimiento en días
{ reminderValue: 7, reminderUnit: "days", reminderText: "Verificar estado" }

// Proceso largo: Recordatorio semanal
{ reminderValue: 2, reminderUnit: "weeks", reminderText: "Revisar avance" }

// Renovación: Recordatorio mensual
{ reminderValue: 3, reminderUnit: "months", reminderText: "Renovar documentación" }
```

## Colores de Urgencia (Calculados Automáticamente)

Las alertas se colorean automáticamente basado en tiempo total:

- 🔴 **Rojo**: ≤24 horas (muy urgente)
- 🟠 **Naranja**: ≤72 horas (urgente)
- 🟡 **Amarillo**: ≤1 semana (moderado)
- 🔵 **Azul**: >1 semana (relajado)

---

## ✅ Estado de Sincronización

- [x] **Campos de datos**: `reminderUnit`, `reminderValue`, `reminderText`, `isActive`
- [x] **API calls**: Formato exacto del backend documentado
- [x] **Tipos TypeScript**: Coinciden con especificación
- [x] **Validación**: Reglas según backend (valor 1-999, texto ≤500 chars)
- [x] **Retrocompatibilidad**: `reminderDays` cuando `reminderUnit = "days"`
- [x] **Manejo de errores**: Según respuestas del backend
- [x] **Procesamiento**: Compatible con sistema automático del backend

**Versión**: 2.1 - Sincronizado con `ALERTS_SYSTEM.md`  
**Fecha**: Enero 2025  
**Compatibilidad**: 100% con backend LEGIX
