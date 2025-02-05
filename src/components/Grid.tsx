"use client";

import React from "react";

interface GridProps {
  weeks: number[][];
  selectedDate: Date;
  onDateClick: (date: Date) => void;
}

const Grid: React.FC<GridProps> = ({ weeks, selectedDate, onDateClick }) => {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div key={index} className="text-center font-bold">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-rows-5 grid-cols-7">
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => (
            <div
              onClick={
                date !== 0
                  ? () =>
                      onDateClick(
                        new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth(),
                          date
                        )
                      )
                  : undefined
              }
              key={`${weekIndex}-${dayIndex}`}
              className={`flex justify-center items-center p-2 ${
                date === 0
                  ? "text-transparent cursor-default"
                  : "bg-black-200 rounded-md cursor-pointer hover:bg-gray-300"
              }`}
            >
              {date === 0 ? "" : date}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Grid;
