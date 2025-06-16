import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BASE_API_URL } from '../../utils/api.url';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NzIconModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private id: string = '';  
  username: string = '';
  email: string = '';
  editUsername: string = '';
  editEmail: string = '';
  isEditScreen: boolean = false;
  profileForm!: FormGroup;
  animate: boolean = false;

  constructor(private http: HttpClient, private fb: FormBuilder, 
    private router: Router, private authService: AuthService) 
  {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      username: ['',[Validators.minLength(3)]],
      email: ['', [Validators.email]]
    });
    
    this.loadUserProfile();
    
    setTimeout(() => {
      this.animate = true;
      setTimeout(() => { this.animate = false; }, 2100); }, 300);
  }

  private loadUserProfile() {
    const userToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!userToken) {
      console.error('No user token found. User is not authenticated.');
      return;
    }

    const header = new HttpHeaders({
      Authorization: `Bearer ${userToken}`
    })

    this.http.get<{id: string, username: string, email: string }>(BASE_API_URL+'/users/profile', { headers: header })
    .subscribe( (response) => {
      if(response && response.username && response.email) {
        this.id = response.id;
        this.username = response.username;
        this.email = response.email;
      }
    })
  }

  public editProfile() {
    this.isEditScreen = true;
  }

  public updateProfile() {
    this.editUsername = this.profileForm.get('username')?.value || '';
    this.editEmail = this.profileForm.get('email')?.value || '';

    if (!this.editUsername && !this.editEmail) {
      console.warn('No changes made to the profile.');
      this.cancelEdit();
      return;
    } 
    else if (!this.editUsername && this.editEmail) {
      this.editUsername = this.username;
    } 
    else if (this.editUsername && !this.editEmail) {
      this.editEmail = this.email;
    }

    const userToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!userToken) {
      console.error('No user token found. User is not authenticated.');
      return;
    } 

    const header = new HttpHeaders({
      Authorization: `Bearer ${userToken}`
    });

    this.http.put<{message: string}>(`${BASE_API_URL}/users/profile`, {
      username: this.editUsername,
      email: this.editEmail
    }, { headers: header })
    .subscribe({
      next: (response) => {
        
        // this.http.post<{token: string}>(`${BASE_API_URL}/auth/refresh`, { token: userToken })
        // .subscribe({
        //   next: (refreshResponse) => {
        //     if(refreshResponse.token){
        //       sessionStorage.setItem('token', refreshResponse.token);
        //     }
        //   },
        //   error: (refreshError) => {
        //     console.error('Error refreshing token:', refreshError);
        //   }
        // });

        if (this.editUsername !== this.username) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }

        console.log('Profile updated successfully:', response.message);
        this.username = this.editUsername || this.username;
        this.email = this.editEmail || this.email;
        this.cancelEdit();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.cancelEdit();
      }
    });
  }

  public cancelEdit() {
    this.editUsername = '';
    this.editEmail = '';
    this.isEditScreen = false;
  }
}
