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

defStash("todos", initialData, ({defAction, reduce}) => {
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
- `useData(path, mapperFn)` - returns a data object specified by `path`. The
  simplest value of `path` is namespace name itself. But it can also represent
  deeply nested value (see **Granular Data Access** section bellow).
  Whenever this object gets updated, your component will be updated as well.
  If `mapperFn` function is passed, it will be used to preprocess stashed value
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

It is possible to preprocess stashed data when accessing it by passing mapper
function to `useData` hook. For example:

```js
function ItemStatus({index}) {
  const status = useData(`todos.list.items.${index}.status`, s => s.toUpperCase());

  return <div>{ status }</div>;
}
```

### Accessing Data in Actions

You can use `get` method of `Stash` instance to access data of corresponding namespace:

```js
defStash("todos", initialState, ({defAction, reduce, get}) => {
  defAction("removeTodo", (i) => {
    const id = get(`list.${i}.id`);

    reduce((data) => {
      return {...data, list: data.list.filter(item => item.id !== id)};
    });
  });
});
```

### Cross-namespace Interaction

You can use `ns` method to access `Stash` instance of another namespace. It can be
used for fetching data from other namespaces, reducing it and even calling actions
defined in other namespaces:

```js
defStash("todos", initialState, ({defAction, reduce, get, ns}) => {
  defAction("removeTodo", (i) => {
    const item = get("list")[i];
    const username = ns("session").get("name");

    reduce((data) => {
      const list = [...data.list];

      list.splice(i, 1);
      return {...data, list};
    });

    ns("logs").reduce((data) => {
      return [...data, `${username} removed item "${item.title}"`];
    });
    // if there is "addEntry" action defined in "logs" namespace, it can
    // be called via
    ns("logs").callAction("addEntry", `${username} removed item "${item.title}"`);
  });
});
```

### HOCs for Class Components

For hook-less class-based React components you can use HOC-based approach. For this,
`use-stash` provides 3 helper functions, similar to hooks: `withData`, `withActions`
and `withStash`. The latter mixes functionality of the former two.

- `withData(dataMapping)` - allows to pass stash data to connected component's
props. `dataMapping` is a plain object, whose keys are prop names and values are
paths to data that component is interested in. For example:

```js
const HocPage = withData({
  username: "session.name",
  todos: "todos.list.items",
  logEntries: "logs"
})(Page);
```

In this example, underlying `Page` component will receive `username`, `todos`
and `logEntries` props with values obtained from 3 different stash namespaces.

- `withActions(actionsMapping)` - allows to pass stash actions to connected
component's props. `actionsMapping` is a plain object, whose keys are prop names
and values are strings that specify stash namespace and action name, separated
by dot. For example:

```js
const HocLayout = withActions({
  fetchSession: "session.getSession"
})(Layout);
```

In this example, underlying `Layout` component will receive `fetchSession` prop,
which is a function corresponding to `getSession` action of `session` namespace.

- `withStash(dataMapping, actionsMapping)` - allows to pass both data and actions
to connected component. A combination of `withData` and `withActions`. For example:

```js
const HocPage = withStash({
  username: "session.name",
  todos: "todos.list.items",
  logEntries: "logs"
}, {
  getItems: "todos.getItems",
  addItem: "todos.addItem"
})(Page);
```

Keep in mind that under the hood HOC wrappers are functional hook-based components,
i.e. you still need React 16.8+ to use HOC helpers.

### Hints and Tips

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
import { defStash } from "use-stash";
import update from "update-js";

defStash("todos", initialData, ({defAction, reduce}) => {
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
  });
});
```

Or the same example with `update-js/fp` package looks even shorter:

```js
import { defStash } from "use-stash";
import update from "update-js/fp";

defStash("todos", initialData, ({defAction, reduce}) => {
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
  });
});
```

## License

MIT
