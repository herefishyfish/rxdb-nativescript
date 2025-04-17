import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';

import { HomeComponent } from './home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'rxstorage-memory', loadComponent: () => import('./plugin-demos/rxstorage-memory/rxstorage-memory.component').then((m) => m.NativeScriptRxStorageMemoryComponent) },
  { path: 'lokijs-rxstorage', loadComponent: () => import('./plugin-demos/rxstorage-lokijs/lokijs-rxstorage.component').then((m) => m.NativescriptLokijsRxstorageComponent) },
  { path: 'sqlite-rxstorage', loadComponent: () => import('./plugin-demos/rxstorage-sqlite/sqlite-rxstorage.component').then((m) => m.NativescriptSQLiteRxstorageComponent) },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
