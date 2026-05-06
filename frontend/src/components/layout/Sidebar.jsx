import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Sparkles,
  User,
  X,
  Brain,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/common/Logo';
import useUIStore from '@/store/uiStore';

const Sidebar = () => {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  
  const navItems = [
    { title: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { title: t('nav.documents'), icon: FileText, path: '/documents' },
    { title: t('nav.chat'), icon: MessageSquare, path: '/chat' },
    { title: t('nav.quizzes'), icon: Brain, path: '/quizzes', badge: 'AI' },
    { title: t('nav.flashcards'), icon: Layers, path: '/flashcards', badge: 'AI' },
    { title: t('nav.projectInfo'), icon: Sparkles, path: '/project-info', badge: 'AI' },
    { title: t('nav.profile'), icon: User, path: '/profile' },
  ];
  
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 bg-card border-r z-50 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-muted rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('w-5 h-5', isActive && 'text-primary-foreground')} />
                      <span className="font-medium flex-1">{item.title}</span>
                      {item.badge && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-semibold',
                          isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-primary/10 text-primary'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
          
          <div className="p-4 border-t">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 p-3 rounded-lg">
              <p className="text-xs font-semibold text-foreground">Smart Study v1.0</p>
              <p className="text-xs text-muted-foreground mt-1">
                AI Learning Platform
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;