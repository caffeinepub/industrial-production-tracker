import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, X, LayoutDashboard, FileText, Truck, History, Target, Settings, Activity, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { useState } from 'react';
import LoginButton from './LoginButton';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/daily-production-report', label: 'Daily Entry', icon: FileText },
    { path: '/dispatch-tracking', label: 'Dispatch', icon: Truck },
    { path: '/production-history', label: 'Production History', icon: History },
    { path: '/opening-balance', label: 'Opening Balance', icon: Database },
    { path: '/production-dashboard-live', label: 'Monthly Target', icon: Target },
    { path: '/operation-workload', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath === path;
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-card/80 backdrop-blur-md border-r border-border/50 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          {sidebarOpen ? (
            <>
              <Link to="/" className="flex items-center gap-2">
                <img src="/assets/generated/shipping-container-logo.dim_120x120.png" alt="Logo" className="h-8 w-8" />
                <span className="font-bold text-lg">CPT</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md hover:bg-accent transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-md hover:bg-accent transition-colors mx-auto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {sidebarOpen && <span className="font-medium">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {sidebarOpen && userProfile && (
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userProfile.name}</p>
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="mt-1">
                  {isAdmin ? 'Admin' : 'Viewer'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/50 bg-card/80 backdrop-blur-md">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Logo */}
            <Link to="/" className="md:hidden flex items-center gap-2 font-bold text-lg">
              <img src="/assets/generated/shipping-container-logo.dim_120x120.png" alt="Logo" className="h-8 w-8" />
              <span>CPT</span>
            </Link>

            {/* Desktop Title */}
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold">Container Production Tracker</h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {userProfile && (
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="hidden sm:flex">
                  {isAdmin ? 'Admin' : 'Viewer'}
                </Badge>
              )}
              <LoginButton />
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-b border-border/50 bg-card/80 backdrop-blur-md">
            <div className="py-4 px-2 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-card/80 backdrop-blur-md mt-auto">
          <div className="px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Container Production Tracker</p>
              <p>
                Built with ❤️ using{' '}
                <a
                  href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    window.location.hostname
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
