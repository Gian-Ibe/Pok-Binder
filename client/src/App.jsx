import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

const emptyForm = {
  name: '',
  set: '',
  cardNumber: '',
  rarity: '',
  condition: 'Near Mint',
  quantity: 1,
  image: '',
}

const rarityOptions = [
  'Common',
  'Uncommon',
  'Rare',
  'Double Rare',
  'Ultra Rare',
  'Illustration Rare',
  'Special Illustration Rare',
  'Hyper Rare',
  'Promo',
]

const conditionOptions = [
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
  'Damaged',
]

function getCardNumber(card) {
  return card.card_number ?? card.cardNumber ?? ''
}

function normalizeCard(card) {
  return {
    ...card,
    cardNumber: getCardNumber(card),
    quantity: Number(card.quantity || 1),
  }
}

function App() {
  const [page, setPage] = useState('home')
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState('All')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadCards() {
    setLoading(true)
    setError('')

    try {
      if (USE_MOCK_API) {
        setCards([])
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/cards`)

      if (!response.ok) {
        throw new Error(`Failed to load cards (${response.status})`)
      }

      const data = await response.json()
      setCards(Array.isArray(data) ? data.map(normalizeCard) : [])
    } catch (err) {
      console.error(err)
      setError('Could not connect to the card database.')
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCards()
  }, [])

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase()

    return cards.filter((card) => {
      const matchesSearch =
        !query ||
        card.name?.toLowerCase().includes(query) ||
        card.set?.toLowerCase().includes(query) ||
        getCardNumber(card).toLowerCase().includes(query)

      const matchesRarity =
        rarityFilter === 'All' || card.rarity === rarityFilter

      return matchesSearch && matchesRarity
    })
  }, [cards, search, rarityFilter])

  const stats = useMemo(() => {
    const totalCards = cards.reduce(
      (total, card) => total + Number(card.quantity || 1),
      0
    )

    const uniqueCards = cards.length

    const sets = new Set(
      cards.map((card) => card.set).filter(Boolean)
    ).size

    const rarities = new Set(
      cards.map((card) => card.rarity).filter(Boolean)
    ).size

    return {
      totalCards,
      uniqueCards,
      sets,
      rarities,
    }
  }, [cards])

  function navigate(nextPage) {
    setPage(nextPage)
    setSelectedCard(null)
    setError('')

    if (nextPage !== 'add') {
      setEditingId(null)
    }
  }

  function startAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setSelectedCard(null)
    setError('')
    setPage('add')
  }

  function startEdit(card) {
    setForm({
      name: card.name || '',
      set: card.set || '',
      cardNumber: getCardNumber(card),
      rarity: card.rarity || '',
      condition: card.condition || 'Near Mint',
      quantity: Number(card.quantity || 1),
      image: card.image || '',
    })

    setEditingId(card.id)
    setSelectedCard(null)
    setError('')
    setPage('add')
  }

  function openCard(card) {
    setSelectedCard(card)
    setPage('details')
    setError('')
  }

  function updateForm(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: name === 'quantity' ? Number(value) : value,
    }))
  }

  async function saveCard(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name.trim(),
      set: form.set.trim(),
      cardNumber: form.cardNumber.trim(),
      rarity: form.rarity,
      condition: form.condition,
      quantity: Number(form.quantity),
      image: form.image.trim(),
    }

    try {
      if (USE_MOCK_API) {
        const mockCard = {
          id: editingId || Date.now(),
          ...payload,
        }

        setCards((current) =>
          editingId
            ? current.map((card) =>
                card.id === editingId ? mockCard : card
              )
            : [mockCard, ...current]
        )

        setPage('collection')
        setForm(emptyForm)
        setEditingId(null)
        return
      }

      const url = editingId
        ? `${API_BASE_URL}/api/cards/${editingId}`
        : `${API_BASE_URL}/api/cards`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Request failed (${response.status})`)
      }

      await loadCards()

      setPage('collection')
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setError('Could not save the card. Please check the server.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCard(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this card?'
    )

    if (!confirmed) return

    setError('')

    try {
      if (USE_MOCK_API) {
        setCards((current) => current.filter((card) => card.id !== id))
        setPage('collection')
        setSelectedCard(null)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/cards/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`)
      }

      await loadCards()
      setPage('collection')
      setSelectedCard(null)
    } catch (err) {
      console.error(err)
      setError('Could not delete the card.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-pokeballs">
            <img src="/pokeball-logo.png" alt="Poké Ball" />
          </div>

          <h1>PokéBinder</h1>
          <p>Your Pokémon card collection</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={page === 'home' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigate('home')}
          >
            <span>⌂</span>
            Home
          </button>

          <button
            className={page === 'add' ? 'nav-item active' : 'nav-item'}
            onClick={startAdd}
          >
            <span>＋</span>
            Add Card
          </button>

          <button
            className={page === 'collection' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigate('collection')}
          >
            <span>▣</span>
            Collection
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-pokeball">◉</div>
          <p>Gotta collect 'em all!</p>
        </div>
      </aside>

      <main className="main-content">
        {USE_MOCK_API && (
          <div className="demo-notice">
            Demo mode is active. Cards are stored only in this browser session.
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        {page === 'home' && (
          <HomePage
            cards={cards}
            stats={stats}
            loading={loading}
            onAdd={startAdd}
            onCollection={() => navigate('collection')}
            onOpenCard={openCard}
          />
        )}

        {page === 'collection' && (
          <CollectionPage
            cards={filteredCards}
            totalCards={cards.length}
            search={search}
            setSearch={setSearch}
            rarityFilter={rarityFilter}
            setRarityFilter={setRarityFilter}
            onAdd={startAdd}
            onOpenCard={openCard}
            loading={loading}
          />
        )}

        {page === 'add' && (
          <AddCardPage
            form={form}
            editing={Boolean(editingId)}
            saving={saving}
            onChange={updateForm}
            onSubmit={saveCard}
            onCancel={() => navigate('collection')}
          />
        )}

        {page === 'details' && selectedCard && (
          <CardDetailsPage
            card={selectedCard}
            onBack={() => navigate('collection')}
            onEdit={() => startEdit(selectedCard)}
            onDelete={() => deleteCard(selectedCard.id)}
          />
        )}
      </main>
    </div>
  )
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="page-description">{description}</p>}
      </div>

      {action}
    </header>
  )
}

function HomePage({
  cards,
  stats,
  loading,
  onAdd,
  onCollection,
  onOpenCard,
}) {
  const recentCards = cards.slice(0, 4)

  return (
    <>
      <PageHeader
        eyebrow="WELCOME BACK, TRAINER"
        title="Your Pokémon Binder"
        description="Keep track of your Pokémon TCG collection in one place."
        action={
          <button className="primary-button" onClick={onAdd}>
            ＋ Add Card
          </button>
        }
      />

      <section className="stats-grid">
        <StatCard
          icon="▣"
          label="Total Cards"
          value={stats.totalCards}
        />

        <StatCard
          icon="◈"
          label="Unique Cards"
          value={stats.uniqueCards}
        />

        <StatCard
          icon="▤"
          label="Sets"
          value={stats.sets}
        />

        <StatCard
          icon="★"
          label="Rarities"
          value={stats.rarities}
        />
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h3>Recently Added</h3>
            <p>Your latest cards</p>
          </div>

          {cards.length > 0 && (
            <button className="text-button" onClick={onCollection}>
              View Collection →
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-card">
            <div className="empty-icon">◌</div>
            <h3>Loading your binder...</h3>
          </div>
        ) : recentCards.length === 0 ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <div className="card-grid">
            {recentCards.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                onClick={() => onOpenCard(card)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="quick-action">
        <div className="quick-action-icon">＋</div>
        <div>
          <h3>Build your collection</h3>
          <p>Add your Pokémon cards and keep all their details organized.</p>
        </div>
        <button className="secondary-button" onClick={onAdd}>
          Add your first card
        </button>
      </section>
    </>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="empty-card">
      <div className="empty-pokeball">
        <img src="/pokeball-logo.png" alt="" />
      </div>

      <h3>Your binder is empty</h3>

      <p>
        Start building your collection by adding your first Pokémon card.
      </p>

      <button className="primary-button" onClick={onAdd}>
        ＋ Add Card
      </button>
    </div>
  )
}

function CollectionPage({
  cards,
  totalCards,
  search,
  setSearch,
  rarityFilter,
  setRarityFilter,
  onAdd,
  onOpenCard,
  loading,
}) {
  return (
    <>
      <PageHeader
        eyebrow="YOUR COLLECTION"
        title="Card Collection"
        description={`${totalCards} unique card${
          totalCards === 1 ? '' : 's'
        } in your binder`}
        action={
          <button className="primary-button" onClick={onAdd}>
            ＋ Add Card
          </button>
        }
      />

      <section className="collection-toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, set, or card number..."
          />
        </div>

        <select
          value={rarityFilter}
          onChange={(event) => setRarityFilter(event.target.value)}
        >
          <option value="All">All Rarities</option>

          {rarityOptions.map((rarity) => (
            <option key={rarity} value={rarity}>
              {rarity}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="empty-card">
          <div className="empty-icon">◌</div>
          <h3>Loading cards...</h3>
        </div>
      ) : cards.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">⌕</div>
          <h3>No cards found</h3>
          <p>
            {totalCards === 0
              ? 'Your collection is empty. Add your first card to get started.'
              : 'Try changing your search or rarity filter.'}
          </p>

          {totalCards === 0 && (
            <button className="primary-button" onClick={onAdd}>
              ＋ Add Card
            </button>
          )}
        </div>
      ) : (
        <div className="card-grid collection-grid">
          {cards.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              onClick={() => onOpenCard(card)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function CardTile({ card, onClick }) {
  return (
    <button className="pokemon-card" onClick={onClick}>
      <div className="card-image">
        {card.image ? (
          <img src={card.image} alt={card.name} />
        ) : (
          <div className="card-placeholder">⚡</div>
        )}
      </div>

      <div className="card-info">
        <div className="card-title-row">
          <h3>{card.name || 'Unnamed Card'}</h3>

          <span className="quantity-badge">
            ×{Number(card.quantity || 1)}
          </span>
        </div>

        <p className="card-set">{card.set || 'No set specified'}</p>

        <div className="card-meta">
          <span>{getCardNumber(card) || '—'}</span>

          {card.rarity && <span>{card.rarity}</span>}
        </div>
      </div>
    </button>
  )
}

function AddCardPage({
  form,
  editing,
  saving,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <>
      <PageHeader
        eyebrow={editing ? 'UPDATE COLLECTION' : 'BUILD YOUR BINDER'}
        title={editing ? 'Edit Card' : 'Add a Card'}
        description={
          editing
            ? 'Update the details of this card.'
            : 'Enter the details of a Pokémon card in your collection.'
        }
      />

      <form className="form-card" onSubmit={onSubmit}>
        <div className="form-section">
          <div className="form-section-title">
            <span>01</span>
            <div>
              <h3>Card Information</h3>
              <p>Basic information about your Pokémon card.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="field field-full">
              <span>Card Name *</span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="e.g. Pikachu"
                required
                maxLength="100"
              />
            </label>

            <label className="field">
              <span>Set *</span>
              <input
                name="set"
                value={form.set}
                onChange={onChange}
                placeholder="e.g. Scarlet & Violet"
                required
                maxLength="100"
              />
            </label>

            <label className="field">
              <span>Card Number *</span>
              <input
                name="cardNumber"
                value={form.cardNumber}
                onChange={onChange}
                placeholder="e.g. 025/198"
                required
                maxLength="30"
              />
            </label>

            <label className="field">
              <span>Rarity *</span>
              <select
                name="rarity"
                value={form.rarity}
                onChange={onChange}
                required
              >
                <option value="">Select rarity</option>

                {rarityOptions.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Condition *</span>
              <select
                name="condition"
                value={form.condition}
                onChange={onChange}
                required
              >
                {conditionOptions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Quantity *</span>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={onChange}
                min="1"
                max="999"
                required
              />
            </label>

            <label className="field field-full">
              <span>Image URL</span>
              <input
                name="image"
                value={form.image}
                onChange={onChange}
                placeholder="https://..."
                maxLength="1000"
              />
              <small>
                Optional. Leave blank if you do not have an image URL.
              </small>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button type="submit" className="primary-button" disabled={saving}>
            {saving
              ? 'Saving...'
              : editing
                ? 'Save Changes'
                : 'Add Card'}
          </button>
        </div>
      </form>
    </>
  )
}

function CardDetailsPage({ card, onBack, onEdit, onDelete }) {
  return (
    <>
      <div className="details-topbar">
        <button className="back-button" onClick={onBack}>
          ← Back to Collection
        </button>
      </div>

      <section className="details-card">
        <div className="details-image">
          {card.image ? (
            <img src={card.image} alt={card.name} />
          ) : (
            <div className="details-placeholder">⚡</div>
          )}
        </div>

        <div className="details-content">
          <p className="eyebrow">CARD DETAILS</p>

          <h2>{card.name}</h2>

          <p className="details-set">
            {card.set || 'No set specified'}
          </p>

          <div className="details-badges">
            {card.rarity && (
              <span className="detail-badge">{card.rarity}</span>
            )}

            <span className="detail-badge">
              ×{Number(card.quantity || 1)}
            </span>
          </div>

          <div className="details-list">
            <DetailRow
              label="Card Number"
              value={getCardNumber(card) || '—'}
            />

            <DetailRow
              label="Condition"
              value={card.condition || '—'}
            />

            <DetailRow
              label="Quantity"
              value={String(Number(card.quantity || 1))}
            />

            <DetailRow
              label="Set"
              value={card.set || '—'}
            />

            <DetailRow
              label="Rarity"
              value={card.rarity || '—'}
            />
          </div>

          <div className="details-actions">
            <button className="primary-button" onClick={onEdit}>
              Edit Card
            </button>

            <button className="danger-button" onClick={onDelete}>
              Delete
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App