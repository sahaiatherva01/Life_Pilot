import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Mic, 
  MicOff,
  Zap
} from 'lucide-react';
import { ChatMessage } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/audio';

interface OrionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskModified: () => void;
}

export const OrionDrawer: React.FC<OrionDrawerProps> = ({
  isOpen,
  onClose,
  onTaskModified,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'orion',
      content: 'Greetings Atherva. I am Orion, your personal Life OS assistant. You can instruct me to reschedule, add, complete, or summarize your tasks at any time.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    sound.playClick();
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatWithOrion(text);
      sound.playClick();
      const orionMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'orion',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions_taken: res.actions_taken,
      };
      setMessages(prev => [...prev, orionMsg]);

      if (res.actions_taken && res.actions_taken.length > 0) {
        onTaskModified();
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'orion',
          content: `⚠️ Failed to reach assistant: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Push-to-talk speech recognition
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your command.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        sound.playClick();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const QUICK_PROMPTS = [
    'Shift gym to 7 PM',
    'Complete DSA Study',
    'What is my schedule today?',
    'Add Deep Work at 3 PM to 5 PM',
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '440px',
      zIndex: 1000,
      background: 'rgba(10, 11, 14, 0.95)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid rgba(0, 242, 254, 0.3)',
      boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(24, 27, 36, 0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00F2FE 0%, #7928CA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-cyan)',
          }}>
            <Bot size={20} color="#05070B" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800 }}>
              Orion <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>AI</span>
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--neon-emerald)' }}>
              ● Local Intelligence Ready
            </span>
          </div>
        </div>

        <button
          onClick={() => { sound.playClick(); onClose(); }}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map(m => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{
                background: isUser ? 'linear-gradient(135deg, #00F2FE 0%, #0072FF 100%)' : 'rgba(24, 27, 36, 0.9)',
                color: isUser ? '#05070B' : 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                fontSize: '0.9rem',
                border: isUser ? 'none' : '1px solid var(--border-subtle)',
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>

              {/* Action chip if any */}
              {m.actions_taken && m.actions_taken.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  {m.actions_taken.map((act, i) => (
                    <div 
                      key={i}
                      style={{
                        background: 'rgba(0, 245, 160, 0.1)',
                        border: '1px solid rgba(0, 245, 160, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        color: 'var(--neon-emerald)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Zap size={12} />
                      <span>Action: <strong>{act.tool}</strong> {act.new_time || act.title || ''}</span>
                    </div>
                  ))}
                </div>
              )}

              <span style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                fontFamily: 'var(--font-mono)',
              }}>
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(24, 27, 36, 0.9)',
            padding: '10px 14px',
            borderRadius: '14px 14px 14px 2px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--neon-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Sparkles size={14} className="shimmer-effect" />
            <span>Orion is calculating changes...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        background: 'rgba(18, 20, 26, 0.5)',
      }}>
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(24, 27, 36, 0.8)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* Voice push-to-talk button */}
        <button
          onClick={toggleListening}
          className={isListening ? 'btn-danger' : 'btn-secondary'}
          style={{ padding: '10px', borderRadius: '50%', width: '40px', height: '40px' }}
          title={isListening ? 'Listening...' : 'Voice command (Push-to-talk)'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} color="var(--neon-cyan)" />}
        </button>

        <input
          type="text"
          placeholder={isListening ? 'Listening to voice...' : 'Say "shift gym to 7 PM"...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="btn-primary"
          style={{
            padding: '10px',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            opacity: !input.trim() || loading ? 0.4 : 1,
          }}
        >
          <Send size={16} fill="#05070B" />
        </button>
      </div>
    </div>
  );
};
