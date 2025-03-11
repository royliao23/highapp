import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
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
    address: null
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Check if the screen width is less than 1000px
  const isSmallScreen = useMediaQuery("(max-width:1000px)");

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
      address: null
    });
    setShowModal(false);
  };

  // Calculate modal width based on screen size
  const modalWidth = isSmallScreen ? "350px" : "950px"; // 20% narrower on small screens

  return (
    <Box sx={{ padding: 3 }}>
      <Button variant="contained" onClick={() => setShowModal(true)}>
        Add Employee
      </Button>

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

            {/* <select name="department" onChange={handleInputChange} required>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.department_name}</option>
              ))}
            </select>
            <br></br>
            <br></br> */}
            <Box sx={{ mb: 2 }}>
        <select
          name="department"
          value={
            formData.department
              ? (formData.department as { id: number }).id
              : ""
          }
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
          {employees.map((employee) => (
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
              <TableCell>bsb</TableCell>
              <TableCell>Account Number</TableCell>
              <TableCell>Account Name</TableCell>
              <TableCell>Bank Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
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
  );
};

export default EmployeeComponent;