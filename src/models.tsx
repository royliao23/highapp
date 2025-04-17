export interface Todo {
    id: number;
    todo: string;
    isDone: boolean;
  }

export interface Article {
  id: number;
  title: string;
  desc: string;
  year?: number;
  created_at?: string;
  author?:AuthorM;
}

interface AuthorM {
  name?: string | undefined; id?: number; age?: number | undefined; 
}

export interface Author {
  id: number;
  name: string;
  age: number;
  articles: Article[];
}
export interface Categ {
  code: number;
  name: string;
}
export interface Project {
  code: number;
  project_name: string;
  manager: string;
  description: string;
  status: string;
}

export interface Job {
  code: number;
  job_category_id: number;
  name: string;
  description: string;
}


export interface InvoiceShort { code: number;ref?:string;cost?:number;}
export interface Purchase {
  code: number;
  job_id: number;
  by_id: number;
  project_id: number;
  cost: number;
  ref: string;
  contact: string;
  description: string;
  note: string;
  create_at: Date;
  updated_at: Date;
  due_at: Date
  invoice?:InvoiceShort[]
}

export interface Contractor {
  code: number;
  contact_person: string;
  company_name: string;
  phone_number: string;
  email: string;
  bsb: string;
  account_no: string;
  account_name: string;
  address: string;
}

export interface Invoice {
  code: number;
  po_id?: number;
  job_id: number;
  by_id: number;
  project_id: number;
  invoice_id?: number;
  cost: number;
  ref: string;
  pay?: Pay[];
  paid?: number;
  contact: string;
  create_at: Date;
  updated_at: Date;
  due_at: Date;
  description?: string;
  note?: string;
  outstanding?: number;
}

export interface AgeInvoice  {
  totalPaid: number;
  amountDue: number;
  agingBucket: string;
  code: number;
  due_at: Date;
  cost: number;
  ref: string;
  contractor: any;
  pay: { amount: number }[];
};


export interface Pay {
  code: number;
  invoice_id: number;
  pay_via: string;
  amount: number;
  supply_invoice: string;
  note: string;
  approved_by: string;
  create_at: Date;
  updated_at: Date;
  jobby: Invoice }

export interface BankRecord {
  id: number;
  date: string;
  amount: number;
  description: string;
}

export interface Company {
  id: number;
  company_name: string;
  address: string;
  abn: string;
  director: string;
  tfn?: string | null;
  acn?: string | null;
  phone: string;
  email: string;
}

