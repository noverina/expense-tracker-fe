"use client";

import React from "react";
import { Event } from "./../types/types";
import { formatAmount } from "../utils/formatUtils";
import "react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";

interface GridProps {
  eventsByDate: { [key: number]: Event[] };
  selectedDate: Date;
  onEventClick: (id: string, date: Date) => void;
  onCreateClick: (date: Date) => void;
  onError: (err: string) => void;
}

const Grid: React.FC<GridProps> = ({
  eventsByDate,
  onEventClick,
  onCreateClick,
  selectedDate,
}) => {
  const icons: { [key: string]: string } = {
    salary: "work",
    "petty cash": "money_bag",
    allowance: "payments",
    "other income": "keyboard_arrow_down",
    household: "home",
    food: "restaurant",
    health: "pill",
    beauty: "face",
    transport: "directions_car",
    fashion: "apparel",
    social: "group",
    education: "school",
    "other expense": "keyboard_arrow_up",
  };

  const currentDate = new Date();
  const isCurrentDate = (date: number): boolean => {
    return (
      date !== 0 &&
      date === currentDate.getDate() &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const lastDateOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  ).getDay();

  let dates: number[][] = [];
  let week = Array(firstDayOfMonth).fill(0);
  for (let day = 1; day <= lastDateOfMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      dates.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    week = [...week, ...Array(7 - week.length).fill(0)];
    dates.push(week);
  }

  return (
    <>
      {/* make the scrollbar always visible */}
      <style>
        {`
          .ps__rail-y {
            opacity: 0.6
          }
        `}
      </style>
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 gap-1 sticky top-0 h-8 border-b-2 pb-8 weekday-header z-10">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day, index) => (
              <div
                key={index}
                className="text-center font-bold flex justify-center p-2"
              >
                <span>{day}</span>
              </div>
            )
          )}
        </div>

        <div className="flex-grow p-2">
          <div className="grid grid-rows-5 grid-cols-7 gap-1 ">
            {dates.map((week, weekIndex) =>
              week.map((date, dayIndex) => {
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`flex flex-col w-full h-[100px] lg:h-[150px]  ${
                      isCurrentDate(date)
                        ? "item-current border border-dotted"
                        : date !== 0
                        ? "item border border-solid"
                        : ""
                    }`}
                  >
                    {/* header (date and +)*/}
                    {date !== 0 && (
                      <div className="flex justify-between p-2 border-b mb-2">
                        <span className="text-xs cursor-default">{date}</span>
                        <span
                          className="text-xs cursor-pointer w-4 h-4 rounded-full flex items-center justify-center bg-button"
                          onClick={() =>
                            onCreateClick(
                              new Date(
                                selectedDate.getFullYear(),
                                selectedDate.getMonth(),
                                date
                              )
                            )
                          }
                        >
                          +
                        </span>
                      </div>
                    )}
                    {/* event in dates */}
                    {date !== 0 && (
                      <PerfectScrollbar options={{ suppressScrollX: true }}>
                        <div className="flex-grow">
                          {eventsByDate[date]?.map((event, index) => (
                            <div
                              onClick={() =>
                                onEventClick(event._id, new Date(event.date))
                              }
                              key={index}
                              className={`p-1 m-1 rounded cursor-pointer border border-solid flex flex-row gap-2 ${event.type}`}
                            >
                              {/* icon for event */}
                              <span className="material-symbols-outlined text-xs hidden lg:block">
                                {event.category == "other"
                                  ? icons[event.category + " " + event.type]
                                  : icons[event.category]}
                              </span>
                              {/* event amount */}
                              <span className="text-xs break-all">
                                {formatAmount(event.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </PerfectScrollbar>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Grid;
