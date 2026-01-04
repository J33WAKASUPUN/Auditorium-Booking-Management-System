import { useState, useEffect, useCallback } from 'react';
import { notificationService, type Notification } from '@/services/notificationService';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications(1, 20);
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [isAuthenticated]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        title: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [toast]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast({
        title: 'Notification deleted',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [toast]);

  // Handle new notification
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast for new notification
      toast({
        title: notification.title,
        description: notification.message,
      });
    },
    [toast]
  );

  // Initialize WebSocket and fetch data
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Connect WebSocket
    notificationService.connect(accessToken);

    // Fetch initial data
    fetchNotifications();

    // Subscribe to new notifications
    const unsubscribe = notificationService.on('notification', handleNewNotification);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, accessToken, fetchNotifications, handleNewNotification]);

  // Disconnect on logout
  useEffect(() => {
    if (!isAuthenticated) {
      notificationService.disconnect();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};