import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CadastroUsuarioAdmin,
  Empresa,
  Projeto,
  TipoAcessoUsuario,
  UsuarioAdministracao,
} from '@core/models/api.models';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { finalize } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeader],
  selector: 'app-user-list',
  templateUrl: './user-list.html',
})
export class UserList {
  private readonly api = inject(FlowOpsApiService);

  protected readonly users = signal<UsuarioAdministracao[]>([]);
  protected readonly companies = signal<Empresa[]>([]);
  protected readonly projects = signal<Projeto[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly feedback = signal('');
  protected readonly feedbackError = signal(false);
  protected readonly accessTypes: ReadonlyArray<{ value: TipoAcessoUsuario; label: string }> = [
    { value: 'ADMIN_FLOWOPS', label: 'Administrador FlowOps' },
    { value: 'GESTOR', label: 'Gestor' },
    { value: 'COORDENADOR', label: 'Coordenador' },
    { value: 'FUNCIONARIO', label: 'Funcionário' },
  ];

  protected name = '';
  protected cpf = '';
  protected email = '';
  protected birthDate = '';
  protected password = '';
  protected accessType: TipoAcessoUsuario = 'FUNCIONARIO';
  protected companyId: number | null = null;
  protected role = '';
  protected projectIds: number[] = [];

  constructor() {
    this.loadUsers();
    this.api.listarEmpresas().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        this.companyId = companies[0]?.id ?? null;
        this.loadProjects();
      },
      error: (response: HttpErrorResponse) => this.showError(response),
    });
  }

  protected toggleForm(): void {
    this.showForm.update((visible) => !visible);
    this.feedback.set('');
    this.feedbackError.set(false);
  }

  protected businessAccess(): boolean {
    return this.accessType !== 'ADMIN_FLOWOPS';
  }

  protected projectAccess(): boolean {
    return this.accessType === 'COORDENADOR' || this.accessType === 'FUNCIONARIO';
  }

  protected onAccessTypeChange(): void {
    this.projectIds = [];
    if (this.accessType === 'ADMIN_FLOWOPS') {
      this.companyId = null;
      this.role = '';
      this.projects.set([]);
      return;
    }

    this.companyId ??= this.companies()[0]?.id ?? null;
    this.loadProjects();
  }

  protected loadProjects(): void {
    this.projectIds = [];
    if (!this.companyId || this.accessType === 'ADMIN_FLOWOPS') {
      this.projects.set([]);
      return;
    }
    this.api.listarProjetos(this.companyId).subscribe({
      next: (projects) => this.projects.set(projects),
      error: (response: HttpErrorResponse) => this.showError(response),
    });
  }

  protected toggleProject(projectId: number, checked: boolean): void {
    this.projectIds = checked
      ? [...this.projectIds, projectId]
      : this.projectIds.filter((id) => id !== projectId);
  }

  protected create(): void {
    const payload: CadastroUsuarioAdmin = {
      nomeCompleto: this.name.trim(),
      cpf: this.cpf.replace(/\D/g, ''),
      email: this.email.trim().toLowerCase(),
      senha: this.password,
      dataNascimento: this.birthDate,
      tipoAcesso: this.accessType,
      empresaId: this.businessAccess() ? this.companyId : null,
      cargo: this.businessAccess() ? this.role.trim() : null,
      projetoIds: this.projectAccess() ? this.projectIds : [],
    };

    this.saving.set(true);
    this.feedback.set('');
    this.feedbackError.set(false);
    this.api
      .criarUsuarioAdministrativamente(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (user) => {
          this.feedback.set(`${user.nomeCompleto} cadastrada com sucesso.`);
          this.showForm.set(false);
          this.resetForm();
          this.loadUsers();
        },
        error: (response: HttpErrorResponse) => this.showError(response),
      });
  }

  protected formatCpf(cpf: string): string {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  protected accessLabel(user: UsuarioAdministracao): string {
    if (user.perfilSistema === 'ADMIN_FLOWOPS') return 'Administrador FlowOps';
    return user.acessos.map((access) => this.roleLabel(access.papel)).join(', ') || 'Sem vínculo';
  }

  protected companyLabel(user: UsuarioAdministracao): string {
    return user.acessos.map((access) => access.empresaNome).join(', ') || 'FlowOps';
  }

  private roleLabel(role: TipoAcessoUsuario): string {
    return this.accessTypes.find((item) => item.value === role)?.label ?? role;
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.api
      .listarUsuariosAdministracao()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (users) => this.users.set(users),
        error: (response: HttpErrorResponse) => this.showError(response),
      });
  }

  private showError(response: HttpErrorResponse): void {
    this.feedbackError.set(true);
    this.feedback.set(apiErrorMessage(response));
  }

  private resetForm(): void {
    this.name = '';
    this.cpf = '';
    this.email = '';
    this.birthDate = '';
    this.password = '';
    this.accessType = 'FUNCIONARIO';
    this.companyId = this.companies()[0]?.id ?? null;
    this.role = '';
    this.projectIds = [];
    this.loadProjects();
  }
}
