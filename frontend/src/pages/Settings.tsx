import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

interface LinkedAccount {
  id: string;
  account_type: string;
  last4: string;
  last_synced: string | null;
  is_active: boolean;
}

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      width: '40px', height: '22px',
      backgroundColor: value ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)',
      borderRadius: '11px',
      border: `1px solid ${value ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)'}`,
      cursor: 'pointer', position: 'relative',
      transition: 'all 0.2s ease',
    }}
  >
    <div style={{
      width: '16px', height: '16px',
      backgroundColor: value ? '#34d399' : '#4b7a64',
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      left: value ? '20px' : '2px',
      transition: 'all 0.2s ease',
    }} />
  </div>
);

const Settings: React.FC = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useNotifications();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [bankMessage, setBankMessage] = useState('');
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    fetchLinkedAccounts();
    fetchNotifPrefs();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const response = await api.get('/bank/accounts');
      setLinkedAccounts(response.data);
    } catch {
      // No accounts yet
    }
  };

  const fetchNotifPrefs = async () => {
    try {
      const res = await api.get('/notifications/preferences');
      setNotifPrefs(res.data);
    } catch {}
  };

  const handleNotifChange = async (key: string, value: boolean) => {
    setNotifPrefs(prev => ({ ...prev, [key]: value }));
    try {
      await api.put('/notifications/preferences', { [key]: value });
    } catch {}
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      setError('');
      const response = await api.put('/auth/me', form);
      setUser(response.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to save changes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setBankMessage('');
    try {
      await api.post('/bank/connect');
      await fetchLinkedAccounts();
      setBankMessage('✓ Bank connected successfully!');
    } catch (e: any) {
      setBankMessage(e.response?.data?.detail || 'Failed to connect bank');
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setBankMessage('');
    try {
      const response = await api.post('/bank/sync');
      setBankMessage(`✓ Synced ${response.data.synced} new transactions`);
      if (response.data.toasts) {
        response.data.toasts.forEach((t: any) => addToast(t));
      }
    } catch (e: any) {
      setBankMessage(e.response?.data?.detail || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your bank account?')) return;
    try {
      await api.delete('/bank/disconnect');
      setLinkedAccounts([]);
      setBankMessage('Bank account disconnected.');
    } catch (e: any) {
      setBankMessage(e.response?.data?.detail || 'Failed to disconnect');
    }
  };


  const isConnected = linkedAccounts.length > 0;

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
          Settings
        </h1>
        <p style={{ color: '#4b7a64', margin: '4px 0 0 0', fontSize: '14px' }}>
          Manage your account preferences
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Profile */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Username</label>
          <input value={user?.username || ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          <p style={{ color: '#2d4a38', fontSize: '11px', margin: '4px 0 0 0' }}>Username cannot be changed</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Email</label>
          <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
        </div>
        <button onClick={handleSave} disabled={submitting} style={{
          padding: '10px 24px',
          background: saved ? 'rgba(52,211,153,0.2)' : 'linear-gradient(135deg, #059669, #34d399)',
          color: saved ? '#34d399' : '#fff',
          border: saved ? '1px solid rgba(52,211,153,0.3)' : 'none',
          borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer',
          fontSize: '14px', fontWeight: '600',
          opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
        }}>
          {submitting ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Bank Connection */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Bank Connection</h2>
        <p style={{ color: '#4b7a64', fontSize: '13px', margin: '0 0 20px 0' }}>
          Connect your Freedom Bank account to automatically import transactions.
        </p>

        {!isConnected ? (
          <button onClick={handleConnect} disabled={connecting} style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            color: '#fff', border: 'none', borderRadius: '8px',
            cursor: connecting ? 'not-allowed' : 'pointer',
            fontSize: '14px', fontWeight: '600',
            opacity: connecting ? 0.7 : 1,
          }}>
            {connecting ? 'Connecting...' : '🏦 Connect Bank'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleSync} disabled={syncing} style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #059669, #34d399)',
              color: '#fff', border: 'none', borderRadius: '8px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              fontSize: '14px', fontWeight: '600',
              opacity: syncing ? 0.7 : 1,
            }}>
              {syncing ? 'Syncing...' : '⟳ Sync Transactions'}
            </button>
            <button onClick={handleDisconnect} style={{
              padding: '10px 24px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', color: '#f87171',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}>
              Disconnect
            </button>
          </div>
        )}

        {bankMessage && (
          <div style={{
            backgroundColor: bankMessage.startsWith('✓') ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
            color: bankMessage.startsWith('✓') ? '#34d399' : '#f87171',
            padding: '10px 14px', borderRadius: '8px',
            fontSize: '13px', marginTop: '16px',
          }}>
            {bankMessage}
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Notification Preferences</h2>
        <p style={{ color: '#4b7a64', fontSize: '13px', margin: '0 0 20px 0' }}>
          Choose how you want to be notified for each event.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '8px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: '#4b7a64', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Event</span>
          <span style={{ color: '#4b7a64', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>In-App</span>
          <span style={{ color: '#4b7a64', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>Email</span>
        </div>

        {[
          { label: 'Budget exceeded', desc: 'When you go over a budget limit', toast: 'toast_budget_exceeded', email: 'email_budget_exceeded' },
          { label: 'Goal completed', desc: 'When you reach a savings goal', toast: 'toast_goal_completed', email: 'email_goal_completed' },
          { label: 'Transactions synced', desc: 'When new transactions are imported', toast: 'toast_transactions_synced', email: 'email_transactions_synced' },
          { label: 'Goal reminders', desc: 'Reminders to make goal deposits', toast: 'toast_goal_reminder', email: 'email_goal_reminder' },
          { label: 'Weekly summary', desc: 'Your weekly spending report', toast: 'toast_weekly_summary', email: 'email_weekly_summary' },
        ].map(pref => (
          <div key={pref.label} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <p style={{ color: '#d1fae5', fontSize: '13px', margin: 0, fontWeight: '500' }}>{pref.label}</p>
              <p style={{ color: '#4b7a64', fontSize: '11px', margin: '2px 0 0 0' }}>{pref.desc}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Toggle value={notifPrefs[pref.toast] ?? true} onChange={val => handleNotifChange(pref.toast, val)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Toggle value={notifPrefs[pref.email] ?? true} onChange={val => handleNotifChange(pref.email, val)} />
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div style={{ ...sectionStyle, border: '1px solid rgba(239,68,68,0.15)' }}>
        <h2 style={{ ...sectionTitleStyle, color: '#f87171' }}>Danger Zone</h2>
        <p style={{ color: '#4b7a64', fontSize: '13px', margin: '0 0 16px 0' }}>
          These actions are permanent and cannot be undone.
        </p>
        <button style={{
          padding: '9px 20px', backgroundColor: 'transparent',
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px',
          color: '#f87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#0c1a0f', borderRadius: '12px', padding: '24px',
  border: '1px solid rgba(52,211,153,0.08)', marginBottom: '16px',
};
const sectionTitleStyle: React.CSSProperties = {
  color: '#f0fdf4', fontSize: '15px', fontWeight: '600', margin: '0 0 20px 0',
};
const labelStyle: React.CSSProperties = {
  display: 'block', color: '#4b7a64', fontSize: '11px', fontWeight: '600',
  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', backgroundColor: '#071008',
  border: '1px solid rgba(52,211,153,0.15)', borderRadius: '8px',
  color: '#f0fdf4', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

export default Settings;