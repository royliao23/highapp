import React, { useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import InputFeild from "../components/InputFeild";
import TodoList from "../components/ToDoList";
import { Todo } from "../models";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { supabase } from "../supabaseClient";

const Task =  () => {
  const [todo, setTodo] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const isLoggedIn = useSelector((state: RootState) => state.counter.login_status);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login if not logged in
    }
  }, [isLoggedIn, navigate]);

  // Fetch todos from Supabase when the component mounts
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data, error } = await supabase
          .from("task")
          .select("id, todo, isDone");

        if (error) {
          console.error("Error fetching todos:", error.message);
        } else {
          // Update the todos state with fetched data
          setTodos(data as Todo[]);
        }
      } catch (err) {
        console.error("Unexpected error fetching todos:", err);
      }
    };

    fetchTodos();
  }, [setTodos]); // Dependency ensures the function runs only when `setTodos` changes

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (todo) {
      const newTask = { id: Date.now(), todo, isDone: false };
      setTodos([...todos, { id: Date.now(), todo, isDone: false }]);
      try {
        // Save the new task to the Supabase task table
        const { data, error } = await supabase
          .from("task")
          .insert(newTask);
  
        if (error) {
          console.error("Error adding task:", error.message);
        } else {
          console.log("Task added:", data);
  
          // Update local state with the new task
          setTodos([...todos, newTask]);
  
          // Clear the input field
          setTodo("");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }

      setTodo("");
    
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
