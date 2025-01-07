import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ioCContainer } from './injector/injector';
import { Service } from './injector/injector.util';
import { InjectionToken } from './injector/injector.constant';

@Service()
export class Child1 {
  readonly child1 = 'Child-1';
}

@Service()
class Child3 {
  readonly child3 = 'Child-3';
}

@Service()
class Child2 {
  readonly child2 = 'Child-2';

  constructor(private dep3: Child3) {}
}

@Service()
class Parent {
  readonly parent = 'Parent';

  constructor(
    private dep1: Child1,
    private dep2: Child2,
  ) {}
}

const classToken = new InjectionToken<typeof Parent>('classToken');
const valueToken = new InjectionToken<number>('valueToken');
const factoryToken = new InjectionToken<string>('factoryToken');

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly injector = ioCContainer;

  constructor() {
    this.init();
  }

  init(): void {
    this.injector.provide(Child1);
    this.injector.provide(Child2);
    this.injector.provide(Child3);
    this.injector.provide({ provide: classToken, useClass: Parent });
    this.injector.provide({ provide: valueToken, useValue: 20 });
    this.injector.provide({
      provide: factoryToken,
      useFactory: (child3resolver: Child3) => child3resolver.child3,
      deps: [Child3],
    });

    console.log(this.injector.get(classToken), this.injector.get(valueToken), this.injector.get(factoryToken));
  }
}
