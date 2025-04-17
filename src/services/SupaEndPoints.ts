import { supabase } from "../supabaseClient";

export const fetchJobDetails = async (jobId: number) => {
  try {
    const { data, error } = await supabase.from("job").select("*").eq("code", jobId);
    if (error) throw error;

    return data.length > 0
      ? {
          code: data[0].code,
          job_category_id: data[0].job_category_id,
          name: data[0].name,
          description: data[0].description,
        }
      : null;
  } catch (error) {
    console.error("Error fetching job details:", error);
    return null;
  }
};

export const fetchProjectDetails = async (projectId: number) => {
  try {
    const { data, error } = await supabase.from("project").select("*").eq("code", projectId);
    if (error) throw error;

    return data.length > 0
      ? {
          code: data[0].code,
          project_name: data[0].project_name,
          description: data[0].description,
          manager: data[0].manager,
          status: data[0].status,
        }
      : null;
  } catch (error) {
    console.error("Error fetching project details:", error);
    return null;
  }
};


export const fetchContractorDetails = async (contractorId: number) => {
  try {
    const { data, error } = await supabase.from("contractor").select("*").eq("code", contractorId);
    if (error) throw error;

    return data.length > 0
      ? {
          code: data[0].code,
          contact_person: data[0].contact_person,
          company_name: data[0].company_name,
          phone_number: data[0].phone_number,
          email: data[0].email,
          bsb: data[0].bsb,
          account_no: data[0].account_no,
          account_name: data[0].account_name,
          address: data[0].address,
        }
      : null;
  } catch (error) {
    console.error("Error fetching contractor details:", error);
    return null;
  }
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


