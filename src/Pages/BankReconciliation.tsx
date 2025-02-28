import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import { Invoice } from "../models";

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
    status?:string
}

// Dummy Bank Records (from bank statement)
const bankRecords = [
    { id: 1, date: "2024-02-20", amount: 100, description: "Bank Transfer ABC" },
    { id: 2, date: "2024-02-18", amount: 20, description: "Bank Deposit XYZ" },
    { id: 3, date: "2024-02-18", amount: 49.3, description: "Bank Deposit XYZ" },
];


const BankReconciliation = () => {
    const [payRecords, setPayRecords] = useState<Pay[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);  // State to hold fetched invoices
    const [loading, setLoading] = useState<boolean>(true); // State to handle loading state
    const [error, setError] = useState<string | null>(null); // State to handle error messages

    // Fetch invoices from Supabase API
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const { data, error } = await supabase.from("jobby").select("*");

if (error) {
    throw error;
}

const unpaidInvoices = data?.filter((filteredInvoice) => filteredInvoice.status !== "paid");
console.log("unpaidInvoices:", unpaidInvoices);
setInvoices(unpaidInvoices);
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
        const { data, error } = await supabase.from("pay").insert([newPayRecord]);

        
            alert("start to update invoice");
            // Update the invoice status to "paid"
            const { error: updateError } = await supabase
                .from("jobby")
                .update({ status: "paid" })  // Corrected update syntax
                .eq("code", invoice.code);
    
            if (updateError) {
                console.error("Error updating invoice status:", updateError);
                alert("Failed to update invoice status!");
                return;
            }
        

        if (error) {
            console.error("Error inserting pay record:", error);
            alert("Failed to save payment!");
            return;
        }
        

        // Add to state only if insertion is successful
        setPayRecords((prev) => [...prev, newPayRecord]);
        alert("Payment successfully matched!");
    };

    return (
        <Container>
            <Typography variant="h4" sx={{ my: 3 }}>
                Bank Reconciliation
            </Typography>

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
                                <TableCell>Match</TableCell>
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
                                        {/* <TableCell>{invoice.due_at}</TableCell> */}
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
