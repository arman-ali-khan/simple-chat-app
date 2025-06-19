'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MessageCircle, Users } from 'lucide-react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
        }),
      });

      if (response.ok) {
        localStorage.setItem('username', username.trim());
        if (phoneNumber.trim()) {
          localStorage.setItem('phoneNumber', phoneNumber.trim());
        }
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ChatFlow</h1>
          <p className="text-gray-600">Connect and chat in real-time</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Join the Conversation
            </CardTitle>
            <CardDescription>
              Enter your details to start messaging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200"
                disabled={isLoading || !username.trim()}
              >
                {isLoading ? 'Joining...' : 'Start Chatting'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            No registration required. Just enter your username and start chatting!
          </p>
        </div>
      </div>
    </div>
  );
}