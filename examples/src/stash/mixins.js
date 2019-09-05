import { mixin } from "../../../src";
import { logger, actionReducer } from "../../../src/mixins";

import inspector from "./mixin.inspector";
import localStorageDump from "./mixin.localStorageDump";

mixin(inspector);
mixin(localStorageDump);
mixin(logger, {
  except: ["todos.toggleTodo"],
  colors: {
    todos: "blue"
  }
});
mixin(actionReducer);
