import { defStash } from "../../src";

const initialTodos = {
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

defStash("todos", initialTodos, (action, reduce, get) => {
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
