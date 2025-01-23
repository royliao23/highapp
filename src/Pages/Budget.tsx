import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";


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
  width: 90%;
  max-width: 500px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

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
  // Fetch Contractors from Supabase
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
    const handleResize = () => setIsMobileView(window.innerWidth < 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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


  // Handle Form Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      handleCloseModal();
    } catch (error) {
      console.error("Error saving contractor:", error);
    }
  };
  

  // Pre-fill form with contractor details for editing
  const handleEdit = (contractor: Contractor) => {
    setEditingCode(contractor.code); // Set the contractor code being edited
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

  // Delete Contractor from Supabase
  const handleDelete = async (code: number) => {
    try {
      const { error } = await supabase.from("contractor").delete().eq("code", code);
      if (error) throw error;
      fetchContractors(); // Refresh the list
    } catch (error) {
      console.error("Error deleting contractor:", error);
    }
  };

  return (
    <Container>
      <Title>Contractor Management</Title>
      <Button onClick={() => handleOpenModal()}>Add Contractor</Button>
      
      {isMobileView ? (
        // Render as a list for mobile view
        <List>
          {contractors.map((contractor) => (
            <ListItem key={contractor.code}>
              <strong>Contact Person:</strong> {contractor.contact_person} <br />
              <strong>Company Name:</strong> {contractor.company_name} <br />
              <strong>Phone Number:</strong> {contractor.phone_number} <br />
              <strong>Email:</strong> {contractor.email} <br />
              <strong>BSB:</strong> {contractor.bsb} <br />
              <strong>Account No:</strong> {contractor.account_no} <br />
              <strong>Account Name:</strong> {contractor.account_name} <br />
              <strong>Address:</strong> {contractor.address} <br />
              <Button onClick={() => handleEdit(contractor)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(contractor.code)}>Delete</DeleteButton>
            </ListItem>
          ))}
        </List>
      ) :
      (<Table>
        <thead>
          <tr>
            <Th>Contact Person</Th>
            <Th>Company Name</Th>
            <Th>Phone Number</Th>
            <Th>Email</Th>
            <Th>bsb</Th>
            <Th>Account No</Th>
            <Th>Account Name</Th>
            <Th>Address</Th>
            <Th>Edit</Th>
            <Th>Delete</Th>
          </tr>
        </thead>
        <tbody>
          {contractors.map((contractor) => (
            <tr key={contractor.code}>
              <Td>{contractor.contact_person}</Td>
              <Td>{contractor.company_name}</Td>
              <Td>{contractor.phone_number}</Td>
              <Td>{contractor.email}</Td>
              <Td>{contractor.bsb}</Td>
              <Td>{contractor.account_no}</Td>
              <Td>{contractor.account_name}</Td>
              <Td>{contractor.address}</Td>
              <Td>
                {/* <Button onClick={() => handleEdit(contractor)}>Edit</Button> */}
                <Button onClick={() => handleOpenModal(contractor)}>Edit</Button>
              </Td>
              <Td>
                {/* <Button onClick={() => handleEdit(contractor)}>Edit</Button> */}
                <DeleteButton onClick={() => handleDelete(contractor.code)}>Delete</DeleteButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>)}
      <Modal show={isModalOpen}>
        <ModalContent>
          <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
          <Form onSubmit={handleSubmit}>
            {/* Form Fields */}
            <Input
          type="text"
          name="contact_person"
          placeholder="Contact Person"
          value={formData.contact_person}
          onChange={handleInputChange}
        />
        <Input
          type="text"
          name="company_name"
          placeholder="Company Name"
          value={formData.company_name}
          onChange={handleInputChange}
          required
        />
        <Input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleInputChange}
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <Input
          type="text"
          name="bsb"
          placeholder="bsb"
          value={formData.bsb}
          onChange={handleInputChange}
        />
        <Input
          type="text"
          name="account_no"
          placeholder="Account Number"
          value={formData.account_no}
          onChange={handleInputChange}
        />
        <Input
          type="text"
          name="account_name"
          placeholder="Account Name"
          value={formData.account_name}
          onChange={handleInputChange}
        />
        <Input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleInputChange}
        />
            <Button type="submit">{editingCode === null ? "Add Contractor" : "Update Contractor"}</Button>
            <Button type="button" onClick={handleCloseModal}>Cancel</Button>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Contractor;
