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

export interface InvoiceShort { code: number;ref?:string;cost?:number;}
export interface Purchase {
  code: number;
  job_id: number;
  by_id: number;
  project_id: number;
  cost: number;
  ref: string;
  contact: string;
  create_at: Date;
  updated_at: Date;
  due_at: Date
  invoice?:InvoiceShort[]
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
  contact: string;
  create_at: Date;
  updated_at: Date;
  due_at: Date
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
