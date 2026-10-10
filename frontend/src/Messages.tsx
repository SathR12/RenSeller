import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './Messages.css'

type ChatListing = {
  id: number
  title: string
  price: string
  image: string
  seller: string
}

type Message = {
  id: string
  text: string
  createdAt: string
}

type MessagesProps = {
  isOpen: boolean
  listings: ChatListing[]
  selectedListingId: number
  onSelectListing: (id: number) => void
  onClose: () => void
}

const suggestions = ['Is this still available?', 'Where on campus can we meet?', 'What time works for pickup?']

export default function Messages({ isOpen, listings, selectedListingId, onSelectListing, onClose }: MessagesProps) {
  const [threads, setThreads] = useState<Record<number, Message[]>>({})
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const endOfMessages = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const composer = useRef<HTMLTextAreaElement>(null)
  const listing = listings.find((item) => item.id === selectedListingId) ?? listings[0]
  const messages = listing ? threads[listing.id] ?? [] : []
  const draft = listing ? drafts[listing.id] ?? '' : ''

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (isOpen && !element.open) element.showModal()
    if (!isOpen && element.open) element.close()
  }, [isOpen])

  useEffect(() => {
    if (isOpen) endOfMessages.current?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, selectedListingId, threads])

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!listing || !text || text.length > 2000) return
    const message = { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }
    setThreads((current) => ({ ...current, [listing.id]: [...(current[listing.id] ?? []), message] }))
    setDrafts((current) => ({ ...current, [listing.id]: '' }))
    composer.current?.focus()
  }

  if (!listing) return null

  return (
    <dialog className="messages-dialog" ref={dialog} aria-labelledby="messages-title" onCancel={onClose} onClose={onClose} onClick={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <div className="messages-panel">
        <header className="messages-heading">
          <div><p className="eyebrow">CAMPUS CONVERSATIONS</p><h2 id="messages-title">Messages</h2></div>
          <button className="messages-close" type="button" onClick={onClose} aria-label="Close messages">×</button>
        </header>
        <p className="messages-preview-note">Chat preview — messages stay in this browser tab and are not sent to other students. They clear when you sign out or refresh.</p>
        <div className="messages-layout">
          <aside className="conversation-list" aria-label="Listing conversations">
            {listings.map((item) => {
              const thread = threads[item.id] ?? []
              return (
                <button key={item.id} className={`conversation-item ${item.id === listing.id ? 'selected' : ''}`} type="button" aria-pressed={item.id === listing.id} onClick={() => onSelectListing(item.id)}>
                  <img src={item.image} alt="" />
                  <span className="conversation-copy"><strong>{item.seller}</strong><span>{item.title}</span><small>{thread.at(-1)?.text ?? 'Start a pickup conversation'}</small></span>
                </button>
              )
            })}
          </aside>
          <section className="chat-thread" aria-label={`Conversation preview with ${listing.seller}`}>
            <header className="chat-header"><span className="chat-avatar" aria-hidden="true">{listing.seller[0]}</span><div><h3>{listing.seller}</h3><p>Sample seller · RPI campus</p></div></header>
            <div className="chat-listing"><img src={listing.image} alt="" /><div><strong>{listing.title}</strong><span>{listing.price} · Local pickup</span></div></div>
            <div className="chat-history" role="log" aria-label="Message history" aria-live="polite" aria-relevant="additions">
              {messages.length === 0 ? <div className="chat-empty"><strong>Plan your campus pickup</strong><p>Ask about availability, suggest a meeting spot, and agree on a pickup time.</p></div> : messages.map((message) => (
                <div className="chat-message" key={message.id}><p>{message.text}</p><span>You · <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time> · Preview only</span></div>
              ))}
              <div ref={endOfMessages} />
            </div>
            <div className="chat-suggestions" aria-label="Pickup message suggestions">{suggestions.map((text) => <button key={text} type="button" onClick={() => { setDrafts((current) => ({ ...current, [listing.id]: text })); composer.current?.focus() }}>{text}</button>)}</div>
            <form className="chat-composer" onSubmit={sendMessage}>
              <label className="chat-input-label" htmlFor="chat-draft">Message about pickup</label>
              <div><textarea id="chat-draft" ref={composer} rows={2} maxLength={2000} value={draft} onChange={(event) => setDrafts((current) => ({ ...current, [listing.id]: event.target.value }))} placeholder="Suggest a pickup place and time…" /><button className="sell-button" disabled={!draft.trim()} type="submit">Send preview <span>→</span></button></div>
            </form>
          </section>
        </div>
      </div>
    </dialog>
  )
}