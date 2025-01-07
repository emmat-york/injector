import { ApplicationConfig, Injectable } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

class BBB {
  name = 'adsf';
}

@Injectable()
export class AAA {
  constructor(private app: BBB) {}
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), AAA],
};
