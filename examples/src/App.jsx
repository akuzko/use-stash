import React, { useEffect } from "react";
import { defStash, useData, useActions, useStash } from "../../src";

const initialState = {
  list: [],
  details: {}
};

const todos = [{
  id: 1,
  title: "Do Something",
  description: "Do something important",
  status: "DONE"
}, {
  id: 2,
  title: "Publish Package",
  description: "Publish NPM package",
  status: "TODO"
}];

function getTodos() {
  return todos.map(todo => ({id: todo.id, title: todo.title}));
}

function getTodoDetails(i) {
  return todos[i];
}

defStash("todos", initialState, (action, reduce, get) => {
  action("getTodos", () => {
    reduce(data => ({...data, list: getTodos()}));
  });

  action("getTodo", (i) => {
    reduce(data => ({...data, details: getTodoDetails(i)}));
  });

  action("removeTodo", (i) => {
    const item = get("list")[i];

    reduce((data) => {
      const list = [...data.list];

      list.splice(i, 1);
      const nextState = {...data, list};

      if (item.id === get("details.id")) {
        nextState.details = {};
      }

      return nextState;
    });

    reduce.global("logs", (data) => {
      return [...data, `${get.global("session.name")} removed entry "${item.title}"`];
    });
  });
});

defStash("session", {}, (action, reduce) => {
  action("getSession", () => {
    reduce(() => ({name: "User"}));
  });
});

defStash("logs", []);

export default function App() {
  const {list, details} = useData("todos");
  const {getTodos, getTodo, removeTodo} = useActions("todos");
  const [{name}, {getSession}] = useStash("session");
  const entries = useData("logs");

  useEffect(() => {
    getTodos();
    getSession();
  }, []);

  return (
    <>
      <div>Hello, { name }!</div>
      { list.length > 0
        ? <ul>
            { list.map((item, i) => (
                <li key={ i }>
                  <div>#{ item.id }: { item.title }</div>
                  <div>
                    <button onClick={ () => getTodo(i) }>Open Details</button>
                    <button onClick={ () => removeTodo(i) }>Remove</button>
                  </div>
                </li>
              ))
            }
          </ul>
        : <div>No Todos</div>
      }
      { details.id &&
        <div>
          <div>Todo Details:</div>
          <div>ID: { details.id }</div>
          <div>Title: { details.title }</div>
          <div>Description: { details.description }</div>
          <div>Status: { details.status }</div>
        </div>
      }
      <div>
        { entries.map((e, i) => (
            <div key={ i }>{ e }</div>
          ))
        }
      </div>
    </>
  );
}
