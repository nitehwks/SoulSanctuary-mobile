import { memo, useState, useEffect, useCallback } from 'react';
import { Menu, Bell, Cross, X } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { useSanctuary } from '../../context/SanctuaryContext';
import { useLayout } from './LayoutContext';
import { useApi } from '../../utils/api';
import { markNotificationAsRead } from '../../services/notifications';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const NavBar = memo(function NavBar() {
  const { crisisMode } = useSanctuary();
  const { toggleSidebar } = useLayout();
  const api = useApi();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'crisis': return 'border-red-500/50 bg-red-500/10';
      case 'goal': return 'border-sanctuary-gold/50 bg-sanctuary-gold/10';
      case 'mood': return 'border-blue-400/50 bg-blue-400/10';
      default: return 'border-white/20 bg-white/5';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-3 safe-header">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 rounded-lg lg:hidden text-sanctuary-cream"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sanctuary-gold/20 rounded-lg border border-sanctuary-gold/30">
              <Cross className={`w-6 h-6 ${crisisMode ? 'text-red-500 animate-pulse' : 'text-sanctuary-gold'}`} />
            </div>
            <span className="text-xl font-bold text-sanctuary-cream text-shadow">SoulSanctuary</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors text-sanctuary-cream"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-sanctuary-gold text-sanctuary-dark text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                />
                
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50">
                  <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/10 p-3 flex items-center justify-between">
                    <h3 className="font-semibold text-sanctuary-cream">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-sanctuary-gold hover:text-sanctuary-amber"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/10 rounded text-sanctuary-cream/50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="p-4 text-center text-sanctuary-cream/50">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sanctuary-cream/50">No notifications yet</div>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleMarkAsRead(notification.id)}
                          className={`p-3 cursor-pointer hover:bg-white/5 transition-colors ${!notification.read ? 'bg-white/5' : ''}`}
                        >
                          <div className={`border-l-2 pl-3 ${getNotificationStyle(notification.type)}`}>
                            <p className="font-medium text-sanctuary-cream text-sm">{notification.title}</p>
                            <p className="text-sanctuary-cream/70 text-xs mt-1">{notification.body}</p>
                            <p className="text-sanctuary-cream/40 text-xs mt-1">{formatTime(notification.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 ring-2 ring-sanctuary-gold/50'
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
});
