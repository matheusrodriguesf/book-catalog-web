import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
    },
    {
        path: 'livros',
        loadComponent: () =>
            import('./features/livros/livros-list/livros-list').then((m) => m.LivrosList),
    },
    {
        path: '**',
        redirectTo: '',
    },
];
