import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tarefa } from '@core/models/api.models';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { DataGrid, GridFilter } from '@shared/ui/data-grid/data-grid';
import { initials, priorityLabels } from '@shared/ui/data-grid/list-display';
import { finalize } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeader, DataGrid, DatePipe],
  selector: 'app-audit-queue',
  templateUrl: './audit-queue.html',
})
export class AuditQueue {
  private readonly api = inject(FlowOpsApiService);
  protected readonly tasks = signal<Tarefa[]>([]);
  protected readonly feedback = signal('');
  protected readonly feedbackError = signal(false);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly reviewTask = signal<Tarefa | null>(null);
  protected readonly reviewError = signal('');
  protected readonly initials = initials;
  protected readonly priorityLabels = priorityLabels;
  protected readonly taskName = (task: Tarefa) => task.titulo;
  protected readonly taskFields = (task: Tarefa) => [
    task.titulo,
    task.descricao,
    task.responsavelNome,
  ];
  protected readonly taskFilters: readonly GridFilter<Tarefa>[] = [
    {
      key: 'prioridade',
      label: 'Prioridade',
      allLabel: 'Todas as prioridades',
      options: Object.entries(priorityLabels).map(([value, label]) => ({ value, label })),
      matches: (task, value) => task.prioridade === value,
    },
  ];
  protected correctionReason = '';

  constructor() {
    this.load();
  }

  protected openReview(task: Tarefa, dialog: HTMLDialogElement): void {
    this.correctionReason = '';
    this.reviewError.set('');
    this.reviewTask.set(task);
    dialog.showModal();
  }

  protected resetReview(): void {
    this.reviewTask.set(null);
    this.correctionReason = '';
  }

  protected submitReview(dialog: HTMLDialogElement, approve: boolean): void {
    const task = this.reviewTask();
    const reason = this.correctionReason.trim();
    if (!task || this.saving() || (!approve && !reason)) return;

    this.saving.set(true);
    this.reviewError.set('');
    const request = approve
      ? this.api.aprovarTarefa(task.id)
      : this.api.solicitarCorrecao(task.id, reason);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.feedbackError.set(false);
        this.feedback.set(
          approve ? `Tarefa aprovada: ${task.titulo}.` : `Correção solicitada para ${task.titulo}.`,
        );
        this.tasks.update((tasks) => tasks.filter(({ id }) => id !== task.id));
        dialog.close();
        this.load();
      },
      error: (response: HttpErrorResponse) => this.reviewError.set(apiErrorMessage(response)),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.api
      .listarAuditoriasPendentes()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (tasks) => this.tasks.set(tasks),
        error: (response: HttpErrorResponse) => {
          this.feedbackError.set(true);
          this.feedback.set(apiErrorMessage(response));
        },
      });
  }
}
