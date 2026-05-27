module.exports = function handler(req, res) {
  res.status(200).json({
    success: true,
    data: {
      key: 'siteSeoBranding',
      group: 'website',
      value: {
        siteName: 'Cromgen Rozgar',
        adminName: 'Rozgar Admin',
        recruiterName: 'Rozgar Recruiter',
        logoUrl: '/cromgen-rozgar-logo.png',
        tollFreeNumber: '+91 98765 43210',
      },
    },
    fallback: true,
  })
}
