import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const listRecordsUrl = `${backendBaseUrl}/${backendEnv}/list-records`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Extract and normalize params
    const {
      role: roleRaw,
      permisos,
      email,
      lawyer,
      name,
      solicitud,
      type,
      ...rest
    } = req.query as Record<string, string | string[]>;

    const role = Number(Array.isArray(roleRaw) ? roleRaw[0] : roleRaw);
    const permisosStr = Array.isArray(permisos) ? permisos[0] : permisos;
    const emailStr = Array.isArray(email) ? email[0] : email;
    const lawyerStr = Array.isArray(lawyer) ? lawyer[0] : lawyer;
    const nameStr = Array.isArray(name) ? name[0] : name;
    const solicitudStr = Array.isArray(solicitud) ? solicitud[0] : solicitud;
    const typeStr = Array.isArray(type) ? type[0] : type;

    const isAdminScope = Number.isFinite(role) && role > 34
      || permisosStr === 'expediente'
      || permisosStr === 'administrador';

    if (!isAdminScope) {
      if (!emailStr && !lawyerStr) {
        return res.status(400).json({ message: 'must provide email or lawyer' });
      }
    }

    // Build clean params (no empty values)
    const cleanedParams: Record<string, string | number> = {};
    if (Number.isFinite(role)) cleanedParams.role = role;
    if (permisosStr) cleanedParams.permisos = permisosStr;
    if (emailStr) cleanedParams.email = emailStr;
    if (lawyerStr) cleanedParams.lawyer = lawyerStr;
    if (nameStr) cleanedParams.name = nameStr;
    if (solicitudStr) cleanedParams.solicitud = solicitudStr;
    if (typeStr) cleanedParams.type = typeStr;

    // Pass through any other non-empty simple params
    Object.entries(rest).forEach(([key, value]) => {
      const v = Array.isArray(value) ? value[0] : value;
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        cleanedParams[key] = v as string;
      }
    });

    // Default ordering if not provided by client
    if (!('orderBy' in cleanedParams)) cleanedParams.orderBy = 'createdAt';
    if (!('direction' in cleanedParams)) cleanedParams.direction = 'desc';

    // Delegate to backend Lambda which talks to Firestore
    const response = await axios.get(listRecordsUrl, { params: cleanedParams });

    // Normalize response shape
    const data = response.data;
    const records = data?.records || data?.data?.records || data?.data || [];
    const list = Array.isArray(records) ? records : [];
    const count = typeof data?.count === 'number' ? data.count : list.length;

    return res.status(200).json({ status: 'success', records: list, count });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message
      || error?.message
      || 'Failed to fetch records';
    return res.status(status).json({ message });
  }
}
