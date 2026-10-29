import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { apiErrorMessage } from '@core/utils/api-error.util';
import { ThemeToggle } from '@shared/ui/theme-toggle/theme-toggle';
import { finalize } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, ThemeToggle],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected cpf = '';
  protected senha = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected submit(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth
      .login(this.cpf.replace(/\D/g, ''), this.senha)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: (response: HttpErrorResponse) => {
          this.error.set(apiErrorMessage(response, 'Não foi possível entrar. Confira seus dados.'));
        },
      });
  }
}
