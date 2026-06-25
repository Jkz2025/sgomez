import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from "./Functions/CreateClient";

// ── Google OAuth inline (no dep on Button component) ──────────────────────────
const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        skipBrowserRedirect: false,
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account', access_type: 'offline' },
      },
    });
    if (error) throw error;
  } catch (err) {
    console.error('Google login error:', err.message);
  }
};

// ── Email/password login ───────────────────────────────────────────────────────
const signInWithEmail = async (email, password) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
};

// ── Component ──────────────────────────────────────────────────────────────────
const LoginForm = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rp-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
          background: #050b18;
          overflow: hidden;
          position: relative;
        }

        /* ── Animated background ── */
        .rp-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 70% 50%, rgba(26,86,219,.18) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 15% 80%, rgba(99,55,182,.15) 0%, transparent 60%),
            linear-gradient(160deg, #060d1f 0%, #0a1628 50%, #060e1e 100%);
        }
        .rp-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(30,80,200,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,80,200,.07) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .rp-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: drift 10s ease-in-out infinite alternate;
        }
        .rp-orb-1 { width:420px; height:420px; top:-80px; right:-60px; background: rgba(37,99,235,.12); animation-delay:0s; }
        .rp-orb-2 { width:300px; height:300px; bottom:-60px; left:-40px; background: rgba(109,40,217,.1); animation-delay:-4s; }
        @keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(20px,30px) scale(1.07); } }

        /* ── Split layout ── */
        .rp-left {
          display: none;
          flex: 1;
          position: relative; z-index: 1;
          flex-direction: column;
          justify-content: center;
          padding: 64px 56px;
        }
        @media(min-width:900px) { .rp-left { display: flex; } }

        .rp-brand-tag {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: #60a5fa;
          margin-bottom: 32px;
          display: flex; align-items: center; gap: 10px;
        }
        .rp-brand-tag::before {
          content: '';
          display: block; width: 28px; height: 2px;
          background: #3b82f6;
        }

        .rp-headline {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 3.5vw, 3.2rem);
          font-weight: 800;
          line-height: 1.1;
          color: #fff;
          margin-bottom: 24px;
        }
        .rp-headline em {
          font-style: normal;
          background: linear-gradient(90deg, #3b82f6, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .rp-desc {
          font-size: .95rem;
          color: #94a3b8;
          line-height: 1.7;
          max-width: 380px;
          margin-bottom: 48px;
        }

        .rp-stats {
          display: flex; gap: 40px;
        }
        .rp-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .rp-stat-label {
          font-size: .75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: .08em;
          margin-top: 4px;
        }

        /* ── Divider line ── */
        .rp-divider {
          position: absolute; top: 0; bottom: 0;
          left: 50%; width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(59,130,246,.2) 30%, rgba(59,130,246,.2) 70%, transparent);
          display: none;
        }
        @media(min-width:900px) { .rp-divider { display: block; } }

        /* ── Right / form panel ── */
        .rp-right {
          flex: 0 0 100%;
          position: relative; z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        @media(min-width:900px) { .rp-right { flex: 0 0 460px; padding: 64px 56px; } }

        .rp-card {
          width: 100%;
          max-width: 380px;
        }

        .rp-card-eyebrow {
          display: flex; align-items: center; gap: 8px;
          font-size: .72rem;
          font-weight: 600;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: #3b82f6;
          margin-bottom: 20px;
        }
        .rp-card-eyebrow svg { color: #3b82f6; }

        .rp-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.85rem;
          font-weight: 800;
          color: #f1f5f9;
          margin-bottom: 6px;
        }
        .rp-card-sub {
          font-size: .88rem;
          color: #64748b;
          margin-bottom: 36px;
        }

        /* ── Fields ── */
        .rp-field { margin-bottom: 18px; }
        .rp-label {
          display: block;
          font-size: .75rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: .05em;
          margin-bottom: 8px;
        }
        .rp-input-wrap { position: relative; }
        .rp-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #475569; pointer-events: none;
        }
        .rp-input {
          width: 100%;
          background: rgba(15,23,42,.6);
          border: 1px solid rgba(51,65,85,.8);
          border-radius: 10px;
          padding: 13px 14px 13px 42px;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          font-size: .9rem;
          transition: border-color .2s, box-shadow .2s;
          outline: none;
        }
        .rp-input::placeholder { color: #334155; }
        .rp-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,.12);
        }
        .rp-pass-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #475569; transition: color .2s; padding: 0;
        }
        .rp-pass-toggle:hover { color: #94a3b8; }

        /* ── Forgot ── */
        .rp-forgot {
          text-align: right;
          margin-top: -8px;
          margin-bottom: 24px;
        }
        .rp-forgot a {
          font-size: .78rem;
          color: #3b82f6;
          text-decoration: none;
          transition: color .2s;
        }
        .rp-forgot a:hover { color: #93c5fd; }

        /* ── Error ── */
        .rp-error {
          font-size: .8rem;
          color: #f87171;
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.2);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
        }

        /* ── Primary button ── */
        .rp-btn-primary {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: .9rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 24px rgba(37,99,235,.3);
          letter-spacing: .02em;
        }
        .rp-btn-primary:hover:not(:disabled) {
          opacity: .9;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(37,99,235,.4);
        }
        .rp-btn-primary:active { transform: translateY(0); }
        .rp-btn-primary:disabled { opacity: .6; cursor: not-allowed; }

        /* ── Separator ── */
        .rp-sep {
          display: flex; align-items: center; gap: 12px;
          margin: 22px 0;
        }
        .rp-sep::before, .rp-sep::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(51,65,85,.7);
        }
        .rp-sep span {
          font-size: .72rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: .08em;
          white-space: nowrap;
        }

        /* ── Google button ── */
        .rp-btn-google {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          border: 1px solid rgba(51,65,85,.9);
          background: rgba(15,23,42,.5);
          color: #cbd5e1;
          font-family: 'Inter', sans-serif;
          font-size: .88rem;
          font-weight: 500;
          cursor: pointer;
          transition: border-color .2s, background .2s, transform .15s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .rp-btn-google:hover {
          border-color: rgba(99,102,241,.5);
          background: rgba(30,41,59,.7);
          transform: translateY(-1px);
        }
        .rp-btn-google:active { transform: translateY(0); }

        /* Google 'G' SVG */
        .g-icon { width: 18px; height: 18px; flex-shrink: 0; }

        /* ── Footer ── */
        .rp-footer {
          text-align: center;
          margin-top: 28px;
          font-size: .8rem;
          color: #475569;
        }
        .rp-footer a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color .2s;
        }
        .rp-footer a:hover { color: #93c5fd; }

        /* ── Security badge ── */
        .rp-secure {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 24px;
          font-size: .7rem;
          color: #334155;
        }
        .rp-secure svg { color: #1e3a5f; }
      `}</style>

      <div className="rp-root">
        <div className="rp-bg">
          <div className="rp-grid" />
          <div className="rp-orb rp-orb-1" />
          <div className="rp-orb rp-orb-2" />
        </div>

        {/* ── Left panel ── */}
        <div className="rp-left">
          <div className="rp-brand-tag">Royal Prestige Cali</div>
          <h1 className="rp-headline">
            Gestiona tu negocio<br />
            con <em>inteligencia</em>.
          </h1>
          <p className="rp-desc">
            Plataforma exclusiva para asesores. Controla citas, clientes y programas
            de referidos desde un solo lugar.
          </p>
          <div className="rp-stats">
            <div>
              <div className="rp-stat-num">100%</div>
              <div className="rp-stat-label">Seguro</div>
            </div>
            <div>
              <div className="rp-stat-num">24/7</div>
              <div className="rp-stat-label">Disponible</div>
            </div>
            <div>
              <div className="rp-stat-num">IA</div>
              <div className="rp-stat-label">Integrada</div>
            </div>
          </div>
        </div>

        <div className="rp-divider" />

        {/* ── Right / form panel ── */}
        <div className="rp-right">
          <div className="rp-card">
            <div className="rp-card-eyebrow">
              <ShieldCheck size={10} />
              Acceso seguro
            </div>
            <h2 className="rp-card-title">Bienvenido de nuevo</h2>
            <p className="rp-card-sub">Inicia sesión para continuar</p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="rp-field">
                <label className="rp-label">Correo electrónico</label>
                <div className="rp-input-wrap">
                  <Mail size={16} className="rp-input-icon" />
                  <input
                    type="email"
                    className="rp-input"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="rp-field">
                <label className="rp-label">Contraseña</label>
                <div className="rp-input-wrap">
                  <Lock size={16} className="rp-input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="rp-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="rp-pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="rp-forgot">
                <a href="/recuperar">¿Olvidaste tu contraseña?</a>
              </div>

              {error && <div className="rp-error">{error}</div>}

              <button
                type="submit"
                className="rp-btn-primary"
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="rp-sep"><span>o continúa con</span></div>

            <button className="rp-btn-google" onClick={signInWithGoogle} type="button">
              <svg className="g-icon" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continuar con Google
            </button>

            <div className="rp-footer">
              ¿Aún no tienes cuenta?{' '}
              <a href="/registro">Regístrate gratis</a>
            </div>

            <div className="rp-secure">
              <ShieldCheck size={11} />
              Conexión cifrada · Royal Prestige Cali © 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;