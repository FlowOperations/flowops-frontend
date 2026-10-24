import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, CadastroUsuario, Usuario } from '@core/models/api.models';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'flowops_token';
  private readonly userKey = 'flowops_user';
  private readonly currentToken = signal<string | null>(localStorage.getItem(this.tokenKey));
  private readonly currentUser = signal<Usuario | null>(this.readUser());

  readonly user = this.currentUser.asReadonly();
  readonly authenticated = computed(() => Boolean(this.currentToken() && this.currentUser()));

  get token(): string | null {
    return this.currentToken();
  }

  login(cpf: string, senha: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { cpf, senha }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.usuario));
        this.currentToken.set(response.token);
        this.currentUser.set(response.usuario);
      }),
    );
  }

  register(payload: CadastroUsuario): Observable<Usuario> {
    return this.http.post<Usuario>('/api/auth/cadastro', payload);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentToken.set(null);
    this.currentUser.set(null);
    void this.router.navigate(['/login']);
  }

  initials(): string {
    return (this.currentUser()?.nomeCompleto ?? 'Flow Ops')
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private readUser(): Usuario | null {
    const value = localStorage.getItem(this.userKey);
    if (!value) return null;
    try {
      return JSON.parse(value) as Usuario;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
