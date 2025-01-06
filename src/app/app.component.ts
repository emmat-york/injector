import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Injector} from "./injector/injector";
import {Service} from "./injector/injector.util";

@Service()
export class Child1 {
  readonly child1 = 'Child1';
}

@Service()
class Child2 {
  readonly child2 = 'Child2';
}

@Service()
class Parent {
  readonly class1 = 'class1';

  constructor(private dep1: Child1, private dep2: Child2 ) {}
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private readonly injector: Injector) {
    this.init();
  }

  init(): void {
    this.injector.provide(Parent);
    this.injector.provide(Child1);
    this.injector.provide(Child2);
    console.log(this.injector.get(Parent));
  }
}
