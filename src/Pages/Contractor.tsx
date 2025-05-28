import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
// import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import Modal from "../components/Modal";
import { PaginationContainer } from "../StyledComponent";
import { Contractor } from "../models";

import { createContractor, deleteContractor, fetchContractors, updateContractor } from "../api";
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


// Inside the Contractor component...

const ContractorComp: React.FC = () => {
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
    abn: "",
    gst_registered: false,
  });
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which contractor is being edited
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5); 
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  
const loadContractors = async () => {
  try {
    const data = await fetchContractors();
    console.log("Contractors fetched:", data);
    setContractors(data || []);
    console.log("Contractors state updated:", contractors);
  } catch (error) {
    console.error("Error fetching contractors:", error);
  }
};

  useEffect(() => {
    loadContractors();
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
    setCurrentPage(1);
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
      abn: "",
      gst_registered: true,
    });
    setEditingCode(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
    if (editingCode !== null) {
      // Update contractor
      await updateContractor(editingCode, formData);
      setEditingCode(null);
    } else {
      // Create contractor
      await createContractor(formData);
    }
    loadContractors();
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
      abn: contractor.abn,
      gst_registered: contractor.gst_registered,
    });
  };

  const handleDelete = async (code: number) => {
  try {
    await deleteContractor(code);
    loadContractors();
    fetchContractors();
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

  const paginatedContractors = filteredContractors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredContractors.length / itemsPerPage);

  // Handle Form Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleContractorCheckBoxChange = (event:any) => {
    const { name, type, checked, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  return (
    <Container>
      <Title>Contractor Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <Button onClick={() => handleOpenModal()}>Add Contractor</Button>
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
          {paginatedContractors.map((contractor) => (
            <ListItem key={contractor.code}>
              <strong>Code:</strong> {contractor.code} <br />
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
              <Th>Code</Th>
              <Th>Contact Person</Th>
              <Th>Company Name</Th>
              <Th>Phone Number</Th>
              <Th>Email</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {paginatedContractors.map((contractor) => (
              <tr key={contractor.code}>
                <Td>{contractor.code}</Td>
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

      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <Form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="contact_person">Contact Person</label>
              <Input
                id="contact_person"
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                placeholder="Contact Person"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="company_name">Company Name</label>
              <Input
                id="company_name"
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Company Name"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="phone_number">Phone Number</label>
              <Input
                id="phone_number"
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="Phone Number"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="bsb">BSB</label>
              <Input
                id="bsb"
                type="text"
                name="bsb"
                value={formData.bsb}
                onChange={handleInputChange}
                placeholder="BSB"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="account_no">Account Number</label>
              <Input
                id="account_no"
                type="text"
                name="account_no"
                value={formData.account_no}
                onChange={handleInputChange}
                placeholder="Account Number"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="account_name">Account Name</label>
              <Input
                id="account_name"
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleInputChange}
                placeholder="Account Name"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="address">Address</label>
              <Input
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="abn">ABN</label>
              <Input
                id="abn"
                type="text"
                name="abn"
                value={formData.abn}
                onChange={handleInputChange}
                placeholder="ABN"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="gst_registered">GST Registered</label>
              <Input
                id="gst_registered"
                type="checkbox"
                name="gst_registered"
                checked={formData.gst_registered} 
                onChange={handleContractorCheckBoxChange}
                placeholder="GST Registered"
                autoComplete="off"
              />
            </div>

            <Button type="submit">Save Contractor</Button>
          </Form>

      </Modal>
    </Container>
  );
};

export default ContractorComp;
