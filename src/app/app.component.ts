import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injector } from './injector/injector';
import { InjectionToken } from './injector/injector.constant';
import { Service } from './injector/injector.decorator';

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

const CLASS_TOKEN = new InjectionToken<Parent>('CLASS_TOKEN');
const VALUE_TOKEN = new InjectionToken<number>('VALUE_TOKEN');
const FACTORY_TOKEN = new InjectionToken<string>('FACTORY_TOKEN');
const EXISTING_TOKEN = new InjectionToken<Child3>('EXISTING_TOKEN');

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly injector = injector;

  constructor() {
    this.init();
  }

  init(): void {
    this.injector.provide(Child1);
    this.injector.provide(Child2);
    this.injector.provide(Child3);
    this.injector.provide({ provide: CLASS_TOKEN, useClass: Parent });
    this.injector.provide({ provide: VALUE_TOKEN, useValue: 20 });
    this.injector.provide({
      provide: FACTORY_TOKEN,
      useFactory: (child3resolver: Child3) => child3resolver.child3,
      deps: [Child3],
    });

    this.injector.provide({ provide: EXISTING_TOKEN, useExisting: VALUE_TOKEN });

    console.log(
      this.injector.get(CLASS_TOKEN), // instance of Parent class
      this.injector.get(VALUE_TOKEN), // 20
      this.injector.get(FACTORY_TOKEN), // 'Child-3'
      this.injector.get(EXISTING_TOKEN), // 20
    );
  }
}
