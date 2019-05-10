import { defStash } from "../../../src";
import Logger from "./mixin.Logger";

defStash("logs", [], ({mixout}) => {
  const {defAction, reduce} = mixout(Logger);

  defAction("addEntry", (entry) => {
    reduce(data => [...data, entry]);
  });

  defAction("clear", () => {
    reduce(() => []);
  });
});
