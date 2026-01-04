import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import LanguageToggle from '@/components/LanguageToggle';
import NotificationDropdown from '@/components/NotificationDropdown';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  isCollapsed: boolean;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    // Updated: Header is sticky at the top of the 'content' area, not fixed full width
    <header className="h-header sticky top-0 right-0 z-40 bg-card border-b border-border">
      <div className="h-full flex items-center justify-between px-4">
        {/* Left Section: Just the Toggle Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuToggle}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right Section: Utils */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;