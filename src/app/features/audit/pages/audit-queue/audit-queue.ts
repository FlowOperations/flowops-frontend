import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, PageHeader],
  selector: 'app-audit-queue',
  template: `
    <app-page-header title="Auditoria" description="Revise tarefas enviadas para validação." />
    <app-empty-state label="Fila de auditoria" />
  `,
})
export class AuditQueue {}
