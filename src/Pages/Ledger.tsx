import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getProjectsForLedger } from '../services/LedgerServices';

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
  categories?: Categ[]; // Assuming categories are part of the Project
}

export interface Job {
  code: number;
  job_category_id: number;
  name: string;
  description: string;
  details?: InvoiceLedger[]; // Assuming invoices are part of the Job
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [expandedJobs, setExpandedJobs] = useState<{ [key: string]: boolean }>({});
  const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await getProjectsForLedger();
        console.log('Data for ledger:', projectsData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleExpand = (
    id: string,
    setState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    state: Record<string, boolean>
  ) => {
    setState(prevState => ({ ...prevState, [id]: !prevState[id] }));
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
            const projectTotal = calculateProjectTotal(proj);
            if (projectTotal === 0) return null; // Skip projects with a total of 0

            return (
              <React.Fragment key={proj.code}>
                <tr>
                  <Td>
                    <ExpandButton
                      onClick={() => toggleExpand(proj.code.toString(), setExpandedProjects, expandedProjects)}
                      aria-expanded={expandedProjects[proj.code] || false}
                    >
                      {expandedProjects[proj.code] ? '-' : '+'}
                    </ExpandButton>
                    {proj.project_name}
                  </Td>
                  <Td>${projectTotal.toFixed(2)}</Td>
                </tr>
                {expandedProjects[proj.code] &&
                  proj.categories
                    ?.filter((cat) => calculateCategoryTotal(cat) > 0) // Filter out categories with a total of 0
                    .map((cat) => {
                      const categoryTotal = calculateCategoryTotal(cat);
                      return (
                        <React.Fragment key={`${proj.code}-${cat.code}`}>
                          <tr>
                            <Td style={{ paddingLeft: '2rem' }}>
                              <ExpandButton
                                onClick={() => toggleExpand(`${proj.code}-${cat.code}`, setExpandedCategories, expandedCategories)}
                                aria-expanded={expandedCategories[`${proj.code}-${cat.code}`] || false}
                              >
                                {expandedCategories[`${proj.code}-${cat.code}`] ? '-' : '+'}
                              </ExpandButton>
                              {cat.name}
                            </Td>
                            <Td>${categoryTotal.toFixed(2)}</Td>
                          </tr>
                          {expandedCategories[`${proj.code}-${cat.code}`] &&
                            cat.jobs
                              ?.filter((job) => calculateJobTotal(job) > 0) // Filter out jobs with a total of 0
                              .map((job) => {
                                const jobTotal = calculateJobTotal(job);
                                return (
                                  <React.Fragment key={`${proj.code}-${cat.code}-${job.code}`}>
                                    <tr>
                                      <Td style={{ paddingLeft: '4rem' }}>
                                        <ExpandButton
                                          onClick={() => toggleExpand(`${proj.code}-${cat.code}-${job.code}`, setExpandedJobs, expandedJobs)}
                                          aria-expanded={expandedJobs[`${proj.code}-${cat.code}-${job.code}`] || false}
                                        >
                                          {expandedJobs[`${proj.code}-${cat.code}-${job.code}`] ? '-' : '+'}
                                        </ExpandButton>
                                        {job.name}
                                      </Td>
                                      <Td>${jobTotal.toFixed(2)}</Td>
                                    </tr>
                                    {expandedJobs[`${proj.code}-${cat.code}-${job.code}`] &&
                                      job.details?.map((invoice: InvoiceLedger) => (
                                        <tr key={`${proj.code}-${cat.code}-${job.code}-${invoice.id}`} style={{ color: 'blue' }}>
                                          <Td style={{ paddingLeft: '6rem' }}>Supplier Reference: {invoice.description}</Td>
                                          <Td>${invoice.amount.toFixed(2)}</Td>
                                        </tr>
                                      ))}
                                  </React.Fragment>
                                );
                              })}
                        </React.Fragment>
                      );
                    })}
              </React.Fragment>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};

export default LedgerCategory;