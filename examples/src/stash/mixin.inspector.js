window.appData = {};

export default function inspector(stash) {
  const {namespace, init, reduce, get} = stash;

  return {
    init(data) {
      window.appData[namespace] = data;
      init(data);
    },

    reduce(...args) {
      reduce(...args);
      window.appData[namespace] = get();
    }
  };
}
