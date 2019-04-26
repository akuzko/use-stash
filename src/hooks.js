import { useState, useEffect } from "react";

const data = {};
const actions = {};
const listeners = {};

function action(ns, name, fn) {
  actions[ns][name] = fn;
}

function reduce(ns, fn) {
  withNotification(ns, () => {
    data[ns] = fn(data[ns]);
  });
}

function get(obj, path) {
  path = path.split(".");
  let current = obj;
  for (let i = 0; i < path.length; i++) {
    if (current) {
      current = current[path[i]];
    } else {
      return current;
    }
  }
  return current;
}

function subscribe(path, handler) {
  if (!(path in listeners)) {
    listeners[path] = [];
  }
  listeners[path].push(handler);

  return function() {
    const index = listeners[path].indexOf(handler);

    listeners[path].splice(index, 1);
  };
}

function withNotification(ns, cb) {
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

export function defineActions(ns, initial, setup) {
  data[ns] = initial;
  actions[ns] = {};
  listeners[ns] = [];
  setup(action.bind(null, ns), reduce.bind(null, ns));
}

export function useData(path) {
  const [nsData, setNsData] = useState(get(data, path));

  useEffect(() => subscribe(path, dt => setNsData(dt)), []);

  return nsData;
}

export function useActions(ns) {
  return actions[ns];
}

export function useDataActions(ns) {
  return [useData(ns), useActions(ns)];
}
