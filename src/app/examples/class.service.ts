import { Service } from '../injector/injector.decorator';

@Service()
export class DependencyOne {
  readonly description = 'Dependency one';
}

@Service()
export class DependencyTwo {
  readonly description = 'Dependency two';
}

@Service()
export class Parent {
  readonly description = 'Parent';

  constructor(
    readonly dependencyOne: DependencyOne,
    readonly dependencyTwo: DependencyTwo,
  ) {}
}
