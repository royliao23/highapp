// api.ts
import { useState } from 'react';
import authAxios from './authAxios';
import { authFetch } from './authFetch';
import { Categ, Contractor, Project, Job, Purchase } from './models'; // Adjust the import path as necessary
//import { getValidAccessToken } from './authService';
// import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_NODE;
if (!API_BASE_URL) {
  throw new Error("REACT_APP_API_NODE is not defined in .env");
}
const deleteResponse = async(acton: string, response:any) =>{ 
  try {
    return await response.json(); // Only try to parse as JSON if content is expected
  } catch (error) {
    // If there's an error parsing JSON, but the response was 'ok',
    // it likely means the server returned a non-JSON but successful response.
    console.warn("Received non-JSON response for successful delete, returning success message.", error);
    return { message: acton + ' deleted successfully (non-JSON response)' };
  }
};
// Project
export const fetchProjects = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/projects`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching projects');
  const data = await response.json();
  return data.projects || data; // Assuming your Express API returns { sales: [...] }
};

export const createProject = async (projectData: Omit<Project, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/projects/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/projects/${code}/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/projects/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting project');
  deleteResponse('Project', response);
};

//Contractor

export const fetchContractors = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/contractor/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching contractors');
  const data = await response.json();
  return data; // Assuming your Express API returns { sales: [...] }
};

export const createContractor = async (contractorData: Omit<Contractor, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/contractor/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/contractor/${code}/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/contractor/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting project');
  deleteResponse('Contractor', response);
};


//Category

export const fetchCategories = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/categ/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching categories');
  const data = await response.json();
  return data; // Assuming your Express API returns { sales: [...] }
};

export const createCategory = async (categoryData: Omit<Categ, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/categ/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/categ/${code}/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/categ/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting category');

  deleteResponse('Category', response);
};

// Job
export const fetchJobs = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/job/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching jobs');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createJob = async (jobData: Omit<Job, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/job/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/job/${code}/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/job/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting job');
  deleteResponse('Job', response);
}

// purchase_order
export const fetchPO = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/po/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching po');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};

export const fetchPoandInv = async (code: number) => {
  const response = await authFetch(`${API_BASE_URL}/high/po/inv/${code}/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching po');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createPO = async (poData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/po/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/po/${code}/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/po/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting job');
  return deleteResponse('PO', response);
}

// jobby
export const fetchInvoice = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/invoice/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching invoice');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};

export const fetchUnpaidInvoice = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/invoice/unpaid/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching unpaid invoice');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};

export const fetchInNPay = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/invoice/invnpay/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching invoice');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createInvoice = async (poData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/invoice/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/invoice/${code}/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/invoice/status/${code}/`, {
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
  const response = await authFetch(`${API_BASE_URL}/high/invoice/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting invoice');
  return deleteResponse('Invoice', response);
}

// pay
export const fetchPay = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/pay/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching pay');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};

export const fetchPayNInv = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/pay/invnpay/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching pay and invoice');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createPay = async (payData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/pay/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(payData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    alert(errorData.detail || 'Error creating pay');
    throw new Error(errorData.detail || 'Error creating pay');
  }
  return await response.json();
};  

export const updatePay = async (code: number, payData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/pay/${code}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(payData)
  });
  if (!response.ok) throw new Error('Error updating pay, check if the balance is exceeded!');
  return await response.json();
};
export const updateInvStatus = async (code: number, payData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/pay/payupdatestatus/${code}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(payData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error updating pay');
  }
  return await response.json();
};


export const deletePay = async (code: number) => {
  const response = await authFetch(`${API_BASE_URL}/high/pay/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) {
    const errorData = await response.json();
    alert(errorData.error || 'Error deleting pay');
    throw new Error(errorData.detail || 'Error deleting pay');
  }
  return deleteResponse('Pay', response);
}

