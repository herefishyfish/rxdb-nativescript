import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';

import { HomeComponent } from './home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'lokijs-rxstorage', loadChildren: () => import('./plugin-demos/rxstorage-lokijs/lokijs-rxstorage.module').then((m) => m.NativescriptLokijsRxstorageModule) },
  { path: 'sqlite-rxstorage', loadChildren: () => import('./plugin-demos/rxstorage-sqlite/sqlite-rxstorage.module').then((m) => m.NativescriptSQLiteRxstorageModule) },
  { path: 'nativescript-md5', loadChildren: () => import('./plugin-demos/nativescript-md5.module').then((m) => m.NativescriptMd5Module) },
  { path: 'rxstorage-memory', loadChildren: () => import('./plugin-demos/rxstorage-memory/rxstorage-memory.module').then((m) => m.NativeScriptRxStorageMemoryModule) },
  // { path: 'pouchdb-sqlite', loadChildren: () => import('./plugin-demos/pouchdb-sqlite/pouchdb-sqlite.module').then(m => m.NativeScriptPouchDBSqliteModule) },
  { path: 'requery-sqlite', loadChildren: () => import('./plugin-demos/requery-sqlite.module').then((m) => m.RequerySqliteModule) },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
