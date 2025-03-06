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
  Modal,

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
  gross_pay: number;
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
  const [from_date, setFrom_date] = useState("");
  const [to_date, setTo_date] = useState("");
  const [note, setNote] = useState("");
  const [basePay, setBasePay] = useState(0);
  const [baseHour, setBaseHour] = useState(0);
  const [overtime15, setOvertime15] = useState(0);
  const [overtime20, setOvertime20] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [holidayPay, setHolidayPay] = useState(0);
  const [others, setOthers] = useState(0);
  const [grossPay, setGrossPay] = useState(0);
  const [hours, setHours] = useState(0);
  const [tabValue, setTabValue] = useState(0); // State for tab value
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [openDialog, setOpenDialog] = useState(false);


  // Handle Tab Change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  // Auto-update gross pay when any of the inputs change
  useEffect(() => {
    const computedBasePay = baseHour * (selectedEmployee.salary ? selectedEmployee.salary / 38 : 23);
    const computedOvertime15 = overtime15 * (selectedEmployee.salary ? selectedEmployee.salary / 38 * 1.5 : 34.5);
    const computedOvertime20 = overtime20 * (selectedEmployee.salary ? selectedEmployee.salary / 38 * 2 : 46);
    const computedHours = baseHour + overtime15 + overtime20;
    const computedGrossPay = parseFloat((computedBasePay + computedOvertime15 + computedOvertime20 + bonus + holidayPay + others).toFixed(2));
    setPayPeriod(from_date + " -- " + to_date)
    setBasePay(computedBasePay);
    setHours(computedHours);
    setGrossPay(computedGrossPay);
    console.log(computedBasePay, 'overtime 1.5:', computedOvertime15, computedOvertime20)
  }, [from_date, to_date, selectedEmployee, baseHour, overtime15, overtime20, bonus, holidayPay, others]);

  // Handle Sorting
  const handleSort = (property: keyof Payroll) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle Search
  const filteredData = payrollData.filter(
    (payroll: Payroll) =>
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
        .map((p) => `${p.id},${p.employee.name},${p.period},${p.gross_pay},${p.tax},${p.super},${p.net_pay}`)
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payroll_report.csv";
    link.click();
  };
  const fetchpayRolls1 = async () => {
    let { data, error } = await supabase.from("payroll").select("*, employee(*)");
    if (!error) setPayrollData(data || []);
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
    if (!selectedEmployee || !from_date || !to_date || grossPay <= 0) {
      alert("Fill all needed fields!");
      return;
    }

    // Calculate tax (15%) and super (10%)
    const tax = parseFloat((grossPay * 0.15).toFixed(2));
    const superAmount = parseFloat(
      (grossPay * (selectedEmployee.super_rate ? selectedEmployee.super_rate : 0.1)).toFixed(2)
    );
    const net_pay = parseFloat((grossPay - tax).toFixed(2));

    const newPayroll = {
      employee_id: selectedEmployee.id,
      period: payPeriod,
      gross_pay: grossPay,
      tax: tax,
      super: superAmount,
      net_pay: net_pay,
      base_hour:baseHour,
      overtime_15:overtime15,
      overtime_20:overtime20,
      bonus:bonus,
      holiday_pay:holidayPay,
      other_pay:others,
      from_date:from_date,
      to_date:to_date,
      note:note
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
      setBonus(0);
      setOvertime15(0);
      setOvertime20(0);
      setOthers(0);
      setBaseHour(0);
      setHolidayPay(0);
      setNote("");
      setFrom_date("");
      setTo_date("");
    }
  };

  const handleViewPayroll = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setOpenDialog(true);
  };
  const handleClose = () => {
    setSelectedPayroll(null);
    document.body.style.backgroundColor = "white"; // Reset background color
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container>
      {/* Header */}
      <Typography variant="h4" sx={{ my: 3, fontWeight: 'bold', color: 'primary.main' }}>
        Payroll Management
      </Typography>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Payroll Summary" sx={{
          marginLeft: '0px', marginright: '0px', paddingLeft: '1px', paddingRight: '2px',
        }} onClick={fetchpayRolls1} />
        <Tab label="Add Payroll" sx={{
          marginLeft: '17px', paddingLeft: '2px', paddingRight: '2px',
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
                          Employee
                      </TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "gross_pay"}
                          direction={orderBy === "gross_pay" ? order : "asc"}
                          onClick={() => handleSort("gross_pay")}
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
                          <TableCell>${payroll.gross_pay.toFixed(2)}</TableCell>
                          <TableCell>${payroll.tax.toFixed(2)}</TableCell>
                          <TableCell>${payroll.super.toFixed(2)}</TableCell>
                          <TableCell>${payroll.net_pay.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => handleViewPayroll(payroll)}
                            >
                              View
                            </Button>
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
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Add Payroll</Typography>
            <Grid container spacing={2}>
              {/* Others */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="From Date"
                  type="date"
                  variant="outlined"
                  value={from_date || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFrom_date(value);
                  }}
                  InputLabelProps={{ shrink: true }} // Ensures label stays on top
                />
              </Grid>
              {/* Others */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="To Date"
                  type="date"
                  variant="outlined"
                  onChange={(e) => {
                    const value = e.target.value;
                    setTo_date(value);
                  }}
                  InputLabelProps={{ shrink: true }} // Ensures label stays on top
                />
              </Grid>

              {/* Select Employee */}
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
                        {emp.name} ({emp.position}) ({emp.salary})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Pay Period */}
              {/* <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pay Period"
                  variant="outlined"
                  value={payPeriod}
                  onChange={(e) => setPayPeriod(e.target.value)}
                />
              </Grid> */}

              {/* Base Pay */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Base Hour"
                  type="number"
                  variant="outlined"
                  value={baseHour || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setBaseHour(isNaN(value) ? 0 : value);
                  }}
                />
              </Grid>

              {/* Overtime1.5 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Overtime 1.5"
                  type="number"
                  variant="outlined"
                  value={overtime15 || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setOvertime15(isNaN(value) ? 0 : value);
                  }}
                />
              </Grid>

              {/* Overtime2.0 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Overtime 2.0"
                  type="number"
                  variant="outlined"
                  value={overtime20 || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setOvertime20(isNaN(value) ? 0 : value);
                  }}
                />
              </Grid>

              {/* Bonus */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bonus"
                  type="number"
                  variant="outlined"
                  value={bonus || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setBonus(isNaN(value) ? 0 : value);
                  }}
                />
              </Grid>

              {/* Holiday Pay */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Holiday Pay"
                  type="number"
                  variant="outlined"
                  value={holidayPay || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setHolidayPay(isNaN(value) ? 0 : value);
                  }}
                />
              </Grid>

              {/* Others */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Other Pay"
                  type="number"
                  variant="outlined"
                  value={others || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setOthers(isNaN(value) ? 0 : value);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Note"
                  type="text"
                  variant="outlined"
                  value={note || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNote(value);
                  }}
                />
              </Grid>
                
              {/* Total Hours and Gross Pay Summary */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <h3>Total Hours: {hours.toFixed(2)}</h3>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                <h3>Total Gross Pay: ${grossPay.toFixed(2)}</h3>
                </Typography>
              </Grid>


              {/* Blue Horizontal Line */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Box sx={{ width: "100%", borderBottom: "2px solid lightgrey" }} />
              </Grid>

              {/* Add Payroll Button */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Button variant="contained" color="primary" sx={{ marginRight: "35px" }} onClick={handleAddPayroll}>
                  Add Payroll
                </Button>
              </Grid>


            </Grid>
          </CardContent>

        </Card>
      )}

        {/* Modal for Payslip */}
      <Modal open={!!selectedPayroll} onClose={() => setSelectedPayroll(null)}>
        <Box sx={{ position: "absolute", top: "10%", left: "10%", width: "80%", bgcolor: "white", p: 4 }}>
          {selectedPayroll && (
            <div id="payslip">
              <Typography variant="h5" align="center">Clear Water Pty Ltd</Typography>
              <Typography variant="subtitle2" align="right">ABN: 80 000 000 001</Typography>
              <Typography variant="body1"><strong>Pay Slip For:</strong> {selectedPayroll.employee.name}</Typography>
              {/* <Typography variant="body1"><strong>Annual Salary:</strong> ${selectedPayroll.annualSalary.toFixed(2)}</Typography> */}
              <Typography variant="body1"><strong>Hourly Rate:</strong> {selectedPayroll.employee.salary ? (selectedPayroll.employee.salary / 38).toFixed(2) : 'no entry'}</Typography>
              <Typography variant="body1"><strong>Pay Period:</strong>{selectedPayroll.period}</Typography>
              <Typography variant="h6" align="center" color="primary">Don't worry, be happy!</Typography>

              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Gross Pay</TableCell>
                      <TableCell>Net Pay to Bank</TableCell>
                      <TableCell>Super</TableCell>
                      <TableCell>PYAG withholding:</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      <TableRow>
                        <TableCell>This Pay</TableCell>
                        <TableCell>${selectedPayroll.gross_pay || "-"}</TableCell>
                        <TableCell>${selectedPayroll.net_pay || "-"}</TableCell>
                        <TableCell>${selectedPayroll.super || "-"}</TableCell>
                        <TableCell>${`${selectedPayroll.tax || "-"}` }</TableCell>
                      </TableRow>
                    
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" align="right">Gross Pay: ${selectedPayroll.gross_pay.toFixed(2)}</Typography>
              <Typography variant="h6" align="right">Net Pay: ${selectedPayroll.net_pay.toFixed(2)}</Typography>

              {/* Buttons (Hidden When Printing) */}
            <Box mt={2} display="flex" justifyContent="space-between" className="no-print">
              <Button variant="contained" color="secondary" onClick={handleClose}>Close</Button>
              <Button variant="contained" color="primary" onClick={handlePrint}>Print</Button>
            </Box>
            </div>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default PayrollDashboard;