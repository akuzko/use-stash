import { defStash } from "../../../src";
import { logger } from "../../../src/mixins";

defStash("logs", [], ({mixout}) => {
  const {defAction, reduce} = mixout(logger);

  defAction("addEntry", (entry) => {
    reduce(data => [...data, entry]);
  });

  defAction("clear", () => {
    reduce(() => []);
  });
});
