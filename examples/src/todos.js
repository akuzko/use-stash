const todos = [{
  id: 1,
  title: "Do Something",
  description: "Do something important",
  completed: true
}, {
  id: 2,
  title: "Publish Package",
  description: "Publish NPM package",
  completed: false
}, {
  id: 3,
  title: "Add CSS",
  description: "Add CSS to example Application",
  completed: false
}];

export function get(path) {
  return new Promise((resolve) => {
    const id = path.split("/todos/")[1];

    if (id) {
      resolve({...todos.find(todo => todo.id == id)});
    } else {
      resolve(todos.map(({id, title, completed}) => ({id, title, completed})));
    }
  });
}

export function patch(path) {
  return new Promise((resolve) => {
    const id = path.match(/\/todos\/(\d+)\/toggle/)[1];
    const todo = todos.find(todo => todo.id == id);

    todo.completed = !todo.completed;

    resolve(todo.completed);
  });
}

export function destroy(path) {
  return new Promise((resolve) => {
    const id = path.split("/todos/")[1];
    const index = todos.findIndex(todo => todo.id == id);

    todos.splice(index, 1);

    resolve();
  });
}
