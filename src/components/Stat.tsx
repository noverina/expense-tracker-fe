import React, { useEffect, useState } from "react";
import Spinner from "./../components/Spinner";
import { getEnv, fetchEventStat } from "../utils/apiUtils";
import { formatAmount } from "../utils/formatUtils";
import { Stats } from "../types/types";

interface StatProps {
  year: number;
  month: number;
  setIsClosable: (isClosable: boolean) => void;
}

const Stat: React.FC<StatProps> = ({ year, month, setIsClosable }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visibleType, setVisibleType] = useState<"income" | "expense" | null>(
    null
  );
  const [data, setData] = useState<Stats[]>([
    {
      type: "income",
      sum: "",
      categories: [],
    },
  ]);

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

  const handleTypeClick = (type: "income" | "expense") => {
    setVisibleType((prevType) => (prevType === type ? null : type));
  };

  useEffect(() => {
    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(
      Number(getEnv(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT))
    );
    const signal = AbortSignal.any([controller.signal, timeoutSignal]);

    setIsLoading(true);
    fetchEventStat(year, month + 1, signal)
      .then((response) => {
        let result = response.data as Stats[];
        result.sort((a, b) => b.type.localeCompare(a.type));
        result.forEach((type) => {
          type.categories.sort((a, b) => a.category.localeCompare(b.category));
        });
        setData(result);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setIsClosable(!isLoading);
  }, [isLoading]);

  if (isLoading) {
    return <Spinner />;
  }

  if (data == null || data.length == 0) {
    return <div>No data available</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      {data.map((type, index) => (
        <div key={index} className="flex flex-col gap-2 border pb-2 w-80">
          <div
            className="bg-button py-2 px-4 flex justify-between items-center cursor-pointer"
            onClick={() => handleTypeClick(type.type)}
          >
            <span>{type.type}</span>
            <span className="material-symbols-outlined">
              keyboard_arrow_down
            </span>
          </div>
          <div className="py-2 px-4">{formatAmount(type.sum)}</div>
          {visibleType === type.type && (
            <div>
              {type.categories.map((category, index) => (
                <div key={index} className="text-sm flex gap-2 px-2 slide-down">
                  <div className="bg-button py px-2 mb-2 flex gap-2 items-center">
                    <span className="material-symbols-outlined text-xs hidden lg:block">
                      {category.category == "other"
                        ? icons[category.category + " " + type.type]
                        : icons[category.category]}
                    </span>
                    <span>{category.category}</span>
                  </div>
                  <div>{formatAmount(category.sum)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stat;
