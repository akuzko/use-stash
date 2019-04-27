import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";

import { useData, useActions, defStash } from "../src";

describe("advanced usage", () => {
  before(() => {
    defStash("items", (stash) => {
      stash.reset();

      const { init, defAction, callAction, get, reduce, ns } = stash;

      init({list: [], changed: false});

      defAction("addItem", () => {
        const length = get("list.length");
        const username = ns("session").get("name");
        const itemname = `Item ${length + 1}`;

        reduce(data => ({...data, list: [...data.list, {name: itemname}]}));

        callAction("change");

        ns("logs").callAction("addEntry", `${username} added item ${itemname}`);
      });

      defAction("change", () => {
        reduce(data => ({...data, changed: true}));
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

  it("allows use Stash instance for namespace definitions", () => {
    const wrapper = mount(<Page />);

    wrapper.find(".addItemBtn").simulate("click");
    expect(wrapper.find(".logEntry").text()).to.eq("User added item Item 1");
  });
});
