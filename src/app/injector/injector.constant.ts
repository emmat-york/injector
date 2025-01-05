export class InjectionToken<T> {
  readonly token: string;

  constructor(token: string) {
    this.token = token;
  }
}
