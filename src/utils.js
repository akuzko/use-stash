export function get(obj, path) {
  if (!path) return obj;

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
