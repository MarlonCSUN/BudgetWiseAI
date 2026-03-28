import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import transactionService, {
  Transaction,
} from "../services/transaction.service";
import budgetService from "../services/budget.service";
import goalService from "../services/goal.service";
import { Budget } from "../types/budget.types";
import { Goal } from "../types/goal.types";
import api from "../services/api";
import { useNotifications } from "../context/NotificationContext";

// Constants

const CATEGORY_COLORS: Record<string, string> = {
  Shopping: "#6366f1",
  Food: "#f59e0b",
  Utilities: "#3b82f6",
  Entertainment: "#8b5cf6",
  Transportation: "#10b981",
  Healthcare: "#ef4444",
  Education: "#06b6d4",
  Income: "#22c55e",
  Other: "#6b7280",
};

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatUSD(value: number, decimals = 2): string {
  return Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Reusable UI Components

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-[#0c1a0f] rounded-xl p-5 border border-emerald-400/[0.08] ${className}`}
  >
    {children}
  </div>
);

const SectionHeader: React.FC<{
  label: string;
  linkLabel?: string;
  onLink?: () => void;
}> = ({ label, linkLabel, onLink }) => (
  <div className="flex justify-between items-center mb-1 w-full">
    <p className="text-[#4b7a64] text-xs font-semibold uppercase tracking-widest m-0">
      {label}
    </p>
    {linkLabel && onLink && (
      <button
        onClick={onLink}
        className="bg-transparent border-0 text-emerald-400 text-xs cursor-pointer p-0 hover:text-emerald-300 transition-colors"
      >
        {linkLabel}
      </button>
    )}
  </div>
);

const ProgressBar: React.FC<{ pct: number; colorClass: string }> = ({
  pct,
  colorClass,
}) => (
  <div className="w-full h-1.5 bg-[#0d1f15] rounded-full">
    <div
      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
      style={{ width: `${Math.min(pct, 100)}%` }}
    />
  </div>
);

const EmptyState: React.FC<{
  message: string;
  cta: string;
  onClick: () => void;
}> = ({ message, cta, onClick }) => (
  <div className="mt-4">
    <p className="text-[#4b7a64] text-sm mb-3">{message}</p>
    <button
      onClick={onClick}
      className="px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-md text-emerald-400 text-xs font-medium cursor-pointer hover:bg-emerald-400/20 transition-colors"
    >
      {cta}
    </button>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [bal, txns, bdgs, gls] = await Promise.all([
        transactionService.getBalance(),
        transactionService.getTransactions({ limit: 5 }),
        budgetService.getBudgets(),
        goalService.getGoals(undefined, false),
      ]);
      setBalance(bal);
      setTransactions(txns);
      setBudgets(bdgs);
      setGoals(gls);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTopCategories = () => {
    const allTxns = transactions.filter(
      (t) => t.transaction_type === "expense",
    );
    const categoryTotals: Record<string, number> = {};
    allTxns.forEach((t) => {
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const topCategories = getTopCategories();
  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalMonthlySpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <div style={{ color: "#4b7a64", fontSize: "15px" }}>
          Loading dashboard...
        </div>
      </div>
    );

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            color: "#f0fdf4",
            fontSize: "26px",
            fontWeight: "700",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Good {getTimeOfDay()}, {user?.first_name} 👋
        </h1>
        <p style={{ color: "#4b7a64", margin: "4px 0 0 0", fontSize: "14px" }}>
          Here's your financial overview
        </p>
      </div>

      {/* Top row — Balance + Monthly Budget */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <Card>
          <SectionHeader label="Total Balance" />
          <p
            style={{
              color: balance >= 0 ? "#34d399" : "#f87171",
              fontSize: "36px",
              fontWeight: "800",
              margin: "8px 0 0 0",
              letterSpacing: "-1px",
            }}
          >
            {balance < 0 ? "-" : ""}${formatUSD(balance)}
          </p>
          <p
            style={{ color: "#4b7a64", fontSize: "12px", margin: "6px 0 0 0" }}
          >
            Across all accounts
          </p>
        </Card>

        <Card>
          <SectionHeader label="Monthly Budget" />
          <p
            style={{
              color: "#f0fdf4",
              fontSize: "28px",
              fontWeight: "700",
              margin: "8px 0 4px 0",
              letterSpacing: "-0.5px",
            }}
          >
            ${totalMonthlySpent.toFixed(2)}
            <span
              style={{ color: "#4b7a64", fontSize: "16px", fontWeight: "400" }}
            >
              {" "}
              / ${totalMonthlyBudget.toFixed(2)}
            </span>
          </p>
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "#0d1f15",
              borderRadius: "3px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min((totalMonthlySpent / totalMonthlyBudget) * 100 || 0, 100)}%`,
                backgroundColor:
                  totalMonthlySpent > totalMonthlyBudget
                    ? "#ef4444"
                    : "#34d399",
                borderRadius: "3px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <p
            style={{ color: "#4b7a64", fontSize: "12px", margin: "6px 0 0 0" }}
          >
            {budgets.length} active budgets ·{" "}
            {budgets.filter((b) => b.is_over_budget).length} over limit
          </p>
        </Card>
      </div>

      {/* Second row — Top Categories + Recent Transactions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <div style={cardHeaderStyle}>
            <SectionHeader
              label="Top Spending"
              linkLabel="View all →"
              onLink={() => navigate("/activity")}
            />
          </div>
          {topCategories.length === 0 ? (
            <p
              style={{ color: "#4b7a64", fontSize: "13px", marginTop: "16px" }}
            >
              No expense data yet
            </p>
          ) : (
            topCategories.map(([cat, amount]) => {
              const maxAmount = topCategories[0][1];
              return (
                <div key={cat} style={{ marginTop: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: CATEGORY_COLORS[cat] || "#6b7280",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "#d1fae5", fontSize: "13px" }}>
                        {cat}
                      </span>
                    </div>
                    <span
                      style={{
                        color: "#f0fdf4",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "4px",
                      backgroundColor: "#0d1f15",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(amount / maxAmount) * 100}%`,
                        backgroundColor: CATEGORY_COLORS[cat] || "#6b7280",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </Card>

        <Card>
          <SectionHeader
            label="Recent Transactions"
            linkLabel="View all →"
            onLink={() => navigate("/activity")}
          />
          {transactions.length === 0 ? (
            <p
              style={{ color: "#4b7a64", fontSize: "13px", marginTop: "16px" }}
            >
              No transactions yet
            </p>
          ) : (
            transactions.slice(0, 5).map((txn) => (
              <div
                key={txn.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#d1fae5",
                      fontSize: "13px",
                      fontWeight: "500",
                      margin: 0,
                    }}
                  >
                    {txn.merchant}
                  </p>
                  <p
                    style={{
                      color: "#4b7a64",
                      fontSize: "11px",
                      margin: "2px 0 0 0",
                    }}
                  >
                    {txn.category} ·{" "}
                    {new Date(txn.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color:
                      txn.transaction_type === "income" ? "#34d399" : "#f87171",
                  }}
                >
                  {txn.transaction_type === "income" ? "+" : "-"}$
                  {Math.abs(txn.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Third row — Budgets + Goals */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader
            label="Budget Progress"
            linkLabel="Manage →"
            onLink={() => navigate("/budgets")}
          />
          {budgets.length === 0 ? (
            <div style={{ marginTop: "16px" }}>
              <p
                style={{
                  color: "#4b7a64",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                No budgets created yet
              </p>
              <button
                onClick={() => navigate("/budgets")}
                style={actionButtonStyle}
              >
                Create Budget
              </button>
            </div>
          ) : (
            budgets.slice(0, 4).map((b) => (
              <div key={b.id} style={{ marginTop: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span style={{ color: "#d1fae5", fontSize: "12px" }}>
                    {b.category}
                  </span>
                  <span
                    style={{
                      color: b.is_over_budget ? "#f87171" : "#4b7a64",
                      fontSize: "12px",
                    }}
                  >
                    ${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "5px",
                    backgroundColor: "#0d1f15",
                    borderRadius: "3px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(b.percentage_used, 100)}%`,
                      backgroundColor: b.is_over_budget
                        ? "#ef4444"
                        : b.percentage_used > 80
                          ? "#f59e0b"
                          : "#34d399",
                      borderRadius: "3px",
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </Card>

        <Card>
          <SectionHeader
            label="Savings Goals"
            linkLabel="Manage →"
            onLink={() => navigate("/goals")}
          />
          {goals.length === 0 ? (
            <div style={{ marginTop: "16px" }}>
              <p
                style={{
                  color: "#4b7a64",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                No goals created yet
              </p>
              <button
                onClick={() => navigate("/goals")}
                style={actionButtonStyle}
              >
                Create Goal
              </button>
            </div>
          ) : (
            goals.slice(0, 3).map((g) => (
              <div key={g.id} style={{ marginTop: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      color: "#d1fae5",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {g.name}
                  </span>
                  <span style={{ color: "#4b7a64", fontSize: "12px" }}>
                    {(g.percentage_complete ?? 0).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "5px",
                    backgroundColor: "#0d1f15",
                    borderRadius: "3px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(g.percentage_complete ?? 0, 100)}%`,
                      backgroundColor: "#34d399",
                      borderRadius: "3px",
                    }}
                  />
                </div>
                <p
                  style={{
                    color: "#4b7a64",
                    fontSize: "11px",
                    margin: "4px 0 0 0",
                  }}
                >
                  ${(g.current_amount ?? 0).toFixed(0)} of $
                  {(g.target_amount ?? 0).toFixed(0)} ·{" "}
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(g.target_date).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )}
                  d left
                </p>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  color: "#4b7a64",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  margin: 0,
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "4px",
};

const linkButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#34d399",
  fontSize: "12px",
  cursor: "pointer",
  padding: 0,
};

const actionButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "rgba(52, 211, 153, 0.1)",
  border: "1px solid rgba(52, 211, 153, 0.2)",
  borderRadius: "6px",
  color: "#34d399",
  fontSize: "13px",
  cursor: "pointer",
  fontWeight: "500",
};

export default Dashboard;
