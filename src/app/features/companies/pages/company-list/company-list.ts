import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiError, Empresa, Usuario } from '@core/models/api.models';
import { AuthService } from '@core/services/auth.service';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { finalize } from 'rxjs';

type CompanyField = 'razaoSocial' | 'nomeFantasia' | 'cnpj' | 'gestorInicialId' | 'cargoGestor';

const companyFieldOrder: CompanyField[] = [
  'razaoSocial',
  'nomeFantasia',
  'cnpj',
  'gestorInicialId',
  'cargoGestor',
];

const companyFieldIds: Record<CompanyField, string> = {
  razaoSocial: 'company-corporate-name',
  nomeFantasia: 'company-trade-name',
  cnpj: 'company-cnpj',
  gestorInicialId: 'company-manager',
  cargoGestor: 'company-manager-role',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeader],
  selector: 'app-company-list',
  templateUrl: './company-list.html',
})
export class CompanyList {
  private readonly api = inject(FlowOpsApiService);
  private readonly auth = inject(AuthService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly companies = signal<Empresa[]>([]);
  protected readonly users = signal<Usuario[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly feedback = signal('');
  protected readonly feedbackError = signal(false);
  protected readonly fieldErrors = signal<Partial<Record<CompanyField, string>>>({});
  protected readonly isAdmin = computed(() => this.auth.user()?.perfilSistema === 'ADMIN_FLOWOPS');
  protected corporateName = '';
  protected tradeName = '';
  protected cnpj = '';
  protected managerId: number | null = null;
  protected managerRole = 'Gestor de projetos';

  constructor() {
    this.load();
    if (this.isAdmin()) this.loadUsers();
  }

  protected create(): void {
    if (!this.managerId) return;
    this.feedback.set('');
    this.feedbackError.set(false);
    this.clearFieldErrors();
    this.saving.set(true);
    this.api
      .criarEmpresa({
        razaoSocial: this.corporateName.trim(),
        nomeFantasia: this.tradeName.trim(),
        cnpj: this.cnpj.replace(/\D/g, ''),
        flgAtivo: true,
        gestorInicialId: this.managerId,
        cargoGestor: this.managerRole.trim(),
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (company) => {
          this.showForm.set(false);
          this.resetForm();
          this.clearFieldErrors();
          this.feedback.set(`${company.nomeFantasia} cadastrada com sucesso.`);
          this.load();
        },
        error: (response: HttpErrorResponse) => {
          this.feedbackError.set(true);
          this.feedback.set(
            this.applyFieldErrors(response)
              ? 'Corrija os campos destacados.'
              : apiErrorMessage(response),
          );
        },
      });
  }

  protected toggleForm(): void {
    this.clearFieldErrors();
    this.showForm.update((visible) => !visible);
  }

  protected cancelCreate(): void {
    this.clearFieldErrors();
    this.showForm.set(false);
  }

  protected fieldError(field: CompanyField): string | undefined {
    return this.fieldErrors()[field];
  }

  protected clearFieldError(field: CompanyField): void {
    if (!this.fieldErrors()[field]) return;

    const errors = { ...this.fieldErrors() };
    delete errors[field];
    this.fieldErrors.set(errors);
  }

  protected requestAccess(company: Empresa): void {
    this.feedback.set('');
    this.feedbackError.set(false);
    this.api.solicitarVinculo(company.id).subscribe({
      next: () => this.feedback.set(`Solicitação enviada para ${company.nomeFantasia}.`),
      error: (response: HttpErrorResponse) => {
        this.feedbackError.set(true);
        this.feedback.set(apiErrorMessage(response));
      },
    });
  }

  protected formatCnpj(cnpj: string): string {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  private load(): void {
    this.loading.set(true);
    this.api
      .listarEmpresas()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (companies) => this.companies.set(companies.filter((company) => company.flgAtivo)),
        error: (response: HttpErrorResponse) => {
          this.feedbackError.set(true);
          this.feedback.set(apiErrorMessage(response));
        },
      });
  }

  private loadUsers(): void {
    this.api.listarUsuarios().subscribe({
      next: (users) => {
        this.users.set(users);
        this.managerId = users[0]?.id ?? null;
      },
      error: (response: HttpErrorResponse) => {
        this.feedbackError.set(true);
        this.feedback.set(apiErrorMessage(response));
      },
    });
  }

  private resetForm(): void {
    this.corporateName = '';
    this.tradeName = '';
    this.cnpj = '';
    this.managerId = this.users()[0]?.id ?? null;
    this.managerRole = 'Gestor de projetos';
  }

  private applyFieldErrors(response: HttpErrorResponse): boolean {
    const apiError = response.error as ApiError | null;
    const errors: Partial<Record<CompanyField, string>> = {};

    for (const field of companyFieldOrder) {
      const message = apiError?.campos?.[field];
      if (message) errors[field] = message;
    }

    const firstInvalidField = companyFieldOrder.find((field) => errors[field]);
    if (!firstInvalidField) return false;

    this.fieldErrors.set(errors);
    queueMicrotask(() => {
      this.elementRef.nativeElement
        .querySelector<HTMLElement>(`#${companyFieldIds[firstInvalidField]}`)
        ?.focus();
    });
    return true;
  }

  private clearFieldErrors(): void {
    this.fieldErrors.set({});
  }
}
