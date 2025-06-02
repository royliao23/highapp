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

export const fetchPurchaseDetails = async (purchaseId: number) => {
  try {
    const { data, error } = await supabase.from("purchase_order").select("*").eq("code", purchaseId);
    if (error) throw error;

    return data.length > 0
      ? {
          code: data[0].code,
          job_id: data,
          by_id: data[0].by_id,
          project_id: data,
          ref: data[0].ref,
          cost: data[0].cost,
          contact: data[0].contact,
          create_at:  data[0].create_at,
          updated_at: data[0].updated_at,
          due_at: data[0].due_at,
          description: data[0].description,
        }
      : null;
  } catch (error) {
    console.error("Error fetching the purchase details:", error);
    return null;
  }
};

export const fetchInvoiceDetails = async (invoiceId: number) => {
  try {
    const { data, error } = await supabase
      .from("jobby")
      .select("*, pay(*)")
      .eq("code", invoiceId);

    if (error) throw error;
    if (data.length === 0) return null;

    const invoice = data[0];
    const paid = invoice.pay?.reduce((sum:number, payment:any) => sum + payment.amount, 0) || 0;

    return {
      ...invoice,
      paid,  // Ensure 'paid' is part of the returned object
    };
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    return null;
  }
};

export const fetchPayDetails = async (payId: number) => {
  try {
    const { data, error } = await supabase
      .from("pay")
      .select("*, jobby(*)")
      .eq("code", payId);

    if (error) throw error;
    if (data.length === 0) return null;
    const pay = data[0];
    return {
      pay
    };
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    return null;
  }
};




export const fetchJobService = async () => {
    try {
      const { data, error } = await supabase.from("job").select("*");
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
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



