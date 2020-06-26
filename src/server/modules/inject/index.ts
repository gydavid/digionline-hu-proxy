class Containers {
  [index: string]: any;
}

class Arguments {
  [index: string]: Array<string>;
}

export class Context {
  private static context: Context = new Context();

  static getContext(): Context {
    return Context.context;
  }

  private container: Containers = new Containers();
  private arguments: Arguments = new Arguments();

  get<T>(t): T {
    if (typeof t == 'function') {
      return this.container[t.prototype.constructor.name];
    }
    return this.container[t];
  }

  set(key: string, value: any): void {
    this.container[key] = value;
  }

  setArg(key: string, index: number, value: string): void {
    if (this.arguments[key] == null) {
      this.arguments[key] = [];
    }
    this.arguments[key][index] = value;
  }

  getArgs(key: string): Array<string> {
    if (this.arguments[key] == null) {
      return [];
    }
    return this.arguments[key];
  }
}

export function Injectable(...args: Array<any>) {
  return injectClass.apply(this, args);
}

export function Inject(...args: Array<any>) {
  return injectParameter.apply(this, args);
}

function injectClass(target: any) {
  function construct(constructor, args) {
    return Reflect.construct(constructor, args);
  }

  var f: any = function (...args) {
    return construct(target, args);
  };
  f.prototype = target.prototype;
  //noinspection JSMismatchedCollectionQueryUpdate
  var args: Array<any> = [];
  Context.getContext()
    .getArgs(target.name)
    .forEach((s) => {
      args.push(Context.getContext().get(s));
    });
  Context.getContext().set(target.name, f(...args));
  return f;
}

function injectParameter(filter: any) {
  return (target: any, key: string, index: number) => {
    var name;
    if (typeof filter === 'string') {
      name = filter;
    } else {
      name = filter.prototype.constructor.name;
    }
    if (typeof target === 'function') {
      Context.getContext().setArg(target.name, index, name);
    } else {
      target[key] = Context.getContext().get(name);
    }
  };
}
