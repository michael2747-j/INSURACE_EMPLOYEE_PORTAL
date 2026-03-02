import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, AlertCircle, BarChart3, Menu } from 'lucide-react';
import { Button } from './ui/button';

interface TopNavigationProps {
  onMenuClick: () => void;
}

export function TopNavigation({ onMenuClick }: TopNavigationProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/accounts', label: 'Accounts', icon: Users },
    { path: '/policies', label: 'Policies', icon: FileText },
    { path: '/claims', label: 'Claims', icon: AlertCircle },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-30 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="md:hidden text-white hover:bg-white/20"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Tokio Marine Insurance</h1>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant="ghost"
                      className={`text-white hover:bg-white/20 transition-all ${
                        isActive ? 'bg-white/20 font-semibold' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-white/80">
              Last updated: 2 minutes ago
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}