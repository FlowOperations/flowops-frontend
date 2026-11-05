import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataGrid, GridFilter } from './data-grid';

interface Item {
  name: string;
  document: string;
  group: string;
}

@Component({
  imports: [DataGrid],
  template: `
    <app-data-grid
      #grid
      title="Registros"
      [items]="items()"
      [searchFields]="fields"
      [sortName]="name"
      [filters]="filters"
    >
      <thead>
        <tr>
          <th scope="col">Nome</th>
        </tr>
      </thead>
      <tbody>
        @for (item of grid.visibleItems(); track item.name) {
          <tr>
            <td>{{ item.name }}</td>
          </tr>
        }
      </tbody>
    </app-data-grid>
  `,
})
class GridExample {
  readonly items = signal<Item[]>([
    { name: 'Árvore Azul', document: '55.852.299/0001-02', group: 'A' },
    ...Array.from({ length: 25 }, (_, index) => ({
      name: `Registro ${index + 1}`,
      document: '',
      group: 'B',
    })),
  ]);
  readonly fields = (item: Item) => [item.name, item.document];
  readonly name = (item: Item) => item.name;
  readonly filters: readonly GridFilter<Item>[] = [
    {
      key: 'group',
      label: 'Grupo',
      allLabel: 'Todos os grupos',
      options: [
        { value: 'A', label: 'Grupo A' },
        { value: 'B', label: 'Grupo B' },
      ],
      matches: (item, value) => item.group === value,
    },
  ];
}

describe('DataGrid', () => {
  let fixture: ComponentFixture<GridExample>;
  let host: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(GridExample);
    fixture.detectChanges();
    host = fixture.nativeElement;
  });

  it('returns to the first page and finds accented names and formatted documents', () => {
    nextButton().click();
    fixture.detectChanges();
    expect(rows()).toEqual(['Registro 25']);

    search('arvore azul');
    expect(rows()).toEqual(['Árvore Azul']);
    search('55852299000102');
    expect(rows()).toEqual(['Árvore Azul']);
  });

  it('combines search and filters and clears both to restore the list', () => {
    const group = host.querySelector<HTMLButtonElement>(
      'button[aria-label="Grupo: Todos os grupos"]',
    )!;
    group.click();
    fixture.detectChanges();
    const option = [...host.querySelectorAll<HTMLButtonElement>('.filter-popup button')].find(
      (item) => item.textContent?.trim() === 'Grupo B',
    )!;
    option.click();
    search('arvore');
    expect(rows()).toEqual([]);
    expect(host.textContent).toContain('Nenhum resultado para os filtros selecionados.');

    host.querySelector<HTMLButtonElement>('.grid-clear')!.click();
    fixture.detectChanges();
    expect(rows()).toHaveLength(25);
    expect(rows()[0]).toBe('Árvore Azul');
    expect(group.getAttribute('aria-label')).toBe('Grupo: Todos os grupos');
  });

  function search(query: string): void {
    const field = host.querySelector<HTMLInputElement>('input[type="search"]')!;
    field.value = query;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  function nextButton(): HTMLButtonElement {
    return Array.from(host.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Próxima'),
    )!;
  }

  function rows(): string[] {
    return Array.from(host.querySelectorAll('table tbody tr'), (row) => row.textContent!.trim());
  }
});
