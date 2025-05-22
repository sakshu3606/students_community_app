// components/poll-form/poll-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Poll } from '../../pages/polling/polling.model';

@Component({
  selector: 'app-poll-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poll-form.component.html',
  styleUrls: ['./poll-form.component.css']
})
export class PollFormComponent implements OnInit {
  @Input() isUpdateMode = false;
  @Input() poll: Poll | null = null;
  
  @Output() submitPoll = new EventEmitter<any>();
  @Output() cancelForm = new EventEmitter<void>();
  
  formData = {
    id: 0,
    question: '',
    options: [
      { text: '' },
      { text: '' }
    ],
    totalVotes: 0,
    createdBy: ''
  };

  ngOnInit(): void {
    if (this.isUpdateMode && this.poll) {
      this.formData = {
        id: this.poll.id,
        question: this.poll.question,
        options: this.poll.options.map(option => ({ text: option.text })),
        totalVotes: this.poll.totalVotes,
        createdBy: this.poll.createdBy
      };
    }
  }

  addOption(): void {
    this.formData.options.push({ text: '' });
  }

  removeOption(index: number): void {
    if (this.formData.options.length > 2) {
      this.formData.options.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.validatePoll()) {
      this.submitPoll.emit(this.formData);
    }
  }

  onCancel(): void {
    this.cancelForm.emit();
  }

  validatePoll(): boolean {
    if (!this.formData.question || this.formData.question.trim() === '') {
      alert('Please enter a question');
      return false;
    }
    
    for (const option of this.formData.options) {
      if (!option.text || option.text.trim() === '') {
        alert('All options must have text');
        return false;
      }
    }
    
    return true;
  }
}