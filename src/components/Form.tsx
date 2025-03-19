"use client";

import React, { useEffect, useState, useRef } from "react";
import Spinner from "./../components/Spinner";
import { FormData, Dropdown, Event } from "../types/types";
import { formatDateHTML, formatAmount } from "../utils/formatUtils";

interface FormProps {
  form: FormData;
  selectedDate: Date;
  selectedEvent?: string;
  onWarn: (header: string, msg: string) => void;
  onError: (err: string) => void;
  onSubmit: (formData: FormData) => void;
  closable: (isClosable: boolean) => void;
}

const Form: React.FC<FormProps> = ({
  form,
  selectedDate,
  selectedEvent,
  onError,
  onWarn,
  onSubmit,
  closable,
}) => {
  //#region script
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchedDropdown, setIsFetchedDropdown] = useState<boolean>(false);
  const isFormReset = useRef(false);
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
    isFormReset.current = true;
  };

  // fetch dropdown data
  const fetchDropdown = async (
    type: "type" | "income" | "expense",
    signal: AbortSignal
  ) => {
    try {
      setIsLoading((prev) => !prev);
      setIsFetchedDropdown(false);
      const queryParams = new URLSearchParams({
        type: type,
      });

      const url = `/api/dropdown?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        signal: signal,
      });

      const data = await response.json();

      const name =
        type == "income" || type == "expense"
          ? "category"
          : type == "type"
          ? "type"
          : "";
      fillDropdown(name, data.data as Dropdown[]);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name == "TimeoutError" || err.name == "AbortError")
      )
        onWarn("Request timed out", "Please try again");
      else if (err instanceof Error) onError(err.message);
    } finally {
      setIsLoading((prev) => !prev);
    }
  };

  // fill dropdown data
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
    setIsFetchedDropdown(true);
  };

  // get dropdown - type
  useEffect(() => {
    const timeout = process.env.NEXT_PUBLIC_REQUEST_TIMEOUT;
    if (timeout == undefined) onError("Unable to load .env");
    const signal = AbortSignal.timeout(Number(timeout));

    fetchDropdown("type", signal);
  }, []);

  // get dropdown - category
  useEffect(() => {
    const timeout = process.env.NEXT_PUBLIC_REQUEST_TIMEOUT;
    if (timeout == undefined) onError("Unable to load .env");
    const signal = AbortSignal.timeout(Number(timeout));

    fetchDropdown(formData.type, signal);
  }, [formData.type]);

  // get form prefill data (for edit)
  useEffect(() => {
    closable(!isLoading);
  }, [isLoading]);

  const prefillForm = async (event: string) => {
    const timeout = process.env.NEXT_PUBLIC_REQUEST_TIMEOUT;
    if (timeout == undefined) onError("Unable to load .env");
    const signal = AbortSignal.timeout(Number(timeout));

    try {
      const body = { _id: event };

      const response = await fetch("/api/event", {
        method: "POST",
        signal: signal,
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const eventsArr: Event[] = data.data as Event[];
      const defaultEvent: Event = eventsArr[0];
      setFormData({
        date: new Date(defaultEvent.date),
        amount: formatAmount(defaultEvent.amount),
        type: defaultEvent.type,
        category: defaultEvent.category,
        description: defaultEvent.description,
        _id: defaultEvent._id,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name == "TimeoutError" || err.name == "AbortError")
      )
        onWarn("Request timed out", "Please try again");
      else if (err instanceof Error) onError(err.message);
    }
  };

  useEffect(() => {
    if (isFormReset.current && isFetchedDropdown) {
      isFormReset.current = false;
      return;
    }

    if (selectedEvent && isFetchedDropdown) {
      prefillForm(selectedEvent);
    }
  }, [selectedEvent, isFetchedDropdown]);

  //#endregion script

  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
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
            <label
              htmlFor="type"
              className="block text-sm font-medium required"
            >
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
    </div>
  );
};

export default Form;
