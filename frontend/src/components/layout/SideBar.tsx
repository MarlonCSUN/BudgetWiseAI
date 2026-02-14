import {
  ChevronLeft,
  LayoutDashboard,
  Receipt,
  Target,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}) {
  return (
    <aside
      className={clsx(
        "h-full bg-white shadow-md transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between p-6 border-b">
        {!collapsed && (
          <h2 className="text-xl font-semibold text-gray-800">BudgetWise AI</h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ChevronLeft
            className={clsx(
              "w-5 h-5 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon={<LayoutDashboard />}
          label="Dashboard"
          collapsed={collapsed}
        />
        <NavItem
          icon={<Receipt />}
          label="Transactions"
          collapsed={collapsed}
        />
        <NavItem icon={<Target />} label="Goals" collapsed={collapsed} />
        <NavItem
          icon={<Sparkles />}
          label="AI Insights"
          collapsed={collapsed}
        />
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t text-sm text-gray-500">
        {!collapsed && "© 2026 BudgetWise"}
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition">
      <div className="text-gray-600">{icon}</div>
      {!collapsed && <span className="text-gray-700 font-medium">{label}</span>}
    </div>
  );
}
