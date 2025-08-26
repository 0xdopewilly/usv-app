export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  return new Promise((resolve) => {
    if ('Notification' in window) {
      Notification.requestPermission().then(resolve);
    } else {
      resolve('denied');
    }
  });
}

export function showNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    });
  }
}

export function installApp() {
  // Handle PWA installation
  const deferredPrompt = (window as any).deferredPrompt;
  
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      (window as any).deferredPrompt = null;
    });
  }
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
});

// Handle app installed event
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  showNotification('USV Token App Installed', {
    body: 'Welcome to the USV Token ecosystem!',
  });
});

// Check if app is running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

// Detect if device supports installation
export function canInstall(): boolean {
  return !!(window as any).deferredPrompt;
}

// Handle online/offline status
export function setupOfflineHandling() {
  window.addEventListener('online', () => {
    showNotification('Connection Restored', {
      body: 'You are back online!',
    });
  });

  window.addEventListener('offline', () => {
    showNotification('No Internet Connection', {
      body: 'Some features may not be available.',
    });
  });
}

// Initialize PWA features
export function initPWA() {
  setupOfflineHandling();
  requestNotificationPermission();
}
