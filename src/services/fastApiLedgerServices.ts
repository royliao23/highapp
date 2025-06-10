import { Purchase, Invoice, Pay, Job,Categ,Project, InvoiceFilter } from '../models';// Assuming your Purchase interface is in types.ts
import { authFetch } from '../authFetch'; // Assuming you have a utility for authenticated fetch
import { fetchProjects, fetchCategories } from '../api';
import { fetchProjectDetails } from './DetailService'; // Assuming you have a service to fetch project details
// import { supabase } from '../supabaseClient'; // Assuming you have a Supabase client set up
const API_BASE_URL = process.env.REACT_APP_API_NODE || 'http://localhost:8000'; // Set your API base URL here

export const getAllProjectCodes = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/projects/pjcodeandname`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching projects code and name');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
}


const fetchJobByCategoryList = async (categoryCodes: number[]) => {
  const response = await authFetch(`${API_BASE_URL}/high/job/jobs-by-category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(categoryCodes) // Now clearly sending an array of numbers
  });
  if (!response.ok) throw new Error('Error fetching jobs by category');
  return await response.json();
};

const fetchInvoicesByJobList = async (invoiceFilter: InvoiceFilter) => {
  const response = await authFetch(`${API_BASE_URL}/high/invoice/invoices-by-jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(invoiceFilter)
  });
  if (!response.ok) throw new Error('Error fetching jobs by category');
  return await response.json();
};

export const getForLedgerSingleold = async (projectCode?: number) => {
  try {
    // Fetch all projects (or a specific project if projectCode is provided)
    
    if (projectCode) {
        let projectsQuery = fetchProjectDetails(projectCode);
        const { data: projects, error: projectError } = await projectsQuery;

        if (projectError) throw projectError;
        
    }

    else return [];

    // Fetch all categories
    const categoryData = await fetchCategories();
    if (!categoryData || categoryData.length === 0) return [];
    console.log('Categories:', categoryData);
    if (!categoryData || categoryData.length === 0) return [];
    // Fetch all jobs for the categories
    
    const categoryCodes = categoryData.map((cat:Categ) => cat.code);
    const jobData = await fetchJobByCategoryList(categoryCodes);
    // Extract only job codes (integers)
    const jobCodes = jobData.map((job:any) => job.code);
    if (!jobCodes || jobCodes.length === 0) return [];
    const invoicesData = await fetchInvoicesByJobList({  job_codes: jobCodes, project_code: projectCode });
    return {
              ...jobData,
              details: invoicesData,
            };
    
    } catch (error) {
    console.error('Error fetching project details:', error);
    return [];
    }
}

export const getForLedgerSingle = async (projectCode?: number) => {
  try {
    if (!projectCode) return [];

    // 1. Fetch project
    const projdata: any = await fetchProjectDetails(projectCode);
    if (!projdata || projdata.length === 0) return [];
    if (projdata.error) {
      console.error('Error fetching project details:', projdata.error);
      return [];
    }
    console.log('Selected Project:', projdata);
    // 2. Fetch categories
    const categoryData = await fetchCategories();
    console.log('Categories:', categoryData);
    if (!categoryData || categoryData.length === 0) return [];

    // 3. Fetch jobs
    const categoryCodes = categoryData.map((cat: Categ) => cat.code);
    const jobData = await fetchJobByCategoryList(categoryCodes);
    console.log('Jobs:', jobData);
    if (!jobData || jobData.length === 0) return [];

    const jobCodes = jobData.map((job: any) => job.code);

    // 4. Fetch invoices
    const invoicesData = await fetchInvoicesByJobList({
      job_codes: jobCodes,
      project_code: projectCode,
    });

    // 5. Build nested structure
    const projectCategories = categoryData.map((category:any) => {
      const categoryJobs = jobData
        .filter((job: any) => job.job_category_id === category.code)
        .map((job: any) => {
          const jobInvoices = invoicesData
            .filter((inv: any) => inv.job_id === job.code)
            .map((inv: any) => ({
              id: inv.code,
              description: inv.ref,
              amount: inv.cost,
            }));

          return {
            ...job,
            details: jobInvoices,
          };
        });

      return {
        ...category,
        jobs: categoryJobs,
      };
    });

    return [
      {
        ...projdata[0], // Assuming projdata is an array with a single project
        jobs: jobData,
        categories: projectCategories,
      },
    ];
  } catch (error) {
    console.error('Error fetching ledger data:', error);
    return [];
  }
};

