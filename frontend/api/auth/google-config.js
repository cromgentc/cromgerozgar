export default function handler(req, res) {
  res.status(200).json({
    success: true,
    data: {
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID),
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      projectId: '',
      authorizedDomains: ['www.cromgenrozgar.in', 'cromgenrozgar.in'],
    },
  })
}
