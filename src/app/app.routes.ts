import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Tableau de bord — Tontine',
  },
  {
    path: 'groupes',
    loadComponent: () =>
      import('./pages/tontine-list/tontine-list.component').then((m) => m.TontineListComponent),
    title: 'Mes groupes — Tontine',
  },
  {
    path: 'groupes/nouveau',
    loadComponent: () =>
      import('./pages/tontine-form/tontine-form.component').then((m) => m.TontineFormComponent),
    title: 'Nouveau groupe — Tontine',
  },
  {
    path: 'groupes/:id',
    loadComponent: () =>
      import('./pages/tontine-detail/tontine-detail.component').then(
        (m) => m.TontineDetailComponent,
      ),
    title: 'Groupe — Tontine',
  },
  {
    path: 'groupes/:id/modifier',
    loadComponent: () =>
      import('./pages/tontine-form/tontine-form.component').then((m) => m.TontineFormComponent),
    title: 'Modifier le groupe — Tontine',
  },
  { path: '**', redirectTo: '' },
];
