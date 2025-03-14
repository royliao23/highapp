import { Purchase, Invoice, Pay, Job,Categ,Project } from '../models';// Assuming your Purchase interface is in types.ts
import { supabase } from '../supabaseClient';

export const getProjectsForLedger = async () => {
  // Fetch all projects
  const { data: projects, error: projectError } = await supabase
    .from('project')
    .select('*');

  if (projectError) throw projectError;

  for (const project of projects) {
    // Fetch categories for each project
    const { data: categories, error: categoryError } = await supabase
      .from('categ')
      .select('*');
    //   .eq('project_id', project.code); // get categories for the project by project_id and related invoices' job_id

    if (categoryError) throw categoryError;
    project.categories = categories;

    for (const category of categories) {
      // Fetch jobs for each category
      const { data: jobs, error: jobError } = await supabase
        .from('job')
        .select('*')
        .eq('job_category_id', category.code);
     
      if (jobError) throw jobError;
      category.jobs = jobs;
      for (const job of jobs) {
        // Fetch invoices for each job
        const { data: invoices, error: invoiceError } = await supabase
          .from('jobby')
          .select('*')
          .eq('job_id', job.code)
          .eq('project_id', project.code);

        if (invoiceError) throw invoiceError;
        job.details = invoices.map(invoice => ({
          id: invoice.code,
          description: invoice.ref,
          amount: invoice.cost,
        }));
      }
    }
  }

  

  return projects;
};

export const getForLedgerSingle = async (projectCode?: number) => {
  try {
    // Fetch all projects (or a specific project if projectCode is provided)
    let projectsQuery = supabase.from('project').select('*');
    if (projectCode) {
      projectsQuery = projectsQuery.eq('code', projectCode);
    }
    const { data: projects, error: projectError } = await projectsQuery;

    if (projectError) throw projectError;
    if (!projects || projects.length === 0) return [];

    // Fetch all categories
    const { data: categories, error: categoryError } = await supabase
      .from('categ')
      .select('*');

    if (categoryError) throw categoryError;

    // Fetch all jobs for the categories
    const categoryCodes = categories.map((cat) => cat.code);
    const { data: jobs, error: jobError } = await supabase
      .from('job')
      .select('*')
      .in('job_category_id', categoryCodes); // Fetch jobs for the relevant categories

    if (jobError) throw jobError;

    // Fetch all invoices for the jobs, filtered by project_id if provided
    const jobCodes = jobs.map((job) => job.code);
    let invoicesQuery = supabase
      .from('jobby')
      .select('*')
      .in('job_id', jobCodes);

    if (projectCode) {
      invoicesQuery = invoicesQuery.eq('project_id', projectCode); // Filter invoices by project_id
    }

    const { data: invoices, error: invoiceError } = await invoicesQuery;

    if (invoiceError) throw invoiceError;

    // Map the data into the nested structure
    const projectsWithData = projects.map((project) => {
      // Filter invoices for the current project
      const projectInvoices = invoices.filter(
        (invoice) => invoice.project_id === project.code
      );

      // Map categories and jobs
      const projectCategories = categories.map((category) => {
        // Filter jobs for the current category
        const categoryJobs = jobs
          .filter((job) => job.job_category_id === category.code)
          .map((job) => {
            // Filter invoices for the current job
            const jobInvoices = projectInvoices
              .filter((invoice) => invoice.job_id === job.code)
              .map((invoice) => ({
                id: invoice.code,
                description: invoice.ref,
                amount: invoice.cost,
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

      return {
        ...project,
        categories: projectCategories,
      };
    });

    return projectsWithData;
  } catch (error) {
    console.error('Error fetching ledger data:', error);
    throw error;
  }
};
