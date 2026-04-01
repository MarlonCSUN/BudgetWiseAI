import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at: string | null;
  category: string;
}

interface RewardsData {
  badges: Badge[];
  total_earned: number;
  total_badges: number;
  points: number;
}

const CATEGORY_ORDER = ['Transactions', 'Budgets', 'Goals'];

const CATEGORY_COLORS: Record<string, { accent: string; glow: string; bg: string }> = {
  Transactions: { accent: '#34d399', glow: 'rgba(52,211,153,0.3)', bg: 'rgba(52,211,153,0.06)' },
  Budgets:      { accent: '#60a5fa', glow: 'rgba(96,165,250,0.3)', bg: 'rgba(96,165,250,0.06)' },
  Goals:        { accent: '#f59e0b', glow: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.06)' },
};

const getLevel = (points: number) => {
  const level = Math.floor(points / 100) + 1;
  const xp = points % 100;
  return { level, xp };
};

const XPBar: React.FC<{ xp: number; animated: boolean }> = ({ xp, animated }) => {
  const [width, setWidth] = useState(0);
  const [shining, setShining] = useState(false);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setWidth(xp);
        // Trigger shine after bar finishes filling
        setTimeout(() => setShining(true), 1500);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setWidth(xp);
    }
  }, [xp, animated]);

  return (
    <div style={{
      width: '100%', height: '10px',
      backgroundColor: '#0d1f15',
      borderRadius: '5px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        height: '100%',
        width: `${width}%`,
        background: 'linear-gradient(90deg, #059669, #34d399, #6ee7b7)',
        borderRadius: '5px',
        transition: animated ? 'width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: width > 0 ? '0 0 12px rgba(52,211,153,0.5)' : 'none',
      }}>
        {/* Shine sweep after fill */}
        {shining && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
            animation: 'xpShine 0.7s ease forwards',
          }} />
        )}
      </div>
    </div>
  );
};

