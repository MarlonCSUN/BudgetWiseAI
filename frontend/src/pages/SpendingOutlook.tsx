import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';

interface Transaction {
  category: string;
  amount: number;
  transaction_type: string;
  date: string;
  merchant: string;
}

interface Budget {
  category: string;
  spent: number;
  limit: number;
  is_over_budget: boolean;
  percentage_used: number;
}

const COLORS = ['#34d399', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#06b6d4'];

const parseSection = (text: string, heading: string): string[] => {
  const regex = new RegExp(`${heading}:\\s*([\\s\\S]*?)(?=\\n[A-Z ]+:|$)`, 'i');
  const match = text.match(regex);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(l => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(l => l.length > 0 && l !== 'None');
};

const BulletList: React.FC<{ items: string[]; color?: string }> = ({ items, color = '#d1fae5' }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
        <span style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }}>•</span>
        <span style={{ color, fontSize: '13px', lineHeight: '1.6' }}>{item}</span>
      </li>
    ))}
  </ul>
);

const SpendingOutlook: React.FC = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [outlook, setOutlook] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingOutlook, setLoadingOutlook] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchData();
    fetchBoth();
  }, []);

  const fetchData = async () => {
    try {
      const [txnRes, budgetRes] = await Promise.all([
        api.get('/transactions/', { params: { limit: 200 } }),
        api.get('/budgets/'),
      ]);
      setTransactions(txnRes.data);
      setBudgets(budgetRes.data);
    } catch {
      // silently fail
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBoth = async () => {
    setLoadingAnalysis(true);
    setLoadingOutlook(true);

    api.get('/ai/spending-analysis')
      .then(res => setAnalysis(res.data.analysis))
      .catch(() => setAnalysis('Unable to load analysis.'))
      .finally(() => setLoadingAnalysis(false));

    api.get('/ai/spending-outlook')
      .then(res => setOutlook(res.data.outlook))
      .catch(() => setOutlook('Unable to load outlook.'))
      .finally(() => setLoadingOutlook(false));
  };

  // Build category spending chart data
  const categoryData = React.useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.filter(t => t.transaction_type === 'expense').forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, amount]) => ({ category: category.length > 10 ? category.slice(0, 10) + '…' : category, amount: parseFloat(amount.toFixed(2)) }));
  }, [transactions]);

  // Build monthly trend data
  const monthlyData = React.useMemo(() => {
    const months: Record<string, number> = {};
    transactions.filter(t => t.transaction_type === 'expense').forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months[month] = (months[month] || 0) + t.amount;
    });
    return Object.entries(months)
      .slice(-6)
      .map(([month, total]) => ({ month, total: parseFloat(total.toFixed(2)) }));
  }, [transactions]);

  // Build budget pie data
  const budgetPieData = React.useMemo(() => {
    return budgets.map(b => ({ name: b.category, value: parseFloat(b.spent.toFixed(2)), limit: b.limit }));
  }, [budgets]);

  const totalSpent = transactions.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + t.amount, 0);

  const analysisInsights = analysis ? parseSection(analysis, 'INSIGHTS') : [];
  const analysisWarnings = analysis ? parseSection(analysis, 'WARNINGS') : [];
  const analysisRecs = analysis ? parseSection(analysis, 'RECOMMENDATIONS') : [];
  const outlookForecast = outlook ? parseSection(outlook, 'FORECAST') : [];
  const outlookGoals = outlook ? parseSection(outlook, 'GOAL PROGRESS') : [];
  const outlookSteps = outlook ? parseSection(outlook, 'NEXT STEPS') : [];

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '24px',
    border: '1px solid rgba(52,211,153,0.08)',
  };

  const sectionLabel: React.CSSProperties = {
    color: '#4b7a64', fontSize: '10px', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '1px',
    margin: '0 0 10px 0',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
            Spending Outlook
          </h1>
          <p style={{ color: '#4b7a64', margin: '4px 0 0 0', fontSize: '14px' }}>
            AI-powered spending forecasts and trends
          </p>
        </div>
        <button onClick={() => { fetchData(); fetchBoth(); }} style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #059669, #34d399)',
          color: '#fff', border: 'none', borderRadius: '8px',
          cursor: 'pointer', fontSize: '14px', fontWeight: '600',
        }}>
          ↻ Refresh
        </button>
      </div>

      {/* Top stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, color: '#f87171' },
          { label: 'Transactions', value: transactions.filter(t => t.transaction_type === 'expense').length, color: '#f0fdf4' },
          { label: 'Active Budgets', value: budgets.length, color: '#34d399' },
        ].map(stat => (
          <div key={stat.label} style={cardStyle}>
            <p style={sectionLabel}>{stat.label}</p>
            <p style={{ color: stat.color as string, fontSize: '24px', fontWeight: '700', margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

        {/* Spending by Category Bar Chart */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span>📊</span>
            <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>Spending by Category</h2>
          </div>
          {loadingData ? (
            <p style={{ color: '#4b7a64', fontSize: '13px' }}>Loading...</p>
          ) : categoryData.length === 0 ? (
            <p style={{ color: '#4b7a64', fontSize: '13px' }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="category" tick={{ fill: '#4b7a64', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b7a64', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1f15', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', color: '#f0fdf4' }}
                  formatter={(value: any) => [`$${value}`, 'Spent']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Trend Line Chart */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span>📈</span>
            <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>Monthly Spending Trend</h2>
          </div>
          {loadingData ? (
            <p style={{ color: '#4b7a64', fontSize: '13px' }}>Loading...</p>
          ) : monthlyData.length === 0 ? (
            <p style={{ color: '#4b7a64', fontSize: '13px' }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#4b7a64', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b7a64', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1f15', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', color: '#f0fdf4' }}
                  formatter={(value: any) => [`$${value}`, 'Spent']}
                />
                <Line type="monotone" dataKey="total" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Budget usage + Pie */}
      {budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

          {/* Budget bars */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span>💰</span>
              <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>Budget Usage</h2>
            </div>
            {budgets.map(b => (
              <div key={b.category} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ color: '#d1fae5', fontSize: '12px' }}>{b.category}</span>
                  <span style={{ color: b.is_over_budget ? '#f87171' : '#4b7a64', fontSize: '12px' }}>
                    ${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#0d1f15', borderRadius: '3px' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(b.percentage_used, 100)}%`,
                    backgroundColor: b.is_over_budget ? '#ef4444' : b.percentage_used > 80 ? '#f59e0b' : '#34d399',
                    borderRadius: '3px',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Pie chart */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span>🥧</span>
              <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>Spending Distribution</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={budgetPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {budgetPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1f15', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', color: '#f0fdf4' }}
                    formatter={(value: any) => [`$${value}`, 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {budgetPieData.map((entry, i) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ color: '#d1fae5', fontSize: '11px' }}>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Spending Analysis */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span>🤖</span>
            <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>AI Spending Analysis</h2>
          </div>
          {loadingAnalysis ? (
            <p style={{ color: '#4b7a64', fontSize: '13px' }}>Analyzing your spending...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {analysisInsights.length > 0 && (
                <div>
                  <p style={sectionLabel}>Key Insights</p>
                  <BulletList items={analysisInsights} />
                </div>
              )}
              {analysisWarnings.length > 0 && (
                <div>
                  <p style={sectionLabel}>⚠ Warnings</p>
                  <BulletList items={analysisWarnings} color="#f87171" />
                </div>
              )}
              {analysisRecs.length > 0 && (
                <div>
                  <p style={sectionLabel}>Recommendations</p>
                  <BulletList items={analysisRecs} color="#34d399" />
                </div>
              )}
              {analysisInsights.length === 0 && analysisWarnings.length === 0 && analysisRecs.length === 0 && (
                <p style={{ color: '#d1fae5', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{analysis}</p>
              )}
            </div>
          )}
        </div>

        {/* Spending Forecast */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span>🔮</span>
            <h2 style={{ color: '#f0fdf4', fontSize: '14px', fontWeight: '600', margin: 0 }}>AI Forecast</h2>
          </div>
          {loadingOutlook ? (
            <p style={{ color: '#4b7a64', fontSize: '13px' }}>Generating forecast...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {outlookForecast.length > 0 && (
                <div>
                  <p style={sectionLabel}>Forecast</p>
                  <BulletList items={outlookForecast} />
                </div>
              )}
              {outlookGoals.length > 0 && (
                <div>
                  <p style={sectionLabel}>Goal Progress</p>
                  <BulletList items={outlookGoals} color="#f59e0b" />
                </div>
              )}
              {outlookSteps.length > 0 && (
                <div>
                  <p style={sectionLabel}>Next Steps</p>
                  <BulletList items={outlookSteps} color="#34d399" />
                </div>
              )}
              {outlookForecast.length === 0 && outlookGoals.length === 0 && outlookSteps.length === 0 && (
                <p style={{ color: '#d1fae5', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>{outlook}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendingOutlook;