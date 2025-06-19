'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InternetStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      // Show status indicator when connection changes
      setShowStatus(true);
      
      // Hide status indicator after 3 seconds if online
      if (online) {
        setTimeout(() => setShowStatus(false), 3000);
      }
    };

    // Set initial status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Always show when offline, or show temporarily when status changes
  if (!isOnline || showStatus) {
    return (
      <div
        className={cn(
          'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg transition-all duration-300',
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>No internet connection</span>
          </>
        )}
      </div>
    );
  }

  return null;
}