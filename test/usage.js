import React, { Fragment, useEffect, useState } from "react";
import { expect } from "chai";
import { shallow, mount } from "enzyme";

import { useData, useActions, useStash, defStash } from "../src";
import Storage from "../src/Storage";

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
        const length = get().length;
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


    describe("dynamic path", () => {
      function Item() {
        const [index, setIndex] = useState(0);
        const name = useData(`items.${index}.name`);
        const {getItems} = useActions("items");

        useEffect(getItems, []);

        return (
          <div>
            <button className="nextItemBtn" onClick={ () => setIndex(index + 1) }>Next</button>
            <div className="itemName">{ name }</div>
          </div>
        );
      }

      function ItemWrapper() {
        const name = useData("items.2.name");

        return (
          <div>
            <div>{ name }</div>
            <Item />
          </div>
        );
      }

      it("uses data corresponding to path updates", () => {
        const wrapper = mount(<Item />);

        expect(wrapper.find("div.itemName").text()).to.equal("Foo");
        wrapper.find("button.nextItemBtn").simulate("click");
        expect(wrapper.find("div.itemName").text()).to.equal("");
      });

      it("persists handlers order after useEffect", () => {
        const wrapper = mount(<ItemWrapper />);
        const storage = Storage.instance("items");

        wrapper.find("button.nextItemBtn").simulate("click");
        expect(storage.listeners.slice().reverse().map(h => h.__stashPath)).to.eql(["2.name", "1.name"]);
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
          <Fragment>
            <button className="addItemBtn" onClick={ () => addItem() }>Add Item</button>
            <button className="addItemWithLogReduceBtn" onClick={ () => addItem(true) }>Add Item</button>

            <ul>
              { logs.map((entry, i) => (
                  <li key={ i } className="logEntry">{ entry }</li>
                ))
              }
            </ul>
          </Fragment>
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
        Todo1: 0,
        Todo2: 0,
        Details: 0
      };

      function List() {
        const items = useData("todos.list.items");
        const {getTodos, completeTodo} = useActions("todos");

        useEffect(getTodos, []);

        renderCounts.List++;

        return (
          <Fragment>
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
          </Fragment>
        );
      }

      function Todo({id}) {
        const done = useData(`todos.list.items.{id:${id}}.done`);

        renderCounts[`Todo${id}`]++;

        return <div className={ `todo-${id}-done` }>{ done ? "Done" : "Not Done" }</div>;
      }

      function Details({id}) {
        const {description} = useData("todos.details");
        const {getTodo} = useActions("todos");

        renderCounts.Details++;

        return (
          <Fragment>
            <button className="showDetailsBtn" onClick={ () => getTodo(id) }>
              Show Details
            </button>

            { description &&
              <div className="details">{ description }</div>
            }
          </Fragment>
        );
      }

      function Page() {
        return (
          <Fragment>
            <List />
            <Todo id={ 1 } />
            <Todo id={ 2 } />
            <Details id={ 2 } />
          </Fragment>
        );
      }

      it("re-renders components only when specific piece of data changes", () => {
        const wrapper = mount(<Page />);

        expect(renderCounts).to.eql({
          List: 2,
          Todo1: 1,
          Todo2: 1,
          Details: 1
        });

        wrapper.find(".checkTodoBtn-1").simulate("click");

        expect(renderCounts).to.eql({
          List: 3,
          Todo1: 2,
          Todo2: 1,
          Details: 1
        });

        wrapper.find(".showDetailsBtn").simulate("click");

        expect(renderCounts).to.eql({
          List: 3,
          Todo1: 2,
          Todo2: 1,
          Details: 2
        });
      });

      describe("mapper and compare functions", () => {
        let renderCount = 0;

        function ListHeader() {
          const ids = useData("todos.list.items", (items) => {
            return items.map(i => i.id);
          }, ids => ids.join("-"));
          const {getTodos} = useActions("todos");

          useEffect(getTodos, []);

          renderCount++;

          return <div className="todoIds">{ ids.join(", ") }</div>;
        }

        function Page() {
          const {completeTodo} = useActions("todos");

          return (
            <Fragment>
              <ListHeader />
              <button className="checkFirst" onClick={ () => completeTodo(1) }>
                Check
              </button>
            </Fragment>
          );
        }

        it("re-renders components only if compare value changed", () => {
          const wrapper = mount(<Page />);

          expect(renderCount).to.eql(1);
          expect(wrapper.find(".todoIds").text()).to.eq("1, 2");
          wrapper.find(".checkFirst").simulate("click");
          expect(renderCount).to.eql(1);
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
