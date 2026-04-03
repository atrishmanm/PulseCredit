import { Home, Activity, Scan, Lock, User, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Screen } from '@/src/types';

interface BottomNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export function BottomNav({ activeScreen, onScreenChange }: BottomNavProps) {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'lifetime', icon: Zap, label: 'Lifetime' },
    { id: 'engine', icon: Activity, label: 'Engine' },
    { id: 'scanner', icon: Scan, label: 'Scanner' },
    { id: 'vault', icon: Lock, label: 'Vault' },
    { id: 'profile', icon: User, label: 'Profile' },
  ] as const;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center items-center gap-2 h-20 px-6 bg-surface-container/60 backdrop-blur-xl rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/5">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onScreenChange(item.id)}
          className={cn(
            "flex flex-col items-center justify-center transition-all active:scale-90 duration-300 px-3",
            activeScreen === item.id
              ? "text-secondary drop-shadow-[0_0_8px_rgba(76,224,130,0.4)]"
              : "text-white/40 hover:text-white"
          )}
        >
          <item.icon className={cn("w-6 h-6 mb-1", activeScreen === item.id && "fill-current")} />
          <span className="font-sans text-[10px] font-medium tracking-wide">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
