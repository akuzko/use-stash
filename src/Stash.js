import { data, actions, listeners, withNotification } from "./storage";
import { get } from "./utils";

export default class Stash {
  constructor(ns) {
    this.namespace = ns;

    this.init = this.init.bind(this);
    this.defAction = this.defAction.bind(this);
    this.get = this.get.bind(this);
    this.get.global = function(path) {
      return get(data, path);
    }
    this.reduce = this.reduce.bind(this);
    this.reduce.global = function(ns, fn) {
      withNotification(ns, () => {
        data[ns] = fn(data[ns]);
      });
    }
  }

  ns(ns) {
    return new Stash(ns);
  }

  reset() {
    actions[this.namespace] = {};
    listeners[this.namespace] = [];
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

  reduce(fn) {
    withNotification(this.namespace, () => {
      data[this.namespace] = fn(data[this.namespace]);
    });
  }

  callAction(name, ...args) {
    return actions[this.namespace][name](...args);
  }
}
