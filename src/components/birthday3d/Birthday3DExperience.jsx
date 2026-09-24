import { useState, useEffect, useRef } from 'react'
import { initBirthdayCakeScene } from './BirthdayCakeScene'

/**
 * Isolated multi-stage interactive 3D birthday celebration experience.
 * Controlled by a single authoritative deterministic state machine:
 * 'intro' -> 'cake' -> 'wind' -> 'extinguishing' -> 'smoke' -> 'pause' -> 'poppers' -> 'celebration_settling' -> 'message'
 */
export function Birthday3DExperience({ musicUrl, onClose = () => {}, onOpen = () => {} }) {
  const [bdayNickname] = useState('Anguuu')
  const [sequenceStage, setSequenceStage] = useState('intro')
  const [blowReady, setBlowReady] = useState(false)
  const [isBlowing, setIsBlowing] = useState(false)
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const audioRef = useRef(null)

  // Trigger onOpen and play track if provided
  useEffect(() => {
    onOpen()
    if (musicUrl && audioRef.current) {
      audioRef.current.volume = 0.4
      audioRef.current.play().catch(() => {})
    }
  }, [musicUrl, onOpen])

  // Mount 3D scene once stage transitions to 'cake'
  useEffect(() => {
    if (sequenceStage === 'cake' && containerRef.current && !sceneRef.current) {
      sceneRef.current = initBirthdayCakeScene(containerRef.current, { nickname: bdayNickname })

      const timer = setTimeout(() => {
        setBlowReady(true)
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [sequenceStage, bdayNickname])

  // Full cleanup on unmount
  useEffect(() => {
    const audioEl = audioRef.current
    return () => {
      if (audioEl) {
        audioEl.pause()
      }
      if (sceneRef.current) {
        sceneRef.current.destroy()
        sceneRef.current = null
      }
    }
  }, [])

  const handleStartCake = () => {
    setSequenceStage('cake')
  }

  const handleBlowCandles = () => {
    // Strict guard: ignore if already blowing, not in cake stage, or scene unmounted
    if (isBlowing || sequenceStage !== 'cake' || !sceneRef.current) return
    setIsBlowing(true)

    // Launch single deterministic timeline
    sceneRef.current.runBlowSequence((stage) => {
      setSequenceStage(stage)
    })
  }

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    if (sceneRef.current) {
      sceneRef.current.destroy()
      sceneRef.current = null
    }
    onClose()
  }

  return (
    <>
      {musicUrl && <audio ref={audioRef} src={musicUrl} loop />}
      <div className="bday3d-overlay">
        {/* Subtle Ambient Vignette */}
        <div className="bday3d-ambient-glow" />

        {/* Global Modal Close Button */}
        <button className="bday3d-exit-btn" onClick={handleClose} aria-label="Close">
          ✕
        </button>

        {/* STEP 1: Birthday Introduction / Wish */}
        {sequenceStage === 'intro' && (
          <div className="bday3d-intro-card bday3d-card-fade">
            <div className="bday3d-icon-glow">
              <span className="bday3d-icon-cake">🎂</span>
            </div>
            <h2 className="bday3d-intro-title">A special moment, just for my {bdayNickname}</h2>
            <p className="bday3d-intro-body">
              {bdayNickname} 🥹❤️ ഇന്ന് നിന്റെ day alle… so first of all, കണ്ണടച്ച് നിനക്ക് ഏറ്റവും ഇഷ്ടപ്പെട്ട ഒരു wish മനസ്സിൽ ആലോചിക്ക്.
            </p>
            <button className="bday3d-btn-primary" onClick={handleStartCake}>
              Oru wish chyyy
            </button>
          </div>
        )}

        {/* 3D Scene Viewport: Persists throughout the experience once activated */}
        {sequenceStage !== 'intro' && (
          <div className="bday3d-scene-container" ref={containerRef} />
        )}

        {/* Stage 'cake': Interactive Rotation Hint & Blow Button */}
        {sequenceStage === 'cake' && (
          <div className={`bday3d-controls-stage ${blowReady ? 'ready' : ''}`}>
            <p className="bday3d-drag-hint">drag to turn your cake</p>
            <button
              className="bday3d-blow-btn"
              onClick={handleBlowCandles}
              disabled={isBlowing}
            >
              <span className="bday3d-blow-icon">✨</span>
              <span>ഇനി candles ഒക്കെ ഊതിക്കെടുത്തിക്കോ 😌🕯️</span>
              <span className="bday3d-blow-icon">✨</span>
            </button>
          </div>
        )}

        {/* Stages 'wind' and 'extinguishing': Focused Wind Banner & Breath Flow from face */}
        {(sequenceStage === 'wind' || sequenceStage === 'extinguishing') && (
          <>
            <div className="bday3d-breath-overlay" aria-hidden="true">
              <div className="bday3d-breath-glow" />
            </div>
            <div className="bday3d-blown-banner">
              <p className="bday3d-blown-text">Making a wish...</p>
            </div>
          </>
        )}

        {/* Stages 'smoke' and 'pause': Contemplative Moment */}
        {(sequenceStage === 'smoke' || sequenceStage === 'pause') && (
          <div className="bday3d-blown-banner">
            <p className="bday3d-blown-text">May your every wish come true...</p>
          </div>
        )}

        {/* Stages 'poppers' and 'celebration_settling': Celebratory Atmosphere */}
        {(sequenceStage === 'poppers' || sequenceStage === 'celebration_settling') && (
          <div className="bday3d-blown-banner">
            <p className="bday3d-blown-text">✨ Happy Birthday, {bdayNickname}! ✨</p>
          </div>
        )}

        {/* FINAL MESSAGE CARD: Small rectangle anchored below the page so cake is completely visible */}
        {sequenceStage === 'message' && (
          <div className="bday3d-bottom-message-card">
            <div className="bday3d-bottom-card-content">
              <div className="bday3d-bottom-header">
                <span className="bday3d-bottom-icon">✦</span>
                <h3 className="bday3d-bottom-title">Happy Birthday, {bdayNickname}</h3>
                <span className="bday3d-bottom-icon">✦</span>
              </div>
              <div className="bday3d-bottom-body">
                <p>
                  Enikk ariyilla nee entha wish cheyyunnath enn, but whatever it is, I genuinely hope you get it. ❤️
                </p>
                <p>
                  Pinne sorry for this 3D cake 😭 oru cake okke order cheyth tharanam enn undayirunnu, but paisa illa muthee 😭 pakshe oru divasam namukk orumichu oru real cake vech celebrate cheyyam. ❤️
                </p>
              </div>
              <button className="bday3d-bottom-btn" onClick={handleClose}>
                Return
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .bday3d-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2500;
          background: radial-gradient(circle at 50% 40%, rgba(20, 10, 15, 0.94) 0%, rgba(8, 4, 8, 0.98) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          animation: bday3d-overlayFade 0.6s ease-out forwards;
        }

        @keyframes bday3d-overlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .bday3d-ambient-glow {
          position: absolute;
          width: 650px;
          height: 650px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 180, 200, 0.12), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .bday3d-exit-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 2600;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 200, 220, 0.2);
          color: rgba(255, 220, 235, 0.85);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .bday3d-exit-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: scale(1.05);
        }

        /* ── Three.js Viewport ── */
        .bday3d-scene-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          cursor: grab;
        }

        .bday3d-scene-container:active {
          cursor: grabbing;
        }

        /* ── Cards (Intro & Final Message) ── */
        .bday3d-card-fade {
          position: relative;
          z-index: 5;
          width: 90%;
          max-width: 420px;
          background: rgba(18, 10, 15, 0.82);
          backdrop-filter: blur(28px) saturate(140%);
          -webkit-backdrop-filter: blur(28px) saturate(140%);
          border: 1px solid rgba(255, 210, 225, 0.22);
          border-radius: 28px;
          padding: 3.2rem 2.2rem;
          text-align: center;
          box-shadow: 0 16px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: bday3d-popIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes bday3d-popIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .bday3d-icon-glow {
          width: 48px;
          height: 48px;
          margin: 0 auto 1.4rem;
          border-radius: 50%;
          background: rgba(255, 200, 215, 0.12);
          border: 1px solid rgba(255, 200, 215, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bday3d-icon-cake, .bday3d-icon-sparkle {
          font-size: 20px;
          color: rgba(255, 210, 225, 0.9);
        }

        .bday3d-intro-title, .bday3d-message-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 28px;
          color: rgba(255, 240, 245, 0.95);
          margin: 0 0 1.2rem;
          letter-spacing: 0.5px;
          line-height: 1.3;
        }

        .bday3d-intro-body, .bday3d-message-body p {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 16px;
          font-style: italic;
          line-height: 1.8;
          color: rgba(240, 215, 225, 0.8);
          margin: 0 0 1rem;
        }

        .bday3d-signature {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 17px;
          font-style: italic;
          color: rgba(255, 200, 215, 0.9);
          margin: 1.5rem 0 2rem;
        }

        .bday3d-btn-primary {
          background: linear-gradient(135deg, rgba(200, 60, 95, 0.85) 0%, rgba(150, 30, 70, 0.8) 100%);
          color: rgba(255, 235, 242, 0.95);
          border: 1px solid rgba(255, 180, 200, 0.3);
          border-radius: 999px;
          padding: 13px 36px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          letter-spacing: 0.8px;
          cursor: pointer;
          box-shadow: 0 6px 28px rgba(181, 41, 78, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .bday3d-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 34px rgba(181, 41, 78, 0.45);
        }

        /* ── Controls during Cake Phase ── */
        .bday3d-controls-stage {
          position: absolute;
          bottom: 38px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.8s ease;
        }

        .bday3d-controls-stage.ready {
          opacity: 1;
          pointer-events: auto;
        }

        .bday3d-drag-hint {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 13px;
          font-style: italic;
          color: rgba(255, 200, 215, 0.55);
          margin: 0;
          letter-spacing: 1px;
        }

        .bday3d-blow-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 38px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 225, 235, 0.78) 100%);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 200, 215, 0.5);
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 17px;
          font-weight: 500;
          color: #6a1a32;
          cursor: pointer;
          box-shadow: 0 8px 36px rgba(255, 180, 200, 0.35), 0 0 20px rgba(255, 220, 230, 0.4);
          animation: bday3d-btnPulse 3.5s ease-in-out infinite;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .bday3d-blow-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 10px 42px rgba(255, 180, 200, 0.55);
        }

        .bday3d-blow-btn:disabled {
          opacity: 0.6;
          cursor: default;
          animation: none;
        }

        @keyframes bday3d-btnPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .bday3d-blow-icon {
          font-size: 14px;
          color: #c94065;
        }

        /* ── Transitional Blown Banner ── */
        .bday3d-blown-banner {
          position: absolute;
          bottom: 55px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          animation: bday3d-fadeRise 1.0s ease-out forwards;
        }

        @keyframes bday3d-fadeRise {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .bday3d-blown-text {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 19px;
          font-style: italic;
          color: rgba(255, 235, 245, 0.95);
          letter-spacing: 1.2px;
          margin: 0;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.6);
        }

        /* ── Bottom Compact Rectangle Message Card ── */
        .bday3d-bottom-message-card {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 600px;
          z-index: 25;
          background: rgba(18, 10, 16, 0.86);
          backdrop-filter: blur(28px) saturate(140%);
          -webkit-backdrop-filter: blur(28px) saturate(140%);
          border: 1px solid rgba(255, 205, 220, 0.28);
          border-radius: 20px;
          padding: 1.1rem 1.7rem;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.75), 0 0 24px rgba(255, 180, 205, 0.12);
          animation: bday3d-slideUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          text-align: center;
        }

        @keyframes bday3d-slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .bday3d-bottom-card-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .bday3d-bottom-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bday3d-bottom-icon {
          font-size: 13px;
          color: rgba(255, 200, 215, 0.85);
        }

        .bday3d-bottom-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 400;
          font-size: 21px;
          color: rgba(255, 240, 248, 0.98);
          margin: 0;
          letter-spacing: 0.8px;
        }

        .bday3d-bottom-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin: 0.1rem 0 0.35rem;
        }

        .bday3d-bottom-body p {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 15px;
          font-style: italic;
          line-height: 1.5;
          color: rgba(245, 225, 235, 0.9);
          margin: 0;
        }

        .bday3d-bottom-btn {
          background: linear-gradient(135deg, rgba(200, 60, 95, 0.88) 0%, rgba(150, 30, 70, 0.85) 100%);
          color: rgba(255, 235, 242, 0.98);
          border: 1px solid rgba(255, 180, 200, 0.35);
          border-radius: 999px;
          padding: 7px 26px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 14.5px;
          letter-spacing: 0.6px;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(181, 41, 78, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .bday3d-bottom-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(181, 41, 78, 0.5);
        }

        /* ── Breath Wind Glow Overlay ── */
        .bday3d-breath-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 65%;
          pointer-events: none;
          z-index: 6;
          overflow: hidden;
        }

        .bday3d-breath-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 238, 246, 0.32) 0%, rgba(255, 210, 230, 0.14) 40%, transparent 70%);
          filter: blur(16px);
          animation: bday3d-breathFlow 1.6s ease-out infinite;
        }

        @keyframes bday3d-breathFlow {
          0% {
            transform: translateX(-50%) translateY(0) scale(0.6, 0.4);
            opacity: 0.1;
          }
          35% {
            opacity: 0.7;
          }
          100% {
            transform: translateX(-50%) translateY(220px) scale(1.5, 1.9);
            opacity: 0;
          }
        }

        @media (max-width: 600px) {
          .bday3d-blow-btn {
            padding: 12px 20px;
            font-size: 15px;
            width: 90vw;
            max-width: 330px;
            justify-content: center;
          }
          .bday3d-controls-stage {
            bottom: 22px;
            width: 100%;
          }
          .bday3d-bottom-message-card {
            bottom: 12px;
            width: calc(100% - 24px);
            margin: 0 12px;
            padding: 1rem 1.1rem;
          }
          .bday3d-bottom-title {
            font-size: 20px;
          }
          .bday3d-bottom-body p {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  )
}

export default Birthday3DExperience
