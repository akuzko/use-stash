import { mixin } from "../../../src";
import { logger } from "../../../src/mixins";

import inspector from "./mixin.inspector";
import localStorageDump from "./mixin.localStorageDump";

mixin(inspector);
mixin(localStorageDump);
mixin(logger, {
  todos: "blue"
});
