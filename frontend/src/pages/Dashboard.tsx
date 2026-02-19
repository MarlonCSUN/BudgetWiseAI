import BudgetPie from "../components/dashboard/BudgetPie";
import { Calendar } from "lucide-react";
import React, { useState } from "react";

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

  const transactions = [
    {
      name: "Starbucks",
      date: "2026-02-01",
      amount: -6.75,
    },
    {
      name: "Amazon",
      date: "2026-02-02",
      amount: -48.32,
    },
    {
      name: "Paycheck",
      date: "2026-02-03",
      amount: 1200.0,
    },
    {
      name: "Chipotle",
      date: "2026-02-04",
      amount: -14.85,
    },
    {
      name: "Spotify",
      date: "2026-02-05",
      amount: -10.99,
    },
    {
      name: "Rent",
      date: "2026-02-06",
      amount: -950.0,
    },
    {
      name: "Uber",
      date: "2026-02-07",
      amount: -22.4,
    },
    {
      name: "Target",
      date: "2026-02-08",
      amount: -76.18,
    },
    {
      name: "Freelance Payment",
      date: "2026-02-10",
      amount: 350.0,
    },
    {
      name: "Electric Bill",
      date: "2026-02-12",
      amount: -120.55,
    },
  ];

  const goals = [
    {
      id: "goal_1",
      title: "Emergency Fund",
      progressPercent: 45,
    },
    {
      id: "goal_3",
      title: "Pay Off Credit Card",
      progressPercent: 82,
    },
    {
      id: "goal_4",
      title: "New Laptop",
      progressPercent: 30,
    },
    {
      id: "goal_5",
      title: "Car Down Payment",
      progressPercent: 55,
    },
  ];

  const widgetCardStyle = "shadow-lg p-4 rounded-md bg-white";

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
      <div className="flex items-stretch gap-2 h-[310px] max-h-[315px]">
        {/* Balance Budget Widget */}
        <div
          className={`balance-budget-snapshot flex flex-col ${widgetCardStyle} w-3/4`}
        >
          {/* Widget Title */}
          <h2 className="widget-title relative text-lg font-serifDisplay mb-3">
            Balances
            <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
          </h2>

          <div className="balance-snapshot flex items-center flex-1">
            {/* Left Side */}
            <div className="left-side-balance-snapshot flex-1 space-y-4 gap-2 flex flex-col">
              <div className="remaining-balance bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between gap-2 p-2">
                <h3>Remaining: </h3>
                <p className="text-blue-500 font-bold text-lg">$800</p>
              </div>
              <div className="income-balance bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between gap-2 p-2">
                <h3>Income: </h3>
                <p className="text-green-500 font-bold text-lg">$3,000</p>
              </div>
              <div className="expenses bg-gray-50 border border-gray-100 rounded-md flex items-center justify-between gap-2 p-2">
                <h3>Expenses:</h3>
                <p className="text-amber-500 font-bold text-lg">$2,200</p>
              </div>
            </div>

            {/* Right Side - Pie Chart */}
            <div className="right-side-pie-chart flex-1 items-center justify-center flex">
              <BudgetPie />
            </div>
          </div>

          {/* View Budget Link */}
          <a
            href="/budget"
            className="text-xs mt-auto pt-4 font-medium text-emerald-600 hover:text-emerald-700 transition"
          >
            View Budget
          </a>
        </div>

        {/* Recent Transactions */}
        <div
          className={`recent-transaction-widget relative flex flex-col ${widgetCardStyle} w-1/4`}
        >
          {/* Widget Title */}
          <h2 className="widget-title mt-auto relative text-lg font-serifDisplay mb-3">
            Recent Activity
            <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
          </h2>
          <div className="overflow-y-auto scrollbar-hide flex-1 pr-2">
            <div className="recent-transactions-list flex flex-col space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.name + transaction.date}
                  className="transaction-item flex items-center justify-between gap-2"
                >
                  <div className="transaction-info flex items-center gap-1">
                    <div
                      className={`transaction-icon w-6 h-6 rounded-full flex items-center justify-center ${
                        transaction.amount > 0
                          ? "bg-green-100 text-green-500"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : "-"}
                    </div>
                    <div className="transaction-details">
                      <p className="transaction-name text-sm font-normal">
                        {transaction.name}
                      </p>
                      <p className="transaction-date text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`transaction-amount font-bold text-xs ${
                      transaction.amount > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    ${Math.abs(transaction.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <a
            href="/transactions"
            className="text-xs mt-auto pt-4 font-medium text-emerald-600 hover:text-emerald-700 transition"
          >
            View all
          </a>
        </div>
      </div>

      {/* AI Chat Widget & Goals List */}
      <div className="flex items-stretch gap-2 h-[310px] max-h-[315px]">
        {/* AI Chat Widget */}
        <div
          className={`ai-chat-widget flex flex-col ${widgetCardStyle} w-3/4`}
        >
          {/* Widget Title */}
          <h2 className="widget-title relative text-lg font-serifDisplay mb-3">
            AI Widget
            <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
          </h2>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto px-2 space-y-3 mb-3">
            {/* Assistant Message */}
            <div className="flex justify-start">
              <div className="bg-gray-100 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[75%]">
                Hi Willyam 👋 I can help analyze your spending or set a goal.
              </div>
            </div>

            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-emerald-500 text-white text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-[75%]">
                I spent $15 on coffee today.
              </div>
            </div>

            {/* Assistant Message */}
            <div className="flex justify-start">
              <div className="bg-gray-100 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[75%]">
                Got it! ☕ I categorized that under Food & Drinks.
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-gray-100 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[75%]">
                Got it! ☕ I categorized that under Food & Drinks.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-gray-100 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[75%]">
                Got it! ☕ I categorized that under Food & Drinks.
              </div>
            </div>
          </div>

          {/* Chat Input Area */}
          <div className="border-t pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-full hover:bg-emerald-700 transition">
              Send
            </button>
          </div>

          {/* View Budget Link */}
          <a
            href="/bw-ai"
            className="text-xs mt-auto pt-4 font-medium text-emerald-600 hover:text-emerald-700 transition"
          >
            Visit AI
          </a>
        </div>

        {/* Goals */}
        <div
          className={`goals-widget relative flex flex-col ${widgetCardStyle} w-1/4`}
        >
          {/* Widget Title */}
          <h2 className="widget-title mt-auto relative text-lg font-serifDisplay mb-3">
            Goals
            <span className="absolute left-0 -bottom-0 w-16 h-[0.15px] bg-black"></span>
          </h2>
          <div className="overflow-y-auto scrollbar-hide flex-1 pr-2">
            <div className="goals-list flex flex-col space-y-3">
              {goals.map((goal) => {
                return (
                  <div className="goal-item flex flex-col gap-1 leading-tight">
                    <p className="font-normal text-sm">{goal.title}</p>
                    {/* Progress Bar */}
                    <div className="progress-bar h-[10px] rounded-md w-full bg-gray-100">
                      <div
                        style={{ width: goal.progressPercent }}
                        className="pl-1 h-full bg-emerald-400 rounded-md"
                      ></div>
                    </div>
                    <p className="text-xs m-0 p-0 text-right text-gray-600">
                      {goal.progressPercent}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <a
            href="/goals"
            className="text-xs mt-auto pt-4 font-medium text-emerald-600 hover:text-emerald-700 transition"
          >
            View all
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
