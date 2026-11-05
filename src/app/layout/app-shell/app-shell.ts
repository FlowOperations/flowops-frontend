import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NAVIGATION_ITEMS } from '@core/config/navigation.config';
import { Icon } from '@shared/ui/icon/icon';
import { ThemeToggle } from '@shared/ui/theme-toggle/theme-toggle';
import { AuthService } from '@core/services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink, RouterLinkActive, RouterOutlet, ThemeToggle],
  selector: 'app-shell',
  styleUrl: './app-shell.scss',
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly sidebarStorageKey = 'flowops_sidebar_collapsed';
  protected readonly auth = inject(AuthService);
  protected readonly sidebarCollapsed = signal(
    localStorage.getItem(this.sidebarStorageKey) === 'true',
  );
  protected readonly navigationItems = computed(() =>
    NAVIGATION_ITEMS.filter(
      (item) => !item.adminOnly || this.auth.user()?.perfilSistema === 'ADMIN_FLOWOPS',
    ),
  );

  protected toggleSidebar(): void {
    const collapsed = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(collapsed);
    localStorage.setItem(this.sidebarStorageKey, String(collapsed));
  }
}
