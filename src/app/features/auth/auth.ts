import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginData } from '../../models/login-data';
import { environment } from '../../../environments/environment.development';
import { LoginResponse } from '../../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = `${environment.apiUrl}/api/Auth/login`;   

  constructor(private http: HttpClient) {

  }

 login(data: LoginData) {
  return this.http.post<LoginResponse>(this.loginUrl, data);
}

}