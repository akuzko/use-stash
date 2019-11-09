import get from "get-lookup";

export const mixins = {global: []};

export default class Storage {
  static instance(ns) {
    if (!(ns in Storage.all)) {
      Storage.all[ns] = new Storage();
    }

    return Storage.all[ns];
  }

  static resolve(path) {
    // eslint-disable-next-line no-unused-vars
    const [_m, ns, nsPath] = path.match(/^([^.]+)\.?(.+)?$/);

    return [this.instance(ns), nsPath];
  }

  static reset(ns) {
    delete Storage.all[ns];

    mixins[ns] = [...mixins.global];
  }

  constructor() {
    this.actions = {};
    this.listeners = [];
  }

  get(path) {
    if (!path) return this.data;

    return get(this.data, path);
  }

  subscribe(path, handler) {
    handler.__stashPath = path;
    this.listeners.push(handler);

    return () => {
      const index = this.listeners.indexOf(handler);

      this.listeners.splice(index, 1);
    };
  }

  withNotification(cb) {
    const old = {};

    this.listeners.forEach((handler) => {
      if (!(handler.__stashPath in old)) {
        old[handler.__stashPath] = get(this.data, handler.__stashPath);
      }
    });

    cb();

    this.listeners.forEach((handler) => {
      const value = get(this.data, handler.__stashPath);

      if (old[handler.__stashPath] !== value) {
        handler(value);
      }
    });
  }
}

Storage.all = {};
