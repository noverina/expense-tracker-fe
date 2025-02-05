"use client";

import React, { useEffect, useState } from "react";
import { FormData, Dropdown, HttpResponse } from "../types/types";

interface FormProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  formData: FormData;
}

const Form: React.FC<FormProps> = ({ onClose, onSubmit, formData }) => {
  const [formState, setFormState] = useState<FormData>(formData);
  const [categoryData, setCategoryData] = useState<Dropdown[]>([]);
  const [dropdownData, setDropdownData] = useState<{
    [key: string]: Dropdown[];
  }>({
    type: [],
    category: [],
  });

  const year = formData.date.getFullYear();
  const month = (formData.date.getMonth() + 1).toString().padStart(2, "0"); // month is 0-based
  const day = formData.date.getDate().toString().padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  // type checking
  const isDropdownArray = (data: unknown): data is Dropdown[] => {
    return (
      Array.isArray(data) &&
      data.every(
        (item) =>
          item && typeof item === "object" && "key" in item && "value" in item
      )
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const formattedValue = name === "amount" ? formatAmount(value) : value;
    setFormState((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatAmount = (value: string) => {
    // get rid of non-digit non period character
    let cleaned = value.replace(/[^0-9.]/g, "");
    // remove extra periods, leaving only the first one
    const periodCount = (cleaned.match(/\./g) || []).length;
    if (periodCount > 1) {
      cleaned = cleaned.replace(/\./g, "");
      cleaned =
        cleaned.slice(0, cleaned.indexOf(".") + 1) +
        cleaned.slice(cleaned.indexOf(".") + 1);
    }
    const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formatted;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
    onClose();
  };

  const fetchDropdownData = async (endpoint: string, dropdownKey: string) => {
    try {
      const res = await fetch(endpoint);
      const resJSON: HttpResponse = await res.json();

      if (!resJSON.is_error && isDropdownArray(resJSON.data)) {
        setDropdownData((prevData) => {
          const defaultData = {
            ...prevData,
            [dropdownKey]: resJSON.data as Dropdown[],
          };
          if (defaultData[dropdownKey].length > 0) {
            setFormState((prevState) => ({
              ...prevState,
              [dropdownKey]: defaultData[dropdownKey][0].value,
            }));
          }
          return defaultData;
        });
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${dropdownKey}`, error);
    }
  };

  const fetchConditionalDropdown = async (type: string) => {
    if (type) {
      try {
        //TODO get from env
        const res = await fetch(
          `http://localhost:8083/api/v1/dropdown/${type}`
        );
        const resJSON: HttpResponse = await res.json();

        if (!resJSON.is_error && isDropdownArray(resJSON.data)) {
          const categories = resJSON.data as Dropdown[];
          setCategoryData(categories);

          if (categories.length > 0) {
            setFormState((prevState) => ({
              ...prevState,
              category: categories[0].value,
            }));
          }
        }
      } catch (error) {
        console.error(`Failed to fetch category data for ${type}`, error);
      }
    }
  };

  // TODO get from env
  useEffect(() => {
    fetchDropdownData("http://localhost:8083/api/v1/dropdown/type", "type");
  }, []);

  useEffect(() => {
    if (formState.type) {
      fetchConditionalDropdown(formState.type);
    }
  }, [formState.type]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          value={formState.amount}
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
          value={formState.type}
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
          value={formState.category}
          onChange={handleSelectChange}
        >
          {categoryData.length > 0 ? (
            categoryData.map((category) => (
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
          value={formState.description}
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
