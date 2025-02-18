"use client";

import React, { useEffect, useState } from "react";
import { FormData, Dropdown, HttpResponse } from "../types/types";
import { formatDateHTML, formatAmount } from "../utils/formatUtils";
import { getEndpoint, fetchDropdownData, getEnv } from "../utils/apiUtils";

interface FormProps {
  form: FormData;
  selectedDate: Date;
  selectedEvent?: string;
  onError: (err: string) => void;
  onSubmit: (formData: FormData) => void;
}

const Form: React.FC<FormProps> = ({
  form,
  selectedDate,
  selectedEvent,
  onError,
  onSubmit,
}) => {
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
      });

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

    if (formData.type) {
      const category =
        formData.type === "income"
          ? getEndpoint(process.env.NEXT_PUBLIC_ENDPOINT_DROPDOWN_INCOME)
          : formData.type === "expense"
          ? getEndpoint(process.env.NEXT_PUBLIC_ENDPOINT_DROPDOWN_EXPENSE)
          : new URL("");
      fetchDropdownData(category, signal)
        .then((response: HttpResponse) => {
          console.log(formData.type);
          fillDropdown("category", response.data as Dropdown[]);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            onError(err);
          }
        });
    }

    return () => {
      controller.abort();
    };
  }, [formData.type]);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* date */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 required"
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formattedDate}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Type here..."
          required
        />
      </div>

      {/* amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 required"
        >
          Amount
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Type here..."
          required
        />
      </div>

      {/* type */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 required"
        >
          Type
        </label>
        <select
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 required"
        >
          Category
        </label>
        <select
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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

      {/* description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Type here..."
        />
      </div>
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Submit
      </button>
    </form>
  );
};

export default Form;
