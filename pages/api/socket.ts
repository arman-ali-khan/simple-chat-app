import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiResponseServerIO } from '@/lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Setting up socket.io server...');
    
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('sendMessage', (message) => {
        console.log('Broadcasting message:', message);
        socket.broadcast.emit('newMessage', message);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log('Socket.io server already running');
  }
  
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};