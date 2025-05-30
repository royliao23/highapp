import { useLocation, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { styled } from '@mui/material/styles';
import {
  Typography,
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

import { useEffect, useState } from 'react';

import { fetchJobDetails, fetchContractorDetails, fetchProjectDetails } from '../services/SupaEndPoints';


const emailJsKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const emailJsServiceId = process.env.REACT_APP_SERVICE_ID;
const emailJsTemplateId = process.env.REACT_APP_OTID;

if ( !emailJsKey || !emailJsServiceId || !emailJsTemplateId) {
  throw new Error("Missing environment variables. Check .env configuration.");
}




interface InvoiceShort { code: number; ref?: string; cost?: number; }
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
  invoice?: InvoiceShort[]
}
export interface Option {
  value: string;
  label: string;
}

interface Project {
  code: number;
  project_name: string;
  manager: string;
  description: string;
  status: string;
}

interface Job {
  code: number;
  job_category_id: number;
  name: string;
  description: string;
}

interface Contractor {
  code: number;
  contact_person: string;
  company_name: string;
  phone_number: string;
  email: string;
  bsb: string;
  account_no: string;
  account_name: string;
  address: string;
}
const PrintHideBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: '16px', 
  marginTop: '64px', 
  '@media print': {
    display: 'none',
  },
}));
function PurchaseView() {
  const [jobDetails, setJobDetails] = useState<Job>({
    code: 0,
    job_category_id: 0,
    name: "",
    description: "",
  });

  const [projectDetails, setProjectDetails] = useState<Project>({
    code: 0,
    project_name: "",
    manager: "",
    description: "",
    status: "",
  });

  const [contractorDetails, setContractorDetails] = useState<Contractor>({
    code: 0,
    contact_person: "",
    company_name: "",
    phone_number: "",
    email: "",
    bsb: "",
    account_no: "",
    account_name: "",
    address: "",
  });
  
  const location = useLocation();
  const { purchase } = location.state as { purchase: Purchase };
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const dueDate = new Date(purchase.due_at);
  const createDate = new Date(purchase.create_at);
  const handleEmail = async () => {
    try {
      // Prepare email parameters
      const templateParams = {
        to_name: contractorDetails.contact_person,
        from_name: "Green Real Pty Ltd",
        company_name: contractorDetails.company_name,
        invoice_number: purchase.code,
        amount: purchase.cost.toFixed(2),
        gst: (purchase.cost/11).toFixed(2),
        description: "Job:"+jobDetails.name+",  "+ jobDetails.description,
        project_name: projectDetails.project_name,
        to_email:"yunzhi.liao@me.com",//contractorDetails.email,
      };
  
      // Send email using EmailJS
      await emailjs.send(
        emailJsServiceId as string,      // EmailJS service ID
        emailJsTemplateId as string,    // EmailJS template ID
        templateParams,
        emailJsKey as string            // EmailJS user ID
      );
  
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const fetchJobs = async () => {
    const jobData = await fetchJobDetails(purchase.job_id);
    if (jobData) setJobDetails(jobData);
  };

  const fetchContractors = async () => {
    const contractorData = await fetchContractorDetails(purchase.by_id);
    if (contractorData) setContractorDetails(contractorData);
  };

  const fetchProjects = async () => {
    const projectData = await fetchProjectDetails(purchase.project_id);
    if (projectData) setProjectDetails(projectData);
  };
  useEffect(() => {
    fetchJobs();
    fetchContractors();
    fetchProjects();
    }, []);

  return (
    <Box sx={{ p: 4, bgcolor: '#f0f0f0' }}> {/* Main container */}
      <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        PURCHASE ORDER
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 ,gap: '16px',}}>
            <Typography variant="body2">Green Real Pty Ltd</Typography>
            <Typography variant="body2">ABN: 344 555 3445</Typography>
            <Typography variant="body2">Level 3 109 Gladstone St</Typography>
            <Typography variant="body2">Kogarah NSW 2217</Typography>
            <Typography variant="body2">Phone: (02) 9555-5588</Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 8, bgcolor: 'white' }}> {/* Invoice container */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="body2">{ contractorDetails.company_name}</Typography>
            <Typography variant="body2">Account:{ contractorDetails.account_no}</Typography>
            <Typography variant="body2">{ contractorDetails.address}</Typography>
            <Typography variant="body2">Contact:{ contractorDetails.contact_person}</Typography>
            <Typography variant="body2">Phone: { contractorDetails.phone_number}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body1">Purchase #: {purchase.code}</Typography>
            <Typography variant="body1">Create Date: {createDate.toLocaleDateString()}</Typography> {/* Handle potential undefined */}
            <Typography variant="body1">Order Expiry Date: {dueDate ? new Date(dueDate).toLocaleDateString() : ''}</Typography> {/* Handle potential undefined */}
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
                <TableCell>{projectDetails.project_name}</TableCell>
                <TableCell>Job:{jobDetails.name}, {jobDetails.description}, Ref:{purchase.ref}</TableCell>
                <TableCell align="right">{(purchase.cost).toFixed(2)}</TableCell>
                <TableCell align="right">1</TableCell>
                <TableCell align="right">{(purchase.cost).toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={4} textAlign="right">
          <Typography variant="body1">GST: ${(purchase.cost/11).toFixed(2)}</Typography>
          <Typography variant="body1" fontWeight="bold">
            Together with GST: ${(purchase.cost).toFixed(2)}
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