const BadgeCard: React.FC<{ badge: Badge; index: number; categoryColor: typeof CATEGORY_COLORS[string] }> = ({ badge, index, categoryColor }) => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  // Entry spin for earned badges
  useEffect(() => {
    if (badge.earned && visible) {
      const timer = setTimeout(() => {
        setSpinning(true);
        setTimeout(() => setSpinning(false), 600);
      }, index * 80 + 300);
      return () => clearTimeout(timer);
    }
  }, [visible, badge.earned]);

  const handleMouseEnter = () => {
    setHovered(true);
    if (badge.earned) {
      setSpinning(true);
      setTimeout(() => setSpinning(false), 600);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered && badge.earned ? categoryColor.bg : '#0c1a0f',
        borderRadius: '14px',
        padding: '20px',
        border: `1px solid ${badge.earned
          ? hovered ? categoryColor.accent : 'rgba(52,211,153,0.15)'
          : 'rgba(255,255,255,0.04)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        opacity: visible ? (badge.earned ? 1 : 0.4) : 0,
        transform: visible ? (hovered && badge.earned ? 'translateY(-2px)' : 'translateY(0)') : 'translateY(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: hovered && badge.earned ? `0 8px 24px ${categoryColor.glow}` : 'none',
        cursor: badge.earned ? 'default' : 'not-allowed',
      }}
    >
      {/* Icon with spin */}
      <div style={{
        fontSize: '34px',
        flexShrink: 0,
        filter: badge.earned ? 'none' : 'grayscale(1) brightness(0.4)',
        animation: spinning ? 'spinBadge 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '52px', height: '52px',
        backgroundColor: badge.earned ? categoryColor.bg : 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: badge.earned ? `1px solid ${categoryColor.glow}` : '1px solid rgba(255,255,255,0.04)',
      }}>
        {badge.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <p style={{
            color: badge.earned ? '#f0fdf4' : '#4b7a64',
            fontSize: '14px', fontWeight: '700', margin: 0,
            letterSpacing: '-0.2px',
          }}>
            {badge.name}
          </p>
          {badge.earned && (
            <span style={{
              backgroundColor: categoryColor.bg,
              color: categoryColor.accent,
              fontSize: '9px', fontWeight: '800',
              padding: '2px 7px', borderRadius: '8px',
              textTransform: 'uppercase', letterSpacing: '0.8px',
              border: `1px solid ${categoryColor.glow}`,
              flexShrink: 0,
            }}>✓</span>
          )}
        </div>
        <p style={{ color: '#4b7a64', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
          {badge.description}
        </p>
        {badge.earned && badge.earned_at && (
          <p style={{ color: '#2d4a38', fontSize: '10px', margin: '5px 0 0 0' }}>
            {new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
};

const Rewards: React.FC = () => {
  const [data, setData] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await api.get<RewardsData>('/rewards');
        setData(response.data);
        setTimeout(() => setAnimated(true), 100);
      } catch {
        setError('Failed to load rewards');
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#4b7a64', fontSize: '15px' }}>Loading rewards...</div>
    </div>
  );

  if (error) return (
    <div style={{ color: '#f87171', padding: '20px' }}>{error}</div>
  );

  if (!data) return null;

  const { level, xp } = getLevel(data.points);
  const progressPct = (data.total_earned / data.total_badges) * 100;

  return (
    <div>
      <style>{`
        @keyframes spinBadge {
          0%   { transform: rotateY(0deg); }
          50%  { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes xpShine {
          0%   { transform: translateX(-100%); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(52,211,153,0.2); }
          50%       { box-shadow: 0 0 24px rgba(52,211,153,0.5); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ color: '#f0fdf4', fontSize: '34px', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>
          Rewards
        </h1>
        <p style={{ color: '#4b7a64', margin: '6px 0 0 0', fontSize: '15px' }}>
          Earn badges by hitting milestones across your finances
        </p>
      </div>

      {/* Hero row: Level card LEFT, XP progress card RIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '16px', marginBottom: '28px' }}>

        {/* Level card — LEFT */}
        <div style={{
          backgroundColor: '#0c1a0f', borderRadius: '16px', padding: '28px 36px',
          border: '1px solid rgba(52,211,153,0.15)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minWidth: '200px',
          animation: 'pulseGlow 3s ease-in-out infinite',
        }}>
          <p style={{
            color: '#4b7a64', fontSize: '12px', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '1.2px', margin: '0 0 8px 0',
          }}>
            Current Level
          </p>
          <div style={{
            fontSize: '64px', fontWeight: '900', lineHeight: 1,
            background: 'linear-gradient(135deg, #34d399, #6ee7b7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-3px',
            animation: 'float 3s ease-in-out infinite',
          }}>
            {level}
          </div>
          <p style={{ color: '#4b7a64', fontSize: '13px', margin: '8px 0 20px 0', fontWeight: '600' }}>
            Level {level}
          </p>

          {/* XP bar inside level card */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
              <span style={{ color: '#4b7a64', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>XP</span>
              <span style={{ color: '#34d399', fontSize: '11px', fontWeight: '700' }}>{xp} / 100</span>
            </div>
            <XPBar xp={xp} animated={animated} />
            <p style={{ color: '#2d4a38', fontSize: '10px', margin: '7px 0 0 0', textAlign: 'center' }}>
              {100 - xp} XP to Level {level + 1}
            </p>
          </div>
        </div>

        {/* Overall Progress card — RIGHT */}
        <div style={{
          backgroundColor: '#0c1a0f', borderRadius: '16px', padding: '32px',
          border: '1px solid rgba(52,211,153,0.08)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <p style={{
            color: '#4b7a64', fontSize: '12px', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '1.2px', margin: '0 0 12px 0',
          }}>
            Overall Progress
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <p style={{
              color: '#f0fdf4', fontSize: '28px', fontWeight: '800',
              margin: 0, letterSpacing: '-1px',
            }}>
              {data.total_earned} of {data.total_badges} badges earned
            </p>
            <p style={{
              color: '#34d399', fontSize: '28px', fontWeight: '800',
              margin: 0, letterSpacing: '-1px',
            }}>
              {progressPct.toFixed(0)}%
            </p>
          </div>

          {/* Overall progress bar */}
          <div style={{ width: '100%', height: '12px', backgroundColor: '#0d1f15', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: animated ? `${progressPct}%` : '0%',
              background: 'linear-gradient(90deg, #059669, #34d399, #6ee7b7)',
              borderRadius: '6px',
              transition: 'width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 0 12px rgba(52,211,153,0.4)',
            }} />
          </div>
          <p style={{ color: '#2d4a38', fontSize: '13px', margin: '12px 0 0 0' }}>
            {data.total_badges - data.total_earned} badges remaining to unlock
          </p>
        </div>
      </div>

      {/* Badges by category */}
      {CATEGORY_ORDER.map(category => {
        const categoryBadges = data.badges.filter(b => b.category === category);
        const earnedInCategory = categoryBadges.filter(b => b.earned).length;
        const colors = CATEGORY_COLORS[category];
        const catPct = (earnedInCategory / categoryBadges.length) * 100;

        return (
          <div key={category} style={{ marginBottom: '36px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '16px', paddingBottom: '14px',
              borderBottom: `1px solid ${colors.bg}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{
                  color: '#f0fdf4', fontSize: '22px', fontWeight: '700',
                  margin: 0, letterSpacing: '-0.5px',
                }}>
                  {category}
                </h2>
                <span style={{
                  backgroundColor: colors.bg, color: colors.accent,
                  fontSize: '11px', fontWeight: '700',
                  padding: '3px 10px', borderRadius: '10px',
                  border: `1px solid ${colors.glow}`,
                }}>
                  {earnedInCategory}/{categoryBadges.length}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '100px', height: '5px', backgroundColor: '#0d1f15', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: animated ? `${catPct}%` : '0%',
                    backgroundColor: colors.accent,
                    borderRadius: '3px',
                    transition: 'width 1s ease 0.3s',
                    boxShadow: `0 0 6px ${colors.glow}`,
                  }} />
                </div>
                <span style={{ color: colors.accent, fontSize: '13px', fontWeight: '600' }}>
                  {catPct.toFixed(0)}%
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {categoryBadges.map((badge, i) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  index={i}
                  categoryColor={colors}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Rewards;