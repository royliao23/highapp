// Category.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import Modal from "../components/Modal"; // Import the new Modal component

import { Categ } from "../models";

// Styled Components for Styling
const Container = styled.div`
  max-width: 1500px;
  margin: 2rem auto;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const Title = styled.h2`
  text-align: left;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const Th = styled.th`
  padding: 0.8rem;
  background-color: #007bff;
  color: #fff;
`;

const Td = styled.td`
  padding: 0.8rem;
  text-align: center;
  border: 1px solid #ddd;
`;

const DeleteButton = styled.button`
  padding: 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #c82333;
  }
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-top: 2rem;
`;

const ListItem = styled.li`
  padding: 1rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: #fff;
`;

// Inside the category component...

const Category: React.FC = () => {
  const [categorys, setCategories] = useState<Categ[]>([]);
  const [formData, setFormData] = useState<Omit<Categ, "code">>({
    name: "",
  });
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which category is being edited
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categ").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categorys:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll"); // Cleanup on unmount
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value?.toLowerCase()); // Normalize search term for case-insensitive search
  };

  const handleOpenModal = (category?: Categ) => {
    if (category) {
      handleEdit(category);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormData({
      name: "",
    });
    setEditingCode(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingCode !== null) {
        // Update an existing category
        const { error } = await supabase
          .from("categ")
          .update(formData)
          .eq("code", editingCode);

        if (error) throw error;

        // Clear editing state after updating
        setEditingCode(null);
      } else {
        // Add a new category
        const { error } = await supabase.from("categ").insert([formData]);

        if (error) throw error;
      }

      // Refresh the list and reset the form
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category: Categ) => {
    setEditingCode(category.code);
    setFormData({
      name: category.name,
    });
  };

  const handleDelete = async (code: number) => {
    try {
      const { error } = await supabase.from("categ").delete().eq("code", code);
      if (error) throw error;
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Filter categorys dynamically based on the search term
  const filteredCategories = categorys.filter((category) => {
    return (
      category.name?.toLowerCase().includes(searchTerm)
    );
  });

  // Handle Form Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container>
      <Title>Category Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <Button onClick={() => handleOpenModal()}>Add Category</Button>
      </ButtonRow>

      {isMobileView ? (
        <List>
          {filteredCategories.map((category) => (
            <ListItem key={category.code}>
              <strong>Code:</strong> {category.code} <br />
              <strong>Category Name:</strong> {category.name} <br />
              <Button onClick={() => handleOpenModal(category)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(category.code)}>Delete</DeleteButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Category Name</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.code}>
                <Td>{category.code}</Td>
                <Td>{category.name}</Td>

                <Td>
                  <Button onClick={() => handleOpenModal(category)}>Edit</Button>
                </Td>
                <Td>
                  <DeleteButton onClick={() => handleDelete(category.code)}>Delete</DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <Form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              autoComplete="off"
              required
            />
          </div>

          <Button type="submit">Save Category</Button>
        </Form>
      </Modal>
    </Container>
  );
};

export default Category;