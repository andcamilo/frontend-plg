import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import get from 'lodash/get';
import { getZohoAccessToken } from '@utils/zoho-utils';
import { backendBaseUrl } from '@utils/env';

const zohoInvoicesApiUrl = `${backendBaseUrl}/chris/get-invoices`;

const getInvoices = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { limit = '10', page = '1' } = req.query;

    // Obtener el Access Token desde Zoho
    const accessToken = await getZohoAccessToken();

    // Realizar la solicitud a la API de Zoho para obtener las facturas
    const response = await axios.get(zohoInvoicesApiUrl, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
      params: {
        organization_id: '862159159',
        per_page: parseInt(limit as string, 10),
        page: parseInt(page as string, 10),
      },
    });

    const data = response.data;
    const invoices = get(data, 'invoices', []).map((invoice: any) => ({
      invoice_number: invoice.invoice_number,
      customer_name: invoice.customer_name,
      status: invoice.status,
      date: invoice.date,
      due_date: invoice.due_date,
      total: invoice.total,
      balance: invoice.balance,
    }));

    const pagination = get(data, 'page_context', {});

    // Retornar la respuesta formateada
    res.status(200).json({
      status: 'success',
      invoices,
      pagination,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      message: 'Failed to fetch invoices',
      error: error.message,
    });
  }
};

export default getInvoices;
