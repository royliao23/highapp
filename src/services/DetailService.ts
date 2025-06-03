import { supabase } from "../supabaseClient";
//import { Categ, Contractor, Project, Job, Purchase } from './models'; // Adjust the import path as necessary
const API_BASE_URL = process.env.REACT_APP_API_NODE;
if (!API_BASE_URL) {
  throw new Error("REACT_APP_API_NODE is not defined in .env");
}
export const fetchJobDetails = async (jobId: number) => { const response = await fetch(`${API_BASE_URL}/high/job/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching job details');
  const data = await response.json();
  return data; // Assuming your Express API returns { jobs: [...] }
};

export const fetchProjectDetails = async (code: number) => { const response = await fetch(`${API_BASE_URL}/high/projects/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching project details');
  const data = await response.json();
  return data; 
};


export const fetchContractorDetails = async (code: number) => { const response = await fetch(`${API_BASE_URL}/high/contractor/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching contractor details');
  const data = await response.json();
  return data; 
};

export const fetchPurchaseDetails = async (code: number) => { const response = await fetch(`${API_BASE_URL}/high/po/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching po details');
  const data = await response.json();
  return data.po; 
};

export const fetchInvoiceDetails =  async (code: number) => { 
  try {
  const response = await fetch(`${API_BASE_URL}/high/invoice/singleinvpay/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching po details');
  const invoice = await response.json();
  if (invoice.error) throw new Error('Error fetching invoice details');
  
  const paid = invoice.pay?.reduce((sum:number, payment:any) => sum + payment.amount, 0) || 0;

  return {
      ...invoice,
      paid,  // Ensure 'paid' is part of the returned object
    };
} catch (error) {
  console.error("Error fetching invoice details:", error);}
}

export const fetchInvoicePayDetails = async (invoiceId: number) => {
  const response = await fetch(`${API_BASE_URL}/high/invoice/singleinvpay/${invoiceId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching invoice and payment details');
  const data = await response.json();
  return data; 
};

export const fetchPayDetails = async (code: number) => {
  const response = await fetch(`${API_BASE_URL}/high/pay/${code}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  if (!response.ok) throw new Error('Error fetching pay details');
  const data = await response.json();
  return data; 
};

export const fetchInvoicesForPeriod = async (startDate: Date, endDate: Date) => {
  try {
    const { data, error } = await supabase
      .from('jobby') // Replace 'invoices' with your actual table name
      .select('*')
      .gte('create_at', startDate.toISOString())
      .lte('create_at', endDate.toISOString());

    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Failed to fetch invoices:', error.message);
    throw error;
  }
  };

export const fetchInvoicesForPeriodDeep = async (startDate: Date, endDate: Date) => {
  try {
    const { data, error } = await supabase
      .from('jobby')
      .select(`
        *,
        contractor (
          code,
          contact_person,
          company_name,
          phone_number,
          email,
          bsb,
          account_no,
          account_name,
          address, 
          abn,
          gst_registered
        )
      `)
      .gte('create_at', startDate.toISOString())
      .lte('create_at', endDate.toISOString());

    if (error) {
      console.error('Error fetching invoices with contractor details:', error);
      throw error;
    }

    // Supabase's join will nest the contractor data under the 'contractor' key
    // We need to map the result to match the InvoiceDeep interface
    const formattedData = data ? data.map(item => ({
      code: item.code,
      po_id: item.po_id,
      job_id: item.job_id,
      by_id: item.contractor, // Assign the nested contractor object to by_id
      project_id: item.project_id,
      invoice_id: item.invoice_id,
      cost: item.cost,
      ref: item.ref,
      pay: item.pay,
      paid: item.paid,
      contact: item.contact,
      create_at: new Date(item.create_at),
      updated_at: new Date(item.updated_at),
      due_at: new Date(item.due_at),
      description: item.description,
      note: item.note,
      outstanding: item.outstanding,
    })) : [];

    return formattedData;
  } catch (error: any) {
    console.error('Failed to fetch invoices with contractor details:', error.message);
    throw error;
  }
};



