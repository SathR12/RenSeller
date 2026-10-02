import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import './App.css'
import { supabase } from './lib/supabase'

type Listing = {
  id: number
  title: string
  price: string
  category: string
  image: string
  condition: string
  seller: string
}

const categories = ['All listings', 'Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Tickets']

const listings: Listing[] = [
  { id: 1, title: 'MacBook Air M2, 13-inch', price: '$650', category: 'Electronics', image: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85', condition: 'Like new', seller: 'Maya R.' },
  { id: 2, title: 'Calculus: Early Transcendentals', price: '$35', category: 'Textbooks', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85', condition: 'Good condition', seller: 'Evan T.' },
  { id: 3, title: 'Mid-century desk and chair set', price: '$120', category: 'Furniture', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6b5?auto=format&fit=crop&w=900&q=85', condition: 'Good condition', seller: 'Jordan K.' },
  { id: 4, title: 'Vintage varsity jacket', price: '$48', category: 'Clothing', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85', condition: 'Gently used', seller: 'Sam L.' },
  { id: 5, title: 'Sony noise-canceling headphones', price: '$90', category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', condition: 'Like new', seller: 'Priya S.' },
  { id: 6, title: 'IKEA KALLAX shelf unit', price: '$30', category: 'Furniture', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=900&q=85', condition: 'Good condition', seller: 'Chris W.' },
]

function App() {
  const [activeCategory, setActiveCategory] = useState('All listings')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<number[]>([])
  const [showSellForm, setShowSellForm] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [session, setSession] = useState<Session | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authFullName, setAuthFullName] = useState('')
  const [authConfirmPassword, setAuthConfirmPassword] = useState('')
  const [graduationSemester, setGraduationSemester] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  const visibleListings = listings.filter((listing) => {
    const matchesCategory = activeCategory === 'All listings' || listing.category === activeCategory
    const searchText = `${listing.title} ${listing.category}`.toLowerCase()
    return matchesCategory && searchText.includes(search.toLowerCase())
  })

  function toggleFavorite(id: number) {
    setFavorites((current) => current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id])
  }

  function closeListingDetails() {
    setSelectedListing(null)
  }

  function openAuthForm(mode: 'sign-in' | 'sign-up' = 'sign-in') {
    setAuthMode(mode)
    setAuthMessage('')
    setShowAuthForm(true)
  }

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthMessage('')
    if (!supabase) {
      setAuthMessage('Add your Supabase variables to frontend/.env.local first.')
      return
    }

    const normalizedEmail = authEmail.trim().toLowerCase()
    if (authMode === 'sign-up') {
      if (!normalizedEmail.endsWith('@rpi.edu')) {
        setAuthMessage('Sign-up is limited to RPI email addresses.')
        return
      }
      if (!authFullName.trim()) {
        setAuthMessage('Enter your full name.')
        return
      }
      if (authPassword !== authConfirmPassword) {
        setAuthMessage('Passwords do not match.')
        return
      }
    }

    setAuthLoading(true)
    const result = authMode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password: authPassword })
      : await supabase.auth.signUp({
          email: normalizedEmail,
          password: authPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              username: normalizedEmail.split('@')[0],
              full_name: authFullName.trim(),
              graduation_semester: graduationSemester || null,
              graduation_year: graduationYear ? Number(graduationYear) : null,
            },
          },
        })
    setAuthLoading(false)

    if (result.error) {
      setAuthMessage(result.error.message)
      return
    }

    setAuthMessage(authMode === 'sign-up' ? 'Check your email to confirm your account.' : '')
    if (authMode === 'sign-in') setShowAuthForm(false)
  }

  async function signOut() {
    await supabase?.auth.signOut()
    setSession(null)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-top page-width">
          <a className="wordmark" href="#top" aria-label="RenSeller home"><span>REN</span>SELLER</a>
          <p className="campus-note">THE RPI STUDENT MARKETPLACE</p>
          <nav className="account-nav" aria-label="Account navigation">
            <button className="text-button" type="button">Messages</button>
            {session ? <button className="text-button" type="button" onClick={signOut}>Sign out</button> : <button className="text-button" type="button" onClick={() => openAuthForm()}>Sign in</button>}
            <button className="sell-button" type="button" onClick={() => setShowSellForm(true)}>Sell an item <span>+</span></button>
          </nav>
        </div>
        <div className="search-row page-width">
          <label className="search-box"><span className="search-icon" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for anything" aria-label="Search listings" />{search && <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="Clear search">×</button>}</label>
          <button className="search-button" type="button" aria-label="Submit search">Search</button>
        </div>
      </header>

      <main id="top">
        <section className="welcome-band"><div className="page-width welcome-content"><div><p className="eyebrow">BUILT FOR CAMPUS LIFE</p><h1>Find your next <em>good thing.</em></h1><p className="welcome-copy">Buy, sell, and trade with people around you. No shipping, no strangers, no hassle.</p><div className="trust-row"><span>✓ Student-first</span><span>✓ Local pickup</span><span>✓ No listing fees</span></div></div></div></section>

        <section className="category-section page-width" aria-label="Browse campus categories"><div className="section-heading"><div><p className="eyebrow">BROWSE RPI CAMPUS</p><h2>What are you looking for?</h2></div><button className="view-all" type="button">View all listings <span>→</span></button></div><div className="category-scroller">{categories.map((category) => <button key={category} type="button" className={activeCategory === category ? 'category-chip active' : 'category-chip'} onClick={() => setActiveCategory(category)}>{category}</button>)}</div></section>

        <section className="listings-section page-width"><div className="listing-heading"><div><h2>Freshly listed</h2><p>{visibleListings.length} items listed by RPI students</p></div><button className="filter-button" type="button">Filter <span>☷</span></button></div>{visibleListings.length > 0 ? <div className="listing-grid">{visibleListings.map((listing) => <article className="listing-card" key={listing.id} onClick={() => setSelectedListing(listing)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedListing(listing) }} role="button" tabIndex={0}><div className="listing-image-wrap"><img src={listing.image} alt={listing.title} /><button className={favorites.includes(listing.id) ? 'favorite-button saved' : 'favorite-button'} onClick={(event) => { event.stopPropagation(); toggleFavorite(listing.id) }} type="button" aria-label={favorites.includes(listing.id) ? 'Remove from favorites' : 'Save listing'}>{favorites.includes(listing.id) ? '♥' : '♡'}</button><span className="condition-tag">{listing.condition}</span></div><div className="listing-details"><div className="price-line"><h3>{listing.title}</h3><strong>{listing.price}</strong></div><p className="listing-meta">RPI campus <span>·</span> {listing.category}</p><p className="seller-line"><span className="avatar">{listing.seller[0]}</span> Listed by {listing.seller}</p></div></article>)}</div> : <div className="empty-state"><strong>No listings found</strong><span>Try another search or category.</span></div>}</section>
      </main>

      <footer className="site-footer"><div className="page-width"><span className="wordmark small"><span>REN</span>SELLER</span><span>MADE FOR STUDENTS, BY STUDENTS.</span><span>© 2026 RENSELLER</span></div></footer>

      {selectedListing && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeListingDetails() }}><div className="listing-modal" role="dialog" aria-modal="true" aria-labelledby="listing-title"><button className="modal-close" onClick={closeListingDetails} type="button" aria-label="Close listing details">×</button><div className="listing-modal-image"><img src={selectedListing.image} alt={selectedListing.title} /><span className="condition-tag">{selectedListing.condition}</span></div><div className="listing-modal-content"><div className="listing-modal-heading"><div><p className="eyebrow">{selectedListing.category}</p><h2 id="listing-title">{selectedListing.title}</h2></div><strong>{selectedListing.price}</strong></div><p className="listing-modal-meta">RPI campus <span>·</span> Listed by {selectedListing.seller}</p><p className="modal-copy">A campus pickup listing in {selectedListing.condition.toLowerCase()}. Message the seller to ask a question or arrange a convenient meeting time.</p><div className="listing-modal-actions"><button className="favorite-detail-button" type="button" onClick={() => toggleFavorite(selectedListing.id)}>{favorites.includes(selectedListing.id) ? '♥ Saved' : '♡ Save listing'}</button><button className="sell-button" type="button">Message seller <span>→</span></button></div></div></div></div>}

      {showSellForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSellForm(false) }}><div className="sell-modal" role="dialog" aria-modal="true" aria-labelledby="sell-title"><button className="modal-close" onClick={() => setShowSellForm(false)} type="button" aria-label="Close">×</button><p className="eyebrow">LIST SOMETHING NEW</p><h2 id="sell-title">What are you selling?</h2><p className="modal-copy">Add the basics now. You can fill in more details before posting.</p><label>Item title<input placeholder="e.g. Mini fridge, desk lamp..." /></label><label>Price<input placeholder="$ 0.00" /></label><div className="modal-actions"><button className="cancel-button" type="button" onClick={() => setShowSellForm(false)}>Cancel</button><button className="sell-button" type="button" onClick={() => setShowSellForm(false)}>Continue <span>→</span></button></div></div></div>}

      {showAuthForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAuthForm(false) }}><div className="sell-modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" onClick={() => setShowAuthForm(false)} type="button" aria-label="Close">×</button><p className="eyebrow">RENYSELLER ACCOUNT</p><h2 id="auth-title">{authMode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h2><p className="modal-copy">{authMode === 'sign-in' ? 'Sign in with your email and password.' : 'Create an account with your RPI email.'}</p><form onSubmit={submitAuth}>{authMode === 'sign-up' && <><label>Full name<input required autoComplete="name" value={authFullName} onChange={(event) => setAuthFullName(event.target.value)} placeholder="Your full name" /></label></>}<label>RPI email<input required autoComplete="email" type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@rpi.edu" /></label><label>Password<input required autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'} minLength={6} type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="At least 6 characters" /></label>{authMode === 'sign-up' && <><label>Confirm password<input required autoComplete="new-password" minLength={6} type="password" value={authConfirmPassword} onChange={(event) => setAuthConfirmPassword(event.target.value)} placeholder="Re-enter your password" /></label><div className="auth-form-row"><label>Graduation semester<select value={graduationSemester} onChange={(event) => setGraduationSemester(event.target.value)}><option value="">Optional</option><option value="Spring">Spring</option><option value="Summer">Summer</option><option value="Fall">Fall</option></select></label><label>Graduation year<input min="2020" max="2100" type="number" value={graduationYear} onChange={(event) => setGraduationYear(event.target.value)} placeholder="2028" /></label></div></>}{authMessage && <p className="auth-message" role="status">{authMessage}</p>}<div className="modal-actions"><button className="cancel-button" type="button" onClick={() => setAuthMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in')}>{authMode === 'sign-in' ? 'Create account' : 'Sign in instead'}</button><button className="sell-button" disabled={authLoading} type="submit">{authLoading ? 'Working...' : authMode === 'sign-in' ? 'Sign in' : 'Sign up'} <span>→</span></button></div></form></div></div>}
    </div>
  )
}

export default App