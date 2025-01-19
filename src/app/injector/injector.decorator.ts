import { Constructor } from './injector.interface';
import { generator } from './injector.util';

export function Service(): Function {
  return (constructor: Constructor) => {
    return class extends constructor {
      readonly id = generator.get();

      constructor(...args: any[]) {
        super(...args);
      }
    };
  };
}
