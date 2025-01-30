import 'reflect-metadata';
import {
  Constructor,
  ExistingProvider,
  FactoryProvider,
  InjectorConfig,
  ProviderConfig,
  ProviderToken,
} from './injector.interface';
import { getTokenName } from './injector.util';

export class Injector {
  /**
   * @description A storage for provider configurations.
   * Each entry associates a token (provider identifier)
   * with a configuration that describes how to create
   * or supply a value for this token.
   **/
  private readonly providers = new Map<ProviderToken<unknown>, ProviderConfig>();

  /**
   * @description A cache for already resolved dependencies.
   * Once a dependency is resolved for a specific token,
   * its value is stored here to avoid repeating the creation process.
   **/
  private readonly resolvers = new Map<ProviderToken<unknown>, unknown>();
  private readonly parent?: Injector;

  constructor(config?: InjectorConfig) {
    this.parent = config?.parent;
  }

  provide(constructor: Constructor): void;
  provide<T extends ProviderToken<unknown>, V extends Constructor>(config: { provide: T; useClass: V }): void;
  provide<T extends ProviderToken<unknown>, V>(config: { provide: T; useValue: V }): void;
  provide<T, V>(config: { provide: ProviderToken<T>; useExisting: ProviderToken<V> }): void;
  provide<T, V>(config: {
    provide: ProviderToken<T>;
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

  /**
   * @description A method to retrieve a resolved dependency by its token.
   * If the dependency is already resolved, it returns the cached value from resolvers.
   * Otherwise, it initiates the resolution process.
   * @param token The token representing the required dependency.
   * @return The resolved dependency.
   **/
  get(token: ProviderToken<unknown>): unknown {
    const provider = this.providers.get(token);
    const resolver = this.resolvers.get(token);

    if (!provider && this.parent) {
      return this.parent.get(token);
    }

    if (resolver) {
      return resolver;
    } else {
      this.resolve(token);
    }

    return this.resolvers.get(token);
  }

  /**
   * @description: A method for resolving a dependency by its token.
   * Determines how to create a value for the token based on its configuration.
   * @param token The token representing the dependency.
   * @exception NullInjectorError if no provider is found for the token.
   **/
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

  private resolveUseFactory(config: FactoryProvider): void {
    const depsList = config.deps ?? [];
    const resolvedDeps = depsList.map((token) => this.get(token));
    this.resolvers.set(config.provide, config.useFactory(...resolvedDeps));
  }

  private resolveUseExisting(config: ExistingProvider): void {
    const existingProvider = this.resolvers.get(config.useExisting);

    if (!existingProvider) {
      throw new Error(`NullInjectorError: No provider for ${getTokenName(config.useExisting)}!`);
    }

    this.resolvers.set(config.provide, existingProvider);
  }

  /**
   * @description Creates an instance of a dependency by resolving its constructor dependencies.
   * Uses `Reflect.getMetadata` to retrieve the list of dependencies defined in the constructor
   * and recursively resolves each dependency.
   * @param constructor The class constructor representing the dependency to be instantiated.
   * @return An instance of the provided constructor with all its dependencies resolved.
   * @exception NullInjectorError if no provider is found for the token.
   **/
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

export const injector = new Injector();
