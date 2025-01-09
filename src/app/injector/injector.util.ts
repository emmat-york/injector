import { ProviderToken } from './injector.interface';

export function Service(): ClassDecorator {
  return (target: object) => {};
}

export const getTokenName = (token: ProviderToken<unknown>): string => {
  return typeof token === 'function' ? token.name : token.uniqueDesc;
};
