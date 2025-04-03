import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import { AgeInvoice } from "../models";
import Pagination from "../components/Pagination";
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

  @media print {
    display: none; /* Hide the button when printing */
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media print {
    display: none; /* Hide controls when printing */
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  font-size: 1rem; /* Default size */

  @media (max-width: 1000px) {
    font-size: 0.6rem; /* 40% smaller */
  }
`;

const Th = styled.th`
  padding: 0.8rem;
  background-color: #007bff;
  color: #fff;

  @media (max-width: 1000px) {
    padding: 0.3rem; /* Reduce padding */
    font-size: 0.6rem;
  }
`;

const Td = styled.td`
  padding: 0.8rem;
  text-align: center;
  border: 1px solid #ddd;

  @media (max-width: 1000px) {
    padding: 0.3rem; /* Reduce padding */
    font-size: 0.6rem; /* 40% smaller */
  }
`;


// Main Component
const AgingReport: React.FC = () => {
    const [invoices, setInvoices] = useState<AgeInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAgingReport = async () => {
            setLoading(true);
            let { data, error } = await supabase
                .from("jobby") // Invoice table
                .select(`
                    code,
                    due_at,
                    cost,
                    ref,
                    contractor(*),
                    pay(amount)
                `)
                .order("due_at", { ascending: true });

            if (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
                return;
            }

            const today = new Date();
            const invoicesProcessed = data?.map((invoice) => {
                const totalPaid = invoice.pay ? invoice.pay.reduce((sum, p) => sum + p.amount, 0) : 0;
                const amountDue = invoice.cost - totalPaid;

                let agingBucket;
                const daysPastDue = (new Date(invoice.due_at as string).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

                if (daysPastDue >= 0) agingBucket = "Current";
                else if (daysPastDue >= -30) agingBucket = "1-30 Days";
                else if (daysPastDue >= -60) agingBucket = "31-60 Days";
                else if (daysPastDue >= -90) agingBucket = "60+ Days";
                else agingBucket = "90+ Days";

                return {
                    ...invoice,
                    totalPaid,
                    amountDue,
                    agingBucket,
                };
            });

            setInvoices(invoicesProcessed ?? []);
            setLoading(false);
        };

        fetchAgingReport();
    }, []);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const displayedInvoices = invoices.filter((invoice) =>
        invoice.contractor?.company_name.toLowerCase().includes(searchTerm)
    );

    const handlePrint = () => {
        if (printRef.current) {
            window.print();
        }
    };

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10); 
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
      };
    const paginatedReport = displayedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(displayedInvoices.length / itemsPerPage);

    
    if (loading) return <p>Loading...</p>;

    return (
        <Container>
            <Title>Creditor Aging Report</Title>
            <ButtonRow>
                <SearchBox searchTerm={searchTerm}  onSearchChange={handleSearchChange} />
                <Button onClick={handlePrint}>Print Report</Button>
            </ButtonRow>

            <Pagination totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />

            {/* Printable Report Section */}
            <div ref={printRef}>
                <Table>
                    <thead>
                        <tr>
                            <Th>Company</Th>
                            <Th>Due Date</Th>
                            <Th>Invoice Code</Th>
                            <Th>Reference</Th>
                            <Th>Amount</Th>
                            <Th>Paid</Th>
                            <Th>Due</Th>
                            <Th>Aging Bucket</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedReport.map((invoice) => (
                            <tr key={invoice.code}>
                                <Td>{invoice.contractor.company_name}</Td>
                                <Td>{new Date(invoice.due_at).toLocaleDateString()}</Td>
                                <Td>{invoice.code}</Td>
                                <Td>{invoice.ref}</Td>
                                <Td>${invoice.cost.toFixed(2)}</Td>
                                <Td>${invoice.totalPaid.toFixed(2)}</Td>
                                <Td>${invoice.amountDue.toFixed(2)}</Td>
                                <Td>{invoice.agingBucket}</Td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default AgingReport;
