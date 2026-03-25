import React, { useEffect, useState } from 'react';
import { useNotifications, Toast } from '../../context/NotificationContext';

const ICONS = {
  success: '✅',
  warning: '⚠️',
  info: '💡',
  error: '❌',
};

const COLORS = {
  success: { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', title: '#34d399' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', title: '#f59e0b' },
  info: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', title: '#60a5fa' },
  error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', title: '#f87171' },
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const colors = COLORS[toast.type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '10px', padding: '14px 16px',
      minWidth: '300px', maxWidth: '360px',
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      cursor: 'pointer',
    }} onClick={onRemove}>
      <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{ICONS[toast.type]}</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: colors.title, fontSize: '13px', fontWeight: '700', margin: '0 0 3px 0' }}>
          {toast.title}
        </p>
        <p style={{ color: '#d1fae5', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
          {toast.message}
        </p>
      </div>
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', color: '#4b7a64',
        cursor: 'pointer', fontSize: '16px', padding: '0', flexShrink: 0,
        lineHeight: 1,
      }}>×</button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      zIndex: 9999,
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default ToastContainer;