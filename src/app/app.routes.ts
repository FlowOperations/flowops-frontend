import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/app-shell/app-shell').then((component) => component.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Visão geral | FlowOps',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then(
            (component) => component.Dashboard,
          ),
      },
      {
        path: 'empresas',
        title: 'Empresas | FlowOps',
        loadComponent: () =>
          import('./features/companies/pages/company-list/company-list').then(
            (component) => component.CompanyList,
          ),
      },
      {
        path: 'projetos',
        title: 'Projetos | FlowOps',
        loadComponent: () =>
          import('./features/projects/pages/project-list/project-list').then(
            (component) => component.ProjectList,
          ),
      },
      {
        path: 'tarefas',
        title: 'Tarefas | FlowOps',
        loadComponent: () =>
          import('./features/tasks/pages/task-board/task-board').then(
            (component) => component.TaskBoard,
          ),
      },
      {
        path: 'auditoria',
        title: 'Auditoria | FlowOps',
        loadComponent: () =>
          import('./features/audit/pages/audit-queue/audit-queue').then(
            (component) => component.AuditQueue,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
