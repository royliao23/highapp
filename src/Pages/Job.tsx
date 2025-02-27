import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import JobModal from "../components/JobModal";
import { fetchJobService } from "../services/SupaEndPoints";
import { PaginationContainer } from "../StyledComponent";
// Define the job type based on the table schema
interface Job {
  code: number;
  job_category_id: number;
  name: string;
  description: string;
}

interface Categ {
  code: number;
  name: string;
}

// (Existing styled-components code...)
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

const JobComp: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [formData, setFormData] = useState<Omit<Job, "code">>({
    job_category_id: 0,
    name: "",
    description: "",
  });
  
  const [editingCode, setEditingCode] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [jobCategoryOptions, setJobCategoryOptions] = useState<
    { value: number; label: string }[]
  >([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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

  const fetchJobs = async () => {
    const jobData = await fetchJobService();
    if (jobData) setJobs(jobData);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categ").select("*");
      if (error) throw error;

      const transformedData = data.map((item) => ({
        value: item.code,
        label: item.name,
      }));

      setJobCategoryOptions(transformedData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, []);

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingCode(job.code);
      setFormData({
        job_category_id: job.job_category_id,
        name: job.name,
        description: job.description,
      });
    } else {
      setEditingCode(null);
      setFormData({
        job_category_id: 0,
        name: "",
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingCode !== null) {
        await supabase
          .from("job")
          .update(formData)
          .eq("code", editingCode);
      } else {
        await supabase.from("job").insert([formData]);
      }
      fetchJobs();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDropChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (code: number) => {
    try {
      const { error } = await supabase.from("job").delete().eq("code", code);
      if (error) throw error;
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  // Function to handle adding a new category
  const handleAddCategory = async (newCategory: { value: number; label: string }) => {
    try {
      // Save the new category to the database
      const { data, error } = await supabase
        .from("categ")
        .insert([{ name: newCategory.label }])
        .select();

      if (error) throw error;

      // Update the jobCategoryOptions state with the new category
      if (data && data.length > 0) {
        const addedCategory = data[0];
        setJobCategoryOptions((prevOptions) => [
          ...prevOptions,
          { value: addedCategory.code, label: addedCategory.name },
        ]);
      }

      // Refresh the categories list
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Filter jobs dynamically based on the search term
  const filteredJobs = jobs.filter((job) => {
    return (
      (job.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (job.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  return (
    <Container>
      <Title>Job Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={(e) => setSearchTerm(e.target.value)} />
        <Button onClick={() => handleOpenModal()}>Add Job</Button>
      </ButtonRow>
      {/* Pagination Controls */}
    <PaginationContainer>
      {Array.from({ length: totalPages }, (_, index) => (
        <Button
          key={index}
          onClick={() => handlePageChange(index + 1)}
          style={{ 
            margin: "0 5px", 
            backgroundColor: currentPage === index + 1 ? "#007bff" : "#ddd" 
          }}
        >
          {index + 1}
        </Button>
      ))}
    </PaginationContainer>
      {isMobileView ? (
        <List>
          {paginatedJobs.map((job) => (
            <ListItem key={job.code}>
              <strong>Job Code:</strong> {job.code} <br />
              <strong>Name:</strong> {job.name} <br />
              <strong>Description:</strong> {job.description} <br />
              <strong>Category:</strong> {jobCategoryOptions.find((option) => option.value === job.job_category_id)?.label || "Unknown"} <br />
              <Button onClick={() => handleOpenModal(job)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(job.code)}>Delete</DeleteButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Job Code</Th>
              <Th>Job Name</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.map((job) => (
              <tr key={job.code}>
                <Td>{job.code}</Td>
                <Td>{job.name}</Td>
                <Td>{job.description}</Td>
                <Td>{jobCategoryOptions.find((option) => option.value === job.job_category_id)?.label || "Unknown"}</Td>
                <Td>
                  <Button onClick={() => handleOpenModal(job)}>Edit</Button>
                </Td>
                <Td>
                  <DeleteButton onClick={() => handleDelete(job.code)}>Delete</DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      <JobModal
        show={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        onDropChange={handleDropChange}
        jobCategoryOptions={jobCategoryOptions}
        isEditing={editingCode !== null}
        onAddCategory={handleAddCategory} // Pass the handleAddCategory function
      />
    </Container>
  );
};

export default JobComp;