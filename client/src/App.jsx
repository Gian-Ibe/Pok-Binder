import { useEffect, useMemo, useState } from 'react'
import './styles.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK_API !== 'false'

const EMPTY_CARD = {
  name: '',
  set: '',
  cardNumber: '',
  rarity: 'Common',
  condition: 'Near Mint',
  quantity: 1,
  image: '',
}

const MOCK_CARDS = []

function App() {
  const [page, setPage] = useState('home')
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [editingCard, setEditingCard] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState('All Rarities')

  const [form, setForm] = useState(EMPTY_CARD)
  const [saving, setSaving] = useState(false)

  /* =========================================================
     LOAD CARDS
  ========================================================= */

  useEffect(() => {
    loadCards()
  }, [])

  async function loadCards() {
    setLoading(true)
    setError('')

    if (USE_MOCK_API) {
      setCards(MOCK_CARDS)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/cards`)

      if (!response.ok) {
        throw new Error(
          `Unable to load cards. Server returned ${response.status}.`
        )
      }

      const data = await response.json()

      setCards(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)

      setError(
        'Could not connect to the card database. Please make sure the server is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function goHome() {
    setPage('home')
    setSelectedCard(null)
    setEditingCard(null)
    setError('')
  }

  function goCollection() {
    setPage('collection')
    setSelectedCard(null)
    setEditingCard(null)
    setError('')
  }

  function startAdd() {
    setForm(EMPTY_CARD)
    setEditingCard(null)
    setSelectedCard(null)
    setError('')
    setPage('add')
  }

  function openCard(card) {
    setSelectedCard(card)
    setEditingCard(null)
    setError('')
    setPage('details')
  }

  function startEdit(card) {
    setEditingCard(card)

    setForm({
      name: card.name || '',
      set: card.set || '',
      cardNumber: card.cardNumber || '',
      rarity: card.rarity || 'Common',
      condition: card.condition || 'Near Mint',
      quantity: card.quantity ?? 1,
      image: card.image || '',
    })

    setSelectedCard(card)
    setError('')
    setPage('add')
  }

  /* =========================================================
     FORM
  ========================================================= */

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function submitCard(event) {
    event.preventDefault()

    setError('')

    const quantity = Number(form.quantity)

    if (!form.name.trim()) {
      setError('Please enter the card name.')
      return
    }

    if (!form.set.trim()) {
      setError('Please enter the card set.')
      return
    }

    if (!form.cardNumber.trim()) {
      setError('Please enter the card number.')
      return
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Quantity must be at least 1.')
      return
    }

    const cardData = {
      name: form.name.trim(),
      set: form.set.trim(),
      cardNumber: form.cardNumber.trim(),
      rarity: form.rarity,
      condition: form.condition,
      quantity,
      image: form.image.trim(),
    }

    setSaving(true)

    if (USE_MOCK_API) {
      if (editingCard) {
        setCards((current) =>
          current.map((card) =>
            card.id === editingCard.id
              ? {
                  ...card,
                  ...cardData,
                }
              : card
          )
        )
      } else {
        const newCard = {
          id: Date.now(),
          ...cardData,
        }

        setCards((current) => [newCard, ...current])
      }

      setSaving(false)

      setPage('collection')
      setSelectedCard(null)
      setEditingCard(null)

      return
    }

    try {
      const url = editingCard
        ? `${API_BASE_URL}/api/cards/${editingCard.id}`
        : `${API_BASE_URL}/api/cards`

      const method = editingCard ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      })

      if (!response.ok) {
        const message = await response.text()

        throw new Error(
          message || `Request failed with status ${response.status}.`
        )
      }

      await loadCards()

      setPage('collection')
      setSelectedCard(null)
      setEditingCard(null)
      setForm(EMPTY_CARD)
    } catch (err) {
      console.error(err)

      setError(
        err.message || 'Unable to save the card.'
      )
    } finally {
      setSaving(false)
    }
  }

  /* =========================================================
     DELETE CARD
  ========================================================= */

  async function deleteCard(card) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${card.name}"?`
    )

    if (!confirmed) {
      return
    }

    setError('')

    if (USE_MOCK_API) {
      setCards((current) =>
        current.filter((item) => item.id !== card.id)
      )

      setPage('collection')
      setSelectedCard(null)

      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cards/${card.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const message = await response.text()

        throw new Error(
          message || `Delete failed with status ${response.status}.`
        )
      }

      setCards((current) =>
        current.filter((item) => item.id !== card.id)
      )

      setPage('collection')
      setSelectedCard(null)
    } catch (err) {
      console.error(err)

      setError(
        err.message || 'Unable to delete the card.'
      )
    }
  }

  /* =========================================================
     FILTERED COLLECTION
  ========================================================= */

  const filteredCards = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return cards.filter((card) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          card.name,
          card.set,
          card.cardNumber,
          card.rarity,
          card.condition,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(normalizedSearch)
          )

      const matchesRarity =
        rarityFilter === 'All Rarities' ||
        card.rarity === rarityFilter

      return matchesSearch && matchesRarity
    })
  }, [cards, search, rarityFilter])

  /* =========================================================
     STATS
  ========================================================= */

  const totalCards = cards.reduce(
    (total, card) =>
      total + Number(card.quantity || 0),
    0
  )

  const uniqueCards = cards.length

  const uniqueSets = new Set(
    cards
      .map((card) => card.set)
      .filter(Boolean)
  ).size

  const uniqueRarities = new Set(
    cards
      .map((card) => card.rarity)
      .filter(Boolean)
  ).size

  /* =========================================================
     APP
  ========================================================= */

  return (
    <div className="app">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <img
            src="/pokeball-logo.png"
            alt="PokéBinder"
            className="sidebar-logo"
          />

          <h1 className="brand-name">
            PokéBinder
          </h1>

          <div className="brand-subtitle">
            YOUR POKÉMON CARD COLLECTION
          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            className={`nav-item ${
              page === 'home' ? 'active' : ''
            }`}
            onClick={goHome}
          >
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </button>

          <button
            className={`nav-item ${
              page === 'add' ? 'active' : ''
            }`}
            onClick={startAdd}
          >
            <span className="nav-icon">＋</span>
            <span>Add Card</span>
          </button>

          <button
            className={`nav-item ${
              page === 'collection' ||
              page === 'details'
                ? 'active'
                : ''
            }`}
            onClick={goCollection}
          >
            <span className="nav-icon">▣</span>
            <span>Collection</span>
          </button>

        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-mini-ball">
            <span />
          </div>
        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="main-content">

        <div className="page-content">

          {error && (
            <div className="error-notice">
              <span>!</span>
              {error}
            </div>
          )}

          {/* =================================================
              HOME
          ================================================= */}

          {page === 'home' && (
            <HomePage
              totalCards={totalCards}
              uniqueCards={uniqueCards}
              uniqueSets={uniqueSets}
              uniqueRarities={uniqueRarities}
              cards={cards}
              loading={loading}
              startAdd={startAdd}
              openCard={openCard}
              goCollection={goCollection}
            />
          )}


          {/* =================================================
              COLLECTION
          ================================================= */}

          {page === 'collection' && (
            <CollectionPage
              cards={cards}
              filteredCards={filteredCards}
              loading={loading}
              search={search}
              setSearch={setSearch}
              rarityFilter={rarityFilter}
              setRarityFilter={setRarityFilter}
              startAdd={startAdd}
              openCard={openCard}
            />
          )}


          {/* =================================================
              ADD / EDIT
          ================================================= */}

          {page === 'add' && (
            <AddCardPage
              form={form}
              updateForm={updateForm}
              submitCard={submitCard}
              saving={saving}
              editingCard={editingCard}
              goCollection={goCollection}
              deleteCard={editingCard ? deleteCard : null}
            />
          )}


          {/* =================================================
              CARD DETAILS
          ================================================= */}

          {page === 'details' && selectedCard && (
            <CardDetailsPage
              card={selectedCard}
              goCollection={goCollection}
              startEdit={startEdit}
              deleteCard={deleteCard}
            />
          )}

        </div>

      </main>

    </div>
  )
}


