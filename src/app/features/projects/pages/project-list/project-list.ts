import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Projeto, StatusProjeto, VinculoEmpresa } from '@core/models/api.models';
import { AuthService } from '@core/services/auth.service';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { DataGrid, GridFilter } from '@shared/ui/data-grid/data-grid';
import { initials } from '@shared/ui/data-grid/list-display';
import { FilterMenu } from '@shared/ui/filter-menu/filter-menu';
import { finalize, Subscription } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeader, DataGrid, FilterMenu],
  selector: 'app-project-list',
  templateUrl: './project-list.html',
})
export class ProjectList {
  private readonly api = inject(FlowOpsApiService);
  private readonly auth = inject(AuthService);
  protected readonly links = signal<VinculoEmpresa[]>([]);
  protected readonly companyOptions = computed(() =>
    this.links().map(({ empresaId, empresaNome }) => ({ value: empresaId, label: empresaNome })),
  );
  protected readonly projects = signal<Projeto[]>([]);
  protected readonly loading = signal(true);
  private projectRequest?: Subscription;
  protected readonly initials = initials;
  protected readonly statusLabels: Record<StatusProjeto, string> = {
    PLANEJAMENTO: 'Planejamento',
    EM_ANDAMENTO: 'Em andamento',
    PAUSADO: 'Pausado',
    CONCLUIDO: 'Concluído',
    CANCELADO: 'Cancelado',
  };
  protected readonly projectName = (project: Projeto) => project.nome;
  protected readonly projectFields = (project: Projeto) => [
    project.nome,
    project.descricao,
    project.gestorResponsavelNome,
    project.empresaNome,
  ];
  protected readonly projectFilters: readonly GridFilter<Projeto>[] = [
    {
      key: 'status',
      label: 'Status do projeto',
      allLabel: 'Todos os status',
      options: Object.entries(this.statusLabels).map(([value, label]) => ({ value, label })),
      matches: (project, value) => project.status === value,
    },
  ];
  protected readonly showForm = signal(false);
  protected readonly feedback = signal('');
  protected companyId: number | null = null;
  protected name = '';
  protected description = '';
  protected startDate = '';
  protected endDate = '';

  constructor() {
    this.api.listarMeusVinculos().subscribe({
      next: (links) => {
        this.links.set(links);
        this.companyId = links[0]?.empresaId ?? null;
        this.loadProjects();
      },
      error: (response: HttpErrorResponse) => {
        this.feedback.set(apiErrorMessage(response));
        this.loading.set(false);
      },
    });
  }

  protected loadProjects(): void {
    this.projectRequest?.unsubscribe();
    this.projects.set([]);
    if (!this.companyId) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.projectRequest = this.api
      .listarProjetos(this.companyId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (projects) => this.projects.set(projects),
        error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
      });
  }

  protected create(): void {
    const userId = this.auth.user()?.id;
    if (!this.companyId || !userId) return;
    this.api
      .criarProjeto({
        empresaId: this.companyId,
        gestorResponsavelId: userId,
        nome: this.name,
        descricao: this.description,
        dataInicioPrevista: this.startDate,
        dataFimPrevista: this.endDate,
      })
      .subscribe({
        next: () => {
          this.showForm.set(false);
          this.resetForm();
          this.loadProjects();
        },
        error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
      });
  }

  protected start(project: Projeto): void {
    this.api.alterarStatusProjeto(project.id, 'EM_ANDAMENTO').subscribe({
      next: () => this.loadProjects(),
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }

  private resetForm(): void {
    this.name = '';
    this.description = '';
    this.startDate = '';
    this.endDate = '';
  }
}
