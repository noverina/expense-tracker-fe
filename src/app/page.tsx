"use client";

import React, { useState, useEffect } from "react";
import Grid from "./../components/Grid";
import Modal from "./../components/Modal";
import Form from "./../components/Form";
import Header from "./../components/Header";
import Spinner from "./../components/Spinner";
import { postForm, getEnv, fetchEventsByMonth } from "../utils/apiUtils";
import { FormData, HttpResponse, Event } from "../types/types";

const Page: React.FC = () => {
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
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  type ModalType = "info" | "warning" | "error" | "none";
  const [modalType, setModalType] = useState<ModalType>("info");
  const [modalText, setModalText] = useState<string>("");

  const handleCreateClick = (date: Date) => {
    setModalType("info");
    setModalText("add new");
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
      ></Form>
    );
    setIsModalOpen(true);
  };

  const handleEventClick = (id: string, date: Date) => {
    setModalType("info");
    setModalText("update");
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
        selectedEvent={selectedEvent}
        onError={handleError}
        onSubmit={handleFormSubmit}
      ></Form>
    );
    setSelectedEvent(id);
    setIsModalOpen(true);
  };

  const handleError = (err: string) => {
    setModalType("error");
    setModalText("");
    setModalContent(
      <div className="flex justify-center items-center">{err}</div>
    );
    setIsModalOpen(true);
  };

  const handleModalLoading = () => {
    setModalType("none");
    setModalText("");
    setModalContent(<Spinner></Spinner>);
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

  return (
    <div className="flex flex-col h-screen fade-in">
      <Header
        onNext={handleNextClick}
        onPrev={handlePrevClick}
        onTheme={toggleTheme}
        theme={theme}
        date={date}
      ></Header>

      <div className="flex-grow overflow-auto">
        <Grid
          selectedDate={date}
          eventsByDate={eventsByDate}
          onEventClick={handleEventClick}
          onCreateClick={handleCreateClick}
          onError={handleError}
        />
      </div>

      <Modal
        type={modalType}
        text={modalText}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      >
        {modalContent}
      </Modal>
    </div>
  );
};

export default Page;
