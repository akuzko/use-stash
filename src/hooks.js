import { useState, useEffect } from "react";

const data = {};
const actions = {};
const listeners = {};

function action(ns, name, fn) {
  actions[ns][name] = fn;
}

function reduce(ns, fn) {
  data[ns] = fn(data[ns]);

  notifyListeners(ns);
}

function subscribe(ns, handler) {
  listeners[ns].push(handler);

  return function() {
    const index = listeners[ns].indexOf(handler);

    listeners[ns].splice(index, 1);
  };
}

function notifyListeners(ns) {
  listeners[ns].forEach(fn => fn(data[ns]));
}

export function defineActions(ns, initial, setup) {
  data[ns] = initial;
  actions[ns] = {};
  listeners[ns] = [];
  setup(action.bind(null, ns), reduce.bind(null, ns));
}

export function useData(ns) {
  const [nsData, setNsData] = useState(data[ns]);

  useEffect(() => subscribe(ns, dt => setNsData(dt)), []);

  return nsData;
}

export function useActions(ns) {
  return actions[ns];
}

export function useDataActions(ns) {
  return [useData(ns), useActions(ns)];
}
