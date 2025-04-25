import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  Button,
  TextField,
  Modal,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper, TablePagination, 
} from "@mui/material";
import { supabase } from "../supabaseClient";

interface Employee {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  contact: string;
  department: number | null;
  salary: number | null;
  position: string | null;
  bsb: string | null;
  account_no: string | null;
  account_name: string | null;
  bank_name: string | null;
  address: string | null;
  super_rate: number | null,
  employment_type: string | null,
  role: string | null,
  super_company_name: string | null,
  super_fund_abn: string | null,
  super_usi: string | null,
  super_account_name: string | null,
  super_member_no: string | null
}

interface Department {
  id: number;
  department_name: string;
}

interface EmployeeFormData {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  contact: string | null;
  department: { id: number } | number | null;
  salary: number | null;
  position: string | null;
  bsb: string | null;
  account_no: string | null;
  account_name: string | null;
  bank_name: string | null;
  address: string | null;
  super_rate: number | null,
  employment_type: string | null,
  role: string | null,
  super_company_name?: string | null,
  super_fund_abn?: string | null,
  super_usi?: string | null,
  super_account_name?: string | null,
  super_member_no?: string | null
}

const EmployeeComponent = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: "",
    last_name: "",
    email: "",
    contact: null,
    department: null,
    salary: null,
    position: null,
    bsb: null,
    account_no: null,
    account_name: null,
    bank_name: null,
    address: null,
    super_rate: null,
    employment_type: null,
    role: null,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  // Check if the screen width is less than 1000px
  const isSmallScreen = useMediaQuery("(max-width:1450px)");

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employee")
      .select("*, department(*)");
    if (error) console.error("Error fetching employees:", error);
    else
      setEmployees(
        (data || []).map((employee: any) => ({
          ...employee,
          department: employee.department?.id,
        }))
      );
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase.from("department").select("*");
    if (error) console.error("Error fetching departments:", error);
    else setDepartments(data || []);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name as string]: name === "department" ? { id: Number(value) } : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`,
        department:
          formData.department && typeof formData.department === "object"
            ? formData.department.id
            : formData.department,
      };

      if (editingId !== null) {
        await supabase.from("employee").update(payload).eq("id", editingId);
      } else {
        await supabase.from("employee").insert([payload]);
      }

      fetchEmployees();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleEdit = (employee: any) => {
    setEditingId(employee.id);
    setFormData(employee);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    await supabase.from("employee").delete().eq("id", id);
    fetchEmployees();
  };

  const handleCloseModal = () => {
    setEditingId(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      contact: null,
      department: null,
      salary: null,
      position: null,
      bsb: null,
      account_no: null,
      account_name: null,
      bank_name: null,
      address: null,
      super_rate: null,
      employment_type: null,
      role: null,
    });
    setShowModal(false);
  };

  // Calculate modal width based on screen size
  const modalWidth = isSmallScreen ? "350px" : "950px"; // 20% narrower on small screens

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: any) => {
    setPage(0)
    setSearch(event.target.value);
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Paper>



      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" sx={{ my: 3, color: 'primary.main' }}>
          Employee Management
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 2, gap: 2 }}>
          <TextField
            label="Search Employee Name"
            variant="outlined"
            margin="normal"
            onChange={handleSearch}
          />
          <Button variant="contained" onClick={() => setShowModal(true)}>Add Employee</Button>
        </Box>


        <Modal open={showModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: modalWidth, // Responsive width
              maxHeight: "90vh", // Limit height to 90% of the viewport height
              overflowY: "auto", // Enable vertical scrolling
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editingId ? "Edit Employee" : "Add Employee"}
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Mobile Number"
                name="contact"
                value={formData.contact || ""}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                value={formData.salary || ""}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={formData.position || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="bsb"
                name="bsb"
                value={formData.bsb || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Account Number"
                name="account_no"
                value={formData.account_no || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Account Name"
                name="account_name"
                value={formData.account_name || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Bank Name"
                name="bank_name"
                value={formData.bank_name || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Super Rate"
                name="super_rate"
                value={formData.super_rate || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Employment Type"
                name="employment_type"
                value={formData.employment_type || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={formData.role || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />

              <Typography variant="body1" sx={{ mb: 1 }}>
                Department
              </Typography>
              <Box sx={{ mb: 2 }}>
                <select
                  name="department"
                  value={formData.department ? (typeof formData.department === "object" ? formData.department.id : formData.department) : ""}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "1rem",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>

              </Box>
              <TextField
                fullWidth
                label="Super Company Name"
                name="super_company_name"
                value={formData.super_company_name || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Super Account Name"
                name="super_account_name"
                value={formData.super_account_name || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Super USI"
                name="super_usi"
                value={formData.super_usi || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Super Fund ABN"
                name="super_fund_abn"
                value={formData.super_fund_abn || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Super Member No"
                name="super_member_no"
                value={formData.super_member_no || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              
              <Button type="submit" variant="contained" sx={{ mr: 2 }}>
                {editingId ? "Update" : "Add"}
              </Button>
              <Button type="button" onClick={handleCloseModal}>
                Cancel
              </Button>
            </form>
          </Box>
        </Modal>

        {isSmallScreen ? (
          // List View for Small Screens
          <List sx={{ mt: 3 }}>
            {filteredEmployees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((employee) => (
                <Box key={employee.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${employee.first_name} ${employee.last_name}`}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Email: {employee.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Contact: {employee.contact}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Department:{" "}
                            {employee.department
                              ? departments.find((d) => d.id === employee.department)
                                ?.department_name || "N/A"
                              : "N/A"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Salary: {employee.salary}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Position: {employee.position}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            bsb: {employee.bsb}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Account Number: {employee.account_no}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Account Name: {employee.account_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Bank Name: {employee.bank_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Address: {employee.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Super: {employee.super_rate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Employment Type: {employee.employment_type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Role: {employee.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Super Company Name: {employee.super_company_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Super Account Name: {employee.super_account_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Super USI: {employee.super_usi}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Super Fund ABN: {employee.super_fund_abn}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Super Member No: {employee.super_member_no}
                          </Typography>                     
                        </>
                      }
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(employee)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(employee.id)}
                    >
                      Delete
                    </Button>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
          </List>
        ) : (
          // Table View for Larger Screens
          <Table sx={{ mt: 3, width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>BSB</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Bank Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Super</TableCell>
                <TableCell>Employment Type</TableCell>
                <TableCell>Super Company</TableCell>
                <TableCell>Super Account Name</TableCell>
                <TableCell>Super USI</TableCell>
                <TableCell>Super Fund ABN</TableCell>
                <TableCell>Super Member No</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      {employee.first_name} {employee.last_name}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.contact}</TableCell>
                    <TableCell>
                      {employee.department
                        ? departments.find((d) => d.id === employee.department)
                          ?.department_name || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell>{employee.salary}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.bsb}</TableCell>
                    <TableCell>{employee.account_no}</TableCell>
                    <TableCell>{employee.account_name}</TableCell>
                    <TableCell>{employee.bank_name}</TableCell>
                    <TableCell>{employee.address}</TableCell>
                    <TableCell>{employee.super_rate}</TableCell >
                    <TableCell>{employee.employment_type}</TableCell >
                    <TableCell>{employee.role}</TableCell >
                    <TableCell>{employee.super_company_name}</TableCell>
                    <TableCell>{employee.super_account_name}</TableCell >
                    <TableCell>{employee.super_usi}</TableCell >
                    <TableCell>{employee.super_fund_abn}</TableCell >
                    <TableCell>{employee.super_member_no}</TableCell >
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEdit(employee)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(employee.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </Box>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredEmployees.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default EmployeeComponent;