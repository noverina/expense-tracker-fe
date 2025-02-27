import { FormData, HttpResponse } from "../types/types";

interface FormDataRequest {
  description: string;
  amount: string;
  type: string;
  category: string;
  date: string;
  _id: string;
}

// TODO delete this later
// artificial delay for testing
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getEnv = (env: string | undefined): string => {
  if (env) return env;
  else return "";
};

export const getEndpoint = (name: string | undefined): URL => {
  const base = getEnv(process.env.NEXT_PUBLIC_ENDPOINT_BASE);
  const env = getEnv(name);
  return new URL(base + "/" + env);
};

export const postForm = async (
  formData: FormData,
  signal: AbortSignal
): Promise<HttpResponse> => {
  const formattedAmount = formData.amount.replace(/,/g, "");
  const formattedDate = formData.date.toISOString();
  const request: FormDataRequest = {
    description: formData.description,
    amount: formattedAmount,
    type: formData.type,
    category: formData.category,
    date: formattedDate,
    _id: formData._id,
  };

  const response = await fetch(
    getEndpoint(process.env.NEXT_PUBLIC_ENDPOINT_UPSERT),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    }
  );

  const data: HttpResponse = await response.json();

  if (!response.ok || data.is_error) {
    throw new Error("Failed to submit form");
  }

  return data;
};

export const fetchDropdownData = async (
  endpoint: URL,
  signal: AbortSignal
): Promise<HttpResponse> => {
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  });
  const data: HttpResponse = await res.json();

  if (!res.ok && data.is_error) {
    throw new Error("Failed to fetch dropdown data");
  }
  //await delay(3000);
  return data;
};

export const fetchEventsByMonth = async (
  year: number,
  month: number,
  signal: AbortSignal
): Promise<HttpResponse> => {
  const queryParams = new URLSearchParams({
    year: year.toString(),
    month: month.toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const url = getEndpoint(process.env.NEXT_PUBLIC_ENDPOINT_MONTH);
  url.search = queryParams.toString();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  });

  const data: HttpResponse = await response.json();
  if (!response.ok || data.is_error) {
    throw new Error("Failed to fetch events data");
  }

  //await delay(3000);

  return data;
};

export const fetchEventById = async (
  id: string,
  signal: AbortSignal
): Promise<HttpResponse> => {
  const request = { _id: id };

  const response = await fetch(
    getEndpoint(process.env.NEXT_PUBLIC_ENDPOINT_FILTER),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    }
  );

  const data: HttpResponse = await response.json();
  if (!response.ok || data.is_error) {
    throw new Error("Failed to fetch event data");
  }

  return data;
};

export const fetchEventStat = async (
  year: number,
  month: number,
  signal: AbortSignal
): Promise<HttpResponse> => {
  const queryParams = new URLSearchParams({
    year: year.toString(),
    month: month.toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const url = getEndpoint(process.env.NEXT_PUBLIC_ENDPOINT_SUM);
  url.search = queryParams.toString();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  });

  const data: HttpResponse = await response.json();
  if (!response.ok || data.is_error) {
    throw new Error("Failed to fetch event stats data");
  }

  //await delay(3000);

  return data;
};
