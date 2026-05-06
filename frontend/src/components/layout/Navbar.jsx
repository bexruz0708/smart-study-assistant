import { useState } from 'react';
import { Menu, Sun, Moon, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase()
    : 'U';
  
  return (
    <header className="h-16 border-b bg-card sticky top-0 z-30">
      <div className="h-full px-4 flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-muted rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden lg:block">
          <h2 className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{user?.first_name || user?.email}</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Language */}
          <LanguageSwitcher />
          
          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title={theme === 'light' ? "Dark mode" : "Light mode"}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-md transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
              <ChevronDown className={cn(
                'w-4 h-4 transition-transform',
                menuOpen && 'rotate-180'
              )} />
            </button>
            
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg z-50 py-1 animate-fade-in">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Profile
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;