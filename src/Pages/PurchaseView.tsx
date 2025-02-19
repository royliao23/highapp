import { useLocation, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { styled } from '@mui/material/styles';
import {
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
interface InvoiceShort { code: number;ref?:string;cost?:number;}
interface Purchase {
  code: number;
  job_id: number;
  by_id: number;
  project_id: number;
  cost: number;
  ref: string;
  contact: string;
  create_at: Date;
  updated_at: Date;
  due_at: Date
  invoice?:InvoiceShort[]
}
export interface Option {
  value: string;
  label: string;
}
const PrintHideBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: '16px', // Or your preferred gap value
  marginTop: '64px', // Or your preferred margin-top value
  '@media print': {
    display: 'none',
  },
}));
function PurchaseView() {
  const location = useLocation();
  const { purchase } = location.state as { purchase: Purchase };
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const dueDate = new Date(purchase.due_at);
  const createDate = new Date(purchase.create_at);
  const handleEmail = () => {
    // ... (Your email logic)
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f0f0f0' }}> {/* Main container */}
      <Paper elevation={3} sx={{ p: 8, bgcolor: 'white' }}> {/* Invoice container */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              PURCHASE INVOICE
            </Typography>
            <Typography variant="body2">Green Real Pty Ltd</Typography>
            <Typography variant="body2">ABN: 344 555 3445</Typography>
            <Typography variant="body2">level 3 109 Gladstone St</Typography>
            <Typography variant="body2">Kogarah NSW 2217</Typography>
            <Typography variant="body2">Phone: (02) 9555-5588</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body1">Invoice #: {purchase.code}</Typography>
            <Typography variant="body1">Create Date: {createDate.toLocaleDateString()}</Typography> {/* Handle potential undefined */}
            <Typography variant="body1">Due Date: {dueDate ? new Date(dueDate).toLocaleDateString() : ''}</Typography> {/* Handle potential undefined */}
            <Typography variant="body1">Amount Due: ${purchase.cost}</Typography>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Unit Cost (Including GST)</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Map over your purchase items here */}
              <TableRow>
                <TableCell>{purchase.project_id}</TableCell>
                <TableCell>{purchase.ref}</TableCell>
                <TableCell align="right">{purchase.cost}</TableCell>
                <TableCell align="right">1</TableCell>
                <TableCell align="right">{purchase.cost}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={4} textAlign="right">
          <Typography variant="body1">GST: $1,000.00</Typography>
          <Typography variant="body1">
            Together with GST-10.00%: ${purchase.cost}
          </Typography>
          <Typography variant="body1">Amount Paid: $0.00</Typography>
          <Typography variant="body1" fontWeight="bold">
            Balance Due: ${purchase.cost}
          </Typography>
        </Box>

        <Box mt={8} borderTop={1} borderColor="gray" pt={4} textAlign="center">
          <Typography variant="body1">TERMS</Typography>
          <Typography variant="body1">Please Assure the Highest Quality!</Typography>
        </Box>

        <PrintHideBox>
          <Button variant="contained" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="contained" onClick={handleEmail}>
            Email
          </Button>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Back
          </Button>
        </PrintHideBox>
      </Paper>
    </Box>
  );
}


export default PurchaseView;