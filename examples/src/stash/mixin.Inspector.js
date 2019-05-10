window.appData = {};

export default function Inspector(stash) {
  const {namespace, init, reduce, get} = stash;

  return {
    init(data) {
      window.appData[namespace] = data;
      init(data);
    },

    reduce(fn) {
      reduce(fn);
      window.appData[namespace] = get();
    }
  }
}
