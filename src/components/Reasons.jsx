import { useState, useEffect, useRef } from 'react'

const REASONS = [
  "Your laugh fills any room with warmth",
  "The way you care for everyone around you",
  "You make me a better person every day",
  "Your silly moments are my favorite moments",
  "You understand me without words",
  "Your kindness has no limit",
  "Being with you feels like home",
  "Every day with you is a gift",
]

function Reasons() {
  const [unlocked, setUnlocked] = useState([])
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const toggle = (i) => {
    if (!unlocked.includes(i)) setUnlocked([...unlocked, i])
  }

  return (
    <>
      <div
        ref={ref}
        className={`reasons-wrap${visible ? ' reasons-visible' : ''}`}
      >
        <div className="reasons-header">
          <h2 className="reasons-title">Reasons I love you</h2>
          <p className="reasons-hint">touch each to reveal</p>
        </div>

        <div className="reasons-grid">
          {REASONS.map((r, i) => {
            const isOpen = unlocked.includes(i)
            return (
              <div
                key={i}
                className={`reasons-card${isOpen ? ' open' : ' locked'}`}
                style={{ transitionDelay: `${i * 0.05}s` }}
                onClick={() => toggle(i)}
              >
                <div className="reasons-card-inner">
                  {isOpen ? (
                    <>
                      <div className="reasons-card-glow" />
                      <span className="reasons-number">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="reasons-text">{r}</p>
                    </>
                  ) : (
                    <>
                      <div className="reasons-lock-ring">
                        <span className="reasons-lock-glyph">✦</span>
                      </div>
                      <p className="reasons-locked-hint">reveal</p>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {unlocked.length === REASONS.length && (
          <div className="reasons-all-revealed">
            <span className="reasons-complete-line" />
            <p className="reasons-complete-text">and so many more</p>
            <span className="reasons-complete-line" />
          </div>
        )}
      </div>

      <style>{`
        .reasons-wrap {
          margin-bottom: 2rem;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .reasons-wrap.reasons-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .reasons-header {
          text-align: center;
          margin-bottom: 1.6rem;
        }

        .reasons-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 26px;
          font-weight: 300;
          color: rgba(80, 20, 45, 0.85);
          margin: 0 0 6px;
          letter-spacing: 0.3px;
        }

        .reasons-hint {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: rgba(140, 80, 110, 0.5);
          margin: 0;
          letter-spacing: 1px;
        }

        .reasons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* ── Card Base ── */
        .reasons-card {
          border-radius: 18px;
          min-height: 110px;
          cursor: pointer;
          transition:
            transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1),
            box-shadow 0.35s ease,
            opacity 0.5s ease;
          position: relative;
          overflow: hidden;
        }

        .reasons-card-inner {
          position: relative;
          z-index: 1;
          height: 100%;
          min-height: 110px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.2rem 1rem;
          gap: 6px;
        }

        /* ── Locked State ── */
        .reasons-card.locked {
          background: linear-gradient(
            145deg,
            rgba(255, 245, 249, 0.7) 0%,
            rgba(255, 232, 240, 0.6) 100%
          );
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 160, 180, 0.25);
          box-shadow:
            0 2px 12px rgba(181, 41, 78, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }

        .reasons-card.locked:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow:
            0 10px 32px rgba(181, 41, 78, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        .reasons-card.locked:active {
          transform: scale(0.97);
        }

        .reasons-lock-ring {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(255, 220, 232, 0.7),
            rgba(220, 160, 185, 0.5)
          );
          border: 1px solid rgba(212, 160, 180, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(181, 41, 78, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .reasons-card.locked:hover .reasons-lock-ring {
          transform: scale(1.08);
          box-shadow: 0 4px 18px rgba(181, 41, 78, 0.15);
        }

        .reasons-lock-glyph {
          font-size: 12px;
          color: rgba(181, 41, 78, 0.6);
        }

        .reasons-locked-hint {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 11px;
          font-style: italic;
          letter-spacing: 1.5px;
          color: rgba(181, 41, 78, 0.35);
          margin: 0;
          text-transform: uppercase;
        }

        /* ── Open State ── */
        .reasons-card.open {
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.75) 0%,
            rgba(255, 240, 246, 0.68) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 160, 180, 0.3);
          box-shadow:
            0 4px 20px rgba(181, 41, 78, 0.08),
            0 0 0 0 rgba(181, 41, 78, 0),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
          animation: reasons-revealCard 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
          cursor: default;
        }

        .reasons-card.open:hover {
          transform: translateY(-4px);
          box-shadow:
            0 12px 36px rgba(181, 41, 78, 0.12),
            0 0 24px rgba(181, 41, 78, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        @keyframes reasons-revealCard {
          0%   { transform: scale(0.92); opacity: 0.3 }
          60%  { transform: scale(1.04) }
          100% { transform: scale(1);   opacity: 1 }
        }

        .reasons-card-glow {
          position: absolute;
          inset: -1px;
          border-radius: 18px;
          background: radial-gradient(
            ellipse at 50% 0%,
            rgba(255, 200, 220, 0.2),
            transparent 65%
          );
          pointer-events: none;
          opacity: 0;
          animation: reasons-glowIn 0.8s ease 0.2s forwards;
        }

        @keyframes reasons-glowIn {
          to { opacity: 1 }
        }

        .reasons-number {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 2px;
          color: rgba(181, 41, 78, 0.35);
          text-transform: uppercase;
          align-self: flex-start;
          margin-bottom: 2px;
        }

        .reasons-text {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 14px;
          font-style: italic;
          line-height: 1.6;
          color: rgba(60, 15, 35, 0.75);
          text-align: center;
          margin: 0;
        }

        /* ── All Revealed Footer ── */
        .reasons-all-revealed {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 2rem;
          animation: reasons-fadeInUp 0.8s ease forwards;
          opacity: 0;
        }

        @keyframes reasons-fadeInUp {
          0%   { opacity: 0; transform: translateY(8px) }
          100% { opacity: 1; transform: translateY(0) }
        }

        .reasons-complete-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212, 160, 180, 0.4), transparent);
        }

        .reasons-complete-text {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: rgba(181, 41, 78, 0.45);
          margin: 0;
          white-space: nowrap;
          letter-spacing: 0.5px;
        }
      `}</style>
    </>
  )
}

export default Reasons