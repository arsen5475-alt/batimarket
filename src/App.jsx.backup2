import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

const CATS = ['Tout','Carrelage','Bois','Plomberie','Électricité','Outillage','Peinture','Gros œuvre']
const FORM_CATS = ['Carrelage','Bois','Plomberie','Électricité','Outillage','Peinture','Gros œuvre']
const ETATS = ['Neuf','Très bon état','Bon état','Occasion']
const EMOJI = { Carrelage:'🔲', Bois:'🪵', Plomberie:'🚿', 'Électricité':'⚡', Outillage:'🔧', Peinture:'🎨', 'Gros œuvre':'🧱' }
const MAX_PHOTOS = 5

function priceNum(p){ const m=(p||'').replace(',','.').match(/[\d.]+/); return m?parseFloat(m[0]):0 }
function loadFavs(){ try{return JSON.parse(localStorage.getItem('bm_favs')||'[]')}catch{return[]} }
function imgsOf(l){ if(l.images && l.images.length) return l.images; if(l.image_url) return [l.image_url]; return [] }
function isFresh(ts){ try{ return (Date.now()-new Date(ts).getTime()) < 86400000 }catch{ return false } }
function timeOf(ts){ try{return new Date(ts).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}catch{return''} }

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('bm_theme') || 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bm_theme', theme)
  }, [theme])
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  const [cat, setCat] = useState('Tout')
  const [q, setQ] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showSell, setShowSell] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [favs, setFavs] = useState(loadFavs())
  const [view, setView] = useState('all')
  const [minP, setMinP] = useState('')
  const [maxP, setMaxP] = useState('')
  const [etatF, setEtatF] = useState('')
  const [sort, setSort] = useState('recent')
  const [chat, setChat] = useState(null)
  const [showInbox, setShowInbox] = useState(false)
  const [authNext, setAuthNext] = useState(null)

  async function loadListings() {
    const { data, error } = await supabase
      .from('listings').select('*').order('created_at', { ascending: false })
    if (!error) setListings(data)
    setLoading(false)
  }

  useEffect(() => {
    loadListings()
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); if(!s){ setView('all'); setShowInbox(false); setChat(null) } })
    return () => sub.subscription.unsubscribe()
  }, [])

  function toggleFav(id, e) {
    e.stopPropagation()
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('bm_favs', JSON.stringify(next))
      return next
    })
  }

  async function deleteListing(id) {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) alert(error.message)
    else { setSelected(null); loadListings() }
  }

  function startChat(listing) {
    if (!session) { setAuthNext(() => () => openChatFor(listing)); setShowAuth(true); return }
    openChatFor(listing)
  }
  function openChatFor(listing) {
    if (!listing.user_id) { alert("Cette annonce de démonstration n'a pas de vendeur joignable.") ; return }
    if (session && listing.user_id === session.user.id) { alert("C'est votre propre annonce."); return }
    setSelected(null)
    setChat({ listing, otherId: listing.user_id, otherName: listing.seller })
  }

  function resetFilters(){ setMinP(''); setMaxP(''); setEtatF(''); setSort('recent'); setCat('Tout'); setQ('') }
  const myCount = session ? listings.filter(l => l.user_id === session.user.id).length : 0

  let items = listings.filter(l => {
    if (view === 'fav' && !favs.includes(l.id)) return false
    if (view === 'mine' && (!session || l.user_id !== session.user.id)) return false
    if (cat !== 'Tout' && l.category !== cat) return false
    if (!(l.title || '').toLowerCase().includes(q.toLowerCase())) return false
    if (etatF && l.etat !== etatF) return false
    const pn = priceNum(l.price)
    if (minP && pn < parseFloat(minP)) return false
    if (maxP && pn > parseFloat(maxP)) return false
    return true
  })
  if (sort === 'cheap') items = [...items].sort((a,b) => priceNum(a.price) - priceNum(b.price))
  if (sort === 'expensive') items = [...items].sort((a,b) => priceNum(b.price) - priceNum(a.price))

  if (selected) {
    return (
      <>
        <DetailPage l={selected} session={session} fav={favs.includes(selected.id)} onFav={(e)=>toggleFav(selected.id,e)} onBack={() => setSelected(null)} onDelete={deleteListing} onEdit={(l)=>{ setEditing(l); setSelected(null) }} onContact={startChat} />
        {chat && <ChatWindow session={session} chat={chat} onClose={() => setChat(null)} />}
        {editing && session && <EditModal session={session} listing={editing} onClose={() => setEditing(null)} onDone={() => { setEditing(null); loadListings() }} />}
      </>
    )
  }

  return (
    <>
      <header className="top">
        <div className="logo">🧱 Bati<b>Market</b></div>
        <button className="theme-btn" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        {session ? (
          <div className="acct">
            <button className="logout" onClick={() => setShowInbox(true)}>💬 Messages</button>
            <span className="mail">{session.user.email}</span>
            <button className="sell" onClick={() => setShowSell(true)}>+ Vendre</button>
            <button className="logout" onClick={() => supabase.auth.signOut()}>Déconnexion</button>
          </div>
        ) : (
          <button className="sell" onClick={() => setShowAuth(true)}>+ Vendre</button>
        )}
      </header>

      <section className="hero">
        <h1>Le marché des matériaux de construction</h1>
        <p>Achetez et vendez près de chez vous — neuf ou surplus de chantier</p>
        <div className="searchbar">
          <input placeholder="Rechercher un matériau, un outil..." value={q} onChange={e => setQ(e.target.value)} />
          <button>Rechercher</button>
        </div>
      </section>

      <div className="viewtabs">
        <button className={'vtab' + (view==='all'?' on':'')} onClick={()=>setView('all')}>Toutes les annonces</button>
        <button className={'vtab' + (view==='fav'?' on':'')} onClick={()=>setView('fav')}>❤️ Mes favoris ({favs.length})</button>
        {session && (
          <button className={'vtab' + (view==='mine'?' on':'')} onClick={()=>setView('mine')}>📋 Mes annonces ({myCount})</button>
        )}
      </div>

      <div className="chips">
        {CATS.map(c => (
          <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="filters">
        <div className="fgroup"><span className="lbl">Prix</span>
          <input type="number" placeholder="min €" value={minP} onChange={e=>setMinP(e.target.value)} />
          <input type="number" placeholder="max €" value={maxP} onChange={e=>setMaxP(e.target.value)} />
        </div>
        <div className="fgroup"><span className="lbl">État</span>
          <select value={etatF} onChange={e=>setEtatF(e.target.value)}>
            <option value="">Tous</option>
            {ETATS.map(x => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="fgroup"><span className="lbl">Tri</span>
          <select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="recent">Plus récentes</option>
            <option value="cheap">Prix croissant</option>
            <option value="expensive">Prix décroissant</option>
          </select>
        </div>
        <button className="reset" onClick={resetFilters}>Réinitialiser</button>
      </div>

      <main className="wrap">
        <h2>{view==='mine' ? 'Mes annonces' : view==='fav' ? 'Mes favoris' : 'Annonces près de chez vous'}</h2>
        <div className="cnt">
          {loading ? 'Chargement...' : `${items.length} annonce${items.length > 1 ? 's' : ''} · particuliers & professionnels du BTP`}
        </div>
        {loading ? (
          <div className="grid">
            {Array.from({length:8}).map((_,i)=>(
              <div className="skel-card" key={i}>
                <div className="skel-img"></div>
                <div className="skel-line med"></div>
                <div className="skel-line short"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty">
            {view==='fav' ? 'Aucun favori pour le moment. Touchez le ❤️ sur une annonce.'
             : view==='mine' ? "Vous n'avez pas encore publié d'annonce. Cliquez sur + Vendre."
             : 'Aucune annonce pour cette recherche.'}
          </div>
        ) : (
          <div className="grid">
            {items.map(l => {
              const imgs = imgsOf(l)
              return (
              <div className="card" key={l.id} onClick={() => setSelected(l)}>
                <div className="img">
                  {imgs.length ? <img src={imgs[0]} alt={l.title} /> : l.emoji}
                  <div className="ribbons">
                    {isFresh(l.created_at) && <span className="ribbon fresh">Aujourd'hui</span>}
                    {l.is_pro && <span className="ribbon verif">Pro vérifié</span>}
                  </div>
                  <span className="cond">{l.etat}</span>
                  <button className={'fav-btn' + (favs.includes(l.id)?' on':'')} onClick={(e)=>toggleFav(l.id,e)}>
                    {favs.includes(l.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="body">
                  <div className="price">{l.price}</div>
                  <div className="title">{l.title}</div>
                  <div className="seller">
                    <span className={'badge ' + (l.is_pro ? 'pro' : 'part')}>{l.is_pro ? 'Pro' : 'Particulier'}</span>
                    <span className="sname">{l.seller}</span>
                  </div>
                  <div className="loc">📍 {l.location}</div>
                </div>
              </div>
            )})}
          </div>
        )}
      </main>

      {showAuth && <AuthModal onClose={() => { setShowAuth(false); if(authNext){ const fn=authNext; setAuthNext(null); setTimeout(fn,100) } }} />}
      {showSell && session && (
        <SellModal session={session} onClose={() => setShowSell(false)} onDone={() => { setShowSell(false); loadListings() }} />
      )}
      {editing && session && (
        <EditModal session={session} listing={editing} onClose={() => setEditing(null)} onDone={() => { setEditing(null); loadListings() }} />
      )}
      {chat && <ChatWindow session={session} chat={chat} onClose={() => setChat(null)} />}
      {showInbox && session && (
        <InboxWindow session={session} listings={listings} onClose={() => setShowInbox(false)} onOpen={(c) => { setShowInbox(false); setChat(c) }} />
      )}
    </>
  )
}

function DetailPage({ l, session, fav, onFav, onBack, onDelete, onEdit, onContact }) {
  const isOwner = session && l.user_id && session.user.id === l.user_id
  const imgs = imgsOf(l)
  const [active, setActive] = useState(0)
  return (
    <>
      <header className="top">
        <div className="logo">🧱 Bati<b>Market</b></div>
      </header>
      <button className="detail-back" onClick={onBack}>← Retour aux annonces</button>
      <div className="detail">
        <div className="gallery">
          <div className="gallery-main">
            {imgs.length ? <img src={imgs[active]} alt={l.title} /> : l.emoji}
            <span className="cond">{l.etat}</span>
            <button className={'fav-btn' + (fav?' on':'')} onClick={onFav}>{fav ? '❤️' : '🤍'}</button>
          </div>
          {imgs.length > 1 && (
            <div className="thumbs">
              {imgs.map((src, i) => (
                <div key={i} className={'thumb' + (i===active?' on':'')} onClick={() => setActive(i)}>
                  <img src={src} alt={'photo '+(i+1)} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="detail-price">{l.price}</div>
        <div className="detail-title">{l.title}</div>
        <div className="detail-meta">
          <span className="tag">📦 {l.category}</span>
          <span className="tag">🏷️ {l.etat}</span>
          <span className="tag">📍 {l.location}</span>
          <span className="tag">{l.is_pro ? '🏢 Professionnel' : '👤 Particulier'}</span>
        </div>
        <div className="detail-seller">
          <div className="av">{(l.seller || '?')[0].toUpperCase()}</div>
          <div>
            <div className="nm">{l.seller}</div>
            <div className="loc">📍 {l.location}</div>
          </div>
        </div>
        <div className="detail-actions">
          {isOwner ? (
            <>
              <button className="btn-edit" onClick={() => onEdit(l)}>Modifier</button>
              <button className="btn-del" onClick={() => { if (confirm('Supprimer cette annonce ?')) onDelete(l.id) }}>Supprimer</button>
            </>
          ) : (
            <button className="btn-contact" onClick={() => onContact(l)}>Contacter le vendeur</button>
          )}
        </div>
      </div>
    </>
  )
}

function ChatWindow({ session, chat, onClose }) {
  const { listing, otherId, otherName } = chat
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bodyRef = useRef(null)

  async function load() {
    const { data } = await supabase
      .from('messages').select('*')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: true })
    if (data) {
      const mine = session.user.id
      setMessages(data.filter(m =>
        (m.sender_id === mine && m.receiver_id === otherId) ||
        (m.sender_id === otherId && m.receiver_id === mine)
      ))
    }
  }

  useEffect(() => {
    load()
    const ch = supabase.channel('chat-' + listing.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `listing_id=eq.${listing.id}` },
        () => load())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [listing.id])

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight }, [messages])

  async function send() {
    if (!text.trim()) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      listing_id: listing.id,
      sender_id: session.user.id,
      receiver_id: otherId,
      content: text.trim()
    })
    setSending(false)
    if (error) alert(error.message)
    else { setText(''); load() }
  }

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-box" onClick={e => e.stopPropagation()}>
        <div className="chat-head">
          <div className="av">{(otherName || '?')[0].toUpperCase()}</div>
          <div className="ci">
            <div className="ct">{otherName}</div>
            <div className="cs">{listing.title} · {listing.price}</div>
          </div>
          <button className="cx" onClick={onClose}>×</button>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {messages.length === 0 ? (
            <div className="chat-empty">Démarrez la conversation 👋<br/>Posez votre question sur « {listing.title} »</div>
          ) : messages.map(m => (
            <div key={m.id} className={'msg ' + (m.sender_id === session.user.id ? 'mine' : 'theirs')}>
              {m.content}
              <span className="t">{timeOf(m.created_at)}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Votre message..." />
          <button onClick={send} disabled={sending || !text.trim()}>➤</button>
        </div>
      </div>
    </div>
  )
}

function InboxWindow({ session, listings, onClose, onOpen }) {
  const [convos, setConvos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('messages').select('*')
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false })
      if (data) {
        const seen = new Set()
        const list = []
        for (const m of data) {
          const otherId = m.sender_id === session.user.id ? m.receiver_id : m.sender_id
          const key = m.listing_id + '|' + otherId
          if (seen.has(key)) continue
          seen.add(key)
          const listing = listings.find(l => l.id === m.listing_id)
          list.push({ key, listing_id: m.listing_id, otherId, last: m.content, listing })
        }
        setConvos(list)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="chat-overlay" onClick={onClose}>
      <div className="chat-box" onClick={e => e.stopPropagation()}>
        <div className="chat-head">
          <div className="ci"><div className="ct">💬 Mes messages</div></div>
          <button className="cx" onClick={onClose}>×</button>
        </div>
        <div className="chat-body">
          {loading ? <div className="chat-empty">Chargement...</div>
           : convos.length === 0 ? <div className="chat-empty">Aucune conversation pour le moment.</div>
           : convos.map(c => (
            <div key={c.key} className="inbox-item" onClick={() => c.listing && onOpen({ listing: c.listing, otherId: c.otherId, otherName: c.listing.seller })}>
              <div className="av">{((c.listing?.seller) || '?')[0].toUpperCase()}</div>
              <div className="ii">
                <div className="it">{c.listing ? c.listing.title : 'Annonce supprimée'}</div>
                <div className="il">{c.last}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setErr(''); setBusy(true)
    const fn = mode === 'signup'
      ? supabase.auth.signUp({ email, password: pw })
      : supabase.auth.signInWithPassword({ email, password: pw })
    const { error } = await fn
    setBusy(false)
    if (error) setErr(error.message)
    else onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>×</button>
        <h3>{mode === 'signup' ? 'Créer un compte' : 'Se connecter'}</h3>
        <div className="sub">Pour publier ou contacter sur BatiMarket</div>
        {err && <div className="err">{err}</div>}
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@email.com" />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="btn-primary" onClick={submit} disabled={busy || !email || !pw}>
          {busy ? '...' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
        </button>
        <div className="switch">
          {mode === 'signup' ? (
            <>Déjà un compte ? <b onClick={() => { setMode('login'); setErr('') }}>Se connecter</b></>
          ) : (
            <>Pas encore de compte ? <b onClick={() => { setMode('signup'); setErr('') }}>S'inscrire</b></>
          )}
        </div>
      </div>
    </div>
  )
}

function ListingForm({ session, initial, onClose, onDone, mode }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [price, setPrice] = useState(initial?.price || '')
  const [category, setCategory] = useState(initial?.category || 'Carrelage')
  const [etat, setEtat] = useState(initial?.etat || 'Neuf')
  const [location, setLocation] = useState(initial?.location || '')
  const [seller, setSeller] = useState(initial?.seller || '')
  const [isPro, setIsPro] = useState(initial?.is_pro || false)
  const [existing, setExisting] = useState(initial ? imgsOf(initial) : [])
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)
  const total = existing.length + previews.length

  function pickFiles(e) {
    const picked = Array.from(e.target.files)
    if (!picked.length) return
    const room = MAX_PHOTOS - total
    const take = picked.slice(0, room)
    setFiles(prev => [...prev, ...take])
    setPreviews(prev => [...prev, ...take.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }
  function removeExisting(i){ setExisting(prev => prev.filter((_,x)=>x!==i)) }
  function removeNew(i){ setFiles(prev=>prev.filter((_,x)=>x!==i)); setPreviews(prev=>prev.filter((_,x)=>x!==i)) }

  async function submit() {
    setErr(''); setBusy(true)
    try {
      const uploaded = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2,7)}.${ext}`
        const { error: upErr } = await supabase.storage.from('photos').upload(path, file)
        if (upErr) throw upErr
        const { data } = supabase.storage.from('photos').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
      const allImgs = [...existing, ...uploaded]
      const payload = {
        title, price, category, etat, location,
        seller: seller || session.user.email.split('@')[0],
        is_pro: isPro, emoji: EMOJI[category] || '📦',
        images: allImgs, image_url: allImgs[0] || null
      }
      if (mode === 'edit') {
        const { error } = await supabase.from('listings').update(payload).eq('id', initial.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('listings').insert({ ...payload, user_id: session.user.id })
        if (error) throw error
      }
      onDone()
    } catch (e2) { setErr(e2.message); setBusy(false) }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>×</button>
        <h3>{mode === 'edit' ? 'Modifier l\'annonce' : 'Publier une annonce'}</h3>
        <div className="sub">Jusqu'à {MAX_PHOTOS} photos · la 1ʳᵉ sera la principale</div>
        {err && <div className="err">{err}</div>}
        <div className="previews">
          {existing.map((src,i)=>(
            <div className="prev-mini" key={'e'+i}><img src={src} alt="" /><button className="rm" onClick={()=>removeExisting(i)}>×</button></div>
          ))}
          {previews.map((src,i)=>(
            <div className="prev-mini" key={'n'+i}><img src={src} alt="" /><button className="rm" onClick={()=>removeNew(i)}>×</button></div>
          ))}
          {total < MAX_PHOTOS && <div className="add-more" onClick={() => fileRef.current.click()}>+</div>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={pickFiles} style={{ display: 'none' }} />
        <div className="field"><label>Titre</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex : Carrelage grès 60x60" /></div>
        <div className="row2">
          <div className="field"><label>Prix</label>
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Ex : 12 €/m²" /></div>
          <div className="field"><label>État</label>
            <select value={etat} onChange={e => setEtat(e.target.value)}>{ETATS.map(x => <option key={x}>{x}</option>)}</select></div>
        </div>
        <div className="row2">
          <div className="field"><label>Catégorie</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>{FORM_CATS.map(x => <option key={x}>{x}</option>)}</select></div>
          <div className="field"><label>Ville</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ex : Marseille" /></div>
        </div>
        <div className="field"><label>Votre nom / boutique</label>
          <input value={seller} onChange={e => setSeller(e.target.value)} placeholder="Ex : Sud Matériaux" /></div>
        <label className="check">
          <input type="checkbox" checked={isPro} onChange={e => setIsPro(e.target.checked)} />
          Je suis un professionnel (Pro)
        </label>
        <button className="btn-primary" onClick={submit} disabled={busy || !title || !price}>
          {busy ? (mode === 'edit' ? 'Mise à jour...' : 'Publication...') : (mode === 'edit' ? 'Enregistrer' : 'Publier mon annonce')}
        </button>
      </div>
    </div>
  )
}

function SellModal({ session, onClose, onDone }) {
  return <ListingForm session={session} mode="create" onClose={onClose} onDone={onDone} />
}
function EditModal({ session, listing, onClose, onDone }) {
  return <ListingForm session={session} initial={listing} mode="edit" onClose={onClose} onDone={onDone} />
}
