import React, { useState } from "react";
import { useActions } from "../../src";

export default function UserForm() {
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
    <>
      <label>
        Name
        <input placeholder="Please enter your name" value={ name } onChange={ changeName } />
      </label>
      <button onClick={ submit }>Submit</button>
    </>
  );
}
