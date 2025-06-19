import { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/types/message';
import { Edit2, Trash2, Check, X, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  onEdit: (messageId: string, newText: string) => void;
  onDelete: (messageId: string) => void;
}

export function MessageBubble({ message, isOwnMessage, onEdit, onDelete }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.messageText || '');

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return format(date, 'HH:mm');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(message.messageText || '');
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.messageText) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message.messageText || '');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message.id);
    }
  };

  return (
    <div className={`flex gap-3 group ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={`text-xs ${isOwnMessage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
          {message.senderUsername.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`relative rounded-2xl px-4 py-2 ${
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
                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <Button size="sm" onClick={handleSaveEdit} className="p-1">
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} className="p-1">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">{message.messageText}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={`text-sm ${isOwnMessage ? 'text-white bg-white/20 border-white/30' : ''}`}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button size="sm" onClick={handleSaveEdit} className="p-1">
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit} className="p-1">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">{message.messageText}</p>
              )}
            </div>
          )}

          {/* Action Menu - Only show for own messages */}
          {isOwnMessage && !isEditing && (
            <div className={`absolute top-2 ${isOwnMessage ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 ${isOwnMessage ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32">
                  {message.type === 'text' && (
                    <DropdownMenuItem onClick={handleEdit} className="text-sm">
                      <Edit2 className="w-3 h-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDelete} className="text-sm text-red-600">
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <p className={`text-xs text-gray-500 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </p>
          {message.messageText !== editText && message.messageText && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
}