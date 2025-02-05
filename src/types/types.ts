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
