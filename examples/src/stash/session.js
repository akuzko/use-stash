import { defStash } from "../../../src";

defStash("session", {}, ({defAction, reduce}) => {
  defAction("setName", (name) => {
    reduce(() => ({name}));
  });
});
