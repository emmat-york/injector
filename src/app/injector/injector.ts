import { Constructor, InjectorConfig, ProviderConfig, ProviderToken } from './injector.interface';
import { getTokenName, isSingleProvider } from './injector.util';

export class Injector {
  // A storage for provider configurations. Each entry associates a token (provider identifier)
  // with a configuration that describes how to create or supply a value for this token.
  private readonly providers = new Map<ProviderToken<unknown>, ProviderConfig | ProviderConfig[]>();

  // A cache for already resolved dependencies. Once a dependency is resolved for a specific token,
  // its value is stored here to avoid repeating the creation process.
  private readonly resolvers = new Map<ProviderToken<unknown>, unknown>();

  // Parent injector
  private readonly parent?: Injector;
  // Name of the Injector
  private readonly name?: string;

  constructor(config?: InjectorConfig) {
    this.parent = config?.parent;
    this.name = config?.name;
  }

  static create(config?: { providers?: ProviderConfig[]; parent?: Injector; name?: string }): Injector {
    const injector = new Injector({ parent: config?.parent, name: config?.name });

    if (config?.providers && config.providers.length) {
      for (const provider of config.providers) {
        injector.provide(provider);
      }
    }

    return injector;
  }

  /**
   * @description A method to retrieve a resolved dependency by its token. If the dependency is already resolved,
   * it returns the cached value from resolvers. Otherwise, it initiates the resolution process.
   * @param token The token representing the required dependency.
   * @return The resolved dependency.
   **/
  get(token: ProviderToken<unknown>): any {
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

  private provide(config: ProviderConfig): void {
    const providerToken = typeof config === 'function' ? config : config.provide;

    if (isSingleProvider(config)) {
      // If config is a class, or config does not have a "multi" field, or it is false.
      this.providers.set(providerToken, config);
    } else {
      // Multi-provider:
      // 1. config has "multi: true";
      // 2. Need to be combined with other multi-providers by the same token.
      const existing = this.providers.get(providerToken);

      if (Array.isArray(existing)) {
        // If there is already an array of providers, just add a new one
        existing.push(config);
      } else if (existing) {
        // If there is already one regular provider (not an array),
        // turn it into an array + add a new one
        this.providers.set(providerToken, [existing, config]);
      } else {
        // There is no provider yet - create an array of one element
        this.providers.set(providerToken, [config]);
      }
    }

    // Clear the resolvers cache for this token so that the next get() dependency is recreated with the new data
    if (this.resolvers.has(providerToken)) {
      this.resolvers.delete(providerToken);
    }
  }

  /**
   * @description A method for resolving a dependency by its token.
   * Determines how to create a value for the token based on its configuration.
   * @param token The token representing the dependency.
   * @exception NullInjectorError if no provider is found for the token.
   **/
  private resolve(token: ProviderToken<unknown>): void {
    const providerConfig = this.providers.get(token);

    if (!providerConfig) {
      throw new Error(
        `NullInjectorError: No provider for ${getTokenName(token)}. ` + this.name ? `Injector: ${this.name}` : '',
      );
    }

    if (Array.isArray(providerConfig)) {
      const resolved = providerConfig.map((config) => this.getResolvedSingleProvider(config));
      this.resolvers.set(token, resolved);
    } else {
      this.resolvers.set(token, this.getResolvedSingleProvider(providerConfig));
    }
  }

  private getResolvedSingleProvider(providerConfig: ProviderConfig): any {
    if (typeof providerConfig === 'function') {
      return this.createClassInstance(providerConfig);
    } else if ('useClass' in providerConfig) {
      return this.createClassInstance(providerConfig.useClass);
    } else if ('useValue' in providerConfig) {
      return providerConfig.useValue;
    } else if ('useFactory' in providerConfig) {
      const depsList = providerConfig.deps ?? [];
      const resolvedDeps = depsList.map((token) => this.get(token));

      return providerConfig.useFactory(...resolvedDeps);
    } else {
      return this.get(providerConfig.useExisting);
    }
  }

  /**
   * @description Creates an instance of a dependency by resolving its constructor dependencies.
   * Uses `Reflect.getMetadata` to retrieve the list of dependencies defined in the constructor
   * and recursively resolves each dependency.
   * @param constructor The class constructor representing the dependency to be instantiated.
   * @return An instance of the provided constructor with all its dependencies resolved.
   **/
  private createClassInstance(constructor: Constructor): object {
    const depsList: Constructor[] = Reflect.getMetadata('design:paramtypes', constructor) ?? [];
    const resolvedDeps = depsList.map((dependency) => this.get(dependency));

    return new constructor(...resolvedDeps);
  }
}
