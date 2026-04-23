import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LivroDetails } from '../models/livro-details';
import { LivroFilter } from '../models/livro-filter';
import { PagedResponse } from '../models/paged-response';
import { LivroResponse } from '../models/livro-response';
import { LivroFormRequest } from '../models/livro-form-request';

@Injectable({
  providedIn: 'root',
})
export class LivroService {
  private readonly baseUrl = '/api/livros';
  private readonly http = inject(HttpClient);

  getLivros(filtro: LivroFilter, page = 0, size = 10): Promise<PagedResponse<LivroResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (filtro.titulo) params = params.set('titulo', filtro.titulo);
    if (filtro.autor) params = params.set('autor', filtro.autor);
    if (filtro.genero) params = params.set('genero', filtro.genero);

    return firstValueFrom(this.http.get<PagedResponse<LivroResponse>>(this.baseUrl, { params }));
  }

  getLivroDetails(id: number): Promise<LivroDetails> {
    const url = `${this.baseUrl}/${id}/details`;
    return firstValueFrom(this.http.get<LivroDetails>(url));
  }

  createLivro(livro: LivroFormRequest): Promise<LivroResponse> {
    return firstValueFrom(this.http.post<LivroResponse>(this.baseUrl, livro));
  }
}
