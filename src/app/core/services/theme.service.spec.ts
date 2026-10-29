import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

const originalMatchMedia = window.matchMedia;

describe('ThemeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('should toggle and persist the selected theme', () => {
    localStorage.setItem('flowops_theme', 'light');
    const service = TestBed.inject(ThemeService);

    service.toggle();

    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('flowops_theme')).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('should use the system preference when no theme was selected', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: true }) as MediaQueryList,
    });

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
  });
});
