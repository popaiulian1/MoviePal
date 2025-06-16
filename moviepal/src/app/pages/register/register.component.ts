import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordStrengthValidator, passwordsMatchValidator } from '../../utils/password.validator';
import { PasswordStrengthPipe } from '../../utils/password-strength.pipe';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, PasswordStrengthPipe, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordsMatchValidator });
  }

  onSubmit(): void {
    if(this.registerForm.invalid) return;
    const { username, email, password } = this.registerForm.value;
    this.authService.register(username!, email!, password!).subscribe({
      next: (response) => {
        if(response.token) {
          sessionStorage.setItem('token', response.token);
          const user = this.authService['getUserFromToken'](response.token);
          if(user) {
            (this.authService as any).currentUserSubject.next(user); // Update current user
          }
        }
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.errorMsg = 'Registration failed: ' + (err.error?.message || err.statusText);
      }
    });
  }
}
