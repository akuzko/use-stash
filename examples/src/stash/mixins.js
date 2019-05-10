import { mixin } from "../../../src";

import Inspector from "./mixin.Inspector";
import Logger from "./mixin.Logger";

mixin(Inspector);
mixin(Logger, {
  todos: "blue"
});
