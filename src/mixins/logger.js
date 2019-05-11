/* eslint-disable no-console */

const colorPresets = [
  "purple",
  "olive",
  "green",
  "blue",
  "teal",
  "maroon",
  "orange",
  "magenta"
];

getNextColor.colorIndex = 0;

function getNextColor() {
  if (getNextColor.colorIndex === colorPresets.length) {
    getNextColor.colorIndex = 0;
  }

  return colorPresets[getNextColor.colorIndex++];
}

const definedColors = {};

function getNsColor(ns, setup) {
  if (ns in definedColors) {
    return definedColors[ns];
  }

  const color = (typeof setup === "function" ? setup(ns) : setup[ns]) || getNextColor();

  definedColors[ns] = color;

  return color;
}

export default function logger(stash, colors) {
  const {namespace, defAction, reduce, get} = stash;
  const color = getNsColor(namespace, colors);

  return {
    defAction(name, action) {
      defAction(name, (...args) => {
        logger.latestAction = [namespace, name];

        console.log("%caction %c%s", "color: #9e9e9e", `font-weight: bold; color: ${color};`, `${namespace}/${name}`, args);

        action(...args);
      });
    },

    reduce(name, reducer) {
      const logArgs = [];

      if (reducer === undefined && typeof name === "function") {
        reducer = name;
        logArgs.push(
          `%creduce %c${namespace} %c(latest action: %c%s%c)`,
          "color: #9e9e9e;",
          `font-weight: bold; color: ${color};`,
          "font-weight: normal; color: black;",
          `font-weight: bold; color: ${getNsColor(logger.latestAction[0])}`,
          logger.latestAction.join("/"),
          "font-weight: normal; color: black;"
        );
      } else {
        logArgs.push(
          `%creduce %c ${namespace}/${name}`,
          "color: #9e9e9e;",
          `font-weight: bold; color: ${color};`
        );
      }

      console.groupCollapsed(...logArgs);
      console.log("%c prev data", "font-weight: bold; color: #9e9e9e;", get());
      reduce(reducer);
      console.log("%c next data", "font-weight: bold; color: #4caf50;", get());
      console.groupEnd();
    }
  };
}
