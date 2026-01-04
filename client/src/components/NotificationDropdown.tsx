import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, CheckCheck, Trash2, Clock, Calendar, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

const NotificationDropdown = () => {
  const { t, i18n } = useTranslation();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'schedule_created':
      case 'schedule_updated':
        return Calendar;
      case 'payment_confirmed':
      case 'invoice_created':
        return FileText;
      case 'recommendation_pending':
      case 'recommendation_completed':
      case 'approval_pending':
      case 'approval_completed':
        return Check;
      default:
        return Bell;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t('notifications.time.justNow');
    if (minutes < 60) return t('notifications.time.minutesAgo', { count: minutes });
    if (hours < 24) return t('notifications.time.hoursAgo', { count: hours });
    if (days < 7) return t('notifications.time.daysAgo', { count: days });
    
    // Format date based on current language
    return date.toLocaleDateString(i18n.language === 'si' ? 'si-LK' : 'en-US');
  };

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 relative hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label={t('notifications.title')}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-sm"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <DropdownMenuLabel className="text-base font-semibold p-0">
            {t('notifications.title')}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-2 text-xs gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="py-8">
              <LoadingSpinner size="sm" text={t('notifications.loading')} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t('notifications.empty')}</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification._id}
                  className={cn(
                    'group relative px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors',
                    !notification.isRead && 'bg-muted/30'
                  )}
                  onClick={() =>
                    handleNotificationClick(notification._id, notification.isRead)
                  }
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all',
                        notification.isRead 
                          ? 'bg-muted border border-transparent' 
                          : 'bg-primary/10 border-2 border-primary shadow-sm'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          notification.isRead ? 'text-muted-foreground' : 'text-primary'
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium line-clamp-1',
                          notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm gap-2"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
            {t('notifications.close')}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;