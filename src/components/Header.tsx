"use client";

import React, { useState, useEffect } from "react";
import { getMonthName } from "./../utils/dateUtils";

interface HeaderProps {
  onNext: () => void;
  onPrev: () => void;
  onTheme: () => void;
  theme: string;
  date: Date;
}

const Header: React.FC<HeaderProps> = ({
  onNext,
  onPrev,
  onTheme,
  theme,
  date,
}) => {
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const year = date.getFullYear();
  const month = getMonthName(date.getMonth());

  useEffect(() => {
    setDateTime(new Date());
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-between items-center sticky top-0 h-10 px-4 py-6">
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

      <div className="flex flex-row gap-2">
        <span className="material-symbols-outlined text-base font-bold">
          arrow_circle_up
        </span>
        <span>Income</span>
        <span>100,000,000,000</span>
        <span className="material-symbols-outlined text-base font-bold">
          arrow_circle_down
        </span>
        <span>Expense</span>
        <span>100,000,000,000</span>
      </div>

      {/* month change button */}
      <div className="flex flex-row gap-4">
        <span>
          {month} {year}
        </span>

        <button
          onClick={onPrev}
          className="w-6 h-6 rounded-full flex items-center justify-center bg-button"
        >
          <span className="material-symbols-outlined text-base font-bold">
            chevron_left
          </span>
        </button>
        <button
          onClick={onNext}
          className="w-6 h-6 rounded-full flex items-center justify-center bg-button"
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
