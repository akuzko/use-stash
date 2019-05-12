import React, { useState, useEffect } from "react";
import { useData, useActions, useStash } from "../../src";

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

function UserForm() {
  const [name, setName] = useState("");
  const changeName = (e) => {
    setName(e.target.value);
  };
  const {setName: doSetName} = useActions("session");
  const submit = () => {
    if (!name) {
      alert("Please enter your name");
    } else {
      doSetName(name);
    }
  };

  return (
    <div className="name-form-wrapper">
      <div className="profile-icon">
        <div className="profile-photo" />
      </div>
      <div className="layout horizontal center name-form">
        <input
          placeholder="Please enter your name"
          value={ name }
          onChange={ changeName }
          className="input no-border mr-20"
        />
        <button onClick={ submit } className="button blue">
          Submit
        </button>
      </div>
    </div>
  );
}

function Todos() {
  const list = useData("todos.list");
  const {getTodos, getTodo, toggleTodo, removeTodo} = useActions("todos");

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <>
      { list.length > 0
        ? <ul>
            { list.map((item, i) => (
                <li key={ i }>
                  <div>#{ item.id }: { item.title }</div>
                  <div>
                    <label>
                      Completed
                      <input
                        type="checkbox"
                        checked={ item.completed ? true : false }
                        onChange={ () => toggleTodo(item.id) }
                      />
                    </label>
                    <button onClick={ () => getTodo(item.id) }>Open Details</button>
                    <button onClick={ () => removeTodo(item.id) }>Remove</button>
                  </div>
                </li>
              ))
            }
          </ul>
        : <div>No Todos</div>
      }
    </>
  );
}

function TodoDetails() {
  const details = useData("todos.details");

  if (!details.id) {
    return null;
  }

  return (
    <>
      <div>Todo Details:</div>
      <div>ID: { details.id }</div>
      <div>Title: { details.title }</div>
      <div>Description: { details.description }</div>
      <div>Status: { details.completed ? "DONE" : "TODO" }</div>
    </>
  );
}

function Logs() {
  const [entries, {clear}] = useStash("logs");

  return (
    <>
      <ul>
        { entries.map((e, i) => (
            <li key={ i }>{ e }</li>
          ))
        }
      </ul>
      <button onClick={ clear }>Clear Logs</button>
    </>
  );
}
