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

export default function logger(stash, colors = {}) {
  const {namespace, defAction, reduce, get} = stash;
  const color = getNsColor(namespace, colors);

  return {
    defAction(name, action) {
      defAction(name, (...args) => {
        logger.latestAction = [namespace, name];

        console.log("%caction %c%s", "color: #9e9e9e", `font-weight: bold; color: ${color};`, `${namespace}/${name}`, ...args);

        return action(...args);
      });
    },

    reduce(descriptor, reducer) {
      const logArgs = [];
      const extraArgs = [];

      if (reducer === undefined && typeof descriptor === "function") {
        reducer = descriptor;
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
        if (Array.isArray(descriptor)) {
          const [descriptorName, ...rest] = descriptor;

          descriptor = descriptorName;
          extraArgs.push(...rest);
        }

        logArgs.push(
          `%creduce %c ${namespace}/${descriptor}`,
          "color: #9e9e9e;",
          `font-weight: bold; color: ${color};`
        );
      }

      try {
        const nextData = reducer(get());

        console.groupCollapsed(...logArgs);
        if (extraArgs.length) {
          console.log(...extraArgs);
        }
        console.log("%c prev data", "font-weight: bold; color: #9e9e9e;", get());
        console.log("%c next data", "font-weight: bold; color: #4caf50;", nextData);
        console.groupEnd();

        return reduce(() => nextData);
      } catch (error) {
        logArgs[0] = logArgs[0] + "%c failed";
        logArgs[1] = "color: red;";
        logArgs.push("font-weight: bold; color: red;");

        console.log(...logArgs);

        throw error;
      }
    }
  };
}
