export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
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
    const title = type === 'sent' ? '💸 Transaction Sent' : '💰 Transaction Received';
    const body = type === 'sent' 
      ? `You sent ${amount} ${token}`
      : `You received ${amount} ${token}`;

    await this.showNotification(title, {
      body,
      tag: 'transaction',
      requireInteraction: false,
    });
  }
}

export default NotificationService;
