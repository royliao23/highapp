import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import InputFeild from "../components/InputFeild";
import TodoList from "../components/ToDoList";
import { Todo } from "../models";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
const Task = () => {
  const [todo, setTodo] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const isLoggedIn = useSelector((state: RootState) => state.counter.login_status);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login if not logged in
    }
  }, [isLoggedIn, navigate]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (todo) {
      setTodos([...todos, { id: Date.now(), todo, isDone: false }]);
      setTodo("");
    }
  };

  

  return (
    <div className="home">
      <div className="content">
        <h1>Taskify</h1>
        <InputFeild todo={todo} setTodo={setTodo} handleAdd={handleAdd} />
        {todos.length > 0 && <TodoList todos={todos} setTodos={setTodos} />}
      </div>
    </div>
  );
}

export default Task
