import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthResponse } from '@core/models/api.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should update authentication state after login', () => {
    const response: AuthResponse = {
      token: 'jwt-token',
      tipo: 'Bearer',
      expiraEmSegundos: 28800,
      usuario: {
        id: 1,
        nomeCompleto: 'Administrador FlowOps',
        cpf: '00000000000',
        email: 'admin@flowops.local',
        dataNascimento: '1990-01-01',
        perfilSistema: 'ADMIN_FLOWOPS',
        ativo: true,
      },
    };

    expect(service.authenticated()).toBe(false);

    service.login('00000000000', 'Admin123!').subscribe();
    http.expectOne('/api/auth/login').flush(response);

    expect(service.authenticated()).toBe(true);
    expect(service.token).toBe('jwt-token');
  });
});
