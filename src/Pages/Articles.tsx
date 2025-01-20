import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Article } from "../models";

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [newArticle, setNewArticle] = useState<Article>({
    id: 0,
    title: "",
    desc: "",
    year: new Date().getFullYear(),
    author: { id: 0, name: "", age: undefined },
  });

  // Fetch articles from the database
  useEffect(() => {
    const fetchArticles_supa = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("article")
          .select("id, title, desc, year, author (id, name, age)");

        if (error) throw error;

        const formattedData: Article[] = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          desc: item.desc,
          year: item.year,
          author: item.author
            ? { id: item.author.id, name: item.author.name, age: item.author.age }
            : undefined,
        }));

        setArticles(formattedData);
      } catch (error: any) {
        console.error("Error fetching articles:", error.message);
      } finally {
        setLoading(false);
      }
    };

    

    const fetchArticles = async (): Promise<void> => {
      setLoading(true);
      try {
        const API_URL = "https://royliao.pythonanywhere.com/api/article/?search=fl";
        const TOKEN = "Token 8854d62680edf3c63c27ee8bf6d2c320cb902f51";
    
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: TOKEN,
          },
        });
    
        if (!response.ok) {
          throw new Error(`Failed to fetch articles: ${response.statusText}`);
        }
    
        const data = await response.json();
    
        // Transform the API response to match the Article type
        const formattedData: Article[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          desc: item.desc,
          year: parseInt(item.year, 10), // Convert year to a number
          author: item.author_name
            ? { id: item.author, name: item.author_name, age: undefined }
            : undefined,
        }));
    
        setArticles(formattedData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching articles:", error.message);
        } else {
          console.error("Unknown error occurred while fetching articles");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
    
  }, []);

  // Handle article creation
  const handleCreate_supa = async () => {
    try {
      const { data, error } = await supabase
        .from("article")
        // .insert([{ ...newArticle, author: newArticle.author }])
        .insert([{ ...newArticle, author: 1 }])
        .select();

      if (error) throw error;
      setArticles((prev) => [...prev, ...data]);
      setNewArticle({
        id: 0,
        title: "",
        desc: "",
        year: new Date().getFullYear(),
        author: { id: 0, name: "", age: undefined },
      });
    } catch (error: any) {
      console.error("Error creating article:", error.message);
    }
  };

  const handleCreate = async (): Promise<void> => {
    try {
      const API_URL = "https://royliao.pythonanywhere.com/api/article/";
      const TOKEN = "Token 8854d62680edf3c63c27ee8bf6d2c320cb902f51";
  
      const payload = {
        title: newArticle.title || "",
        author: 1,
        desc: newArticle.desc || "",
        year: (newArticle.year ?? new Date().getFullYear()).toString(),
      };
  
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create article: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Transform the API response to match the Article type
      const newArticleFromResponse: Article = {
        id: data.id,
        title: data.title,
        desc: data.desc,
        year: parseInt(data.year, 10), // Convert year to a number
        author: { id: data.author, name: data.author_name, age: undefined }, // Adapt to match Article type
      };
  
      // Update the articles state
      setArticles((prev) => [...prev, newArticleFromResponse]);
  
      // Reset the newArticle state
      setNewArticle({
        id: 0,
        title: "",
        desc: "",
        year: new Date().getFullYear(),
        author: { id: 0, name: "", age: undefined },
      });
  
      console.log("Article created successfully:", newArticleFromResponse);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating article:", error.message);
      } else {
        console.error("Unknown error occurred while creating article");
      }
    }
  };
  

  const handleUpdate_supa = async () => {
    try {
      if (!editingArticle) return;

      const { data, error } = await supabase
        .from("article")
        .update({
          title: editingArticle.title,
          desc: editingArticle.desc,
          year: editingArticle.year,
          author: editingArticle.author,
        })
        .eq("id", editingArticle.id);

      if (error) throw error;

      if (data && Array.isArray(data)) {
        setArticles((prev) =>
          prev.map((article) =>
            article.id === editingArticle.id ? data[0] : article
          )
        );
      }

      setEditingArticle(null);
    } catch (error: any) {
      console.error("Error updating article:", error.message);
    }
  };

  const handleUpdate = async (): Promise<void> => {
    try {
      if (!editingArticle) return;
  
      // Check if author exists
      if (!editingArticle.author || editingArticle.author.id === undefined) {
        throw new Error("Author is not defined for the article.");
      }
  
      const API_URL = `https://royliao.pythonanywhere.com/api/article/${editingArticle.id}/`;
      const TOKEN = "Token 8854d62680edf3c63c27ee8bf6d2c320cb902f51";
  
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
        body: JSON.stringify({
          title: editingArticle.title,
          desc: editingArticle.desc,
          year: editingArticle.year, // Assume year is always defined
          author: editingArticle.author.id, // Use author ID
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update article: ${response.statusText}`);
      }
  
      const updatedArticle = await response.json();
  
      // Update the articles list with the updated article
      setArticles((prev) =>
        prev.map((article) =>
          article.id === editingArticle.id
            ? {
                ...article,
                ...updatedArticle,
                year: parseInt(updatedArticle.year, 10), // Ensure year is a number
                author: {
                  id: updatedArticle.author,
                  name: updatedArticle.author_name,
                  age: article.author?.age || undefined, // Retain existing age or set as undefined
                },
              }
            : article
        )
      );
  
      setEditingArticle(null); // Clear editing state after successful update
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating article:", error.message);
      } else {
        console.error("Unknown error occurred while updating the article");
      }
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const API_URL = `https://royliao.pythonanywhere.com/api/article/${id}/`;
      const TOKEN = "Token 8854d62680edf3c63c27ee8bf6d2c320cb902f51";
  
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          Authorization: TOKEN, // Authentication token
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete article: ${response.statusText}`);
      }
  
      // Remove the deleted article from the state
      setArticles((prev) => prev.filter((article) => article.id !== id));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error deleting article:", error.message);
      } else {
        console.error("Unknown error occurred while deleting the article");
      }
    }
  };
  
  // Handle article deletion
  const handleDelete_supa = async (id: number) => {
    try {
      const { error } = await supabase.from("article").delete().eq("id", id);

      if (error) throw error;

      setArticles((prev) => prev.filter((article) => article.id !== id));
    } catch (error: any) {
      console.error("Error deleting article:", error.message);
    }
  };

  

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="articles">
      <h1>Articles</h1>

      {/* Table for displaying articles */}
      <table className="articles-table">
        <thead>
          <tr>
            <th>ID</th>
            <th className={window.innerWidth >= 600 ? "yesdescription" : "nodescription"}>Title</th>
            <th className={window.innerWidth >= 600 ? "yesdescription" : "nodescription"}>Description</th>
            <th>Year</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>{article.id}</td>
              <td className={window.innerWidth >= 600 ? "yesdescription" : "nodescription"}>{article.title}</td>
              <td className={window.innerWidth >= 600 ? "yesdescription" : "nodescription"}>{article.desc || "No description"}</td>
              <td>{article.year}</td>
              <td>
                {article.author?.name || "Unknown"} (Age: {article.author?.age || "N/A"})
              </td>
              <td>
                <button onClick={() => setEditingArticle(article)}>Edit</button>
                <button onClick={() => handleDelete(article.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form for creating/editing articles */}
      <div className="article-form">
        <h2>{editingArticle ? "Edit Article" : "Add New Article"}</h2>
        <input
          type="text"
          placeholder="Title"
          value={editingArticle ? editingArticle.title : newArticle.title}
          onChange={(e) =>
            editingArticle
              ? setEditingArticle({ ...editingArticle, title: e.target.value })
              : setNewArticle({ ...newArticle, title: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Description"
          value={editingArticle ? editingArticle.desc : newArticle.desc}
          onChange={(e) =>
            editingArticle
              ? setEditingArticle({ ...editingArticle, desc: e.target.value })
              : setNewArticle({ ...newArticle, desc: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Year"
          value={editingArticle ? editingArticle.year : newArticle.year}
          onChange={(e) =>
            editingArticle
              ? setEditingArticle({ ...editingArticle, year: +e.target.value })
              : setNewArticle({ ...newArticle, year: +e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Author Name"
          value={editingArticle ? editingArticle.author?.name : newArticle.author?.name}
          onChange={(e) =>
            editingArticle
              ? setEditingArticle({
                  ...editingArticle,
                  author: { ...editingArticle.author, name: e.target.value },
                })
              : setNewArticle({ ...newArticle, author: { ...newArticle.author, name: e.target.value } })
          }
        />
        <input
          type="number"
          placeholder="Author Age"
          value={editingArticle ? editingArticle.author?.age : newArticle.author?.age}
          onChange={(e) =>
            editingArticle
              ? setEditingArticle({
                  ...editingArticle,
                  author: { ...editingArticle.author, age: +e.target.value },
                })
              : setNewArticle({ ...newArticle, author: { ...newArticle.author, age: +e.target.value } })
          }
        />
        <button onClick={editingArticle ? handleUpdate : handleCreate}>
          {editingArticle ? "Update Article" : "Add Article"}
        </button>
        {editingArticle && <button onClick={() => setEditingArticle(null)}>Cancel</button>}
      </div>
    </div>
  );
};

export default Articles;
