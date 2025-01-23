import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";

// Define the Contractor type based on the table schema
interface Contractor {
  code: number;
  contact_person: string;
  company_name: string;
  phone_number: string;
  email: string;
  bsb: string;
  account_no: string;
  account_name: string;
  address: string;
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

const Contractor: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [formData, setFormData] = useState<Omit<Contractor, "code">>({
    contact_person: "",
    company_name: "",
    phone_number: "",
    email: "",
    bsb: "",
    account_no: "",
    account_name: "",
    address: "",
  });
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which contractor is being edited
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchContractors = async () => {
    try {
      const { data, error } = await supabase.from("contractor").select("*");
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

  const handleOpenModal = (contractor?: Contractor) => {
    if (contractor) {
      handleEdit(contractor);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormData({
      contact_person: "",
      company_name: "",
      phone_number: "",
      email: "",
      bsb: "",
      account_no: "",
      account_name: "",
      address: "",
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
          .from("contractor")
          .update(formData)
          .eq("code", editingCode);

        if (error) throw error;

        // Clear editing state after updating
        setEditingCode(null);
      } else {
        // Add a new contractor
        const { error } = await supabase.from("contractor").insert([formData]);

        if (error) throw error;
      }

      // Refresh the list and reset the form
      fetchContractors();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving contractor:", error);
    }
  };

  const handleEdit = (contractor: Contractor) => {
    setEditingCode(contractor.code);
    setFormData({
      contact_person: contractor.contact_person,
      company_name: contractor.company_name,
      phone_number: contractor.phone_number,
      email: contractor.email,
      bsb: contractor.bsb,
      account_no: contractor.account_no,
      account_name: contractor.account_name,
      address: contractor.address,
    });
  };

  const handleDelete = async (code: number) => {
    try {
      const { error } = await supabase.from("contractor").delete().eq("code", code);
      if (error) throw error;
      fetchContractors(); // Refresh the list
    } catch (error) {
      console.error("Error deleting contractor:", error);
    }
  };

  // Filter contractors dynamically based on the search term
  const filteredContractors = contractors.filter((contractor) => {
    return (
      contractor.contact_person.toLowerCase().includes(searchTerm) ||
      contractor.company_name.toLowerCase().includes(searchTerm) ||
      contractor.email.toLowerCase().includes(searchTerm) ||
      contractor.phone_number.includes(searchTerm)
    );
  });
  
    // Handle Form Input
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

  return (
    <Container>
      <Title>Contractor Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <Button onClick={() => handleOpenModal()}>Add Contractor</Button>
      </ButtonRow>

      {isMobileView ? (
        <List>
          {filteredContractors.map((contractor) => (
            <ListItem key={contractor.code}>
              <strong>Contact Person:</strong> {contractor.contact_person} <br />
              <strong>Company Name:</strong> {contractor.company_name} <br />
              <strong>Phone Number:</strong> {contractor.phone_number} <br />
              <strong>Email:</strong> {contractor.email} <br />
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
              <Th>Phone Number</Th>
              <Th>Email</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {filteredContractors.map((contractor) => (
              <tr key={contractor.code}>
                <Td>{contractor.contact_person}</Td>
                <Td>{contractor.company_name}</Td>
                <Td>{contractor.phone_number}</Td>
                <Td>{contractor.email}</Td>
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
  <Input
    type="text"
    name="contact_person"
    value={formData.contact_person}
    onChange={handleInputChange}
    placeholder="Contact Person"
    required
  />
  <Input
    type="text"
    name="company_name"
    value={formData.company_name}
    onChange={handleInputChange}
    placeholder="Company Name"
    required
  />
  <Input
    type="text"
    name="phone_number"
    value={formData.phone_number}
    onChange={handleInputChange}
    placeholder="Phone Number"
    required
  />
  <Input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleInputChange}
    placeholder="Email"
    required
  />
  <Input
    type="text"
    name="bsb"
    value={formData.bsb}
    onChange={handleInputChange}
    placeholder="BSB"
    required
  />
  <Input
    type="text"
    name="account_no"
    value={formData.account_no}
    onChange={handleInputChange}
    placeholder="Account Number"
    required
  />
  <Input
    type="text"
    name="account_name"
    value={formData.account_name}
    onChange={handleInputChange}
    placeholder="Account Name"
    required
  />
  <Input
    type="text"
    name="address"
    value={formData.address}
    onChange={handleInputChange}
    placeholder="Address"
    required
  />
  <Button type="submit">Save Contractor</Button>
</Form>

        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Contractor;
