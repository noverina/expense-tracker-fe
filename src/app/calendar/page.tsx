"use client";

import React, { useState } from "react";
import Grid from "../../components/Grid";
import Modal from "../../components/Modal";
import Form from "../../components/Form";
import { FormData } from "../../types/types";

const Page: React.FC = () => {
  // -----
  // related to date generation
  // -----
  const currDate = new Date();
  const lastDateOfMonth = new Date(
    currDate.getFullYear(),
    currDate.getMonth(),
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currDate.getFullYear(),
    currDate.getMonth(),
    1
  ).getDay();

  let weeks: number[][] = [];
  let week = Array(firstDayOfMonth).fill(0);
  for (let day = 1; day <= lastDateOfMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    week = [...week, ...Array(7 - week.length).fill(0)];
    weeks.push(week);
  }

  // -----
  // related to modal
  // -----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // -----
  // related to form
  // -----
  const handleFormSubmit = (formData: FormData) => {
    const unformattedAmount = parseFloat(formData.amount.replace(/,/g, ""));
    formData.amount = unformattedAmount.toString();
    handleCloseModal();
    console.log(formData);
  };

  return (
    <div>
      <h1>My Grid</h1>
      <Grid
        weeks={weeks}
        selectedDate={selectedDate}
        onDateClick={handleDateClick}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <Form
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
          formData={{
            description: "",
            amount: "",
            category: "",
            type: "",
            date: selectedDate,
            _id: "",
          }} // to enforce type checking
        ></Form>
      </Modal>
    </div>
  );
};

export default Page;
