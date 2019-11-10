import { useState, useMemo, useEffect, useRef } from "react";
import Storage from "./Storage";

export function useData(path) {
  const handlerIndexRef = useRef(null);
  const [storage, nsPath] = useMemo(() => Storage.resolve(path), [path]);
  const actual = storage.get(nsPath);
  const [data, setData] = useState(actual);

  useEffect(() => {
    if (data !== actual) {
      setData(actual);
    }

    return storage.subscribe(nsPath, setData, handlerIndexRef);
  }, [storage, nsPath]);

  return actual;
}

export function useActions(ns) {
  return Storage.instance(ns).actions;
}

export function useStash(ns) {
  return [useData(ns), useActions(ns)];
}
