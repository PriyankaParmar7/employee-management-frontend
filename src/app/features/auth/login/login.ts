
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginData } from '../../../models/login-data';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';

  constructor(private authService: AuthService) {

  }

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
      },
      error: (error) => {
        console.log('Login failed:', error);
      }
    });

  }

}
