import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyState, PageHeader],
  selector: 'app-company-list',
  template: `
    <app-page-header title="Empresas" description="Organize empresas e seus ambientes de trabalho." />
    <app-empty-state label="Área de empresas" />
  `,
})
export class CompanyList {}
