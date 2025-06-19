import { useLocation, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { styled } from '@mui/material/styles';
import { Pay, Contractor } from '../models';
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

import { fetchJobDetails, fetchContractorDetails, fetchProjectDetails } from '../services/DetailService';
import { useEffect, useState } from 'react';

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
function PayView() {
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
        abn: "",
        gst_registered: false,
    });
  const location = useLocation();
  const { pay } = location.state as { pay: Pay };
  console.log("pay state received:", location.state);
  console.log("pay received:", pay);
  console.log("jobby:", pay.jobby);
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const dueDate = new Date(pay.jobby.due_at);
  const createDate = new Date(pay.create_at);
  const emailJsKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
  const emailJsServiceId = process.env.REACT_APP_SERVICE_ID;
  const emailJsTemplateId = process.env.REACT_APP_PTID;

if ( !emailJsKey || !emailJsServiceId || !emailJsTemplateId) {
  throw new Error("Missing environment variables. Check .env configuration.");
}

  const handleEmail = async () => {
    try {
      // Prepare email parameters
      const templateParams = {
        to_name: contractorDetails.contact_person,
        from_name: "Green Real Pty Ltd",
        company_name: contractorDetails.company_name,
        invoice_number: pay.code,
        amount: pay.amount.toFixed(2),
        gst: (pay.amount/11).toFixed(2),
        description: "Job:"+jobDetails.name+",  "+ jobDetails.description +". Your Ref:"+pay.jobby.ref +". Our ref:"+pay.code,
        project_name: projectDetails.project_name,
        to_email:"yunzhi.liao@me.com",//contractorDetails.email,
      };
  
      // Send email using EmailJS
      await emailjs.send(
        emailJsServiceId as string,      // EmailJS service ID
        emailJsTemplateId as string,    // EmailJS template ID
        templateParams,
        emailJsKey as string        
      );
  
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const fetchJobs = async () => {
    const jobData = await fetchJobDetails(pay.jobby.job_id);
    if (jobData) setJobDetails(jobData);
  };

  const fetchContractors = async () => {
    const contractorData = await fetchContractorDetails(pay.jobby.by_id.code ?? pay.jobby.by_id);
    if (contractorData) setContractorDetails(contractorData);
  };

  const fetchProjects = async () => {
    const projectData = await fetchProjectDetails(pay.jobby.project_id);
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
        Remittance Advice
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
                <Typography variant="body2">ABN:{ contractorDetails.abn}</Typography>
                <Typography variant="body2">GST Registered:{ contractorDetails.gst_registered?"Yes":"No"}</Typography>
                <Typography variant="body2">Address:{ contractorDetails.address}</Typography>
                <Typography variant="body2">Contact:{ contractorDetails.contact_person}</Typography>
                <Typography variant="body2">Phone: { contractorDetails.phone_number}</Typography>
            </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body1">Pay #: {pay.code}</Typography>
            <Typography variant="body1">For Invoice #: {pay.jobby.code}</Typography>
            <Typography variant="body1">Pay Date: {createDate.toLocaleDateString()}</Typography>
            <Typography variant="body1">Due Date: {dueDate ? new Date(dueDate).toLocaleDateString() : ''}</Typography>
            <Typography variant="body1">Invoiced Amount: ${pay.jobby.cost || 0}</Typography>
            <Typography variant="body1">Pay Amount: ${pay.amount || 0}</Typography>
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
                <TableCell>Job:{jobDetails.name}, {jobDetails.description}, Ref:{pay.jobby.ref}</TableCell>
                <TableCell align="right">{pay.jobby.cost || 0}</TableCell>
                <TableCell align="right">1</TableCell>
                <TableCell align="right">{pay.jobby.cost || 0}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={4} textAlign="right">
          <Typography variant="body1">GST: ${contractorDetails.gst_registered?(pay.amount/11).toFixed(2):0}</Typography>
          <Typography variant="body1">
            Together with GST: ${pay.amount || 0}
          </Typography>
          <Typography variant="body1">Amount Paid: ${pay.amount || 0}</Typography>
          {/* <Typography variant="body1" fontWeight="bold">
            Balance Due: ${(invoice.cost).toFixed(2)}
          </Typography> */}
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


export default PayView;