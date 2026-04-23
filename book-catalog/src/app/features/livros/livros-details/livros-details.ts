import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { LivroService } from '../../../services/livro.service';
import { LivroDetails } from '../../../models/livro-details';

export interface LivrosDetailsDialogData {
  id: number;
}

@Component({
  selector: 'app-livros-details',
  imports: [
    CurrencyPipe,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './livros-details.html',
  styleUrl: './livros-details.scss',
})
export class LivrosDetails implements OnInit {
  private readonly livroService = inject(LivroService);
  private readonly dialogRef = inject(MatDialogRef<LivrosDetails>);
  readonly data = inject<LivrosDetailsDialogData>(MAT_DIALOG_DATA);

  livro = signal<LivroDetails | null>(null);
  loading = signal(false);
  erro = signal<string | null>(null);

  async ngOnInit() {
    this.loading.set(true);
    try {
      const details = await this.livroService.getLivroDetails(this.data.id);
      this.livro.set(details);
    } catch {
      this.erro.set('Não foi possível carregar os detalhes do livro.');
    } finally {
      this.loading.set(false);
    }
  }

  fechar() {
    this.dialogRef.close();
  }
}
