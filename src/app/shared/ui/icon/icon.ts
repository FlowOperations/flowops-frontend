import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName = 'overview' | 'company' | 'users' | 'project' | 'task' | 'audit';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-icon',
  styleUrl: './icon.scss',
  templateUrl: './icon.html',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
