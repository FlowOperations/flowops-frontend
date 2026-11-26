import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '@core/services/auth.service';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { of } from 'rxjs';
import { TaskBoard } from './task-board';

describe('TaskBoard', () => {
  let fixture: ComponentFixture<TaskBoard>;
  const api = {
    listarContextosEmpresa: () => of([{ empresaId: 1, empresaNome: 'Empresa' }]),
    listarProjetos: () => of([{ id: 2, nome: 'Projeto' }]),
    listarMembrosProjeto: () =>
      of([{ usuarioId: 7, nome: 'Ana Coordenadora', email: 'ana@teste.local', ativo: true }]),
    listarTarefas: () =>
      of([
        {
          id: 1,
          projetoId: 2,
          responsavelId: 8,
          responsavelNome: 'Outra pessoa',
          titulo: 'Tarefa de outra pessoa',
          descricao: '',
          prazo: '2099-12-01T10:00:00',
          prioridade: 'MEDIA',
          status: 'PENDENTE',
        },
      ]),
    criarTarefa: vi.fn(() => of({})),
  };

  beforeEach(async () => {
    api.criarTarefa.mockClear();
    await TestBed.configureTestingModule({
      imports: [TaskBoard],
      providers: [
        { provide: FlowOpsApiService, useValue: api },
        { provide: AuthService, useValue: { user: signal({ id: 7 }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TaskBoard);
    fixture.detectChanges();
    button('Nova tarefa').click();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('exibe nomes de membros conforme o contrato da API', () => {
    const select = fixture.nativeElement.querySelector(
      'select[name="responsibleId"]',
    ) as HTMLSelectElement;
    expect([...select.options].map((option) => option.textContent?.trim())).toEqual([
      'Sem responsável',
      'Ana Coordenadora',
    ]);
  });

  it('não oferece iniciar para tarefa de outro responsável', () => {
    expect(fixture.nativeElement.querySelector('.task-card').textContent).not.toContain('Iniciar');
  });

  it('destaca prazo passado antes de enviar a criação', async () => {
    const input = fixture.nativeElement.querySelector('input[name="deadline"]') as HTMLInputElement;
    input.value = '2020-01-01T10:00';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#task-deadline-error').textContent).toContain(
      'data e hora futura',
    );
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(api.criarTarefa).not.toHaveBeenCalled();
  });

  function button(name: string): HTMLButtonElement {
    return Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((element) => element.textContent?.trim() === name)!;
  }
});
