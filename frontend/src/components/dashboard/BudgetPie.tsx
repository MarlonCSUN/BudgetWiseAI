import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Rent", value: 500, fill: "#10b981" },
  { name: "Food", value: 300, fill: "#3b82f6" },
  { name: "Entertainment", value: 100, fill: "#f59e0b" },
  { name: "Utilities", value: 100, fill: "#ef4444" },
];

export default function BudgetPie() {
  return (
    <ResponsiveContainer width={220} height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
        />

        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
