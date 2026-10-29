import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '@core/services/auth.service';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { of, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { CompanyList } from './company-list';

const admin = {
  id: 1,
  nomeCompleto: 'Administrador FlowOps',
  cpf: '00000000000',
  email: 'admin@flowops.local',
  dataNascimento: '1990-01-01',
  perfilSistema: 'ADMIN_FLOWOPS' as const,
  ativo: true,
};

class ApiStub {
  readonly createResponse = new Subject<never>();

  listarEmpresas() {
    return of([]);
  }

  listarUsuarios() {
    return of([admin]);
  }

  criarEmpresa() {
    return this.createResponse.asObservable();
  }
}

describe('CompanyList field validation', () => {
  let fixture: ComponentFixture<CompanyList>;
  let api: ApiStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyList],
      providers: [
        { provide: FlowOpsApiService, useClass: ApiStub },
        { provide: AuthService, useValue: { user: signal(admin) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyList);
    api = TestBed.inject(FlowOpsApiService) as unknown as ApiStub;
    fixture.detectChanges();

    const newCompanyButton = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Nova empresa'));
    newCompanyButton?.click();
    fixture.detectChanges();
  });

  it('shows the API validation message beside the invalid field and focuses it', async () => {
    submitForm();

    api.createResponse.error(
      validationError({ cnpj: 'O CNPJ deve conter exatamente 14 dígitos.' }),
    );
    fixture.detectChanges();
    await Promise.resolve();

    const cnpj = fixture.nativeElement.querySelector('#company-cnpj') as HTMLInputElement;
    const fieldMessage = fixture.nativeElement.querySelector('#company-cnpj-error');
    const notice = fixture.nativeElement.querySelector('.notice');

    expect(notice.textContent).toContain('Corrija os campos destacados.');
    expect(fieldMessage.textContent).toContain('O CNPJ deve conter exatamente 14 dígitos.');
    expect(cnpj.getAttribute('aria-invalid')).toBe('true');
    expect(cnpj.getAttribute('aria-describedby')).toBe('company-cnpj-error');
    expect(document.activeElement).toBe(cnpj);
  });

  it('clears only the edited field error and preserves the other validation messages', async () => {
    submitForm();

    api.createResponse.error(
      validationError({
        razaoSocial: 'Informe a razão social.',
        cnpj: 'O CNPJ deve conter exatamente 14 dígitos.',
      }),
    );
    fixture.detectChanges();
    await Promise.resolve();

    const corporateName = fixture.nativeElement.querySelector(
      '#company-corporate-name',
    ) as HTMLInputElement;
    const cnpj = fixture.nativeElement.querySelector('#company-cnpj') as HTMLInputElement;
    expect(document.activeElement).toBe(corporateName);

    cnpj.value = '12345678901234';
    cnpj.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#company-cnpj-error')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('#company-corporate-name-error').textContent,
    ).toContain('Informe a razão social.');
  });

  it('keeps the general API message when no recognized field details are returned', () => {
    submitForm();

    api.createResponse.error(
      validationError({ campoDesconhecido: 'Valor inválido.' }, 'Dados inválidos'),
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.notice').textContent).toContain('Dados inválidos');
    expect(fixture.nativeElement.querySelector('.field-error')).toBeNull();
  });

  function submitForm(): void {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function validationError(
    campos: Record<string, string>,
    mensagem = 'Dados inválidos',
  ): HttpErrorResponse {
    return new HttpErrorResponse({
      status: 400,
      error: { mensagem, campos },
    });
  }
});
