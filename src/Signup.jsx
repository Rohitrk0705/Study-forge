import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

function Signup() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("https://study-forge-4.onrender.com/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (response.ok) {
        alert("Account created! 💖")
        navigate("/")
      } else {
        alert(data.message || data.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="auth-split">
        <div className="auth-left">
          <div className="brand-badge">STUDY FORGE</div>
          <h1 className="brand-headline">
            Start your<br />
            <span className="brand-accent">journey</span><br />
            today.
          </h1>
          <p className="brand-sub">Join thousands of students who<br />hit their study goals every week.</p>
          <ul className="feature-list">
            {["📝 Smart note-taking","📚 Subject tracking","📅 Calendar reminders","📊 Study progress"].map(f => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Create account</h2>
              <p>Join the forge today</p>
            </div>

            <form onSubmit={handleSignup} className="auth-form">
              <div className="field-group">
                <label>Email</label>
                <div className="input-wrap">
                  <span className="input-icon">✉</span>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="field-group">
                <label>Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : "Create Account 🚀"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page { min-height:100vh; background:#0a0a0a; display:flex; align-items:stretch; overflow:hidden; position:relative; }
        .orb { position:fixed; border-radius:50%; filter:blur(80px); opacity:0.15; pointer-events:none; animation:orbFloat 8s ease-in-out infinite; }
        .orb-1 { width:400px; height:400px; background:#ff8c00; top:-100px; right:-100px; animation-delay:0s; }
        .orb-2 { width:300px; height:300px; background:#ff6b00; bottom:-80px; left:20%; animation-delay:3s; }
        .orb-3 { width:200px; height:200px; background:#ffaa00; top:40%; right:40%; animation-delay:5s; }
        @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.05)} }
        .auth-split { display:flex; width:100%; min-height:100vh; position:relative; z-index:1; }
        .auth-left { flex:1; display:flex; flex-direction:column; justify-content:center; padding:60px; background:linear-gradient(135deg,#111 0%,#0f0f0f 100%); border-right:1px solid #1e1e1e; }
        .brand-badge { display:inline-block; background:orange; color:#000; font-size:11px; font-weight:900; letter-spacing:3px; padding:6px 14px; border-radius:4px; margin-bottom:40px; width:fit-content; }
        .brand-headline { font-size:clamp(36px,4vw,56px); font-weight:900; color:#fff; line-height:1.1; margin:0 0 20px; letter-spacing:-1px; }
        .brand-accent { color:orange; }
        .brand-sub { color:#666; font-size:15px; line-height:1.7; margin-bottom:36px; }
        .feature-list { list-style:none; display:flex; flex-direction:column; gap:12px; }
        .feature-list li { font-size:14px; color:#888; display:flex; align-items:center; gap:10px; }
        .auth-right { width:480px; display:flex; align-items:center; justify-content:center; padding:40px; background:#0d0d0d; }
        .auth-card { width:100%; max-width:380px; }
        .auth-card-header { margin-bottom:36px; }
        .auth-card-header h2 { font-size:28px; font-weight:900; color:#fff; margin:0 0 6px; }
        .auth-card-header p { color:#555; font-size:14px; margin:0; }
        .auth-form { display:flex; flex-direction:column; gap:20px; }
        .field-group { display:flex; flex-direction:column; gap:8px; }
        .field-group label { font-size:12px; font-weight:700; color:#888; letter-spacing:1px; text-transform:uppercase; }
        .input-wrap { position:relative; }
        .input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; }
        .input-wrap input { width:100%; padding:14px 14px 14px 42px; background:#161616; border:1.5px solid #222; border-radius:10px; color:#fff; font-size:14px; font-family:inherit; box-sizing:border-box; transition:border-color 0.2s; margin:0; }
        .input-wrap input:focus { outline:none; border-color:orange; }
        .auth-btn { margin-top:8px; padding:15px; background:orange; border:none; border-radius:10px; color:#000; font-size:15px; font-weight:900; font-family:inherit; cursor:pointer; letter-spacing:0.5px; transition:transform 0.2s,box-shadow 0.2s; width:100%; }
        .auth-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(255,165,0,0.35); }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .spinner { display:inline-block; width:16px; height:16px; border:2px solid #000; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; vertical-align:middle; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .auth-switch { text-align:center; margin-top:24px; color:#555; font-size:13px; }
        .auth-switch a { color:orange; text-decoration:none; font-weight:700; }
        .auth-switch a:hover { text-decoration:underline; }
        @media (max-width:768px) { .auth-left{display:none} .auth-right{width:100%} }
      `}</style>
    </div>
  )
}

export default Signup
