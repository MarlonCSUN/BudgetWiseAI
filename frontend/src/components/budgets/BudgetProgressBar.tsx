import { useState, useRef, useEffect, useLayoutEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TabsProps<T extends string> {
  tabs: T[];
  defaultTab?: T;
  onChange?: (tab: T) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Tabs<T extends string>({ tabs, defaultTab, onChange }: TabsProps<T>) {
  const [active, setActive] = useState<T>(defaultTab ?? tabs[0]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Measure and reposition the indicator whenever active tab changes
  useLayoutEffect(() => {
    const idx = tabs.indexOf(active);
    const el = tabRefs.current[idx];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [active, tabs]);

  const handleClick = (tab: T) => {
    setActive(tab);
    onChange?.(tab);
  };

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {/* Tab bar */}
      <div
        role="tablist"
        style={{
          position: "relative",
          display: "inline-flex",
          gap: 0,
          borderBottom: "1.5px solid #e4e4e7",
        }}
      >
        {tabs.map((tab, i) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              onClick={() => handleClick(tab)}
              style={{
                position: "relative",
                padding: "10px 20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#18181b" : "#71717a",
                letterSpacing: "0.01em",
                transition: "color 0.2s ease",
                outline: "none",
                // Prevent layout shift when weight changes
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {/* Invisible bold clone to reserve space and prevent width shift */}
              <span
                aria-hidden
                style={{
                  display: "block",
                  fontWeight: 600,
                  visibility: "hidden",
                  height: 0,
                  overflow: "hidden",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {tab}
              </span>
              <span
                style={{
                  position: "absolute",
                  inset: "0 0 0 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tab}
              </span>
            </button>
          );
        })}

        {/* Sliding indicator */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: -1.5,
            height: 2,
            background: "#18181b",
            borderRadius: 2,
            left: indicator.left,
            width: indicator.width,
            transition:
              "left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        style={{
          padding: "20px 0 0",
          color: "#52525b",
          fontSize: "0.875rem",
          lineHeight: 1.6,
        }}
      >
        {active} content goes here.
      </div>
    </div>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div
      style={{
        padding: 48,
        display: "flex",
        flexDirection: "column",
        gap: 56,
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* Demo 1 — short tabs */}
      <section>
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#a1a1aa",
            marginBottom: 16,
            fontFamily: "Georgia, serif",
          }}
        >
          Short labels
        </p>
        <Tabs tabs={["Net", "Income", "Expense"]} />
      </section>

      {/* Demo 2 — unequal widths */}
      <section>
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#a1a1aa",
            marginBottom: 16,
            fontFamily: "Georgia, serif",
          }}
        >
          Unequal widths
        </p>
        <Tabs
          tabs={["Overview", "Transactions", "Analytics", "Settings"]}
          defaultTab="Transactions"
        />
      </section>

      {/* Demo 3 — two tabs */}
      <section>
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#a1a1aa",
            marginBottom: 16,
            fontFamily: "Georgia, serif",
          }}
        >
          Two tabs
        </p>
        <Tabs tabs={["Monthly", "Yearly"]} />
      </section>
    </div>
  );
}
