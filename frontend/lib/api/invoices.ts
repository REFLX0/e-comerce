import { backendClient as api } from './client';

export interface InvoiceLine {
  id?: string;
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
  vatAmount?: number;
  totalTTC?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  customerId?: string;
  orderId?: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientMf?: string;
  notes?: string;
  subtotalHT: number;
  totalTVA: number;
  totalTTC: number;
  amountInWords: string;
  createdAt: string;
  lines: InvoiceLine[];
}

export const invoicesApi = {
  // Admin endpoints
  getAllAdmin: async (): Promise<Invoice[]> => {
    const { data } = (await api.get('/admin/invoices')) as any;
    return data;
  },

  getOneAdmin: async (id: string): Promise<Invoice> => {
    const { data } = (await api.get(`/admin/invoices/${id}`)) as any;
    return data;
  },

  create: async (payload: Partial<Invoice>): Promise<Invoice> => {
    const { data } = (await api.post('/admin/invoices', payload)) as any;
    return data;
  },

  update: async (id: string, payload: Partial<Invoice>): Promise<Invoice> => {
    const { data } = (await api.patch(`/admin/invoices/${id}`, payload)) as any;
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/admin/invoices/${id}`);
  },

  duplicate: async (id: string): Promise<Invoice> => {
    const { data } = (await api.post(`/admin/invoices/${id}/duplicate`, {})) as any;
    return data;
  },

  downloadPdfAdmin: (id: string) => {
    window.open(`/api/admin/invoices/${id}/pdf`, '_blank');
  },

  // Customer endpoints
  getAllUser: async (): Promise<Invoice[]> => {
    const { data } = (await api.get('/invoices')) as any;
    return data;
  },

  getOneUser: async (id: string): Promise<Invoice> => {
    const { data } = (await api.get(`/invoices/${id}`)) as any;
    return data;
  },

  downloadPdfUser: (id: string) => {
    window.open(`/api/invoices/${id}/pdf`, '_blank');
  },
};
