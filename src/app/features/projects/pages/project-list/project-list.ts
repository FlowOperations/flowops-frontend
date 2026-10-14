import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, PageHeader],
  selector: 'app-project-list',
  template: `
    <app-page-header title="Projetos" description="Acompanhe escopo, equipe e progresso." />
    <app-empty-state label="Área de projetos" />
  `,
})
export class ProjectList {}
