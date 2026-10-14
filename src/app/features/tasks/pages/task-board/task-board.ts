import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, PageHeader],
  selector: 'app-task-board',
  template: `
    <app-page-header title="Tarefas" description="Visualize atividades por etapa do fluxo." />
    <app-empty-state label="Quadro de tarefas" />
  `,
})
export class TaskBoard {}
