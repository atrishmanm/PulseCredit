import { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn("glass-card rounded-xl border border-white/5 overflow-hidden", className)}>
      {children}
    </div>
  );
}
