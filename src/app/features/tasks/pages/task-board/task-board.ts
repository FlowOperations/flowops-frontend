import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrioridadeTarefa, Projeto, Tarefa, VinculoEmpresa } from '@core/models/api.models';
import { AuthService } from '@core/services/auth.service';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeader],
  selector: 'app-task-board',
  templateUrl: './task-board.html',
})
export class TaskBoard {
  private readonly api = inject(FlowOpsApiService);
  private readonly auth = inject(AuthService);
  protected readonly links = signal<VinculoEmpresa[]>([]);
  protected readonly projects = signal<Projeto[]>([]);
  protected readonly tasks = signal<Tarefa[]>([]);
  protected readonly showForm = signal(false);
  protected readonly feedback = signal('');
  protected companyId: number | null = null;
  protected projectId: number | null = null;
  protected title = '';
  protected description = '';
  protected priority: PrioridadeTarefa = 'MEDIA';
  protected deadline = '';
  protected responsibleId: number | null = null;

  constructor() {
    this.api.listarMeusVinculos().subscribe({
      next: (links) => {
        this.links.set(links);
        this.companyId = links[0]?.empresaId ?? null;
        this.loadProjects();
      },
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }

  protected loadProjects(): void {
    if (!this.companyId) return;
    this.api.listarProjetos(this.companyId).subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.projectId = projects[0]?.id ?? null;
        this.loadTasks();
      },
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }

  protected loadTasks(): void {
    if (!this.projectId) {
      this.tasks.set([]);
      return;
    }
    this.api.listarTarefas(this.projectId).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }

  protected create(): void {
    if (!this.projectId) return;
    this.api
      .criarTarefa({
        projetoId: this.projectId,
        titulo: this.title,
        descricao: this.description,
        prioridade: this.priority,
        prazo: this.deadline,
        responsavelId: this.responsibleId || this.auth.user()?.id || null,
      })
      .subscribe({
        next: () => {
          this.showForm.set(false);
          this.resetForm();
          this.loadTasks();
        },
        error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
      });
  }

  protected advance(task: Tarefa): void {
    const action =
      task.status === 'PENDENTE' || task.status === 'EM_CORRECAO'
        ? this.api.iniciarTarefa(task.id)
        : this.api.enviarParaAuditoria(task.id);
    action.subscribe({
      next: () => this.loadTasks(),
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }

  protected actionLabel(task: Tarefa): string {
    if (task.status === 'PENDENTE' || task.status === 'EM_CORRECAO') return 'Iniciar';
    if (task.status === 'EM_ANDAMENTO') return 'Enviar para auditoria';
    return '';
  }

  protected tasksBy(status: Tarefa['status']): Tarefa[] {
    return this.tasks().filter((task) => task.status === status);
  }

  private resetForm(): void {
    this.title = '';
    this.description = '';
    this.priority = 'MEDIA';
    this.deadline = '';
    this.responsibleId = null;
  }
}
