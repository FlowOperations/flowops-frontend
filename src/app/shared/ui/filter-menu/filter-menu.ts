import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface FilterOption<T = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-filter-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-menu.html',
  styleUrl: './filter-menu.scss',
  host: {
    '(document:click)': 'onOutsideClick($event)',
    '(focusout)': 'onFocusOut($event)',
    '(keydown.escape)': 'dismiss($event)',
  },
})
export class FilterMenu<T> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly FilterOption<T>[]>();
  readonly value = input.required<T>();
  readonly alignEnd = input(false);
  readonly dropUp = input(false);
  readonly valueChange = output<T>();
  protected readonly open = signal(false);
  protected readonly selected = computed(() =>
    this.options().find((option) => option.value === this.value()),
  );
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected choose(option: FilterOption<T>): void {
    this.valueChange.emit(option.value);
    this.closeAndFocus();
  }

  protected dismiss(event: Event): void {
    if (!this.open()) return;
    event.preventDefault();
    event.stopPropagation();
    this.closeAndFocus();
  }

  protected onOutsideClick(event: MouseEvent): void {
    if (this.open() && !event.composedPath().includes(this.host.nativeElement)) {
      this.open.set(false);
    }
  }

  protected onFocusOut(event: FocusEvent): void {
    if (
      event.relatedTarget instanceof Node &&
      !this.host.nativeElement.contains(event.relatedTarget)
    ) {
      this.open.set(false);
    }
  }

  private closeAndFocus(): void {
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }
}
