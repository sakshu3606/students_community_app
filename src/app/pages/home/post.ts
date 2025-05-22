interface Post {
    id: string;
    userId: string;
    content: string;
    title?: string;
    image?: string;
    imageUrl?: string;  // Added to fix template error
    timestamp: Date;
    likes: number;
    liked: boolean;
    comments: Comment[];
    showComments?: boolean; // Added to fix template error
    tags?: string[];  // Added to fix template error
    postId?: string;  // Added to fix template error
  }