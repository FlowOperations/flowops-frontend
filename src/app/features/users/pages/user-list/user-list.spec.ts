import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroUsuarioAdmin, UsuarioAdministracao } from '@core/models/api.models';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { of } from 'rxjs';
import { UserList } from './user-list';

const createdUser: UsuarioAdministracao = {
  id: 9,
  nomeCompleto: 'Coordenadora Teste',
  cpf: '90000000001',
  email: 'coordenadora@flowops.local',
  dataNascimento: '1995-01-15',
  perfilSistema: 'USUARIO',
  ativo: true,
  acessos: [
    {
      empresaId: 1,
      empresaNome: 'EMPRESA SUNSHINE',
      papel: 'COORDENADOR',
      cargo: 'Coordenação técnica',
    },
  ],
};

class ApiStub {
  createdPayload: CadastroUsuarioAdmin | null = null;

  listarUsuariosAdministracao() {
    return of([]);
  }

  listarEmpresas() {
    return of([
      {
        id: 1,
        razaoSocial: 'Empresa Sunshine Ltda.',
        nomeFantasia: 'EMPRESA SUNSHINE',
        cnpj: '12345678000199',
        flgAtivo: true,
      },
    ]);
  }

  listarProjetos() {
    return of([
      {
        id: 7,
        empresaId: 1,
        empresaNome: 'EMPRESA SUNSHINE',
        gestorResponsavelId: 1,
        gestorResponsavelNome: 'Administrador FlowOps',
        nome: 'Atualização Java',
        descricao: 'Projeto de teste',
        dataInicioPrevista: '2026-10-01',
        dataFimPrevista: '2026-12-01',
        status: 'EM_ANDAMENTO' as const,
        progresso: 0,
      },
    ]);
  }

  criarUsuarioAdministrativamente(payload: CadastroUsuarioAdmin) {
    this.createdPayload = payload;
    return of(createdUser);
  }
}

describe('UserList', () => {
  let fixture: ComponentFixture<UserList>;
  let api: ApiStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [{ provide: FlowOpsApiService, useClass: ApiStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserList);
    api = TestBed.inject(FlowOpsApiService) as unknown as ApiStub;
    fixture.detectChanges();
  });

  it('creates a coordinator with the selected company and project access', async () => {
    buttonContaining('Novo usuário').click();
    await fixture.whenStable();
    fixture.detectChanges();

    await setInput('#user-name', 'Coordenadora Teste');
    await setInput('#user-cpf', '900.000.000-01');
    await setInput('#user-email', 'coordenadora@flowops.local');
    await setInput('#user-birth-date', '1995-01-15');
    await setInput('#user-password', 'Coordenador123!');
    await setSelect('#user-access-type', 'COORDENADOR');

    await setInput('#user-role', 'Coordenação técnica');
    const project = fixture.nativeElement.querySelector('#user-project-7') as HTMLInputElement;
    project.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(api.createdPayload).toEqual({
      nomeCompleto: 'Coordenadora Teste',
      cpf: '90000000001',
      email: 'coordenadora@flowops.local',
      senha: 'Coordenador123!',
      dataNascimento: '1995-01-15',
      tipoAcesso: 'COORDENADOR',
      empresaId: 1,
      cargo: 'Coordenação técnica',
      projetoIds: [7],
    });
    expect(fixture.nativeElement.textContent).toContain(
      'Coordenadora Teste cadastrada com sucesso.',
    );
  });

  it('hides company and project fields for an administrator account', async () => {
    buttonContaining('Novo usuário').click();
    await fixture.whenStable();
    fixture.detectChanges();

    await setSelect('#user-access-type', 'ADMIN_FLOWOPS');

    expect(fixture.nativeElement.querySelector('#user-company')).toBeNull();
    expect(fixture.nativeElement.querySelector('#user-role')).toBeNull();
    expect(fixture.nativeElement.querySelector('.project-access')).toBeNull();
  });

  async function setInput(selector: string, value: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function setSelect(selector: string, value: string): Promise<void> {
    const select = fixture.nativeElement.querySelector(selector) as HTMLSelectElement;
    const option = Array.from(select.options).find((candidate) => candidate.value === value);
    if (!option) {
      throw new Error(
        `Option ${value} not found in ${Array.from(select.options)
          .map((candidate) => candidate.value)
          .join(', ')}`,
      );
    }
    select.selectedIndex = option.index;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function buttonContaining(text: string): HTMLButtonElement {
    const button = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((candidate) => candidate.textContent?.includes(text));
    if (!button) throw new Error(`Button not found: ${text}`);
    return button;
  }
});
