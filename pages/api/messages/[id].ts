import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Message } from '@/types/message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Message ID is required' });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid message ID' });
  }

  const db = await getDatabase();
  const messagesCollection = db.collection<Message>('messages');

  if (req.method === 'PUT') {
    try {
      const { messageText } = req.body;

      if (!messageText || typeof messageText !== 'string') {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const result = await messagesCollection.updateOne(
        { _id: new ObjectId(id) as unknown as string },
        { 
          $set: { 
            messageText: messageText.trim(),
            updatedAt: new Date()
          } 
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }

      const updatedMessage = await messagesCollection.findOne({ _id: new ObjectId(id) as unknown as string });
      res.status(200).json(updatedMessage);
    } catch (error) {
      console.error('Error updating message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await messagesCollection.deleteOne({ _id: new ObjectId(id) as unknown as string });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }

      res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}