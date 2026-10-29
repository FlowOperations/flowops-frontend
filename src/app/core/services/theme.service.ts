import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'flowops_theme';
  readonly theme = signal<Theme>(this.initialTheme());
  readonly dark = computed(() => this.theme() === 'dark');

  constructor() {
    this.apply(this.theme());
  }

  toggle(): void {
    const theme: Theme = this.dark() ? 'light' : 'dark';
    this.theme.set(theme);
    localStorage.setItem(this.storageKey, theme);
    this.apply(theme);
  }

  private initialTheme(): Theme {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(theme: Theme): void {
    this.document.documentElement.dataset['theme'] = theme;
  }
}
