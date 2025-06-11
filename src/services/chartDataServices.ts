// chartDataService.ts

const API_BASE_URL = process.env.REACT_APP_API_NODE;
if (!API_BASE_URL) {
  throw new Error("REACT_APP_API_NODE is not defined in .env");
}
type ProjectData = {
  name: string;
  invoiced: number;
  paid: number;
  budget?: number;
};


export const getProjectData = async (): Promise<ProjectData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/high/chart/project-data`);
    if (!response.ok) throw new Error("Failed to fetch");

    return await response.json();
  } catch (error) {
    console.error("Error fetching project data:", error);
    return [];
  }
};

export const getJobCategoryData = async (projectId: number): Promise<ProjectData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/high/chart/job-category-data/${projectId}`);
    if (!response.ok) throw new Error("Failed to fetch");

    return await response.json();
  } catch (error) {
    console.error(`Error fetching job category data for project ${projectId}:`, error);
    return [];
  }
};
export const getJobDataByProject = async (projectId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/high/chart/job-data/${projectId}`);
    if (!response.ok) throw new Error("Failed to fetch");

    return await response.json();
  } catch (error) {
    console.error(`Error fetching job data for project ${projectId}:`, error);
    return [];
  }
};
export const getPayeeData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/high/chart/payee-data`);
    if (!response.ok) throw new Error("Failed to fetch");

    return await response.json();
  } catch (error) {
    console.error("Error fetching payee data:", error);
    return [];
  }
};

export const getAllProjectCodes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/high/chart/codes`);
    if (!response.ok) throw new Error("Failed to fetch");

    return await response.json();
  } catch (error) {
    console.error(`Error fetching project codes`, error);
    return [];
  }
};

