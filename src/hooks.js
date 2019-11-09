import { useState, useMemo, useEffect } from "react";
import Storage from "./Storage";

export function useData(path) {
  const [storage, nsPath] = useMemo(() => Storage.resolve(path), [path]);
  const actual = storage.get(nsPath);
  const [item, setItem] = useState(actual);

  useEffect(() => {
    if (item !== actual) {
      setItem(actual);
    }

    return storage.subscribe(nsPath, setItem);
  }, [storage, nsPath]);

  return actual;
}

export function useActions(ns) {
  return Storage.instance(ns).actions;
}

export function useStash(ns) {
  return [useData(ns), useActions(ns)];
}
