import { InjectionToken } from './injector.constant';

export type Constructor = { new (...args: any[]): object };

export type ProviderToken<T> = Constructor | InjectionToken<T>;

export type ClassProvider = { provide: ProviderToken<unknown>; useClass: Constructor; multi?: boolean };
export type ValueProvider = { provide: ProviderToken<unknown>; useValue: any; multi?: boolean };

export type ExistingProvider = {
  provide: ProviderToken<unknown>;
  useExisting: ProviderToken<unknown>;
  multi?: boolean;
};

export type FactoryProvider = {
  provide: ProviderToken<unknown>;
  useFactory: (...args: any[]) => any;
  deps?: ProviderToken<unknown>[];
  multi?: boolean;
};

export type ProviderConfig = Constructor | ClassProvider | ValueProvider | FactoryProvider | ExistingProvider;

export type ExtractOutputValue<T extends ProviderToken<unknown>> = T extends Constructor
  ? InstanceType<T>
  : T extends InjectionToken<infer U>
    ? U
    : unknown;
