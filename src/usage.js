import Stash from "./Stash";
import Storage, { mixins } from "./Storage";

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
  Storage.reset(ns);

  const stash = new Stash(ns);

  stash.init(initial);

  if (setup) {
    setup(stash);
  }
}
