import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { MdDone } from "react-icons/md";
import { Todo } from "../models";
import { supabase } from "../supabaseClient";

const SingleTodo: React.FC<{
  todo: Todo;
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}> = ({ todo, todos, setTodos }) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [editTodo, setEditTodo] = useState<string>(todo.todo);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [edit]);

  // Edit handler
  const handleEdit = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("task")
        .update({ todo: editTodo })
        .eq("id", id);

      if (error) {
        console.error("Error updating todo:", error.message);
        return;
      }

      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, todo: editTodo } : todo
        )
      );
      setEdit(false);
    } catch (err) {
      console.error("Unexpected error updating todo:", err);
    }
  };

  // Delete handler
  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("task").delete().eq("id", id);

      if (error) {
        console.error("Error deleting todo:", error.message);
        return;
      }

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error("Unexpected error deleting todo:", err);
    }
  };

  // Mark as done/undone handler
  const handleDone = async (id: number) => {
    const updatedTodo = todos.find((todo) => todo.id === id);
    if (!updatedTodo) return;

    try {
      const { error } = await supabase
        .from("task")
        .update({ isDone: !updatedTodo.isDone })
        .eq("id", id);

      if (error) {
        console.error("Error toggling todo status:", error.message);
        return;
      }

      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
        )
      );
    } catch (err) {
      console.error("Unexpected error toggling todo status:", err);
    }
  };

  return (
    <form className="todos__single" onSubmit={(e) => handleEdit(e, todo.id)}>
      {edit ? (
        <input
          value={editTodo}
          onChange={(e) => setEditTodo(e.target.value)}
          className="todos__single--text"
          ref={inputRef}
        />
      ) : todo.isDone ? (
        <s className="todos__single--text">{todo.todo}</s>
      ) : (
        <span className="todos__single--text">{todo.todo}</span>
      )}
      <div>
        <span
          className="icon"
          onClick={() => {
            if (!edit && !todo.isDone) {
              setEdit(!edit);
            }
          }}
        >
          <AiFillEdit />
        </span>
        <span className="icon" onClick={() => handleDelete(todo.id)}>
          <AiFillDelete />
        </span>
        <span className="icon" onClick={() => handleDone(todo.id)}>
          <MdDone />
        </span>
      </div>
    </form>
  );
};

export default SingleTodo;
