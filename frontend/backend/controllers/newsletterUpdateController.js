const asyncHandler = require('../middleware/asyncHandler')
const NewsletterSubscriber = require('../models/NewsletterSubscriber')
const NewsletterUpdate = require('../models/NewsletterUpdate')
const { sendConfiguredEmail } = require('../utils/emailSender')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const listNewsletterUpdates = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    NewsletterUpdate.find({}).sort('-createdAt').skip(skip).limit(limit),
    NewsletterUpdate.countDocuments({}),
  ])

  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
})

const sendNewsletterUpdate = asyncHandler(async (req, res) => {
  const subject = String(req.body.subject || '').trim()
  const previewText = String(req.body.previewText || '').trim()
  const message = String(req.body.message || '').trim()
  const imageUrl = String(req.body.imageUrl || '').trim()
  const ctaLabel = String(req.body.ctaLabel || '').trim()
  const ctaUrl = String(req.body.ctaUrl || '').trim()

  if (!subject || !message) {
    res.status(400)
    throw new Error('Subject and update message are required.')
  }

  const subscribers = await NewsletterSubscriber.find({ status: 'Subscribed' }).select('email').lean()
  const recipients = [...new Set(subscribers.map((item) => String(item.email || '').trim().toLowerCase()).filter((email) => emailRegex.test(email)))]

  if (!recipients.length) {
    res.status(400)
    throw new Error('No active subscribers found.')
  }

  const update = await NewsletterUpdate.create({
    subject,
    previewText,
    message,
    imageUrl,
    ctaLabel,
    ctaUrl,
    status: 'Sending',
    recipientCount: recipients.length,
    sentByName: req.user?.name || '',
    sentByEmail: req.user?.email || '',
  })

  const html = buildNewsletterHtml({ ctaLabel, ctaUrl, imageUrl, message, previewText, subject })
  const text = `${subject}\n\n${previewText ? `${previewText}\n\n` : ''}${message}${ctaUrl ? `\n\n${ctaLabel || 'Open update'}: ${ctaUrl}` : ''}`

  try {
    const results = await sendNewsletterBatch({ html, recipients, subject, text })
    update.status = results.failedEmails.length ? (results.sentCount ? 'Sent' : 'Failed') : 'Sent'
    update.sentCount = results.sentCount
    update.failedCount = results.failedEmails.length
    update.failedEmails = results.failedEmails
    update.sentAt = new Date()
    await update.save()
  } catch (error) {
    update.status = 'Failed'
    update.sentCount = 0
    update.failedCount = recipients.length
    update.failedEmails = recipients
    await update.save()
    throw error
  }

  res.status(201).json({ success: true, data: update, message: `Update sent to ${update.sentCount} of ${recipients.length} subscribers.` })
})

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildNewsletterHtml({ ctaLabel, ctaUrl, imageUrl, message, previewText, subject }) {
  const safeSubject = escapeHtml(subject)
  const safePreview = escapeHtml(previewText)
  const safeImageUrl = escapeHtml(imageUrl)
  const paragraphs = escapeHtml(message).split(/\n+/).filter(Boolean).map((line) => `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.7">${line}</p>`).join('')
  const button = ctaUrl
    ? `<div style="padding-top:12px"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;border-radius:8px;background:#0f5bbb;color:#ffffff;padding:13px 20px;text-decoration:none;font-size:14px;font-weight:800">${escapeHtml(ctaLabel || 'Open update')}</a></div>`
    : ''

  return `
    <div style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;overflow:hidden;border-radius:14px;background:#ffffff;box-shadow:0 18px 45px rgba(15,91,187,0.14)">
              <tr>
                <td style="background:linear-gradient(135deg,#0f5bbb,#05b8b0);padding:30px 32px;color:#ffffff">
                  <div style="display:inline-block;border-radius:10px;background:rgba(255,255,255,0.16);padding:8px 10px;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase">Hiring Insights</div>
                  <h1 style="margin:18px 0 0;font-size:28px;line-height:1.2;font-weight:900">${safeSubject}</h1>
                  ${safePreview ? `<p style="margin:10px 0 0;color:#dcfce7;font-size:15px;line-height:1.6">${safePreview}</p>` : ''}
                </td>
              </tr>
              ${safeImageUrl ? `<tr><td><img src="${safeImageUrl}" alt="" style="display:block;width:100%;max-height:260px;object-fit:cover;border:0" /></td></tr>` : ''}
              <tr>
                <td style="padding:30px 32px">
                  ${paragraphs}
                  ${button}
                </td>
              </tr>
              <tr>
                <td style="border-top:1px solid #e2e8f0;background:#f8fafc;padding:18px 32px;text-align:center">
                  <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6">Cromgen Rozgar hiring insights and recruiter updates.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

async function sendNewsletterBatch({ html, recipients, subject, text }) {
  const settled = []
  const size = 10

  for (let index = 0; index < recipients.length; index += size) {
    const batch = recipients.slice(index, index + size)
    const result = await Promise.allSettled(batch.map((email) => sendConfiguredEmail({ html, subject, text, to: email })))
    settled.push(...result.map((item, resultIndex) => ({ ...item, email: batch[resultIndex] })))
  }

  const failedEmails = settled.filter((item) => item.status === 'rejected').map((item) => item.email)
  return {
    failedEmails,
    sentCount: recipients.length - failedEmails.length,
  }
}

module.exports = { listNewsletterUpdates, sendNewsletterUpdate }
