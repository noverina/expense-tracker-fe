export interface FormData {
  description: string;
  amount: string;
  type: string;
  category: string;
  date: Date;
  _id: string;
}

export interface Dropdown {
  key: string;
  value: string;
}

export interface HttpResponse {
  is_error: boolean;
  message: string;
  data: unknown;
}

export interface Event {
  _id: string;
  description: string;
  type: string;
  category: string;
  date: string;
  amount: string;
}

export interface Stats {
  type: "income" | "expense";
  sum: string;
  categories: Category[];
}

interface Category {
  category: string;
  sum: string;
}
