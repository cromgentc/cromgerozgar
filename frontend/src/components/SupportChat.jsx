import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Headphones, MessageCircle, Send, X } from 'lucide-react'
import { api } from '../services/api'
import { getStoredUser } from '../routes/authRouting'

const supportTicketKey = 'activeSupportTicketId'

export function SupportChat({ onClose, open }) {
  const user = getStoredUser()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { from: 'support', text: 'Hi, welcome to INSEET customer care. How can we help you today?' },
  ])
  const [activeTicket, setActiveTicket] = useState(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) return

    let mounted = true
    const ticketId = localStorage.getItem(supportTicketKey)
    if (!ticketId) return

    api
      .get('support-messages', ticketId)
      .then((payload) => {
        if (!mounted) return

        const ticket = payload.data
        const sessionEndsAt = ticket?.sessionEndsAt ? new Date(ticket.sessionEndsAt).getTime() : 0
        const closed = ['Closed', 'Resolved'].includes(ticket?.status)
        const expired = sessionEndsAt && Date.now() >= sessionEndsAt

        setActiveTicket(ticket)
        setMessages([
          { from: 'support', text: 'Hi, welcome to INSEET customer care. How can we help you today?' },
          ...getChatMessages(ticket).map((item) => ({
            from: item.sender === 'admin' ? 'support' : item.sender,
            text: item.text,
          })),
          ...(closed || expired ? [{ from: 'system', text: 'This support session has ended. Send a new message to start a fresh session.' }] : []),
        ])

        if (closed || expired) localStorage.removeItem(supportTicketKey)
      })
      .catch(() => {
        localStorage.removeItem(supportTicketKey)
      })

    return () => {
      mounted = false
    }
  }, [open])

  const sendMessage = async (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text) return

    setMessages((current) => [...current, { from: 'user', text }])
    setMessage('')
    setSending(true)

    try {
      await saveSupportMessage({
        name: user?.name || 'Guest User',
        email: user?.email || '',
        role: user?.role || 'Guest',
        subject: 'Support chat',
        message: text,
        source: 'support-chat',
      })
      const ticketId = localStorage.getItem(supportTicketKey)
      if (ticketId) {
        api.get('support-messages', ticketId).then((payload) => setActiveTicket(payload.data)).catch(() => {})
      }
      setMessages((current) => [...current, { from: 'support', text: 'Thanks. Your message is sent to customer care. Our team will reply shortly.' }])
    } catch (error) {
      setMessages((current) => [...current, { from: 'support', text: error.message || 'Message could not be sent. Please try again.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div animate={{ opacity: 1 }} className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
          <motion.div animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-lg overflow-hidden rounded-[7px] bg-white shadow-2xl shadow-slate-900/20" exit={{ opacity: 0, scale: 0.96, y: 16 }} initial={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ duration: 0.2 }}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-[7px] bg-[#0057B8] text-white"><Headphones size={20} /></span>
                <div>
                  <h3 className="text-lg font-black text-slate-950">Support Chat</h3>
                  <p className="text-sm font-semibold text-slate-500">Usually replies in a few minutes</p>
                  {activeTicket?.status && <p className="mt-1 text-xs font-black uppercase tracking-wide text-blue-600">Ticket {String(activeTicket._id || '').slice(-8)} / {activeTicket.status}</p>}
                </div>
              </div>
              <button className="grid h-10 w-10 place-items-center rounded-[7px] bg-slate-100 text-slate-500 hover:bg-slate-200" onClick={onClose} type="button" aria-label="Close chat">
                <X size={18} />
              </button>
            </div>

            <div className="grid max-h-[380px] gap-3 overflow-y-auto bg-slate-50 p-5">
              {messages.map((item, index) => (
                <div className={`max-w-[84%] rounded-[7px] p-4 text-sm font-semibold leading-6 shadow-sm ${item.from === 'user' ? 'ml-auto rounded-t-[7px]r-md bg-[#0057B8] text-white' : item.from === 'system' ? 'mx-auto bg-amber-50 text-amber-700' : 'rounded-t-[7px]l-md bg-white text-slate-600'}`} key={`${item.from}-${index}`}>
                  {item.text}
                </div>
              ))}
            </div>

            <form className="flex gap-2 border-t border-slate-100 p-4" onSubmit={sendMessage}>
              <input className="min-w-0 flex-1 rounded-[7px] border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500" disabled={sending} onChange={(event) => setMessage(event.target.value)} placeholder="Type your message" value={message} />
              <button className="grid h-12 w-12 shrink-0 place-items-center rounded-[7px] bg-[#0057B8] text-white shadow-lg shadow-[#0057B8]/20 hover:bg-[#004694] disabled:cursor-not-allowed disabled:opacity-60" disabled={sending} type="submit" aria-label="Send message">
                {sending ? <span className="h-4 w-4 animate-spin rounded-[7px] border-2 border-white/40 border-t-white" /> : <Send size={18} />}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

async function saveSupportMessage(payload) {
  const existingTicketId = localStorage.getItem(supportTicketKey)
  const sentAt = new Date().toISOString()

  if (existingTicketId) {
    try {
      const currentPayload = await api.get('support-messages', existingTicketId)
      const current = currentPayload.data
      const sessionEndsAt = current?.sessionEndsAt ? new Date(current.sessionEndsAt).getTime() : 0
      const canContinue = current && !['Closed', 'Resolved'].includes(current.status) && (!sessionEndsAt || Date.now() < sessionEndsAt)

      if (canContinue) {
        const chatMessages = [
          ...getChatMessages(current),
          { sender: 'user', text: payload.message, sentAt },
        ]
        await api.update('support-messages', existingTicketId, {
          ...payload,
          message: current.message || payload.message,
          status: current.status === 'Closed' ? 'Open' : current.status,
          chatMessages,
          lastUserMessageAt: sentAt,
          sessionEndsAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        })
        return
      }
    } catch {
      localStorage.removeItem(supportTicketKey)
    }
  }

  const created = await api.create('support-messages', {
    ...payload,
    chatMessages: [{ sender: 'user', text: payload.message, sentAt }],
    lastUserMessageAt: sentAt,
    sessionEndsAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })
  if (created.data?._id) localStorage.setItem(supportTicketKey, created.data._id)
}

function getChatMessages(ticket = {}) {
  if (Array.isArray(ticket.chatMessages) && ticket.chatMessages.length) {
    return ticket.chatMessages.filter((item) => item?.text).map((item) => ({
      sender: item.sender || 'user',
      text: item.text,
      sentAt: item.sentAt || ticket.createdAt || new Date().toISOString(),
    }))
  }

  const messages = []
  if (ticket.message) messages.push({ sender: 'user', text: ticket.message, sentAt: ticket.createdAt || new Date().toISOString() })
  if (ticket.adminReply) messages.push({ sender: 'admin', text: ticket.adminReply, sentAt: ticket.updatedAt || new Date().toISOString() })
  return messages
}

export function SupportChatButton({ children = 'Contact Support', className = '', variant = 'primary' }) {
  const [open, setOpen] = useState(false)
  const base = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-100'
  const variants = {
    primary: 'bg-[#0057B8] text-white shadow-lg shadow-[#0057B8]/20 hover:bg-[#004694]',
    secondary: 'bg-[#0057B8] text-white shadow-lg shadow-[#0057B8]/20 hover:bg-[#004694]',
  }

  return (
    <>
      <button className={`${base} ${variants[variant]} ${className}`} onClick={() => setOpen(true)} type="button">
        <MessageCircle size={18} /> {children}
      </button>
      <SupportChat onClose={() => setOpen(false)} open={open} />
    </>
  )
}
