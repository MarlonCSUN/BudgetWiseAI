import AIWidget from "components/dashboard/AIWidget";
import { Calendar } from "lucide-react";
import React, { useState } from "react";
import GoalsWidget from "components/dashboard/GoalsWidget";
import TransactionsWidget from "components/dashboard/TransactionsWidget";
import BalanceWidget from "components/dashboard/BalanceWidget";

const Dashboard: React.FC = () => {
  // Avoids useMemo and instantly initializes selectedMonth to the current month on component mount
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().getMonth(),
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="dashboard-container py-8 px-4 gap-4 flex flex-col">
      {/* Welcome message with current month */}
      <div className="dashboard-header flex items-baseline justify-between mb-4">
        <div className="welcome-message">
          <h1 className="text-4xl font-extralight font-serifDisplay ">
            Welcome back, <span className="text-emerald-600">John</span>
          </h1>
          <p className="current-date text-sm text-gray-500 font-serifBody ml-1">
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Month dropdown navigation */}
        <div className="month-dropdown flex items-center gap-1">
          <Calendar className="calendar-icon" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent text-sm font-medium outline-none cursor-pointer"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Level and Progress to Next Level */}
      <div className="progress-to-next-level shadow-lg p-4 rounded-md bg-white">
        <div className="progress-bar-widget relative">
          {/* Progress Bar */}
          <div className="progress-bar rounded-md w-full bg-gray-100">
            <div
              style={{ width: "50%" }}
              className="pl-1 bg-emerald-400 rounded-md"
            >
              <span className="font-serifBody text-white text-sm font-bold">
                50%
              </span>
            </div>{" "}
          </div>
          {/* Level Text */}
          <p className="current-level-progress-text text-sm font-serifBody">
            Lvl 10
          </p>
          <p className="next-level-progress-text text-sm font-serifBody absolute right-0 bottom-0">
            Lvl 11
          </p>
        </div>
      </div>

      {/* Balances Budget Snapshot and Recent Transactions */}
      <div className="flex items-stretch gap-2 h-[310px] max-h-[315px]">
        {/* Balance Budget Widget */}
        <BalanceWidget />
        {/* Recent Transactions */}
        <TransactionsWidget />
      </div>

      {/* AI Chat Widget & Goals List */}
      <div className="flex items-stretch gap-2 h-[310px] max-h-[315px]">
        {/* AI Chat Widget */}
        <AIWidget />

        {/* Goals */}
        <GoalsWidget />
      </div>
    </div>
  );
};

export default Dashboard;
