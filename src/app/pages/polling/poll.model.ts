export interface User {
  userId: number;
  username?: string;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  id?: number;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdBy: string;
  user?: User;
}