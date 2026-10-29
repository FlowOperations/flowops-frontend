import { NavigationItem } from '@core/models/navigation-item.model';

export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'Visão geral', route: '/dashboard', icon: 'overview' },
  { label: 'Empresas', route: '/empresas', icon: 'company' },
  { label: 'Usuários', route: '/usuarios', icon: 'users', adminOnly: true },
  { label: 'Projetos', route: '/projetos', icon: 'project' },
  { label: 'Tarefas', route: '/tarefas', icon: 'task' },
  { label: 'Auditoria', route: '/auditoria', icon: 'audit' },
];
