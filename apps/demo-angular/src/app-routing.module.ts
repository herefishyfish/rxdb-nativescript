import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home.component').then((m) => m.HomeComponent) },
  { path: 'rxstorage-memory', loadComponent: () => import('./plugin-demos/rxstorage-memory/rxstorage-memory.component').then((m) => m.NativeScriptRxStorageMemoryComponent) },
  { path: 'lokijs-rxstorage', loadComponent: () => import('./plugin-demos/rxstorage-lokijs/lokijs-rxstorage.component').then((m) => m.NativescriptLokijsRxstorageComponent) },
  { path: 'sqlite-rxstorage', loadComponent: () => import('./plugin-demos/rxstorage-sqlite/sqlite-rxstorage.component').then((m) => m.NativescriptSQLiteRxstorageComponent) },
  { path: 'localstorage-rxstorage', loadComponent: () => import('./plugin-demos/rxstorage-localstorage/rxstorage-localstorage.component').then((m) => m.NativeScriptRxStorageLocalStorageComponent) },
];
