import { useState, useMemo, useEffect, useRef } from "react";
import Storage from "./Storage";

const identity = obj => obj;

export function useData(path, mapper = identity, toCompare = identity) {
  const handlerIndexRef = useRef(null);
  const [storage, nsPath] = useMemo(() => Storage.resolve(path), [path]);
  const storageData = storage.get(nsPath);
  const actual = useMemo(() => mapper(storageData), [storageData]);
  const compare = toCompare(actual);
  const [data, setData] = useState(actual);

  useEffect(() => {
    return () => {
      handlerIndexRef.current = -1;
    };
  }, []);

  useEffect(() => {
    if (toCompare(data) !== toCompare(actual)) {
      setData(actual);
    }

    const handler = (value) => {
      const nextActual = mapper(value);
      const nextCompare = toCompare(nextActual);

      if (nextCompare !== compare) {
        setData(nextActual);
      }
    };

    handler.__indexRef = handlerIndexRef;

    return storage.subscribe(nsPath, handler);
  }, [storage, nsPath, compare]);

  return actual;
}

export function useActions(ns) {
  return Storage.instance(ns).actions;
}

export function useStash(ns) {
  return [useData(ns), useActions(ns)];
}
