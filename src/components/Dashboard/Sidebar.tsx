import { Home, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: 'dashboard' | 'analytics';
  onPageChange: (page: 'dashboard' | 'analytics') => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { signOut, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ] as const;

  return (
    <div className="w-64 bg-slate-900/50 backdrop-blur-md border-r border-slate-700/50 flex flex-col h-screen fixed">
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-bold text-white">Smart Habits</h1>
        <p className="text-gray-400 text-sm mt-1">Track & Improve</p>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
              currentPage === item.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="mb-3 px-2">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="text-white font-medium truncate">{user?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
