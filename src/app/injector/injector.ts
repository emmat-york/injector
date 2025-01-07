import 'reflect-metadata';
import {
  Constructor,
  ExistingProvider,
  ExtractProviderTokenType,
  FactoryProvider,
  ProviderConfig,
  ProviderToken,
  UseClassProviderConfig,
} from './injector.interface';
import { getTokenName } from './injector.util';

export class IoCContainer {
  private readonly providers = new Map<ProviderToken<unknown>, ProviderConfig>();
  private readonly resolvers = new Map<ProviderToken<unknown>, unknown>();

  provide(constructor: Constructor): void;
  provide<T extends ProviderToken<unknown>, V extends Constructor>(config: UseClassProviderConfig<T, V>): void;
  provide<T extends ProviderToken<unknown>, V extends ExtractProviderTokenType<T>>(config: {
    provide: T;
    useValue: V;
  }): void;
  provide<T extends ProviderToken<unknown>, V extends ProviderToken<unknown>>(config: {
    provide: T;
    useExisting: V;
  }): void;
  provide<T extends ProviderToken<unknown>, V extends ExtractProviderTokenType<T>>(config: {
    provide: T;
    useFactory: (...args: any[]) => V;
    deps?: ProviderToken<unknown>[];
  }): void;

  provide(config: ProviderConfig): void {
    const providerToken = typeof config === 'function' ? config : config.provide;

    if (this.resolvers.has(providerToken)) {
      this.resolvers.delete(providerToken);
    }

    this.providers.set(providerToken, config);
  }

  get(token: ProviderToken<unknown>): any {
    const resolver = this.resolvers.get(token);

    if (resolver) {
      return resolver;
    } else {
      this.resolve(token);
    }

    return this.resolvers.get(token);
  }

  private resolve(token: ProviderToken<unknown>): void {
    const providerConfig = this.providers.get(token);

    if (!providerConfig) {
      throw new Error(`NullInjectorError: No provider for ${getTokenName(token)}`);
    }

    if (typeof providerConfig === 'function') {
      this.resolvers.set(token, this.createClassInstance(providerConfig));
    } else if ('useClass' in providerConfig) {
      this.resolvers.set(token, this.createClassInstance(providerConfig.useClass));
    } else if ('useValue' in providerConfig) {
      this.resolvers.set(token, providerConfig.useValue);
    } else if ('useFactory' in providerConfig) {
      this.resolveUseFactory(providerConfig);
    } else {
      this.resolveUseExisting(providerConfig);
    }
  }

  private resolveUseFactory(config: FactoryProvider<unknown>): void {
    const depsList = config.deps ?? [];

    if (depsList.length) {
      const resolvedDeps = depsList.map((token) => this.get(token));
      this.resolvers.set(config.provide, config.useFactory(...resolvedDeps));
    } else {
      this.resolvers.set(config.provide, config.useFactory());
    }
  }

  private resolveUseExisting(config: ExistingProvider<unknown>): void {
    const existingProvider = this.resolvers.get(config.useExisting);

    if (!existingProvider) {
      throw new Error(`NullInjectorError: No provider for ${getTokenName(config.useExisting)}!`);
    }

    this.resolvers.set(config.provide, existingProvider);
  }

  private createClassInstance(constructor: Constructor): object {
    const depsList: Constructor[] = Reflect.getMetadata('design:paramtypes', constructor) ?? [];

    const resolvedDeps = depsList.map((dependency) => {
      const provider = this.providers.get(dependency);

      if (provider) {
        return this.createClassInstance(provider as Constructor);
      } else {
        throw new Error(`NullInjectorError: No provider for ${getTokenName(dependency)}!`);
      }
    });

    return new constructor(...resolvedDeps);
  }
}

export const ioCContainer = new IoCContainer();
