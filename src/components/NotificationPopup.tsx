import { useEffect, useState } from 'react';
import { Notification } from '@/src/types';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface NotificationPopupProps {
  notifications: Notification[];
  onViewAll?: () => void;
  onDismiss?: (id: string) => void;
}

export function NotificationPopup({ notifications, onViewAll, onDismiss }: NotificationPopupProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const maxVisible = 3; // Show max 3 notifications

  useEffect(() => {
    // Show only unread notifications, limited to maxVisible
    const unread = notifications.filter(n => !n.read).slice(0, maxVisible);
    setVisibleNotifications(unread);
  }, [notifications]);

  const getIcon = (type: 'positive' | 'warning' | 'neutral') => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-secondary" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-error" />;
      case 'neutral':
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const handleDismiss = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    onDismiss?.(id);
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-28 right-6 z-40 space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 400, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto"
          >
            <div className="bg-surface-container/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl max-w-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-relaxed break-words">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {notifications.filter(n => !n.read).length > maxVisible && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onViewAll}
          className="pointer-events-auto text-white/60 hover:text-white text-xs font-medium mx-auto block transition-colors"
        >
          See all {notifications.filter(n => !n.read).length} notifications
        </motion.button>
      )}
    </div>
  );
}