/* =========================================================
   HOME PAGE
========================================================= */

function HomePage({
  totalCards,
  uniqueCards,
  uniqueSets,
  uniqueRarities,
  cards,
  loading,
  startAdd,
  openCard,
  goCollection,
}) {
  const recentCards = cards.slice(0, 4)

  return (
    <>
      <section className="home-hero">

        <div className="hero-content">

          <p className="hero-eyebrow">
            Welcome back, Trainer!
          </p>

          <h2 className="hero-title">
            Your <span>Pokémon</span> Binder
          </h2>

          <p className="hero-description">
            Keep track of your Pokémon TCG collection in one place.
          </p>

        </div>

        <div className="hero-decoration">
          <div className="hero-ring">
            <div className="hero-ring-small" />
          </div>
        </div>

      </section>


      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="stats-grid">

        <StatCard
          className="stat-blue"
          icon="▣"
          label="TOTAL CARDS"
          value={totalCards}
        />

        <StatCard
          className="stat-yellow"
          icon="◆"
          label="UNIQUE CARDS"
          value={uniqueCards}
        />

        <StatCard
          className="stat-red"
          icon="▤"
          label="SETS"
          value={uniqueSets}
        />

        <StatCard
          className="stat-green"
          icon="★"
          label="RARITIES"
          value={uniqueRarities}
        />

      </section>


      {/* =====================================================
          RECENTLY ADDED
      ===================================================== */}

      <section className="home-panel">

        <div className="panel-heading">

          <div>
            <h2>Recently Added</h2>

            <p>
              Your latest Pokémon cards
            </p>
          </div>

          {cards.length > 0 && (
            <button
              className="outline-button"
              onClick={goCollection}
            >
              View Collection →
            </button>
          )}

        </div>


        {loading ? (
          <div className="home-loading">
            Loading your collection...
          </div>
        ) : recentCards.length === 0 ? (

          <div className="home-empty-state">

            <div className="empty-game-icon">

              <div className="empty-card">
                ▣
              </div>

              <span className="spark spark-one">
                ✦
              </span>

              <span className="spark spark-two">
                ✦
              </span>

              <span className="spark spark-three">
                ✦
              </span>

            </div>

            <h3>
              Your binder is empty
            </h3>

            <p>
              Start building your Pokémon collection today.
            </p>

            <button
              className="primary-button"
              onClick={startAdd}
            >
              <span className="button-icon">+</span>
              Add your first card
            </button>

          </div>

        ) : (

          <div className="recent-card-grid">

            {recentCards.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                onClick={() => openCard(card)}
              />
            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          BUILD COLLECTION
      ===================================================== */}

      <section className="home-panel build-panel">

        <div className="panel-heading">

          <div>
            <h2>Build Your Collection</h2>

            <p>
              Everything you need to organize your cards.
            </p>
          </div>

        </div>

        <div className="feature-grid">

          <FeatureCard
            className="feature-blue"
            icon="＋"
            title="Add Cards"
            text="Record your Pokémon cards."
          />

          <FeatureCard
            className="feature-yellow"
            icon="⌕"
            title="Search"
            text="Find cards quickly."
          />

          <FeatureCard
            className="feature-pink"
            icon="◆"
            title="Organize"
            text="Keep your collection tidy."
          />

          <FeatureCard
            className="feature-green"
            icon="★"
            title="Track"
            text="Keep quantities updated."
          />

        </div>

      </section>
    </>
  )
}


/* =========================================================
   COLLECTION PAGE
========================================================= */

function CollectionPage({
  cards,
  filteredCards,
  loading,
  search,
  setSearch,
  rarityFilter,
  setRarityFilter,
  startAdd,
  openCard,
}) {
  return (
    <div className="collection-page">

      {/* =====================================================
          COLLECTION HERO
          NOTE: NO ADD CARD BUTTON HERE.
      ===================================================== */}

      <section className="collection-hero">

        <div className="collection-hero-content">

          <p className="page-eyebrow">
            Your Collection
          </p>

          <h1>
            Card Collection
          </h1>

          <p>
            {cards.length === 0
              ? '0 unique cards in your binder'
              : `${cards.length} unique ${
                  cards.length === 1 ? 'card' : 'cards'
                } in your binder`}
          </p>

        </div>

      </section>


      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <div className="collection-toolbar">

        <div className="collection-tools">

          <label className="search-box">

            <span>⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, set, or card number..."
            />

          </label>


          <select
            className="rarity-filter"
            value={rarityFilter}
            onChange={(event) =>
              setRarityFilter(event.target.value)
            }
          >
            <option>All Rarities</option>
            <option>Common</option>
            <option>Uncommon</option>
            <option>Rare</option>
            <option>Double Rare</option>
            <option>Ultra Rare</option>
            <option>Illustration Rare</option>
            <option>Special Illustration Rare</option>
            <option>Hyper Rare</option>
          </select>

        </div>


        <div className="collection-count">
          {filteredCards.length}{' '}
          {filteredCards.length === 1
            ? 'card'
            : 'cards'}
        </div>

      </div>


      {/* =====================================================
          COLLECTION CONTENT
      ===================================================== */}

      {loading ? (

        <div className="page-empty">

          <div className="empty-loader" />

          <h2>
            Loading collection...
          </h2>

          <p>
            Please wait while your cards are loaded.
          </p>

        </div>

      ) : cards.length === 0 ? (

        <div className="page-empty">

          <div className="large-empty-icon">
            ▣
          </div>

          <h2>
            Your Collection Is Empty
          </h2>

          <p>
            Add your first Pokémon card to get started.
          </p>

          <button
            className="primary-button"
            onClick={startAdd}
          >
            <span className="button-icon">+</span>
            Add Card
          </button>

        </div>

      ) : filteredCards.length === 0 ? (

        <div className="page-empty">

          <div className="large-empty-icon">
            ⌕
          </div>

          <h2>
            No Cards Found
          </h2>

          <p>
            Try changing your search or rarity filter.
          </p>

        </div>

      ) : (

        <div className="collection-grid">

          {filteredCards.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              onClick={() => openCard(card)}
            />
          ))}

        </div>

      )}

    </div>
  )
}


