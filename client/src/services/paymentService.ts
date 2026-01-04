import api from '@/lib/api';

export interface RefundDetails {
  amount: number;
  method: string;
  referenceNumber?: string;
  bankName?: string;
  transactionDate: string;
  reason: string;
  notes?: string;
  processedBy: {
    _id: string;
    name: string;
    email: string;
  };
  processedAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  scheduleId: {
    _id: string;
    clientName: string;
    auditoriumId: string;
    startDateTime: string;
    endDateTime: string;
    purpose: string;
    attendingPeopleCount: number;
    status: string;
    extraCharges?: ExtraCharge[];
    totalExtraCharges?: number;
    finalAmount?: number;
    contactDetails?: {
      organizationName: string;
      telephone: string;
      mobile: string;
      email?: string;
      address: string;
    };
  };
  amount: number;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentDetails?: {
    method: string;
    referenceNumber?: string;
    bankName?: string;
    chequeNumber?: string;
    transactionDate: string;
    notes?: string;
  };
  refundDetails?: RefundDetails;
  isRefunded: boolean;
  createdBy?: {
    name: string;
    email: string;
  };
  confirmedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ExtraCharge {
  amount: number;
  description: string;
  notes?: string;
  addedBy: {
    _id: string;
    name: string;
    email: string;
  };
  addedAt: string;
}

class PaymentService {
  async getInvoices(status?: string, page = 1, limit = 20): Promise<InvoicesResponse> {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };

    if (status) params.status = status;

    const response = await api.get<InvoicesResponse>('/invoices', { params });
    return response.data;
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  }

  async getInvoiceBySchedule(scheduleId: string): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/schedule/${scheduleId}`);
    return response.data;
  }
  
  async processRefund(
    invoiceId: string,
    refundData: {
      amount: number;
      method: string;
      referenceNumber?: string;
      bankName?: string;
      transactionDate: string;
      reason: string;
      notes?: string;
    }
  ): Promise<{ message: string; data: Invoice }> {
    const response = await api.patch(`/invoices/${invoiceId}/refund`, refundData);
    return response.data;
  }

  async addExtraCharge(
    invoiceId: string,
    data: { amount: number; description: string; notes?: string }
  ): Promise<Invoice> {
    const response = await api.patch(`/invoices/${invoiceId}/add-extra-charge`, data);
    return response.data.data;
  }
}

export const paymentService = new PaymentService();