'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageNotificationProps {
  message: string;
  type: 'update' | 'success';
  show: boolean;
  onHide: () => void;
}

export function MessageNotification({ message, type, show, onHide }: MessageNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className={cn(
      'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg transition-all duration-300',
      type === 'update' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white',
      show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    )}>
      {type === 'update' ? (
        <Edit3 className="w-4 h-4" />
      ) : (
        <CheckCircle className="w-4 h-4" />
      )}
      <span>{message}</span>
    </div>
  );
}