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

defStash("todos", (stash) => {
  const {init, defAction, reduce, get, ns} = stash;

  init(initialTodos);

  defAction("getTodos", () => {
    reduce(data => ({...data, list: getTodos()}));
  });

  defAction("getTodo", (i) => {
    reduce(data => ({...data, details: getTodoDetails(i)}));
  });

  defAction("removeTodo", (i) => {
    const item = get("list")[i];

    reduce((data) => {
      const list = [...data.list];

      list.splice(i, 1);
      const nextState = {...data, list};

      if (item.id === stash.get("details.id")) {
        nextState.details = {};
      }

      return nextState;
    });

    ns("logs").callAction("addEntry", `${stash.ns("session").get("name")} removed entry "${item.title}"`);
  });
});

defStash("session", ({init, defAction, reduce}) => {
  init({});

  defAction("getSession", () => {
    reduce(() => ({name: "User"}));
  });
});

defStash("logs", ({init, defAction, reduce}) => {
  init([]);

  defAction("addEntry", (entry) => {
    reduce(data => [...data, entry]);
  });
});
