import { InjectionToken } from './injector.constant';

export type Constructor = { new (...args: any[]): object };

export type ProviderToken<T> = Constructor | InjectionToken<T>;
export type ClassProvider = { provide: ProviderToken<unknown>; useClass: Constructor };
export type ValueProvider = { provide: ProviderToken<unknown>; useValue: any };
export type ExistingProvider = { provide: ProviderToken<unknown>; useExisting: ProviderToken<unknown> };
export type FactoryProvider = {
  provide: ProviderToken<unknown>;
  useFactory: (...args: any[]) => any;
  deps?: ProviderToken<unknown>[];
};

export type ProviderConfig = Constructor | ClassProvider | ValueProvider | FactoryProvider | ExistingProvider;
