import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Check, X, Gift, AlertCircle, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reward' | 'trade' | 'security' | 'general';
  isRead: boolean;
  timestamp: string;
  actionUrl?: string;
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Reward Claimed!',
    message: 'You earned 25 USV tokens for scanning QR code at Cloud Nine Vapes',
    type: 'reward',
    isRead: false,
    timestamp: '2024-08-26T14:30:00Z',
    actionUrl: '/wallet'
  },
  {
    id: '2',
    title: 'Trade Completed',
    message: 'Your buy order for 100 USV tokens at $0.20 has been filled',
    type: 'trade',
    isRead: false,
    timestamp: '2024-08-26T13:15:00Z',
    actionUrl: '/trading'
  },
  {
    id: '3',
    title: 'Security Alert',
    message: 'New device login detected. If this wasn\'t you, please secure your account',
    type: 'security',
    isRead: true,
    timestamp: '2024-08-26T10:45:00Z',
    actionUrl: '/settings'
  },
  {
    id: '4',
    title: 'Weekly Summary',
    message: 'You earned 150 USV tokens this week! Keep up the great work!',
    type: 'general',
    isRead: true,
    timestamp: '2024-08-25T09:00:00Z',
    actionUrl: '/analytics'
  },
  {
    id: '5',
    title: 'New Store Partnership',
    message: 'Vape Paradise is now a USV partner! Double rewards available.',
    type: 'general',
    isRead: false,
    timestamp: '2024-08-24T16:20:00Z',
    actionUrl: '/stores'
  }
];

export default function NotificationCenter() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const { toast } = useToast();

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notification Deleted",
      description: "The notification has been removed",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    toast({
      title: "All Notifications Read",
      description: "Marked all notifications as read",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reward': return <Gift className="w-5 h-5 text-green-400" />;
      case 'trade': return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'security': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Bell className="w-5 h-5 text-purple-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reward': return 'bg-green-600';
      case 'trade': return 'bg-blue-600';
      case 'security': return 'bg-red-600';
      default: return 'bg-purple-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-4 flex items-center justify-between"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/')}
        />
        <div className="flex items-center space-x-2">
          <h1 className="text-white text-xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-600 text-white">{unreadCount}</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={markAllAsRead}
          className="text-purple-400 hover:text-white"
          data-testid="button-mark-all-read"
        >
          Mark all read
        </Button>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 space-y-4"
      >
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-800/50 backdrop-blur rounded-3xl p-4 border border-gray-700/30 ${
                !notification.isRead ? 'ring-2 ring-purple-500/30' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold text-sm">{notification.title}</h3>
                      <Badge className={`${getTypeColor(notification.type)} text-white text-xs`}>
                        {notification.type}
                      </Badge>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                        className="w-6 h-6 text-gray-400 hover:text-white"
                        data-testid={`button-mark-read-${notification.id}`}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        className="w-6 h-6 text-gray-400 hover:text-red-400"
                        data-testid={`button-delete-${notification.id}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                  <p className="text-gray-500 text-xs">{formatTimestamp(notification.timestamp)}</p>
                  
                  {notification.actionUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(notification.actionUrl!)}
                      className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl h-8"
                      data-testid={`button-action-${notification.id}`}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}