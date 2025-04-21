import React, { createContext, useState, ReactNode } from 'react';

/* ---------- Type Definitions ---------- */

type CajaChicaType = {
  factura: string;
  fecha_desembolso: string | null;
  monto: number;
  motivo: string;
  observacion: string;
  tipo_desembolso: string;
  usuario: string;
};

type ClienteType = {
  abogado: string;
  cliente: string;
  factura: string;
  gasto: string;
};

type GastoAsociadoType = {
  detalle_gasto: string;
  factura: string;
  monto: number;
  tipo: string;
  tipo_gasto_otros: string;
  gastos_enviados_pagados: string;
  gastos_facturados_enviados: string;
};

type OficinaType = {
  cliente: string;
  factura: string;
  gasto: string;
  monto: number;
  tipo_gasto: string;
  usuario: string;
};

type PagadoType = {
  adjunto_documento: string;
  fecha_pagado: string | null;
  numero_pagado: string;
};

type PagoType = {
  banco_pago: string;
  fecha_pago: string | null;
  nombre_pago: string;
  numero_pago: string;
  observacion_pago: string;
  select_pago: string;
};

type OldDesembolsoType = {
  cajaChica: CajaChicaType;
  cliente: ClienteType;
  gastosAsociados: GastoAsociadoType[];
  oficina: OficinaType;
  pagado: PagadoType;
  pago: PagoType;
  solicita: string;
  status: number;
  tipo: string;
  date: string;
  monto: number;
  gasto: string;
  isGasto: boolean;
};

/* ---------- Initial State ---------- */

const initialOldDesembolso: OldDesembolsoType = {
  cajaChica: {
    factura: '',
    fecha_desembolso: null,
    monto: 0,
    motivo: '',
    observacion: '',
    tipo_desembolso: '',
    usuario: '',
  },
  cliente: {
    abogado: '',
    cliente: '',
    factura: '',
    gasto: '',
  },
  gastosAsociados: [],
  oficina: {
    cliente: '',
    factura: '',
    gasto: '',
    monto: 0,
    tipo_gasto: '',
    usuario: '',
  },
  pagado: {
    adjunto_documento: '',
    fecha_pagado: null,
    numero_pagado: '',
  },
  pago: {
    banco_pago: '',
    fecha_pago: null,
    nombre_pago: '',
    numero_pago: '',
    observacion_pago: '',
    select_pago: '',
  },
  solicita: '',
  status: 0,
  tipo: '',
  date: '',
  monto: 0,
  gasto: '',
  isGasto: false,
};

/* ---------- Context ---------- */

const OldDesembolsoContext = createContext<{
  state: OldDesembolsoType;
  setState: React.Dispatch<React.SetStateAction<OldDesembolsoType>>;
} | undefined>(undefined);

export const OldDesembolsoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OldDesembolsoType>(initialOldDesembolso);
  return (
    <OldDesembolsoContext.Provider value={{ state, setState }}>
      {children}
    </OldDesembolsoContext.Provider>
  );
};

export default OldDesembolsoContext;
