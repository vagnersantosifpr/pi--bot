// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
//import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideHttpClient() // Maneira moderna de fornecer o HttpClient
//   ]
// }).catch(err => console.error(err));

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));