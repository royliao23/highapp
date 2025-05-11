import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './mystyles.css';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const token = localStorage.getItem('authToken');

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/posts/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setPosts(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  // Form validation
  const validatePost = (post: Omit<Post, 'id'>) => {
    const errors: Record<string, string> = {};
    if (!post.title.trim()) errors.title = 'Title is required';
    if (!post.body.trim()) errors.body = 'Content is required';
    return errors;
  };

  const handleBlur = (field: keyof Omit<Post, 'id'>) => {
    setTouched({ ...touched, [field]: true });
    const validationErrors = validatePost(editingPost || newPost);
    setErrors(validationErrors);
  };

  // Create post
  const handleCreate = async () => {
    const validationErrors = validatePost(newPost);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:8000/api/posts/',
        newPost,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setPosts([...posts, response.data]);
      setNewPost({ title: '', body: '' });
      setError(null);
    } catch (err) {
      setError('Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update post
  const handleUpdate = async () => {
    if (!editingPost) return;
    
    const validationErrors = validatePost(editingPost);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:8000/api/posts/${editingPost.id}/`,
        editingPost,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setPosts(posts.map(post => post.id === editingPost.id ? response.data : post));
      setEditingPost(null);
      setError(null);
    } catch (err) {
      setError('Failed to update post');
      console.error('Error updating post:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/posts/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setPosts(posts.filter(post => post.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete post');
      console.error('Error deleting post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setTouched({ title: true, body: true });
    if (editingPost) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <div className="home-container">
      <header className="app-header">
        <h1 className="app-title">API Lab</h1>
        <p className="app-description">
          CRUD operations with React state management
        </p>
      </header>

      <div className={`post-form-container ${editingPost ? 'editing-mode' : ''}`}>
        <h2 className="form-title">{editingPost ? 'Edit Post' : 'Create Post'}</h2>
        
        <div className="form-group">
          <label htmlFor="title" className="input-label">Title</label>
          <input
            id="title"
            className={`form-input ${touched.title && errors.title ? 'input-error' : ''}`}
            value={editingPost ? editingPost.title : newPost.title}
            onChange={(e) => 
              editingPost 
                ? setEditingPost({...editingPost, title: e.target.value})
                : setNewPost({...newPost, title: e.target.value})
            }
            onBlur={() => handleBlur('title')}
            placeholder="Enter post title"
          />
          {touched.title && errors.title && (
            <span className="error-text">{errors.title}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="body" className="input-label">Content</label>
          <textarea
            id="body"
            className={`form-textarea ${touched.body && errors.body ? 'input-error' : ''}`}
            value={editingPost ? editingPost.body : newPost.body}
            onChange={(e) => 
              editingPost 
                ? setEditingPost({...editingPost, body: e.target.value})
                : setNewPost({...newPost, body: e.target.value})
            }
            onBlur={() => handleBlur('body')}
            placeholder="Write your post content"
            rows={5}
          />
          {touched.body && errors.body && (
            <span className="error-text">{errors.body}</span>
          )}
        </div>
        
        <div className="form-actions">
          <button
            className={`submit-btn ${editingPost ? 'update-btn' : 'create-btn'}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : editingPost ? (
              'Update Post'
            ) : (
              'Create Post'
            )}
          </button>
          
          {editingPost && (
            <button 
              className="cancel-btn"
              onClick={() => setEditingPost(null)}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="posts-list-container">
        {loading ? (
          <div className="loading-spinner"></div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <h3 className="posts-list-title">Your Posts</h3>
            {posts.length > 0 ? (
              <ul className="posts-grid">
                {posts.map((post) => (
                  <li key={post.id} className="post-card">
                    <div className="post-content">
                      <h4 className="post-title">{post.title}</h4>
                      <p className="post-body">{post.body}</p>
                    </div>
                    <div className="post-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => setEditingPost(post)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(post.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">No posts available</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;