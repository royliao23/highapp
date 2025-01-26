import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import Dropdown from "../components/Dropdown";

// Define the Contractor type based on the table schema
interface Purchase {
  code: number;
  job_id: number;
  by_id: number;
  project_id: number;
  cost:number;
  ref: string;
  contact: string;
  create_at: Date;
  updated_at: Date;
  due_at:Date
}

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
  text-align: center;
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

// Inside the Contractor component...

const PurchaseComp: React.FC = () => {
  const [contractors, setContractors] = useState<Purchase[]>([]);
  const [formData, setFormData] = useState<Omit<Purchase, "code">>({
    job_id: 0,
    by_id: 0,
    project_id: 0,
    ref: "",
    cost: 0,
    contact: "",
    create_at: new Date(),
    updated_at: new Date(),
    due_at:new Date(),
  });
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which contractor is being edited
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchContractors = async () => {
    try {
      const { data, error } = await supabase.from("purchase_order").select("*");
      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error("Error fetching contractors:", error);
    }
  };

  useEffect(() => {
    fetchContractors();
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

  const handleOpenModal = (contractor?: Purchase) => {
    if (contractor) {
      handleEdit(contractor);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormData({
      job_id: 0,
      by_id: 0,
      project_id: 0,
      ref: "",
      cost: 0,
      contact: "",
      create_at: new Date(),
      updated_at: new Date(),
      due_at:new Date(),
    });
    setEditingCode(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingCode !== null) {
        // Update an existing contractor
        const { error } = await supabase
          .from("purchase_order")
          .update(formData)
          .eq("code", editingCode);

        if (error) throw error;

        // Clear editing state after updating
        setEditingCode(null);
      } else {
        // Add a new contractor
        const { error } = await supabase.from("purchase_order").insert([formData]);

        if (error) throw error;
      }

      // Refresh the list and reset the form
      fetchContractors();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving contractor:", error);
    }
  };

  const handleEdit = (contractor: Purchase) => {
    setEditingCode(contractor.code);
    setFormData({
      job_id: contractor.job_id,
      by_id: contractor.by_id,
      project_id: contractor.project_id,
      ref: contractor.ref,
      cost: contractor.cost,
      contact: contractor.contact,
      create_at: contractor.create_at,
      updated_at: contractor.updated_at,
      due_at:contractor.due_at,
    });
  };

  const handleDelete = async (code: number) => {
    try {
      const { error } = await supabase.from("purchase_order").delete().eq("code", code);
      if (error) throw error;
      fetchContractors(); // Refresh the list
    } catch (error) {
      console.error("Error deleting contractor:", error);
    }
  };

  // Filter contractors dynamically based on the search term
  const filteredContractors = contractors.filter((contractor) => {
    return (
      (contractor.ref?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (contractor.contact?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });
  const projectOptions = [
    { value: "1", label: "Project1" },
    { value: "2", label: "Project2" },
    { value: "3", label: "Mile 3" },
    { value: "4", label: "Mile 4" },
    { value: "5", label: "Mile 5" },
    // Add more options as needed
  ];

  // Handle Form Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDropChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = event.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };

  return (
    <Container>
      <Title>Purchase Order Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <Button onClick={() => handleOpenModal()}>Add Contractor</Button>
      </ButtonRow>

      {isMobileView ? (
        <List>
          {filteredContractors.map((contractor) => (
            <ListItem key={contractor.code}>
              <strong>Contact Person:</strong> {contractor.contact} <br />
              <strong>Company Name:</strong> {contractor.by_id} <br />
              <strong>Price:</strong> {contractor.cost} <br />
              <strong>Job:</strong> {contractor.job_id} <br />
              <Button onClick={() => handleOpenModal(contractor)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(contractor.code)}>Delete</DeleteButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Contact Person</Th>
              <Th>Company Name</Th>
              <Th>Price</Th>
              <Th>Job</Th>
              <Th>Ref</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {filteredContractors.map((contractor) => (
              <tr key={contractor.code}>
                <Td>{contractor.contact}</Td>
                <Td>{contractor.by_id}</Td>
                <Td>{contractor.cost}</Td>
                <Td>{contractor.job_id}</Td>
                <Td>{contractor.ref}</Td>
                <Td>
                  <Button onClick={() => handleOpenModal(contractor)}>Edit</Button>
                </Td>
                <Td>
                  <DeleteButton onClick={() => handleDelete(contractor.code)}>Delete</DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={isModalOpen}>
        <ModalContent>
          <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
          <Form onSubmit={handleSubmit}>
  <div>
    <label htmlFor="contact">Contact Person</label>
    <Input
      id="contact"
      type="text"
      name="contact"
      value={formData.contact}
      onChange={handleInputChange}
      placeholder="Contact Person"
      autoComplete="off"
      required
    />
  </div>

  <div>
    <label htmlFor="by_id">Company Name</label>
    <Input
      id="by_id"
      type="number"
      name="by_id"
      value={formData.by_id}
      onChange={handleInputChange}
      placeholder="Company Name"
      autoComplete="off"
      required
    />
  </div>

  <div>
    <label htmlFor="project">Select Project</label>
    <Dropdown
      name="by_id"
      value={formData.by_id}
      onChange={handleDropChange}
      options={projectOptions}
      placeholder="Select Project"
      required
    />
  </div>

  <div>
    <label htmlFor="cost">Phone Number</label>
    <Input
      id="cost"
      type="number"
      name="cost"
      value={formData.cost}
      onChange={handleInputChange}
      placeholder="Phone Number"
      autoComplete="off"
      required
    />
  </div>

  <div>
    <label htmlFor="ref">Reference</label>
    <Input
      id="ref"
      type="text"
      name="ref"
      value={formData.ref}
      onChange={handleInputChange}
      placeholder="Ref"
      autoComplete="off"
      required
    />
  </div>

  <div>
    <label htmlFor="project_id">Project ID</label>
    <Input
      id="project_id"
      type="number"
      name="project_id"
      value={formData.project_id}
      onChange={handleInputChange}
      placeholder="Project"
      autoComplete="off"
      required
    />
  </div>

  <div>
    <label htmlFor="job_id">Job</label>
    <Input
      id="job_id"
      type="job_id"
      name="job_id"
      value={formData.job_id}
      onChange={handleInputChange}
      placeholder="Job"
      autoComplete="off"
      required
    />
  </div>

  <Button type="submit">Save Contractor</Button>
</Form>


        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PurchaseComp;
