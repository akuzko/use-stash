import React from "react";
import { useData, useActions } from "./hooks";

function mapDataToProps(dataMapping) {
  const dataProps = {};

  for (const name in dataMapping) {
    dataProps[name] = useData(dataMapping[name]);
  }

  return dataProps;
}

function mapActionsToProps(actionsMapping) {
  const actionProps = {};

  for (const name in actionsMapping) {
    const [ns, action] = actionsMapping[name].split(".");
    const actions = useActions(ns);

    actionProps[name] = actions[action];
  }

  return actionProps;
}

// Example:
//   withData({
//     username: "sessions.name"
//     todos: "todos.list.items",
//     expandedId: "todos.details.id"
//   })(MyComponent);
export function withData(dataMapping) {
  return function(Component) {
    return function DataComponent(props) {
      const dataProps = mapDataToProps(dataMapping);

      return <Component { ...props } { ...dataProps } />;
    }

    DataComponent.displayName = `Data(${Component.displayName})`;
  }
}

// Example:
//   withActions({
//     getSession: "sessions.getSession",
//     getTodos: "todos.getTodos",
//     getTodo: "todos.getTodoDetails"
//   })(MyComponent);
export function withActions(actionsMapping) {
  return function(Component) {
    return function ActionsComponent(props) {
      const actionProps = mapActionsToProps(actionsMapping);

      return <Component { ...props } { ...actionProps } />;
    }

    ActionsComponent.displayName = `Actions(${Component.displayName})`;
  }
}

// Example:
//   withStash({
//     username: "sessions.name"
//     todos: "todos.list.items",
//     expandedId: "todos.details.id"
//   }, {
//     getSession: "sessions.getSession",
//     getTodos: "todos.getTodos",
//     getTodo: "todos.getTodoDetails"
//   })(MyComponent);
export function withStash(dataMapping, actionsMapping) {
  return function(Component) {
    return function StashComponent(props) {
      const dataProps = mapDataToProps(dataMapping);
      const actionProps = mapActionsToProps(actionsMapping);

      return <Component { ...props } { ...dataProps } { ...actionProps } />;
    }

    StashComponent.displayName = `Stash(${Component.displayName})`;
  }
}
