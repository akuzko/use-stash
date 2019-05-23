import get from "get-lookup";

export const data = {};
export const actions = {};
export const listeners = {};
export const mixins = {global: []};

export function withNotification(ns, cb) {
  const old = {};
  const paths = [];

  for (const path in listeners) {
    if (path.startsWith(ns)) {
      paths.push(path);
      old[path] = get(data, path);
    }
  }

  cb();

  paths.forEach((path) => {
    const value = get(data, path);

    if (old[path] !== value) {
      listeners[path].forEach(fn => fn(value));
    }
  });
}

export function subscribe(path, handler) {
  if (!(path in listeners)) {
    listeners[path] = [];
  }
  listeners[path].push(handler);

  return function() {
    const index = listeners[path].indexOf(handler);

    listeners[path].splice(index, 1);

    if (!listeners[path].length) {
      delete listeners[path];
    }
  };
}
