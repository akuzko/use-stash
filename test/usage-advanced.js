import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";

import { useData, useActions, defStash } from "../src";

describe("advanced usage", () => {
  before(() => {
    defStash("items", (stash) => {
      stash.reset();

      const { init, defAction, get, reduce, ns } = stash;

      init([]);

      defAction("addItem", () => {
        const length = get("length");
        const username = ns("session").get("name");
        const itemname = `Item ${length + 1}`;

        reduce(data => [...data, {name: itemname}]);

        ns("logs").callAction("addEntry", `${username} added item ${itemname}`);
      });
    });

    defStash("session", (stash) => {
      stash.reset();
      stash.init({name: "User"});
    });

    defStash("logs", (stash) => {
      stash.reset();
      stash.init([]);

      stash.defAction("addEntry", (entry) => {
        stash.reduce(data => [...data, entry]);
      });
    });
  });

  function Page() {
    const {addItem} = useActions("items");
    const logs = useData("logs");

    return (
      <>
        <button className="addItemBtn" onClick={ addItem }>Add Item</button>

        <ul>
          { logs.map((entry, i) => (
              <li key={ i } className="logEntry">{ entry }</li>
            ))
          }
        </ul>
      </>
    );
  }

  it ("allows use Stash instance for namespace definitions", () => {
    const wrapper = mount(<Page />);

    wrapper.find(".addItemBtn").simulate("click");
    expect(wrapper.find(".logEntry").text()).to.eq("User added item Item 1");
  });
});
