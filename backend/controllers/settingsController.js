const asyncHandler = require('../middleware/asyncHandler')
const Setting = require('../models/Setting')

const PUBLIC_BRANDING_KEY = 'siteSeoBranding'
const PUBLIC_SOCIAL_LINKS_KEY = 'socialMediaLinks'

function normalizeSiteBrandingValue(body = {}) {
  return {
    siteName: String(body.siteName || 'Cromgen Rozgar').trim() || 'Cromgen Rozgar',
    adminName: String(body.adminName || 'Rozgar Admin').trim() || 'Rozgar Admin',
    recruiterName: String(body.recruiterName || 'Rozgar Recruiter').trim() || 'Rozgar Recruiter',
    logoUrl: String(body.logoUrl || '').trim(),
    faviconUrl: String(body.faviconUrl || '').trim(),
    tollFreeNumber: String(body.tollFreeNumber || '').trim(),
    seoTitle: String(body.seoTitle || body.siteName || 'Cromgen Rozgar').trim() || 'Cromgen Rozgar',
    seoDescription: String(body.seoDescription || '').trim(),
    seoKeywords: String(body.seoKeywords || '').trim(),
  }
}

function formatSetting(setting) {
  return setting
    ? {
      _id: setting._id,
      key: setting.key,
      group: setting.group,
      value: setting.value || {},
      updatedAt: setting.updatedAt,
    }
    : null
}

const getPublicSiteBranding = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: PUBLIC_BRANDING_KEY }).lean()

  res.json({
    success: true,
    data: formatSetting(setting),
  })
})

const getSiteBranding = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: PUBLIC_BRANDING_KEY }).lean()
  res.json({ success: true, data: formatSetting(setting) })
})

const updateSiteBranding = asyncHandler(async (req, res) => {
  const value = normalizeSiteBrandingValue(req.body || {})
  const setting = await Setting.findOneAndUpdate(
    { key: PUBLIC_BRANDING_KEY },
    { $set: { key: PUBLIC_BRANDING_KEY, group: 'website', value } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean()

  res.json({ success: true, data: formatSetting(setting), message: 'SEO branding saved successfully.' })
})

const getPublicSocialLinks = asyncHandler(async (req, res) => {
  const setting = await Setting.findOne({ key: PUBLIC_SOCIAL_LINKS_KEY }).lean()
  const links = Array.isArray(setting?.value?.links) ? setting.value.links : []

  res.json({
    success: true,
    data: links
      .filter((item) => item?.enabled !== false && item?.url)
      .map((item) => ({
        platform: item.platform || 'Website',
        url: item.url,
        label: item.label || item.platform || 'Social',
      })),
  })
})

module.exports = { getPublicSiteBranding, getPublicSocialLinks, getSiteBranding, updateSiteBranding }
