import { useState, useEffect } from "react";
import get from "get-lookup";
import { data, actions, subscribe } from "./storage";

export function useData(path, getter) {
  const item = get(data, path);
  const [nsData, setNsData] = useState(getter ? getter(item) : item);

  useEffect(() => subscribe(path, dt => setNsData(getter ? getter(dt) : dt)), []);

  return nsData;
}

export function useActions(ns) {
  return actions[ns];
}

export function useStash(ns) {
  return [useData(ns), useActions(ns)];
}
