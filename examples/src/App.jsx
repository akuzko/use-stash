import React from "react";
import { useData } from "../../src";

import UserForm from "./UserForm";
import Todos from "./Todos";
import TodoDetails from "./TodoDetails";
import Logs from "./Logs";

import "./stash";

function clearStorageStore() {
  localStorage.removeItem("App/stash-mixins/localStorageDump");
}

export default function App() {
  const {name} = useData("session");

  if (!name) {
    return <UserForm />;
  }

  return (
    <>
      <div>Hello, { name }!</div>
      <Todos />
      <TodoDetails />
      <Logs />
      <button onClick={ clearStorageStore }>Clear Storage</button>
    </>
  );
}
