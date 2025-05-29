import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Injector } from './injector/injector';
import { DependencyOne, DependencyTwo, Parent } from './examples/class.service';
import { CLASS_TOKEN, EXISTING_TOKEN, FACTORY_TOKEN, VALUE_TOKEN } from './examples/injection-token.constant';

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

  private init(): void {
    const injector = Injector.create({
      providers: [
        DependencyOne,
        DependencyTwo,
        { provide: CLASS_TOKEN, useClass: Parent },
        { provide: VALUE_TOKEN, useValue: 10, multi: true },
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
      injector.get(CLASS_TOKEN), // instance of Parent class
      injector.get(VALUE_TOKEN), // [10, 20]
      injector.get(FACTORY_TOKEN), // 'Dependency two'
      injector.get(EXISTING_TOKEN), // [10, 20]
    );
  }
}
