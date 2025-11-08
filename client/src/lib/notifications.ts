export class NotificationService {
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  static async requestPermission(): Promise<boolean> {
    // Check if Notification API is supported
    if (!('Notification' in window)) {
      console.warn('❌ Notifications not supported on this device');
      return false;
    }

    // iOS Safari doesn't support Notifications API properly
    const isIOSSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.navigator.standalone;
    if (isIOSSafari) {
      console.warn('❌ iOS Safari does not support Web Push Notifications. Use as PWA (Add to Home Screen) for notifications.');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('❌ Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log(`🔔 Notification permission: ${permission}`);
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  static hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  static async showNotification(title: string, options?: NotificationOptions) {
    if (!this.hasPermission()) {
      console.warn('Notification permission not granted');
      return;
    }

    // Try to use service worker notification first
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: '/icon-192.png',
          badge: '/icon-72.png',
          vibrate: [200, 100, 200],
          ...options,
        } as any); // Cast to any because vibrate is supported but not in type definition
        return;
      } catch (error) {
        console.warn('Service worker notification failed, falling back to browser notification', error);
      }
    }

    // Fallback to browser notification
    const notificationOptions = { ...options };
    delete (notificationOptions as any).vibrate; // Remove vibrate for browser notifications
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      ...notificationOptions,
    });
  }

  static async showTransactionNotification(type: 'sent' | 'received', amount: number, token: string = 'SOL') {
    console.log(`🔔 Attempting to show ${type} notification: ${amount} ${token}`);
    
    const title = type === 'sent' ? '💸 Transaction Sent' : '💰 Transaction Received';
    const body = type === 'sent' 
      ? `You sent ${amount} ${token}`
      : `You received ${amount} ${token}`;

    await this.showNotification(title, {
      body,
      tag: 'transaction',
      requireInteraction: false,
    });
    
    console.log(`✅ Notification ${type} displayed successfully`);
  }
}

export default NotificationService;
