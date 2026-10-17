import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

import './App.css'
import Auth from './Auth'

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

type ListingRow = {
  id: number
  name: string
  price: number
  category: string
  condtion: string
  profiles: { display_name: string } | null
}

function toListing(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.name,
    price: `$${Number(row.price).toFixed(2).replace(/\.00$/, '')}`,
    category: row.category,
    condition: row.condtion ?? 'Good condition',
    image: 'https://placehold.co/900x700?text=No+photo',
    seller: row.profiles?.display_name ?? 'RPI student',
  }
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All listings')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<number[]>([])
  const [showSellForm, setShowSellForm] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

   useEffect(() => {
    async function loadListings() {
      const { data, error } = await supabase
        .from('listings')
        .select('id, name, price, category, condtion, profiles(display_name)')
        .order('id', { ascending: false })

      if (error) setError(error.message)
      else setListings((data as unknown as ListingRow[]).map(toListing))
      setLoading(false)
    }
    loadListings()
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

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-top page-width">
          <a className="wordmark" href="#top" aria-label="RenSeller home"><span>REN</span>SELLER</a>
          <p className="campus-note">THE RPI STUDENT MARKETPLACE</p>
          <nav className="account-nav" aria-label="Account navigation">
            <button className="text-button" type="button">Messages</button>
            <Auth />
            <button className="sell-button" type="button" onClick={() => setShowSellForm(true)}>Sell an item <span>+</span></button>
          </nav>
        </div>
        <div className="search-row page-width">
          <label className="search-box"><span className="search-icon" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for anything" aria-label="Search listings" />{search && <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="Clear search">×</button>}</label>
          <button className="search-button" type="button" aria-label="Submit search">Search</button>
        </div>
      </header>

      <main id="top">
        <section className="welcome-band">
          <div className="page-width welcome-content">
            <div>
              <p className="eyebrow">BUILT FOR CAMPUS LIFE</p>
              <h1>Find your next <em>good thing.</em></h1>
              <p className="welcome-copy">Buy, sell, and trade with people around you. No shipping, no strangers, no hassle.</p>
              <div className="trust-row">
                <span>✓ Student-first</span>
                <span>✓ Local pickup</span>
                <span>✓ No listing fees</span>
              </div>
            </div>
          </div>
        </section>

                <section className="category-section page-width" aria-label="Browse campus categories">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BROWSE RPI CAMPUS</p>
              <h2>What are you looking for?</h2>
            </div>
            <button className="view-all" type="button">View all listings <span>→</span></button>
          </div>
          <div className="category-scroller">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? 'category-chip active' : 'category-chip'}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="listings-section page-width">
          <div className="listing-heading">
            <div>
              <h2>Freshly listed</h2>
              <p>{visibleListings.length} items listed by RPI students</p>
            </div>
            <button className="filter-button" type="button">Filter <span>☷</span></button>
          </div>

          {loading ? (
            <p>Loading…</p>
          ) : error ? (
            <p>{error}</p>
          ) : visibleListings.length > 0 ? (
            <div className="listing-grid">
              {visibleListings.map((listing) => (
                <article
                  className="listing-card"
                  key={listing.id}
                  onClick={() => setSelectedListing(listing)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') setSelectedListing(listing)
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="listing-image-wrap">
                    <img src={listing.image} alt={listing.title} />
                    <button
                      className={favorites.includes(listing.id) ? 'favorite-button saved' : 'favorite-button'}
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleFavorite(listing.id)
                      }}
                      type="button"
                      aria-label={favorites.includes(listing.id) ? 'Remove from favorites' : 'Save listing'}
                    >
                      {favorites.includes(listing.id) ? '♥' : '♡'}
                    </button>
                    <span className="condition-tag">{listing.condition}</span>
                  </div>
                  <div className="listing-details">
                    <div className="price-line">
                      <h3>{listing.title}</h3>
                      <strong>{listing.price}</strong>
                    </div>
                    <p className="listing-meta">RPI campus <span>·</span> {listing.category}</p>
                    <p className="seller-line">
                      <span className="avatar">{listing.seller[0]}</span> Listed by {listing.seller}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No listings found</strong>
              <span>Try another search or category.</span>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer"><div className="page-width"><span className="wordmark small"><span>REN</span>SELLER</span><span>MADE FOR STUDENTS, BY STUDENTS.</span><span>© 2026 RENSELLER</span></div></footer>

      {selectedListing && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeListingDetails() }}><div className="listing-modal" role="dialog" aria-modal="true" aria-labelledby="listing-title"><button className="modal-close" onClick={closeListingDetails} type="button" aria-label="Close listing details">×</button><div className="listing-modal-image"><img src={selectedListing.image} alt={selectedListing.title} /><span className="condition-tag">{selectedListing.condition}</span></div><div className="listing-modal-content"><div className="listing-modal-heading"><div><p className="eyebrow">{selectedListing.category}</p><h2 id="listing-title">{selectedListing.title}</h2></div><strong>{selectedListing.price}</strong></div><p className="listing-modal-meta">RPI campus <span>·</span> Listed by {selectedListing.seller}</p><p className="modal-copy">A campus pickup listing in {selectedListing.condition.toLowerCase()}. Message the seller to ask a question or arrange a convenient meeting time.</p><div className="listing-modal-actions"><button className="favorite-detail-button" type="button" onClick={() => toggleFavorite(selectedListing.id)}>{favorites.includes(selectedListing.id) ? '♥ Saved' : '♡ Save listing'}</button><button className="sell-button" type="button">Message seller <span>→</span></button></div></div></div></div>}

      {showSellForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSellForm(false) }}><div className="sell-modal" role="dialog" aria-modal="true" aria-labelledby="sell-title"><button className="modal-close" onClick={() => setShowSellForm(false)} type="button" aria-label="Close">×</button><p className="eyebrow">LIST SOMETHING NEW</p><h2 id="sell-title">What are you selling?</h2><p className="modal-copy">Add the basics now. You can fill in more details before posting.</p><label>Item title<input placeholder="e.g. Mini fridge, desk lamp..." /></label><label>Price<input placeholder="$ 0.00" /></label><div className="modal-actions"><button className="cancel-button" type="button" onClick={() => setShowSellForm(false)}>Cancel</button><button className="sell-button" type="button" onClick={() => setShowSellForm(false)}>Continue <span>→</span></button></div></div></div>}

    </div>
  )
}

export default App
