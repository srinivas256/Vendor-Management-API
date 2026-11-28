import { useDeferredValue, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BriefcaseBusiness,
  CheckCircle2,
  HardHat,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getLaborers } from '../api/laborers'
import { useAuth } from '../auth/useAuth'

export function DashboardPage() {
  const { token, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const laborersQuery = useQuery({
    queryKey: ['laborers', deferredSearch],
    queryFn: () =>
      getLaborers(token!, { search: deferredSearch, location: '', skill: '' }),
    enabled: user?.role === 'vendor' && Boolean(token),
  })

  if (!user) return null

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <Link className="brand" to="/dashboard">
          <span className="brand-mark"><HardHat size={19} /></span>
          <span>Work<span className="brand-accent">link</span></span>
        </Link>
        <div className="topbar-right">
          <span className={`account-chip ${user.role}`}>
            {user.role === 'vendor' ? <BriefcaseBusiness size={14} /> : <HardHat size={14} />}
            {user.role === 'vendor' ? 'Vendor account' : 'Worker account'}
          </span>
          <button className="text-button signout-button" onClick={handleSignOut}>
            <LogOut size={16} /><span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {user.role === 'vendor' ? (
          <>
            <section className="welcome-row">
              <div>
                <p className="eyebrow">VENDOR WORKSPACE</p>
                <h1>Find your next great hire, {user.name.split(' ')[0]}.</h1>
                <p className="welcome-copy">Browse local workers and connect directly with the right people.</p>
              </div>
              <div className="welcome-icon"><Users size={27} /></div>
            </section>
            <section className="directory-section">
              <div className="section-heading">
                <div>
                  <h2>Worker directory</h2>
                  <p>Explore skills, experience, and contact details.</p>
                </div>
                <span className="results-count">
                  {laborersQuery.data ? `${laborersQuery.data.length} profiles` : 'Worker profiles'}
                </span>
              </div>
              <label className="search-box">
                <Search size={18} />
                <input
                  aria-label="Search workers"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, skill, or area"
                  value={search}
                />
              </label>

              {laborersQuery.isPending && <div className="state-card">Finding worker profiles…</div>}
              {laborersQuery.isError && (
                <div className="state-card state-error" role="alert">
                  {laborersQuery.error instanceof Error
                    ? laborersQuery.error.message
                    : 'Could not load worker profiles. Please try again.'}
                </div>
              )}
              {laborersQuery.data?.length === 0 && (
                <div className="state-card empty-state">
                  <Users size={23} />
                  <strong>No workers found</strong>
                  <span>Try a different name, skill, or location.</span>
                </div>
              )}
              {laborersQuery.data && laborersQuery.data.length > 0 && (
                <div className="worker-grid">
                  {laborersQuery.data.map((worker) => (
                    <article className="worker-card" key={worker.id}>
                      <div className="worker-card-top">
                        <div className="avatar">{worker.name.trim().charAt(0).toUpperCase()}</div>
                        <span className={worker.is_available ? 'availability available' : 'availability'}>
                          <span />{worker.is_available ? 'Available' : 'Not available'}
                        </span>
                      </div>
                      <h3>{worker.name}</h3>
                      <p className="worker-location">
                        <MapPin size={14} />{worker.location || 'Location not specified'}
                      </p>
                      <p className="worker-experience">
                        {worker.experience_years} {worker.experience_years === 1 ? 'year' : 'years'} experience
                      </p>
                      <div className="skill-list">
                        {worker.skills
                          ? worker.skills.split(',').map((skill) => (
                              <span className="skill-tag" key={skill.trim()}>{skill.trim()}</span>
                            ))
                          : <span className="muted-copy">Skills not added yet</span>}
                      </div>
                      <div className="contact-actions">
                        <a className="contact-link" href={`mailto:${worker.email}`}>
                          <Mail size={15} />Email
                        </a>
                        {worker.phone ? (
                          <a className="contact-link" href={`tel:${worker.phone}`}>
                            <Phone size={15} />Call
                          </a>
                        ) : (
                          <span className="contact-link disabled"><Phone size={15} />No phone</span>
                        )}
                      </div>
                      <p className="worker-email">{worker.email}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="labor-home">
            <div className="labor-welcome">
              <div className="labor-avatar"><HardHat size={28} /></div>
              <p className="eyebrow">YOUR WORKER PROFILE</p>
              <h1>Good to have you here, {user.name.split(' ')[0]}.</h1>
              <p className="welcome-copy">Your profile is ready. Vendors can discover your experience and contact you about work.</p>
              <div className="profile-status"><CheckCircle2 size={17} />Your profile is active</div>
            </div>
            <div className="profile-card">
              <div className="section-heading">
                <div><h2>Your details</h2><p>This is what vendors can see when they find your profile.</p></div>
              </div>
              <div className="profile-details">
                <div><span className="detail-label">Name</span><strong>{user.name}</strong></div>
                <div><span className="detail-label">Email</span><strong>{user.email}</strong></div>
                <div><span className="detail-label">Phone</span><strong>{user.phone || 'Not added'}</strong></div>
                <div><span className="detail-label">Location</span><strong>{user.location || 'Not added'}</strong></div>
                <div><span className="detail-label">Experience</span><strong>{user.experience_years} {user.experience_years === 1 ? 'year' : 'years'}</strong></div>
                <div className="profile-skills"><span className="detail-label">Skills</span>
                  <div className="skill-list">
                    {user.skills
                      ? user.skills.split(',').map((skill) => (
                          <span className="skill-tag" key={skill.trim()}>{skill.trim()}</span>
                        ))
                      : <strong>Add your skills when you register to help vendors find you.</strong>}
                  </div>
                </div>
              </div>
              <div className="profile-privacy"><CheckCircle2 size={17} />Only signed-in vendor accounts can browse worker contact details.</div>
            </div>
          </section>
        )}
      </main>
      <footer className="dashboard-footer">Worklink <span>·</span> Connecting people with good work.</footer>
    </div>
  )
}
