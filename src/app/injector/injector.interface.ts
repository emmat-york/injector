import { InjectionToken } from './injector.constant';

export type Constructor = { new (...args: any[]): object };

/**
 * Provider types
 **/
export type ProviderToken<T> = Constructor | InjectionToken<T>;
export type ClassProvider<T> = { provide: ProviderToken<T>; useClass: Constructor };
export type ValueProvider<T> = { provide: ProviderToken<T>; useValue: T };
export type ExistingProvider<T> = { provide: ProviderToken<T>; useExisting: ProviderToken<T> };
export type FactoryProvider<T> = {
  provide: ProviderToken<T>;
  useFactory: (...args: any[]) => T;
  deps?: ProviderToken<T>[];
};

export type ProviderConfig =
  | Constructor
  | ClassProvider<unknown>
  | ValueProvider<unknown>
  | FactoryProvider<unknown>
  | ExistingProvider<unknown>;

/**
 * Provider config utility types
 **/
export type ExtractProviderTokenType<T extends ProviderToken<unknown>> =
  T extends InjectionToken<infer U> ? U : unknown;

export type UseClassProviderConfig<T, V> = T extends Constructor
  ? { provide: T; useClass: V }
  : T extends InjectionToken<infer R>
    ? R extends Constructor
      ? { provide: T; useClass: R }
      : never
    : never;
