import {ApplicationConfig} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {Injector} from "./injector/injector";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), Injector],
};
