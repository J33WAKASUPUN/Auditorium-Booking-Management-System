import api from '@/lib/api';

export interface ScheduleAnalytics {
  total: number;
  draft: number;
  paymentPending: number;
  paymentConfirmed: number;
  recommended: number;
  approved: number;
  completed: number;
  cancelled: number;
  recommendationCancelled: number;
  approvalCancelled: number;
}

export interface InvoiceAnalytics {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
}

export interface AuditoriumUtilization {
  auditoriumId: string;
  totalBookings: number;
  utilizationRate: number;
}

export interface MonthlyTrend {
  month: string;
  schedules: number;
  revenue: number;
}

export interface AnalyticsDashboard {
  schedules: ScheduleAnalytics;
  invoices: InvoiceAnalytics;
  auditoriumUtilization: AuditoriumUtilization[];
  trends: MonthlyTrend[];
  pendingRecommendations: number;
  pendingApprovals: number;
  upcomingEvents: number;
}

const analyticsService = {
  getDashboard: async (startDate?: string, endDate?: string): Promise<AnalyticsDashboard> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/analytics/dashboard', { params });
    return response.data;
  },

  exportSchedules: async (startDate: string, endDate: string): Promise<Blob> => {
    const response = await api.get('/analytics/schedules/export', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response.data;
  },

  // Export schedules as PDF
  exportSchedulesPDF: async (startDate: string, endDate: string): Promise<Blob> => {
    const response = await api.get('/analytics/schedules/export-pdf', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response.data;
  },

  exportInvoices: async (startDate: string, endDate: string): Promise<Blob> => {
    const response = await api.get('/analytics/invoices/export', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response.data;
  },

  // Export invoices as PDF
  exportInvoicesPDF: async (startDate: string, endDate: string): Promise<Blob> => {
    const response = await api.get('/analytics/invoices/export-pdf', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default analyticsService;