//jobbudget
// CREATE
export const createJobBudget = async (budgetData: {
  job_id: number;
  project_id: number;
  budget: number;
  note?: string;
}) => {
  try {
    const response = await authAxios.post(`${API_BASE_URL}/high/jobbudgets/`, budgetData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating job budget:', error);
    throw error;
  }
};

export const getJobBudgets = async () => {
  try {
    // const token = await getValidAccessToken(); // Ensure you always get the latest token
    // if (!token) {
    //   throw new Error('No valid token available');
    // }

    const response = await authAxios.get(`${API_BASE_URL}/high/jobbudgets/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching job budget:', error);
    throw error;
  }
};


// READ (Single)
export const getJobBudget = async (budgetId: number) => {
  try {
    const response = await authAxios.get(`${API_BASE_URL}/high/jobbudgets/${budgetId}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching job budget:', error);
    throw error;
  }
};

// UPDATE
export const updateJobBudget = async (budgetId: number, updateData: {
  job_id?: number;
  project_id?: number;
  budget?: number;
  note?: string;
}) => {
  try {
    const response = await authAxios.put(`${API_BASE_URL}/high/jobbudgets/${budgetId}/`, updateData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating job budget:', error);
    throw error;
  }
};

// DELETE
export const deleteJobBudget = async (budgetId: number) => {
  try {
    await authAxios.delete(`${API_BASE_URL}/high/jobbudgets/${budgetId}/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  } catch (error) {
    console.error('Error deleting job budget:', error);
    throw error;
  }
};

//Company
export const fetchCompany = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/company/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching company');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const updateCompany = async (companyData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/company/${companyData.id}/`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(companyData)
  });
  if (!response.ok) throw new Error('Error updating company');
  return await response.json();
};

//department
export const fetchDepartment = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/department/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching department');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createDepartment = async (departmentData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/department/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(departmentData)
  });
  if (!response.ok) throw new Error('Error creating department');
  return await response.json();
};
export const updateDepartment = async (code: number, departmentData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/department/${code}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(departmentData)
  });
  if (!response.ok) throw new Error('Error updating department');
  return await response.json();
};
export const deleteDepartment = async (code: number) => {
  const response = await authFetch(`${API_BASE_URL}/high/department/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting department');
};

//Employee
export const fetchEmployee = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/employee/all/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching employee');
  const data = await response.json();
  console.log("Employee data:", data);
  return data; // Assuming your Express API returns { jobs: [...] }
}

export const createEmployee = async (employeeData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/employee/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(employeeData)
  });
  if (!response.ok) throw new Error('Error creating employee');
  return await response.json();
};
export const updateEmployee = async (code: number, employeeData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/employee/${code}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(employeeData)
  });
  if (!response.ok) throw new Error('Error updating employee');
  return await response.json();
};
export const deleteEmployee = async (code: number) => {
  const response = await authFetch(`${API_BASE_URL}/high/employee/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting employee');
};
//user role
export const fetchUserRole = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/userrole/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching user role');
  const data = await response.json();
  return data;
};

export const updateUserRole = async (roleData: { id: number; role: string }) => {
  const response = await authFetch(`${API_BASE_URL}/high/userrole/${roleData.id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(roleData)
  });
  if (!response.ok) throw new Error('Error updating user role');
  return await response.json();
};

export const deleteUserRole = async (id: number) => {
  const response = await authFetch(`${API_BASE_URL}/high/userrole/${id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting user role');
};
export const createUserRole = async (roleData: { role: string }) => {
  const response = await authFetch(`${API_BASE_URL}/high/userrole/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(roleData)
  });
  if (!response.ok) throw new Error('Error creating user role');
  return await response.json();
};

//payroll
export const fetchPayroll = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/payroll/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching payroll');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};
export const createPayroll = async (payrollData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/payroll/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(payrollData)
  });
  if (!response.ok) throw new Error('Error creating payroll');
  return await response.json();
};
export const updatePayroll = async (code: number, payrollData: Omit<any, "code">) => {
  const response = await authFetch(`${API_BASE_URL}/high/payroll/${code}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(payrollData)
  });
  if (!response.ok) throw new Error('Error updating payroll');
  return await response.json();
};
export const deletePayroll = async (code: number) => {
  const response = await authFetch(`${API_BASE_URL}/high/payroll/${code}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error deleting payroll');
};

// Aging Report
export const fetchAgingReport = async () => {
  const response = await authFetch(`${API_BASE_URL}/high/agingreport/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching aging report');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
}

// BAS
export const fetchBasReport = async (start: Date, end: Date) => {
  const response = await authFetch(`${API_BASE_URL}/high/agingreport/bas/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ start:start, end:end })
  });
  if (!response.ok) throw new Error('Error fetching BAS report');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
}
