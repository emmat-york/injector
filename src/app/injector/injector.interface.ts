import {InjectionToken} from "./injector.constant";

export type Constructor = { new (...args: any[]): object };

export type ProviderToken = Constructor | InjectionToken<unknown>;
export type ClassProvider = { provide: ProviderToken; useClass: Constructor; };
export type ValueProvider = { provide: ProviderToken; useValue: unknown; };
export type ExistingProvider = { provide: ProviderToken; useExisting: ProviderToken; };
export type FactoryProvider = {
  provide: ProviderToken;
  useFactory: (...args: any[]) => unknown;
  deps?: ProviderToken[];
};

export type ProviderConfig = Constructor | ClassProvider | ValueProvider | FactoryProvider | ExistingProvider;
