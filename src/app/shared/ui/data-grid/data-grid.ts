import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { FilterMenu } from '../filter-menu/filter-menu';

export interface GridFilter<T> {
  key: string;
  label: string;
  allLabel: string;
  options: readonly { value: string; label: string }[];
  matches: (item: T, value: string) => boolean;
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function matchesGridSearch(
  query: string,
  fields: readonly (string | null | undefined)[],
): boolean {
  const text = normalize(query);
  const documentNumber = /^[\d./\-\s]+$/.test(text) ? text.replace(/\D/g, '') : '';
  return (
    !text ||
    fields.some((field) => {
      const value = normalize(field ?? '');
      return (
        value.includes(text) ||
        (!!documentNumber &&
          /^[\d./\-\s]+$/.test(value) &&
          value.replace(/\D/g, '').includes(documentNumber))
      );
    })
  );
}

@Component({
  selector: 'app-data-grid',
  imports: [FilterMenu],
  templateUrl: './data-grid.html',
  styleUrl: './data-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGrid<T> {
  readonly items = input.required<readonly T[]>();
  readonly title = input.required<string>();
  readonly placeholder = input('Buscar...');
  readonly emptyText = input('Nenhum registro disponível.');
  readonly loading = input(false);
  readonly searchFields = input.required<(item: T) => readonly (string | null | undefined)[]>();
  readonly sortName = input.required<(item: T) => string>();
  readonly filters = input<readonly GridFilter<T>[]>([]);
  readonly searchScopes = input<readonly { value: string; label: string }[]>([]);
  readonly scopedSearchFields = input<(item: T, scope: string) => readonly string[]>();

  protected readonly query = signal('');
  protected readonly scope = signal('');
  protected readonly order = signal('');
  protected readonly selections = signal<Record<string, string>>({});
  protected readonly pageSize = signal(25);
  protected readonly sortOptions = [
    { value: '', label: 'Ordem padrão' },
    { value: 'asc', label: 'Nome A–Z' },
    { value: 'desc', label: 'Nome Z–A' },
  ];
  protected readonly pageSizes = [10, 25, 50].map((value) => ({ value, label: String(value) }));
  private readonly collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
  protected readonly filteredItems = computed(() => {
    const query = this.query();
    const scope = this.scope();
    const scopedFields = this.scopedSearchFields();
    const filters = this.filters();
    const selections = this.selections();
    const fields = this.searchFields();
    const filtered = this.items().filter(
      (item) =>
        matchesGridSearch(
          query,
          scope && scopedFields ? scopedFields(item, scope) : fields(item),
        ) &&
        filters.every(({ key, options, matches }) => {
          const value = selections[key];
          return (
            !value || !options.some((option) => option.value === value) || matches(item, value)
          );
        }),
    );
    const order = this.order();
    if (!order) return filtered;
    const sortName = this.sortName();
    return filtered.sort(
      (a, b) => (order === 'desc' ? -1 : 1) * this.collator.compare(sortName(a), sortName(b)),
    );
  });
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize())),
  );
  protected readonly page = linkedSignal<number, number>({
    source: this.pageCount,
    computation: (count, previous) => Math.min(previous?.value ?? 0, count - 1),
  });
  protected readonly offset = computed(() => this.page() * this.pageSize());
  readonly visibleItems = computed(() =>
    this.filteredItems().slice(this.offset(), this.offset() + this.pageSize()),
  );
  protected readonly hasFilters = computed(
    () =>
      !!(
        this.query() ||
        this.scope() ||
        this.order() ||
        Object.values(this.selections()).some(Boolean)
      ),
  );

  protected updateQuery(value: string): void {
    this.query.set(value);
    this.page.set(0);
  }

  protected updateScope(value: string): void {
    this.scope.set(value);
    this.page.set(0);
  }

  protected updateOrder(value: string): void {
    this.order.set(value);
    this.page.set(0);
  }

  protected updateFilter(key: string, value: string): void {
    this.selections.update((selected) => ({ ...selected, [key]: value }));
    this.page.set(0);
  }

  protected updatePageSize(value: number): void {
    this.pageSize.set(value);
    this.page.set(0);
  }

  protected clear(): void {
    this.query.set('');
    this.scope.set('');
    this.order.set('');
    this.selections.set({});
    this.page.set(0);
  }
}
