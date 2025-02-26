import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";

// Define the CreditorAging type based on the table schema
interface CreditorAging {
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

// Inside the CreditorAging component...

const CreditorAging: React.FC = () => {
  const [CreditorAgings, setCreditorAgings] = useState<CreditorAging[]>([]);
  const [formData, setFormData] = useState<Omit<CreditorAging, "code">>({
    contact_person: "",
    company_name: "",
    phone_number: "",
    email: "",
    bsb: "",
    account_no: "",
    account_name: "",
    address: "",
  });
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which CreditorAging is being edited
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchCreditorAgings = async () => {
    try {
      const { data, error } = await supabase.from("contractor").select("*");
      if (error) throw error;
      setCreditorAgings(data || []);
    } catch (error) {
      console.error("Error fetching CreditorAgings:", error);
    }
  };

  useEffect(() => {
    fetchCreditorAgings();
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

  const handleOpenModal = (CreditorAging?: CreditorAging) => {
    if (CreditorAging) {
      handleEdit(CreditorAging);
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
        // Update an existing CreditorAging
        const { error } = await supabase
          .from("CreditorAging")
          .update(formData)
          .eq("code", editingCode);

        if (error) throw error;

        // Clear editing state after updating
        setEditingCode(null);
      } else {
        // Add a new CreditorAging
        const { error } = await supabase.from("CreditorAging").insert([formData]);

        if (error) throw error;
      }

      // Refresh the list and reset the form
      fetchCreditorAgings();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving CreditorAging:", error);
    }
  };

  const handleEdit = (CreditorAging: CreditorAging) => {
    setEditingCode(CreditorAging.code);
    setFormData({
      contact_person: CreditorAging.contact_person,
      company_name: CreditorAging.company_name,
      phone_number: CreditorAging.phone_number,
      email: CreditorAging.email,
      bsb: CreditorAging.bsb,
      account_no: CreditorAging.account_no,
      account_name: CreditorAging.account_name,
      address: CreditorAging.address,
    });
  };

  const handleDelete = async (code: number) => {
    try {
      const { error } = await supabase.from("CreditorAging").delete().eq("code", code);
      if (error) throw error;
      fetchCreditorAgings(); // Refresh the list
    } catch (error) {
      console.error("Error deleting CreditorAging:", error);
    }
  };

  // Filter CreditorAgings dynamically based on the search term
  const filteredCreditorAgings = CreditorAgings.filter((CreditorAging) => {
    return (
      CreditorAging.contact_person.toLowerCase().includes(searchTerm) ||
      CreditorAging.company_name.toLowerCase().includes(searchTerm) ||
      CreditorAging.email.toLowerCase().includes(searchTerm) ||
      CreditorAging.phone_number.includes(searchTerm)
    );
  });

  // Handle Form Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container>
      <Title>Creditor Aging Report</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <Button onClick={() => handleOpenModal()}>Print Report</Button>
      </ButtonRow>

      {isMobileView ? (
        <List>
          {filteredCreditorAgings.map((CreditorAging) => (
            <ListItem key={CreditorAging.code}>
              <strong>Contact Person:</strong> {CreditorAging.contact_person} <br />
              <strong>Company Name:</strong> {CreditorAging.company_name} <br />
              <strong>Phone Number:</strong> {CreditorAging.phone_number} <br />
              <strong>Email:</strong> {CreditorAging.email} <br />
              <Button onClick={() => handleOpenModal(CreditorAging)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(CreditorAging.code)}>Delete</DeleteButton>
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
            </tr>
          </thead>
          <tbody>
            {filteredCreditorAgings.map((CreditorAging) => (
              <tr key={CreditorAging.code}>
                <Td>{CreditorAging.contact_person}</Td>
                <Td>{CreditorAging.company_name}</Td>
                <Td>{CreditorAging.phone_number}</Td>
                <Td>{CreditorAging.email}</Td>
                <Td>
                  <Button onClick={() => handleOpenModal(CreditorAging)}>View</Button>
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
              autoComplete="off"
              required
            />
            <Input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="Company Name"
              autoComplete="off"
              required
            />
            <Input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="Phone Number"
              autoComplete="off"
              required
            />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              autoComplete="off"
              required
            />
            <Input
              type="text"
              name="bsb"
              value={formData.bsb}
              onChange={handleInputChange}
              placeholder="BSB"
              autoComplete="off"
              required
            />
            <Input
              type="text"
              name="account_no"
              value={formData.account_no}
              onChange={handleInputChange}
              placeholder="Account Number"
              autoComplete="off"
              required
            />
            <Input
              type="text"
              name="account_name"
              value={formData.account_name}
              onChange={handleInputChange}
              placeholder="Account Name"
              autoComplete="off"
              required
            />
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Address"
              autoComplete="off"
              required
            />
            <Button type="submit">Save CreditorAging</Button>
          </Form>

        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CreditorAging;
