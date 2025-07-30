# Sistema de Alertas con Control de Acceso Basado en Roles

## Resumen de Implementación

Se ha implementado un sistema de control de acceso basado en roles para el sistema de alertas, permitiendo que los administradores supervisen alertas de otros usuarios mientras mantienen la privacidad para roles regulares.

## ✅ Cambios Implementados

### Backend (`backend-plg`)

1. **Endpoint GET Modificado** (`/alerts`)
   - ✅ Agregado parámetro opcional `solicitudId` para administradores
   - ✅ Verificación automática del rol del usuario consultante
   - ✅ Filtrado de alertas basado en roles:
     - **Administradores (90)** y **Súper Administradores (99)**: Pueden ver todas las alertas de una solicitud específica
     - **Otros roles**: Solo ven sus propias alertas
   - ✅ Respuesta incluye contexto del rol y tipo de vista
   - ✅ Logging detallado para debugging

### Frontend (`frontend-plg`)

2. **Servicio de Alertas Actualizado**

   - ✅ `getAlerts()` ahora acepta parámetro opcional `solicitudId`
   - ✅ Construcción automática de URL con parámetros

3. **Hooks de React Query**

   - ✅ `useAlerts(solicitudId?)` - Hook básico con soporte de solicitudId
   - ✅ `useUserData()` - Obtiene datos completos del usuario
   - ✅ `useIsAdmin()` - Verifica si el usuario es administrador
   - ✅ `useAlertsForSolicitud(solicitudId)` - Hook específico para administradores
   - ✅ `useAlertsWithRoleCheck(solicitudId?)` - Hook inteligente que maneja automáticamente el control de acceso

4. **Componente de Ejemplo**

   - ✅ `AlertsWithRoleControl.example.tsx` - Demuestra el uso completo del sistema
   - ✅ Panel de control para administradores
   - ✅ Indicadores visuales de contexto
   - ✅ Manejo de diferentes tipos de vista

5. **Documentación**
   - ✅ Actualización completa del `ALERTS_SYSTEM.md`
   - ✅ Ejemplos de integración
   - ✅ Casos de uso por rol

## 🎯 Funcionalidad por Rol

### Súper Administrador (99) y Administrador (90)

- ✅ Ver sus propias alertas (comportamiento normal)
- ✅ Ver **todas** las alertas de cualquier solicitud específica (seguimiento)
- ✅ Acceso a panel de control especial en el frontend
- ✅ Indicadores visuales de vista de administrador

### Otros Roles (80, 50, 40, 35, 17, 10)

- ✅ Ver solo las alertas que ellos mismos crearon
- ✅ Sin acceso a alertas de otros usuarios
- ✅ Mantenimiento de privacidad

## 📋 Ejemplos de Uso

### Backend API

```bash
# Usuario normal - Solo ve sus alertas
GET /alerts?cuenta=user123

# Administrador - Ve sus propias alertas
GET /alerts?cuenta=admin456

# Administrador - Ve TODAS las alertas de una solicitud específica
GET /alerts?cuenta=admin456&solicitudId=solicitud_789
```

### Frontend React

```tsx
import { useAlertsWithRoleCheck, useIsAdmin } from "../hooks/useAlerts.query";

// Uso básico (automático según rol)
const { data } = useAlertsWithRoleCheck();

// Administrador viendo solicitud específica
const { data } = useAlertsWithRoleCheck("solicitud_123");

// Verificar si es administrador
const isAdmin = useIsAdmin();
```

## 🔧 Respuesta de API Actualizada

La respuesta del endpoint GET ahora incluye contexto:

```json
{
  "status": "success",
  "data": [...], // Alertas filtradas según rol
  "pagination": {...},
  "context": {
    "userRole": 90,
    "isAdmin": true,
    "viewingSpecificSolicitud": true,
    "solicitudId": "solicitud_123",
    "viewType": "admin_solicitud_view"
  }
}
```

## 🚀 Cómo Usar en Tu Aplicación

### 1. Para Dashboard General

```tsx
// Muestra alertas según el rol automáticamente
<AlertsWithRoleControl />
```

### 2. Para Vista de Solicitud (Administradores)

```tsx
// Administradores ven todas las alertas de esta solicitud
<AlertsWithRoleControl solicitudId={solicitudId} />
```

### 3. Hook Personalizado

```tsx
const MyAlertsComponent = () => {
  const { data, isLoading } = useAlertsWithRoleCheck(solicitudId);
  const isAdmin = useIsAdmin();

  // Tu lógica personalizada aquí
};
```

## 📁 Archivos Modificados

### Backend

- `backend-plg/src/functions/(dashboard)/alerts/(index)/GET/handler.ts`
- `backend-plg/src/functions/(dashboard)/alerts/ALERTS_SYSTEM.md`

### Frontend

- `frontend-plg/src/app/dashboard/home/services/alerts.service.ts`
- `frontend-plg/src/app/dashboard/home/hooks/useAlerts.query.ts`
- `frontend-plg/src/app/dashboard/home/components/AlertsWithRoleControl.example.tsx` (nuevo)

## ✅ Características Implementadas

- ✅ **Control de acceso automático** basado en rol del usuario
- ✅ **Supervisión para administradores** sin romper privacidad
- ✅ **Backward compatibility** - No rompe funcionalidad existente
- ✅ **Logging completo** para debugging
- ✅ **Hooks optimizados** con React Query
- ✅ **Ejemplos prácticos** y documentación completa
- ✅ **Indicadores visuales** para diferentes tipos de vista
- ✅ **Contexto enriquecido** en respuestas de API

## 🔄 Migración

No se requiere migración de datos. Los cambios son **totalmente backwards compatible**:

- Usuarios existentes seguirán viendo solo sus alertas
- Administradores obtienen nueva funcionalidad automáticamente
- APIs existentes funcionan sin cambios

## 🧪 Testing

Para probar la funcionalidad:

1. **Usuario Normal**: Crear alertas y verificar que solo ve las propias
2. **Administrador**: Usar `solicitudId` para ver alertas de otros usuarios
3. **Verificar contexto**: Comprobar que `context.viewType` sea correcto

---

## 🔐 Arquitectura de Seguridad

### Validaciones en Backend

✅ **Todas las validaciones de rol se realizan en el servidor** por seguridad
✅ **Frontend simplificado** - No hace validaciones de seguridad
✅ **Filtrado automático** de alertas según permisos del usuario
✅ **Enriquecimiento de datos** con información contextual del creador

### Flujo de Seguridad

1. Frontend envía `cuenta` (usuario) y `solicitudId` (opcional)
2. Backend verifica rol del usuario en base de datos
3. Backend filtra alertas apropiadas según permisos
4. Backend enriquece alertas con información contextual
5. Frontend recibe solo datos que el usuario puede ver

## 🎨 Interfaz Mejorada

### AlertButton para Administradores

- ✅ **Información del creador**: Muestra quién creó la alerta
- ✅ **Indicador visual**: "por: usuario123" cuando no es del usuario actual
- ✅ **Tooltip informativo**: Hover muestra detalles del creador
- ✅ **Misma funcionalidad**: Botón sigue siendo editable

---

**Implementado**: Control de acceso basado en roles con validación 100% en backend  
**Seguridad**: Todas las validaciones en servidor  
**Compatibilidad**: 100% backwards compatible  
**Status**: ✅ Listo para producción
