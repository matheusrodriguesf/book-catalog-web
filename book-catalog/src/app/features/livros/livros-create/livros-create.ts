import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LivroService } from '../../../services/livro.service';
import { GeneroService } from '../../../services/genero.service';
import { SelectItem } from '../../../models/select-item';
import { LivroFormRequest } from '../../../models/livro-form-request';

export interface LivrosCreateDialogData {
    id?: number;
}

@Component({
    selector: 'app-livros-create',
    imports: [
        FormsModule,
        MatDialogModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './livros-create.html',
    styleUrl: './livros-create.scss',
})
export class LivrosCreate implements OnInit {
    private readonly livroService = inject(LivroService);
    private readonly generoService = inject(GeneroService);
    private readonly dialogRef = inject(MatDialogRef<LivrosCreate>);
    readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as LivrosCreateDialogData | null;

    generos = signal<SelectItem<number>[]>([]);
    carregando = signal(false);
    salvando = signal(false);
    erro = signal<string | null>(null);

    livro: LivroFormRequest = {
        titulo: '',
        autor: '',
        isbn: '',
        anoPublicacao: new Date().getFullYear(),
        preco: 0,
        generoId: 0,
    };

    get isEdicao(): boolean {
        return typeof this.data?.id === 'number';
    }

    get tituloDialogo(): string {
        return this.isEdicao ? 'Atualizar Livro' : 'Cadastrar Novo Livro';
    }

    get textoAcao(): string {
        return this.isEdicao ? 'Atualizar' : 'Salvar';
    }

    async ngOnInit() {
        this.carregando.set(true);
        this.erro.set(null);

        try {
            const generos = await this.generoService.allGeneros();
            this.generos.set(generos as SelectItem<number>[]);

            if (this.data?.id) {
                const details = await this.livroService.getLivroDetails(this.data.id);
                const generoSelecionado = generos.find((genero) => genero.label === details.genero);

                this.livro = {
                    titulo: details.titulo,
                    autor: details.autor,
                    isbn: details.isbn,
                    anoPublicacao: details.anoPublicacao,
                    preco: details.preco,
                    generoId: generoSelecionado?.value ?? 0,
                };
            }
        } catch {
            this.erro.set(
                this.isEdicao
                    ? 'Não foi possível carregar os dados do livro.'
                    : 'Não foi possível carregar os gêneros.'
            );
        } finally {
            this.carregando.set(false);
        }
    }

    async salvar() {
        if (!this.validar()) {
            this.erro.set('Preencha todos os campos obrigatórios.');
            return;
        }

        this.salvando.set(true);
        this.erro.set(null);

        try {
            if (this.data?.id) {
                await this.livroService.updateLivro(this.data.id, this.livro);
            } else {
                await this.livroService.createLivro(this.livro);
            }

            this.dialogRef.close({
                saved: true,
                action: this.isEdicao ? 'updated' : 'created',
            });
        } catch (error) {
            this.erro.set(this.isEdicao ? 'Erro ao atualizar livro.' : 'Erro ao cadastrar livro.');
            console.error(error);
        } finally {
            this.salvando.set(false);
        }
    }

    fechar() {
        this.dialogRef.close(false);
    }

    private validar(): boolean {
        return !!(
            this.livro.titulo &&
            this.livro.autor &&
            this.livro.isbn &&
            this.livro.anoPublicacao &&
            this.livro.preco &&
            this.livro.generoId
        );
    }
}
