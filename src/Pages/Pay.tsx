import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import Dropdown from "../components/Dropdown";
import JobModalComp from "../components/JobModal";
import ContractorModal from "../components/Modal";
import { Pay, Contractor, } from "../models";
import { useNavigationService } from "../services/SharedServices";
import { fetchPurchaseDetails } from "../services/SupaEndPoints";

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

const Modal = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show", // Exclude 'show' prop
}) <{ show: boolean }>`
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
  .modal-content {
    background: #fff;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
`;


const ModalContent = styled.div`
  background: white;
  margin-top:50px;
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

// Inside the Pay component...

const PayComp: React.FC = () => {
  const [Pays, setPays] = useState<Pay[]>([]);
  const [formData, setFormData] = useState<Omit<Pay, "code">>({
    invoice_id: 0,
    pay_via: '',
    amount: 0,
    supply_invoice: '',
    note: '',
    approved_by: '',
    create_at: new Date(),
    updated_at: new Date(),
  });

    
  const [formContractorData, setFormContractorData] = useState<Omit<Contractor, "code">>({
    contact_person: "",
    company_name: "",
    phone_number: "",
    email: "",
    bsb: "",
    account_no: "",
    account_name: "",
    address: "",
  });
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which Pay is being edited
  const [contractoreditingCode, setContractorEditingCode] = useState<number | null>(null); // Track which Pay is being edited

  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isContractorModalOpen, setIsContractorModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  //new
  const [isJobModalOpen, setIsJobModalOpen] = useState<boolean>(false);
  const [formJobData, setFormJobData] = useState({
    name: "",
    job_category_id: 0, // Or whatever your data structure requires
    description: "",
  });
  const [editingJobCode, setEditingJobCode] = useState<number | null>(null);
  const [jobCategoryOptions, setJobCategoryOptions] = useState([
    { value: 0, label: "" },
  ]);  // For the dropdown in the job modal

  const fetchJobCategories = async () => {
    try {
      const { data, error } = await supabase.from("categ").select("*");
      if (error) throw error;

      const transformedData = data.map((item) => ({
        value: item.code,
        label: item.name,
      }));

      setJobCategoryOptions(transformedData);
    } catch (error) {
      console.error("Error fetching job categories:", error);
    }
  };

  useEffect(() => {
    fetchJobCategories();
  }, []);


  const handleJobOpenModal = () => {
    setIsJobModalOpen(true);
  };

  const handleJobCloseModal = () => {
    setFormJobData({
      name: "",
      job_category_id: 0,
      description: "",
    });
    setEditingJobCode(null);
    setIsJobModalOpen(false);
  };

  const handleJobInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormJobData({ ...formJobData, [e.target.name]: e.target.value });
  };

  const handleJobDropChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormJobData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleJobSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingJobCode !== null) {
        // Update existing job
        const { error } = await supabase
          .from("job")
          .update(formJobData)
          .eq("code", editingJobCode); // Assuming 'code' is the ID field

        if (error) throw error;
      } else {
        // Insert new job
        const { error } = await supabase.from("job").insert([formJobData]);
        if (error) throw error;
      }

      // Close the modal and refresh job list
      handleJobCloseModal();
      fetchJobs(); // Assuming you have this function to refresh job data
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const fetchPays = async () => {
    try {
      const { data, error } = await supabase.from("pay").select("*").order("code", { ascending: false });;
      if (error) throw error;
      setPays(data || []);
    } catch (error) {
      console.error("Error fetching Pays:", error);
    }
  };
  const [projectOptions, setProjectOptions] = useState([
    { value: 0, label: "" },
  ]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("project").select("*");
      if (error) throw error;

      // Transform data into { value, label } format
      const transformedData = data.map((item) => ({
        value: item.code, // Assuming `id` is the unique identifier
        label: item.project_name, // Assuming `name` is the category name
      }));

      console.log("Fetched projects:", transformedData);

      // Update the state with fetched categories
      setProjectOptions(transformedData);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const [contractorOptions, setContractorOptions] = useState([
    { value: 0, label: "" },
  ]);

  const fetchContractors = async () => {
    try {
      const { data, error } = await supabase.from("jobby").select("*");
      if (error) throw error;

      // Transform data into { value, label } format
      const transformedData = data.map((item) => ({
        value: item.code, // Assuming `id` is the unique identifier
        label:  item.code.toString() + ' -> $' + item.cost, // Assuming `name` is the category name
      }));

      console.log("Fetched contractors:", transformedData);

      // Update the state with fetched categories
      setContractorOptions(transformedData);
    } catch (error) {
      console.error("Error fetching contractors:", error);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  const [jobOptions, setJobOptions] = useState([
    { value: 0, label: "" },
  ]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase.from("job").select("*");
      if (error) throw error;

      // Transform data into { value, label } format
      const transformedData = data.map((item) => ({
        value: item.code,
        label: item.name,
      }));

      console.log("Fetched jobs:", transformedData);

      // Update the state with fetched categories
      setJobOptions(transformedData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchPays();
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

  const handleOpenModal = (Pay?: Pay) => {
    if (Pay) {
      handleEdit(Pay);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormData({
        invoice_id: 0,
        pay_via: '',
        amount: 0,
        supply_invoice: '',
        note: '',
        approved_by: '',
        create_at: new Date(),
        updated_at: new Date(),
    });
    setEditingCode(null);
    setIsModalOpen(false);
  };

  const handleContractorCloseModal = () => {
    setFormContractorData({
      contact_person: "",
      company_name: "",
      phone_number: "",
      email: "",
      bsb: "",
      account_no: "",
      account_name: "",
      address: "",
    });
    setContractorEditingCode(null);
    setIsContractorModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingCode !== null) {
        // Update an existing Pay
        const { error } = await supabase
          .from("pay")
          .update(formData)
          .eq("code", editingCode);

        if (error) throw error;

        // Clear editing state after updating
        setEditingCode(null);
      } else {
        // Add a new Pay
        const { error } = await supabase.from("pay").insert([formData]);

        if (error) throw error;
      }

      // Refresh the list and reset the form
      fetchPays();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving Pay:", error);
    }
  };

  const handleContractorSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingCode !== null) {
        // Update an existing contractor
        const { error } = await supabase
          .from("contractor")
          .update(formContractorData)
          .eq("code", editingCode);

        if (error) throw error;

        // Clear editing state after updating
        setContractorEditingCode(null);
      } else {
        // Add a new contractor
        const { error } = await supabase.from("contractor").insert([formContractorData]);

        if (error) throw error;
      }

      // Refresh the list and reset the form
      fetchContractors();
      handleContractorCloseModal();
    } catch (error) {
      console.error("Error saving contractor:", error);
    }
  };
  const handleContractorOpenModal = () => {
    setIsContractorModalOpen(true);
  };

  const handleEdit = (Pay: Pay) => {
    setEditingCode(Pay.code);
    setFormData({
        invoice_id: Pay.invoice_id,
        pay_via: Pay.pay_via,
        amount: Pay.amount,
        supply_invoice: Pay.supply_invoice,
        note: Pay.note,
        approved_by: Pay.approved_by,
        create_at: Pay.create_at,
        updated_at: Pay.updated_at,
    });
  };

  const handleDelete = async (code: number) => {
    try {
      const { error } = await supabase.from("pay").delete().eq("code", code);
      if (error) throw error;
      fetchPays(); // Refresh the list
    } catch (error) {
      console.error("Error deleting Pay:", error);
    }
  };

  // Filter Pays dynamically based on the search term
  const filteredPays = Pays.filter((Pay) => {
    return (
      (Pay.invoice_id?.toString() || "").includes(searchTerm.toLowerCase()) ||
      (Pay.supply_invoice?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });


  // Handle Form Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleContractorInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormContractorData({ ...formContractorData, [e.target.name]: e.target.value });
  };

  const handleDropChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

  const paginatedPays = filteredPays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPays.length / itemsPerPage);
  const { handleViewPurchase } = useNavigationService();
  const { handleViewPay } = useNavigationService();
  return (
    <Container>
      <Title>Pay Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <Button onClick={() => handleOpenModal()}>Add Pay</Button>
      </ButtonRow>

      {/* Pagination Controls */}
      <div>
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
      </div>

      {isMobileView ? (
        <List>
          {paginatedPays.map((Pay) => (
            <ListItem key={Pay.code}>
              <button onClick={() => handleViewPay(Pay)} className="text-blue-500">
                {Pay.code}
              </button><br />
              <strong>Invoice ID:</strong> {Pay.invoice_id} <br />
              <strong>Pay Via:</strong> {Pay.pay_via} <br />
              <strong>Supplier Invoice:</strong> {Pay.supply_invoice} <br />
              <strong>Price:</strong> {(Pay.amount)?.toFixed(2)} <br />
              <strong>Note:</strong> { Pay.note } <br />
              <strong>Approved By:</strong> { Pay.approved_by } <br />
              <Button onClick={() => handleOpenModal(Pay)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(Pay.code)}>Delete</DeleteButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Invoice ID</Th>
              <Th>Pay Via</Th>
              <Th>Supplier Invoice</Th>
              <Th>Price</Th>
              <Th>Supplier Invoice</Th>
              <Th>Note</Th>
              <Th>Approved By</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {paginatedPays.map((Pay) => (
              <tr key={Pay.code}>
                <Td><button onClick={() => handleViewPay(Pay)} className="text-blue-500">
                  {Pay.code}
                </button>
                </Td>
                <Td>{Pay.invoice_id}</Td>
                <Td>{Pay.pay_via}</Td>
                <Td>{Pay.supply_invoice}</Td>
                <Td>{(Pay.amount)?.toFixed(2)}</Td>
                <Td>{Pay.supply_invoice}</Td>
                <Td>{ Pay.note }</Td>
                <Td>{ Pay.approved_by }</Td>
                <Td>
                  <Button onClick={() => handleOpenModal(Pay)}>Edit</Button>
                </Td>
                <Td>
                  <DeleteButton onClick={() => handleDelete(Pay.code)}>Delete</DeleteButton>
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
              <label htmlFor="contact">Pay Via</label>
              <Input
                id="pay_via"
                type="text"
                name="pay_via"
                value={formData.pay_via}
                onChange={handleInputChange}
                placeholder="Pay Via"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="project" >Invoice</label>
              <Dropdown
                name="invoice_id"
                value={formData.invoice_id}
                onChange={handleDropChange}
                options={contractorOptions}
                placeholder="Select Invoice"
                required
              />
              <span onClick={handleContractorOpenModal} className="addModal"> +</span>
            </div>

            <div>
              <label htmlFor="amount">Amount</label>
              <Input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Amount"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="supply_invoice">Supplier Invoice</label>
              <Input
                id="supply_invoice"
                type="text"
                name="supply_invoice"
                value={formData.supply_invoice}
                onChange={handleInputChange}
                placeholder="Supplier Invoice"
                autoComplete="off"
                required
              />

            </div>
            <div>
              <label htmlFor="note">Note</label>
              <Input
                id="note"
                type="text"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Note"
                autoComplete="off"
                required
              />        
            </div>
            <div>
              <label htmlFor="approved_by">Approved By</label>
              <Input
                id="approved_by"
                type="text"
                name="approved_by"
                value={formData.approved_by}
                onChange={handleInputChange}
                placeholder="Approved By"
                autoComplete="off"
                required
              />                        
            </div>

            <Button type="submit">Save Pay</Button>
          </Form>


        </ModalContent>
      </Modal>
      <JobModalComp
        show={isJobModalOpen}
        onClose={handleJobCloseModal}
        onSubmit={handleJobSubmit}
        formData={formJobData}
        onInputChange={handleJobInputChange}
        onDropChange={handleJobDropChange}
        jobCategoryOptions={jobCategoryOptions}
        isEditing={editingJobCode !== null}
        onAddCategory={handleAddCategory}
      />
      <ContractorModal show={isContractorModalOpen} onClose={handleContractorCloseModal}>
        <Form onSubmit={handleContractorSubmit}>
          <div>
            <label htmlFor="contact_person">Contact Person</label>
            <Input
              id="contact_person"
              type="text"
              name="contact_person"
              value={formContractorData.contact_person}
              onChange={handleContractorInputChange}
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
              value={formContractorData.company_name}
              onChange={handleContractorInputChange}
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
              value={formContractorData.phone_number}
              onChange={handleContractorInputChange}
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
              value={formContractorData.email}
              onChange={handleContractorInputChange}
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
              value={formContractorData.bsb}
              onChange={handleContractorInputChange}
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
              value={formContractorData.account_no}
              onChange={handleContractorInputChange}
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
              value={formContractorData.account_name}
              onChange={handleContractorInputChange}
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
              value={formContractorData.address}
              onChange={handleContractorInputChange}
              placeholder="Address"
              autoComplete="off"
              required
            />
          </div>

          <Button type="submit">Save Contractor</Button>
        </Form>

      </ContractorModal>
    </Container>
  );
};

export default PayComp;
