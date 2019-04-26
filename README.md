React Stash Hooks
=================

React hooks for app-wide data access and manipulation via actions. Minimalistic
and easy-to-use solution inspired by [`redux`](https://redux.js.org/) family of projects.

[![build status](https://img.shields.io/travis/akuzko/use-stash/master.svg?style=flat-square)](https://travis-ci.org/akuzko/use-stash)

## Installation

```
npm install --save use-stash
```

## Usage

### 1. Define Actions

Both application data and actions to manipulate it are organized in namespaces.
Each namespace is defined/initialized via `defStash` function:

```js
import { defStash } from "use-stash";

const initialData = {
  items: [],
  details: {}
};

defStash("todos", initialData, (action, reduce) => {
  action("getTodos", () => {
    fetch("/api/todos")
      .then(response => response.json())
      .then(items => reduce(data => ({...data, items})));
  });

  action("getTodo", (id) => {
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

### Hints and Tricks

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

defineAction("todos", initialData, (action, reduce) => {
  action("getTodos", () => {
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

  action("toggleChecked", (id) => {
    reduce(data => update.with(data, `list.items.{id:${id}}.checked`, checked => !checked));
  })
});
```

Or the same example with `update-js/fp` package looks even shorter:

```js
import { defineActions } from "use-stash";
import update from "update-js/fp";

defineAction("todos", initialData, (action, reduce) => {
  action("getTodos", () => {
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

  action("toggleChecked", (id) => {
    reduce(update.with(`list.items.{id:${id}}.checked`, checked => !checked));
  })
});
```

## License

MIT
