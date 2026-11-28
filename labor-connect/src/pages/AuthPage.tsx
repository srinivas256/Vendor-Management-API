import { useState, type FormEvent } from 'react'
import { ArrowRight, BriefcaseBusiness, Check, HardHat, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import type { AccountRole } from '../api/auth'

export function AuthPage() {
  const isRegister = useLocation().pathname === '/register'
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [role, setRole] = useState<AccountRole>('labor')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email')).trim()
    const password = String(formData.get('password'))

    try {
      if (isRegister) {
        await signUp({
          name: String(formData.get('name')).trim(),
          email,
          password,
          role,
          phone: String(formData.get('phone') ?? '').trim() || undefined,
          location: String(formData.get('location') ?? '').trim() || undefined,
          skills: role === 'labor' ? String(formData.get('skills') ?? '').trim() || undefined : undefined,
          experience_years:
            role === 'labor' ? Number(formData.get('experience_years') || 0) : 0,
        })
      } else {
        await signIn(email, password)
      }
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to continue. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Link className="brand brand-light" to="/">
          <span className="brand-mark"><HardHat size={20} /></span>
          <span>Work<span className="brand-accent">link</span></span>
        </Link>
        <div className="story-copy">
          <p className="eyebrow eyebrow-light">GOOD WORK STARTS HERE</p>
          <h1>People who build. Businesses that grow.</h1>
          <p className="story-description">
            A straightforward way for skilled workers and trusted vendors to find each other.
          </p>
          <div className="story-points">
            <div><Check size={17} /><span>Build a profile that puts your skills first</span></div>
            <div><Check size={17} /><span>Find reliable people for your next project</span></div>
            <div><ShieldCheck size={17} /><span>Your contact details are shared with signed-in vendors</span></div>
          </div>
        </div>
        <div className="story-footer">Made for the people who make things happen.</div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand">
            <Link className="brand" to="/">
              <span className="brand-mark"><HardHat size={19} /></span>
              <span>Work<span className="brand-accent">link</span></span>
            </Link>
          </div>
          <div className="form-heading">
            <span className="form-icon"><BriefcaseBusiness size={19} /></span>
            <p className="eyebrow">{isRegister ? 'JOIN THE COMMUNITY' : 'WELCOME BACK'}</p>
            <h2>{isRegister ? 'Create your account' : 'Sign in to Worklink'}</h2>
            <p>{isRegister ? 'Get started in just a couple of minutes.' : 'Your next opportunity is waiting.'}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="role-picker" aria-label="Choose account type">
                  <button
                    className={role === 'labor' ? 'role-option selected' : 'role-option'}
                    onClick={() => setRole('labor')}
                    type="button"
                  >
                    <HardHat size={17} /><span>I'm a worker</span>
                  </button>
                  <button
                    className={role === 'vendor' ? 'role-option selected' : 'role-option'}
                    onClick={() => setRole('vendor')}
                    type="button"
                  >
                    <BriefcaseBusiness size={17} /><span>I'm a vendor</span>
                  </button>
                </div>
                <label className="field">
                  <span>Full name</span>
                  <input autoComplete="name" name="name" placeholder="Your name" required maxLength={100} />
                </label>
              </>
            )}
            <label className="field">
              <span>Email address</span>
              <input autoComplete="email" name="email" type="email" placeholder="you@example.com" required />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                name="password"
                type="password"
                placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                minLength={isRegister ? 8 : undefined}
                maxLength={128}
                required
              />
            </label>
            {isRegister && (
              <div className="field-grid">
                <label className="field">
                  <span>Phone <small>Optional</small></span>
                  <input autoComplete="tel" name="phone" type="tel" placeholder="+1 555 123 4567" maxLength={20} />
                </label>
                <label className="field">
                  <span>City / area <small>Optional</small></span>
                  <input name="location" placeholder="e.g. Austin, TX" maxLength={120} />
                </label>
                {role === 'labor' && (
                  <>
                    <label className="field field-wide">
                      <span>Skills <small>Optional</small></span>
                      <input name="skills" placeholder="e.g. Carpentry, electrical, painting" maxLength={500} />
                    </label>
                    <label className="field field-wide">
                      <span>Years of experience</span>
                      <input name="experience_years" type="number" min={0} max={80} defaultValue={0} />
                    </label>
                  </>
                )}
              </div>
            )}
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary-button submit-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
              {!isSubmitting && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'New to Worklink?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
          <p className="privacy-note"><ShieldCheck size={14} /> Your information is handled securely.</p>
        </div>
      </section>
    </main>
  )
}
