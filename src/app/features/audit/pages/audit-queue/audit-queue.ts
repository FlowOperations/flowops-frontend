import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tarefa } from '@core/models/api.models';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeader],
  selector: 'app-audit-queue',
  templateUrl: './audit-queue.html',
})
export class AuditQueue {
  private readonly api = inject(FlowOpsApiService);
  protected readonly tasks = signal<Tarefa[]>([]);
  protected readonly feedback = signal('');
  protected readonly correctionTask = signal<Tarefa | null>(null);
  protected correctionReason = '';

  constructor() {
    this.load();
  }

  protected approve(task: Tarefa): void {
    this.api.aprovarTarefa(task.id).subscribe({
      next: () => {
        this.feedback.set(`${task.titulo} foi aprovada.`);
        this.load();
      },
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }

  protected openCorrection(task: Tarefa): void {
    this.correctionReason = '';
    this.correctionTask.set(task);
  }

  protected closeCorrection(): void {
    this.correctionTask.set(null);
    this.correctionReason = '';
  }

  protected submitCorrection(): void {
    const task = this.correctionTask();
    const reason = this.correctionReason.trim();
    if (!task || !reason) return;
    this.api.solicitarCorrecao(task.id, reason).subscribe({
      next: () => {
        this.feedback.set(`Correção solicitada para ${task.titulo}.`);
        this.closeCorrection();
        this.load();
      },
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }

  private load(): void {
    this.api.listarAuditoriasPendentes().subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }
}
