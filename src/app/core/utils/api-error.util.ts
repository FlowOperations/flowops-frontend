import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '@core/models/api.models';

export function apiErrorMessage(
  response: HttpErrorResponse,
  fallback = 'Não foi possível concluir a operação.',
): string {
  const error = response.error as ApiError | null;
  return error?.mensagem ?? error?.message ?? fallback;
}
