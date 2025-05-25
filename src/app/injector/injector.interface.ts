import { InjectionToken } from './injector.constant';
import { Injector } from './injector';

export type Constructor<T = any> = new (...args: any[]) => T;

export type ProviderToken<T = any> = Constructor | InjectionToken<T>;

export type ProviderConfig =
  | Constructor
  | { provide: InjectionToken; useClass: Constructor; multi?: boolean }
  | { provide: InjectionToken; useValue: any; multi?: boolean }
  | { provide: InjectionToken; useExisting: InjectionToken; multi?: boolean }
  | {
      provide: ProviderToken;
      useFactory: (...args: any[]) => any;
      deps?: ProviderToken<unknown>[];
      multi?: boolean;
    };

export interface CreateInjectorConfig {
  providers: ProviderConfig[];
  parent?: Injector;
  name?: string;
}

export type ExtractOutputValue<T extends ProviderToken> = T extends Constructor
  ? InstanceType<T>
  : T extends InjectionToken<infer U>
    ? U
    : unknown;
