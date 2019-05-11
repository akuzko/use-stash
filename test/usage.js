import React, { useEffect } from "react";
import { expect } from "chai";
import { shallow, mount } from "enzyme";

import { useData, useActions, useStash, defStash } from "../src";

describe("usage", () => {
  beforeEach(() => {
    defStash("items", [], ({defAction, reduce, get, ns}) => {
      defAction("getItems", () => {
        reduce(() => [{name: "Foo"}]);
      });

      defAction("dropItems", () => {
        reduce(() => []);
      });

      defAction("addItem", (reduceLogs) => {
        const length = get("length");
        const username = ns("session").get("name");
        const itemname = `Item ${length + 1}`;
        const logEntry = `${username} added item ${itemname}`;

        reduce(data => [...data, {name: itemname}]);

        if (reduceLogs) {
          ns("logs").reduce(data => [...data, logEntry]);
        } else {
          ns("logs").callAction("addEntry", logEntry);
        }
      });
    });

    defStash("session", {name: "User"});

    defStash("logs", [], ({defAction, reduce}) => {
      defAction("addEntry", (entry) => {
        reduce(data => [...data, entry]);
      });
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

    describe("using mapper function to preprocess stashed data", () => {
      function List() {
        const items = useData("items", items => items.map(i => i.name.toUpperCase()));
        const {getItems} = useActions("items");

        useEffect(getItems, []);

        return <div>{ items[0] }</div>;
      }

      it("uses mapper function", () => {
        const wrapper = mount(<List />);

        expect(wrapper.find("div").text()).to.equal("FOO");
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

    describe("cross-namespace interaction", () => {
      function Page() {
        const {addItem, dropItems} = useActions("items");
        const logs = useData("logs");

        useEffect(dropItems, []);

        return (
          <>
            <button className="addItemBtn" onClick={ () => addItem() }>Add Item</button>
            <button className="addItemWithLogReduceBtn" onClick={ () => addItem(true) }>Add Item</button>

            <ul>
              { logs.map((entry, i) => (
                  <li key={ i } className="logEntry">{ entry }</li>
                ))
              }
            </ul>
          </>
        );
      }

      it("allows allows to use methods of other namespace Stash instance", () => {
        const wrapper = mount(<Page />);

        wrapper.find(".addItemBtn").simulate("click");
        expect(wrapper.find(".logEntry").text()).to.eq("User added item Item 1");
      });

      it("allows to call actions of other namespace Stash instance", () => {
        const wrapper = mount(<Page />);

        wrapper.find(".addItemWithLogReduceBtn").simulate("click");
        expect(wrapper.find(".logEntry").last().text()).to.eq("User added item Item 1");
      });
    });

    describe("granular data access control", () => {
      const initial = {
        list: {
          items: []
        },
        details: {}
      };

      defStash("todos", initial, ({defAction, reduce}) => {
        defAction("getTodos", () => {
          reduce((data) => {
            return {...data, list: {items: [{id: 1, done: false}, {id: 2, done: false}]}};
          });
        });

        defAction("completeTodo", (id) => {
          reduce((data) => {
            return {...data, list: {items: data.list.items.map(i => i.id === id ? {...i, done: true} : i)}};
          });
        });

        defAction("getTodo", (id) => {
          reduce((data) => {
            return {...data, details: {id, description: `Todo ${id}`}};
          });
        });
      });

      const renderCounts = {
        List: 0,
        Todo0: 0,
        Todo1: 0,
        Details: 0
      };

      function List() {
        const items = useData("todos.list.items");
        const {getTodos, completeTodo} = useActions("todos");

        useEffect(getTodos, []);

        renderCounts.List++;

        return (
          <>
            { items.map((item, i) => (
                <div key={ i }>
                  { item.id }
                  <button
                    className={ `checkTodoBtn-${item.id}` }
                    onClick={ () => completeTodo(item.id) }
                  >
                    Check
                  </button>
                </div>
              ))
            }
          </>
        );
      }

      function Todo({index}) {
        const done = useData(`todos.list.items.${index}.done`);

        renderCounts[`Todo${index}`]++;

        return <div className={ `todo-${index}-done` }>{ done ? "Done" : "Not Done" }</div>;
      }

      function Details({id}) {
        const {description} = useData("todos.details");
        const {getTodo} = useActions("todos");

        renderCounts.Details++;

        return (
          <>
            <button className="showDetailsBtn" onClick={ () => getTodo(id) }>
              Show Details
            </button>

            { description &&
              <div className="details">{ description }</div>
            }
          </>
        );
      }

      function Page() {
        return (
          <>
            <List />
            <Todo index={ 0 } />
            <Todo index={ 1 } />
            <Details id={ 2 } />
          </>
        );
      }

      it("re-renders components only when specific piece of data changes", () => {
        const wrapper = mount(<Page />);

        expect(renderCounts).to.eql({
          List: 2,
          Todo0: 1,
          Todo1: 1,
          Details: 1
        });

        wrapper.find(".checkTodoBtn-1").simulate("click");

        expect(renderCounts).to.eql({
          List: 3,
          Todo0: 2,
          Todo1: 1,
          Details: 1
        });

        wrapper.find(".showDetailsBtn").simulate("click");

        expect(renderCounts).to.eql({
          List: 3,
          Todo0: 2,
          Todo1: 1,
          Details: 2
        });
      });
    });
  });

  describe("useStash", () => {
    function List() {
      const [items, {getItems}] = useStash("items");

      useEffect(getItems, []);

      return (
        <div>
          { items.map((item, i) => <Item key={ i } name={ item.name } />) }
        </div>
      );
    }

    it("provides both data and actions objects", () => {
      const wrapper = mount(<List />);

      expect(wrapper.find(Item)).to.have.lengthOf(1);
    });
  });
});
