import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Box,
  TextField,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import { supabase } from "../supabaseClient";

// Define Payroll Data Interface
interface Payroll {
  id: number;
  employee: string;
  period: string;
  grossPay: number;
  tax: number;
  super: number;
  netPay: number;
}

interface Employee {
    id: number;
    name: string;
    email: string;
    salary?: number;
    position?: string;
    super_rate?: number;
  }

// Sample Payroll Data
const initialPayrollData: Payroll[] = [
  { id: 1, employee: "John Doe", period: "01-15 Feb 2024", grossPay: 5000, tax: 750, super: 500, netPay: 3750 },
  { id: 2, employee: "Jane Smith", period: "01-15 Feb 2024", grossPay: 6000, tax: 900, super: 600, netPay: 4500 },
  { id: 3, employee: "Michael Johnson", period: "16-28 Feb 2024", grossPay: 7000, tax: 1050, super: 700, netPay: 5250 },
  { id: 4, employee: "Ann Doe", period: "01-15 Feb 2024", grossPay: 5000, tax: 750, super: 500, netPay: 3750 },
  { id: 5, employee: "Jane Kid", period: "01-15 Feb 2024", grossPay: 6000, tax: 900, super: 600, netPay: 4500 },
  { id: 6, employee: "Michael Wang", period: "16-28 Feb 2024", grossPay: 7000, tax: 1050, super: 700, netPay: 5250 },
];

// Sorting function
const descendingComparator = (a: Payroll, b: Payroll, orderBy: keyof Payroll): number => {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

const getComparator = (order: "asc" | "desc", orderBy: keyof Payroll) =>
  order === "desc"
    ? (a: Payroll, b: Payroll) => descendingComparator(a, b, orderBy)
    : (a: Payroll, b: Payroll) => -descendingComparator(a, b, orderBy);

const PayrollDashboard: React.FC = () => {
  const [payrollData, setPayrollData] = useState<Payroll[]>(initialPayrollData);
  const [search, setSearch] = useState<string>("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Payroll>("employee");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [employees, setEmployees] = useState<any[] | null>([{
    id:0,
    name: "",
    email: ""
  }]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>({
    id:0,
    name: "",
    email: ""});
  const [payPeriod, setPayPeriod] = useState("");
  const [grossPay, setGrossPay] = useState(0);

  // Handle Sorting
  const handleSort = (property: keyof Payroll) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle Search
  const filteredData = payrollData.filter(
    (payroll) =>
      payroll.employee.toLowerCase().includes(search.toLowerCase()) ||
      payroll.period.includes(search)
  );

  // Handle Pagination
  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Export as CSV
  const handleExportCSV = () => {
    const csvContent =
      "ID,Employee,Period,Gross Pay,Tax,Super,Net Pay\n" +
      payrollData
        .map((p) => `${p.id},${p.employee},${p.period},${p.grossPay},${p.tax},${p.super},${p.netPay}`)
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payroll_report.csv";
    link.click();
  };
  useEffect(() => {
    const fetchEmployees = async () => {
      let { data, error } = await supabase.from("employee").select("*");
      if (!error) setEmployees(data);
    };
    fetchEmployees();
  }, []);

  const handleAddPayroll = async () => {
    if (!selectedEmployee || !payPeriod || grossPay <= 0) {
      alert("Fill all fields!");
      return;
    }

    // Calculate tax (15%) and super (10%)
    const tax = grossPay * 0.15;
    const superAmount = grossPay * (selectedEmployee.super_rate?selectedEmployee.super_rate:0.1);
    const netPay = grossPay - tax;

    const newPayroll = {
      employee_id: selectedEmployee.id,
      period: payPeriod,
      gross_pay: grossPay,
      tax: tax,
      super: superAmount,
      net_pay: netPay,
    };

    const { data, error } = await supabase.from("payroll").insert([newPayroll]);

    if (error) {
      console.error("Error adding payroll:", error);
      alert("Failed to add payroll!");
    } else {
      alert("Payroll added successfully!");
    }
  };


  return (
    <Container>
      {/* Header */}
      <Typography variant="h4" sx={{ my: 3 }}>Payroll Management</Typography>

      {/* Actions & Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary">Add Payroll</Button>
        <Button variant="outlined" color="secondary" onClick={handleExportCSV}>Export CSV</Button>
        <TextField
          label="Search by Employee or Date"
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1, minWidth: 200 }}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Payroll Summary Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Payroll Summary</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "id"}
                      direction={orderBy === "id" ? order : "asc"}
                      onClick={() => handleSort("id")}
                    >
                      ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "employee"}
                      direction={orderBy === "employee" ? order : "asc"}
                      onClick={() => handleSort("employee")}
                    >
                      Employee
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "grossPay"}
                      direction={orderBy === "grossPay" ? order : "asc"}
                      onClick={() => handleSort("grossPay")}
                    >
                      Gross Pay ($)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Tax ($)</TableCell>
                  <TableCell>Super ($)</TableCell>
                  <TableCell>Net Pay ($)</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .sort(getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>{payroll.id}</TableCell>
                      <TableCell>{payroll.employee}</TableCell>
                      <TableCell>{payroll.period}</TableCell>
                      <TableCell>${payroll.grossPay}</TableCell>
                      <TableCell>${payroll.tax}</TableCell>
                      <TableCell>${payroll.super}</TableCell>
                      <TableCell>${payroll.netPay}</TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
      <div>
      <h2>Payroll Management</h2>
      <label>Select Employee:</label>
      <select onChange={(e) => setSelectedEmployee(JSON.parse(e.target.value))}>
        <option value="">-- Select Employee --</option>
        {employees?.map((emp) => (
          <option key={emp.id} value={JSON.stringify(emp)}>
            {emp.name} ({emp.position})
          </option>
        ))}
      </select>

      <label>Pay Period:</label>
      <input type="text" onChange={(e) => setPayPeriod(e.target.value)} />

      <label>Gross Pay:</label>
      <input type="number" onChange={(e) => setGrossPay(parseFloat(e.target.value))} />

      <button onClick={handleAddPayroll}>Add Payroll</button>
    </div>
    </Container>
  );
};

export default PayrollDashboard;
