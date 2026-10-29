import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-theme-toggle',
  styleUrl: './theme-toggle.scss',
  templateUrl: './theme-toggle.html',
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}
