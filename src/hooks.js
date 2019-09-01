import { useState, useEffect } from "react";
import get from "get-lookup";
import { data, actions, subscribe } from "./storage";

export function useData(path) {
  const actual = get(data, path);
  const [item, setItem] = useState(actual);

  useEffect(() => {
    if (item !== actual) {
      setItem(actual);
    }

    return subscribe(path, setItem);
  }, [path]);

  return actual;
}

export function useActions(ns) {
  return actions[ns];
}

export function useStash(ns) {
  return [useData(ns), useActions(ns)];
}
