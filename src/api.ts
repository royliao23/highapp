// api.ts
import { useState } from 'react';
import { Categ, Contractor, Project, Job, Purchase } from './models'; // Adjust the import path as necessary
const API_BASE_URL = process.env.REACT_APP_API_NODE;
if (!API_BASE_URL) {
  throw new Error("REACT_APP_API_NODE is not defined in .env");
}

// Project
export const fetchProjects = async () => {
  const response = await fetch(`${API_BASE_URL}/high/projects`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching projects');
  const data = await response.json();
  return data.projects; // Assuming your Express API returns { sales: [...] }
};

export const createProject = async (projectData: Omit<Project, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(projectData)
  });
  if (!response.ok) throw new Error('Error creating project');
  return await response.json();
};

export const updateProject = async (code: number, projectData: Omit<Project, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/projects/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(projectData)
  });
  if (!response.ok) throw new Error('Error updating project');
  return await response.json();
};

export const deleteProject = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/projects/${code}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting project');
  return await response.json();
};

//Contractor

export const fetchContractors = async () => {
  const response = await fetch(`${API_BASE_URL}/high/contractor`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching contractors');
  const data = await response.json();
  return data; // Assuming your Express API returns { sales: [...] }
};

export const createContractor = async (contractorData: Omit<Contractor, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/contractor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(contractorData)
  });
  if (!response.ok) throw new Error('Error creating contractor');
  return await response.json();
};

export const updateContractor = async (code: number, contractorData: Omit<Contractor, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/contractor/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(contractorData)
  });
  if (!response.ok) throw new Error('Error updating contractor');
  return await response.json();
};

export const deleteContractor = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/contractor/${code}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting project');
  return await response.json();
};


//Category

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/high/categ`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching categories');
  const data = await response.json();
  return data; // Assuming your Express API returns { sales: [...] }
};

export const createCategory = async (categoryData: Omit<Categ, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/categ`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(categoryData)
  });
  if (!response.ok) throw new Error('Error creating category');
  return await response.json();
};

export const updateCategory = async (code: number, categoryData: Omit<Categ, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/categ/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(categoryData)
  });
  if (!response.ok) throw new Error('Error updating category');
  return await response.json();
};

export const deleteCategory = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/categ/${code}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting category');
  return await response.json();
};

// Job
export const fetchJobs = async () => {
  const response = await fetch(`${API_BASE_URL}/high/job`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching jobs');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createJob = async (jobData: Omit<Job, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/job`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(jobData)
  });
  if (!response.ok) throw new Error('Error creating job');
  return await response.json();
};  

export const updateJob = async (code: number, jobData: Omit<Job, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/job/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(jobData)
  });
  if (!response.ok) throw new Error('Error updating job');
  return await response.json();
};
export const deleteJob = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/job/${code}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting job');
  return await response.json();
}

// purchase_order
export const fetchPO = async () => {
  const response = await fetch(`${API_BASE_URL}/high/po`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching po');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};

export const fetchPoandInv = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/po/inv/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching po');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createPO = async (poData: Omit<any, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/po`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(poData)
  });
  if (!response.ok) throw new Error('Error creating po');
  return await response.json();
};  

export const updatePO = async (code: number, poData: Omit<any, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/po/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(poData)
  });
  if (!response.ok) throw new Error('Error updating job');
  return await response.json();
};
export const deletePO = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/po/${code}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting job');
  return await response.json();
}

// jobby
export const fetchInvoice = async () => {
  const response = await fetch(`${API_BASE_URL}/high/invoice`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching invoice');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};

export const fetchInNPay = async () => {
  const response = await fetch(`${API_BASE_URL}/high/invoice/invnpay`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching invoice');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createInvoice = async (poData: Omit<any, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(poData)
  });
  if (!response.ok) throw new Error('Error creating invoice');
  return await response.json();
};  

export const updateInvoice = async (code: number, poData: Omit<any, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/invoice/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(poData)
  });
  if (!response.ok) throw new Error('Error updating invoice');
  return await response.json();
};
export const updateInvoiceStatus = async (code: number, poData: any) => {
  const response = await fetch(`${API_BASE_URL}/high/invoice/status/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(poData)
  });
  if (!response.ok) throw new Error('Error updating invoice status');
  return await response.json();
};
export const deleteInvoice = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/invoice/${code}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting invoice');
  return await response.json();
}

// pay
export const fetchPay = async () => {
  const response = await fetch(`${API_BASE_URL}/high/pay`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching pay');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};

export const fetchPayNInv = async () => {
  const response = await fetch(`${API_BASE_URL}/high/pay/invnpay`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching pay and invoice');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createPay = async (payData: Omit<any, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(payData)
  });
  if (!response.ok) throw new Error('Error creating pay');
  return await response.json();
};  

export const updatePay = async (code: number, payData: Omit<any, "code">) => {
  const response = await fetch(`${API_BASE_URL}/high/pay/${code}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(payData)
  });
  if (!response.ok) throw new Error('Error updating pay');
  return await response.json();
};
export const deletePay = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/pay/${code}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting pay');
  return await response.json();
}

