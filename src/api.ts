// api.ts
import { Categ } from './models'; // Adjust the import path as necessary
const API_BASE_URL = process.env.REACT_APP_API_NODE;
if (!API_BASE_URL) {
  throw new Error("REACT_APP_API_NODE is not defined in .env");
}
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