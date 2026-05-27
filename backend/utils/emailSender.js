const nodemailer = require('nodemailer')
const Setting = require('../models/Setting')

async function getEmailConfig() {
  const setting = await Setting.findOne({ key: 'emailPasswordResetApi' }).lean()
  const config = setting?.value || {}

  if (config.enabled === false) {
    throw new Error('Email API is disabled in Settings > Email API.')
  }

  if (!config.fromEmail) {
    throw new Error('From email is missing in Settings > Email API.')
  }

  return {
    provider: config.provider || 'Resend',
    apiKey: config.apiKey || '',
    fromEmail: config.fromEmail || '',
    fromName: config.fromName || 'Cromgen Rozgar',
    smtpHost: config.smtpHost || '',
    smtpPort: config.smtpPort || '587',
    smtpUser: config.smtpUser || '',
    smtpPassword: config.smtpPassword || '',
  }
}

async function sendConfiguredEmail({ html, subject, text, to }) {
  const config = await getEmailConfig()
  const provider = String(config.provider || '').toLowerCase()
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean)

  if (!recipients.length) {
    throw new Error('No email recipients found.')
  }

  if (provider === 'resend') {
    if (!config.apiKey) throw new Error('Resend API key is missing in Settings > Email API.')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: recipients,
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.message || 'Email could not be sent through Resend.')
    }
    return
  }

  if (!config.smtpUser || !config.smtpPassword) {
    throw new Error('SMTP user and password are missing in Settings > Email API.')
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost || (provider.includes('gmail') ? 'smtp.gmail.com' : ''),
    port: Number(config.smtpPort || 587),
    secure: Number(config.smtpPort || 587) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  })

  await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail || config.smtpUser}>`,
    to: recipients.join(', '),
    subject,
    text,
    html,
  })
}

module.exports = { sendConfiguredEmail }
