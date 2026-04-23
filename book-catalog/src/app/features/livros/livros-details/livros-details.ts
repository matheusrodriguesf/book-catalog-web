import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { LivroService } from '../../../services/livro.service';
import { LivroDetails } from '../../../models/livro-details';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

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
  private readonly dialog = inject(MatDialog);
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

  async editar() {
    const { LivrosCreate } = await import('../livros-create/livros-create');
    const dialogRef = this.dialog.open(LivrosCreate, {
      width: '480px',
      data: { id: this.data.id },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.saved) {
        this.dialogRef.close(resultado);
      }
    });
  }

  async excluir() {
    const livro = this.livro();
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Excluir Livro',
        mensagem: `Deseja realmente excluir o livro "${livro?.titulo ?? ''}"? Esta ação não pode ser desfeita.`,
        botaoCancelar: 'Cancelar',
        botaoConfirmar: 'Excluir',
        isDangerous: true,
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmou) => {
      if (confirmou) {
        this.loading.set(true);
        this.erro.set(null);

        try {
          await this.livroService.deleteLivro(this.data.id);
          this.dialogRef.close({ saved: true, action: 'deleted' });
        } catch {
          this.erro.set('Não foi possível excluir o livro.');
        } finally {
          this.loading.set(false);
        }
      }
    });
  }
}
