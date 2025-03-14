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
      .select('*')
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
