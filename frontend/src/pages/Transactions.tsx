import { Download } from "lucide-react";
import React from "react";

const Transactions = () => {
  return (
    <div className="py-8 px-4 gap-4 flex flex-col">
      <div>
        <h1 className="page-title font-serifDisplay">Transactions</h1>
      </div>

      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-serifBody text-gray-500">November</h2>
        <button className="font-serifBody bg-white shadow-sm cursor-pointer rounded-sm px-4 py-1 flex gap-1 items-ce">
          Download
          <Download className="h-4 w-4" />
        </button>
      </div>

      <div>
        <h2>All</h2>
        <div className="filters">
          <div className="keyword-filter"></div>
          <div className="category-filter"></div>
          <div className="amount-filter"></div>
          <div className="date-filter"></div>
        </div>
        <div className="transaction-display-table"></div>
        <div className="new-transaction-input"></div>
      </div>
    </div>
  );
};

export default Transactions;
