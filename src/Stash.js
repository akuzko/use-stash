import get from "get-lookup";
import { data, actions, listeners, mixins, withNotification } from "./storage";

export default class Stash {
  constructor(ns) {
    this.namespace = ns;

    this.init = this.init.bind(this);
    this.defAction = this.defAction.bind(this);
    this.callAction = this.callAction.bind(this);
    this.get = this.get.bind(this);
    this.reduce = this.reduce.bind(this);
    this.mixin = this.mixin.bind(this);
    this.mixout = this.mixout.bind(this);

    (ns in mixins ? mixins[ns] : mixins.global).forEach(([fn, args]) => this._applyMixin(fn, args));
  }

  ns(ns) {
    return new Stash(ns);
  }

  reset() {
    actions[this.namespace] = {};
    listeners[this.namespace] = [];
    mixins[this.namespace] = [...mixins.global];
  }

  mixin(fn, ...args) {
    const index = mixins[this.namespace].findIndex(([mixinFn]) => mixinFn === fn);

    if (index > -1) {
      mixins[this.namespace][index][1] = args;

      return new Stash(this.namespace);
    } else {
      mixins[this.namespace].push([fn, args]);
      this._applyMixin(fn, args);

      return this;
    }
  }

  mixout(fn) {
    const index = mixins[this.namespace].findIndex(([mixinFn]) => mixinFn === fn);

    mixins[this.namespace].splice(index, 1);

    return new Stash(this.namespace);
  }

  _applyMixin(fn, args) {
    const props = fn(this, ...args);

    for (const name in props) {
      this[name] = props[name].bind(this);
    }
  }

  init(initial) {
    data[this.namespace] = initial;
  }

  defAction(name, fn) {
    actions[this.namespace][name] = fn;
  }

  get(path) {
    if (!path) return data[this.namespace];

    return get(data[this.namespace], path);
  }

  // small hook in arguments to allow passing optional "descriptor" parameter as
  // first argument. this is used, for instance, in `logger` mixin supplied
  // with package, that can (and should) be avoided in production env.
  reduce(descriptor, fn) {
    fn = fn || descriptor;

    withNotification(this.namespace, () => {
      data[this.namespace] = fn(data[this.namespace]);
    });
  }

  callAction(name, ...args) {
    return actions[this.namespace][name](...args);
  }
}
