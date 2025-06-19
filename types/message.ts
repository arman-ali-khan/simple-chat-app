export interface User {
  _id?: string;
  username: string;
  phoneNumber?: string;
  createdAt: Date;
}

export interface Message {
  _id?: string;
  senderUsername: string;
  messageText?: string;
  imageUrl?: string;
  imageData?: string;
  timestamp: Date;
  type: 'text' | 'image';
}

export interface ChatMessage extends Message {
  id: string;
}