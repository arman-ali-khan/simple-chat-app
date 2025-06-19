'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '@/components/message-bubble';
import { ImageUpload } from '@/components/image-upload';
import { Send, MessageCircle, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { ChatMessage } from '@/types/message';

let socket: Socket;

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Monitor online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      router.push('/');
      return;
    }
    setUsername(storedUsername);

    // Initialize socket connection
    socketInitializer();

    // Load chat history
    loadChatHistory();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const socketInitializer = async () => {
    // Initialize the socket server
    await fetch('/api/socket');
    
    // Connect to socket with correct path
    socket = io({
      path: '/api/socketio',
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      setIsLoading(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setIsLoading(false);
    });

    socket.on('newMessage', (message: ChatMessage) => {
      console.log('Received new message:', message);
      // Add message to state
      setMessages(prev => [...prev, message]);
    });

    socket.on('messageUpdated', (updatedMessage: ChatMessage) => {
      console.log('Message updated:', updatedMessage);
      setMessages(prev => prev.map(msg => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      ));
    });

    socket.on('messageDeleted', (messageId: string) => {
      console.log('Message deleted:', messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        const messagesWithId = data.messages.map((msg: any) => ({
          ...msg,
          id: msg._id,
        }));
        setMessages(messagesWithId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageData: { text?: string; imageData?: string; imageUrl?: string }) => {
    if (!username || (!messageData.text?.trim() && !messageData.imageData)) return;

    const message = {
      senderUsername: username,
      messageText: messageData.text || '',
      imageData: messageData.imageData,
      imageUrl: messageData.imageUrl,
      timestamp: new Date(),
      type: messageData.imageData ? 'image' as const : 'text' as const,
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        const messageToAdd = {
          ...savedMessage,
          id: savedMessage._id,
        };
        
        // Add message to local state immediately for the sender
        setMessages(prev => [...prev, messageToAdd]);
        
        // Emit to other users via socket (they will receive it via 'newMessage' event)
        if (socket && socket.connected) {
          socket.emit('sendMessage', messageToAdd);
        }
        
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const editMessage = async (messageId: string, newText: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageText: newText }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        const messageToUpdate = {
          ...updatedMessage,
          id: updatedMessage._id,
        };
        
        // Update message in local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? messageToUpdate : msg
        ));
        
        // Emit to other users via socket
        if (socket && socket.connected) {
          socket.emit('messageUpdated', messageToUpdate);
        }
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove message from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        // Emit to other users via socket
        if (socket && socket.connected) {
          socket.emit('messageDeleted', messageId);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage({ text: newMessage.trim() });
    }
  };

  const handleImageUpload = (imageData: string, imageUrl: string) => {
    sendMessage({ imageData, imageUrl });
  };

  const handleBack = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('phoneNumber');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg z-10">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-white hover:bg-white/20 p-1 sm:p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  ChatFlow
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm">Welcome, {username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Internet Status */}
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-300" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-300" />
                )}
                <span className="text-xs hidden sm:inline">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {/* Socket Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected && isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs sm:text-sm">
                  {isConnected && isOnline ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <ScrollArea className="flex-1 p-2 sm:p-4">
            <div className="space-y-3 sm:space-y-4 pb-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderUsername === username}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Fixed Bottom Input */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-t shadow-lg z-10">
        <div className="max-w-4xl mx-auto p-2 sm:p-4 safe-area-inset-bottom">
          <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3 relative">
            <div className="flex-1 min-w-0">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isOnline ? "Type your message..." : "You're offline..."}
                className="resize-none min-h-[44px] rounded-full text-sm sm:text-base px-3 sm:px-4"
                disabled={!isConnected || !isOnline}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
              />
            </div>
            <div className="flex-shrink-0">
              <ImageUpload onImageUpload={handleImageUpload} disabled={!isConnected || !isOnline} />
            </div>
            <div className="flex-shrink-0">
              <Button
                type="submit"
                disabled={!newMessage.trim() || !isConnected || !isOnline}
                className="rounded-full w-11 h-11 p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 touch-manipulation"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}