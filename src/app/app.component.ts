import {Component} from '@angular/core';
import {Injector} from "./injector/injector";
import {Service} from "./injector/injector.util";

@Service()
class Class2 {
  readonly class2 = 'class2';
}

@Service()
class Class1 {
  readonly class1 = 'class1';

  constructor(private dep: Class2) {}
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
})
export class AppComponent {
  constructor(private readonly customInjector: Injector) {
    this.init();
  }

  init(): void {
    this.customInjector.provide(Class1);
    this.customInjector.provide(Class2);
    console.log(this.customInjector.get(Class1));
  }
}
