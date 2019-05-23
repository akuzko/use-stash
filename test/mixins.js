import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import sinon from "sinon";

import { mixin, mixout, defStash, useStash } from "../src";

describe("mixins usage", () => {
  const myConsole = {};

  function Logger(stash, title) {
    const {defAction} = stash;

    return {
      defAction(name, fn) {
        defAction(name, (...args) => {
          myConsole.log(`${title}: action invoked: ${name}`);
          fn(...args);
        });
      }
    };
  }

  beforeEach(() => {
    mixin(Logger, "MyLogger");

    defStash("mixin-items", [], ({defAction, reduce, get}) => {
      defAction("addItem", () => {
        const length = get().length;
        const itemname = `Item ${length + 1}`;

        reduce(data => [...data, {name: itemname}]);
      });
    });

    defStash("mixin-foos", [], ({mixout}) => {
      const {defAction, reduce} = mixout(Logger);

      defAction("add", () => {
        reduce(data => [...data, "foo"]);
      });
    });
  });

  afterEach(() => {
    mixout(Logger);
  });

  function Items() {
    const [items, {addItem}] = useStash("mixin-items");

    return (
      <>
        <button className="itemsAddBtn" onClick={ addItem }>Add Item</button>
        <div className="items">
          { items.map((item, i) => (
              <div key={ i }>{ item.name }</div>
            ))
          }
        </div>
      </>
    );
  }

  function Foos() {
    const [foos, {add}] = useStash("mixin-foos");

    return (
      <>
        <button className="foosAddBtn" onClick={ add }>Add</button>
        <div className="foos">
          { foos.map((foo, i) => (
              <div key={ i }>{ foo }</div>
            ))
          }
        </div>
      </>
    );
  }

  it("allows to mix-in and mix-out custom functionality", () => {
    myConsole.log = sinon.spy();
    const wrapper = mount(
      <>
        <Items />
        <Foos />
      </>
    );

    wrapper.find(".itemsAddBtn").simulate("click");
    wrapper.find(".foosAddBtn").simulate("click");

    expect(wrapper.find(".items").text()).to.eq("Item 1");
    expect(wrapper.find(".foos").text()).to.eq("foo");
    expect(myConsole.log).to.have.property("callCount", 1);
    expect(myConsole.log.getCall(0).args[0]).to.eq("MyLogger: action invoked: addItem");
  });
});
