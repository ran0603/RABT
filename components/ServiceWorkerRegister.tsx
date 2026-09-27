'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('RABT ServiceWorker registered successfully with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('RABT ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
