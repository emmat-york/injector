export class InjectionToken<T> {
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}
