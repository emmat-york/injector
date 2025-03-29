import { ProviderConfig, ProviderToken } from './injector.interface';

export const getTokenName = (token: ProviderToken<unknown>): string => {
  return typeof token === 'function' ? token.name : token.uniqueDesc;
};

export const isSingleProvider = (config: ProviderConfig): boolean => {
  return typeof config === 'function' || !('multi' in config) || !config.multi;
};

class IdGenerator {
  private readonly listOfUniqueIds: string[] = [];

  get(): string {
    const createdId = Math.random().toString(36).substring(2);
    const isUnique = !this.listOfUniqueIds.includes(createdId);

    if (isUnique) {
      this.listOfUniqueIds.push(createdId);
      return createdId;
    } else {
      return this.get();
    }
  }
}

export const generator = new IdGenerator();
