import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import Modal from "../components/Modal"; // Import the Modal component

// Define the company interface
interface Company {
  id: number;
  company_name: string;
  address: string;
  abn: string;
  director: string;
  tfn?: string | null;
  acn?: string | null;
  phone: string;
  email: string;
}

// Styled Components
const Container = styled.div`
  max-width: 800px;
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
  width: 100%;
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
  margin-bottom: 1rem;
`;

const CompanyDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  text-align: left;
  margin-top: 3rem;
  margin-bottom: 2rem;
`;

const Company: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch company data
  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase.from("company").select("*").single();
      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error("Error fetching company:", error);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  // Open modal for editing
  const handleOpenModal = () => {
    if (company) {
      setFormData(company); // Pre-fill form data
      setIsModalOpen(true);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const { error } = await supabase.from("company").update(formData).eq("id", formData.id);
      if (error) throw error;
      setCompany(formData);
      handleCloseModal();
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  return (
    <Container>
      <Title>Company Information</Title>

      {company ? (
        <>
  <CompanyDetails>
    <p><strong>Name:</strong> {company.company_name}</p>
    <p><strong>Address:</strong> {company.address}</p>
    <p><strong>ABN:</strong> {company.abn}</p>
    <p><strong>Director:</strong> {company.director}</p>
    <p><strong>Phone:</strong> {company.phone}</p>
    <p><strong>Email:</strong> {company.email}</p>
  </CompanyDetails>
    <ButtonRow style={{ display: "flex",
  "flexDirection": "column",
  "alignItems": "right" }}>
      <Button onClick={handleOpenModal} >Edit</Button>
    </ButtonRow>
    </>
) : (
  <p style={{ textAlign: "center" }}>Loading company details...</p>
)}

      {/* Modal for editing */}
      {isModalOpen && (
        <Modal show={isModalOpen} onClose={handleCloseModal}>
          <Form onSubmit={handleSubmit}>
            <label>Name</label>
            <Input name="company_name" value={formData?.company_name || ""} onChange={handleInputChange} required />

            <label>Address</label>
            <Input name="address" value={formData?.address || ""} onChange={handleInputChange} required />

            <label>ABN</label>
            <Input name="abn" value={formData?.abn || ""} onChange={handleInputChange} required />

            <label>Director</label>
            <Input name="director" value={formData?.director || ""} onChange={handleInputChange} required />

            <label>Phone</label>
            <Input name="phone" value={formData?.phone || ""} onChange={handleInputChange} required />

            <label>Email</label>
            <Input name="email" value={formData?.email || ""} onChange={handleInputChange} required />

            <Button type="submit">Save Changes</Button>
          </Form>
        </Modal>
      )}
    </Container>
  );
};

export default Company;
