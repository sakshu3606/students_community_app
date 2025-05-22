// components/poll-card/poll-card.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../login/authentication.service';
import { Poll, PollOption } from '../../pages/polling/poll.model';

@Component({
  selector: 'app-poll-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poll-card.component.html',
  styleUrls: ['./poll-card.component.css']
})
export class PollCardComponent implements OnInit {
  @Input() poll!: Poll;
  @Output() vote = new EventEmitter<{pollId: number, optionIndex: number}>();
  @Output() edit = new EventEmitter<Poll>();
  @Output() delete = new EventEmitter<number>();
  
  hasValidId = false;

  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // Check if the poll has a valid ID
    this.hasValidId = this.poll.id !== undefined && this.poll.id !== null;
  }

  get isCurrentUserPoll(): boolean {
    const currentUserId = this.authService.getCurrentUser()?.userId;
    return currentUserId !== null && currentUserId === this.poll.user?.userId;
  }

  calculatePercentage(votes: number, totalVotes: number): number {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  }

  onVote(option: PollOption): void {
    if (!this.hasValidId) return;
    
    const optionIndex = this.poll.options.findIndex(o => o.id === option.id);
    if (optionIndex !== -1) {
      this.vote.emit({pollId: this.poll.id!, optionIndex});
    }
  }

  onEdit(): void {
    this.edit.emit(this.poll);
  }

  onDelete(): void {
    if (this.hasValidId) {
      this.delete.emit(this.poll.id!);
    }
  }
}