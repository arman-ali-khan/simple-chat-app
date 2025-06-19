import { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/types/message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { username, phoneNumber } = req.body;

      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
      }

      const db = await getDatabase();
      const usersCollection = db.collection<User>('users');

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ username: username.trim() });
      
      if (existingUser) {
        return res.status(200).json({ message: 'User already exists', user: existingUser });
      }

      // Create new user
      const newUser: Omit<User, '_id'> = {
        username: username.trim(),
        phoneNumber: phoneNumber?.trim() || undefined,
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      const user = await usersCollection.findOne({ _id: result.insertedId });

      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}