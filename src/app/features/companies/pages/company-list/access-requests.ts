import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PapelEmpresa, VinculoEmpresa } from '@core/models/api.models';
import { FlowOpsApiService } from '@core/services/flowops-api.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-access-requests',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="form-panel" aria-label="Solicitações de acesso">
      <div class="form-panel__header">
        <h2>Solicitações · {{ companyName() }}</h2>
        <p>Revise a pessoa e defina cargo e perfil antes de aprovar.</p>
      </div>
      @if (feedback()) {
        <div class="notice" role="status">{{ feedback() }}</div>
      }
      @if (loading()) {
        <p>Carregando solicitações…</p>
      }
      @for (request of requests(); track request.id) {
        <form (ngSubmit)="analyze(request, true)" class="form-panel">
          <h3>{{ request.usuarioNome }}</h3>
          <p>{{ request.usuarioEmail }}</p>
          <div class="form-grid">
            <label
              >Cargo<input [(ngModel)]="roles[request.id]" name="role" required maxlength="100"
            /></label>
            <label
              >Perfil<select [(ngModel)]="profiles[request.id]" name="profile" required>
                <option value="FUNCIONARIO">Funcionário</option>
                <option value="COORDENADOR">Coordenador</option>
                <option value="GESTOR">Gestor</option>
              </select></label
            >
          </div>
          <div class="form-actions">
            <button
              type="button"
              class="button button--ghost"
              [disabled]="saving()"
              (click)="analyze(request, false)"
            >
              Recusar
            </button>
            <button
              type="submit"
              class="button button--primary"
              [disabled]="saving() || !roles[request.id]?.trim()"
            >
              Aprovar acesso
            </button>
          </div>
        </form>
      } @empty {
        @if (!loading()) {
          <p>Nenhuma solicitação pendente.</p>
        }
      }
    </section>
  `,
})
export class AccessRequests {
  readonly companyId = input.required<number>();
  readonly companyName = input.required<string>();
  private readonly api = inject(FlowOpsApiService);
  protected readonly requests = signal<VinculoEmpresa[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly feedback = signal('');
  protected roles: Record<number, string> = {};
  protected profiles: Record<number, PapelEmpresa> = {};

  constructor() {
    effect((onCleanup) => {
      this.requests.set([]);
      this.feedback.set('');
      this.loading.set(true);
      const subscription = this.api
        .listarSolicitacoesPendentes(this.companyId())
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (requests) => {
            this.requests.set(requests);
            this.roles = {};
            this.profiles = Object.fromEntries(
              requests.map((request) => [request.id, 'FUNCIONARIO' as const]),
            );
          },
          error: (error: HttpErrorResponse) => this.feedback.set(apiErrorMessage(error)),
        });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected analyze(request: VinculoEmpresa, approved: boolean): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.feedback.set('');
    this.api
      .analisarSolicitacao(
        request.id,
        approved,
        this.roles[request.id]?.trim() ?? '',
        this.profiles[request.id],
      )
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.requests.update((requests) => requests.filter((item) => item.id !== request.id));
          this.feedback.set(approved ? 'Acesso aprovado.' : 'Solicitação recusada.');
        },
        error: (error: HttpErrorResponse) => this.feedback.set(apiErrorMessage(error)),
      });
  }
}
