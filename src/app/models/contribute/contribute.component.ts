// contribute.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContributionService } from '../../services/contribution/contribution.services';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contribute',
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [ContributionService],
  standalone: true,
  templateUrl: './contribute.component.html',
  styleUrls: ['./contribute.component.css']
})
export class ContributeComponent implements OnInit {
  contributionForm!: FormGroup;
  submitted = false;
  success = false;
  formError = false;
  errorMessage = '';
  activeTab = 'form';
  
  resourceTypes = [
    { id: 'book', name: 'Book' },
    { id: 'video', name: 'Video' },
    { id: 'link', name: 'Useful Link' },
    { id: 'software', name: 'Software/License' },
    { id: 'notes', name: 'Lecture Notes' },
    { id: 'paper', name: 'Research Paper' },
    { id: 'tool', name: 'Learning Tool' }
  ];
  
  recentContributions = [
    {
      name: 'Jane Doe',
      resourceType: 'book',
      title: 'Advanced Machine Learning Concepts',
      description: 'A comprehensive guide covering the latest ML algorithms and applications.',
      date: '2025-04-10'
    },
    {
      name: 'John Smith',
      resourceType: 'video',
      title: 'Introduction to Quantum Computing',
      description: 'A beginner-friendly lecture series explaining quantum computing principles.',
      date: '2025-04-08'
    },
    {
      name: 'Maria Garcia',
      resourceType: 'link',
      title: 'Free Academic Resources Database',
      description: 'Collection of open-access learning materials for STEM subjects.',
      date: '2025-04-05'
    }
  ];
  
  topContributors = [
    { name: 'Jane Doe', contributions: 32, rank: 1 },
    { name: 'Alex Wong', contributions: 28, rank: 2 },
    { name: 'Maria Garcia', contributions: 25, rank: 3 },
    { name: 'Thomas Lee', contributions: 21, rank: 4 },
    { name: 'Olivia Brown', contributions: 19, rank: 5 }
  ];

  constructor(
    private fb: FormBuilder,
    private contributionService: ContributionService
  ) {}
  
  ngOnInit(): void {
    this.initializeForm();
    // Force tab rendering on initial load
    setTimeout(() => {
      this.setActiveTab(this.activeTab);
    }, 0);
  }
  
  private initializeForm(): void {
    this.contributionForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      resourceType: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      link: ['', [Validators.required, Validators.pattern('^https?://.*')]],
      additionalInfo: ['']
    });
  }
  
  setActiveTab(tab: string): void {
    console.log('Setting active tab to:', tab);
    this.activeTab = tab;
    if (tab === 'form') {
      this.success = false;
      this.submitted = false;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.formError = false;
    this.errorMessage = '';
    
    console.log('Form submitted, validation status:', this.contributionForm.valid);
    console.log('Form values:', this.contributionForm.value);
    
    if (this.contributionForm.invalid) {
      // Scroll to first error
      setTimeout(() => {
        const firstInvalidElement = document.querySelector('.invalid');
        if (firstInvalidElement) {
          firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    try {
      this.contributionService.submitContribution(this.contributionForm.value)
        .subscribe({
          next: (response) => {
            console.log('Submission successful:', response);
            this.success = true;
            
            // Add the new contribution to recent contributions
            const formValues = this.contributionForm.value;
            const newContribution = {
              name: formValues.name,
              resourceType: formValues.resourceType,
              title: formValues.title,
              description: formValues.description,
              date: new Date().toISOString().split('T')[0]
            };
            
            // Reset form and status
            this.contributionForm.reset();
            this.submitted = false;
            
            // Auto-switch to recent tab after delay
            setTimeout(() => {
              // Add new contribution to the beginning of the list
              this.recentContributions.unshift(newContribution);
              this.setActiveTab('recent');
              this.success = false;
            }, 2000);
          },
          error: (error) => {
            console.error('Submission error:', error);
            this.formError = true;
            this.errorMessage = error.message || 'Failed to submit contribution. Please try again.';
          }
        });
    } catch (err) {
      console.error('Exception during form submission:', err);
      this.formError = true;
      this.errorMessage = 'An unexpected error occurred. Please try again.';
    }
  }
  
  getResourceTypeName(id: string): string {
    const resourceType = this.resourceTypes.find(type => type.id === id);
    return resourceType ? resourceType.name : 'Unknown';
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}