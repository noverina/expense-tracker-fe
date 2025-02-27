"use client";

import React, { useEffect, useState } from "react";
import Spinner from "./../components/Spinner";
import { FormData, Dropdown, HttpResponse, Event } from "../types/types";
import { formatDateHTML, formatAmount } from "../utils/formatUtils";
import {
  getEndpoint,
  getEnv,
  fetchDropdownData,
  fetchEventById,
} from "../utils/apiUtils";

interface FormProps {
  form: FormData;
  selectedDate: Date;
  selectedEvent?: string;
  onError: (err: string) => void;
  onSubmit: (formData: FormData) => void;
  closable: (isClosable: boolean) => void;
}

const Form: React.FC<FormProps> = ({
  form,
  selectedDate,
  selectedEvent,
  onError,
  onSubmit,
  closable,
}) => {
  //#region script
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(form);
  const [dropdownData, setDropdownData] = useState<{
    [key: string]: Dropdown[];
  }>({
    type: [],
    category: [],
  });
  const formattedDate = formatDateHTML(selectedDate);
  formData.date = selectedDate;

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const formattedValue = name === "amount" ? formatAmount(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      description: "",
      amount: "",
      type: "income",
      category: "expense",
      date: new Date(),
      _id: "",
    });
  };

  const fillDropdown = (name: string, data: Dropdown[]) => {
    setDropdownData((prevData) => {
      const defaultData = {
        ...prevData,
        [name]: data,
      };
      if (defaultData[name].length > 0) {
        setFormData((prevState) => ({
          ...prevState,
          [name]: defaultData[name][0].value,
        }));
      }
      return defaultData;
    });
  };

  // get dropdown - type
  useEffect(() => {
    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(
      Number(getEnv(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT))
    );
    const signal = AbortSignal.any([controller.signal, timeoutSignal]);

    setIsLoading(true);
    fetchDropdownData(
      getEndpoint(process.env.NEXT_PUBLIC_ENDPOINT_DROPDOWN_TYPE),
      signal
    )
      .then((response: HttpResponse) => {
        fillDropdown("type", response.data as Dropdown[]);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          onError(err);
        }
      })
      .finally(() => setIsLoading(false));

    return () => {
      controller.abort();
    };
  }, []);

  // get dropdown - category
  useEffect(() => {
    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(
      Number(getEnv(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT))
    );
    const signal = AbortSignal.any([controller.signal, timeoutSignal]);

    setIsLoading(true);
    if (formData.type) {
      const category =
        formData.type === "income"
          ? getEndpoint(process.env.NEXT_PUBLIC_ENDPOINT_DROPDOWN_INCOME)
          : formData.type === "expense"
          ? getEndpoint(process.env.NEXT_PUBLIC_ENDPOINT_DROPDOWN_EXPENSE)
          : new URL("");
      fetchDropdownData(category, signal)
        .then((response: HttpResponse) => {
          fillDropdown("category", response.data as Dropdown[]);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            onError(err);
          }
        })
        .finally(() => setIsLoading(false));
    }

    return () => {
      controller.abort();
    };
  }, [formData.type]);

  // get form prefill data (for edit)
  useEffect(() => {
    const controller = new AbortController();
    if (selectedEvent && !isLoading) {
      const timeoutSignal = AbortSignal.timeout(
        Number(getEnv(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT))
      );
      const signal = AbortSignal.any([controller.signal, timeoutSignal]);

      fetchEventById(selectedEvent, signal)
        .then((response: HttpResponse) => {
          const dataArr: Event[] = response.data as Event[];
          const data: Event = dataArr[0];
          console.log(data._id);
          setFormData((prevFormData) => ({
            ...prevFormData,
            date: new Date(data.date),
            amount: formatAmount(data.amount),
            type: data.type,
            category: data.category,
            description: data.description,
            _id: data._id,
          }));
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            onError(err);
          }
        })
        .finally(() => setIsLoading(false));
    }

    closable(!isLoading);

    return () => {
      controller.abort();
    };
  }, [selectedEvent, isLoading]);

  //#endregion script

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 flex flex-col">
      <div className="flex gap-4">
        {/* date */}
        <div className="flex-1">
          <label htmlFor="date" className="text-sm font-medium required">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formattedDate}
            onChange={handleInputChange}
            className="mt-2 w-full px-4 py-2 border rounded-md"
            placeholder="Type here..."
            required
          />
        </div>
        {/* amount */}
        <div className="flex-1">
          <label htmlFor="amount" className="text-sm font-medium required">
            Amount
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="mt-2 w-full px-4 py-2 border rounded-md"
            placeholder="Type here..."
            required
          />
        </div>
      </div>
      <div className="flex gap-4">
        {/* type */}
        <div className="flex-1">
          <label htmlFor="type" className="block text-sm font-medium required">
            Type
          </label>
          <select
            className="mt-2 w-full px-4 py-2 border rounded-md"
            name="type"
            id="type"
            value={formData.type}
            onChange={handleSelectChange}
          >
            {dropdownData.type.length > 0 ? (
              dropdownData.type.map((type) => (
                <option key={type.key} value={type.value}>
                  {type.value}
                </option>
              ))
            ) : (
              <option disabled>No options available</option>
            )}
          </select>
        </div>
        {/* category */}
        <div className="flex-1">
          <label
            htmlFor="category"
            className="block text-sm font-medium required"
          >
            Category
          </label>
          <select
            className="mt-2 w-full px-4 py-2 border rounded-md"
            name="category"
            id="category"
            value={formData.category}
            onChange={handleSelectChange}
          >
            {dropdownData.category.length > 0 ? (
              dropdownData.category.map((category) => (
                <option key={category.key} value={category.value}>
                  {category.value}
                </option>
              ))
            ) : (
              <option disabled>No options available</option>
            )}
          </select>
        </div>
      </div>
      {/* description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full p-4 border rounded-md"
          placeholder="Type here..."
        />
      </div>
      <div className="flex gap-4 self-end">
        <button
          type="reset"
          className="py-2 px-4 rounded-md border"
          onClick={handleReset}
        >
          Reset
        </button>
        <button type="submit" className="py-2 px-4 rounded-md">
          Submit
        </button>
      </div>
    </form>
  );
};

export default Form;
