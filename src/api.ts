// api.ts
import { Categ, Contractor, Project } from './models'; // Adjust the import path as necessary
const API_BASE_URL = process.env.REACT_APP_API_NODE;
if (!API_BASE_URL) {
  throw new Error("REACT_APP_API_NODE is not defined in .env");
}
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
  return data.sales; // Assuming your Express API returns { sales: [...] }
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