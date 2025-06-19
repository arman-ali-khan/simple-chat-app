import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { Message } from '@/types/message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await getDatabase();
  const messagesCollection = db.collection<Message>('messages');

  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const messages = await messagesCollection
        .find({})
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await messagesCollection.countDocuments();

      res.status(200).json({
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { senderUsername, messageText, imageData, imageUrl, type } = req.body;

      if (!senderUsername) {
        return res.status(400).json({ error: 'Sender username is required' });
      }

      if (!messageText && !imageData && !imageUrl) {
        return res.status(400).json({ error: 'Message text or image is required' });
      }

      const newMessage: Omit<Message, '_id'> = {
        senderUsername,
        messageText: messageText || '',
        imageData: imageData || undefined,
        imageUrl: imageUrl || undefined,
        timestamp: new Date(),
        type: type || (imageData || imageUrl ? 'image' : 'text'),
      };

      const result = await messagesCollection.insertOne(newMessage);
      const message = await messagesCollection.findOne({ _id: result.insertedId });

      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}