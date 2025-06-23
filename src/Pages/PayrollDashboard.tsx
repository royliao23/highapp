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
import { fetchCompany as fcompany, fetchPayroll, updatePayroll, deletePayroll, createPayroll, fetchEmployee as fetchEmployeesApi } from "../api";
import { fetchSingleUserRole } from "../services/DetailService";
// import { supabase } from "../supabaseClient";
import { Company } from "../models";

interface Employee {
  id: number;
  name: string;
  first_name?:string;
  last_name?:string;
  email: string;
  salary?: number;
  position?: string;
  super_rate?: number;
  employee?:any
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
  base_hour:number;
  overtime_15:number;
  overtime_20:number;
  bonus:number;
  other_pay:number;
  holiday_pay:number;
  note:string;
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
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof Payroll>("employee");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
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
  const [ytd,setYtd] = useState({ gross_total: 0, tax_total: 0, super_total: 0, net_total: 0 })
  const [company, setCompany] = useState<Company | null>(null);
  const [role, setRole] = useState<string>("");
  
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
    const computedGrossPay = parseFloat((computedBasePay + computedOvertime15 + computedOvertime20 + bonus + holidayPay + others)?.toFixed(2));
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
      (payroll.employee?.first_name?.toLowerCase().trim()+" "+payroll.employee?.last_name?.toLowerCase().trim()).includes(search.toLowerCase()) ||
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
      "ID,Employee,Period,Gross Pay,Tax,Super,Net Pay,Base Hour,Overtime 15,Overtime 20, Holiday Pay,Bonus,Other Pay, Note\n" +
      payrollData
        .map((p) => `${p.id},${p.employee.name},${p.period},${p.gross_pay},${p.tax},${p.super},${p.net_pay},${p.base_hour},${p.overtime_15},${p.overtime_20},${p.holiday_pay},${p.bonus},${p.other_pay}, ${p.note}`)
        .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payroll_report.csv";
    link.click();
  };
  const fetchpayRolls1 = async () => {
    try {
      let data = await fetchPayroll();
      return data;
    } catch (error) {
      console.error("Error fetching payroll:", error);
      return []
    }
  };
  const fetchPayrolls = async () => {
        const data = await fetchpayRolls1();
        if (data && !data.error) {
          setPayrollData(data);
        } else {
          console.error("Error fetching payroll data:", data?.error);
        }
      };
  
  const fetchCompany = async () => {
      try {
        const data = await fcompany();
        if (!data) throw new Error("Company not found");
        if (data.error) throw new Error(data.error);
        setCompany(data[0] || null);
        
      } catch (error) {
        console.error("Error fetching company:", error);
      }
  }

  const fetchEmployees = async () => {
    
    const dataEmp = await fetchEmployeesApi();
    if (dataEmp.error) {
      throw dataEmp.error;
    }
    setEmployees(dataEmp || []);
  };
  useEffect(() => {
    const fetchData = async () => {
      // 1. Get the current user's role
      const id=localStorage.getItem("id")
      try {
      const roleData= await fetchSingleUserRole(parseInt(id || "0"));
      if (roleData.error) {
        console.error("Error fetching user role:", roleData.error);
        return;
      }
      console.log("User role:", roleData?.role);
      setRole(roleData?.role || "");
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
      
  
      if (role !== "hr") {
        console.log("Access denied: User is not HR");
        return; // Exit if role is not "hr"
      }
  
      // 2. Only fetch if role === "hr"
      

      await Promise.all([fetchPayrolls(), fetchEmployees(), fetchCompany()]);
    };

    fetchData();
  }, [role]);

  const calculateAustralianTax = (weeklyGrossPay:number) => {
    const annualGrossPay = weeklyGrossPay * 52; // Approximate annual income

  if (annualGrossPay <= 18200) {
    return 0;
  } else if (annualGrossPay <= 45000) {
    return ((annualGrossPay - 18200) * 0.19) / 52;
  } else if (annualGrossPay <= 120000) {
    return (5092 + (annualGrossPay - 45000) * 0.325) / 52;
  } else if (annualGrossPay <= 180000) {
    return (29467 + (annualGrossPay - 120000) * 0.37) / 52;
  } else {
    return (51667 + (annualGrossPay - 180000) * 0.45) / 52;
  }
  }
//  payload: {
//     "employee_id": 3,
//     "period": "2025-06-02 -- 2025-06-08",
//     "gross_pay": 890.16,
//     "tax": 105.97507692307691,
//     "super": 89.02,
//     "net_pay": 784.18,
//     "base_hour": 1.9,
//     "overtime_15": 2.9,
//     "overtime_20": 3.9,
//     "bonus": 4.9,
//     "holiday_pay": 3.1,
//     "other_pay": 140.1,
//     "from_date": "2025-06-02",
//     "to_date": "2025-06-08",
//     "note": ""
// }

  const handleAddPayroll = async () => {
    if (!selectedEmployee || !from_date || !to_date || grossPay <= 0) {
      alert("Fill all needed fields!");
      return;
    }

    // Calculate tax (15%) and super (10%)
    const tax:number = calculateAustralianTax(grossPay);
    console.log(tax);
    const superAmount = parseFloat(
      (grossPay * (selectedEmployee?.employee?.super_rate ? selectedEmployee.employee.super_rate : 0.1))?.toFixed(2)
    );
    console.log(`Superannuation: $${superAmount}, selectedEmployee: ${JSON.stringify(selectedEmployee)}`);
    const net_pay = parseFloat((grossPay - tax)?.toFixed(2));

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

    const data = await createPayroll(newPayroll);

    if (data.error) {
      console.error("Error adding payroll:", data.error);
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
      fetchPayrolls();
    }
  };
  
  const calculateAnnualSalary = (employee: Employee, payrollData: Payroll[]) => {
    // Filter payroll records for the given employee
    const employeePayrolls = payrollData.filter(
      (payroll) => payroll.employee.id === employee.id
    );
  
    // Sum up the required fields
    const totals = employeePayrolls.reduce(
      (acc, payroll) => {
        acc.gross_total += Number(payroll.gross_pay) || 0;
        acc.tax_total += Number(payroll.tax) || 0;
        acc.super_total += Number(payroll.super) || 0;
        acc.net_total += Number(payroll.net_pay) || 0;
        
        return acc;
      },
      { gross_total: 0, tax_total: 0, super_total: 0, net_total: 0 }
    );
    
    return totals;
  };
  
 
  const handleSearch = (event: any) => {
    setPage(0)
    setSearch(event.target.value);
  };

  const handleViewPayroll = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setOpenDialog(true);
    const annualSalary = calculateAnnualSalary(payroll.employee, payrollData);
    setYtd(annualSalary);
    console.log(annualSalary);
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
      { role !== 'hr' ? (
        <Box sx={{ height: '300px', position: 'relative' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Precise centering
          }}
        >
          You are not authorized to view this page.
        </Typography>
      </Box>
      ) : (
        <>
      <Typography variant="h4" sx={{ my: 3,  color: 'primary.main' }}>
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
            <Button variant="outlined" color="secondary" onClick={handleExportCSV} sx={{ height:"20px", padding: 3.5, gap: 2, marginTop:4, marginLeft:2 }}>Export CSV</Button>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 2, gap: 2 }}>
              <TextField
                label="Search Employee Name or Period"
                variant="outlined"
                margin="normal"
                onChange={handleSearch}
              />
            </Box>
          </Box>
          

          {/* Payroll Summary Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Payroll Summary</Typography>
              <TableContainer component={Paper} >
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
                      <TableCell>View</TableCell>
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
                      <TableCell>Base Hour</TableCell>
                      <TableCell>Overtime 1.5</TableCell>
                      <TableCell>Overtime 2.0</TableCell>
                      <TableCell>Bonus ($)</TableCell>
                      <TableCell>Other Pay ($)</TableCell>
                      <TableCell>Tax ($)</TableCell>
                      <TableCell>Super ($)</TableCell>
                      <TableCell>Net Pay ($)</TableCell>
                      <TableCell>Holiday Pay ($)</TableCell>
                      <TableCell>Note</TableCell>
                      
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .sort(getComparator(order, orderBy))
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((payroll) => (
                        <TableRow key={payroll.id}>
                          <TableCell>{payroll.id}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => handleViewPayroll(payroll)}
                            >
                              View
                            </Button>
                          </TableCell>
                          <TableCell>{payroll.employee?.name}</TableCell>
                          <TableCell>{payroll.period}</TableCell>
                          <TableCell>${Number(payroll.gross_pay || 0).toFixed(2)}</TableCell>
                          <TableCell>{payroll.base_hour}</TableCell>
                          <TableCell>{payroll.overtime_15}</TableCell>
                          <TableCell>{payroll.overtime_20}</TableCell>
                          <TableCell>{payroll.bonus}</TableCell>
                          <TableCell>{payroll.other_pay}</TableCell>
                          <TableCell>${Number(payroll.tax || 0).toFixed(2)}</TableCell>
                          <TableCell>${Number(payroll.super || 0).toFixed(2) }</TableCell>
                          <TableCell>${Number(payroll.net_pay || 0).toFixed(2) }</TableCell>
                          <TableCell>${Number(payroll.holiday_pay || 0).toFixed(2)}</TableCell>
                          <TableCell>{payroll.note}</TableCell>
                          
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
                  <h3>Total Hours: {hours?.toFixed(2)}</h3>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                <h3>Total Gross Pay: ${grossPay?.toFixed(2)}</h3>
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
              <Typography variant="h5" align="center">{company?.company_name}</Typography>
              <Typography variant="subtitle2" align="right">ABN: {company?.abn}</Typography>
              <Typography variant="body1"><strong>Pay Slip For:</strong> {selectedPayroll.employee.name}</Typography>
              {/* <Typography variant="body1"><strong>Annual Salary:</strong> ${selectedPayroll.annualSalary.toFixed(2)}</Typography> */}
              <Typography variant="body1"><strong>Hourly Rate:</strong> {selectedPayroll.employee.salary ? (selectedPayroll.employee.salary / 38)?.toFixed(2) : 'no entry'}</Typography>
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
                       
                        <TableCell>${Number(selectedPayroll.gross_pay)?.toFixed(2) || "-"}</TableCell>
                        <TableCell>${Number(selectedPayroll.net_pay)?.toFixed(2) || "-"}</TableCell>
                        <TableCell>${Number(selectedPayroll.super)?.toFixed(2) || "-"}</TableCell>
                        <TableCell>${`${Number(selectedPayroll.tax)?.toFixed(2) || "-"}` }</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Ytd </TableCell>
                       
                        <TableCell>${Number(ytd.gross_total).toFixed(2) || "-"}</TableCell>
                        <TableCell>${Number(ytd.net_total).toFixed(2) || "-"}</TableCell>
                        <TableCell>${Number(ytd.super_total).toFixed(2) || "-"}</TableCell>
                        <TableCell>${Number(ytd.tax_total).toFixed(2) || "-" }</TableCell>
                      </TableRow>

                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" align="right">Gross Pay: ${Number(selectedPayroll.gross_pay).toFixed(2) || "-"}</Typography>
              <Typography variant="h6" align="right">Net Pay: ${Number(selectedPayroll.net_pay).toFixed(2) || "-"}</Typography>

              {/* Buttons (Hidden When Printing) */}
            <Box mt={2} display="flex" justifyContent="space-between" className="no-print">
              <Button variant="contained" color="secondary" onClick={handleClose}>Close</Button>
              <Button variant="contained" color="primary" onClick={handlePrint}>Print</Button>
            </Box>
            </div>
          )}
        </Box>
      </Modal>
      </>
      )}
    </Container>
  );
};

export default PayrollDashboard;