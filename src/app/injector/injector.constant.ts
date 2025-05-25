export class InjectionToken<T = any> {
  readonly uniqueDesc: string;

  constructor(uniqueDesc: string) {
    this.uniqueDesc = uniqueDesc;
  }
}
