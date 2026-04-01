import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface LinkedAccount {
  id: string;
  account_type: string;
  last4: string;
  last_synced: string | null;
  is_active: boolean;
}

const AVATAR_COLORS = [
  '#059669', '#0891b2', '#7c3aed', '#db2777',
  '#d97706', '#dc2626', '#65a30d', '#0284c7',
];

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div onClick={() => onChange(!value)} style={{
    width: '44px', height: '24px',
    backgroundColor: value ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    border: `1px solid ${value ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)'}`,
    cursor: 'pointer', position: 'relative',
    transition: 'all 0.2s ease', flexShrink: 0,
  }}>
    <div style={{
      width: '18px', height: '18px',
      backgroundColor: value ? '#34d399' : '#4b7a64',
      borderRadius: '50%', position: 'absolute',
      top: '2px', left: value ? '22px' : '2px',
      transition: 'all 0.2s ease',
      boxShadow: value ? '0 0 6px rgba(52,211,153,0.5)' : 'none',
    }} />
  </div>
);

type Tab = 'details' | 'profile' | 'notifications' | 'danger';

const Settings: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('details');

  // Details state
  const [detailsForm, setDetailsForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [detailsSubmitting, setDetailsSubmitting] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [bankMessage, setBankMessage] = useState('');

  // Profile state
  const [profileForm, setProfileForm] = useState({
    email: user?.email || '',
    avatar_color: (user as any)?.avatar_color || '#059669',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // Notifications state
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});

  // Danger state
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // General error
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLinkedAccounts();
    fetchNotifPrefs();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const res = await api.get('/bank/accounts');
      setLinkedAccounts(res.data);
    } catch {}
  };

  const fetchNotifPrefs = async () => {
    try {
      const res = await api.get('/notifications/preferences');
      setNotifPrefs(res.data);
    } catch {}
  };

  const handleDetailsSave = async () => {
    try {
      setDetailsSubmitting(true);
      setError('');
      const res = await api.put('/auth/me', detailsForm);
      setUser(res.data);
      setDetailsSaved(true);
      setTimeout(() => setDetailsSaved(false), 2000);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to save');
    } finally {
      setDetailsSubmitting(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      setProfileSubmitting(true);
      setError('');
      const res = await api.put('/auth/me', profileForm);
      setUser(res.data);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to save');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    try {
      setPasswordSubmitting(true);
      await api.put('/auth/me/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSaved(true);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (e: any) {
      setPasswordError(e.response?.data?.detail || 'Failed to update password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleNotifChange = async (key: string, value: boolean) => {
    setNotifPrefs(prev => ({ ...prev, [key]: value }));
    try {
      await api.put('/notifications/preferences', { [key]: value });
    } catch {}
  };

  const handleConnect = async () => {
    setConnecting(true); setBankMessage('');
    try {
      await api.post('/bank/connect');
      await fetchLinkedAccounts();
      setBankMessage('✓ Bank connected successfully!');
    } catch (e: any) {
      setBankMessage(e.response?.data?.detail || 'Failed to connect bank');
    } finally { setConnecting(false); }
  };

  const handleSync = async () => {
    setSyncing(true); setBankMessage('');
    try {
      const res = await api.post('/bank/sync');
      setBankMessage(`✓ Synced ${res.data.synced} new transactions`);
      if (res.data.toasts) res.data.toasts.forEach((t: any) => addToast(t));
    } catch (e: any) {
      setBankMessage(e.response?.data?.detail || 'Sync failed');
    } finally { setSyncing(false); }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect your bank account?')) return;
    try {
      await api.delete('/bank/disconnect');
      setLinkedAccounts([]);
      setBankMessage('Bank account disconnected.');
    } catch (e: any) {
      setBankMessage(e.response?.data?.detail || 'Failed to disconnect');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'confirm deletion') {
      setDeleteError('Please type "confirm deletion" exactly');
      return;
    }
    try {
      setDeleting(true);
      await api.delete('/auth/me', { data: { confirmation: deleteConfirm } });
      logout();
      navigate('/login');
    } catch (e: any) {
      setDeleteError(e.response?.data?.detail || 'Failed to delete account');
    } finally { setDeleting(false); }
  };

  const isConnected = linkedAccounts.length > 0;

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'details',       label: 'My Details',    icon: '👤' },
    { id: 'profile',       label: 'Profile',        icon: '✏️' },
    { id: 'notifications', label: 'Notifications',  icon: '🔔' },
    { id: 'danger',        label: 'Danger Zone',    icon: '⚠️' },
  ];

  const avatarInitials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#f0fdf4', fontSize: '32px', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>
          Settings
        </h1>
        <p style={{ color: '#4b7a64', margin: '6px 0 0 0', fontSize: '15px' }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '4px',
        backgroundColor: '#071008',
        borderRadius: '12px', padding: '6px',
        marginBottom: '28px',
        border: '1px solid rgba(52,211,153,0.08)',
        width: 'fit-content',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setError(''); }}
            style={{
              padding: '10px 20px',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: activeTab === tab.id ? '600' : '400',
              backgroundColor: activeTab === tab.id
                ? tab.id === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.12)'
                : 'transparent',
              color: activeTab === tab.id
                ? tab.id === 'danger' ? '#f87171' : '#34d399'
                : '#4b7a64',
              transition: 'all 0.15s ease',
              display: 'flex', alignItems: 'center', gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171',
          padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {/* MY DETAILS TAB */}
      {activeTab === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px'  }}>

          {/* Personal info */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Personal Information</h2>
            <p style={cardDescStyle}>Update your name displayed across the app.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  value={detailsForm.first_name}
                  onChange={e => setDetailsForm(f => ({ ...f, first_name: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  value={detailsForm.last_name}
                  onChange={e => setDetailsForm(f => ({ ...f, last_name: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Username</label>
              <input
                value={user?.username || ''}
                disabled
                style={{ ...inputStyle, opacity: 0.4, cursor: 'not-allowed' }}
              />
              <p style={{ color: '#2d4a38', fontSize: '11px', margin: '4px 0 0 0' }}>Username cannot be changed</p>
            </div>

            <button onClick={handleDetailsSave} disabled={detailsSubmitting} style={detailsSaved ? savedBtnStyle : primaryBtnStyle}>
              {detailsSubmitting ? 'Saving...' : detailsSaved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>

          {/* Bank connection */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Freedom Bank</h2>
            <p style={cardDescStyle}>Connect your bank to automatically import transactions.</p>

            {isConnected && (
              <div style={{ marginBottom: '20px' }}>
                {linkedAccounts.map(account => (
                  <div key={account.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', backgroundColor: '#071008',
                    border: '1px solid rgba(52,211,153,0.15)', borderRadius: '10px',
                    marginBottom: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #059669, #34d399)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                      }}>
                        {account.account_type === 'checking' ? '🏦' : '💳'}
                      </div>
                      <div>
                        <p style={{ color: '#f0fdf4', fontSize: '13px', fontWeight: '600', margin: 0, textTransform: 'capitalize' }}>
                          {account.account_type} Account
                        </p>
                        <p style={{ color: '#4b7a64', fontSize: '11px', margin: '2px 0 0 0' }}>
                          {account.last_synced
                            ? `Synced ${new Date(account.last_synced).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                            : 'Never synced'}
                        </p>
                      </div>
                    </div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                  </div>
                ))}
              </div>
            )}

            {bankMessage && (
              <div style={{
                backgroundColor: bankMessage.startsWith('✓') ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
                color: bankMessage.startsWith('✓') ? '#34d399' : '#f87171',
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
              }}>
                {bankMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {!isConnected ? (
                <button onClick={handleConnect} disabled={connecting} style={primaryBtnStyle}>
                  {connecting ? 'Connecting...' : '🏦 Connect Bank'}
                </button>
              ) : (
                <>
                  <button onClick={handleSync} disabled={syncing} style={primaryBtnStyle}>
                    {syncing ? 'Syncing...' : '⟳ Sync Transactions'}
                  </button>
                  <button onClick={handleDisconnect} style={dangerOutlineBtnStyle}>
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px'  }}>

          {/* Avatar + email */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Profile</h2>
            <p style={cardDescStyle}>Customize your avatar and update your email.</p>

            {/* Avatar preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                backgroundColor: profileForm.avatar_color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: '800', color: '#fff',
                flexShrink: 0,
                boxShadow: `0 0 20px ${profileForm.avatar_color}60`,
                transition: 'all 0.3s ease',
              }}>
                {avatarInitials}
              </div>
              <div>
                <p style={{ color: '#f0fdf4', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>
                  {user?.first_name} {user?.last_name}
                </p>
                <p style={{ color: '#4b7a64', fontSize: '13px', margin: '0 0 12px 0' }}>@{user?.username}</p>
                {/* Color picker */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {AVATAR_COLORS.map(color => (
                    <div
                      key={color}
                      onClick={() => setProfileForm(f => ({ ...f, avatar_color: color }))}
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        backgroundColor: color, cursor: 'pointer',
                        border: profileForm.avatar_color === color ? '2px solid #fff' : '2px solid transparent',
                        boxShadow: profileForm.avatar_color === color ? `0 0 8px ${color}` : 'none',
                        transition: 'all 0.15s ease',
                        transform: profileForm.avatar_color === color ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email Address</label>
              <input
                value={profileForm.email}
                onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
                type="email"
              />
            </div>

            <button onClick={handleProfileSave} disabled={profileSubmitting} style={profileSaved ? savedBtnStyle : primaryBtnStyle}>
              {profileSubmitting ? 'Saving...' : profileSaved ? '✓ Saved' : 'Save Profile'}
            </button>
          </div>

          {/* Password change */}
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>Change Password</h2>
            <p style={cardDescStyle}>Keep your account secure with a strong password.</p>

            {passwordError && (
              <div style={{
                backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171',
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
              }}>
                {passwordError}
              </div>
            )}

            {passwordSaved && (
              <div style={{
                backgroundColor: 'rgba(52,211,153,0.1)', color: '#34d399',
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
              }}>
                ✓ Password updated successfully!
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  placeholder="Enter current password"
                />
                <button
                  onClick={() => setShowCurrentPassword(p => !p)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4b7a64', fontSize: '16px', padding: 0 }}
                >
                  {showCurrentPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  placeholder="Enter new password"
                />
                <button
                  onClick={() => setShowNewPassword(p => !p)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4b7a64', fontSize: '16px', padding: 0 }}
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirm_password}
                onChange={e => setPasswordForm(f => ({ ...f, confirm_password: e.target.value }))}
                style={inputStyle}
                placeholder="Confirm new password"
              />
            </div>

            <button onClick={handlePasswordChange} disabled={passwordSubmitting || !passwordForm.current_password || !passwordForm.new_password} style={{
              ...primaryBtnStyle,
              opacity: (!passwordForm.current_password || !passwordForm.new_password) ? 0.5 : 1,
              cursor: (!passwordForm.current_password || !passwordForm.new_password) ? 'not-allowed' : 'pointer',
            }}>
              {passwordSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Notification Preferences</h2>
          <p style={cardDescStyle}>Choose how you want to be notified for each event.</p>

          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 100px 100px',
            gap: '8px', marginBottom: '16px', paddingBottom: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={labelStyle}>Event</span>
            <span style={{ ...labelStyle, textAlign: 'center' }}>In-App</span>
            <span style={{ ...labelStyle, textAlign: 'center' }}>Email</span>
          </div>

          {[
            { label: 'Budget exceeded', desc: 'When you go over a budget limit', toast: 'toast_budget_exceeded', email: 'email_budget_exceeded' },
            { label: 'Goal completed', desc: 'When you reach a savings goal', toast: 'toast_goal_completed', email: 'email_goal_completed' },
            { label: 'Transactions synced', desc: 'When new transactions are imported', toast: 'toast_transactions_synced', email: 'email_transactions_synced' },
            { label: 'Goal reminders', desc: 'Reminders to make goal deposits', toast: 'toast_goal_reminder', email: 'email_goal_reminder' },
            { label: 'Weekly summary', desc: 'Your weekly spending report', toast: 'toast_weekly_summary', email: 'email_weekly_summary' },
          ].map(pref => (
            <div key={pref.label} style={{
              display: 'grid', gridTemplateColumns: '1fr 100px 100px',
              gap: '8px', alignItems: 'center', marginBottom: '20px',
            }}>
              <div>
                <p style={{ color: '#d1fae5', fontSize: '14px', fontWeight: '600', margin: 0 }}>{pref.label}</p>
                <p style={{ color: '#4b7a64', fontSize: '12px', margin: '3px 0 0 0' }}>{pref.desc}</p>
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
      )}

      {/* DANGER ZONE TAB */}
      {activeTab === 'danger' && (
        <div>
          <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>⚠️</span>
              <h2 style={{ ...cardTitleStyle, color: '#f87171', margin: 0 }}>Delete Account</h2>
            </div>
            <p style={{ color: '#4b7a64', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.7' }}>
              This action is <strong style={{ color: '#f87171' }}>permanent and irreversible</strong>. Deleting your account will permanently remove:
            </p>

            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                '🏦 All linked bank accounts and transaction history',
                '💰 All budgets and spending data',
                '🎯 All savings goals and progress',
                '🏆 All rewards and earned badges',
                '🤖 All AI chat history',
                '👤 Your profile and account credentials',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#f87171', fontSize: '13px' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...labelStyle, color: '#f87171' }}>
                Type "confirm deletion" to enable the delete button
              </label>
              <input
                value={deleteConfirm}
                onChange={e => { setDeleteConfirm(e.target.value); setDeleteError(''); }}
                placeholder='confirm deletion'
                style={{
                  ...inputStyle,
                  border: deleteConfirm === 'confirm deletion'
                    ? '1px solid rgba(239,68,68,0.5)'
                    : '1px solid rgba(239,68,68,0.2)',
                  backgroundColor: 'rgba(239,68,68,0.05)',
                }}
              />
              {deleteError && (
                <p style={{ color: '#f87171', fontSize: '12px', margin: '6px 0 0 0' }}>{deleteError}</p>
              )}
            </div>

            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'confirm deletion' || deleting}
              style={{
                padding: '12px 28px',
                backgroundColor: deleteConfirm === 'confirm deletion' ? '#dc2626' : 'rgba(239,68,68,0.1)',
                color: deleteConfirm === 'confirm deletion' ? '#fff' : '#4b7a64',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px', fontWeight: '700', fontSize: '14px',
                cursor: deleteConfirm !== 'confirm deletion' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {deleting ? 'Deleting...' : '🗑️ Permanently Delete Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Shared styles
const cardStyle: React.CSSProperties = {
  backgroundColor: '#0c1a0f', borderRadius: '14px', padding: '28px',
  border: '1px solid rgba(52,211,153,0.08)',
};
const cardTitleStyle: React.CSSProperties = {
  color: '#f0fdf4', fontSize: '18px', fontWeight: '700',
  margin: '0 0 6px 0', letterSpacing: '-0.3px',
};
const cardDescStyle: React.CSSProperties = {
  color: '#4b7a64', fontSize: '13px', margin: '0 0 24px 0',
};
const labelStyle: React.CSSProperties = {
  display: 'block', color: '#4b7a64', fontSize: '11px', fontWeight: '700',
  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', backgroundColor: '#071008',
  border: '1px solid rgba(52,211,153,0.15)', borderRadius: '8px',
  color: '#f0fdf4', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};
const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: 'linear-gradient(135deg, #059669, #34d399)',
  color: '#fff', border: 'none', borderRadius: '8px',
  cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  transition: 'opacity 0.2s',
};
const savedBtnStyle: React.CSSProperties = {
  padding: '10px 24px',
  backgroundColor: 'rgba(52,211,153,0.15)',
  color: '#34d399',
  border: '1px solid rgba(52,211,153,0.3)',
  borderRadius: '8px', cursor: 'default',
  fontSize: '14px', fontWeight: '600',
};
const dangerOutlineBtnStyle: React.CSSProperties = {
  padding: '10px 24px', backgroundColor: 'transparent',
  border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: '8px', color: '#f87171',
  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
};

export default Settings;