React Data & Actions
====================

React hooks for app-wide data access and manipulation via actions. Minimalistic
and easy-to-use solution inspired by [`redux`](https://redux.js.org/) project family.

## Installation

```
npm install --save ok-react-data-actions
```

## Usage

### 1. Define Actions

Both application data and actions to manipulate it are organized in namespaces.
Each namespace is defined/initialized via `defineActions` function:

```js
import { defineActions } from "ok-react-data-actions";

const initialData = {
  items: [],
  details: {}
};

defineActions("todos", initialData, (action, reduce) => {
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

### 2. Import Namespace Definitions

Don't forget to import all definitions on app initialization somewhere in your
entry. Like so:

```js
import "actions/todos";
import "actions/projects";
// ...
```

### 3. Use Data and Actions

`ok-react-data-actions` provides following hooks for you to use:
- `useData(namespace)` - returns a data object of specified `namespace`. Whenever
  this object gets updated, your component will be updated as well.
- `useActions(namespace)` - returns object with all actions defined for specified
  `namespace`. This actions can (and should) be used for all data manipulations
- `useDataActions(namespace)` - returns two-object array of namespace data and
  actions.

For example:

```js
import { useEffect } from "react";
import { useData, useActions, useDataActions } from "ok-react-data-actions";

function TodosList() {
  const {items} = useData("todos");
  const {getTodos} = useActions("todos");

  useEffect(getTodos, []);

  return (
    // render list of todos
  );
}

function TodoItem({id}) {
  // `useDataActions` can be used to return both data and actions in single call;
  const [{details}, {getTodo}] = useDataActions("todos");

  useEffect(() => {
    getTodo(id);
  }, [id]);

  return (
    // render single item
  );
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
import { defineActions } from "ok-react-data-actions";
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
import { defineActions } from "ok-react-data-actions";
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
