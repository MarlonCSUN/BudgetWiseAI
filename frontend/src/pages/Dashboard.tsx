import BudgetPie from "../components/dashboard/BudgetPie";
import { Calendar } from "lucide-react";
import React, { useMemo, useState } from "react";

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

  const widgetCardStyle = "shadow-lg p-4 rounded-md bg-white";

  return (
    <div className="dashboard-container py-8 px-6 gap-4 flex flex-col">
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
      <div className={`progress-to-next-level ${widgetCardStyle}`}>
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
      <div className="flex items-center gap-2">
        {/* Balance Budget Widget */}
        <div className={`balance-budget-snapshot ${widgetCardStyle} w-full`}>
          <h2 className="widget-title relative text-lg font-serifDisplay mb-3">
            Balances
            <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
          </h2>
          <div className="balance-snapshot flex items-center gap-4 w-full">
            {/* Left Side */}
            <div className="left-side-balance-snapshot flex-1 space-y-4 gap-2 flex flex-col">
              <div className="remaining-balance bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between gap-2 p-2">
                <h3>Remaining: </h3>
                <p className="text-green-500 font-bold text-lg">$1,200</p>
              </div>
              <div className="income-balance bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between gap-2 p-2">
                <h3>Income: </h3>
                <p className="text-blue-500 font-bold text-lg">$1,000</p>
              </div>
              <div className="expenses bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between gap-2 p-2">
                <h3>Expenses:</h3>
                <p className="text-red-500 font-bold text-lg">$2,000</p>
              </div>
            </div>

            {/* Right Side - Pie Chart */}
            <div className="right-side-pie-chart w-[240px] h-[240px]">
              <BudgetPie />
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`recent-transaction-widget ${widgetCardStyle}`}>
          <h2 className="widget-title relative text-lg font-serifDisplay mb-3">
            Recent Transactions
            <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
