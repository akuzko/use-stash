import React, { useEffect } from "react";
import { expect } from "chai";
import { shallow, mount } from "enzyme";

import { useData, useActions, useDataActions, defineActions } from "../src";

defineActions("items", [], (action, reduce) => {
  action("getItems", () => {
    reduce(() => [{name: "Foo"}]);
  });
});

function Item({name}) {
  return <div>{ name }</div>;
}

describe("useData, useAction", () => {
  describe("initial value", () => {
    function List() {
      const items = useData("items");

      return <div>{ items.length }</div>;
    }

    it("uses initial value", () => {
      const wrapper = shallow(<List />);

      expect(wrapper.find("div").text()).to.equal("0");
    });
  });

  describe("using actions to mutate data", () => {
    function List() {
      const items = useData("items");
      const {getItems} = useActions("items");

      useEffect(getItems, []);

      return (
        <div>
          { items.map((item, i) => <Item key={ i } name={ item.name } />) }
        </div>
      );
    }

    it("uses action to update data", () => {
      const wrapper = mount(<List />);

      expect(wrapper.find(Item)).to.have.lengthOf(1);
    });
  });
});

describe("useDataActions", () => {
  function List() {
    const [items, {getItems}] = useDataActions("items");

    useEffect(getItems, []);

    return (
      <div>
        { items.map((item, i) => <Item key={ i } name={ item.name } />) }
      </div>
    );
  }

  it("provdes both data and actions objects", () => {
    const wrapper = mount(<List />);

    expect(wrapper.find(Item)).to.have.lengthOf(1);
  });
});
