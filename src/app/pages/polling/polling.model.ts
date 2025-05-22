// pages/polling/poll.model.ts
export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  id?: number;  // Made optional with ? since new polls won't have an ID yet
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdBy: string;
  user?: {
    userId: number;
    [key: string]: any;  // Allow for other user properties
  };
}