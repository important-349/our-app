import { useState, useEffect } from 'react'

export const START_DATE = new Date('2025-06-28T00:00:00')

function Countdown() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const diff = now - START_DATE
      setElapsed(diff)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const days = Math.floor(elapsed / (1000 * 60 * 60 * 24))
  const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((elapsed / (1000 * 60)) % 60)
  const seconds = Math.floor((elapsed / 1000) % 60)

  return (
    <>
      <div className="countdown-wrap">
        <p className="countdown-label">together for</p>
        <div className="countdown-row">
          <Unit value={days} label="days" />
          <Unit value={hours} label="hours" />
          <Unit value={minutes} label="minutes" />
          <Unit value={seconds} label="seconds" />
        </div>
      </div>

      <style>{`
        /* ── Countdown Wrap ── */
        .countdown-wrap {
          background: rgba(255, 245, 248, 0.55);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(212, 160, 180, 0.25);
          border-radius: 24px;
          padding: 2rem 1.5rem;
          margin-bottom: 2rem;
          text-align: center;
          position: relative;
          box-shadow: 0 4px 32px rgba(181, 41, 78, 0.08), inset 0 1px 0 rgba(255,255,255,0.6);
        }

        .countdown-label {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 14px;
          font-weight: 500;
          font-style: italic;
          color: rgba(115, 25, 55, 0.88);
          margin-bottom: 1.2rem;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        }

        .countdown-row {
          display: flex;
          justify-content: center;
          gap: 0;
        }

        /* ── Unit ── */
        .countdown-unit {
          min-width: 68px;
          padding: 0 0.65rem;
          position: relative;
        }
        .countdown-unit:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 20%;
          height: 60%;
          width: 1px;
          background: rgba(181, 41, 78, 0.25);
        }

        .countdown-unit-value {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 40px;
          font-weight: 400;
          color: #7d122e;
          line-height: 1;
          letter-spacing: -0.5px;
          margin: 0 0 5px;
        }

        .countdown-unit-label {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(120, 35, 65, 0.82);
          margin: 0;
        }

        @media (max-width: 420px) {
          .countdown-unit {
            min-width: 52px;
            padding: 0 0.4rem;
          }
          .countdown-unit-value {
            font-size: 32px;
          }
        }
      `}</style>
    </>
  )
}

function Unit({ value, label }) {
  return (
    <div className="countdown-unit">
      <p className="countdown-unit-value">{String(value).padStart(2, '0')}</p>
      <p className="countdown-unit-label">{label}</p>
    </div>
  )
}

export default Countdown