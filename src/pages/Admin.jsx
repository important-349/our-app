import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

function Admin() {
  const [password, setPassword] = useState('')
  const [date, setDate] = useState('')
  const [caption, setCaption] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('image')
  const [extraUrls, setExtraUrls] = useState('')
  const [status, setStatus] = useState('')
  const [entries, setEntries] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = () => {
    axios.get(`${API}/api/timeline`)
      .then(res => setEntries(res.data))
      .catch(() => {})
  }

  const resetForm = () => {
    setDate('')
    setCaption('')
    setMediaUrl('')
    setMediaType('image')
    setExtraUrls('')
    setEditingId(null)
  }

  const startEdit = (entry) => {
    setEditingId(entry._id)
    setDate(entry.date || '')
    setCaption(entry.caption || '')
    setMediaUrl(entry.mediaUrl || '')
    setMediaType(entry.mediaType || 'image')
    setExtraUrls(entry.extraMediaUrls || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitTimeline = async () => {
    setStatus('')
    try {
      if (editingId) {
        const res = await axios.put(`${API}/api/timeline/${editingId}`, {
          date, caption, mediaUrl, mediaType,
          extraMediaUrls: extraUrls,
          password
        })
        setStatus('Memory updated')
        setEntries(entries.map(e => e._id === editingId ? res.data : e))
      } else {
        const res = await axios.post(`${API}/api/timeline`, {
          date, caption, mediaUrl, mediaType,
          extraMediaUrls: extraUrls,
          password
        })
        setStatus('Memory added')
        setEntries([...entries, res.data])
      }
      resetForm()
    } catch (err) {
      setStatus('Wrong password or something went wrong.')
    }
  }

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this memory?')) return
    try {
      await axios.delete(`${API}/api/timeline/${id}`, { data: { password } })
      setEntries(entries.filter(e => e._id !== id))
    } catch (err) {
      alert('Error deleting — check your password is entered above')
    }
  }

  return (
    <>
      <div className="admin-page">
        <div className="admin-header">
          <div className="admin-icon-glow">
            <div className="admin-icon-dot" />
          </div>
          <h1 className="admin-title">Admin</h1>
        </div>

        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-input"
        />

        <div className="admin-divider" />

        <h2 className="admin-section-title">
          {editingId ? 'Edit memory' : 'Add timeline memory'}
        </h2>

        <input
          placeholder="Date (e.g. June 27, 2025)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="admin-input"
        />
        <textarea
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="admin-textarea"
        />
        <input
          placeholder="Main Cloudinary URL (cover photo/video)"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          className="admin-input"
        />
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          className="admin-input admin-select"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <textarea
          placeholder="Extra photo/video URLs, separated by commas (optional)"
          value={extraUrls}
          onChange={(e) => setExtraUrls(e.target.value)}
          className="admin-textarea"
        />
        <p className="admin-helper-text">
          Paste multiple Cloudinary links separated by commas to make this post a swipeable gallery.
        </p>

        <button onClick={submitTimeline} className="admin-btn-primary">
          {editingId ? 'Save changes' : 'Add memory'}
        </button>
        {editingId && (
          <button onClick={resetForm} className="admin-btn-cancel">
            Cancel edit
          </button>
        )}
        {status && <p className="admin-status">{status}</p>}

        <div className="admin-divider" />

        <h2 className="admin-section-title">Your memories ({entries.length})</h2>
        {entries.length === 0 && <p className="admin-empty">No memories yet</p>}

        {entries.map(e => (
          <div key={e._id} className="admin-entry-card">
            <p className="admin-entry-date">{e.date}</p>
            <p className="admin-entry-caption">{e.caption}</p>
            {e.extraMediaUrls && e.extraMediaUrls.trim().length > 0 && (
              <p className="admin-entry-extra">has extra media</p>
            )}
            <div className="admin-entry-buttons">
              <button onClick={() => startEdit(e)} className="admin-btn-edit">
                Edit
              </button>
              <button onClick={() => deleteEntry(e._id)} className="admin-btn-delete">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .admin-page {
          max-width: 460px;
          margin: 0 auto;
          padding: 2.5rem 1.2rem 4rem;
        }

        .admin-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.6rem;
        }

        .admin-icon-glow {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 200, 215, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212, 160, 180, 0.3);
          flex-shrink: 0;
        }

        .admin-icon-dot {
          width: 8px;
          height: 8px;
          background: rgba(181, 41, 78, 0.7);
          border-radius: 50%;
        }

        .admin-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 400;
          font-size: 26px;
          color: rgba(80, 20, 45, 0.9);
          margin: 0;
        }

        .admin-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,160,180,0.3), transparent);
          margin: 1.8rem 0;
        }

        .admin-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 400;
          font-size: 19px;
          color: rgba(80, 20, 45, 0.85);
          margin: 0 0 1rem;
        }

        .admin-input, .admin-textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(212, 160, 180, 0.3);
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(10px);
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 14px;
          color: rgba(50, 15, 30, 0.85);
          margin-bottom: 10px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.25s ease, background 0.25s ease;
        }

        .admin-input::placeholder, .admin-textarea::placeholder {
          color: rgba(181, 100, 140, 0.45);
        }

        .admin-input:focus, .admin-textarea:focus {
          border-color: rgba(181, 41, 78, 0.4);
          background: rgba(255, 255, 255, 0.75);
        }

        .admin-textarea {
          height: 80px;
          resize: vertical;
          font-style: italic;
        }

        .admin-select {
          cursor: pointer;
        }

        .admin-helper-text {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 12px;
          font-style: italic;
          color: rgba(140, 80, 110, 0.55);
          margin: 0 0 1rem;
        }

        .admin-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, rgba(181,41,78,0.9), rgba(140,20,55,0.85));
          color: rgba(255, 235, 242, 0.95);
          border: 1px solid rgba(255, 180, 200, 0.2);
          border-radius: 999px;
          padding: 12px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 15px;
          letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(181, 41, 78, 0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(181, 41, 78, 0.3);
        }

        .admin-btn-cancel {
          width: 100%;
          padding: 11px;
          margin-top: 8px;
          cursor: pointer;
          background: rgba(255,255,255,0.4);
          border: 1px solid rgba(212,160,180,0.3);
          border-radius: 999px;
          font-family: 'EB Garamond', Georgia, serif;
          font-style: italic;
          font-size: 13px;
          color: rgba(140, 80, 110, 0.7);
        }

        .admin-status {
          font-family: 'EB Garamond', Georgia, serif;
          font-style: italic;
          font-size: 13px;
          color: rgba(140, 60, 90, 0.65);
          margin-top: 0.8rem;
          text-align: center;
        }

        .admin-empty {
          font-family: 'EB Garamond', Georgia, serif;
          font-style: italic;
          font-size: 13px;
          color: rgba(140, 80, 110, 0.45);
        }

        .admin-entry-card {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(212, 160, 180, 0.22);
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 10px;
        }

        .admin-entry-date {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 11px;
          font-style: italic;
          letter-spacing: 1px;
          color: rgba(181, 41, 78, 0.5);
          text-transform: uppercase;
          margin: 0 0 4px;
        }

        .admin-entry-caption {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 14px;
          color: rgba(50, 20, 35, 0.8);
          margin: 0 0 4px;
        }

        .admin-entry-extra {
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 12px;
          font-style: italic;
          color: rgba(181, 41, 78, 0.55);
          margin: 0 0 8px;
        }

        .admin-entry-buttons {
          display: flex;
          gap: 8px;
        }

        .admin-btn-edit, .admin-btn-delete {
          background: transparent;
          border-radius: 999px;
          padding: 6px 16px;
          font-family: 'EB Garamond', Georgia, serif;
          font-size: 12px;
          cursor: pointer;
        }

        .admin-btn-edit {
          border: 1px solid rgba(100, 140, 200, 0.4);
          color: rgba(60, 90, 150, 0.8);
        }

        .admin-btn-delete {
          border: 1px solid rgba(212, 160, 180, 0.4);
          color: rgba(181, 41, 78, 0.7);
        }
      `}</style>
    </>
  )
}

export default Admin