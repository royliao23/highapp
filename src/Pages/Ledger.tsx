import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAllProjectCodes, getForLedgerSingle } from '../services/fastApiLedgerServices';
// Define types based on the provided models
export interface InvoiceLedger {
  id: number;
  amount: number;
  description: string;
}

interface Categ {
  code: number;
  name: string;
  jobs?: Job[]; // Add jobs to the Categ interface
}

export interface Project {
  code: number;
  project_name: string;
  manager: string;
  description: string;
  status: string;
  categories?: Categ[]; 
}

export interface Job {
  code: number;
  job_category_id: number;
  name: string;
  description: string;
  details?: InvoiceLedger[]; 
}

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #007bff;
  color: white;
  padding: 0.8rem;
  text-align: left;
`;

const Td = styled.td`
  padding: 0.8rem;
  border: 1px solid #ddd;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
`;

const LedgerCategory = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<{ [key: number]: boolean }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [expandedJobs, setExpandedJobs] = useState<{ [key: string]: boolean }>({});
  const [projectDetails, setProjectDetails] = useState<{ [key: number]: Project }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all project codes on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectCodes = await getAllProjectCodes();
        setProjects(projectCodes);
      } catch (error) {
        console.error('Error fetching project codes:', error);
        setError('Failed to fetch project codes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch details for a specific project when expanded
  const fetchProjectDetails = async (projectCode: number) => {
    try {
      const details = await getForLedgerSingle(projectCode);
      console.log('Project details:', details);
      setProjectDetails((prev) => ({
        ...prev,
        [projectCode]: details[0], 
      }));
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to fetch project details. Please try again later.');
    }
  };

  // Toggle expanded state for projects
  const toggleProject = (projectCode: number) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectCode]: !prev[projectCode],
    }));

    if (!projectDetails[projectCode]) {
      fetchProjectDetails(projectCode);
    }
  };

  // Toggle expanded state for categories
  const toggleCategory = (projectCode: number, categoryCode: number) => {
    const key = `${projectCode}-${categoryCode}`;
    setExpandedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle expanded state for jobs
  const toggleJob = (projectCode: number, categoryCode: number, jobCode: number) => {
    const key = `${projectCode}-${categoryCode}-${jobCode}`;
    setExpandedJobs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Function to calculate the total for a job
  const calculateJobTotal = (job: Job) => {
    return job.details?.reduce((total, invoice) => total + invoice.amount, 0) || 0;
  };

  // Function to calculate the total for a category
  const calculateCategoryTotal = (category: Categ) => {
    return category.jobs?.reduce((total, job) => total + calculateJobTotal(job), 0) || 0;
  };

  // Function to calculate the total for a project
  const calculateProjectTotal = (project: Project) => {
    return project.categories?.reduce((total, category) => total + calculateCategoryTotal(category), 0) || 0;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <Th>Projects</Th>
            <Th>Total</Th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => {
            const projectTotal = calculateProjectTotal(projectDetails[proj.code] || { categories: [] });

            return (
              <React.Fragment key={proj.code}>
                <tr>
                  <Td>
                    <ExpandButton
                      onClick={() => toggleProject(proj.code)}
                      aria-expanded={expandedProjects[proj.code] || false}
                    >
                      {expandedProjects[proj.code] ? '-' : '+'}
                    </ExpandButton>
                    {proj.project_name}
                  </Td>
                  <Td>${Number(Number(projectTotal)).toFixed(2)}</Td>
                </tr>
                {expandedProjects[proj.code] && projectDetails[proj.code] && (
                  <>
                    {projectDetails[proj.code].categories
                      ?.filter((cat) => calculateCategoryTotal(cat) > 0) // Skip categories with total 0
                      .map((cat) => {
                        const categoryTotal = calculateCategoryTotal(cat);

                        return (
                          <React.Fragment key={`${proj.code}-${cat.code}`}>
                            <tr>
                              <Td style={{ paddingLeft: '2rem' }}>
                                <ExpandButton
                                  onClick={() => toggleCategory(proj.code, cat.code)}
                                  aria-expanded={expandedCategories[`${proj.code}-${cat.code}`] || false}
                                >
                                  {expandedCategories[`${proj.code}-${cat.code}`] ? '-' : '+'}
                                </ExpandButton>
                                {cat.name}
                              </Td>
                              <Td>${Number(categoryTotal).toFixed(2)}</Td>
                            </tr>
                            {expandedCategories[`${proj.code}-${cat.code}`] && (
                              <>
                                {cat.jobs
                                  ?.filter((job) => calculateJobTotal(job) > 0) // Skip jobs with total 0
                                  .map((job) => {
                                    const jobTotal = calculateJobTotal(job);

                                    return (
                                      <React.Fragment key={`${proj.code}-${cat.code}-${job.code}`}>
                                        <tr>
                                          <Td style={{ paddingLeft: '4rem' }}>
                                            <ExpandButton
                                              onClick={() => toggleJob(proj.code, cat.code, job.code)}
                                              aria-expanded={expandedJobs[`${proj.code}-${cat.code}-${job.code}`] || false}
                                            >
                                              {expandedJobs[`${proj.code}-${cat.code}-${job.code}`] ? '-' : '+'}
                                            </ExpandButton>
                                            {job.name}
                                          </Td>
                                          <Td>${Number(jobTotal).toFixed(2)}</Td>
                                        </tr>
                                        {expandedJobs[`${proj.code}-${cat.code}-${job.code}`] && (
                                          <>
                                            {job.details?.map((invoice) => (
                                              <tr key={`${proj.code}-${cat.code}-${job.code}-${invoice.id}`} style={{ color: 'blue' }}>
                                                <Td style={{ paddingLeft: '6rem' }}>Supplier Reference: {invoice.description}</Td>
                                                <Td>inv#:{invoice.id}: ${Number(invoice.amount).toFixed(2)}</Td>
                                              </tr>
                                            ))}
                                          </>
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                              </>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default LedgerCategory;