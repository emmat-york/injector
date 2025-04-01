import { Constructor, ProviderConfig, ProviderToken } from './injector.interface';
import { getTokenName, isSingleProvider } from './injector.util';

export class Injector {
  // A storage for provider configurations. Each entry associates a token with a
  // configuration that describes how to create or supply a value for this token.
  private readonly registeredProviders = new Map<ProviderToken<unknown>, ProviderConfig | ProviderConfig[]>();

  // A cache for already resolved dependencies. Once a dependency is resolved for a specific token,
  // its value is stored here to avoid repeating the creation process.
  private readonly resolvers = new Map<ProviderToken<unknown>, unknown>();

  // Parent injector.
  private readonly parent?: Injector;

  // Unique injector name is used for debugging and diagnostics showing in which injector the error occurred.
  private readonly name?: string;

  constructor(config?: { parent?: Injector; name?: string }) {
    this.parent = config?.parent;
    this.name = config?.name;
  }

  static create(config?: { providers?: ProviderConfig[]; parent?: Injector; name?: string }): Injector {
    const injector = new Injector({ parent: config?.parent, name: config?.name });

    if (config?.providers && config.providers.length) {
      for (const providerConfig of config.providers) {
        injector.provide(providerConfig);
      }
    }

    return injector;
  }

  // Method to retrieve a resolved dependency by its token. If the dependency is already resolved,
  // it returns the cached value from resolvers. Otherwise, it initiates the resolution process.
  get(token: ProviderToken<unknown>): any {
    const providerConfig = this.registeredProviders.get(token);
    const resolver = this.resolvers.get(token);

    if (!providerConfig && this.parent) {
      return this.parent.get(token);
    }

    if (resolver) {
      return resolver;
    } else {
      this.resolve(token);
    }

    return this.resolvers.get(token);
  }

  private provide(providerConfig: ProviderConfig): void {
    const token = typeof providerConfig === 'function' ? providerConfig : providerConfig.provide;

    if (isSingleProvider(providerConfig)) {
      // If config is:
      // 1. a class (constructor);
      // 2. config does not have a "multi" field;
      // 3. "multi" field is false.
      this.registeredProviders.set(token, providerConfig);
    } else {
      // Multi-provider:
      // 1. config has "multi: true";
      // 2. Need to be combined with other multi-providers by the same token.
      const existingProviderConfig = this.registeredProviders.get(token);

      if (Array.isArray(existingProviderConfig)) {
        // If there is already an array of providers, just add a new one.
        existingProviderConfig.push(providerConfig);
      } else if (existingProviderConfig) {
        // If there is already one regular provider (not an array), turn it into an array + add a new one.
        this.registeredProviders.set(token, [existingProviderConfig, providerConfig]);
      } else {
        // There is no provider yet - create an array of one element.
        this.registeredProviders.set(token, [providerConfig]);
      }
    }

    // Clear the resolvers cache for this token so that the next get() dependency is recreated with the new data.
    if (this.resolvers.has(token)) {
      this.resolvers.delete(token);
    }
  }

  // Method for resolving a dependency by its token. Determines how to create a value for the token based on its configuration.
  private resolve(token: ProviderToken<unknown>): void {
    const providerConfig = this.registeredProviders.get(token);

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

  // Creates an instance of a dependency by resolving its constructor dependencies.
  // Uses `Reflect.getMetadata` to retrieve the list of dependencies defined in the constructor
  // and recursively resolves each dependency.
  private createClassInstance(constructor: Constructor): object {
    const depsList: Constructor[] = Reflect.getMetadata('design:paramtypes', constructor) ?? [];
    const resolvedDeps = depsList.map((dependency) => this.get(dependency));

    return new constructor(...resolvedDeps);
  }
}
