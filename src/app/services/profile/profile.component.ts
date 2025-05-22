// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface UserPost {
  id: number;
  content: string;
  date: Date;
  likes: number;
  comments: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user = {
    username: 'defalt18',
    role: 'Student',
    bio: 'Hey there I am a new student',
    avatar: 'assets/images/avatar.jpg',
    fullName: 'Kushagra Pathak',
    location: 'Lucknow, India',
    education: 'B.Tech | ICT | 2018 Batch',
    skills: 'App Development Programming',
    postsCount: 1,
    friendsCount: 6
  };

  posts: UserPost[] = [];
  currentTab: 'posts' | 'friends' = 'posts';
  commentText = '';
  
  ngOnInit(): void {
    // Initialize with mock data
    this.posts = [
      {
        id: 1,
        content: 'This is a test post.\nI am adding a picture to this post 😊',
        date: new Date('2021-11-03'),
        likes: 5,
        comments: 3
      }
    ];
  }

  changeTab(tab: 'posts' | 'friends'): void {
    this.currentTab = tab;
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  likePost(post: UserPost): void {
    post.likes++;
  }
  
  deletePost(postId: number): void {
    this.posts = this.posts.filter(post => post.id !== postId);
  }
  
  submitComment(): void {
    if (this.commentText.trim()) {
      // In a real app, this would send the comment to a service
      console.log('Comment submitted:', this.commentText);
      this.commentText = '';
      // Increment the comment count on the first post for demo
      if (this.posts.length > 0) {
        this.posts[0].comments++;
      }
    }
  }
}