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

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 300px;
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
  margin-top: 1rem;
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
  const [searchTerm, setSearchTerm] = useState<string>(""); // For search input
  const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const { data, error } = await supabase.from("contractor").select("*");
        if (error) throw error;
        setContractors(data || []);
        setFilteredContractors(data || []); // Initialize filtered contractors
      } catch (error) {
        console.error("Error fetching contractors:", error);
      }
    };

    fetchContractors();
  }, []);

  useEffect(() => {
    // Filter contractors based on the search term
    const filtered = contractors.filter((contractor) =>
      Object.values(contractor)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredContractors(filtered);
  }, [searchTerm, contractors]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); // Update search term
  };

  const handleEdit = (contractor: Contractor) => {
    // Logic for editing (to be integrated with modal)
  };

  const handleDelete = async (code: number) => {
    try {
      const { error } = await supabase.from("contractor").delete().eq("code", code);
      if (error) throw error;
      setContractors((prev) => prev.filter((contractor) => contractor.code !== code));
    } catch (error) {
      console.error("Error deleting contractor:", error);
    }
  };

  return (
    <Container>
      <Title>Contractor Management</Title>
      <ButtonRow>
        <Input
          type="text"
          placeholder="Search contractors..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button onClick={() => console.log("Show Add/Edit Modal")}>
          Add Contractor
        </Button>
      </ButtonRow>

      <Table>
        <thead>
          <tr>
            <Th>Contact Person</Th>
            <Th>Company Name</Th>
            <Th>Phone Number</Th>
            <Th>Email</Th>
            <Th>BSB</Th>
            <Th>Account No</Th>
            <Th>Account Name</Th>
            <Th>Address</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredContractors.map((contractor) => (
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
                <Button onClick={() => handleEdit(contractor)}>Edit</Button>
                <DeleteButton onClick={() => handleDelete(contractor.code)}>
                  Delete
                </DeleteButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Contractor;
