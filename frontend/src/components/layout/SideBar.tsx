import {
  ChevronLeft,
  LayoutDashboard,
  Receipt,
  Target,
  Sparkles,
  PieChart,
  HandCoins,
  Settings,
  Moon,
} from "lucide-react";
import clsx from "clsx";
import LogoIcon from "../Icons/LogoIcon";
import { NavLink } from "react-router-dom";

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
      <div className="flex items-center justify-between p-4 pt-6 border-b">
        {/* Left Group */}
        <div className="flex items-center gap-2">
          <LogoIcon className="w-9 h-9 text-emerald-600 flex-shrink-0" />

          {!collapsed && (
            <h2 className="text-2xl text-gray-800 font-serifDisplay whitespace-nowrap">
              Budget
              <span className="text-emerald-600">Wise AI</span>
            </h2>
          )}
        </div>

        {/* Right Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-[0.3rem] rounded-lg hover:bg-gray-100 transition"
        >
          <ChevronLeft
            className={clsx(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* User Info */}
      <div className={clsx("flex", collapsed ? "justify-center" : "p-4")}>
        <div className="flex justify-between p-3 gap-2">
          <img
            src="https://gameinformer.com/sites/default/files/styles/content_header_l/public/2026/02/12/99c4e6d7/johnwick01.jpg.webp"
            alt="User Avatar"
            className={clsx("rounded-full object-cover ring-2 ring-emerald-100", collapsed ? "w-8 h-8" : "w-10 h-10")}
          />
          {!collapsed && (
            <div className="flex flex-col leading-3">
              <p className="text-lg font-semibold font-serifDisplay text-gray-700">John Doe</p>
              <span className="font-serifBody text-gray-600">Lvl 10</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon={<LayoutDashboard />}
          to="/dashboard"
          label="Dashboard"
          collapsed={collapsed}
        />
        <NavItem
          icon={<PieChart />}
          to="/budget"
          label="Budget"
          collapsed={collapsed}
        />
        <NavItem
          icon={<Receipt />}
          to="/transactions"
          label="Transactions"
          collapsed={collapsed}
        />
        <NavItem
          icon={<Target />}
          to="/goals"
          label="Goals"
          collapsed={collapsed}
        />
        <NavItem
          icon={<HandCoins />}
          to="/rewards"
          label="Rewards"
          collapsed={collapsed}
        />
        <NavItem
          icon={<Sparkles />}
          to="/bw-ai"
          label="AI Insights"
          collapsed={collapsed}
        />
      </nav>

      {/* Bottom Utility Section */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <NavItem
          icon={<Settings />}
          to="/settings"
          label="Settings"
          collapsed={collapsed}
        />

        {/* Theme Toggle */}
        <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition">
          <Moon className="w-5 h-5" />
          {!collapsed && <span>Dark Mode</span>}
        </button>

        {/* Add Transaction CTA */}
        <button className="w-full bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition">
          {!collapsed ? "+ Add Transaction" : "+"}
        </button>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t text-sm text-gray-500">
        {!collapsed && "© 2026 BudgetWise"}
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  to,
  label,
  collapsed,
}: {
  icon: React.ReactNode;
  to: string;
  label: string;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 p-3 rounded-lg transition",
          isActive
            ? "text-emerald-600 bg-emerald-50"
            : "text-gray-600 hover:bg-gray-100"
        )
      }
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>

  );
}
