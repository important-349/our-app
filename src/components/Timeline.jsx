import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

function Timeline({ role }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeGallery, setActiveGallery] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState({})

  useEffect(() => {
    axios.get(`${API}/api/timeline`)
      .then(res => {
        setEntries(res.data)
        res.data.forEach(entry => loadComments(entry._id))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const loadComments = (postId) => {
    axios.get(`${API}/api/comments/${postId}`)
      .then(res => setComments(prev => ({ ...prev, [postId]: res.data })))
      .catch(() => {})
  }

  const submitComment = async (postId) => {
    const text = newComment[postId]
    if (!text || !text.trim()) return
    try {
      await axios.post(`${API}/api/comments`, { postId, text, author: role })
      setNewComment(prev => ({ ...prev, [postId]: '' }))
      loadComments(postId)
    } catch (err) {}
  }

  const allMedia = (entry) => {
    const main = { url: entry.mediaUrl, type: entry.mediaType }
    const extras = (entry.extraMediaUrls || '')
      .split(',')
      .map(u => u.trim())
      .filter(u => u.length > 0)
      .map(u => ({
        url: u,
        type: u.endsWith('.mp4') || u.includes('/video/') ? 'video' : 'image'
      }))
    return [main, ...extras]
  }

  const openGallery = (entry) => {
    const hasExtra = entry.extraMediaUrls && entry.extraMediaUrls.trim().length > 0
    if (!hasExtra) return
    setActiveGallery(entry)
    setActiveIndex(0)
  }

  const closeGallery = () => {
    setActiveGallery(null)
    setActiveIndex(0)
  }

  const nextImage = () => {
    const media = allMedia(activeGallery)
    setActiveIndex((activeIndex + 1) % media.length)
  }

  const prevImage = () => {
    const media = allMedia(activeGallery)
    setActiveIndex((activeIndex - 1 + media.length) % media.length)
  }

  if (loading) return null
  if (entries.length === 0) return null

  return (
    <>
      <div style={styles.wrap}>
        <h2 style={styles.title}>Our Story</h2>
        <p style={styles.hint}>every moment, from the start</p>

        <div style={styles.feed}>
          {entries.map((e, idx) => {
            const hasExtra = e.extraMediaUrls && e.extraMediaUrls.trim().length > 0
            const postComments = comments[e._id] || []

            return (
              <div key={e._id} style={styles.cardWrap}>
                {/* Timeline node + line */}
                <div style={styles.lineCol}>
                  <div style={styles.node}>
                    <div style={styles.nodeDot} />
                    <div style={styles.nodeRing} />
                  </div>
                  {idx < entries.length - 1 && <div style={styles.lineSegment} />}
                </div>

                {/* Card */}
                <div style={styles.card}>
                  <div style={styles.shimmer} />

                  <p style={styles.date}>{e.date}</p>

                  <div
                    style={styles.mediaWrap}
                    onClick={() => openGallery(e)}
                  >
                    {e.mediaType === 'video' ? (
                      <video src={e.mediaUrl} controls style={styles.media} />
                    ) : (
                      <img
                        src={e.mediaUrl}
                        alt={e.caption}
                        style={{
                          ...styles.media,
                          cursor: hasExtra ? 'pointer' : 'default',
                        }}
                      />
                    )}
                    {hasExtra && (
                      <div style={styles.galleryBadge}>
                        <span>gallery</span>
                      </div>
                    )}
                  </div>

                  <p style={styles.caption}>{e.caption}</p>

                  <div style={styles.commentsWrap}>
                    {postComments.map(c => (
                      <div key={c._id} style={styles.commentRow}>
                        <span
                          style={{
                            ...styles.commentDot,
                            background: c.author === 'you'
                              ? 'rgba(100,160,220,0.6)'
                              : 'rgba(220,100,140,0.6)',
                          }}
                        />
                        <span style={styles.commentText}>{c.text}</span>
                      </div>
                    ))}

                    <div style={styles.commentInputRow}>
                      <input
                        style={styles.commentInput}
                        placeholder="Add a note…"
                        value={newComment[e._id] || ''}
                        onChange={ev =>
                          setNewComment(prev => ({ ...prev, [e._id]: ev.target.value }))
                        }
                        onKeyDown={ev => ev.key === 'Enter' && submitComment(e._id)}
                      />
                      <button
                        style={styles.commentSendBtn}
                        onClick={() => submitComment(e._id)}
                      >
                        {role === 'you' ? '💙' : '💗'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Gallery Modal — identical logic to original */}
      {activeGallery && (
        <div style={styles.overlay} onClick={closeGallery}>
          <div className="tl-modal-content" style={styles.modalContent} onClick={ev => ev.stopPropagation()}>
            <button style={styles.closeBtn} onClick={closeGallery}>✕</button>
            {(() => {
              const media = allMedia(activeGallery)
              const current = media[activeIndex]
              return (
                <>
                  {current.type === 'video' ? (
                    <video src={current.url} controls className="tl-modal-media" style={styles.modalMedia} />
                  ) : (
                    <img src={current.url} alt="" className="tl-modal-media" style={styles.modalMedia} />
                  )}
                  {media.length > 1 && (
                    <div style={styles.navRow}>
                      <button style={styles.navBtn} onClick={prevImage}>‹</button>
                      <p style={styles.counter}>{activeIndex + 1} / {media.length}</p>
                      <button style={styles.navBtn} onClick={nextImage}>›</button>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}

      <style>{`
        .tl-modal-content {
          max-height: 85vh;
          max-height: 85dvh;
        }

        .tl-modal-media {
          max-height: 70vh;
          max-height: 70dvh;
        }

        @keyframes tl-shimmerPass {
          0%   { transform: translateX(-120%) }
          100% { transform: translateX(220%) }
        }

        @keyframes tl-nodePulse {
          0%,100% { transform: scale(1);   opacity: 0.5 }
          50%     { transform: scale(1.35); opacity: 0.15 }
        }
      `}</style>
    </>
  )
}

const styles = {
  wrap: {
    marginBottom: '2rem',
  },

  title: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '26px',
    fontWeight: 300,
    color: 'rgba(80,20,45,0.85)',
    textAlign: 'center',
    margin: '0 0 6px',
    letterSpacing: '0.3px',
  },

  hint: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: '13px',
    fontStyle: 'italic',
    color: 'rgba(140,80,110,0.5)',
    textAlign: 'center',
    marginBottom: '2rem',
    letterSpacing: '1px',
  },

  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    padding: '0 0.25rem',
  },

  /* ── Row: node column + card ── */
  cardWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '16px',
    width: '100%',
  },

  /* ── Left column: dot + line ── */
  lineCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: '20px',
    paddingTop: '18px',
  },

  node: {
    position: 'relative',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  nodeDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(181,41,78,0.8), rgba(140,20,55,0.6))',
    boxShadow: '0 0 8px rgba(181,41,78,0.35)',
    zIndex: 2,
    flexShrink: 0,
  },

  nodeRing: {
    position: 'absolute',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '1px solid rgba(212,160,180,0.45)',
    animation: 'tl-nodePulse 3s ease-in-out infinite',
  },

  lineSegment: {
    width: '1px',
    flex: 1,
    minHeight: '32px',
    background: 'linear-gradient(to bottom, rgba(212,160,180,0.35), rgba(212,160,180,0.15))',
    marginTop: '4px',
    marginBottom: '0',
  },

  /* ── Card ── */
  card: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    background: 'linear-gradient(155deg, rgba(255,250,252,0.8) 0%, rgba(255,240,247,0.7) 100%)',
    backdropFilter: 'blur(20px) saturate(150%)',
    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
    border: '1px solid rgba(212,160,180,0.22)',
    borderRadius: '18px',
    overflow: 'hidden',
    marginBottom: '2rem',
    boxShadow: '0 2px 16px rgba(181,41,78,0.06), inset 0 1px 0 rgba(255,255,255,0.65)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },

  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '55%',
    height: '100%',
    background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.07), transparent)',
    animation: 'tl-shimmerPass 8s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },

  date: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: '11px',
    fontStyle: 'italic',
    letterSpacing: '1.5px',
    color: 'rgba(181,41,78,0.45)',
    textTransform: 'uppercase',
    margin: '0',
    padding: '1rem 1.2rem 0.4rem',
    position: 'relative',
    zIndex: 1,
  },

  mediaWrap: {
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },

  media: {
    width: '100%',
    display: 'block',
    objectFit: 'cover',
    maxHeight: '320px',
  },

  galleryBadge: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: 'rgba(10,5,8,0.55)',
    backdropFilter: 'blur(8px)',
    color: 'rgba(255,230,238,0.9)',
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: '11px',
    letterSpacing: '0.8px',
    padding: '4px 10px',
    borderRadius: '20px',
    border: '1px solid rgba(255,200,220,0.15)',
    cursor: 'pointer',
  },

  caption: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: '15px',
    fontStyle: 'italic',
    lineHeight: '1.65',
    color: 'rgba(50,15,35,0.72)',
    margin: '0',
    padding: '0.9rem 1.2rem',
    position: 'relative',
    zIndex: 1,
  },

  /* ── Comments ── */
  commentsWrap: {
    padding: '0.8rem 1.2rem 1.2rem',
    borderTop: '1px solid rgba(212,160,180,0.15)',
    position: 'relative',
    zIndex: 1,
  },

  commentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '6px',
  },

  commentDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },

  commentText: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: '14px',
    fontStyle: 'italic',
    color: 'rgba(60,20,40,0.65)',
    lineHeight: '1.5',
  },

  commentInputRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
  },

  commentInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(212,160,180,0.25)',
    background: 'rgba(255,255,255,0.55)',
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: '14px',
    fontStyle: 'italic',
    color: 'rgba(50,15,35,0.75)',
    outline: 'none',
  },

  commentSendBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '1px solid rgba(212,160,180,0.3)',
    background: 'linear-gradient(135deg, rgba(255,220,232,0.7), rgba(220,160,185,0.5))',
    fontSize: '14px',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Gallery Modal ── */
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(6,2,8,0.92)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '1rem',
  },

  modalContent: {
    position: 'relative',
    maxWidth: '90vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  modalMedia: {
    maxWidth: '100%',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },

  closeBtn: {
    position: 'absolute',
    top: '-44px',
    right: '0',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,220,235,0.85)',
    fontSize: '18px',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginTop: '14px',
  },

  navBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,220,235,0.85)',
    fontSize: '24px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },

  counter: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: '13px',
    fontStyle: 'italic',
    color: 'rgba(255,210,228,0.6)',
    margin: '0',
    letterSpacing: '1px',
  },
}

export default Timeline