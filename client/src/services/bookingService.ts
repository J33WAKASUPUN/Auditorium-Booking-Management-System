import api from '@/lib/api';

export interface Booking {
  _id: string;
  auditoriumId: string;
  clientName: string;
  contactDetails: {
    organizationName: string;
    telephone: string;
    mobile: string;
    fax?: string;
    email?: string;
    address: string;
    designation: string;
  };
  startDateTime: string;
  endDateTime: string;
  bookingDate: string;
  dueDate: string;
  attendingPeopleCount: number;
  purpose: string;
  amount: number;
  status: string;
  createdAt: string;
  isDraft: boolean;
  paymentConfirmed: boolean;
  cancelledAt?: string;
  cancellationReason?: string;
  // Status tracking for recommendation and approval
  recommendationStatus?: {
    status: 'pending' | 'completed' | 'cancelled';
    completedBy?: {
      _id: string;
      name: string;
      email: string;
    };
    completedAt?: string;
    cancellationReason?: string;
  };
  approvalStatus?: {
    status: 'pending' | 'completed' | 'cancelled';
    completedBy?: {
      _id: string;
      name: string;
      email: string;
    };
    completedAt?: string;
    cancellationReason?: string;
  };
  additionalServices?: {
    vipRoom: boolean;
    multimedia: boolean;
    airConditioner: boolean;
    buffet: boolean;
    soundSystem: boolean;
    microphoneCount: number;
    wirelessMicCount: number;
    otherRequirements?: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface BookingsResponse {
  data: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BookingFilters {
  auditoriumId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class BookingService {
  /**
   * Fetch all bookings with optional filters
   */
  async getBookings(filters: BookingFilters = {}): Promise<BookingsResponse> {
    const params: Record<string, string> = {
      page: String(filters.page || 1),
      limit: String(filters.limit || 100),
    };

    if (filters.auditoriumId) params.auditoriumId = filters.auditoriumId;
    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    const response = await api.get<BookingsResponse>('/schedules', { params });
    return response.data;
  }

  /**
   * Get single booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/schedules/${id}`);
    return response.data;
  }

  /**
   * Create new booking
   */
  async createBooking(data: any): Promise<{ message: string; data: Booking }> {
    const response = await api.post('/schedules', data);
    return response.data;
  }

  /**
   * Update booking
   */
  async updateBooking(
    id: string,
    data: any
  ): Promise<{ message: string; data: Booking }> {
    const response = await api.patch(`/schedules/${id}`, data);
    return response.data;
  }

  /**
   * Delete/Cancel booking (soft delete)
   */
  async deleteBooking(
    id: string,
    reason: string
  ): Promise<{ message: string; data: Booking }> {
    const response = await api.delete(`/schedules/${id}`, {
      data: { reason },
    });
    return response.data;
  }

  /**
   * Permanently delete cancelled booking (admin only)
   */
  async permanentDeleteBooking(
    id: string
  ): Promise<{ message: string; data: { id: string; deletedAt: string } }> {
    const response = await api.delete(`/schedules/${id}/permanent`);
    return response.data;
  }

  /**
   * Confirm payment for booking
   */
  async confirmPayment(
    id: string,
    notes: string
  ): Promise<{ message: string; data: Booking }> {
    const response = await api.patch(`/schedules/${id}/confirm-payment`, { notes });
    return response.data;
  }

  /**
   * Recommend booking (Recommendation Officer)
   */
  async recommendBooking(id: string): Promise<{ message: string; data: Booking }> {
    const response = await api.patch(`/schedules/${id}/recommend`);
    return response.data;
  }

  /**
   * Approve booking (Approval Officer)
   */
  async approveBooking(id: string): Promise<{ message: string; data: Booking }> {
    const response = await api.patch(`/schedules/${id}/approve`);
    return response.data;
  }

  /**
   * Cancel recommendation with reason
   */
  async cancelRecommendation(
    id: string,
    reason: string
  ): Promise<{ message: string; data: Booking }> {
    const response = await api.patch(`/schedules/${id}/cancel-recommendation`, {
      reason,
    });
    return response.data;
  }

  /**
   * Cancel approval with reason
   */
  async cancelApproval(
    id: string,
    reason: string
  ): Promise<{ message: string; data: Booking }> {
    const response = await api.patch(`/schedules/${id}/cancel-approval`, { reason });
    return response.data;
  }
}

export const bookingService = new BookingService();