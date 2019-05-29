import React, { useEffect } from "react";
import { useData, useActions } from "../../src";

export default function Todos() {
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
