import axios from "axios";
import React, { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  body: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<Omit<Post, 'id'>>({ title: '', body: '' });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("authToken");

  // Fetch all posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/api/posts/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setPosts(response.data);
      } catch (error) {
        setError("Error fetching posts");
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  // Create a new post
  const handleCreate = async () => {
    if (!newPost.title || !newPost.body) {
      setError("Title and body are required");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/posts/",
        newPost,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPosts([...posts, response.data]);
      setNewPost({ title: '', body: '' });
      setError(null);
    } catch (error) {
      setError("Error creating post");
      console.error("Error creating post:", error);
    }
  };

  // Update a post
  const handleUpdate = async () => {
    if (!editingPost) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/api/posts/${editingPost.id}/`,
        editingPost,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPosts(posts.map(post => post.id === editingPost.id ? response.data : post));
      setEditingPost(null);
      setError(null);
    } catch (error) {
      setError("Error updating post");
      console.error("Error updating post:", error);
    }
  };

  // Delete a post
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/posts/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setPosts(posts.filter(post => post.id !== id));
      setError(null);
    } catch (error) {
      setError("Error deleting post");
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="home">
      <h1>Test Api</h1>

      {/* Create Post Form */}
      <div className="post-form">
        <h2>{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
        <input
          type="text"
          placeholder="Title"
          value={editingPost ? editingPost.title : newPost.title}
          onChange={(e) => 
            editingPost 
              ? setEditingPost({...editingPost, title: e.target.value})
              : setNewPost({...newPost, title: e.target.value})
          }
        />
        <textarea
          placeholder="Body"
          value={editingPost ? editingPost.body : newPost.body}
          onChange={(e) => 
            editingPost 
              ? setEditingPost({...editingPost, body: e.target.value})
              : setNewPost({...newPost, body: e.target.value})
          }
        />
        {editingPost ? (
          <>
            <button onClick={handleUpdate}>Update Post</button>
            <button onClick={() => setEditingPost(null)}>Cancel</button>
          </>
        ) : (
          <button onClick={handleCreate}>Create Post</button>
        )}
      </div>

      {/* Error Message */}
      {error && <div className="error">{error}</div>}

      {/* Posts List */}
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <ul className="posts-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <li key={post.id} className="post-item">
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <div className="post-actions">
                  <button onClick={() => setEditingPost(post)}>Edit</button>
                  <button onClick={() => handleDelete(post.id)}>Delete</button>
                </div>
              </li>
            ))
          ) : (
            <li>No posts available</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Home;