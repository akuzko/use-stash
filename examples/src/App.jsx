import React, { useEffect } from "react";
import { useData, useActions, useStash } from "../../src";

import "./stash-advanced";

export default function App() {
  const {list, details} = useData("todos");
  const {getTodos, getTodo, removeTodo} = useActions("todos");
  const [{name}, {getSession}] = useStash("session");
  const entries = useData("logs");

  useEffect(() => {
    getTodos();
    getSession();
  }, []);

  return (
    <>
      <div>Hello, { name }!</div>
      { list.length > 0
        ? <ul>
            { list.map((item, i) => (
                <li key={ i }>
                  <div>#{ item.id }: { item.title }</div>
                  <div>
                    <button onClick={ () => getTodo(i) }>Open Details</button>
                    <button onClick={ () => removeTodo(i) }>Remove</button>
                  </div>
                </li>
              ))
            }
          </ul>
        : <div>No Todos</div>
      }
      { details.id &&
        <div>
          <div>Todo Details:</div>
          <div>ID: { details.id }</div>
          <div>Title: { details.title }</div>
          <div>Description: { details.description }</div>
          <div>Status: { details.status }</div>
        </div>
      }
      <div>
        { entries.map((e, i) => (
            <div key={ i }>{ e }</div>
          ))
        }
      </div>
    </>
  );
}
