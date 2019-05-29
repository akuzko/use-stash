import React from "react";
import { useData } from "../../src";

export default function TodoDetails() {
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
