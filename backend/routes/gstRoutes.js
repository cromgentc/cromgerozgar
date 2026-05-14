const express = require('express')

const router = express.Router()

const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

router.get('/:gstNumber', async (req, res, next) => {
  try {
    const gstNumber = String(req.params.gstNumber || '').trim().toUpperCase()

    if (!gstinPattern.test(gstNumber)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 15 character GST number.' })
    }

    const lookupUrl = process.env.GST_LOOKUP_URL

    if (!lookupUrl) {
      return res.json({
        success: true,
        data: {
          gstNumber,
          lookupConfigured: false,
          legalName: '',
          tradeName: '',
          status: 'Live GST API not connected',
          message: 'GSTIN format verified. Connect GST_LOOKUP_URL and GST_LOOKUP_API_KEY to fetch legal name, trade name, and active/inactive status.',
        },
      })
    }

    const url = lookupUrl.includes('{gstin}')
      ? lookupUrl.replace('{gstin}', encodeURIComponent(gstNumber))
      : `${lookupUrl.replace(/\/$/, '')}/${encodeURIComponent(gstNumber)}`
    const headers = {}
    const apiKey = process.env.GST_LOOKUP_API_KEY

    if (apiKey) {
      headers[process.env.GST_LOOKUP_API_KEY_HEADER || 'x-api-key'] = apiKey
    }

    const response = await fetch(url, { headers })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: payload.message || payload.error || 'GST lookup failed. Please check GST API configuration.',
      })
    }

    const data = normalizeGstPayload(payload)

    if (!data.legalName && !data.tradeName && !data.status) {
      return res.status(502).json({
        success: false,
        message: 'GST API response did not include legal name, trade name, or status.',
      })
    }

    res.json({ success: true, data: { gstNumber, ...data } })
  } catch (error) {
    next(error)
  }
})

function normalizeGstPayload(payload) {
  const source = payload.data || payload.result || payload.gst || payload.taxpayerInfo || payload
  const principalAddress = source.pradr?.addr || source.principalAddress || source.address || ''

  return {
    legalName: source.legalName || source.lgnm || source.name || source.legal_name || '',
    tradeName: source.tradeName || source.tradeNam || source.trade || source.trade_name || source.ctb || '',
    status: source.status || source.sts || source.gstinStatus || source.gstStatus || '',
    registrationDate: source.registrationDate || source.rgdt || source.dateOfRegistration || '',
    taxpayerType: source.taxpayerType || source.dty || source.registrationType || '',
    address: typeof principalAddress === 'string' ? principalAddress : formatAddress(principalAddress),
  }
}

function formatAddress(address) {
  if (!address || typeof address !== 'object') return ''

  return [
    address.bno,
    address.flno,
    address.bnm,
    address.st,
    address.loc,
    address.dst,
    address.stcd,
    address.pncd,
  ].filter(Boolean).join(', ')
}

module.exports = router
