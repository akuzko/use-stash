import Stash from "./Stash";
import { mixins } from "./storage";

export function mixin(fn, ...args) {
  const index = mixins.global.findIndex(([mixinFn]) => mixinFn === fn);

  if (index > -1) {
    mixins.global[index][1] = args;
  } else {
    mixins.global.push([fn, args]);
  }
}

export function mixout(fn) {
  const index = mixins.global.findIndex(([mixinFn]) => mixinFn === fn);

  mixins.global.splice(index, 1);
}

export function defStash(ns, initial, setup) {
  const stash = new Stash(ns);

  stash.reset();
  stash.init(initial);

  if (setup) {
    setup(stash);
  }
}
