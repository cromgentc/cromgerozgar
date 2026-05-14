import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock3, FileCheck2, FileText, ShieldCheck, Upload } from 'lucide-react'
import { getRecruiterVerificationRemark, getRecruiterVerificationStatus, getStoredUser, updateStoredRecruiterVerificationStatus } from '../../routes/authRouting'
import { api } from '../../services/api'

const gstStateCodes = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  10: 'Bihar',
  11: 'Sikkim',
  12: 'Arunachal Pradesh',
  13: 'Nagaland',
  14: 'Manipur',
  15: 'Mizoram',
  16: 'Tripura',
  17: 'Meghalaya',
  18: 'Assam',
  19: 'West Bengal',
  20: 'Jharkhand',
  21: 'Odisha',
  22: 'Chhattisgarh',
  23: 'Madhya Pradesh',
  24: 'Gujarat',
  27: 'Maharashtra',
  29: 'Karnataka',
  32: 'Kerala',
  33: 'Tamil Nadu',
  36: 'Telangana',
  37: 'Andhra Pradesh',
}

export function RecruiterVerificationPage() {
  const user = getStoredUser()
  const status = getRecruiterVerificationStatus(user)
  const remark = getRecruiterVerificationRemark(user?.email) || user?.recruiterVerificationRemark || ''
  const blocked = ['rejected', 'hold', 'suspended'].includes(status)
  const statusCopy = {
    rejected: ['Account rejected', 'Aapka recruiter account reject kiya gaya hai. Neeche account manager ka remark diya gaya hai.'],
    hold: ['Account on hold', 'Aapka recruiter account abhi hold par hai. Account manager ke next steps neeche diye gaye hain.'],
    suspended: ['Account suspended', 'Aapka recruiter account suspended hai. Remark check karein aur support/account manager se contact karein.'],
  }
  const [title, subtitle] = statusCopy[status] || ['Please wait for account manager verification', 'Aapka recruiter account receive ho gaya hai. Hamara account manager company details verify karega, uske baad document submission step open hoga.']

  if (!user) return <Navigate replace to="/recruiter-login" />
  if (status === 'documents_required') return <Navigate replace to="/recruiter-documents" />
  if (status === 'documents_review') return <Navigate replace to="/recruiter-document-review" />
  if (status === 'approved') return <Navigate replace to="/recruiter-dashboard" />

  return (
    <VerificationShell
      icon={Clock3}
      title={title}
      subtitle={subtitle}
    >
      <StatusSteps active="account" />
      {remark && (
        <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm font-semibold leading-7 text-amber-800">
          <span className="font-black">Account manager remark:</span> {remark}
        </div>
      )}
      <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-sm font-semibold leading-7 text-blue-800">
        {blocked ? 'Remark resolve hone ke baad admin aapka status update karega.' : 'Admin review ke baad next step unlock hoga. Aapka dashboard access approval ke baad hi active hoga.'}
      </div>
    </VerificationShell>
  )
}

