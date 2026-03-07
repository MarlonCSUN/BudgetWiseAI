import { useRef, useState } from "react";

export interface Tab {
  label: string;
}

interface TabProps {
  tab: Tab;
  index: number;
  isActive: boolean;
  onClick: () => void;
  ref: (el: HTMLLIElement | null) => void;
}

const BudgetTab = ({ tab, index, isActive, onClick, ref }: TabProps) => (
  <li
    key={index}
    ref={ref}
    role="tab"
    aria-selected={isActive}
    aria-controls={`tab-panel-${index}`}
    tabIndex={isActive ? 0 : -1}
    className="relative"
    onClick={onClick}
  >
    <div
      className={`
        block px-4 py-2 
        transition-colors duration-200 
        cursor-pointer
        ${
          isActive
            ? "text-black"
            : "text-zinc-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
        }
      `}
    >
      {tab.label}
    </div>
  </li>
);

export default BudgetTab;
