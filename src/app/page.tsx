"use client";

import React, { useState, useEffect } from "react";
import Grid from "./../components/Grid";
import Modal from "./../components/Modal";
import Form from "./../components/Form";
import Header from "./../components/Header";
import Stat from "./../components/Stat";
import Spinner from "./../components/Spinner";
import "react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";
import { getMonthName } from "./../utils/dateUtils";
import { FormData, HttpResponse, Event } from "../types/types";

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [eventsByDate, setEventsByDate] = useState<{ [key: number]: Event[] }>(
    {}
  );

  // -----
  // related to header next prev month
  // -----
  const handleNextClick = () => {
    setDate((prevDate) => {
      const nextMonth = prevDate.getMonth() + 1;
      return new Date(prevDate.getFullYear(), nextMonth, 1);
    });
  };

  const handlePrevClick = () => {
    setDate((prevDate) => {
      const prevMonth = prevDate.getMonth() - 1;
      return new Date(prevDate.getFullYear(), prevMonth, 1);
    });
  };

  // -----
  // related to modal state and content
  // -----
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  type ModalType = "info" | "warning" | "error" | "none";
  const [modalType, setModalType] = useState<ModalType>("info");
  const [modalText, setModalText] = useState<string>("");
  const [isClosable, setIsClosable] = useState<boolean>(false);

  const handleCreateClick = (date: Date) => {
    setModalType("info");
    setModalText("Creating new event");

    setModalContent(
      <Form
        form={{
          description: "",
          amount: "",
          category: "",
          type: "income",
          date: new Date(),
          _id: "",
        }}
        selectedDate={date}
        onError={handleError}
        onWarn={handleWarn}
        onSubmit={handleFormSubmit}
        closable={setIsClosable}
      />
    );

    setIsModalOpen((prev) => !prev);
  };

  const handleEventClick = (id: string, date: Date) => {
    setModalType("info");
    setModalText("Updating event");
    setModalContent(
      <Form
        form={{
          description: "",
          amount: "",
          category: "",
          type: "income",
          date: new Date(),
          _id: "",
        }}
        selectedDate={date}
        selectedEvent={id}
        onError={handleError}
        onWarn={handleWarn}
        onSubmit={handleFormSubmit}
        closable={setIsClosable}
      />
    );

    setIsModalOpen((prev) => !prev);
  };

  const handleStatsClick = (year: number, month: number) => {
    setModalType("info");
    setModalText("Statistics for " + getMonthName(month) + " " + year);
    setModalContent(
      <Stat
        year={year}
        month={month}
        setIsClosable={setIsClosable}
        onError={handleError}
        onWarn={handleWarn}
      />
    );

    setIsModalOpen((prev) => !prev);
  };

  const handleError = (err: string) => {
    setModalType("error");
    setIsClosable(true);
    setModalText("Uh oh! :(");
    setModalContent(
      <div className="flex items-center">
        Something unexpected occured. Please try again later.
      </div>
    );
    setIsModalOpen((prev) => !prev);
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: err,
    };
    const existingLogs = JSON.parse(
      sessionStorage.getItem("errorLogs") || "[]"
    );
    existingLogs.push(errorLog);
    sessionStorage.setItem("errorLogs", JSON.stringify(existingLogs));
  };

  const handleWarn = (header: string, msg: string) => {
    setModalType("warning");
    setIsClosable(true);
    setModalText(header);
    setModalContent(<div className="flex items-center">{msg}</div>);
    setIsModalOpen((prev) => !prev);
  };

  const handleModalClose = () => {
    setModalText("");
    setIsModalOpen(false);
  };

  // -----
  // form submit
  // -----
  const handleFormSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      const timeout = process.env.NEXT_PUBLIC_REQUEST_TIMEOUT;
      if (timeout == undefined) handleError("unable to load .env");

      const signal = AbortSignal.timeout(Number(timeout));

      const response = await fetch("/api/form", {
        method: "POST",
        signal: signal,
        body: JSON.stringify(formData),
      });

      const data: HttpResponse = await response.json();
      if (data.is_error || !response.ok) {
        if (data.message == "event limit") {
          const limit = process.env.NEXT_PUBLIC_EVENT_LIMIT;
          if (limit == undefined) handleError("Unable to load .env");
          handleWarn(
            "Limit reached",
            `Unable to add new - max. ${limit} in a day`
          );
        } else {
          handleError(data.message);
        }
      } else {
        fetchEvents(signal);
      }
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name == "TimeoutError" || err.name == "AbortError")
      )
        handleWarn("Request timed out", "Please try again");
      else if (err instanceof Error) handleError(err.message);
    } finally {
      setIsLoading(false);
      handleModalClose();
    }
  };

  const fetchEvents = async (signal: AbortSignal) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString(),
      });
      const url = `/api/month?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        signal: signal,
      });

      let groupedEvents: { [key: number]: Event[] } = {};
      const httpRes: HttpResponse = await response.json();
      const fetchedEvents = httpRes.data as Event[];
      if (fetchedEvents && fetchedEvents.length > 0) {
        fetchedEvents.sort((a, b) => b.type.localeCompare(a.type));
        groupedEvents = fetchedEvents.reduce(
          (acc: { [key: number]: Event[] }, event) => {
            const eventDate = new Date(event.date);
            const dayKey = eventDate.getDate();
            if (!acc[dayKey]) acc[dayKey] = [];
            acc[dayKey].push(event);
            return acc;
          },
          {}
        );
      }
      setEventsByDate(groupedEvents);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name == "TimeoutError" || err.name == "AbortError")
      )
        handleWarn("Request timed out", "Please try again");
      else if (err instanceof Error) handleError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeout = process.env.NEXT_PUBLIC_REQUEST_TIMEOUT;
    if (timeout == undefined) handleError("unable to load .env");
    const timeoutSignal = AbortSignal.timeout(Number(timeout));
    const signal = AbortSignal.any([controller.signal, timeoutSignal]);
    try {
      fetchEvents(signal);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name == "TimeoutError" || err.name == "AbortError")
      )
        handleWarn("Request timed out", "Please try again");
      else if (err instanceof Error) handleError(err.message);
      controller.abort();
    }

    return () => {
      controller.abort();
    };
  }, [date.getMonth(), date.getFullYear()]);

  // -----
  // related to theme
  // -----
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.title = "Expense Tracker";
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen fade-in">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen fade-in">
      <Header
        onError={handleError}
        onNext={handleNextClick}
        onPrev={handlePrevClick}
        onTheme={toggleTheme}
        onStats={handleStatsClick}
        theme={theme}
        date={date}
      ></Header>

      <PerfectScrollbar>
        <div className="flex-grow">
          <Grid
            selectedDate={date}
            eventsByDate={eventsByDate}
            onEventClick={handleEventClick}
            onCreateClick={handleCreateClick}
            onError={handleError}
          />
        </div>
      </PerfectScrollbar>

      <Modal
        type={modalType}
        text={modalText}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        isClosable={isClosable}
      >
        {modalContent}
      </Modal>
    </div>
  );
};

export default Page;
