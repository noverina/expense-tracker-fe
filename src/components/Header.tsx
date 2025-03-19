"use client";

import React, { useState, useEffect } from "react";
import { getMonthName } from "./../utils/dateUtils";

interface HeaderProps {
  onError: (err: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onTheme: () => void;
  onStats: (year: number, month: number) => void;
  theme: string;
  date: Date;
}

const Header: React.FC<HeaderProps> = ({
  onError,
  onNext,
  onPrev,
  onTheme,
  onStats,
  theme,
  date,
}) => {
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [isPrevAble, setIsPrevAble] = useState<boolean>(false);
  const [isNextAble, setIsNextAble] = useState<boolean>(false);

  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = getMonthName(date.getMonth());

  const isDateWithinMinRange = (): boolean => {
    const monthRange = Number(process.env.NEXT_PUBLIC_MONTH_RANGE_LIMIT || "0");
    if (monthRange == 0) {
      onError("unable to load .env");
    }
    const checkedDate = new Date(year, month, 1);
    const currentDate = new Date();
    const minDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - monthRange,
      1
    );
    return checkedDate <= minDate;
  };

  const isDateWithinMaxRange = (): boolean => {
    const monthRange = Number(process.env.NEXT_PUBLIC_MONTH_RANGE_LIMIT || "0");
    if (monthRange == 0) {
      onError("unable to load .env");
    }
    const checkedDate = new Date(year, month, 1);
    const currentDate = new Date();
    const maxDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthRange,
      1
    );
    return checkedDate >= maxDate;
  };

  useEffect(() => {
    setDateTime(new Date());
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    if (isDateWithinMinRange()) setIsPrevAble(true);
    else setIsPrevAble(false);
    if (isDateWithinMaxRange()) setIsNextAble(true);
    else setIsNextAble(false);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center sticky top-0 h-30 lg:h-10 px-4 py-6 z-20 header">
      {/* theme toggle */}
      <div className="flex flex-row gap-4 items-center justify-center">
        <button
          onClick={onTheme}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-button"
        >
          {theme === "light" ? (
            <span className="material-symbols-outlined text-base">
              light_mode
            </span>
          ) : (
            <span className="material-symbols-outlined text-base">
              dark_mode
            </span>
          )}
        </button>
        <div className="flex flex-row justify-between items-center gap-1">
          <span className="material-symbols-outlined text-base">schedule</span>
          <span>{dateTime ? dateTime.toLocaleString() : ""}</span>
        </div>
      </div>

      {/* month change button */}
      <div className="flex flex-row gap-4">
        <span
          className="material-symbols-outlined w-6 h-6 rounded-full flex items-center justify-center bg-button cursor-pointer text-sm"
          title="statistics for this month"
          onClick={() => onStats(year, month)}
        >
          bar_chart
        </span>
        <span>
          {monthName} {year}
        </span>

        <button
          onClick={onPrev}
          className="w-6 h-6 rounded-full flex items-center justify-center bg-button"
          title="previous month"
          disabled={isPrevAble}
        >
          <span className="material-symbols-outlined text-base font-bold">
            chevron_left
          </span>
        </button>
        <button
          onClick={onNext}
          className="w-6 h-6 rounded-full flex items-center justify-center bg-button"
          title="next month"
          disabled={isNextAble}
        >
          <span className="material-symbols-outlined text-base font-bold">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
