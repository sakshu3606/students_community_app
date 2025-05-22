import { Component, EventEmitter, Output, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CreatePostRequest, PostCategory, PostService, PostVisibility, Post } from './postService';
import { FileUploadService, UploadEvent } from './fileUpload';

@Component({
  selector: 'app-post-creation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './post-creation.component.html',
  styleUrls: ['./post-creation.component.css']
})
export class PostCreationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() closeModal = new EventEmitter<void>();
  @Output() postCreated = new EventEmitter<Post>();
  @ViewChild('modalContainer') modalContainer!: ElementRef;

  post: CreatePostRequest = {
    title: '',
    content: '',
    tags: [],
    visibility: 'PUBLIC',
    category: 'GENERAL',
    imageUrl: ''
  };

  tagInput = '';
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  isSubmitting = false;
  selectedFile: File | null = null;
  
  // Subscriptions to manage and unsubscribe later
  private subscriptions: Subscription[] = [];

  categories = [
    { value: 'GENERAL' as PostCategory, label: 'General' },
    { value: 'ACADEMIC' as PostCategory, label: 'Academic' },
    { value: 'CLUB' as PostCategory, label: 'Club' },
    { value: 'EVENT' as PostCategory, label: 'Event' },
    { value: 'POLL' as PostCategory, label: 'Poll' }
  ];

  visibilityOptions = [
    { value: 'PUBLIC' as PostVisibility, label: 'Public' },
    { value: 'FRIENDS' as PostVisibility, label: 'Friends Only' },
    { value: 'PRIVATE' as PostVisibility, label: 'Private' }
  ];

  constructor(
    private postService: PostService,
    private fileUploadService: FileUploadService,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    // Subscribe to loading and error observables
    this.subscriptions.push(
      this.postService.loading$.subscribe((isLoading: boolean) => {
        this.isSubmitting = isLoading;
      })
    );

    this.subscriptions.push(
      this.postService.error$.subscribe((error: string) => {
        if (error) {
          this.errorMessage = error;
          setTimeout(() => this.errorMessage = '', 5000);
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // Ensure proper focus when modal opens
    setTimeout(() => {
      const titleInput = this.el.nativeElement.querySelector('#post-title');
      if (titleInput) {
        titleInput.focus();
      }
    }, 100);
  }
  
  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setCategory(value: PostCategory, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.post.category = value;
  }

  setVisibility(value: PostVisibility, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.post.visibility = value;
  }

  addTag(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const tag = this.tagInput.trim();
    if (tag && !this.post.tags.includes(tag)) {
      // Limit to 5 tags
      if (this.post.tags.length >= 5) {
        this.showError('Maximum 5 tags allowed');
        return;
      }
      this.post.tags.push(tag);
    }
    this.tagInput = '';
  }

  removeTag(tag: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.post.tags = this.post.tags.filter((t: string) => t !== tag);
  }

  uploadImage(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const file = input.files[0];
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Image size should be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
      this.showError('Only image files are allowed');
      return;
    }
    
    this.selectedFile = file;
    this.isUploading = true;
    this.uploadProgress = 0;
    
    // Use the file upload service
    const uploadSubscription = this.fileUploadService.uploadFile(file).subscribe({
      next: (event: UploadEvent) => {
        if (event.type === 'progress' && event.progress !== undefined) {
          this.uploadProgress = event.progress;
        }
        
        if (event.type === 'complete' && event.url) {
          this.isUploading = false;
          this.post.imageUrl = event.url;
          
          // Create a temporary preview
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            const tempPreview = document.getElementById('image-preview') as HTMLImageElement;
            if (tempPreview && e.target) {
              tempPreview.src = e.target.result as string;
            }
          };
          reader.readAsDataURL(file);
        }
      },
      error: (error: any) => {
        this.isUploading = false;
        this.showError('Failed to upload image: ' + error.message);
      }
    });
    
    this.subscriptions.push(uploadSubscription);
  }

  removeImage(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.post.imageUrl = '';
    this.selectedFile = null;
    
    const input = document.getElementById('post-image') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  validatePost(): boolean {
    if (!this.post.title.trim()) {
      this.showError('Please provide a title for your post.');
      return false;
    }
    
    if (!this.post.content.trim()) {
      this.showError('Please provide content for your post.');
      return false;
    }
    
    if (this.post.title.length > 100) {
      this.showError('Title should be less than 100 characters.');
      return false;
    }
    
    if (this.post.content.length > 5000) {
      this.showError('Content should be less than 5000 characters.');
      return false;
    }
    
    if (this.isUploading) {
      this.showError('Please wait for image upload to complete.');
      return false;
    }
    
    return true;
  }

  submitPost(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.validatePost()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    console.log('Submitting post:', this.post);

    const subscription = this.postService.createPost(this.post).subscribe({
      next: (createdPost: Post) => {
        console.log('Post created successfully:', createdPost);
        this.isSubmitting = false;
        this.postCreated.emit(createdPost);
        this.close();
      },
      error: (err: any) => {
        console.error('Error creating post:', err);
        this.isSubmitting = false;
        this.showError(err.message || 'Failed to create post. Please try again.');
      }
    });
    
    this.subscriptions.push(subscription);
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
    
    // Scroll to error message if it's not visible
    setTimeout(() => {
      const errorElement = this.el.nativeElement.querySelector('.error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  close(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.closeModal.emit();
  }

  // Stop propagation for modal container clicks
  preventClose(event: Event): void {
    event.stopPropagation();
  }
}