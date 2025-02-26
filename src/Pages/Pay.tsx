import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import Dropdown from "../components/Dropdown";
import { Pay, Contractor, } from "../models";
import { useNavigationService } from "../services/SharedServices";
import { fetchInvoiceDetails } from "../services/SupaEndPoints";
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
  const [formData, setFormData] = useState<Omit<Pay, "code" | "jobby">>({
    invoice_id: 0,
    pay_via: '',
    amount: 0,
    supply_invoice: '', // Fix the typo if it's supposed to match Pay interface
    note: '',
    approved_by: '',
    create_at: new Date(),
    updated_at: new Date(), // Fix `time` type issue

  });
  
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which Pay is being edited
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const fetchPays = async () => {
    try {
        const { data, error } = await supabase
        .from("pay")
        .select("*, jobby(*)") // Fetch all columns from pay and related invoice details
        .order("code", { ascending: false });
      if (error) throw error;
      setPays(data || []);
    } catch (error) {
      console.error("Error fetching Pays:", error);
    }
  };


  const [invoiceOptions, setInvoiceOptions] = useState([
    { value: 0, label: "" },
  ]);

  const fetchInvoiceOptions = async () => {
    try {
        const { data, error } = await supabase
            .from("jobby")
            .select("*, pay(*)") // Fetch invoices with payments
            .order("code", { ascending: false });

        if (error) throw error;

        // Transform data into { value, label } format
        const transformedData = data.map((item) => {
            // Calculate total paid amount
            const totalPaid = item.pay?.reduce((sum:number, p:any) => sum + p.amount, 0) || 0;
            
            // Calculate balance (cost - totalPaid)
            const balance = Math.max(0, item.cost - totalPaid); // Ensure balance is not negative

            return {
                value: item.code, 
                label: `inv#${item.code} ➡ $${item.cost.toFixed(2)} | Paid: $${totalPaid.toFixed(2)} | Balance: $${balance.toFixed(2)}`
            };
        });

        console.log("Fetched invoices:", transformedData);

        // Update the state with fetched invoices
        setInvoiceOptions(transformedData);
    } catch (error) {
        console.error("Error fetching invoices:", error);
    }
};


  useEffect(() => {
    fetchInvoiceOptions();
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



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
        // Fetch the invoice details to get the total cost and total paid amount
        const { data: invoiceData, error: invoiceError } = await supabase
            .from("jobby")
            .select("cost, pay(*)")
            .eq("code", formData.invoice_id)
            .single(); // Fetch only one record

        if (invoiceError) throw invoiceError;
        if (!invoiceData) throw new Error("Invoice not found.");

        // Calculate total paid amount
        let totalPaid = invoiceData.pay?.reduce((sum, p) => sum + p.amount, 0) || 0;
        if (editingCode !== null) {
          // If editing, subtract the current payment from totalPaid
          const currentPay = invoiceData.pay?.find(p => p.code === editingCode);
          if (currentPay) {
              totalPaid -= currentPay.amount; // Exclude the existing amount from balance calculation
          }
      }
        // Calculate the remaining balance
        const balance = Math.max(0, invoiceData.cost - totalPaid);

        // Check if the new payment exceeds the balance
        if (formData.amount > balance) {
            alert(`Payment exceeds balance! Remaining balance: $${balance.toFixed(2)}`);
            return; // Stop execution
        }

        if (editingCode !== null) {
            // Update an existing Pay
            const { error } = await supabase
                .from("pay")
                .update(formData)
                .eq("code", editingCode);

            if (error) throw error;

            setEditingCode(null);
        } else {
            // Add a new Pay
            const { error } = await supabase.from("pay").insert([formData]);

            if (error) throw error;
        }

        // Refresh the list and reset the form
        fetchPays();
        handleCloseModal();
        fetchInvoiceOptions(); // Refresh the invoice options
    } catch (error) {
        console.error("Error saving Pay:", error);
    }
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
  

  const handleDropChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const paginatedPays = filteredPays.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPays.length / itemsPerPage);
  const { handleViewPay } = useNavigationService();
  const { handleViewInvoice } = useNavigationService();
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
                Pay #: {Pay.code}
              </button><br />
              <strong>Invoice ID:</strong> <span onClick={async () => {try {
                                  const invoice: any = await fetchInvoiceDetails(Pay.jobby.code || 0); // Await the Promise
                                  handleViewInvoice(invoice);
                                } catch (error) {
                                  console.error("Error fetching purchase details:", error);
                                  // Handle the error (e.g., show an error message)
                                }}} className="text-blue-500">{Pay.invoice_id} </span><br />
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
              <Th>Pay #</Th>
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
                <Td onClick={async () => {try {
                                  const invoice: any = await fetchInvoiceDetails(Pay.jobby.code || 0); // Await the Promise
                                  handleViewInvoice(invoice);
                                } catch (error) {
                                  console.error("Error fetching purchase details:", error);
                                  // Handle the error (e.g., show an error message)
                                }}} className="text-blue-500">{Pay.invoice_id}</Td>
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
                options={invoiceOptions}
                placeholder="Select Invoice"
                required
              />
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
      
    </Container>
  );
};

export default PayComp;
