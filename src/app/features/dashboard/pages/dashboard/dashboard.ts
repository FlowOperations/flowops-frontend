import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly indicators = [
    { label: 'Projetos ativos', value: '08', detail: '2 próximos do prazo' },
    { label: 'Tarefas em andamento', value: '24', detail: '6 atribuídas a você' },
    { label: 'Aguardando auditoria', value: '05', detail: 'Revisão necessária' },
    { label: 'Progresso médio', value: '68%', detail: 'Todos os projetos' },
  ];
}
