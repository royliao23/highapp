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
  max-width: 900px;
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

      {/* Form to Add Contractor */}
      <Form onSubmit={handleSubmit}>
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
        {/* <Button type="submit">Add Contractor</Button> */}
        <Button type="submit">{editingCode === null ? "Add Contractor" : "Update Contractor"}</Button>
      </Form>

      {/* Table to Display Contractors */}
      <Table>
        <thead>
          <tr>
            <Th>Contact Person</Th>
            <Th>Company Name</Th>
            <Th>Phone Number</Th>
            <Th>Email</Th>
            {/* <Th>bsb</Th>
            <Th>Account No</Th>
            <Th>Account Name</Th> */}
            <Th>Address</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {contractors.map((contractor) => (
            <tr key={contractor.code}>
              <Td>{contractor.contact_person}</Td>
              <Td>{contractor.company_name}</Td>
              <Td>{contractor.phone_number}</Td>
              <Td>{contractor.email}</Td>
              {/* <Td>{contractor.bsb}</Td>
              <Td>{contractor.account_no}</Td>
              <Td>{contractor.account_name}</Td> */}
              <Td>{contractor.address}</Td>
              <Td>
                <Button onClick={() => handleEdit(contractor)}>Edit</Button>
                <DeleteButton onClick={() => handleDelete(contractor.code)}>Delete</DeleteButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Contractor;
