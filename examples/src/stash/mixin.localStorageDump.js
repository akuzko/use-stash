function getObj(key) {
  const item = localStorage.getItem(key);

  return item && JSON.parse(item);
}

function setObj(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}

const defaultConfig = {
  key: "App/stash-mixins/localStorageDump",
  defer: 1000
};

let initialized = false;

export default function localStorageDump(stash, config = {}) {
  const {namespace, init, defAction, reduce, get} = stash;
  const {key, defer} = Object.assign({}, defaultConfig, config);

  setTimeout(() => initialized = true, defer);

  return {
    init(data) {
      const obj = getObj(key);

      init(obj && obj[namespace] || data);
    },

    defAction(name, fn) {
      defAction(name, (...args) => {
        if (initialized) {
          return fn(...args);
        }
        // eslint-disable-next-line no-console
        console.log(`Skipped action ${namespace}/${name}`);
      });
    },

    reduce(...args) {
      const obj = getObj(key) || {};

      reduce(...args);
      obj[namespace] = get();
      setObj(key, obj);
    }
  };
}
