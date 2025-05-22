import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PollingService } from './polling.service';
import { finalize } from 'rxjs/operators';
import { AuthService } from './Authentication';

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  id?: number;
  user?: {
    userId: number;
    username: string;
  };
  question: string;
  option1: string;
  option2: string;
  option1Votes: number;
  option2Votes: number;
  createdAt?: Date;
}

@Component({
  selector: 'app-polling',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './polling.component.html',
  styleUrls: ['./polling.component.css']
})
export class PollingComponent implements OnInit {
  polls: Poll[] = [];
  myPolls: Poll[] = [];
  currentView: 'all' | 'my' = 'all';
  showCreatePollForm: boolean = false;
  editingPoll: Poll | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  formPoll: {
    id?: number;
    question: string;
    options: PollOption[];
  } = {
    question: '',
    options: [
      { text: '', votes: 0 },
      { text: '', votes: 0 }
    ]
  };

  constructor(
    private pollingService: PollingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPolls();
  }

  loadPolls(): void {
    this.isLoading = true;
    
    // Load all polls
    this.pollingService.getAllPolls()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.polls = data;
          this.filterMyPolls();
        },
        error: (err) => {
          console.error('Error loading polls:', err);
          this.error = 'Failed to load polls. Please try again later.';
        }
      });
  }

  filterMyPolls(): void {
    const currentUserId = this.getCurrentUserId();
    if (currentUserId) {
      this.myPolls = this.polls.filter(poll => poll.user?.userId === currentUserId);
    } else {
      this.myPolls = [];
    }
  }

  toggleView(view: 'all' | 'my'): void {
    this.currentView = view;
  }

  toggleCreatePollForm(): void {
    this.showCreatePollForm = !this.showCreatePollForm;
    if (this.showCreatePollForm && this.editingPoll === null) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.formPoll = {
      question: '',
      options: [
        { text: '', votes: 0 },
        { text: '', votes: 0 }
      ]
    };
    this.editingPoll = null;
  }

  createPoll(): void {
    if (!this.validateForm()) {
      return;
    }

    const newPoll: Poll = {
      question: this.formPoll.question,
      option1: this.formPoll.options[0].text,
      option2: this.formPoll.options[1].text,
      option1Votes: 0,
      option2Votes: 0,
      user: {
        userId: this.getCurrentUserId() || 0,
        username: this.getCurrentUsername() || 'Anonymous'
      }
    };

    this.isLoading = true;
    this.pollingService.createPoll(newPoll)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (created) => {
          this.polls.unshift(created);
          this.filterMyPolls();
          this.showCreatePollForm = false;
          this.resetForm();
        },
        error: (err) => {
          console.error('Error creating poll:', err);
          this.error = 'Failed to create poll. Please try again.';
        }
      });
  }

  editPoll(poll: Poll): void {
    this.editingPoll = { ...poll };
    this.formPoll = {
      id: poll.id,
      question: poll.question,
      options: [
        { text: poll.option1, votes: poll.option1Votes },
        { text: poll.option2, votes: poll.option2Votes }
      ]
    };
    this.showCreatePollForm = true;
  }

  updatePoll(): void {
    if (!this.validateForm() || !this.editingPoll || !this.editingPoll.id) {
      return;
    }

    const pollId = this.editingPoll.id;
    
    const updatedPoll: Poll = {
      id: pollId,
      question: this.formPoll.question,
      option1: this.formPoll.options[0].text,
      option2: this.formPoll.options[1].text,
      option1Votes: this.editingPoll.option1Votes,
      option2Votes: this.editingPoll.option2Votes,
      user: this.editingPoll.user
    };

    this.isLoading = true;
    this.pollingService.updatePoll(pollId, updatedPoll)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (updated) => {
          const index = this.polls.findIndex(p => p.id === updated.id);
          if (index !== -1) {
            this.polls[index] = updated;
          }
          this.filterMyPolls();
          this.showCreatePollForm = false;
          this.editingPoll = null;
          this.resetForm();
        },
        error: (err) => {
          console.error('Error updating poll:', err);
          this.error = 'Failed to update poll. Please try again.';
        }
      });
  }

  deletePoll(pollId: number): void {
    if (confirm('Are you sure you want to delete this poll?')) {
      this.isLoading = true;
      this.pollingService.deletePoll(pollId)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.polls = this.polls.filter(p => p.id !== pollId);
            this.filterMyPolls();
          },
          error: (err) => {
            console.error('Error deleting poll:', err);
            this.error = 'Failed to delete poll. Please try again.';
          }
        });
    }
  }

  voteForOption1(pollId: number): void {
    this.vote(pollId, 0);
  }

  voteForOption2(pollId: number): void {
    this.vote(pollId, 1);
  }

  vote(pollId: number, optionIndex: number): void {
    this.pollingService.voteForOption(pollId, optionIndex)
      .subscribe({
        next: (updatedPoll) => {
          const index = this.polls.findIndex(p => p.id === updatedPoll.id);
          if (index !== -1) {
            this.polls[index] = updatedPoll;
          }
          this.filterMyPolls();
        },
        error: (err) => {
          console.error('Error voting for poll:', err);
          this.error = 'Failed to register your vote. Please try again.';
        }
      });
  }

  validateForm(): boolean {
    if (!this.formPoll.question.trim()) {
      this.error = 'Please enter a question.';
      return false;
    }
    
    if (!this.formPoll.options[0].text.trim()) {
      this.error = 'Please enter text for option 1.';
      return false;
    }
    
    if (!this.formPoll.options[1].text.trim()) {
      this.error = 'Please enter text for option 2.';
      return false;
    }
    
    this.error = null;
    return true;
  }

  getCurrentUserId(): number | null {
    return this.authService.getCurrentUser()?.userId || null;
  }

  getCurrentUsername(): string | null {
    return this.authService.getCurrentUser()?.username || null;
  }

  getOption1(poll: Poll): string {
    return poll.option1;
  }

  getOption2(poll: Poll): string {
    return poll.option2;
  }

  getOption1Votes(poll: Poll): number {
    return poll.option1Votes;
  }

  getOption2Votes(poll: Poll): number {
    return poll.option2Votes;
  }

  getTotalVotes(poll: Poll): number {
    return poll.option1Votes + poll.option2Votes;
  }

  calculatePercentage(votes: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((votes / total) * 100)}%`;
  }

  clearError(): void {
    this.error = null;
  }
}