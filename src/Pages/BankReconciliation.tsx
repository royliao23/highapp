import React, { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import { Invoice } from "../models";
import CSVUploader from "../components/BankUpload";
import { BankRecord } from "../models";
import { fetchUnpaidInvoice, updateInvStatus, createPay } from "../api";
// Interface for Pay (Matched Payments)
interface Pay {
    invoice_id: number;
    pay_via: string;
    amount: number;
    supply_invoice: string;
    note: string;
    approved_by: string;
    create_at: Date;
    updated_at: Date;
    status?: string
}

// Dummy Bank Records (from bank statement)
const bankRecords = [
    { id: 1, date: "2024-02-20", amount: 101, description: "Bank Transfer ABC" },
    { id: 2, date: "2024-02-18", amount: 4303.80, description: "Bank Deposit XYZ" },
    { id: 3, date: "2024-02-18", amount: 24, description: "Bank Deposit XYZ" },
];


const BankReconciliation = () => {
    const [payRecords, setPayRecords] = useState<Pay[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);  // State to hold fetched invoices
    const [loading, setLoading] = useState<boolean>(true); // State to handle loading state
    const [error, setError] = useState<string | null>(null); // State to handle error messages
    const [bankRecords, setBankRecords] = useState<BankRecord[]>([
        { id: 1, date: "2024-02-20", amount: 101, description: "Bank Transfer ABC" },
        { id: 2, date: "2024-02-18", amount: 4303.80, description: "Bank Deposit XYZ" },
        { id: 3, date: "2024-02-18", amount: 24, description: "Bank Deposit XYZ" },
    ]);
    // Fetch invoices from Supabase API
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const data = await fetchUnpaidInvoice(); // Fetch unpaid invoices from the API
                if (data.error) {
                    throw new Error(data.error.message || "Failed to fetch invoices");
                }

                setInvoices(data);
            } catch (err) {
                setError("Failed to fetch invoices.");
                console.error("Error fetching invoices:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const handleMatch = async (bankId: number, invoice: Invoice) => {
        const newPayRecord: Pay = {
            invoice_id: invoice.code,
            pay_via: "Bank Transfer",
            amount: invoice.cost,
            supply_invoice: `SI-${invoice.ref}`,
            note: `Matched with Bank ID ${bankId}`,
            approved_by: "Admin",
            create_at: new Date(),
            updated_at: new Date(),
        };

        // Insert into Supabase
        const data = await createPay(newPayRecord);
        if (data.error) {
            console.error("Error inserting pay record:", data?.error);
            alert("Failed to save payment!");
            throw new Error(data.error.message || "Failed to save payment");
        }
        // Update the invoice status to "paid"
        const newdata = await updateInvStatus(invoice.code, newPayRecord);
        if (newdata.error) {
            console.error("Error updating invoice status:", newdata?.error);
            alert("Failed to update invoice status!");
            throw new Error(newdata.error.message || "Failed to update invoice status");
        }


        // Add to state only if insertion is successful
        setPayRecords((prev) => [...prev, newPayRecord]);
        alert("Payment successfully matched!");
    };

    const handleUpload = (records: BankRecord[]) => {
        setBankRecords(records); // Update state with uploaded transactions
        console.log("Bank Records:", records);
    };

    return (
        <Container>
            <Typography variant="h4" sx={{ my: 3 }}>
                Bank Reconciliation
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: "left", bgcolor: "#f5f5f5" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Upload Bank Statement
                </Typography>
                <CSVUploader onUpload={handleUpload} />
            </Paper>

            {/* Bank Transactions Table */}
            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ p: 2 }}>Bank Transactions</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bankRecords.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell>{record.id}</TableCell>
                                <TableCell>{record.date}</TableCell>
                                <TableCell>${record.amount}</TableCell>
                                <TableCell>{record.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Invoices Table */}
            {loading ? (
                <Typography variant="h6" sx={{ p: 2 }}>Loading invoices...</Typography>
            ) : error ? (
                <Typography variant="h6" sx={{ p: 2, color: "red" }}>{error}</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>Invoices</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell style={{ "paddingLeft": "40px" }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.map((invoice) => {
                                const isMatched = payRecords.some((p) => p.invoice_id === invoice.code);

                                return (
                                    <TableRow key={invoice.code}>
                                        <TableCell
                                            style={{
                                                textDecoration: isMatched ? "line-through" : "none",
                                                color: isMatched ? "gray" : "black",
                                            }}
                                        >
                                            {invoice.code}
                                        </TableCell>
                                        <TableCell
                                            style={{
                                                textDecoration: isMatched ? "line-through" : "none",
                                                color: isMatched ? "gray" : "black",
                                            }}
                                        >${invoice.cost}</TableCell>
                                        <TableCell>{invoice.due_at?.toString()}</TableCell>
                                        <TableCell>
                                            {bankRecords.map((record) =>
                                                record.amount === invoice.cost && !isMatched ? (
                                                    <Button
                                                        key={record.id}
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleMatch(record.id, invoice)}
                                                        sx={{ m: 1 }}
                                                    >
                                                        Match with Bank #{record.id}
                                                    </Button>
                                                ) : null
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Matched Payments Table */}
            <TableContainer component={Paper}>
                <Typography variant="h6" sx={{ p: 2 }}>Matched Payments</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Code</TableCell>
                            <TableCell>Invoice ID</TableCell>
                            <TableCell>Pay Via</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Supply Invoice</TableCell>
                            <TableCell>Note</TableCell>
                            <TableCell>Approved By</TableCell>
                            <TableCell>Created At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payRecords.map((pay, index) => (
                            <TableRow key={index}>
                                <TableCell>{pay.invoice_id}</TableCell>
                                <TableCell>{pay.pay_via}</TableCell>
                                <TableCell>${pay.amount}</TableCell>
                                <TableCell>{pay.supply_invoice}</TableCell>
                                <TableCell>{pay.note}</TableCell>
                                <TableCell>{pay.approved_by}</TableCell>
                                <TableCell>{pay.create_at.toISOString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default BankReconciliation;
