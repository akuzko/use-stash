import React, { Component } from "react";
import { expect } from "chai";
import { mount } from "enzyme";

import { defStash, withData, withActions, withStash, useData } from "../src";

describe("HOC usage", () => {
  beforeEach(() => {
    defStash("items", [], ({defAction, reduce, get, ns}) => {
      defAction("getItems", () => {
        reduce(() => [{name: "Foo"}]);
      });

      defAction("dropItems", () => {
        reduce(() => []);
      });

      defAction("addItem", () => {
        const length = get("length");
        const username = ns("session").get("name");
        const itemname = `Item ${length + 1}`;
        const logEntry = `${username} added ${itemname}`;

        reduce(data => [...data, {name: itemname}]);

        ns("logs").reduce(data => [...data, logEntry]);
      });
    });

    defStash("session", {name: "User"});

    defStash("logs", []);
  });

  describe("withData", () => {
    class Layout extends Component {
      render() {
        return <div className="username">{ this.props.username }</div>;
      }
    }

    const HocLayout = withData({username: "session.name"})(Layout);

    it("allows to use HOC attached to Stash data", () => {
      const wrapper = mount(<HocLayout />);

      expect(wrapper.find(".username").text()).to.eq("User");
    });
  });

  describe("withActions", () => {
    class AddItemButton extends Component {
      render() {
        return <button className="addItemBtn" onClick={ this.props.addItem }>Add Item</button>;
      }
    }

    const HocButton = withActions({addItem: "items.addItem"})(AddItemButton);

    function ItemsList() {
      const items = useData("items");

      return (
        <ul>
          { items.map((item, i) => (
              <li key={ i }>{ item.name }</li>
            ))
          }
        </ul>
      );
    }

    it("allows to use HOC attached to Stash actions", () => {
      const wrapper =
        mount(
          <div>
            <HocButton />
            <ItemsList />
          </div>
        );

      wrapper.find(".addItemBtn").simulate("click");
      expect(wrapper.find("li")).to.have.lengthOf(1);
    });
  });

  describe("withStash", () => {
    class Page extends Component {
      componentDidMount() {
        this.props.getItems();
      }

      addItem() {
        this.props.addItem();
      }

      render() {
        const {items, username, entries} = this.props;

        return (
          <div>
            <div className="username">Hello, { username }!</div>
            <button className="addItemBtn" onClick={ () => this.addItem() }>Add Item</button>
            <ul>
              { items.map((item, i) => (
                  <li key={ i } className="item">{ item.name }</li>
                ))
              }
            </ul>
            <ul>
              { entries.map((entry, i) => (
                  <li key={ i } className="entry">{ entry }</li>
                ))
              }
            </ul>
          </div>
        );
      }
    }

    const HocPage = withStash({
      items: "items",
      username: "session.name",
      entries: "logs"
    }, {
      getItems: "items.getItems",
      addItem: "items.addItem"
    })(Page);

    it("allows to use HOC attached to Stash", () => {
      const wrapper = mount(<HocPage />);

      wrapper.find(".addItemBtn").simulate("click");

      expect(wrapper.find(".username").text()).to.eq("Hello, User!");
      expect(wrapper.find(".item").first().text()).to.eq("Foo");
      expect(wrapper.find(".item").last().text()).to.eq("Item 2");
      expect(wrapper.find(".entry").text()).to.eq("User added Item 2");
    });
  });
});