/* =========================================================
   ADD CARD PAGE
========================================================= */

function AddCardPage({
  form,
  updateForm,
  submitCard,
  saving,
  editingCard,
  goCollection,
  deleteCard,
}) {
  return (
    <>
      <div className="form-page-header">

        <button
          className="back-button"
          onClick={goCollection}
        >
          ← Back to Collection
        </button>

        <p className="page-eyebrow">
          {editingCard
            ? 'Edit Card'
            : 'Add to Your Collection'}
        </p>

        <h1>
          {editingCard ? (
            <>Edit <span className="pokemon-title-word">Pokémon</span> Card</>
          ) : (
            <>Add a <span className="pokemon-title-word">Pokémon</span> Card</>
          )}
        </h1>

        <p>
          {editingCard
            ? 'Update the information for this card.'
            : 'Enter the details of the Pokémon card you want to add.'}
        </p>

      </div>


      <form
        className="card-form"
        onSubmit={submitCard}
      >

        <section className="form-section">

          <div className="form-section-title">

            <span>01</span>

            <div>
              <h2>Card Information</h2>

              <p>
                Enter the basic information about your card.
              </p>
            </div>

          </div>


          <div className="form-grid">

            <label className="form-field">

              <span>Card Name *</span>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateForm(
                    'name',
                    event.target.value
                  )
                }
                placeholder="e.g. Pikachu"
                required
              />

            </label>


            <label className="form-field">

              <span>Set *</span>

              <input
                type="text"
                value={form.set}
                onChange={(event) =>
                  updateForm(
                    'set',
                    event.target.value
                  )
                }
                placeholder="e.g. Scarlet & Violet"
                required
              />

            </label>


            <label className="form-field">

              <span>Card Number *</span>

              <input
                type="text"
                value={form.cardNumber}
                onChange={(event) =>
                  updateForm(
                    'cardNumber',
                    event.target.value
                  )
                }
                placeholder="e.g. 025/198"
                required
              />

            </label>


            <label className="form-field">

              <span>Rarity</span>

              <select
                value={form.rarity}
                onChange={(event) =>
                  updateForm(
                    'rarity',
                    event.target.value
                  )
                }
              >
                <option>Common</option>
                <option>Uncommon</option>
                <option>Rare</option>
                <option>Double Rare</option>
                <option>Ultra Rare</option>
                <option>Illustration Rare</option>
                <option>Special Illustration Rare</option>
                <option>Hyper Rare</option>
              </select>

            </label>


            <label className="form-field">

              <span>Condition</span>

              <select
                value={form.condition}
                onChange={(event) =>
                  updateForm(
                    'condition',
                    event.target.value
                  )
                }
              >
                <option>Near Mint</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Played</option>
                <option>Damaged</option>
              </select>

            </label>


            <label className="form-field">

              <span>Quantity</span>

              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) =>
                  updateForm(
                    'quantity',
                    event.target.value
                  )
                }
              />

            </label>

          </div>

        </section>


        <section className="form-section">

          <div className="form-section-title">

            <span>02</span>

            <div>
              <h2>Card Image</h2>

              <p>
                Add an image URL for your card.
              </p>
            </div>

          </div>


          <label className="form-field full-field">

            <span>Image URL</span>

            <input
              type="url"
              value={form.image}
              onChange={(event) =>
                updateForm(
                  'image',
                  event.target.value
                )
              }
              placeholder="https://example.com/card-image.jpg"
            />

          </label>

        </section>


        <div className="form-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={goCollection}
            disabled={saving}
          >
            Cancel
          </button>

          {editingCard && deleteCard && (
            <button
              type="button"
              className="delete-button"
              onClick={() =>
                deleteCard(editingCard)
              }
              disabled={saving}
            >
              Delete Card
            </button>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            <span className="button-icon">
              {saving ? '…' : '+'}
            </span>

            {saving
              ? 'Saving...'
              : editingCard
                ? 'Save Changes'
                : 'Add Card'}
          </button>

        </div>

      </form>
    </>
  )
}


