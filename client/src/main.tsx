// DEVELOPMENT: Unregister service workers that may be interfering
if (import.meta.env.DEV) {
  navigator.serviceWorker?.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('🔧 Unregistering service worker in development');
      registration.unregister();
    });
  });
  
  // Clear caches in development
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        console.log('🔧 Clearing cache in development:', cacheName);
        caches.delete(cacheName);
      });
    });
  }
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);