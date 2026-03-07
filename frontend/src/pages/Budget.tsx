import BudgetTab, { Tab } from "components/budgets/BudgetTab";
import React, { useRef, useState, useEffect, useLayoutEffect } from "react";

interface IndicatorStyle {
  left: number;
  width: number;
}

const TABS: Tab[] = [
  { label: "Net" },
  { label: "Expense" },
  { label: "Income" },
];

const Budget: React.FC = () => {
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({
    left: 0,
    width: 0,
  });
  const [activeTab, setActiveTab] = useState(0);

  // Measure and reposition the indicator whenever active tab changes
  useLayoutEffect(() => {
    const activeTabElement = tabsRef.current[activeTab];
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  return (
    <div className="py-8 px-4 gap-4 flex flex-col">
      <div>
        <h1 className="page-title font-serifDisplay">Budget</h1>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {/* Net, Income, Expenses Tabs */}
        <div className="relative">
          <ul className="flex space-x-2 text-sm font-bold" role="tablist">
            {TABS.map((tab, index) => (
              <BudgetTab
                key={index}
                tab={tab}
                index={index}
                isActive={activeTab === index}
                onClick={() => setActiveTab(index)}
                ref={(el) => {
                  tabsRef.current[index] = el;
                }}
              />
            ))}
          </ul>

          <div
            className="absolute bottom-0 h-0.5 bg-secondary transition-all duration-300"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </div>

        {/* Pie Chart & Expected v Actual Widget */}
        <div></div>

        {/* Transaction List & AI Widget */}
        <div></div>
      </div>
    </div>
  );
};

export default Budget;
