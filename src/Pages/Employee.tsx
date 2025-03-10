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
      .select("id, first_name, last_name, email, contact, department(*)");
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
    });
    setShowModal(false);
  };

  // Calculate modal width based on screen size
  const modalWidth = isSmallScreen ? "80%" : "375px"; // 20% narrower on small screens

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
            <select name="department"  onChange={handleInputChange} required>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.department_name}</option>
              ))}
            </select>
            <br></br>
            <br></br>
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