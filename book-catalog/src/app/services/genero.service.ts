import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SelectItem } from '../models/select-item';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GeneroService {
  private readonly baseUrl = '/api/generos';
  private readonly http = inject(HttpClient);

  allGeneros(): Promise<SelectItem<number>[]> {
    return firstValueFrom(
      this.http.get<any[]>(this.baseUrl).pipe(
        map((data) => {
          console.log('Generos recebidos:', data);
          if (Array.isArray(data) && data.every((item) => typeof item === 'string')) {
            return data.map((genero, index) => ({
              value: index + 1,
              label: genero,
            }));
          }
          if (Array.isArray(data) && data.every((item) => item.id && item.nome)) {
            return data.map((genero) => ({
              value: genero.id,
              label: genero.nome,
            }));
          }
          return data;
        })
      )
    );
  }
}
