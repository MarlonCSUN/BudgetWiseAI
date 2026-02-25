import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { mockTransactions } from "data/mockTransactions";
import { applyTransactionFilters } from "../utils/transactionFilters";
import DateInput from "components/transactions/DateInput";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  const filteredTransactions = useMemo(() => {
    return applyTransactionFilters(mockTransactions, {
      search,
      category,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      sortBy,
      sortDirection,
    });
  }, [
    mockTransactions,
    search,
    category,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    sortBy,
    sortDirection,
  ]);

  const categories = [
    "All",
    ...new Set(mockTransactions.map((t) => t.category)),
  ];

  return (
    <div className="py-8 px-4 gap-6 flex flex-col">
      {/* Page Header */}
      <div>
        <h1 className="page-title font-serifDisplay text-3xl">Transactions</h1>
      </div>

      {/* Month + Download */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-serifBody text-gray-500">November</h2>

        <div className="flex gap-3 items-center">
          <button className="font-serifBody bg-white shadow-sm cursor-pointer rounded-lg px-4 py-1 flex gap-1 items-center">
            Download
            <Download className="h-4 w-4" />
          </button>

          <select className="font-serifBody bg-white shadow-sm cursor-pointer rounded-sm p-1">
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">EXCEL</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        <h3 className="font-serifBody font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="border px-2 py-1 rounded-md text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-2 py-1 rounded-md text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-28">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              $
            </span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              className="border pl-5 pr-2 py-1 rounded-md text-sm w-full"
              value={minAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || Number(value) >= 0) {
                  setMinAmount(value);
                }
              }}
            />
          </div>

          <div className="relative flex-1 min-w-28">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              $
            </span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              className="border pl-5 pr-2 py-1 rounded-md text-sm w-full"
              value={maxAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || Number(value) >= 0) {
                  setMaxAmount(value);
                }
              }}
            />
          </div>

          <input
            type="date"
            className="border px-2 py-1 rounded-md text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="border px-2 py-1 rounded-md text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <DateInput />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm uppercase tracking-wide">
            <tr>
              <th
                className="px-4 py-3 cursor-pointer"
                onClick={() => {
                  setSortBy("date");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                Date
              </th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th
                className="px-4 py-3 cursor-pointer"
                onClick={() => {
                  setSortBy("amount");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{t.date}</td>
                  <td className="px-4 py-3">{t.description}</td>
                  <td className="px-4 py-3">{t.category}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      t.type === "expense" ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    ${t.amount.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
