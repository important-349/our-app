import { useEffect, useRef, useState } from 'react'

function Letter({
  dateText = 'June 27, 2026',
  salutation = 'My dearest,',
  paragraphs = [
    "One year ago, something wonderful started — you.",
    "This past year, you have made ordinary days feel like something worth remembering. Your smile is my favorite sight. Your presence is my favorite place.",
    "I'm so grateful you're mine, and I am yours.",
  ],
  signOff = '— forever yours',
}) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div
        ref={ref}
        className={`letter-wrap${visible ? ' letter-visible' : ''}`}
      >
        {/* Envelope flap decoration */}
        <div className="letter-flap-line" />

        {/* Paper grain texture overlay */}
        <div className="letter-grain" />

        {/* Wax seal accent */}
        <div className="letter-seal">
          <span className="letter-seal-glyph">✦</span>
        </div>

        <p className="letter-date">{dateText}</p>

        <p className="letter-salutation">{salutation}</p>

        <div className="letter-body">
          {paragraphs.map((p, index) => (
            <p
              key={index}
              className={`letter-paragraph letter-p${index + 1}`}
              style={
                visible
                  ? {
                      opacity: 1,
                      transform: 'translateY(0)',
                      transitionDelay: `${0.3 + index * 0.25}s`,
                    }
                  : undefined
              }
            >
              {p}
            </p>
          ))}
        </div>

        <div
          className="letter-divider"
          style={visible ? { opacity: 1, transitionDelay: `${0.3 + paragraphs.length * 0.25}s` } : undefined}
        >
          <span className="letter-divider-line" />
          <span className="letter-divider-dot">✦</span>
          <span className="letter-divider-line" />
        </div>

        <p
          className="letter-sign"
          style={visible ? { opacity: 1, transform: 'translateY(0)', transitionDelay: `${0.55 + paragraphs.length * 0.25}s` } : undefined}
        >
          {signOff}
        </p>
      </div>

      <style>{`
        .letter-wrap {
          position: relative;
          background: linear-gradient(
            160deg,
            rgba(255, 252, 250, 0.92) 0%,
            rgba(255, 245, 248, 0.88) 50%,
            rgba(252, 240, 244, 0.9) 100%
          );
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(212, 160, 180, 0.3);
          border-radius: 4px 4px 4px 4px;
          padding: 3rem 2.5rem 2.8rem;
          margin-bottom: 2rem;
          box-shadow:
            0 2px 8px rgba(181, 41, 78, 0.06),
            0 12px 40px rgba(181, 41, 78, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset,
            4px 4px 20px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .letter-wrap.letter-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Subtle left border accent like a real letter margin line */
        .letter-wrap::before {
          content: '';
          position: absolute;
          left: 2.1rem;
          top: 4.5rem;
          bottom: 2rem;
          width: 1px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(212, 160, 180, 0.25) 15%,
            rgba(212, 160, 180, 0.25) 85%,
            transparent
          );
        }

        .letter-flap-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(212, 160, 180, 0.4) 20%,
            rgba(181, 41, 78, 0.2) 50%,
            rgba(212, 160, 180, 0.4) 80%,
            transparent
          );
        }

        .letter-grain {
          position: absolute;
          inset: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
          border-radius: inherit;
        }

        .letter-seal {
          position: absolute;
          top: 1.2rem;
          right: 1.6rem;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 40% 35%,
            rgba(220, 160, 130, 0.6),
            rgba(181, 80, 60, 0.4)
          );
          border: 1px solid rgba(200, 120, 100, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(181, 80, 60, 0.15);
        }

        .letter-seal-glyph {
          font-size: 9px;
          color: rgba(255, 230, 220, 0.9);
          line-height: 1;
        }

        .letter-date {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 12px;
          font-style: italic;
          color: rgba(160, 100, 120, 0.6);
          letter-spacing: 1.5px;
          margin: 0 0 2rem 0;
          padding-left: 0.5rem;
        }

        .letter-salutation {
          font-family: 'Dancing Script', 'EB Garamond', 'Noto Sans Malayalam', Georgia, cursive, sans-serif;
          font-size: 24px;
          font-weight: 400;
          color: rgba(100, 30, 55, 0.85);
          margin: 0 0 1.4rem 0;
          padding-left: 0.5rem;
          line-height: 1.4;
        }

        .letter-body {
          padding-left: 0.5rem;
        }

        .letter-paragraph {
          font-family: 'EB Garamond', 'Noto Sans Malayalam', Georgia, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 16px;
          font-style: italic;
          line-height: 1.95;
          color: rgba(60, 30, 45, 0.75);
          margin: 0 0 1.1rem 0;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .letter-wrap.letter-visible .letter-p1 { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
        .letter-wrap.letter-visible .letter-p2 { opacity: 1; transform: translateY(0); transition-delay: 0.55s; }
        .letter-wrap.letter-visible .letter-p3 { opacity: 1; transform: translateY(0); transition-delay: 0.8s; }

        .letter-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.8rem 0 1.4rem;
          padding-left: 0.5rem;
          opacity: 0;
          transition: opacity 0.8s ease 1s;
        }

        .letter-wrap.letter-visible .letter-divider {
          opacity: 1;
        }

        .letter-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212, 160, 180, 0.35), transparent);
        }

        .letter-divider-dot {
          font-size: 8px;
          color: rgba(181, 41, 78, 0.35);
        }

        .letter-sign {
          font-family: 'Dancing Script', 'EB Garamond', 'Noto Sans Malayalam', Georgia, cursive, sans-serif;
          font-size: 22px;
          font-weight: 400;
          color: rgba(120, 30, 60, 0.7);
          margin: 0;
          padding-left: 0.5rem;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.8s ease 1.1s, transform 0.8s ease 1.1s;
        }

        .letter-wrap.letter-visible .letter-sign {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  )
}

export default Letter