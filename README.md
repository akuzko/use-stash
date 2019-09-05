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

`use-stash` provides following hooks for you to use

#### `useData(path)`

Returns a data object specified by `path`. The simplest value of `path` is
namespace name itself. But it can also represent deeply nested value
(see **Granular Data Access** section bellow). Whenever this value gets
updated, your component will be updated as well.

Usage example is provided in *useActions* section bellow.

#### `useActions(namespace)`

Returns object with all actions defined for specified `namespace`. This actions
can (and should) be used for all data manipulations.

Example:

```js
import { useEffect } from "react";
import { useData, useActions } from "use-stash";

function TodosList() {
  const {items} = useData("todos");
  const {getTodos} = useActions("todos");

  useEffect(() => {
    getTodos();
  }, []);

  return (
    // render list of todos
  );
}
```

#### `useStash(namespace)`

Returns two-object array of namespace data and actions.

Example:

```js
import { useEffect } from "react";
import { useStash } from "use-stash";

function TodoItem({id}) {
  const [{details}, {getTodo}] = useStash("todos");

  useEffect(() => {
    getTodo(id);
  }, [id]);

  return (
    // render details for single item
  );
}
```

### Stash instance API

When defining a new stash namespace, corresponding `Stash` instance is passed to
setup function, ready for you to destructure it for convenient usage. Each
instance of `Stash` is bound to specific namespace and has following
properties/methods:

#### `namespace`

Returns name of stash namespace. On definition, corresponds to first argument
that is passed to `defStash` function.

#### `defAction(name, fn)`

Defines an action identified by `name` under Stash's namespace that can then be
used via `useActions` / `useStash` hooks. `fn` is the function that represents
a body of the action.

#### `reduce([descriptor], fn)`

Updates data related to Stash namespace. Mandatory `fn` reducer function should
take a single argument - current Stash data and return a new data. There should
be no objects updated in-place. Optional `descriptor` parameter can provide
auxiliary information on what reducer logic is about. It is not required, but
may be consumed by _mixins_, such as *logger* mixin (see bellow). Despite the
fact it is optional, it comes as first argument due to better readability
when given.

Examples:

```js
// no descriptor
defAction("addItem", (item) => {
  reduce(data => [...data, item]);
});

// simple string descriptor
defAction("addItem", (item) => {
  reduce("addItem", data => [...data, item]);
});

// array descriptor with additional data
defAction("addItem", (item) => {
  reduce(["addItem", item], data => [...data, item]);
});
```

#### `get([path])`

