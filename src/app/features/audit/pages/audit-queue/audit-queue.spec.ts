import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tarefa } from '@core/models/api.models';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuditQueue } from './audit-queue';

const task: Tarefa = {
  id: 1,
  projetoId: 1,
  titulo: 'Revisar exportação',
  descricao: 'Conferir os totais do arquivo exportado.',
  responsavelId: 2,
  responsavelNome: 'Joana Lima',
  prioridade: 'ALTA',
  prazo: '2026-11-10T15:00:00Z',
  status: 'AGUARDANDO_AUDITORIA',
};

describe('AuditQueue', () => {
  let fixture: ComponentFixture<AuditQueue>;
  let host: HTMLElement;
  let dialog: HTMLDialogElement;
  let pending: Tarefa[];
  let approve: ReturnType<typeof vi.fn>;
  let requestCorrection: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    pending = [task];
    approve = vi.fn(() => {
      pending = [];
      return of({});
    });
    requestCorrection = vi.fn(() =>
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { mensagem: 'A tarefa já foi auditada.' },
          }),
      ),
    );
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FlowOpsApiService,
          useValue: {
            listarAuditoriasPendentes: () => of(pending),
            aprovarTarefa: approve,
            solicitarCorrecao: requestCorrection,
          },
        },
      ],
    });
    fixture = TestBed.createComponent(AuditQueue);
    fixture.detectChanges();
    host = fixture.nativeElement;
    dialog = host.querySelector('dialog')!;
    // jsdom does not implement the browser's modal lifecycle.
    dialog.showModal = () => {
      dialog.open = true;
    };
    dialog.close = () => {
      dialog.open = false;
      dialog.dispatchEvent(new Event('close'));
    };
    button('Auditar').click();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('opens the selected task and removes it from the queue after approval', () => {
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('h2')?.textContent).toBe(task.titulo);
    expect(dialog.textContent).toContain(task.descricao);

    button('Aprovar tarefa').click();
    fixture.detectChanges();

    expect(approve).toHaveBeenCalledExactlyOnceWith(task.id);
    expect(dialog.open).toBe(false);
    expect(host.querySelector('tbody tr')).toBeNull();
    expect(host.textContent).toContain('Tarefa aprovada');
  });

  it('requires a correction reason and keeps the dialog open when the API rejects it', () => {
    const submit = button('Solicitar correção');
    expect(submit.disabled).toBe(true);

    const reason = dialog.querySelector('textarea')!;
    reason.value = '  Conferir a coluna de totais.  ';
    reason.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(submit.disabled).toBe(false);
    dialog.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true }));
    fixture.detectChanges();

    expect(requestCorrection).toHaveBeenCalledExactlyOnceWith(
      task.id,
      'Conferir a coluna de totais.',
    );
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('[role="alert"]')?.textContent).toContain(
      'A tarefa já foi auditada.',
    );
  });

  function button(label: string): HTMLButtonElement {
    return Array.from(host.querySelectorAll('button')).find(
      (item) => item.textContent?.trim() === label,
    )!;
  }
});
