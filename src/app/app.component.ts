import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InjectionToken } from './injector/injector.constant';
import { Service } from './injector/injector.decorator';
import { Injector } from './injector/injector';

@Service()
export class DependencyOne {
  readonly description = 'Dependency one';
}

@Service()
class DependencyTwo {
  readonly description = 'Dependency two';
}

@Service()
class Parent {
  readonly description = 'Parent';

  constructor(
    readonly dependencyOne: DependencyOne,
    readonly dependencyTwo: DependencyTwo,
  ) {}
}

const CLASS_TOKEN = new InjectionToken<Parent>('CLASS_TOKEN');
const VALUE_TOKEN = new InjectionToken<number>('VALUE_TOKEN');
const FACTORY_TOKEN = new InjectionToken<string>('FACTORY_TOKEN');
const EXISTING_TOKEN = new InjectionToken<number>('EXISTING_TOKEN');

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
        DependencyOne,
        DependencyTwo,
        { provide: CLASS_TOKEN, useClass: Parent },
        { provide: VALUE_TOKEN, useValue: 20, multi: true },
        { provide: EXISTING_TOKEN, useExisting: VALUE_TOKEN },
      ],
      parent: Injector.create({
        providers: [
          DependencyTwo,
          {
            provide: FACTORY_TOKEN,
            useFactory: (dependencyTwo: DependencyTwo) => dependencyTwo.description,
            deps: [DependencyTwo],
          },
        ],
        name: 'parentInjector',
      }),
      name: 'appComponentInjector',
    });

    console.log(
      injector.get(DependencyTwo), // instance of DependencyTwo class
      injector.get(CLASS_TOKEN), // instance of Parent class
      injector.get(VALUE_TOKEN), // [10, 20]
      injector.get(FACTORY_TOKEN), // 'Child 2'
      injector.get(EXISTING_TOKEN), // [10, 20]
    );
  }
}
