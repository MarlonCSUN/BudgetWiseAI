import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your AI financial advisor. Ask me anything about your spending, budgets, or savings goals!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai/history');
      if (response.data.length > 0) {
        setMessages(response.data.map((m: any) => ({
          role: m.role,
          content: m.content,
        })));
      }
    } catch {
      // No history yet, keep default welcome message
    } finally {
      setHistoryLoaded(true);
    }
  };

  const clearHistory = async () => {
    try {
      await api.delete('/ai/history');
      setMessages([{ role: 'assistant', content: 'Hi! I\'m your AI financial advisor. Ask me anything about your spending, budgets, or savings goals!' }]);
    } catch {
      // Silently fail
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);

      // Show notification if actions were executed
      if (response.data.actions?.length > 0) {
        response.data.actions.forEach((action: any) => {
          if (action.type === 'goal_created') {
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ Goal "${action.name}" has been created! You can view it on the Goals page.` }]);
          }
          if (action.type === 'goal_updated') {
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ Goal "${action.name}" has been updated!` }]);
          }
          if (action.type === 'goal_deleted') {
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ Goal "${action.name}" has been deleted.` }]);
          }
          if (action.type === 'budget_created') {
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ Budget for "${action.category}" has been created! You can view it on the Budgets page.` }]);
          }
          if (action.type === 'budget_updated') {
           setMessages(prev => [...prev, { role: 'assistant', content: `✅ Budget for "${action.category}" has been updated!` }]);
          }
          if (action.type === 'budget_deleted') {
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ Budget for "${action.category}" has been deleted.` }]);
          }
        });
      }

    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#f0fdf4', fontSize: '26px', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>
            AI Assistant
          </h1>
          <p style={{ color: '#4b7a64', margin: '4px 0 0 0', fontSize: '14px' }}>
            Your personal finance advisor
          </p>
        </div>
        <button
          onClick={clearHistory}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#4b7a64',
            fontSize: '13px',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
        >
          Clear History
        </button>
      </div>

      {/* Chat window */}
      <div style={{
        flex: 1,
        backgroundColor: '#0c1a0f',
        borderRadius: '12px',
        border: '1px solid rgba(52,211,153,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!historyLoaded ? (
            <div style={{ color: '#4b7a64', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
              Loading history...
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  backgroundColor: msg.role === 'user' ? 'rgba(52,211,153,0.15)' : '#0d1f15',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  color: '#f0fdf4',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px' }}>🤖</span>
                      <span style={{ color: '#34d399', fontSize: '11px', fontWeight: '600' }}>BudgetWise AI</span>
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px 12px 12px 2px',
                backgroundColor: '#0d1f15',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#4b7a64',
                fontSize: '14px',
              }}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: '12px',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your spending, budgets, or savings..."
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#071008',
              border: '1px solid rgba(52,211,153,0.15)',
              borderRadius: '8px',
              color: '#f0fdf4',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 24px',
              background: loading || !input.trim() ? 'rgba(52,211,153,0.1)' : 'linear-gradient(135deg, #059669, #34d399)',
              color: loading || !input.trim() ? '#4b7a64' : '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;