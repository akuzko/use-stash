import React, { useEffect } from "react";
import { defStash, useData, useActions } from "../../src";

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

defStash("todos", initialState, (action, reduce) => {
  action("getTodos", (data) => {
    reduce(data => ({...data, list: getTodos()}));
  });

  action("getTodo", (i) => {
    reduce(data => ({...data, details: getTodoDetails(i)}));
  });

  action("removeTodo", (i) => {
    reduce((data) => {
      const list = [...data.list];

      list.splice(i, 1);
      return {...data, list};
    });
  });
});

export default function Form() {
  const {list, details} = useData("todos");
  const {getTodos, getTodo, removeTodo} = useActions("todos");

  useEffect(getTodos, []);

  if (!list.length) {
    return <div>No Todos</div>;
  }

  return (
    <>
      <ul>
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
      { details.id &&
        <div>
          <div>Todo Details:</div>
          <div>ID: { details.id }</div>
          <div>Title: { details.title }</div>
          <div>Description: { details.description }</div>
          <div>Status: { details.status }</div>
        </div>
      }
    </>
  );
}
