import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import Dropdown from "../components/Dropdown";
import JobModalComp from "../components/JobModal";
import ContractorModal from "../components/Modal";
import { Invoice, Contractor } from "../models";
import { useNavigationService } from "../services/SharedServices";
import { fetchPayDetails, fetchPurchaseDetails } from "../services/SupaEndPoints";
import * as XLSX from 'xlsx';
import { PaginationContainer } from "../StyledComponent";
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
  margin-right: 1rem;
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
  flex-wrap: wrap; /* Allows wrapping on smaller screens */

  @media (max-width: 1000px) {
    flex-direction: column; /* Stack items on small screens */
    align-items: stretch;
  }
`;

const ButtonRowFlex = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem; /* Adds space between buttons */

  @media (max-width: 1000px) {
    justify-content: center; /* Center buttons on mobile */
    flex-wrap: wrap;
    width: 100%;
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

// Inside the Invoice component...

const InvoiceComp: React.FC = () => {
  const [Invoices, setInvoices] = useState<Invoice[]>([]);
  const [formData, setFormData] = useState<Omit<Invoice, "code">>({
    job_id: 0,
    by_id: 0,
    project_id: 0,
    ref: "",
    cost: 0,
    contact: "",
    create_at: new Date(),
    updated_at: new Date(),
    due_at:new Date(),
    note: "",
    description: "",

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
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which Invoice is being edited
  const [contractoreditingCode, setContractorEditingCode] = useState<number | null>(null); // Track which Invoice is being edited
  const [showOutstanding, setShowOutstanding] = useState(false);
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isContractorModalOpen, setIsContractorModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const handleToggleOutstanding = () => {
    setShowOutstanding((prev) => !prev);
  };
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

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("jobby")
        .select("*, pay(*)")
        .order("code", { ascending: false });
  
      if (error) throw error;
  
      const invoicesWithPaid = data.map((invoice) => ({
        ...invoice,
        paid: invoice.pay?.reduce((sum:number, payment:any) => sum + payment.amount, 0) || 0,
        outstanding: (invoice.cost || 0) - (invoice.pay?.reduce((sum:number, p:any) => sum + p.amount, 0) || 0),
      }));
  
      setInvoices(invoicesWithPaid);
    } catch (error) {
      console.error("Error fetching Invoices:", error);
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
      const { data, error } = await supabase.from("contractor").select("*");
      if (error) throw error;

      // Transform data into { value, label } format
      const transformedData = data.map((item) => ({
        value: item.code, // Assuming `id` is the unique identifier
        label: item.company_name, // Assuming `name` is the category name
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
    fetchInvoices();
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

  const handleOpenModal = (Invoice?: Invoice) => {
    if (Invoice) {
      handleEdit(Invoice);
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
      description: "",
      note: "",
      create_at: new Date(),
      updated_at: new Date(),
      due_at: new Date(),
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
        // Update an existing Invoice
        const { data, error } = await supabase
          .from("jobby")
          .update(formData)
          .eq("code", editingCode)
          .select() // This forces returning the updated record;
        
        if (error) {throw error} else if (data.length > 0) {
          alert('Update succeeded.')
        } else {
          alert('Only current month transactions are allowed to be updated or there are no matching rows')
        }
        
        // Clear editing state after updating
        setEditingCode(null);
      } else {
        // Add a new Invoice
        const { error } = await supabase.from("jobby").insert([formData]);

        if (error) throw error;
        alert("Invoice added successfully");
        
      }

      // Refresh the list and reset the form
      fetchInvoices();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving Invoice:", error);
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

  const handleEdit = (Invoice: Invoice) => {
    setEditingCode(Invoice.code);
    setFormData({
      job_id: Invoice.job_id,
      by_id: Invoice.by_id,
      project_id: Invoice.project_id,
      ref: Invoice.ref,
      cost: Invoice.cost,
      contact: Invoice.contact,
      description: Invoice.description,
      note: Invoice.note,
      create_at: Invoice.create_at,
      updated_at: Invoice.updated_at,
      due_at: Invoice.due_at,
    });
  };

  const handleDelete = async (code: number) => {
    try {
      const { data,error } = await supabase.from("jobby").delete().eq("code", code).select();
      if (error) {throw error} else if (data.length > 0) {
        alert('Deletion succeeded.')
      } else {
        alert('Only current month transactions are allowed to be deleted or there are no matching rows')
      }
      fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error("Error deleting Invoice:", error);
    }
  };

  // Filter Invoices dynamically based on the search term
  const filteredInvoices = Invoices.filter((Invoice) => {
    const contractor = contractorOptions.find((c) => c.value === Invoice.by_id);
    const project = projectOptions.find((p) => p.value === Invoice.project_id);
    const job = jobOptions.find((j) => j.value === Invoice.job_id);
    if (searchTerm.includes("="))
      return (Invoice.cost === Number(searchTerm.substring(1)))
    else if (searchTerm.includes(">"))
      return (Invoice.cost > Number(searchTerm.substring(1)))
    else if (searchTerm.includes("<"))
      return (Invoice.cost < Number(searchTerm.substring(1)))
    else
      return (
        (Invoice.code === Number(searchTerm)) ||
        (Invoice.ref?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (Invoice.contact?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (contractor?.label?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (project?.label?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (job?.label?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
  });

  const displayedInvoices = showOutstanding
  ? filteredInvoices.filter((filteredInvoice) => (filteredInvoice.outstanding ?? 0) > 0)
  : filteredInvoices;
  // Handle Form Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log("Form Data:", formData);
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

  const paginatedInvoices = displayedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

const exportToCSV = () => {
    const headers = ["Inv#", "Contact Person", "Project", "Job", "Price", "Supplier", "Ref", "PO", "Paid Total", "Outstanding","Paid"];
    
    const csvRows = [
        headers.join(","), // Add headers
        ...displayedInvoices.map(invoice => [
            invoice.code,
            invoice.contact,
            projectOptions.find(option => option.value === invoice.project_id)?.label || "Unknown",
            jobOptions.find(option => option.value === invoice.job_id)?.label || "Unknown",
            invoice.cost.toFixed(2),
            contractorOptions.find(option => option.value === invoice.by_id)?.label || "Unknown",
            invoice.ref,
            invoice.po_id,
            invoice.pay?.reduce((sum, p) => sum + p.amount, 0) ?? 0, 
            invoice.outstanding?.toFixed(2) || "0.00",
            invoice.pay?.map(p => `$${p.amount.toFixed(2)} (pay#${p.code})`).join(" | ") || "N/A",
            
        ].join(","))
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Invoices.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
        displayedInvoices.map(invoice => ({
            "Inv#": invoice.code,
            "Contact Person": invoice.contact,
            "Project": projectOptions.find(option => option.value === invoice.project_id)?.label || "Unknown",
            "Job": jobOptions.find(option => option.value === invoice.job_id)?.label || "Unknown",
            "Price": invoice.cost.toFixed(2),
            "Supplier": contractorOptions.find(option => option.value === invoice.by_id)?.label || "Unknown",
            "Ref": invoice.ref,
            "PO": invoice.po_id,
            "Paid Total": invoice.pay?.reduce((sum, p) => sum + p.amount, 0) ?? 0,   
            "Outstanding": invoice.outstanding?.toFixed(2) || "0.00",
            "Paid": invoice.pay?.map(p => `$${p.amount.toFixed(2)} (pay#${p.code})`).join(" | ") || "N/A",
        }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "Invoices.xlsx");
};


  const totalPages = Math.ceil(displayedInvoices.length / itemsPerPage);
  const { handleViewPurchase } = useNavigationService();
  const { handleViewInvoice } = useNavigationService();
  const { handleViewPay } = useNavigationService();

  const formatDate = (dateString: Date | null | undefined): string => {
    if (!dateString) {
        return '';
    }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; 
};

  return (
    <Container>
      <Title>Invoice Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        
        <ButtonRowFlex>
          <Button onClick={() => handleOpenModal()}>Add Invoice</Button>
          <Button onClick={exportToCSV}>Export to CSV</Button>
          <Button onClick={exportToExcel}>Export to Excel</Button>
        </ButtonRowFlex>
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
          
        ))
        
        }
        <Button 
              onClick={handleToggleOutstanding} 
              className="bg-blue-500 text-white px-4 py-2 rounded-md">
              {showOutstanding ? "Show All Invoices" : "Show Outstanding"}
        </Button>
      </PaginationContainer>

      {isMobileView ? (
        <List>
          {paginatedInvoices.map((Invoice) => (
            <ListItem key={Invoice.code}>
              <button onClick={() => handleViewInvoice(Invoice)} className="text-blue-500">
                Inv#:{Invoice.code}
              </button><br />
              <strong>Contact Person:</strong> {Invoice.contact} <br />
              <strong>Project:</strong> {projectOptions.find((option) => option.value === Invoice.project_id)?.label || "Unknown"} <br />
              <strong>Supplier Name:</strong> {contractorOptions.find((option) => option.value === Invoice.by_id)?.label || "Unknown"} <br />
              <strong>Price:</strong> {(Invoice.cost).toFixed(2)} <br />
              <strong>Job:</strong> {jobOptions.find((option) => option.value === Invoice.job_id)?.label || "Unknown"} <br />
              <strong>PO:</strong> <span className="text-blue-500" onClick={async () => {
                  try {
                    const purchase: any = await fetchPurchaseDetails(Invoice.po_id || 0); // Await the Promise
                    handleViewPurchase(purchase);
                  } catch (error) {
                    console.error("Error fetching purchase details:", error);
                    // Handle the error (e.g., show an error message)
                  }
                }} > {Invoice.po_id} </span> <br />


              <strong>Paid:</strong>
              {Invoice.pay && Invoice.pay.length > 0
                ? Invoice.pay.map((p: any, index: number) => 
                    <span key={p.code} className="invoiceList">
                      ${p.amount.toFixed(2)}
                      <button
                        onClick={async () => {
                          try {
                            const pay:any = await fetchPayDetails(p.code); // Await the Promise
                            console.log("Pay before view:", pay.pay);
                            if (pay) {
                              handleViewPay(pay.pay);
                            } else {
                              console.error(`Pay record not found for pay code: ${p.code}`);
                            }
                          } catch (error) {
                            console.error("Error fetching invoice details:", error);
                          }
                        }}
                        className="text-blue-500 cursor-pointer"
                      >
                        pay#{p.code}
                      </button>
                    </span>
                  )
                : ""}<br />
                <strong>Outstanding:</strong> $ {Invoice.outstanding?.toFixed(2)} <br />
                  {/* {(
                    Invoice.cost -
                    (Invoice.pay?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0)
                  ).toFixed(2)}<br /> */}
              <Button onClick={() => handleOpenModal(Invoice)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(Invoice.code)}>Delete</DeleteButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Inv#</Th>
              <Th>Contact Person</Th>
              <Th>Project</Th>
              <Th>Job</Th>
              <Th>Price</Th>
              <Th>Supplier</Th>
              <Th>Ref</Th>
              <Th>PO</Th>
              <Th>Paid</Th>
              <Th>Outstanding</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((Invoice) => (
              <tr key={Invoice.code}>
                <Td><button onClick={() => handleViewInvoice(Invoice)} className="text-blue-500">
                  {Invoice.code}
                </button>
                </Td>
                <Td>{Invoice.contact}</Td>
                <Td>{projectOptions.find((option) => option.value === Invoice.project_id)?.label || "Unknown"}</Td>
                <Td>{jobOptions.find((option) => option.value === Invoice.job_id)?.label || "Unknown"}</Td>
                <Td>{(Invoice.cost).toFixed(2)}</Td>
                <Td>{contractorOptions.find((option) => option.value === Invoice.by_id)?.label || "Unknown"}</Td>
                <Td>{Invoice.ref}</Td>
                <Td><span className="text-blue-500" onClick={async () => {
                  try {
                    const purchase: any = await fetchPurchaseDetails(Invoice.po_id || 0); // Await the Promise
                    handleViewPurchase(purchase);
                  } catch (error) {
                    console.error("Error fetching purchase details:", error);
                    // Handle the error (e.g., show an error message)
                  }
                }}>{Invoice.po_id}</span></Td>
                <Td>
                {Invoice.pay && Invoice.pay.length > 0
                ? Invoice.pay.map((p: any, index: number) => 
                    <span key={p.code} className="invoiceList">
                      ${p.amount.toFixed(2)}
                      <button 
                        onClick={async () => {
                          try {
                            const pay:any = await fetchPayDetails(p.code); // Await the Promise
                            console.log("Pay before view:", pay.pay);
                            if (pay) {
                              handleViewPay(pay.pay);
                            } else {
                              console.error(`Pay record not found for pay code: ${p.code}`);
                            }
                          } catch (error) {
                            console.error("Error fetching invoice details:", error);
                          }
                        }}
                        className="text-blue-500 cursor-pointer"
                      >
                        pay#:{p.code}
                      </button>
                    </span>
                  )
                : ""}
                </Td>
                <Td>
                $ {Invoice.outstanding?.toFixed(2)}
                </Td>

                
                <Td>
                  <Button onClick={() => handleOpenModal(Invoice)}>Edit</Button>
                </Td>
                <Td>
                  <DeleteButton onClick={() => handleDelete(Invoice.code)}>Delete</DeleteButton>
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
              <label htmlFor="project" >Supplier</label>
              <Dropdown
                name="by_id"
                value={formData.by_id}
                onChange={handleDropChange}
                options={contractorOptions}
                placeholder="Select Contractor"
                required
              />
              <span onClick={handleContractorOpenModal} className="addModal"> +</span>
            </div>

            <div>
              <label htmlFor="project">Select Project</label>
              <Dropdown
                name="project_id"
                value={formData.project_id}
                onChange={handleDropChange}
                options={projectOptions}
                placeholder="Select Project"
                required
              />
            </div>
            <div>
              <label htmlFor="job" >Job</label>
              <Dropdown
                name="job_id"
                value={formData.job_id}
                onChange={handleDropChange}
                options={jobOptions}
                placeholder="Select Job"
                required
              />
              <span onClick={handleJobOpenModal} className="addModal"> +</span>
            </div>

            <div>
              <label htmlFor="cost">Cost</label>
              <Input
                id="cost"
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="Cost"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="due_at">Due Date</label>
              <Input
                id="due_at"
                type="date"
                name="due_at"
                // value={formData.due_at}
                value={formData.due_at ? formatDate(formData.due_at) : ''}
                onChange={handleInputChange}
                placeholder="Due Date"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <Input
                id="description"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description"
                autoComplete="off"
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
              />
            </div>




            <Button type="submit">Save Invoice</Button>
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

export default InvoiceComp;
