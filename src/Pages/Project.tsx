import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import Modal from "../components/Modal"; // Import the reusable Modal component
import { Project } from "../models";
import { createProject, deleteProject, fetchProjects, updateProject } from "../api";
// Define the project type based on the table schema

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

// Inside the project component...

const ProjectComp: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<any>({
    id: null, // Optional ID for editing existing projects
    project_name: "",
    manager: "",
    description: "",
    status: "",
  });
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which project is being edited
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchProjectsData = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
  
    useEffect(() => {
      fetchProjectsData();
    }, []);
  
    // ... keep all other useEffect hooks as they are ...
  
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
  
      try {
        if (editingCode !== null) {
          // Update an existing category
          await updateProject(editingCode, formData);
          setEditingCode(null);
        } else {
          // Add a new category
          await createProject(formData);
        }
  
        // Refresh the list and reset the form
        fetchProjectsData();
        handleCloseModal();
      } catch (error) {
        console.error("Error saving category:", error);
      }
    };
  
    const handleDelete = async (project:any) => {
      try {
        await deleteProject(project.id);
        fetchProjectsData(); // Refresh the list
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    };

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
    setSearchTerm(e.target.value.toLowerCase());
    console.log("Search Term:", e.target.value);
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      handleEdit(project);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormData({
      project_name: "",
      manager: "",
      description: "",
      status: "",
    });
    setEditingCode(null);
    setIsModalOpen(false);
  };

  
  const handleEdit = (project: any) => {
    setEditingCode(project.id);
    setFormData({
      project_name: project.project_name,
      manager: project.manager,
      description: project.description,
      status: project.status,
    });
  };

  // Filter projects dynamically based on the search term
  const filteredProjects = projects.filter((project) => {
    return (
      project.project_name.toLowerCase().includes(searchTerm) ||
      project.manager.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm) ||
      project.status.toLowerCase().includes(searchTerm)
    );
  });

  // Handle Form Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container>
      <Title>Project Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={ handleSearchChange } />
        <Button onClick={() => handleOpenModal()}>Add Project</Button>
      </ButtonRow>

      {isMobileView ? (
        <List>
          {filteredProjects.map((project) => (
            <ListItem key={project.id}>
              <strong>Project ID:</strong> {project.id} <br />
              <strong>Project Name:</strong> {project.project_name} <br />
              <strong>Manager:</strong> {project.manager} <br />
              <strong>Description:</strong> {project.description} <br />
              <strong>Status:</strong> {project.status} <br />
              <Button onClick={() => handleOpenModal(project)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(project)}>Delete</DeleteButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Project Name</Th>
              <Th>Manager</Th>
              <Th>Description</Th>
              <Th>Status</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <Td>{project.id}</Td>
                <Td>{project.project_name}</Td>
                <Td>{project.manager}</Td>
                <Td>{project.description}</Td>
                <Td>{project.status}</Td>
                <Td>
                  <Button onClick={() => handleOpenModal(project)}>Edit</Button>
                </Td>
                <Td>
                  <DeleteButton onClick={() => handleDelete(project)}>Delete</DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Reusable Modal Component */}
      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <Form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="project_name">Project Name</label>
            <Input
              id="project_name"
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleInputChange}
              placeholder="Project Name"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label htmlFor="manager">Manager</label>
            <Input
              id="manager"
              type="text"
              name="manager"
              value={formData.manager}
              onChange={handleInputChange}
              placeholder="Manager"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <Input
              id="description"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label htmlFor="status">Status</label>
            <Input
              id="status"
              type="text"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              placeholder="Status"
              autoComplete="off"
            />
          </div>

          <Button type="submit">Save Project</Button>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProjectComp;