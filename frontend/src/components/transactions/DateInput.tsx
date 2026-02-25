import { Calendar } from "lucide-react";
import React, { useState } from "react";

import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const DateInput = () => {
  const [dateSelectOpen, onDateSelectOpen] = useState(false);

  return (
    <>
      <div className="date-range-container relative w-fit">
        <div
          className="toggle-calendar flex gap-1 items-center text-sm border p-2 rounded-md cursor-pointer transition-all"
          onClick={() => onDateSelectOpen(!dateSelectOpen)}
        >
          <Calendar className="w-4 h-4" />
          <p>Select Date Range</p>
        </div>

        <div
          className={`absolute w-full min-w-[200px] ${dateSelectOpen ? "visible" : "hidden"} w-auto`}
        >
          <ReactCalendar className={"bg-white w-full"} />
        </div>
      </div>
    </>
  );
};

export default DateInput;
