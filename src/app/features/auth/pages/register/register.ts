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
  selector: 'app-register',
  styleUrl: '../login/login.scss',
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected name = '';
  protected cpf = '';
  protected email = '';
  protected birthDate = '';
  protected password = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected submit(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth
      .register({
        nomeCompleto: this.name.trim(),
        cpf: this.cpf.replace(/\D/g, ''),
        email: this.email.trim().toLowerCase(),
        dataNascimento: this.birthDate,
        senha: this.password,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/login'], { state: { registered: true } }),
        error: (response: HttpErrorResponse) => this.error.set(apiErrorMessage(response)),
      });
  }
}
