import 'reflect-metadata';
import {Constructor, ExistingProvider, FactoryProvider, ProviderConfig, ProviderToken} from "./injector.interface";
import {Injectable} from "@angular/core";
import {getTokenName} from "./injector.util";

@Injectable()
export class Injector {
  private readonly providers = new Map<ProviderToken, ProviderConfig>();
  private readonly resolvers = new Map<ProviderToken, unknown>();

  provide(config: ProviderConfig): void {
    if (typeof config === 'function') {
      this.providers.set(config, config);
      return;
    }

    this.providers.set(config.provide, config);
  }

  get(token: ProviderToken): any {
    const resolvedDependency = this.resolvers.get(token);

    if (resolvedDependency) {
      return resolvedDependency;
    } else {
      this.resolve(token);
    }

    return this.resolvers.get(token);
  }

  private resolve(token: ProviderToken): void {
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

    if (depsList.length) { // to do
      const resolvedDeps = depsList.map(token => {
        const provider = this.providers.get(token);

        if (provider) {
          if (typeof token === 'function') {

          }
        } else {
          throw new Error(`NullInjectorError: No provider for ${getTokenName(token)}!`);
        }
      });

      this.resolvers.set(config.provide, config.useFactory(...resolvedDeps));
    } else {
      this.resolvers.set(config.provide, config.useFactory());
    }
  }

  private resolveUseExisting(config: ExistingProvider): void {
    const existingProvider = this.resolvers.get(config.useExisting);

    if (!existingProvider) {
      throw new Error(`NullInjectorError: No provider for ${getTokenName(config.useExisting)}!`);
    }

    this.resolvers.set(config.provide, existingProvider);
  }

  private createClassInstance(constructor: Constructor): object {
    const depsList: Constructor[] = Reflect.getMetadata('design:paramtypes', constructor) ?? [];

    if (depsList.length) {
      const resolvedDeps = depsList.map((token) => {
        const provider = this.providers.get(token);

        if (provider) {
          return this.createClassInstance(provider as Constructor);
        } else {
          throw new Error(`NullInjectorError: No provider for ${token.name}!`);
        }
      });

      return new constructor(...resolvedDeps);
    } else {
      return new constructor();
    }
  }
}