Returns namespace-scope data at specified `path`. Uses [`get-lookup`](https://www.npmjs.com/package/get-lookup)
for path resolution. If `path` is not provided, returns namespace data object
itself.

#### `callAction(actionName, ...actionArgs)`

Calls an action `actionName`, passing `actionArgs` to the function that was
used for this action definition via `defAction` function.

#### `ns(namespace)`

Returns a `Stash` instance for other namespace. This instance can be used for
all sorts of things - gettings necessary data, calling actions, even reducing
(changing) it's data, etc.

#### `mixin(mixin)`

Adds a mixin (see *mixins* section bellow), scoped to this stash namespace.

#### `mixout(mixin)`

Removes mixin from list of mixins applied for this stash namespace. Can be used,
for instance, to opt-out mixin that was globally applied.

### Common Use-Cases

#### Granular Data Access

Usually it may be much more efficient to use only small piece of data stored
in namespace. This way your component will be re-rendered only if that small piece
gets changed. To do so, you simply have to pass full path to the object you
are interested in to `useData` hook call. `use-stash` uses
[`get-lookup`](https://www.npmjs.com/package/get-lookup) package for fetching
deeply nested values. For example:

```js
function ItemStatus({id}) {
  const status = useData(`todos.list.items.{id:${id}}.status`);

  return <div>{ status.toUpperCase() }</div>;
}
```

This component will be re-rendered only if status of item with corresponding
value of `id` property in `todos.list.items` array changes.

Also, as can be seen from the example above, it is OK to use dynamic data paths,
i.e. the ones that depend on changeable props or state values.

#### Accessing Data in Actions

You can use `get` method of `Stash` instance to access data of corresponding namespace:

```js
defStash("todos", initialState, ({defAction, reduce, get}) => {
  defAction("removeTodo", (index) => {
    const id = get(`list.${index}.id`);

    reduce((data) => {
      return {...data, list: data.list.filter(item => item.id !== id)};
    });
  });
});
```

#### Cross-namespace Interaction

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

### Mixins

Mixins are the way to add custom functionality to the one `use-stash` provides.
In essence, mixins are simple functions that take `stash` instance as first
mandatory argument and return an object with overloaded stash props. Any
arguments passed to `mixin` function when applying mixin will be also passed to
mixin function itself.

Mixins can be global, i.e. ones that apply to all defined namespaces and local,
applied individually by each namespace.

For instance, if we want to have a mixin that makes stash data available for
inspection at browser's console (via `window` object), it may look like this:

```js
window.appData = {};

export default function inspector(stash) {
  const {namespace, init, reduce, get} = stash;

  return {
    init(data) {
      window.appData[namespace] = data;
      init(data);
    },

    reduce(...args) {
      reduce(...args);
      window.appData[namespace] = get();
    }
  };
}
```

And then, to add this mixin globally, i.e. to apply it to every defined
stash namespace, we need a single function call:

```js
import { mixin } from "use-stash";

mixin(inspector);
```

To apply mixin only to specific stash namespace, we can use `Stash#mixin` function
available on stash namespace definition, i.e.:

```js
defStash("inspectedStash", initial, ({mixin}) => {
  const {defAction, reduce} = mixin(inspector);

  // rest of definitions
});
```

It is important to notice here that methods used for stash namespace definition
are destructurized from the result of `mixin` function call, i.e. *after*
mixin has been applied.

It is also possible to exclude mixin for single namespace if it has been globally
applied before. For this you can use `Stash#mixout` function:

```js
defStash("isolatedStash", initial, ({mixout}) => {
  const {defAction, reduce} = mixout(inspector);

  // rest of definitions
});
```

Just like with local `mixin` function, methods used for stash namespace definition
should be destructurized from `mixout` function call result.

#### `mixins/logger`

Provided out-of-the-box, `logger` mixin function adds logging support to stash
action calls and data reducing in colorful and readable way. It also makes use
of descriptor string/object that can be passed as first argument of `reduce` function.

By default, it colors logs for each namespace in it's own color (cycling through
presets), but colors for each namespace can be set up manually via `colors`
configuration option:

```js
import { mixin } from "use-stash";
import { logger } from "use-stash/mixins";

if (__DEV__) {
  mixin(logger, {
    colors: {
      todos: "blue"
    }
  });
}
```

And later on, for `todos` namespace we define, we can take advantage of having
reducer's descriptor logged:

```js
defStash("todos", initialData, ({defAction, reduce}) => {
  defAction("getTodos", () => {
    fetch("/api/todos")
      .then(response => response.json())
      .then(items => reduce("getTodosSuccess", data => ({...data, items})));
  });

  defAction("getTodo", (id) => {
    fetch(`/api/todos/${id}`)
      .then(response => response.json())
      .then((details) => {
        reduce(["getTodoSuccess", details], data => ({...data, details}))
      });
  });
});
```

It is also possible to prevent certain actions and reductions to be logged,
in case if they happen very frequently and you don't want them to spam console's
output. Such actions and reducers should be specified in the `except` mixin option:

```js
mixin(logger, {
  except: ["todos.toggleTodo"]
});
```

#### `mixins/actionReducer`

Generic stash reducer functions are not bound to actions they have originated
due to async nature of data update flow (they only keep track of the latest action
being invoked). Since main purpose of `use-stash` is productivity and simplicity,
for easier development and logging it is possible to use per-action reducer functions.
Such reducers will generate descriptors corresponding to action they are bound to:

```js
import { mixin } from "use-stash";
import { actionReducer } from "use-stash/mixins";

mixin(actionReducer);
````
Make sure to add this mixin *after* adding `logger` mixin (see above). And the
you can have:

```js
defStash("todos", initialData, ({defAction}) => {
  defAction("getTodos", () => (reduce) => {
    fetch("/api/todos")
      .then(response => response.json())
      .then(items => reduce(data => ({...data, items})));
  });

  defAction("getTodo", (id) => {
    fetch(`/api/todos/${id}`)
      .then(response => response.json())
      .then((details) => {
        reduce.success(data => ({...data, details}), [details]);
        // ^ the last optional array argument specifies additional
        //   data to be logged
      });
  });
});
```
Bellow you can see examples of what action reducer function correspond to:

```js
defStash("todos", ({defAction, reduce: stashReduce}) => {
  defAction("getTodo", (id) => (reduce) => {
    // ...
    reduce(() => data);                // stashReduce("getTodo", () => data);
    reduce(() => data, [data]);        // stashReduce(["getTodo", data], () => data);
    reduce.success(() => data);        // stashReduce("getTodoSuccess", () => data);
    reduce.success(() => data, [data]) // stashReduce(["getTodoSuccess", data], () => data);
    reduce.failure(() => ({}));        // stashReduce("getTodoFailure", () => ({}));
  });
});
````


### HOCs for Class Components

For hook-less class-based React components you can use HOC-based approach. For this,
`use-stash` provides 3 helper functions, similar to hooks: `withData`, `withActions`
and `withStash`. The latter mixes functionality of the former two.

#### `withData(dataMapping)`

Allows to pass stash data to connected component's props. `dataMapping` is a plain
object, whose keys are prop names and values are paths to data that component is
interested in.

Example:

```js
const HocPage = withData({
  username: "session.name",
  todos: "todos.list.items",
  logEntries: "logs"
})(Page);
```

In this example, underlying `Page` component will receive `username`, `todos`
and `logEntries` props with values obtained from 3 different stash namespaces.

#### `withActions(actionsMapping)`

Allows to pass stash actions to connected component's props. `actionsMapping`
is a plain object, whose keys are prop names and values are strings that specify
stash namespace and action name, separated by dot.

Example:

```js
const HocLayout = withActions({
  fetchSession: "session.getSession"
})(Layout);
```

In this example, underlying `Layout` component will receive `fetchSession` prop,
which is a function corresponding to `getSession` action of `session` namespace.

#### `withStash(dataMapping, actionsMapping)`

Allows to pass both data and actions to connected component. A combination of
`withData` and `withActions`.

Example:

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
