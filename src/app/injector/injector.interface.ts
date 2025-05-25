import { InjectionToken } from './injector.constant';
import { Injector } from './injector';

export type Constructor<T = any> = new (...args: any[]) => T;

export type ProviderToken<T> = Constructor | InjectionToken<T>;

export interface ClassProvider {
  provide: ProviderToken<unknown>;
  useClass: Constructor;
  multi?: boolean;
}

export interface ValueProvider {
  provide: ProviderToken<unknown>;
  useValue: any;
  multi?: boolean;
}

export interface ExistingProvider {
  provide: ProviderToken<unknown>;
  useExisting: ProviderToken<unknown>;
  multi?: boolean;
}

export interface FactoryProvider {
  provide: ProviderToken<unknown>;
  useFactory: (...args: any[]) => any;
  deps?: ProviderToken<unknown>[];
  multi?: boolean;
}

export type ProviderConfig = Constructor | ClassProvider | ValueProvider | FactoryProvider | ExistingProvider;

export interface CreateInjectorConfig {
  providers: ProviderConfig[];
  parent?: Injector;
  name?: string;
}

export type ExtractOutputValue<T extends ProviderToken<unknown>> = T extends Constructor
  ? InstanceType<T>
  : T extends InjectionToken<infer U>
    ? U
    : unknown;
