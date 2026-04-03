import { Zap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {}

export function TopBar({}: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center border border-white/10">
          <span className="font-bold text-white text-sm">{user?.email?.[0].toUpperCase() || 'U'}</span>
        </div>
        <span className="font-headline uppercase tracking-widest text-xs font-bold text-primary">ViteCredit</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => logout()}
          className="text-primary hover:bg-surface-container px-3 py-2 rounded-lg transition-colors active:scale-95 duration-200 flex items-center gap-2"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-bold">Logout</span>
        </button>
      </div>
    </header>
  );
}
