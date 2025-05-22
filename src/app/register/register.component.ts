import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  individualForm!: FormGroup;
  clubForm!: FormGroup;
  userType: 'individual' | 'club' | null = null;
  registrationSuccess = false;
  registrationError: string | null = null;
  selectedProfilePic: File | null = null;
  isLoading = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.initializeForms();
  }

  selectType(type: 'individual' | 'club') {
    this.userType = type;
    this.registrationError = null;
  }

  initializeForms() {
    this.individualForm = this.fb.group({
      userId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      bio: [''],
      city: [''],
      state: [''],
      country: [''],
      gender: [''],
      birthDate: ['', Validators.required],
      degree: [''],
      department: [''],
      batch: [''],
      role: ['', Validators.required],
      profilePic: [null]
    }, { validators: this.passwordMatchValidator });

    this.clubForm = this.fb.group({
      clubId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      description: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (group: AbstractControl): { [key: string]: any } | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'passwordMismatch': true };
  };

  onProfilePicChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedProfilePic = file;
    }
  }

  onSubmitIndividual() {
    if (this.individualForm.invalid) return;
    this.registrationError = null;
    this.isLoading = true;
    
    // Create FormData
    const formData = new FormData();
    
    // Match backend controller's expected structure
    const userData = {
      email: this.individualForm.value.email,
      password: this.individualForm.value.password,
      bio: this.individualForm.value.bio || '',
      firstName: this.individualForm.value.firstName,
      lastName: this.individualForm.value.lastName,
      role: [this.individualForm.value.role], // Make sure this is an array
      city: this.individualForm.value.city || '',
      state: this.individualForm.value.state || '',
      country: this.individualForm.value.country || '',
      gender: this.individualForm.value.gender || null,
      birthDate: this.individualForm.value.birthDate,
      degree: this.individualForm.value.degree || '',
      department: this.individualForm.value.department || '',
      batch: this.individualForm.value.batch || ''
    };
    
    // Convert to a string and append to FormData
    formData.append('user', new Blob([JSON.stringify(userData)], {
      type: 'application/json'
    }));
    
    // Add profile picture if available
    if (this.selectedProfilePic) {
      formData.append('profilePic', this.selectedProfilePic);
    }
    
    // Log what we're sending (for debugging)
    console.log('Sending user data:', userData);
    
    // Send to backend with proper headers
    this.http.post('http://localhost:8080/api/auth/register', formData, {
      observe: 'response'
    })
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          this.registrationSuccess = true;
          this.individualForm.reset();
          this.userType = null;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.registrationError = err.error || 'Registration failed. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  onSubmitClub(): void {
    if (this.clubForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.registrationError = '';

    // Create FormData object for multipart/form-data submission
    const formData = new FormData();
    
    // Create club user data object
    const clubData = {
      email: this.clubForm.value.email,
      password: this.clubForm.value.password,
      firstName: this.clubForm.value.firstName,
      lastName: this.clubForm.value.lastName,
      bio: this.clubForm.value.description,
      role: ['CLUB'] // Array as expected by backend
    };
    
    // Convert to a string and append to FormData
    formData.append('user', new Blob([JSON.stringify(clubData)], {
      type: 'application/json'
    }));
    
    // Log what we're sending (for debugging)
    console.log('Sending club data:', clubData);
    
    // Send request with proper headers
    this.http.post('http://localhost:8080/api/auth/register', formData, {
      observe: 'response'
    })
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          this.registrationSuccess = true;
          this.clubForm.reset();
          this.userType = null;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.registrationError = err.error || 'Registration failed. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  goToLogin() {
    this.router.navigate(['/login']);
  }
}