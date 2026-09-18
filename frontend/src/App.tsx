import { useState } from 'react'
import './App.css'

type Listing = {
  id: number
  title: string
  price: string
  location: string
  category: string
  image: string
  condition: string
  seller: string
}

const categories = ['All listings', 'Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Tickets', 'Free & cheap']

const listings: Listing[] = [
  { id: 1, title: 'MacBook Air M2, 13-inch', price: '$650', location: 'North Providence', category: 'Electronics', image: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85', condition: 'Like new', seller: 'Maya R.' },
  { id: 2, title: 'Calculus: Early Transcendentals', price: '$35', location: 'College Hill', category: 'Textbooks', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85', condition: 'Good condition', seller: 'Evan T.' },
  { id: 3, title: 'Mid-century desk and chair set', price: '$120', location: 'Fox Point', category: 'Furniture', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6b5?auto=format&fit=crop&w=900&q=85', condition: 'Good condition', seller: 'Jordan K.' },
  { id: 4, title: 'Vintage varsity jacket', price: '$48', location: 'Wayland Square', category: 'Clothing', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85', condition: 'Gently used', seller: 'Sam L.' },
  { id: 5, title: 'Sony noise-canceling headphones', price: '$90', location: 'Elmwood', category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', condition: 'Like new', seller: 'Priya S.' },
  { id: 6, title: 'IKEA KALLAX shelf unit', price: '$30', location: 'Mount Pleasant', category: 'Furniture', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=900&q=85', condition: 'Good condition', seller: 'Chris W.' },
]

function App() {
  const [activeCategory, setActiveCategory] = useState('All listings')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<number[]>([])
  const [showSellForm, setShowSellForm] = useState(false)

  const visibleListings = listings.filter((listing) => {
    const matchesCategory = activeCategory === 'All listings' || listing.category === activeCategory
    const searchText = `${listing.title} ${listing.category} ${listing.location}`.toLowerCase()
    return matchesCategory && searchText.includes(search.toLowerCase())
  })

  function toggleFavorite(id: number) {
    setFavorites((current) => current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id])
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-top page-width">
          <a className="wordmark" href="#top" aria-label="RenSeller home"><span>ren</span>seller</a>
          <p className="campus-note">The student marketplace for Providence</p>
          <nav className="account-nav" aria-label="Account navigation">
            <button className="text-button" type="button">Messages</button>
            <button className="text-button" type="button">Sign in</button>
            <button className="sell-button" type="button" onClick={() => setShowSellForm(true)}>Sell an item <span>+</span></button>
          </nav>
        </div>
        <div className="search-row page-width">
          <label className="search-box"><span className="search-icon" aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for anything" aria-label="Search listings" />{search && <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="Clear search">×</button>}</label>
          <button className="location-button" type="button"><span aria-hidden="true">⌖</span> Providence, RI <b>⌄</b></button>
          <button className="search-button" type="button" aria-label="Submit search">Search</button>
        </div>
      </header>

      <main id="top">
        <section className="welcome-band"><div className="page-width welcome-content"><div><p className="eyebrow">BUILT FOR CAMPUS LIFE</p><h1>Find your next <em>good thing.</em></h1><p className="welcome-copy">Buy, sell, and trade with people around you. No shipping, no strangers, no hassle.</p><div className="trust-row"><span>✓ Student-first</span><span>✓ Local pickup</span><span>✓ No listing fees</span></div></div><div className="welcome-art" aria-hidden="true"><span className="art-tag">RPI</span><span className="art-circle">↗</span><span className="art-label">Pass it on.</span></div></div></section>

        <section className="category-section page-width" aria-label="Browse categories"><div className="section-heading"><div><p className="eyebrow">BROWSE THE NEIGHBORHOOD</p><h2>What are you looking for?</h2></div><button className="view-all" type="button">View all listings <span>→</span></button></div><div className="category-scroller">{categories.map((category) => <button key={category} type="button" className={activeCategory === category ? 'category-chip active' : 'category-chip'} onClick={() => setActiveCategory(category)}>{category}</button>)}</div></section>

        <section className="listings-section page-width"><div className="listing-heading"><div><h2>Freshly listed</h2><p>{visibleListings.length} items near Providence</p></div><button className="filter-button" type="button">Filter <span>☷</span></button></div>{visibleListings.length > 0 ? <div className="listing-grid">{visibleListings.map((listing) => <article className="listing-card" key={listing.id}><div className="listing-image-wrap"><img src={listing.image} alt={listing.title} /><button className={favorites.includes(listing.id) ? 'favorite-button saved' : 'favorite-button'} onClick={() => toggleFavorite(listing.id)} type="button" aria-label={favorites.includes(listing.id) ? 'Remove from favorites' : 'Save listing'}>{favorites.includes(listing.id) ? '♥' : '♡'}</button><span className="condition-tag">{listing.condition}</span></div><div className="listing-details"><div className="price-line"><h3>{listing.title}</h3><strong>{listing.price}</strong></div><p className="listing-meta">{listing.location} <span>·</span> {listing.category}</p><p className="seller-line"><span className="avatar">{listing.seller[0]}</span> Listed by {listing.seller}</p></div></article>)}</div> : <div className="empty-state"><strong>No listings found</strong><span>Try another search or category.</span></div>}</section>
      </main>

      <footer className="site-footer"><div className="page-width"><span className="wordmark small"><span>ren</span>seller</span><span>Made for students, by students.</span><span>© 2026 RenSeller</span></div></footer>

      {showSellForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSellForm(false) }}><div className="sell-modal" role="dialog" aria-modal="true" aria-labelledby="sell-title"><button className="modal-close" onClick={() => setShowSellForm(false)} type="button" aria-label="Close">×</button><p className="eyebrow">LIST SOMETHING NEW</p><h2 id="sell-title">What are you selling?</h2><p className="modal-copy">Add the basics now. You can fill in more details before posting.</p><label>Item title<input placeholder="e.g. Mini fridge, desk lamp..." /></label><label>Price<input placeholder="$ 0.00" /></label><div className="modal-actions"><button className="cancel-button" type="button" onClick={() => setShowSellForm(false)}>Cancel</button><button className="sell-button" type="button" onClick={() => setShowSellForm(false)}>Continue <span>→</span></button></div></div></div>}
    </div>
  )
}

export default App