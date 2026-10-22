import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Projeto, VinculoEmpresa } from '@core/models/api.models';
import { AuthService } from '@core/services/auth.service';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeader],
  selector: 'app-project-list',
  templateUrl: './project-list.html',
})
export class ProjectList {
  private readonly api = inject(FlowOpsApiService);
  private readonly auth = inject(AuthService);
  protected readonly links = signal<VinculoEmpresa[]>([]);
  protected readonly projects = signal<Projeto[]>([]);
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
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }

  protected loadProjects(): void {
    if (!this.companyId) {
      this.projects.set([]);
      return;
    }
    this.api.listarProjetos(this.companyId).subscribe({
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
