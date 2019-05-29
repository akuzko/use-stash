import React from "react";
import { useStash } from "../../src";

export default function Logs() {
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
