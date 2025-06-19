import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatMessage } from '@/types/message';
import { User } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return format(date, 'HH:mm');
  };

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={`text-xs ${isOwnMessage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
          {message.senderUsername.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-2 ${
          isOwnMessage 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
            : 'bg-white shadow-sm border'
        }`}>
          {!isOwnMessage && (
            <p className="text-xs font-medium text-gray-600 mb-1">{message.senderUsername}</p>
          )}
          
          {message.type === 'image' && (message.imageData || message.imageUrl) ? (
            <div className="space-y-2">
              <img
                src={message.imageData || message.imageUrl}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto"
                style={{ maxHeight: '300px' }}
              />
              {message.messageText && (
                <p className="text-sm">{message.messageText}</p>
              )}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.messageText}</p>
          )}
        </div>
        
        <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}