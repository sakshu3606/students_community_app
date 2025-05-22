// models/user.model.ts
export interface User {
    id: string;
    name: string;
    username: string;
    avatar: string;
    department?: string;
    isFriend?: boolean;
    isOnline?: boolean;
  }
  
  export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
    read: boolean;
  }