import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { LivroService } from '../../../services/livro.service';
import { LivroFilter } from '../../../models/livro-filter';
import { LivroResponse } from '../../../models/livro-response';
import { GeneroService } from '../../../services/genero.service';
import { SelectItem } from '../../../models/select-item';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-livros-list',
  imports: [
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './livros-list.html',
  styleUrl: './livros-list.scss',
})
export class LivrosList implements OnInit {
  private readonly livroService = inject(LivroService);
  private readonly generoService = inject(GeneroService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['titulo', 'autor', 'genero', 'acoes'];

  livros = signal<LivroResponse[]>([]);
  generos = signal<SelectItem<number>[]>([]);
  selectedValue = signal<string | null>(null);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  loading = signal(false);

  filtro: LivroFilter = {};

  async ngOnInit() {
    const generos = await this.generoService.allGeneros();
    this.generos.set(generos);
    await this.buscar();
  }

  async buscar(resetPage = true) {
    if (resetPage) this.pageIndex.set(0);
    this.loading.set(true);
    try {
      const resp = await this.livroService.getLivros(
        this.filtro,
        this.pageIndex(),
        this.pageSize()
      );
      this.livros.set(resp.content);
      this.totalElements.set(resp.totalElements);
    } finally {
      this.loading.set(false);
    }
  }

  async onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    await this.buscar(false);
  }

  async verDetalhes(id: number) {
    const { LivrosDetails } = await import('../livros-details/livros-details');
    const dialogRef = this.dialog.open(LivrosDetails, {
      width: '480px',
      data: { id },
    });

    dialogRef.afterClosed().subscribe(async (resultado) => {
      if (resultado?.saved) {
        await this.buscar(false);
      }
    });
  }

  async editarLivro(id: number) {
    const { LivrosCreate } = await import('../livros-create/livros-create');
    const dialogRef = this.dialog.open(LivrosCreate, {
      width: '480px',
      data: { id },
    });

    dialogRef.afterClosed().subscribe(async (resultado) => {
      if (resultado?.saved) {
        await this.buscar(false);
      }
    });
  }

  async excluirLivro(id: number, titulo: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        titel: 'Excluir Livro',
        mensagem: `Deseja realmente excluir o livro "${titulo}"? Esta ação não pode ser desfeita.`,
        botaoCancelar: 'Cancelar',
        botaoConfirmar: 'Excluir',
        isDangerous: true,
      },
    });

    dialogRef.afterClosed().subscribe(async (confirmou) => {
      if (confirmou) {
        await this.livroService.deleteLivro(id);

        if (this.livros().length === 1 && this.pageIndex() > 0) {
          this.pageIndex.update((pageIndexAtual) => pageIndexAtual - 1);
        }

        await this.buscar(false);
      }
    });
  }

  async abrirFormularioCadastro() {
    const { LivrosCreate } = await import('../livros-create/livros-create');
    const dialogRef = this.dialog.open(LivrosCreate, {
      width: '480px',
    });

    dialogRef.afterClosed().subscribe(async (resultado) => {
      if (resultado?.saved) {
        await this.buscar();
      }
    });
  }
}
