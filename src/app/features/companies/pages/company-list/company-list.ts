import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Empresa } from '@core/models/api.models';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { finalize } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader],
  selector: 'app-company-list',
  templateUrl: './company-list.html',
})
export class CompanyList {
  private readonly api = inject(FlowOpsApiService);
  protected readonly companies = signal<Empresa[]>([]);
  protected readonly loading = signal(true);
  protected readonly feedback = signal('');

  constructor() {
    this.load();
  }

  protected requestAccess(company: Empresa): void {
    this.feedback.set('');
    this.api.solicitarVinculo(company.id).subscribe({
      next: () => this.feedback.set(`Solicitação enviada para ${company.nomeFantasia}.`),
      error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
    });
  }

  private load(): void {
    this.api
      .listarEmpresas()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (companies) => this.companies.set(companies.filter((company) => company.flgAtivo)),
        error: (response: HttpErrorResponse) => this.feedback.set(apiErrorMessage(response)),
      });
  }
}
