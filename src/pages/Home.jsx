import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Countdown, { START_DATE } from '../components/Countdown'
import SpecialDayReveal from '../components/SpecialDayReveal'
import Letter from '../components/Letter'
import Birthday3DExperience from '../components/birthday3d/Birthday3DExperience'
import Reasons from '../components/Reasons'
import MessageBox from '../components/MessageBox'
import Timeline from '../components/Timeline'
import BirthdayHomeAmbience from '../components/BirthdayHomeAmbience'
import { SPECIAL_DAYS, NORMAL_AMBIENT_MUSIC_URL } from '../config/specialDays'
import { getActivePhase } from '../utils/specialDayPhase'
import { getEffectiveNow } from '../utils/effectiveNow'

const formattedStartDate = START_DATE.toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function Home({ role }) {
  const [letterOpen, setLetterOpen] = useState(false)
  const [birthdayCakeOpen, setBirthdayCakeOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(() => getEffectiveNow())
  const [phaseInfo, setPhaseInfo] = useState(() => {
    try {
      return getActivePhase(SPECIAL_DAYS, getEffectiveNow())
    } catch {
      return { day: null, phase: 'normal', daysUntil: 0, daysSince: 0, occurrenceNumber: null }
    }
  })
  const navigate = useNavigate()

  useEffect(() => {
    const updatePhase = () => {
      const now = getEffectiveNow()
      setCurrentDate(now)
      try {
        setPhaseInfo(getActivePhase(SPECIAL_DAYS, now))
      } catch {
        setPhaseInfo({ day: null, phase: 'normal', daysUntil: 0, daysSince: 0, occurrenceNumber: null })
      }
    }

    updatePhase()
    const interval = setInterval(updatePhase, 30000)
    return () => clearInterval(interval)
  }, [])

  const [birthdayNickname] = useState(() => (Math.random() < 0.5 ? 'Entte Anguu' : 'Anguuu'))

  const { day, phase, daysUntil, occurrenceNumber } = phaseInfo
  const isEvent = phase === 'event' && day != null
  const hasLetter = isEvent && Boolean(day.letter)

  const ambientAudioRef = useRef(null)
  const isDuckedRef = useRef(false)

  const isSpecialPhase = Boolean(day?.ambientMusicUrl && (phase === 'approaching' || phase === 'event' || phase === 'post'))
  const ambientSrc = isSpecialPhase ? day.ambientMusicUrl : NORMAL_AMBIENT_MUSIC_URL

  useEffect(() => {
    const audio = ambientAudioRef.current
    if (!audio) return

    audio.volume = 0.25
    audio.load()
    if (!isDuckedRef.current) {
      audio.play().catch(() => {})
    }

    const removeListeners = () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('pointerdown', handleInteraction)
    }

    const handleInteraction = () => {
      if (ambientAudioRef.current && ambientAudioRef.current.paused && !isDuckedRef.current) {
        ambientAudioRef.current
          .play()
          .then(() => {
            removeListeners()
          })
          .catch(() => {})
      }
    }

    window.addEventListener('click', handleInteraction, { passive: true })
    window.addEventListener('touchstart', handleInteraction, { passive: true })
    window.addEventListener('pointerdown', handleInteraction, { passive: true })

    return () => {
      removeListeners()
    }
  }, [ambientSrc])
  const isBirthdaySeason = day?.id === 'birthday' && (phase === 'approaching' || phase === 'event')

  let displayTitle = 'You & Me'
  if (isEvent && day) {
    if (day.type === 'birthday') {
      if (day.originYear && occurrenceNumber) {
        displayTitle = `Happy ${getOrdinal(occurrenceNumber)} Birthday, ${birthdayNickname}`
      } else {
        displayTitle = `Happy Birthday, ${birthdayNickname}`
      }
    } else {
      displayTitle = day.eventTitle
    }
  }

  const formattedToday = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <audio
        ref={ambientAudioRef}
        src={ambientSrc}
        loop
        preload="auto"
      />
      {isBirthdaySeason && !birthdayCakeOpen && <BirthdayHomeAmbience />}

      <div className="home-page">

        <div className="home-header">
          <div className="home-icon-glow">
            <div className="home-icon-heart" />
          </div>
          <h1 className="home-title">{displayTitle}</h1>
          <p className="home-subtitle">together since {formattedStartDate}</p>
          <p className="home-today">Today — {formattedToday}</p>
          {phase === 'approaching' && (
            <p className={`home-approaching${day?.id === 'birthday' ? ' home-approaching-birthday' : ''}`}>
              {day?.id === 'birthday' && <span className="home-approaching-sparkle">✦</span>}
              <span>{daysUntil === 1 ? 'something is coming in 1 day' : `something is coming in ${daysUntil} days`}</span>
              {day?.id === 'birthday' && <span className="home-approaching-sparkle">✦</span>}
            </p>
          )}
        </div>

        <Countdown />

        {isEvent && (
          <SpecialDayReveal
            dayId={day.id}
            eventTitle={displayTitle}
            revealLines={day.revealLines}
            buttonTexts={day.buttonTexts}
            musicUrl={day.musicUrl}
            signatureText={day.id === 'birthday' ? `Happy birthday, ${birthdayNickname}.` : day.signatureText}
            onCelebrationOpen={() => {
              isDuckedRef.current = true
              ambientAudioRef.current?.pause()
            }}
            onCelebrationClose={() => {
              isDuckedRef.current = false
              ambientAudioRef.current?.play().catch(() => {})
            }}
          />
        )}

        {isEvent && day.id === 'birthday' && (
          <div className="home-birthday-3d-trigger-wrap">
            <button
              className="home-birthday-3d-btn"
              onClick={() => {
                isDuckedRef.current = true
                ambientAudioRef.current?.pause()
                setBirthdayCakeOpen(true)
              }}
            >
              <div className="home-orbit-wrap">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <span
                    key={i}
                    className="home-orbit-sparkle-btn"
                    style={{
                      animationDuration: `${5.5 + (i % 3)}s`,
                    }}
                  >
                    ✦
                  </span>
                ))}
              </div>
              <span className="home-birthday-btn-sparkle">✦</span>
              <span>Onn tap chyth nokk </span>
              <span className="home-birthday-btn-sparkle">🎂</span>
            </button>
          </div>
        )}

        {birthdayCakeOpen && (
          <Birthday3DExperience
            musicUrl={day?.cakeMusicUrl}
            onOpen={() => {
              isDuckedRef.current = true
              ambientAudioRef.current?.pause()
            }}
            onClose={() => {
              isDuckedRef.current = false
              setBirthdayCakeOpen(false)
              ambientAudioRef.current?.play().catch(() => {})
            }}
          />
        )}

        {hasLetter && (
          !letterOpen ? (
            <div className="home-envelope" onClick={() => setLetterOpen(true)}>
              <div className="home-orbit-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                  <span
                    key={i}
                    className="home-orbit-sparkle-envelope"
                    style={{
                      animationDuration: `${7 + (i % 3)}s`,
                      animationDelay: `${i * 0.85}s`,
                    }}
                  >
                    ✦
                  </span>
                ))}
              </div>
              <div className="home-envelope-shimmer-container">
                <div className="home-envelope-shimmer" />
              </div>
              <p className="home-envelope-text"> ❤️ TAP HERE 🥹👉👈</p>
            </div>
          ) : (
            <Letter {...day.letter} />
          )
        )}

        <Timeline role={role} />
        {/* Reasons */}

        {/* MessageBox */}


        {role === 'you' && (
          <button
            onClick={() => navigate('/admin')}
            className="home-secret-btn"
            title=""
          >
            ✦
          </button>
        )}

      </div>

      <style>{`
        .home-page {
          max-width: 480px;
          margin: 0 auto;
          padding: 2.5rem 1.2rem 4rem;
          text-align: center;
          position: relative;
        }

        .home-header {
          margin-bottom: 2.2rem;
        }

        .home-icon-glow {
          width: 44px;
          height: 44px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          background: rgba(255, 200, 215, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: home-iconPulse 3.5s ease-in-out infinite;
          border: 1px solid rgba(212, 160, 180, 0.3);
        }

        .home-icon-heart {
          width: 12px;
          height: 12px;
          background: rgba(181, 41, 78, 0.7);
          border-radius: 50%;
        }

        @keyframes home-iconPulse {
          0%,100% { opacity: 0.6; box-shadow: 0 0 14px 2px rgba(255,200,215,0.25) }
          50%     { opacity: 1;   box-shadow: 0 0 26px 6px rgba(255,200,215,0.45) }
        }

        .home-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 400;
          font-size: 30px;
          letter-spacing: 0.3px;
          color: rgba(80, 20, 45, 0.9);
          margin: 0 0 0.5rem;
          line-height: 1.25;
        }

        .home-subtitle {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 15px;
          font-style: italic;
          letter-spacing: 1px;
          color: rgba(110, 45, 75, 0.85);
          margin: 0;
        }

        .home-today {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 14px;
          font-style: italic;
          letter-spacing: 1px;
          color: rgba(120, 50, 80, 0.80);
          margin: 6px 0 0;
        }

        .home-approaching {
          font-family: 'EB Garamond', 'Cormorant Garamond', Georgia, serif;
          font-size: 21px;
          font-style: italic;
          color: rgba(181, 41, 78, 0.88);
          margin: 0.9rem 0 0.3rem;
          letter-spacing: 0.8px;
        }

        .home-approaching-birthday {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 26px;
          border-radius: 999px;
          background: rgba(255, 240, 246, 0.72);
          border: 1px solid rgba(225, 150, 175, 0.38);
          box-shadow:
            0 4px 18px rgba(181, 41, 78, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.6) inset;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: home-approaching-pulse 3.2s ease-in-out infinite;
        }

        .home-approaching-sparkle {
          font-size: 13px;
          color: rgba(200, 100, 130, 0.8);
          animation: home-sparkle-spin 4s ease-in-out infinite alternate;
        }

        @keyframes home-approaching-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 18px rgba(181, 41, 78, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 6px 24px rgba(220, 80, 120, 0.2), 0 0 16px rgba(255, 180, 205, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
          }
        }

        @keyframes home-sparkle-spin {
          0% { transform: rotate(0deg) scale(0.9); opacity: 0.7; }
          100% { transform: rotate(180deg) scale(1.15); opacity: 1; }
        }

        .home-envelope {
          position: relative;
          background: linear-gradient(160deg, rgba(255, 248, 251, 0.75), rgba(255, 240, 246, 0.65));
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(212, 160, 180, 0.3);
          border-radius: 18px;
          padding: 2.2rem 1.5rem;
          margin-bottom: 2rem;
          cursor: pointer;
          overflow: visible;
          box-shadow: 0 4px 28px rgba(181, 41, 78, 0.07), inset 0 1px 0 rgba(255,255,255,0.6);
          animation: home-floatBtn 3.5s ease-in-out infinite, home-heartbeat 4s ease-in-out infinite;
          animation-delay: 1.2s, 1.2s;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .home-envelope:hover {
          animation-play-state: paused;
          transform: translateY(-4px);
          box-shadow: 0 10px 36px rgba(181, 41, 78, 0.16), inset 0 1px 0 rgba(255,255,255,0.7);
        }

        .home-envelope:active {
          transform: scale(0.98);
        }

        .home-envelope-shimmer-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: inherit;
          pointer-events: none;
        }

        .home-envelope-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 55%;
          height: 100%;
          border-radius: 18px;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: home-shimmerPass 7s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes home-shimmerPass {
          0%   { transform: translateX(-120%) }
          100% { transform: translateX(220%) }
        }

        .home-envelope-text {
          position: relative;
          z-index: 1;
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 17px;
          font-weight: 500;
          font-style: italic;
          color: rgba(120, 25, 60, 0.88);
          margin: 0;
          letter-spacing: 0.5px;
        }

        .home-secret-btn {
          position: fixed;
          bottom: 18px;
          left: 18px;
          background: transparent;
          border: none;
          font-size: 13px;
          color: rgba(181, 41, 78, 0.5);
          opacity: 0.18;
          cursor: pointer;
          padding: 8px;
          transition: opacity 0.3s ease;
        }

        .home-secret-btn:hover {
          opacity: 0.4;
        }

        .home-birthday-3d-trigger-wrap {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }

        .home-birthday-3d-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 30px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255, 245, 248, 0.9) 0%, rgba(255, 232, 240, 0.8) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 160, 180, 0.45);
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 17px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: rgba(120, 30, 60, 0.88);
          cursor: pointer;
          overflow: visible;
          box-shadow: 0 6px 24px rgba(181, 41, 78, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          animation: home-floatBtn 3.5s ease-in-out infinite, home-heartbeat 4s ease-in-out infinite;
          animation-delay: 0.6s, 0.6s;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .home-birthday-3d-btn:hover {
          animation-play-state: paused;
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(181, 41, 78, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .home-birthday-3d-btn:active {
          transform: scale(0.98);
        }

        .home-birthday-btn-sparkle {
          font-size: 13px;
          color: rgba(181, 41, 78, 0.7);
        }

        /* ── Orbiting Stars Animation for Button 2 & Envelope ── */
        .home-orbit-wrap {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
        }

        .home-orbit-sparkle-btn {
          position: absolute;
          left: 50%;
          top: 50%;
          font-size: 9px;
          margin-left: -5px;
          margin-top: -5px;
          color: rgba(200, 130, 150, 0.75);
          animation: home-orbit-btn 6s linear infinite;
          opacity: 0.8;
          text-shadow: 0 0 6px rgba(255, 180, 205, 0.7);
        }

        @keyframes home-orbit-btn {
          from { transform: rotate(0deg) scale(1.32, 0.7) translateX(95px) rotate(0deg); opacity: 0.8; }
          to   { transform: rotate(360deg) scale(1.32, 0.7) translateX(95px) rotate(-360deg); opacity: 0.8; }
        }

        .home-orbit-sparkle-envelope {
          position: absolute;
          left: 50%;
          top: 50%;
          font-size: 10px;
          margin-left: -5px;
          margin-top: -5px;
          color: rgba(200, 130, 150, 0.75);
          animation: home-orbit-env 7.5s linear infinite;
          opacity: 0.8;
          text-shadow: 0 0 8px rgba(255, 180, 205, 0.7);
        }

        @keyframes home-orbit-env {
          from { transform: rotate(0deg) scale(1.65, 0.52) translateX(140px) rotate(0deg); opacity: 0.8; }
          to   { transform: rotate(360deg) scale(1.65, 0.52) translateX(140px) rotate(-360deg); opacity: 0.8; }
        }

        @media (max-width: 600px) {
          .home-approaching {
            font-size: 18px;
          }
          .home-approaching-birthday {
            padding: 7px 18px;
            gap: 7px;
          }
          @keyframes home-orbit-env {
            from { transform: rotate(0deg) scale(1.25, 0.52) translateX(120px) rotate(0deg); opacity: 0.8; }
            to   { transform: rotate(360deg) scale(1.25, 0.52) translateX(120px) rotate(-360deg); opacity: 0.8; }
          }
          @keyframes home-orbit-btn {
            from { transform: rotate(0deg) scale(1.15, 0.65) translateX(80px) rotate(0deg); opacity: 0.8; }
            to   { transform: rotate(360deg) scale(1.15, 0.65) translateX(80px) rotate(-360deg); opacity: 0.8; }
          }
        }

        @media (max-width: 380px) {
          @keyframes home-orbit-env {
            from { transform: rotate(0deg) scale(1.0, 0.5) translateX(90px) rotate(0deg); opacity: 0.8; }
            to   { transform: rotate(360deg) scale(1.0, 0.5) translateX(90px) rotate(-360deg); opacity: 0.8; }
          }
          @keyframes home-orbit-btn {
            from { transform: rotate(0deg) scale(1.0, 0.55) translateX(65px) rotate(0deg); opacity: 0.8; }
            to   { transform: rotate(360deg) scale(1.0, 0.55) translateX(65px) rotate(-360deg); opacity: 0.8; }
          }
        }

        @keyframes home-floatBtn {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes home-heartbeat {
          0%,90%,100% {
            box-shadow: 0 0 0 1px rgba(212,160,180,0.3),
                        0 8px 32px rgba(181,41,78,0.15),
                        0 0 40px rgba(255,200,215,0.3);
          }
          93% {
            box-shadow: 0 0 0 1px rgba(212,160,180,0.5),
                        0 8px 36px rgba(181,41,78,0.25),
                        0 0 60px rgba(255,180,200,0.5);
          }
          96% {
            box-shadow: 0 0 0 1px rgba(212,160,180,0.3),
                        0 8px 32px rgba(181,41,78,0.15),
                        0 0 40px rgba(255,200,215,0.3);
          }
        }
      `}</style>
    </>
  )
}

export default Home