import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LivroService } from '../../../services/livro.service';
import { GeneroService } from '../../../services/genero.service';
import { SelectItem } from '../../../models/select-item';
import { LivroFormRequest } from '../../../models/livro-form-request';

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
        MatSlideToggleModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './livros-create.html',
    styleUrl: './livros-create.scss',
})
export class LivrosCreate implements OnInit {
    private readonly livroService = inject(LivroService);
    private readonly generoService = inject(GeneroService);
    private readonly dialogRef = inject(MatDialogRef<LivrosCreate>);

    generos = signal<SelectItem<string>[]>([]);
    loading = signal(false);
    erro = signal<string | null>(null);

    livro: LivroFormRequest = {
        titulo: '',
        autor: '',
        isbn: '',
        anoPublicacao: new Date().getFullYear(),
        preco: 0,
        generoId: 0,
    };

    async ngOnInit() {
        try {
            const generos = await this.generoService.allGeneros();
            this.generos.set(generos);
        } catch {
            this.erro.set('Não foi possível carregar os gêneros.');
        }
    }

    async salvar() {
        if (!this.validar()) {
            this.erro.set('Preencha todos os campos obrigatórios.');
            return;
        }

        this.loading.set(true);
        try {
            await this.livroService.createLivro(this.livro);
            this.dialogRef.close(true);
        } catch (error) {
            this.erro.set('Erro ao cadastrar livro.');
            console.error(error);
        } finally {
            this.loading.set(false);
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
