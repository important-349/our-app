import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

function MessageBox() {
  const [body, setBody] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const handleSend = async () => {
    if (!body.trim()) return
    setLoading(true)
    setError('')
    try {
      await axios.post(`${API}/api/messages`, { body })
      setSent(true)
    } catch (err) {
      setError('Something went wrong, try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend()
    }
  }

  if (sent) {
    return (
      <>
        <div className={`msgbox-wrap msgbox-sent-wrap${visible ? ' msgbox-visible' : ''}`} ref={ref}>
          <div className="msgbox-sent-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <p className="msgbox-sent-title">Message sent</p>
          <p className="msgbox-sent-sub">I'll read it soon.</p>
        </div>
        <style>{msgboxStyles}</style>
      </>
    )
  }

  return (
    <>
      <div
        ref={ref}
        className={`msgbox-wrap${visible ? ' msgbox-visible' : ''}`}
      >
        <div className="msgbox-header">
          <div className="msgbox-header-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h3 className="msgbox-title">Leave a message</h3>
            <p className="msgbox-subtitle">I'll keep it close</p>
          </div>
        </div>

        <div className={`msgbox-input-wrap${focused ? ' focused' : ''}`}>
          <textarea
            ref={textareaRef}
            className="msgbox-textarea"
            placeholder="Write something sweet…"
            value={body}
            onChange={e => setBody(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            rows={4}
          />
          <div className="msgbox-input-glow" />
        </div>

        {error && (
          <p className="msgbox-error">{error}</p>
        )}

        <div className="msgbox-footer">
          <p className="msgbox-hint">⌘ + Enter to send</p>
          <button
            className={`msgbox-send-btn${loading ? ' loading' : ''}${!body.trim() ? ' disabled' : ''}`}
            onClick={handleSend}
            disabled={loading || !body.trim()}
          >
            {loading ? (
              <span className="msgbox-spinner" />
            ) : (
              <>
                <span>Send</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{msgboxStyles}</style>
    </>
  )
}

const msgboxStyles = `
  .msgbox-wrap {
    position: relative;
    background: linear-gradient(
      160deg,
      rgba(255, 248, 251, 0.75) 0%,
      rgba(255, 240, 246, 0.65) 100%
    );
    backdrop-filter: blur(24px) saturate(150%);
    -webkit-backdrop-filter: blur(24px) saturate(150%);
    border: 1px solid rgba(212, 160, 180, 0.25);
    border-radius: 20px;
    padding: 2rem;
    margin-top: 2rem;
    box-shadow:
      0 4px 32px rgba(181, 41, 78, 0.06),
      0 1px 0 rgba(255, 255, 255, 0.7) inset;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .msgbox-wrap.msgbox-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .msgbox-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 1.4rem;
  }

  .msgbox-header-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(255, 220, 232, 0.8), rgba(220, 160, 185, 0.6));
    border: 1px solid rgba(212, 160, 180, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(140, 40, 75, 0.8);
    flex-shrink: 0;
  }

  .msgbox-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 19px;
    font-weight: 400;
    color: rgba(80, 20, 45, 0.85);
    margin: 0 0 2px;
    letter-spacing: 0.2px;
  }

  .msgbox-subtitle {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 12px;
    font-style: italic;
    color: rgba(140, 80, 110, 0.55);
    margin: 0;
    letter-spacing: 0.5px;
  }

  .msgbox-input-wrap {
    position: relative;
    border-radius: 14px;
    margin-bottom: 0.75rem;
    transition: box-shadow 0.3s ease;
  }

  .msgbox-input-wrap.focused {
    box-shadow: 0 0 0 2px rgba(181, 41, 78, 0.12), 0 0 20px rgba(181, 41, 78, 0.08);
  }

  .msgbox-textarea {
    width: 100%;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid rgba(212, 160, 180, 0.3);
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 16px;
    font-style: italic;
    color: rgba(50, 15, 30, 0.8);
    line-height: 1.7;
    outline: none;
    resize: none;
    box-sizing: border-box;
    transition: border-color 0.3s ease, background 0.3s ease;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03);
  }

  .msgbox-textarea::placeholder {
    color: rgba(181, 100, 140, 0.4);
    font-style: italic;
  }

  .msgbox-textarea:focus {
    border-color: rgba(181, 41, 78, 0.3);
    background: rgba(255, 255, 255, 0.75);
  }

  .msgbox-input-glow {
    position: absolute;
    bottom: -4px;
    left: 10%;
    right: 10%;
    height: 12px;
    background: radial-gradient(ellipse, rgba(181, 41, 78, 0.08), transparent 70%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .msgbox-input-wrap.focused .msgbox-input-glow {
    opacity: 1;
  }

  .msgbox-error {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 13px;
    font-style: italic;
    color: rgba(181, 41, 78, 0.7);
    margin: 0 0 0.75rem;
    padding-left: 4px;
  }

  .msgbox-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .msgbox-hint {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 11px;
    color: rgba(140, 80, 110, 0.4);
    margin: 0;
    letter-spacing: 0.3px;
  }

  .msgbox-send-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 24px;
    border-radius: 999px;
    border: 1px solid rgba(181, 41, 78, 0.25);
    background: linear-gradient(
      135deg,
      rgba(181, 41, 78, 0.85) 0%,
      rgba(140, 20, 55, 0.8) 100%
    );
    color: rgba(255, 235, 242, 0.95);
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0.5px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(181, 41, 78, 0.2), 0 1px 0 rgba(255,255,255,0.1) inset;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  }

  .msgbox-send-btn:hover:not(.disabled):not(.loading) {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(181, 41, 78, 0.3);
  }

  .msgbox-send-btn:active:not(.disabled):not(.loading) {
    transform: translateY(0);
  }

  .msgbox-send-btn.disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .msgbox-send-btn.loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @keyframes msgbox-spin {
    to { transform: rotate(360deg) }
  }

  .msgbox-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 1.5px solid rgba(255, 220, 232, 0.4);
    border-top-color: rgba(255, 220, 232, 0.9);
    border-radius: 50%;
    animation: msgbox-spin 0.7s linear infinite;
  }

  /* Sent state */
  .msgbox-sent-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.8rem 2rem;
    gap: 0.6rem;
  }

  .msgbox-sent-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255, 220, 232, 0.8), rgba(220, 160, 185, 0.6));
    border: 1px solid rgba(212, 160, 180, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(140, 40, 75, 0.8);
    margin-bottom: 0.4rem;
    animation: msgbox-sentPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes msgbox-sentPop {
    0%   { transform: scale(0.5); opacity: 0 }
    100% { transform: scale(1);   opacity: 1 }
  }

  .msgbox-sent-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 20px;
    font-weight: 400;
    color: rgba(80, 20, 45, 0.85);
    margin: 0;
  }

  .msgbox-sent-sub {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 14px;
    font-style: italic;
    color: rgba(140, 80, 110, 0.55);
    margin: 0;
  }
`

export default MessageBox