import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Projeto, Tarefa } from '@core/models/api.models';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly api = inject(FlowOpsApiService);
  protected readonly projects = signal<Projeto[]>([]);
  protected readonly tasks = signal<Tarefa[]>([]);
  protected readonly auditCount = signal(0);
  protected readonly feedback = signal('');
  protected readonly activeProjects = computed(
    () => this.projects().filter((project) => project.status === 'EM_ANDAMENTO').length,
  );
  protected readonly runningTasks = computed(
    () => this.tasks().filter((task) => task.status === 'EM_ANDAMENTO').length,
  );
  protected readonly averageProgress = computed(() => {
    const projects = this.projects();
    if (!projects.length) return 0;
    return Math.round(
      projects.reduce((total, project) => total + project.progresso, 0) / projects.length,
    );
  });
  protected readonly priorityTasks = computed(() =>
    this.tasks()
      .filter((task) => task.status !== 'APROVADA')
      .sort((first, second) => this.priorityWeight(second) - this.priorityWeight(first))
      .slice(0, 5),
  );

  constructor() {
    this.load();
  }

  private load(): void {
    this.api
      .listarMeusVinculos()
      .pipe(
        switchMap((links) => {
          const companyIds = [...new Set(links.map((link) => link.empresaId))];
          return companyIds.length
            ? forkJoin(companyIds.map((companyId) => this.api.listarProjetos(companyId)))
            : of([] as Projeto[][]);
        }),
        switchMap((projectGroups) => {
          const projects = projectGroups.flat();
          this.projects.set(projects);
          return projects.length
            ? forkJoin(projects.map((project) => this.api.listarTarefas(project.id)))
            : of([] as Tarefa[][]);
        }),
      )
      .subscribe({
        next: (taskGroups) => this.tasks.set(taskGroups.flat()),
        error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
      });

    this.api.listarAuditoriasPendentes().subscribe({
      next: (tasks) => this.auditCount.set(tasks.length),
      error: () => this.auditCount.set(0),
    });
  }

  private priorityWeight(task: Tarefa): number {
    return { BAIXA: 1, MEDIA: 2, ALTA: 3, URGENTE: 4 }[task.prioridade];
  }
}
