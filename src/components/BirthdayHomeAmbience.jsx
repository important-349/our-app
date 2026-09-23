import { useMemo } from 'react'

const CONFETTI_COLORS = [
  '#ff70a6', '#ff9770', '#ffd670', '#70d6ff', '#b388ff',
  '#ff85a1', '#7bed9f', '#ffbe0b', '#ff006e', '#8338ec',
  '#3a86ff', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a',
]

const BALLOON_GRADIENTS = [
  // Soft Rose Pink (translucent)
  'radial-gradient(circle at 35% 28%, rgba(255, 235, 242, 0.62), rgba(255, 145, 185, 0.40) 55%, rgba(219, 39, 119, 0.25))',
  // Baby Sky Blue (translucent)
  'radial-gradient(circle at 35% 28%, rgba(225, 244, 255, 0.62), rgba(125, 185, 255, 0.40) 55%, rgba(59, 130, 246, 0.25))',
  // Pastel Blush Pink (translucent)
  'radial-gradient(circle at 35% 28%, rgba(255, 225, 235, 0.62), rgba(251, 113, 133, 0.38) 55%, rgba(190, 24, 93, 0.22))',
  // Soft Powder Blue (translucent)
  'radial-gradient(circle at 35% 28%, rgba(220, 248, 255, 0.62), rgba(96, 165, 250, 0.38) 55%, rgba(37, 99, 235, 0.22))',
]

