import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopMenu {}
