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
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { ChatMessage } from '@/types/message';

let socket: Socket;

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      // Only add messages from other users, not our own
      const storedUsername = localStorage.getItem('username');
      if (message.senderUsername !== storedUsername) {
        setMessages(prev => [...prev, message]);
      }
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
        const messageToEmit = {
          ...savedMessage,
          id: savedMessage._id,
        };
        
        // Add message to local state immediately for the sender
        setMessages(prev => [...prev, messageToEmit]);
        
        // Emit to other users only (sender won't receive it back)
        if (socket && socket.connected) {
          socket.emit('sendMessage', messageToEmit);
        }
        
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <Card className="flex-1 backdrop-blur-sm bg-white/80 border-0 shadow-xl flex flex-col">
          <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    ChatFlow
                  </CardTitle>
                  <p className="text-blue-100 text-sm">Welcome, {username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderUsername === username}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4 bg-white/50">
              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="resize-none min-h-[44px] rounded-full"
                    disabled={!isConnected}
                  />
                </div>
                <ImageUpload onImageUpload={handleImageUpload} disabled={!isConnected} />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="rounded-full w-11 h-11 p-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}