function BirthdayHomeAmbience() {
  const confettiPieces = useMemo(() => {
    // 20 pieces total: 9 left side, 9 right side, 2 center
    const positions = [
      // Left flank (9 pieces)
      { left: 3, drift: 10 },
      { left: 6, drift: -8 },
      { left: 10, drift: 12 },
      { left: 14, drift: -10 },
      { left: 18, drift: 14 },
      { left: 21, drift: -12 },
      { left: 24, drift: 9 },
      { left: 27, drift: -7 },
      { left: 12, drift: 15 },

      // Right flank (9 pieces)
      { left: 73, drift: 9 },
      { left: 76, drift: -11 },
      { left: 80, drift: 13 },
      { left: 84, drift: -10 },
      { left: 88, drift: 12 },
      { left: 91, drift: -14 },
      { left: 94, drift: 8 },
      { left: 97, drift: -6 },
      { left: 86, drift: 15 },

      // Central area (only 2 sparse pieces)
      { left: 43, drift: 6 },
      { left: 57, drift: -6 },
    ]

    return positions.map((pos, i) => {
      const shapeType = i % 4 // 0: rect, 1: square, 2: circle, 3: ribbon
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      const duration = 8 + ((i * 1.5) % 6) // 8s - 14s gentle fall
      const delay = -((i * 0.72) % 12) // negative delay so screen starts populated
      const spinDuration = 3 + (i % 4) // tumbling speed
      const opacity = 0.50 + ((i % 4) * 0.05) // 0.50 - 0.65 soft transparency

      let width = 8
      let height = 12
      let borderRadius = '2px'

      if (shapeType === 1) {
        width = 8
        height = 8
      } else if (shapeType === 2) {
        width = 7
        height = 7
        borderRadius = '50%'
      } else if (shapeType === 3) {
        width = 4
        height = 14
        borderRadius = '1px'
      }

      return {
        id: i,
        left: pos.left,
        color,
        width,
        height,
        borderRadius,
        duration,
        delay,
        drift: pos.drift,
        spinDuration,
        opacity,
      }
    })
  }, [])

  const balloons = useMemo(() => {
    // 4 balloons placed towards the edges so center content stays clean
    const positions = [
      { left: 8, colorIndex: 0 },   // pink on left
      { left: 24, colorIndex: 1 },  // blue on left-mid
      { left: 76, colorIndex: 2 },  // pink on right-mid
      { left: 91, colorIndex: 3 },  // blue on right
    ]
    return positions.map((pos, i) => {
      const gradient = BALLOON_GRADIENTS[pos.colorIndex % BALLOON_GRADIENTS.length]
      const scale = 0.88 + ((i % 3) * 0.08) // 0.88 - 1.04
      const duration = 18 + ((i * 2.8) % 7) // 18s - 25s slow rise
      const delay = -((i * 4.8) % 18) // staggered negative delays
      const sway = 24 + ((i * 8) % 20) // gentle sway
      const swayDuration = 4.5 + (i % 2)

      return {
        id: i,
        left: pos.left,
        gradient,
        scale,
        duration,
        delay,
        sway,
        swayDuration,
      }
    })
  }, [])

  return (
    <div className="home-birthday-ambience" aria-hidden="true">
      {/* Floating Confetti Layer */}
      {confettiPieces.map(c => (
        <div
          key={`confetti-${c.id}`}
          className="home-confetti-item"
          style={{
            left: `${c.left}%`,
            '--drift': `${c.drift}px`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <div
            className="home-confetti-inner"
            style={{
              width: `${c.width}px`,
              height: `${c.height}px`,
              backgroundColor: c.color,
              borderRadius: c.borderRadius,
              opacity: c.opacity,
              animationDuration: `${c.spinDuration}s`,
            }}
          />
        </div>
      ))}

      {/* Slowly Ascending Balloons Layer */}
      {balloons.map(b => (
        <div
          key={`balloon-${b.id}`}
          className="home-balloon-riser"
          style={{
            left: `${b.left}%`,
            '--sway': `${b.sway}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        >
          <div
            className="home-balloon-sway"
            style={{
              animationDuration: `${b.swayDuration}s`,
              transform: `scale(${b.scale})`,
            }}
          >
            {/* Balloon Body */}
            <div
              className="home-balloon-body"
              style={{ background: b.gradient }}
            >
              {/* Highlight reflection */}
              <div className="home-balloon-highlight" />
            </div>

            {/* Balloon Knot */}
            <div className="home-balloon-knot" />

            {/* Balloon String */}
            <svg
              className="home-balloon-string"
              width="16"
              height="45"
              viewBox="0 0 16 45"
              fill="none"
            >
              <path
                d="M8 0 C11 12, 5 22, 9 34 C11 40, 7 43, 8 45"
                stroke="rgba(200, 150, 175, 0.45)"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      ))}

      <style>{`
        .home-birthday-ambience {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        /* ── Confetti ── */
        .home-confetti-item {
          position: absolute;
          top: -25px;
          animation: home-confetti-fall linear infinite;
          will-change: transform;
        }

        .home-confetti-inner {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          animation: home-confetti-spin linear infinite;
          will-change: transform;
        }

        @keyframes home-confetti-fall {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(55vh) translateX(var(--drift, 25px));
            transform: translateY(55dvh) translateX(var(--drift, 25px));
          }
          100% {
            transform: translateY(108vh) translateX(calc(var(--drift, 25px) * -0.6));
            transform: translateY(108dvh) translateX(calc(var(--drift, 25px) * -0.6));
          }
        }

        @keyframes home-confetti-spin {
          0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          50% {
            transform: rotateX(180deg) rotateY(270deg) rotateZ(180deg);
          }
          100% {
            transform: rotateX(360deg) rotateY(540deg) rotateZ(360deg);
          }
        }

        /* ── Balloons ── */
        .home-balloon-riser {
          position: absolute;
          bottom: -110px;
          animation: home-balloon-rise linear infinite;
          will-change: transform;
        }

        .home-balloon-sway {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: home-balloon-sway ease-in-out infinite alternate;
          will-change: transform;
        }

        .home-balloon-body {
          position: relative;
          width: 35px;
          height: 45px;
          border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
          box-shadow:
            inset -2px -2px 6px rgba(0, 0, 0, 0.05),
            0 3px 12px rgba(220, 140, 170, 0.08);
          backdrop-filter: blur(1px);
          -webkit-backdrop-filter: blur(1px);
          opacity: 0.68;
        }

        .home-balloon-highlight {
          position: absolute;
          top: 6px;
          left: 6px;
          width: 7px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transform: rotate(-35deg);
          filter: blur(0.5px);
        }

        .home-balloon-knot {
          width: 4px;
          height: 3px;
          background: rgba(180, 120, 140, 0.35);
          border-radius: 2px;
          margin-top: -1px;
        }

        .home-balloon-string {
          margin-top: -1px;
          opacity: 0.45;
          filter: drop-shadow(0 1px 1px rgba(0,0,0,0.03));
        }

        @keyframes home-balloon-rise {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-120vh);
            transform: translateY(-120dvh);
          }
        }

        @keyframes home-balloon-sway {
          0% {
            transform: translateX(calc(var(--sway, 30px) * -0.5)) rotate(-4deg);
          }
          100% {
            transform: translateX(calc(var(--sway, 30px) * 0.5)) rotate(4deg);
          }
        }
      `}</style>
    </div>
  )
}

export default BirthdayHomeAmbience
