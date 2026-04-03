import { useEffect, useState } from 'react';

interface MobileViewWrapperProps {
  children: React.ReactNode;
}

export function MobileViewWrapper({ children }: MobileViewWrapperProps) {
  const [isMobileSize, setIsMobileSize] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileSize(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobileSize) {
    // On mobile devices, render full screen
    return <>{children}</>;
  }

  // On desktop, show mobile UI centered with fixed width
  return (
    <div className="fixed inset-0 bg-background/40 backdrop-blur-md flex items-center justify-center overflow-hidden z-0">
      {/* Dimmed background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-secondary/3 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-tertiary/3 rounded-full blur-[150px]"></div>
      </div>

      {/* Mobile phone frame */}
      <div
        className="relative w-[375px] h-screen max-h-screen bg-background rounded-2xl shadow-2xl border border-surface-container/30 flex flex-col overflow-hidden z-10 flex-shrink-0"
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Phone notch simulation */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-background rounded-b-3xl z-20 border-x border-b border-surface-container/30"></div>

        {/* App content - scrollable with proper width constraint */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
