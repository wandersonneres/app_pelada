import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  Users, 
  Menu as MenuIcon, 
  User, 
  LogOut,
  ChevronLeft,
  DollarSign
} from 'lucide-react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  
  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Início', path: '/' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Nova Pelada', path: '/new-game' },
    ...(user?.role === 'admin' ? [
      { icon: <Users className="w-5 h-5" />, label: 'Jogadores', path: '/players' },
      ...(user?.username === 'cayto' ? [
        { icon: <DollarSign className="w-5 h-5" />, label: 'Financeiro', path: '/financeiro' }
      ] : [])
    ] : [])
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
          {user?.role === 'admin' && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
          )}
          </div>

        {user && (
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                </button>

                {isAvatarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-200 py-1"
                  >
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsAvatarOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsAvatarOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
        )}
        </div>
      </div>

      {/* Menu Lateral */}
      {isMenuOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
} 