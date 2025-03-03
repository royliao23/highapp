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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import { supabase } from "../supabaseClient";

interface Employee {
  id: number;
  name: string;
  email: string;
  salary?: number;
  position?: string;
  super_rate?: number;
}

// Define Payroll Data Interface
interface Payroll {
  id: number;
  employee: Employee;
  period: string;
  grossPay: number;
  tax: number;
  super: number;
  net_pay: number;
}




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
  const [payrollData, setPayrollData] = useState<Payroll[]>([]);
  const [search, setSearch] = useState<string>("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Payroll>("employee");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [employees, setEmployees] = useState<any[] | null>([{
    id: 0,
    name: "",
    email: ""
  }]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>({
    id: 0,
    name: "",
    email: ""
  });
  const [payPeriod, setPayPeriod] = useState("");
  const [grossPay, setGrossPay] = useState(0);
  const [tabValue, setTabValue] = useState(0); // State for tab value

  // Handle Tab Change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle Sorting
  const handleSort = (property: keyof Payroll) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle Search
  const filteredData = payrollData.filter(
    (payroll:Payroll) =>
      payroll.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
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
        .map((p) => `${p.id},${p.employee},${p.period},${p.grossPay},${p.tax},${p.super},${p.net_pay}`)
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payroll_report.csv";
    link.click();
  };

  useEffect(() => {
    const fetchpayRolls = async () => {
      let { data, error } = await supabase.from("payroll").select("*, employee(*)");
      if (!error) setPayrollData(data || []);
    };
    const fetchEmployees = async () => {
      let { data, error } = await supabase.from("employee").select("*");
      if (!error) setEmployees(data);
    };
    fetchEmployees();
    fetchpayRolls();
  }, []);

  const handleAddPayroll = async () => {
    if (!selectedEmployee || !payPeriod || grossPay <= 0) {
      alert("Fill all fields!");
      return;
    }

    // Calculate tax (15%) and super (10%)
    const tax = grossPay * 0.15;
    const superAmount = grossPay * (selectedEmployee.super_rate ? selectedEmployee.super_rate : 0.1);
    const net_pay = grossPay - tax;

    const newPayroll = {
      employee_id: selectedEmployee.id,
      period: payPeriod,
      gross_pay: grossPay,
      tax: tax,
      super: superAmount,
      net_pay: net_pay,
    };

    const { data, error } = await supabase.from("payroll").insert([newPayroll]);

    if (error) {
      console.error("Error adding payroll:", error);
      alert("Failed to add payroll!");
    } else {
      alert("Payroll added successfully!");
      // Reset form fields
      setSelectedEmployee({ id: 0, name: "", email: "" });
      setPayPeriod("");
      setGrossPay(0);
    }
  };

  return (
    <Container>
      {/* Header */}
      <Typography variant="h4" sx={{ my: 3, fontWeight: 'bold', color: 'primary.main'}}>
        Payroll Management
      </Typography>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Payroll Summary" sx={{
          marginLeft: '0px', marginright: '0px',paddingLeft: '1px', paddingRight: '2px',
        }} />
        <Tab label="Add Payroll" sx={{
            marginLeft: '17px',paddingLeft: '2px', paddingRight: '2px', 
          }} />
      </Tabs>

      {/* Tab Content */}
      {tabValue === 0 && (
        <>
          {/* Actions & Filters */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
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
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Payroll Summary</Typography>
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
                          <TableCell>{payroll.employee?.name}</TableCell>
                          <TableCell>{payroll.period}</TableCell>
                          <TableCell>${payroll.grossPay}</TableCell>
                          <TableCell>${payroll.tax}</TableCell>
                          <TableCell>${payroll.super}</TableCell>
                          <TableCell>${payroll.net_pay}</TableCell>
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
        </>
      )}

      {tabValue === 1 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb:2 , fontWeight: 'bold' }} >Add Payroll</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Employee</InputLabel>
                  <Select
                    value={selectedEmployee.id}
                    onChange={(e) => setSelectedEmployee(employees?.find(emp => emp.id === e.target.value) || { id: 0, name: "", email: "" })}
                    label="Select Employee"
                  >
                    <MenuItem value="">-- Select Employee --</MenuItem>
                    {employees?.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.position})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pay Period"
                  variant="outlined"
                  value={payPeriod}
                  onChange={(e) => setPayPeriod(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Gross Pay"
                  type="number"
                  variant="outlined"
                  value={grossPay}
                  onChange={(e) => setGrossPay(parseFloat(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleAddPayroll}>
                  Add Payroll
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default PayrollDashboard;