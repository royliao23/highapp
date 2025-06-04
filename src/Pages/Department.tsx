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
    Paper, TablePagination, TableContainer
} from "@mui/material";
// import { supabase } from "../supabaseClient";
import { createDepartment, updateDepartment, fetchDepartment, deleteDepartment } from "../api";
import { da } from "date-fns/locale";
interface Department {
    id: number;
    department_name: string;
    description?: string;
    manager?: string;
}

interface DeptFormData {
    id?: number;
    department_name: string;
    description?: string;
    manager?: string;
}


const DepartmentComponent = () => {
    //   const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formData, setFormData] = useState<DeptFormData>({
        department_name: "",
        description: "",
        manager: "",
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [search, setSearch] = useState("");

    // Check if the screen width is less than 1000px
    const isSmallScreen = useMediaQuery("(max-width:1450px)");

    useEffect(() => {
        fetchDepartments();
    }, []);


    const fetchDepartments = async () => {
        const data = await fetchDepartment();

        if (data.error) {
            console.error("Error fetching departments:", data.error);
        } else {
            setDepartments(data || []);
        }
    };



    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {


            if (editingId !== null) {
                await updateDepartment(editingId, formData);
            } else {
                await createDepartment(formData);
            }
            fetchDepartments();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving employee:", error);
        }
    };

    const handleEdit = (dept: any) => {
        setEditingId(dept.id);
        setFormData(dept);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        await deleteDepartment(id);
        setDepartments(departments.filter((dept) => dept.id !== id));
        fetchDepartments();
    };

    const handleCloseModal = () => {
        setEditingId(null);
        setFormData({
            department_name: "",
            description: "",
            manager: "",
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

    const filteredDepartments = departments.filter((dept) =>
        dept.department_name.toLowerCase().includes(search.toLowerCase())
    );
    return (
        <Paper>

            <Box sx={{ padding: 3 }}>
                <Typography variant="h4" sx={{ my: 3, color: 'primary.main' }}>
                    Department Management
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 2, gap: 2 }}>
                    <TextField
                        label="Search Department"
                        variant="outlined"
                        margin="normal"
                        onChange={handleSearch}
                    />
                    <Button variant="contained" onClick={() => setShowModal(true)}>Add Department</Button>
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
                            {editingId ? "Edit Department" : "Add Department"}
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Department Name"
                                name="department_name"
                                value={formData.department_name || ""}
                                onChange={handleInputChange}
                                required
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description || ""}
                                onChange={handleInputChange}
                                required
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Manager"
                                name="manager"
                                value={formData.manager || ""}
                                onChange={handleInputChange}
                                required
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


                <Table sx={{ mt: 3, width: "100%" }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Manager</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDepartments
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((department) => (
                                <TableRow key={department.id}>
                                    <TableCell>
                                        {department.department_name}
                                    </TableCell>
                                    <TableCell>{department.description}</TableCell>
                                    <TableCell>{department.manager}</TableCell>


                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleEdit(department)}
                                            sx={{ mr: 1 }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDelete(department.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>

            </Box>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredDepartments.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default DepartmentComponent;