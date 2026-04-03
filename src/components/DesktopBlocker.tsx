import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

interface DesktopBlockerProps {
  children: React.ReactNode;
}

export function DesktopBlocker({ children }: DesktopBlockerProps) {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobileView) {
    return (
      <div className="fixed inset-0 bg-background text-on-surface selection:bg-primary/30 flex items-center justify-center z-50">
        {/* Background Gradients */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-tertiary/5 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 max-w-md text-center px-6">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/20 flex items-center justify-center">
              <Smartphone className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="font-headline text-4xl font-black mb-4 text-on-surface">
            Mobile Only
          </h1>

          <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
            This app is designed for mobile devices. Please view it on a mobile device or use Developer Tools.
          </p>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-surface-container/60 backdrop-blur-xl rounded-2xl border border-surface-container/30">
              <h3 className="font-headline font-bold text-primary mb-2">Option 1: Developer Tools</h3>
              <p className="text-sm text-on-surface-variant">
                Press <span className="font-mono bg-surface-container px-2 py-1 rounded">F12</span> or <span className="font-mono bg-surface-container px-2 py-1 rounded">Ctrl+Shift+I</span>, then click the phone icon or press <span className="font-mono bg-surface-container px-2 py-1 rounded">Ctrl+Shift+M</span>
              </p>
            </div>

            <div className="p-4 bg-surface-container/60 backdrop-blur-xl rounded-2xl border border-surface-container/30">
              <h3 className="font-headline font-bold text-secondary mb-2">Option 2: Mobile Device</h3>
              <p className="text-sm text-on-surface-variant">
                Open this app on your phone or tablet
              </p>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant">
            Resize your browser or use responsive design mode to continue
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
