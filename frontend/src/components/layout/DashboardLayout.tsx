import { useState } from "react";
import Sidebar from "./SideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