/* =========================================================
   CARD DETAILS PAGE
========================================================= */

function CardDetailsPage({
  card,
  goCollection,
  startEdit,
  deleteCard,
}) {
  return (
    <>
      <button
        className="back-button"
        onClick={goCollection}
      >
        ← Back to Collection
      </button>

      <section className="details-page">

        <div className="details-image">

          {card.image ? (
            <img
              src={card.image}
              alt={card.name}
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="details-image-placeholder">
              ▣
            </div>
          )}

        </div>


        <div className="details-content">

          <p className="details-eyebrow">CARD DETAILS</p>

          <h1 className="details-card-name">
            <span>{card.name || 'Unnamed Card'}</span>
          </h1>

          <p className="details-set">
            {card.set || 'Unknown Set'}
          </p>

          <span className="details-rarity">
            {card.rarity || 'Unknown Rarity'}
          </span>


          <div className="details-table">

            <div className="detail-row">
              <span>Card Number</span>
              <strong>
                {card.cardNumber || '—'}
              </strong>
            </div>

            <div className="detail-row">
              <span>Condition</span>
              <strong>
                {card.condition || '—'}
              </strong>
            </div>

            <div className="detail-row">
              <span>Quantity</span>
              <strong>
                {card.quantity ?? 0}
              </strong>
            </div>

            <div className="detail-row">
              <span>Rarity</span>
              <strong>
                {card.rarity || '—'}
              </strong>
            </div>

          </div>


          <div className="details-actions">

            <button
              className="outline-button"
              onClick={() =>
                startEdit(card)
              }
            >
              Edit Card
            </button>

            <button
              className="delete-button"
              onClick={() =>
                deleteCard(card)
              }
            >
              Delete
            </button>

          </div>

        </div>

      </section>
    </>
  )
}


/* =========================================================
   CARD TILE
========================================================= */

function CardTile({ card, onClick }) {
  return (
    <button
      className="card-tile"
      onClick={onClick}
    >

      <div className="card-image-wrapper">

        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            className="card-image"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="card-image-placeholder">
            ▣
          </div>
        )}

      </div>


      <div className="card-tile-info">

        <h3>
          {card.name || 'Unnamed Card'}
        </h3>

        <p>
          {card.set || 'Unknown Set'}
          {card.cardNumber
            ? ` • ${card.cardNumber}`
            : ''}
        </p>

        <div className="card-tile-meta">

          <span>
            ×{card.quantity ?? 0}
          </span>

          <span>
            {card.rarity || 'Common'}
          </span>

        </div>

      </div>

    </button>
  )
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  className,
  icon,
  label,
  value,
}) {
  return (
    <div className={`stat-card ${className}`}>

      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">

        <p>
          {label}
        </p>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  )
}


/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  className,
  icon,
  title,
  text,
}) {
  return (
    <div className={`feature-card ${className}`}>

      <div className="feature-icon">
        {icon}
      </div>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </div>

    </div>
  )
}

export default App