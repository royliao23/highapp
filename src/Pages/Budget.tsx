import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
// import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import { Job, Project,  JobBudget} from "../models";
import { getJobBudget,getJobBudgets, createJobBudget,updateJobBudget, deleteJobBudget, fetchJobs,fetchProjects } from "../api";

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
const Dropdown = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 90%;
`;
const Modal = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;


const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-height: 90vh;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto; /* Enable scrolling for modal content */
  @media (max-width: 768px) {
      width: 95%;
    }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

// Inside the jobbudget component...

const Budget: React.FC = () => {
  const [jobBudgets, setJobBudgets] = useState<JobBudget[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<JobBudget>({
    job_id: 0,
    project_id: 0,
    budget: 0,
    note: "",
  });
  const [editingCode, setEditingCode] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchData = async () => {
    try {
      // Fetch job budgets with related job and project data
      const budgetData = await getJobBudgets();

      if (budgetData.error) throw budgetData.error;

      // Transform the data to match our interface
      const transformedData = budgetData?.map((item: any) => ({
        code: item.code,
        job_id: item.job_id,
        project_id: item.project_id,
        budget: item.budget,
        note: item.note,
        job: item.job,
        project: item.project
      })) as JobBudget[] || [];
  
      // Fetch all jobs and projects for dropdowns
      const jobData = await fetchJobs();
      const projectData = await fetchProjects();

      if (jobData.error) throw jobData.error;
      if (projectData.error) throw projectData.error;

      setJobBudgets(transformedData);
      setJobs(jobData || []);
      setProjects(projectData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
    useEffect(() => {
      fetchData();
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
    setSearchTerm(e.target.value.toLowerCase()); // Normalize search term for case-insensitive search
  };

  const handleOpenModal = (jobBudget?: JobBudget) => {
    if (jobBudget) {
      setFormData({
        code: jobBudget.code,
        job_id: jobBudget.job_id || jobBudget.job?.code || 0,
        project_id: jobBudget.project_id || jobBudget.project?.id || 0,
        budget: jobBudget.budget,
        note: jobBudget.note,
      });
      setEditingCode(jobBudget.code || null);
    } else {
      setFormData({
        job_id: 0,
        project_id: 0,
        budget: 0,
        note: "",
      });
      setEditingCode(null);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCode(null);
    setFormData({
      job_id: 0,
      project_id: 0,
      budget: 0,
      note: "",
    });
  }
  const handleDelete = async (code: number) => {
    if (window.confirm("Are you sure you want to delete this job budget?")) {
      try {
        await deleteJobBudget(code);
        console.log("Job budget deleted successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting job budget:", error);
      }
    }
  };



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    try {
      const payload = {
        job_id: formData.job_id ?? 0,
        project_id: formData.project_id ?? 0,
        budget: formData.budget,
        note: formData.note,
      };
  
      if (editingCode !== null) {
        // Update existing record
        const { error } = await updateJobBudget(editingCode, payload);
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await createJobBudget(payload);
        if (error) throw error;
      }
  
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving job budget:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "budget" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const { name, value } = e.target;
  console.log("projects:", projects);
  console.log("jobs:", jobs);
  console.log("handleSelectChange value:",value, "name:",name, "formData:", formData,"target:", e.target);
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

  const handleBudgetChange = (e:any) => {
  const value = e.target.value;
  // Allow empty string or valid numbers
  if (value === '' || !isNaN(value)) {
    setFormData({ ...formData, budget: value });
  }
};

  // Filter job budgets based on search term
  const filteredJobBudgets = jobBudgets.filter((jobBudget) => {
    const jobName = jobBudget.job?.name?.toLowerCase() || "";
    const projectName = jobBudget.project?.project_name?.toLowerCase() || "";
    return (
      jobName.includes(searchTerm.toLowerCase()) ||
      projectName.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Container>
      <Title>Job Budget Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <Button onClick={() => handleOpenModal()}>Add Job Budget</Button>
      </ButtonRow>

      {isMobileView ? (
        <List>
          {filteredJobBudgets.map((jobBudget) => (
            <ListItem key={jobBudget.code}>
              <strong>Project:</strong> {jobBudget.project?.project_name} <br />
              <strong>Job:</strong> {jobBudget.job?.name} <br />
              <strong>Budget:</strong> {jobBudget.budget} <br />
              <strong>Note:</strong> {jobBudget.note} <br />
              <Button onClick={() => handleOpenModal(jobBudget)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(jobBudget.code!)}>Delete</DeleteButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Project</Th>
              <Th>Job</Th>
              <Th>Budget</Th>
              <Th>Note</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredJobBudgets.map((jobBudget) => (
              <tr key={jobBudget.code}>
                <Td>{jobBudget.project?.project_name}</Td>
                <Td>{jobBudget.job?.name}</Td>
                <Td>{jobBudget.budget}</Td>
                <Td>{jobBudget.note}</Td>
                <Td>
                  <Button onClick={() => handleOpenModal(jobBudget)}>Edit</Button>
                  <DeleteButton onClick={() => handleDelete(jobBudget.code!)}>Delete</DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={isModalOpen}>
        <ModalContent>
          <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
          <h3>{editingCode ? "Edit Job Budget" : "Add Job Budget"}</h3>
          <Form onSubmit={handleSubmit}>
            <Dropdown
                name="project_id"
                value={formData.project_id}
                onChange={handleSelectChange}
              >
                
                <option value="">Select Project</option>
                {projects.map((option:any) => (
                  <option key={option.id} value={option.id}>
                    {option.project_name}
                  </option>
                  
                ))}
            </Dropdown>

            <Dropdown
                name="job_id"
                value={formData.job_id}
                onChange={handleInputChange}
              >
                
                <option value="">Select Job</option>
                {jobs.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                  
                ))}
            </Dropdown>

            <Input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleBudgetChange}
              
              placeholder="Budget"
              required
            />

            <label>Note</label>
            <Input
              type="text"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Note"
            />

            <Button type="submit">Save</Button>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Budget;
