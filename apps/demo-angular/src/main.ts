import { runNativeScriptAngularApp, platformNativeScript, bootstrapApplication, provideNativeScriptHttpClient, provideNativeScriptNgZone, provideNativeScriptRouter } from '@nativescript/angular';
import { withInterceptorsFromDi } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';
import { routes } from './app-routing.module';

// runNativeScriptAngularApp({
//   appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
// });

runNativeScriptAngularApp({
  appModuleBootstrap: () => {
    return bootstrapApplication(AppComponent, {
      providers: [
        provideNativeScriptHttpClient(withInterceptorsFromDi()),
        provideNativeScriptRouter(routes),
        provideZonelessChangeDetection(),
        // provideNativeScriptNgZone(),
      ],
    });
  },
});
