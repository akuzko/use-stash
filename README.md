React Stash Hooks
=================

React hooks for app-wide data access and manipulation via actions. Minimalistic
and easy-to-use solution inspired by [`redux`](https://redux.js.org/) family of projects.

[![build status](https://img.shields.io/travis/akuzko/use-stash/master.svg?style=flat-square)](https://travis-ci.org/akuzko/use-stash)
[![npm version](https://img.shields.io/npm/v/use-stash.svg?style=flat-square)](https://www.npmjs.com/package/use-stash)

## Installation

```
npm install --save use-stash
```

## Usage

### 1. Define Namespace(s)

Both application data and actions to manipulate it are organized in namespaces.
Each namespace is defined/initialized via `defStash` function:

```js
import { defStash } from "use-stash";

const initialData = {
  items: [],
  details: {}
};

defStash("todos", initialData, (defAction, reduce) => {
  defAction("getTodos", () => {
    fetch("/api/todos")
      .then(response => response.json())
      .then(items => reduce(data => ({...data, items})));
  });

  defAction("getTodo", (id) => {
    fetch(`/api/todos/${id}`)
      .then(response => response.json())
      .then(details => reduce(data => ({...data, details})));
  });
});
```

### 2. Import Stash Namespace Definitions

Don't forget to import all definitions on app initialization somewhere in your
entry. Like so:

```js
import "stash/todos";
import "stash/projects";
// ...
```

### 3. Use Data and Actions

`use-stash` provides following hooks for you to use:
- `useData(path, mapper)` - returns a data object of specified by `path`. The
  simplest value of `path` is namespace name itself. But it can also represent
  deeply nested value (see **Granular Data Access** section bellow).
  Whenever this object gets updated, your component will be updated as well.
  If `mapper` function is passed, it will be used to preprocess stashed value
  before passing it to your component (see **Mapping Data on Access** section bellow).
- `useActions(namespace)` - returns object with all actions defined for specified
  `namespace`. This actions can (and should) be used for all data manipulations.
- `useStash(namespace)` - returns two-object array of namespace data and
  actions.

For example:

```js
import { useEffect } from "react";
import { useData, useActions, useStash } from "use-stash";

function TodosList() {
  const {items} = useData("todos");
  const {getTodos} = useActions("todos");

  useEffect(getTodos, []);

  return (
    // render list of todos
  );
}

function TodoItem({id}) {
  // `useStash` can be used to return both data and actions in single call;
  const [{details}, {getTodo}] = useStash("todos");

  useEffect(() => {
    getTodo(id);
  }, [id]);

  return (
    // render single item
  );
}
```

### Granular Data Access

Usually it may be much more efficient to use only small piece of data stored
in namespace. This way your component will be re-rendered only if that small piece
gets changed. To do so, you simply have to pass full path to the object you
are interested in to `useData` hook call. All path segments should be separated
by `"."`. For example:

```js
function ItemStatus({index}) {
  const status = useData(`todos.list.items.${index}.status`);

  return <div>{ status.toUpperCase() }</div>;
}
```

This component will be re-rendered only if status of item at `index` position of
`todos.list.items` array changes.

### Mapping Data on Access

It is possible to pre-process stashed data when accessing it by passing mapper
function to `useData` hook. For example:

```js
function ItemStatus({index}) {
  const status = useData(`todos.list.items.${index}.status`, s => s.toUpperCase());

  return <div>{ status }</div>;
}
```

### Accessing Data in Actions

Setup function passed to `defStash` method actually accepts a third attribute -
`get` function that can be used to access stashed data:

```js
defStash("todos", initialState, (defAction, reduce, get) => {
  defAction("removeTodo", (i) => {
    const id = get("list")[i].id;

    reduce((data) => {
      return {...data, list: data.list.filter(item => item.id !== id)};
    });
  });
});
```

### Cross-namespace Interaction

Both `get` and `reduce` functions can be used to access/reduce data of other
namespaces via `global` function. For example:

```js
defStash("todos", initialState, (defAction, reduce, get) => {
  defAction("removeTodo", (i) => {
    const item = get("list")[i];

    reduce((data) => {
      const list = [...data.list];

      list.splice(i, 1);
      return {...data, list};
    });

    reduce.global("logs", (data) => {
      return [...data, `${get.global("session.name")} removed item "${item.title}"`];
    });
  });
});
```

### Advanced Usage

In case if usage described above is not enough, you may have full access to `Stash`
instance and it's functionality. This can be used, for instance, to call actions
of other namespaces from within action you're defining. To work directly with
`stash` instance, pass a single function that accepts it to a `defStash` function
call. For example:

```js
defStash("todos", (stash) => {
  stash.init(initialState);

  stash.defAction("removeTodo", (i) => {
    const item = stash.get("list")[i];
    const username = stash.ns("session").get("name");

    stash.reduce((data) => {
      const list = [...data.list];

      list.splice(i, 1);
      return {...data, list};
    });

    stash.ns("logs").callAction("addEntry", `${username} removed item "${item.title}"`);
  });
});
```

Two important things to note here:
- Don't forget to call `init` function to set initial state for namespace being
  defined.
- `ns` function can be used to access `Stash` instance of other namespace.

### Hints and Tips

#### Destructure Stash instance with Advanced Usage

Core `Stash` instance methods are bound to instance itself, i.e. it is safe to
assign them to callable variables, preserving context:

```js
defStash("todos", (stash) => {
  const {init, defAction, reduce, get, ns} = stash;

  init(initialState);

  defAction("removeTodo", (i) => {
    const item = get("list")[i];
    const username = ns("session").get("name");

    reduce((data) => {
      const list = [...data.list];

      list.splice(i, 1);
      return {...data, list};
    });

    ns("logs").callAction("addEntry", `${username} removed item "${item.title}"`);
  });
});
```

#### Use `update-js` and `update-js/fp` packages

To keep action definitions thin, clean and simple, it is advised to use
[`update-js`](https://www.npmjs.com/package/update-js) and/or
[`update-js/fp`](https://www.npmjs.com/package/update-js#update-jsfp-module) packages
which can drastically reduce complexity of your data reducers.

For example, imagine that we have following initial data structure:

```js
const initialData = {
  list: {
    loading: false,
    items: [],
    pagination: {}
  },
  // ...
};
```

Each item in the list identified by `id` property and has `checked` property
that can be changed via action.

And we want to define couple of actions: one that loads a list, toggling it's
`loading` flag, and other for toggling `checked` property of specific item in
the list.

With `update-js` it can look like this:

```js
import { defineActions } from "use-stash";
import update from "update-js";

defineAction("todos", initialData, (defAction, reduce) => {
  defAction("getTodos", () => {
    reduce(data => update(data, "list.loading", true));

    fetch("/api/todos")
      .then(response => response.json())
      .then(items => {
        reduce(data => update(data, {
          "list.loading": false,
          "list.items": items
        }));
      });
  });

  defAction("toggleChecked", (id) => {
    reduce(data => update.with(data, `list.items.{id:${id}}.checked`, checked => !checked));
  })
});
```

Or the same example with `update-js/fp` package looks even shorter:

```js
import { defineActions } from "use-stash";
import update from "update-js/fp";

defineAction("todos", initialData, (defAction, reduce) => {
  defAction("getTodos", () => {
    reduce(update("list.loading", true));

    fetch("/api/todos")
      .then(response => response.json())
      .then(items => {
        reduce(update({
          "list.loading": false,
          "list.items": items
        }));
      });
  });

  defAction("toggleChecked", (id) => {
    reduce(update.with(`list.items.{id:${id}}.checked`, checked => !checked));
  })
});
```

## License

MIT
