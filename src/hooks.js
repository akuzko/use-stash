import { useState, useEffect } from "react";
import { data, actions, subscribe } from "./storage";
import { get } from "./utils";

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
