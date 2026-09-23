import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/auth/login`, { username, password })
      onLogin(res.data.role)
    } catch (err) {
      setError('Wrong username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="login-page">
        <div className="login-ambient-glow" />
        <div className="login-card">
          <div className="login-icon-glow">
            <div className="login-icon-heart" />
          </div>
          <h2 className="login-title">Just for us two</h2>
          <p className="login-subtitle">a private little world</p>

          <input
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'Enter'}
          </button>
        </div>
      </div>

      <style>{`
        .login-page {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          overflow: hidden;
        }

        .login-ambient-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(220,170,180,0.16), transparent 70%);
          animation: login-ambientPulse 6s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes login-ambientPulse {
          0%,100% { opacity: 0.5; transform: scale(1) }
          50%     { opacity: 0.8; transform: scale(1.08) }
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 340px;
          background: linear-gradient(160deg, rgba(255, 250, 250, 0.7) 0%, rgba(255, 242, 247, 0.6) 100%);
          backdrop-filter: blur(26px) saturate(150%);
          -webkit-backdrop-filter: blur(26px) saturate(150%);
          border: 1px solid rgba(212, 160, 180, 0.3);
          border-radius: 22px;
          padding: 2.8rem 2.2rem;
          text-align: center;
          box-shadow: 0 4px 32px rgba(181, 41, 78, 0.08), inset 0 1px 0 rgba(255,255,255,0.6);
        }

        .login-icon-glow {
          width: 40px;
          height: 40px;
          margin: 0 auto 1.2rem;
          border-radius: 50%;
          background: rgba(255, 200, 215, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: login-iconPulse 3.5s ease-in-out infinite;
          border: 1px solid rgba(212, 160, 180, 0.3);
        }

        .login-icon-heart {
          width: 10px;
          height: 10px;
          background: rgba(181, 41, 78, 0.7);
          border-radius: 50%;
        }

        @keyframes login-iconPulse {
          0%,100% { opacity: 0.5; box-shadow: 0 0 14px 2px rgba(255,200,215,0.25) }
          50%     { opacity: 0.9; box-shadow: 0 0 24px 6px rgba(255,200,215,0.45) }
        }

        .login-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 400;
          font-size: 24px;
          color: rgba(80, 20, 45, 0.9);
          margin: 0 0 0.3rem;
          letter-spacing: 0.3px;
        }

        .login-subtitle {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 12px;
          font-style: italic;
          color: rgba(140, 80, 110, 0.5);
          margin: 0 0 1.8rem;
          letter-spacing: 0.8px;
        }

        .login-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 14px;
          border: 1px solid rgba(212, 160, 180, 0.3);
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(8px);
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 15px;
          font-style: italic;
          color: rgba(50, 15, 30, 0.8);
          margin-bottom: 10px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.3s ease, background 0.3s ease;
        }

        .login-input::placeholder {
          color: rgba(181, 100, 140, 0.4);
          font-style: italic;
        }

        .login-input:focus {
          border-color: rgba(181, 41, 78, 0.35);
          background: rgba(255, 255, 255, 0.72);
        }

        .login-error {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: rgba(181, 41, 78, 0.75);
          margin: 4px 0 8px;
        }

        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, rgba(181,41,78,0.9), rgba(140,20,55,0.85));
          color: rgba(255, 235, 242, 0.95);
          border: 1px solid rgba(255, 180, 200, 0.2);
          border-radius: 999px;
          padding: 13px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          letter-spacing: 0.8px;
          cursor: pointer;
          margin-top: 10px;
          box-shadow: 0 4px 22px rgba(181, 41, 78, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 22px;
        }

        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(181, 41, 78, 0.35);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @keyframes login-spin { to { transform: rotate(360deg) } }

        .login-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 1.5px solid rgba(255,220,232,0.4);
          border-top-color: rgba(255,220,232,0.9);
          border-radius: 50%;
          animation: login-spin 0.7s linear infinite;
        }
      `}</style>
    </>
  )
}

export default Login