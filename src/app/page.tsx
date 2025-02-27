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
import { postForm, getEnv, fetchEventsByMonth } from "../utils/apiUtils";
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
          type: "",
          date: new Date(),
          _id: "",
        }}
        selectedDate={date}
        onError={handleError}
        onSubmit={handleFormSubmit}
        closable={setIsClosable}
      />
    );

    setIsModalOpen(true);
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
          type: "",
          date: new Date(),
          _id: "",
        }}
        selectedDate={date}
        selectedEvent={id}
        onError={handleError}
        onSubmit={handleFormSubmit}
        closable={setIsClosable}
      />
    );

    setIsModalOpen(true);
  };

  const handleStatsClick = (year: number, month: number) => {
    setModalType("info");
    setModalText("Statistics for " + getMonthName(month) + " " + year);
    setModalContent(
      <Stat year={year} month={month} setIsClosable={setIsClosable} />
    );

    setIsModalOpen(true);
  };

  const handleError = (err: string) => {
    setModalType("error");
    setIsClosable(true);
    setModalText("Uh oh! :(");
    setModalContent(
      <div className="flex justify-center items-center">
        Something unexpected occured
      </div>
    );
    console.log(err);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setModalText("");
    setIsModalOpen(false);
  };

  // -----
  // form submit
  // -----
  const handleFormSubmit = (formData: FormData) => {
    const signal = AbortSignal.timeout(
      Number(getEnv(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT))
    );

    postForm(formData, signal)
      .then((response: HttpResponse) => {
        if (response.is_error) {
          handleError(response.message);
        } else {
          fetchEvents(signal);
        }
      })
      .catch((err) => {
        if (err != "AbortError") {
          handleError(err.message);
        }
      });

    handleModalClose();
  };

  const fetchEvents = (signal: AbortSignal) => {
    setIsLoading(true);
    fetchEventsByMonth(date.getFullYear(), date.getMonth() + 1, signal)
      .then((response: HttpResponse) => {
        let groupedEvents: { [key: number]: Event[] } = {};
        const fetchedEvents = response.data as Event[];
        if (fetchedEvents && fetchedEvents.length > 0) {
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
      })
      .catch((err) => {
        handleError(String(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(
      Number(getEnv(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT))
    );
    const signal = AbortSignal.any([controller.signal, timeoutSignal]);
    fetchEvents(signal);
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

  // TODO delete this test later
  // const test = () => {
  //   handleError("test error");
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen fade-in">
      {/* <button onClick={test}>click me!</button> */}
      <Header
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
