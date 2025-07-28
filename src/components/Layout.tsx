
import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bike, Plus, LogOut, Menu, X } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useState } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Page container with max width and centered content */}
      <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white bg-opacity-90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
              
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="flex items-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-600 text-white">
                    <Bike className="h-6 w-6" />
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-1">
                <Link
                  to="/emergencies"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/emergencies')
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Emergencies
                </Link>
                <Link
                  to="/responders"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/responders')
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Responders
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/admin')
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/emergency/create">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">New Emergency</span>
                </Button>
              </Link>
              
              <NotificationCenter />
              
              <div className="ml-3 relative">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900"
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1 bg-white">
              <Link
                to="/emergencies"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/emergencies')
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Emergencies
              </Link>
              <Link
                to="/responders"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/responders')
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Responders
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin')
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
};

export default Layout;
