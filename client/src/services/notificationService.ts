import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  scheduleId?: string;
  invoiceId?: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  unreadCount: number;
}

class NotificationService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Initialize WebSocket connection
   */
  connect(token: string) {
    if (this.socket?.connected) {
      console.log('🔌 Already connected to notification service');
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

    this.socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to notification service');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from notification service:', reason);
    });

    this.socket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification);
      this.emit('notification', notification);
    });

    this.socket.on('connected', (data) => {
      console.log('🎉 WebSocket authenticated:', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('🔌 Disconnected from notification service');
    }
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Get user notifications
   */
  async getNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
    const response = await api.get<NotificationsResponse>('/notifications', {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get<{ unreadCount: number }>('/notifications/unread-count');
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.patch<Notification>(`/notifications/${notificationId}/read`);
    this.emit('notification-read', notificationId);
    return response.data;
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>('/notifications/read-all');
    this.emit('all-notifications-read', null);
    return response.data;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(`/notifications/${notificationId}`);
    this.emit('notification-deleted', notificationId);
    return response.data;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const notificationService = new NotificationService();