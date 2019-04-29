import { defStash } from "../../src";
import { get as fetch, patch, destroy } from "./todos";

const initialTodos = {
  list: [],
  details: {}
};

defStash("todos", initialTodos, (stash) => {
  const {init, defAction, callAction, reduce, get, ns} = stash;

  defAction("getTodos", () => {
    return fetch("/todos")
      .then((list) => {
        reduce(data => ({...data, list}));
      });
  });

  defAction("getTodo", (id) => {
    return fetch(`/todos/${id}`)
      .then((details) => {
        reduce(data => ({...data, details}));
      });
  });

  defAction("toggleTodo", (id) => {
    const todo = get("list").find(todo => todo.id === id);

    return patch(`/todos/${todo.id}/toggle`)
      .then((completed) => {
        const statusTitle = completed ? "DONE" : "TODO";

        reduce(data => ({
          ...data,
          list: data.list.map(item => item.id === id ? {...item, completed} : item)
        }));

        if (get("details.id") === id) {
          callAction("getTodo", id);
        }

        ns("logs").callAction("addEntry", `${ns("session").get("name")} set status of "${todo.title}" to ${statusTitle}`);
      })
  });

  defAction("removeTodo", (id) => {
    const todo = get("list").find(todo => todo.id === id);

    return destroy(`/todos/${id}`)
      .then(() => {
        reduce((data) => {
          return {
            list: data.list.filter(item => item !== todo),
            details: get("details.id") === todo.id ? {} : data.details
          };
        });

        ns("logs").callAction("addEntry", `${ns("session").get("name")} removed entry "${todo.title}"`);
      });
  });
});

defStash("session", {}, ({init, defAction, reduce}) => {
  defAction("setName", (name) => {
    reduce(() => ({name}));
  });
});

defStash("logs", [], ({init, defAction, reduce}) => {
  defAction("addEntry", (entry) => {
    reduce(data => [...data, entry]);
  });

  defAction("clear", () => {
    reduce(() => []);
  });
});
