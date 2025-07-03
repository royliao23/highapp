import React, { useEffect, useState } from "react";

interface User {
  name: string;
}
const Home: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    
    setTimeout(() => {
      const ws = new WebSocket("ws://localhost:4000");
      ws.onopen = () => console.log("WebSocket connected.");
      ws.onerror = (error) => console.error("WebSocket error:", error);
      ws.onclose = () => console.log("WebSocket closed.");

      ws.onmessage = (event) => {
          try {
              const data = JSON.parse(event.data);
              setUsers(data);
          } catch (error) {
              console.error("Error parsing WebSocket message:", error);
          }
      };

      return () => ws.close();
  }, 500);
    
}, []);

  return (
    <div className="home">
      <h1>Home</h1>
      <p>A reactive typescript page frontend for construction project management!!</p>
            <ul>
                {users.map((user, index) => (
                    <li key={index}>{user.name}</li>
                ))}
            </ul>
      
    </div>
  );
};

export default Home;