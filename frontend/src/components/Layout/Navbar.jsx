// FILE: src/components/layout/Navbar.jsx

import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, Search, Sparkles } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/query', label: 'Query', icon: Search },
  ];
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                AI Chat Portal
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
