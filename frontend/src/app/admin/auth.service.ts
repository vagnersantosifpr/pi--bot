import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'https://pia-bot.onrender.com/api/auth';

  //private apiUrl = 'http://localhost:3000/api/auth'; // Ou a URL do seu backend em produção

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    this.router.navigate(['/admin/login']);
  }

  private setSession(authResult: any): void {
    localStorage.setItem('authToken', authResult.token);
    localStorage.setItem('authUser', JSON.stringify(authResult.user));
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken(); // Retorna true se o token existir
  }
}