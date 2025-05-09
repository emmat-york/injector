import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InjectionToken } from './injector/injector.constant';
import { Service } from './injector/injector.decorator';
import { Injector } from './injector/injector';

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

  constructor(public readonly dep3: Child3) {}
}

@Service()
class Parent {
  readonly parent = 'Parent';

  constructor(
    public readonly dep1: Child1,
    public readonly dep2: Child2,
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
  constructor() {
    this.init();
  }

  init(): void {
    const injector = Injector.create({
      providers: [
        Child1,
        Child2,
        Child3,
        { provide: CLASS_TOKEN, useClass: Parent },
        { provide: VALUE_TOKEN, useValue: 10, multi: true },
        { provide: VALUE_TOKEN, useValue: 20, multi: true },
        { provide: EXISTING_TOKEN, useExisting: VALUE_TOKEN },
      ],
      parent: Injector.create({
        providers: [
          Child3,
          {
            provide: FACTORY_TOKEN,
            useFactory: (child3resolver: Child3) => child3resolver.child3,
            deps: [Child3],
          },
        ],
      }),
      name: 'appComponentInjector',
    });

    console.log(
      injector.get(Child2), // instance of Child2 class
      injector.get(CLASS_TOKEN), // instance of Parent class
      injector.get(VALUE_TOKEN), // [10, 20]
      injector.get(FACTORY_TOKEN), // 'Child-3'
      injector.get(EXISTING_TOKEN), // [10, 20]
    );
  }
}
