import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivrosList implements OnInit {
  private readonly livroService = inject(LivroService);
  private readonly generoService = inject(GeneroService);
  private readonly dialog = inject(MatDialog);
  private readonly maxFilterLength = 255;

  readonly displayedColumns = ['titulo', 'autor', 'genero', 'acoes'];

  livros = signal<LivroResponse[]>([]);
  generos = signal<SelectItem<number>[]>([]);
  selectedValue = signal<string | null>(null);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  loading = signal(false);
  filterErrorMessage = signal<string | null>(null);
  fieldErrors = signal<Partial<Record<'titulo' | 'autor', string>>>({});

  filtro: LivroFilter = {};

  async ngOnInit() {
    const generos = await this.generoService.allGeneros();
    this.generos.set(generos);
    await this.buscar();
  }

  async buscar(resetPage = true) {
    this.normalizeFilterValues();

    if (!this.validateFilters()) {
      return;
    }

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
      this.clearValidationState();
    } catch (error) {
      this.handleSearchError(error);
    } finally {
      this.loading.set(false);
    }
  }

  onFilterInputChange(field: 'titulo' | 'autor') {
    const currentErrors = { ...this.fieldErrors() };
    delete currentErrors[field];
    this.fieldErrors.set(currentErrors);

    if (!currentErrors.titulo && !currentErrors.autor) {
      this.filterErrorMessage.set(null);
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
        title: 'Excluir Livro',
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

  getFieldLength(field: 'titulo' | 'autor') {
    return this.filtro[field]?.length ?? 0;
  }

  private normalizeFilterValues() {
    this.filtro = {
      ...this.filtro,
      titulo: this.normalizeValue(this.filtro.titulo),
      autor: this.normalizeValue(this.filtro.autor),
    };
  }

  private normalizeValue(value?: string) {
    const normalizedValue = value?.trim();
    return normalizedValue ? normalizedValue : undefined;
  }

  private validateFilters() {
    const fieldErrors: Partial<Record<'titulo' | 'autor', string>> = {};

    if ((this.filtro.titulo?.length ?? 0) > this.maxFilterLength) {
      fieldErrors.titulo = `Título não pode ter mais de ${this.maxFilterLength} caracteres`;
    }

    if ((this.filtro.autor?.length ?? 0) > this.maxFilterLength) {
      fieldErrors.autor = `Autor não pode ter mais de ${this.maxFilterLength} caracteres`;
    }

    this.fieldErrors.set(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      this.filterErrorMessage.set('Revise os filtros informados e tente novamente.');
      return false;
    }

    this.filterErrorMessage.set(null);
    return true;
  }

  private clearValidationState() {
    this.filterErrorMessage.set(null);
    this.fieldErrors.set({});
  }

  private handleSearchError(error: unknown) {
    if (error instanceof HttpErrorResponse && error.status === 400) {
      const apiError = error.error as {
        message?: string;
        fieldErrors?: Partial<Record<'titulo' | 'autor', string>>;
      };

      this.filterErrorMessage.set(apiError.message ?? 'Erro de validação nos filtros informados.');
      this.fieldErrors.set(apiError.fieldErrors ?? {});
      return;
    }

    this.filterErrorMessage.set('Não foi possível realizar a busca. Tente novamente em instantes.');
  }
}
