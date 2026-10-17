import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginData } from '../../../models/login-data';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { AuthSessionService } from '../auth-session.service';


@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';

  forgotPasswordMode = false;
  forgotPasswordEmail = '';
  forgotPasswordMessage = '';
  forgotPasswordSuccess = false;


  constructor(
    private authService: AuthService,
    private router: Router,
    private authSession: AuthSessionService
  ) { }

  login(form: NgForm) {



    if (form.invalid) {
      return;
    }

    const loginData: LoginData = {
      username: this.username,
      password: this.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        localStorage.setItem('token', response.token);
        this.authSession.startSession(response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {

        console.log('Login failed:', error);
      }
    });
  }

  openForgotPassword() {
    this.forgotPasswordMode = true;
    this.forgotPasswordEmail = '';
    this.forgotPasswordMessage = '';
    this.forgotPasswordSuccess = false;
  }

  backToSignIn() {
    this.forgotPasswordMode = false;
    this.forgotPasswordEmail = '';
    this.forgotPasswordMessage = '';
    this.forgotPasswordSuccess = false;
  }

  forgotPassword(form: NgForm) {

    if (form.invalid) {
      return;
    }

    this.forgotPasswordMessage = '';
    this.forgotPasswordSuccess = false;

    this.authService.forgotPassword(
      this.forgotPasswordEmail.trim()
    ).subscribe({
      next: (response) => {
        this.forgotPasswordMessage =
          typeof response === 'string'
            ? response
            : 'If an account with this email exists, a temporary password has been sent.';

        this.forgotPasswordSuccess = true;
      },
      error: () => {
        this.forgotPasswordMessage =
          'Unable to process your request. Please try again.';
      }
    });
  }
}