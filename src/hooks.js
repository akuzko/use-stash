import { useState, useMemo, useEffect, useRef } from "react";
import Storage from "./Storage";

const identity = obj => obj;
const areSame = (a, b) => a === b;

export function useData(path, mapper = identity, areEqual = areSame) {
  const handlerIndexRef = useRef(null);
  const [storage, nsPath] = useMemo(() => Storage.resolve(path), [path]);
  const storageData = storage.get(nsPath);
  const actual = useMemo(() => mapper(storageData), [storageData]);
  const [data, setData] = useState(actual);

  useEffect(() => {
    return () => {
      handlerIndexRef.current = -1;
    };
  }, []);

  useEffect(() => {
    if (!areEqual(data, actual)) {
      setData(actual);
    }

    const handler = (value) => {
      const nextActual = mapper(value);

      if (!areEqual(nextActual, actual)) {
        setData(nextActual);
      }
    };

    handler.__indexRef = handlerIndexRef;

    return storage.subscribe(nsPath, handler);
  }, [storage, nsPath, actual]);

  return actual;
}

export function useActions(ns) {
  return Storage.instance(ns).actions;
}

export function useStash(ns) {
  return [useData(ns), useActions(ns)];
}
