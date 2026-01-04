import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Calendar, Plus, FileText,
  User, LogOut, DollarSign, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavLink } from '@/components/NavLink';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onCloseMobile: () => void;
}

const Sidebar = ({ isMobileOpen, isCollapsed, onCloseMobile }: SidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const allNavItems = [
    { to: '/', icon: LayoutDashboard, label: t('sidebar.nav.dashboard'), roles: ['admin', 'recommendation', 'approval'] },
    { to: '/new-booking', icon: Plus, label: t('sidebar.nav.newBooking'), roles: ['admin'] },
    { to: '/bookings', icon: CalendarDays, label: t('sidebar.nav.bookings'), roles: ['admin', 'recommendation', 'approval'] },
    { to: '/schedule', icon: Calendar, label: t('sidebar.nav.schedule'), roles: ['admin', 'recommendation', 'approval'] },
    { to: '/calendar', icon: Calendar, label: t('sidebar.nav.calendar'), roles: ['admin', 'recommendation', 'approval'] },
    { to: '/payments', icon: DollarSign, label: t('sidebar.nav.payments'), roles: ['admin'] },
    { to: '/reports', icon: FileText, label: t('sidebar.nav.reports'), roles: ['admin'] },
    { to: '/profile', icon: User, label: t('sidebar.nav.profile'), roles: ['admin', 'recommendation', 'approval'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role || ''));

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const userInitials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'U';

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    onCloseMobile();
    setShowLogoutDialog(false);
  };

  const SidebarItem = ({ item }: { item: any }) => (
    <NavLink
      to={item.to}
      onClick={() => onCloseMobile()}
      className={cn(
        'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200',
        isActive(item.to)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isCollapsed ? 'justify-center' : ''
      )}
    >
      <item.icon className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
      {!isCollapsed && (
        <span className="whitespace-nowrap animate-fade-in">
          {item.label}
        </span>
      )}
    </NavLink>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <>
        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
        )}

        <aside
          className={cn(
            'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50', // Updated: top-0, h-screen, z-50
            'transition-all duration-300 ease-in-out',
            // Mobile Slide Logic
            'lg:translate-x-0',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full',
            // Width Logic
            isCollapsed ? 'w-[70px]' : 'w-64' 
          )}
        >
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* LOGO SECTION (Back in Sidebar) */}
            <div className={cn(
              "flex items-center gap-3 h-header px-6 border-b border-sidebar-border transition-all flex-shrink-0",
              isCollapsed ? "justify-center px-2" : ""
            )}>
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              
              {!isCollapsed && (
                <span className="font-semibold text-lg text-foreground whitespace-nowrap overflow-hidden">
                   Auditorium
                </span>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
              {navItems.map((item) => (
                isCollapsed ? (
                  <Tooltip key={item.to}>
                    <TooltipTrigger asChild>
                      <div><SidebarItem item={item} /></div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarItem key={item.to} item={item} />
                )
              ))}
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-sidebar-border mt-auto">
              {isCollapsed ? (
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <button
                        onClick={() => setShowLogoutDialog(true)}
                        className="w-full flex justify-center p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {user?.name} - {t('sidebar.logout.title')}
                    </TooltipContent>
                 </Tooltip>
              ) : (
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors group"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name || t('sidebar.user')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || ''}
                    </p>
                  </div>
                  <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Logout Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('sidebar.logout.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('sidebar.logout.desc')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>{t('sidebar.logout.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogoutConfirm} className="bg-destructive hover:bg-destructive/90">{t('sidebar.logout.confirm')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </TooltipProvider>
  );
};

export default Sidebar;