export function RecruiterDocumentsPage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const status = getRecruiterVerificationStatus(user)
  const [form, setForm] = useState({
    documentType: '',
    panNumber: '',
    gstNumber: '',
    panDocument: '',
    gstDocument: '',
    offerLetter: '',
    aadhaarNumber: '',
    aadhaarDocument: '',
  })
  const [message, setMessage] = useState('')
  const [gstDetails, setGstDetails] = useState(null)
  const [gstLoading, setGstLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!user) return <Navigate replace to="/recruiter-login" />
  if (status === 'account_review') return <Navigate replace to="/recruiter-verification" />
  if (status === 'documents_review') return <Navigate replace to="/recruiter-document-review" />
  if (status === 'approved') return <Navigate replace to="/recruiter-dashboard" />

  const update = (key, value) => {
    const nextValue = key === 'gstNumber' || key === 'panNumber' ? value.toUpperCase() : value
    setForm((current) => ({ ...current, [key]: nextValue }))
    if (key === 'gstNumber' || key === 'panNumber' || key === 'documentType') setGstDetails(null)
    setMessage('')
  }

  const validateGst = async () => {
    const gstNumber = form.gstNumber.trim().toUpperCase()
    const panNumber = form.panNumber.trim().toUpperCase()
    const validation = validateGstin(gstNumber, panNumber)

    if (!validation.valid) {
      setGstDetails({ valid: false, error: validation.error })
      setMessage(validation.error)
      return
    }

    setGstLoading(true)
    setMessage('')

    try {
      const fetchedDetails = await fetchGstDetails(gstNumber)
      setGstDetails({ ...validation.details, ...fetchedDetails, valid: true })
    } catch (error) {
      setGstDetails({
        ...validation.details,
        error: error.message,
        valid: false,
      })
      setMessage(error.message)
    } finally {
      setGstLoading(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!form.documentType) {
      setMessage('Please choose a recruiter document type.')
      return
    }

    if (form.documentType === 'GST' && (!form.panNumber || !form.gstNumber || !form.panDocument || !form.gstDocument)) {
      setMessage('PAN number, GST number, PAN document, and GST certificate are required for GST.')
      return
    }

    if (form.documentType === 'GST' && !gstDetails?.valid) {
      setMessage('Please validate GST number before submitting.')
      return
    }

    if (form.documentType === 'Offer Letter' && (!form.panNumber || !form.panDocument || !form.offerLetter)) {
      setMessage('PAN number, PAN document, and offer letter upload are required.')
      return
    }

    if (form.documentType === 'Aadhar Card' && (!form.panNumber || !form.panDocument || !form.aadhaarNumber || !form.aadhaarDocument)) {
      setMessage('PAN number, PAN document, Aadhar number, and Aadhar card upload are required.')
      return
    }

    const submittedAt = new Date().toISOString()
    const payload = {
      ...form,
      recruiterName: user.name || '',
      recruiterEmail: user.email || '',
      gstLegalName: gstDetails?.legalName || '',
      gstTradeName: gstDetails?.tradeName || '',
      gstStatus: gstDetails?.status || '',
      submittedAt,
    }

    setSubmitting(true)
    try {
      await api.create('recruiter-documents', payload)
      const statusPayload = await api.updateRecruiterStatus('documents_review').catch(() => null)
      if (statusPayload?.data) localStorage.setItem('authUser', JSON.stringify(statusPayload.data))
      else updateStoredRecruiterVerificationStatus('documents_review')
      navigate('/recruiter-document-review', { replace: true })
    } catch (error) {
      setMessage(error.message || 'Unable to submit documents to backend.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <VerificationShell
      icon={FileCheck2}
      title="Submit company verification documents"
      subtitle="Recruiter document type choose karein, phir required details aur uploads submit karein. Submission ke baad account manager approval review karega."
    >
      <StatusSteps active="documents" />
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label>
          <span className="text-xs font-black uppercase tracking-wide text-slate-400">Recruiter documents</span>
          <select className="input mt-2" onChange={(event) => update('documentType', event.target.value)} required value={form.documentType}>
            <option value="">Select document type</option>
            <option>GST</option>
            <option>Offer Letter</option>
            <option>Aadhar Card</option>
          </select>
        </label>

        {form.documentType === 'GST' && (
          <>
            <input className="input" onChange={(event) => update('panNumber', event.target.value)} placeholder="Company PAN number" required value={form.panNumber} />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input className="input" maxLength={15} onChange={(event) => update('gstNumber', event.target.value)} placeholder="GST number" required value={form.gstNumber} />
              <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={gstLoading} onClick={validateGst} type="button">
                {gstLoading ? 'Validating...' : 'Validate GST'}
              </button>
            </div>
            {gstDetails && <GstDetailsPanel details={gstDetails} />}
            <DocumentField label="PAN card document" onChange={(value) => update('panDocument', value)} required value={form.panDocument} />
            <DocumentField label="GST certificate" onChange={(value) => update('gstDocument', value)} required value={form.gstDocument} />
          </>
        )}

        {form.documentType === 'Offer Letter' && (
          <>
            <input className="input" onChange={(event) => update('panNumber', event.target.value)} placeholder="Company PAN number" required value={form.panNumber} />
            <DocumentField label="PAN card document" onChange={(value) => update('panDocument', value)} required value={form.panDocument} />
            <DocumentField label="Offer letter" onChange={(value) => update('offerLetter', value)} required value={form.offerLetter} />
          </>
        )}

        {form.documentType === 'Aadhar Card' && (
          <>
            <input className="input" onChange={(event) => update('panNumber', event.target.value)} placeholder="Company PAN number" required value={form.panNumber} />
            <DocumentField label="PAN card document" onChange={(value) => update('panDocument', value)} required value={form.panDocument} />
            <input className="input" onChange={(event) => update('aadhaarNumber', event.target.value)} placeholder="Aadhar number" required value={form.aadhaarNumber} />
            <DocumentField label="Aadhar card" onChange={(value) => update('aadhaarDocument', value)} required value={form.aadhaarDocument} />
          </>
        )}

        {message && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{message}</p>}
        <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">
          {submitting ? 'Submitting...' : 'Submit Documents'}
        </button>
      </form>
    </VerificationShell>
  )
}

export function RecruiterDocumentReviewPage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const status = getRecruiterVerificationStatus(user)
  const [submittedDocument, setSubmittedDocument] = useState(null)

  useEffect(() => {
    if (!user?.email) return

    api
      .list('recruiter-documents', `?recruiterEmail=${encodeURIComponent(user.email)}&limit=1`)
      .then((payload) => setSubmittedDocument(payload.data?.[0] || null))
      .catch(() => setSubmittedDocument(null))
  }, [user?.email])

  if (!user) return <Navigate replace to="/recruiter-login" />
  if (status === 'account_review') return <Navigate replace to="/recruiter-verification" />
  if (status === 'documents_required') return <Navigate replace to="/recruiter-documents" />
  if (status === 'approved') return <Navigate replace to="/recruiter-dashboard" />

  return (
    <VerificationShell
      icon={ShieldCheck}
      title="Documents submitted. Please wait 24 hours"
      subtitle="Aapke company documents submit ho gaye hain. Account manager 24 hours ke andar review karke approve karega."
    >
      <StatusSteps active="approval" />
      <div className="mt-6 grid gap-3">
        {getSubmittedDocumentLabels(submittedDocument).map((item) => (
          <p className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700" key={item}>
            <CheckCircle2 className="text-teal-500" size={18} />
            {item}
          </p>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-sm font-semibold leading-7 text-blue-800">
        Admin verification complete hone ke baad login se recruiter dashboard access milega.
      </div>
    </VerificationShell>
  )
}

function validateGstin(gstNumber, panNumber) {
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstNumber)) {
    return { valid: false, error: 'Please enter a valid 15 character GST number.' }
  }

  const stateCode = gstNumber.slice(0, 2)
  const gstPan = gstNumber.slice(2, 12)

  if (!gstStateCodes[stateCode]) {
    return { valid: false, error: 'GST state code is not valid.' }
  }

  if (panNumber && gstPan !== panNumber) {
    return { valid: false, error: 'GST number PAN does not match entered PAN number.' }
  }

  return {
    valid: true,
    details: {
      gstNumber,
      panNumber: gstPan,
      state: gstStateCodes[stateCode],
      registrationType: gstNumber[12] === '1' ? 'Primary registration' : `Registration ${gstNumber[12]}`,
    },
  }
}

async function fetchGstDetails(gstNumber) {
  const payload = await api.gstDetails(gstNumber)
  return payload.data
}

function GstDetailsPanel({ details }) {
  if (!details.valid) {
    return (
      <div className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-700">
        <p className="font-black">GST live details not fetched</p>
        <p className="mt-1">{details.error || 'Please connect a GST lookup API to fetch legal name, trade name, and active status.'}</p>
      </div>
    )
  }

  const verifiedRows = [
    ['GST number', details.gstNumber],
    ['PAN number', details.panNumber],
    ['State', details.state],
    ['Registration', details.registrationType],
  ]
  const liveRows = [
    ['Legal name', details.legalName],
    ['Trade name', details.tradeName],
    ['GST active status', details.status],
    ['Address', typeof details.address === 'string' ? details.address : 'Fetched from GST API'],
  ]
  const rows = [...verifiedRows, ...(details.lookupConfigured === false ? [] : liveRows)].filter(([, value]) => Boolean(value))

  return (
    <div className="rounded-2xl bg-teal-50 p-4 text-sm text-teal-900 ring-1 ring-teal-100">
      <p className="font-black">{details.lookupConfigured === false ? 'GST number validated' : 'GST details fetched'}</p>
      {details.lookupConfigured === false && (
        <p className="mt-1 font-semibold text-teal-800">{details.message}</p>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div className="rounded-xl bg-white/80 p-3" key={label}>
            <p className="text-xs font-black uppercase tracking-wide text-teal-600">{label}</p>
            <p className="mt-1 font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function getSubmittedDocumentLabels(savedDocuments = {}) {
  if (savedDocuments?.documentType === 'GST') {
    return ['PAN number submitted', 'GST number submitted', 'PAN document submitted', 'GST certificate submitted', 'Account manager review pending']
  }

  if (savedDocuments?.documentType === 'Offer Letter') {
    return ['PAN number submitted', 'PAN document submitted', 'Offer letter submitted', 'Account manager review pending']
  }

  if (savedDocuments?.documentType === 'Aadhar Card') {
    return ['PAN number submitted', 'PAN document submitted', 'Aadhar number submitted', 'Aadhar card submitted', 'Account manager review pending']
  }

  return ['Documents submitted', 'Account manager review pending']
}

function VerificationShell({ children, icon: Icon, subtitle, title }) {
  return (
    <section className="grid min-h-[calc(100vh-76px)] place-items-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-3xl rounded-[2rem] border border-white bg-white/90 p-6 shadow-2xl shadow-blue-100 backdrop-blur sm:p-8">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100">
          <Icon size={30} />
        </div>
        <h1 className="mt-6 text-3xl font-black text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 leading-7 text-slate-500">{subtitle}</p>
        {children}
      </div>
    </section>
  )
}

function StatusSteps({ active }) {
  const steps = [
    ['account', 'Account verification'],
    ['documents', 'Company documents'],
    ['approval', '24 hour approval'],
  ]

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {steps.map(([key, label]) => (
        <div className={`rounded-2xl p-4 text-sm font-black ${key === active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'}`} key={key}>
          {label}
        </div>
      ))}
    </div>
  )
}

function DocumentField({ label, onChange, required = false, value }) {
  return (
    <label className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4">
      <span className="flex items-center gap-2 text-sm font-black text-blue-700"><Upload size={17} /> {label}</span>
      <input className="mt-3 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold outline-none" onChange={(event) => onChange(event.target.files?.[0]?.name || '')} required={required} type="file" />
      <span className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500"><FileText size={14} /> {value || 'Choose file to upload'}</span>
    </label>
  )
}
