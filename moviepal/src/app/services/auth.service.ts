import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BASE_API_URL } from '../utils/api.url';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
}

interface User {
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private storageType: Storage = localStorage; // Default to localStorage

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  login(username: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    // Set storage type based on remember me
    this.storageType = rememberMe ? localStorage : sessionStorage;
    
    return this.http.post<LoginResponse>(`${BASE_API_URL}/auth/login`, { username, password }).pipe(
      tap(response => {
        // Store token in the appropriate storage
        this.storageType.setItem('token', response.token);

        const user = this.getUserFromToken(response.token);
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          console.error('Failed to parse user from token');
        }
      })
    );
  }

  register(username: string, email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${BASE_API_URL}/auth/register`, { username, email, password }).pipe(
      tap(response => {
        this.storageType.setItem('token', response.token);
        const user = this.getUserFromToken(response.token);
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          console.error('Failed to parse user from token after registration');
        }
      })
    );
  }

  refreshAuthStatus(): void {
    this.http.post<LoginResponse>(`${BASE_API_URL}/auth/refresh`, {"token": this.getToken() }).pipe(
      tap(response => {
        if (response.token) {
          this.storageType.setItem('token', response.token);
          const user = this.getUserFromToken(response.token);
          if (user) {
            this.currentUserSubject.next(user);
          } else {
            console.error('Failed to parse user from token after refresh');
          }
        }
      })).subscribe({
      error: (error) => {
        console.error('Error refreshing auth status:', error);
        this.logout();
        this.router.navigate(['/login']);
      }});
  }

  private checkAuthStatus() {
    // Check both storage types
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      try {
        const user = this.getUserFromToken(token);
        this.currentUserSubject.next(user);
        // Set storage type based on where we found the token
        this.storageType = localStorage.getItem('token') ? localStorage : sessionStorage;
      } catch (error) {
        console.error('Error parsing token:', error);
        this.logout();
      }
    }
  }

   public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getUserFromToken(token: string): User | null {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));

      return {
        username: decodedPayload.sub || decodedPayload.username || 'Unknown User'
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  logout() {
    // Clear token from both storages
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.currentUserSubject.next(null);
    console.log('User logged out successfully');
  }

  getToken(): string | null {
    // Check both storage types
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
