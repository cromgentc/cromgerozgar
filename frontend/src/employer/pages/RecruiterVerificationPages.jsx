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
  const navigate = useNavigate()
  const user = getStoredUser()
  const status = getRecruiterVerificationStatus(user)
  const remark = getRecruiterVerificationRemark(user?.email) || user?.recruiterVerificationRemark || ''
  const blocked = ['rejected', 'hold', 'suspended'].includes(status)
  const statusCopy = {
    rejected: ['Account rejected', 'Your recruiter account has been rejected. The account manager remark is shown below.'],
    hold: ['Account on hold', 'Your recruiter account is currently on hold. The account manager next steps are shown below.'],
    suspended: ['Account suspended', 'Your recruiter account is suspended. Check the remark and contact support or your account manager.'],
  }
  const [title, subtitle] = statusCopy[status] || ['Please wait for account manager verification', 'Your recruiter account has been received. Our account manager will verify the company details, then the document submission step will open.']

  if (!user) return <Navigate replace to="/recruiter-login" />
  if (status === 'documents_required') return <Navigate replace to="/recruiter-documents" />
  if (status === 'documents_review') return <Navigate replace to="/recruiter-document-review" />
  if (status === 'approved') return <Navigate replace to="/recruiter-dashboard" />

  const fillAgain = async () => {
    const payload = await api.updateRecruiterStatus('documents_required').catch(() => null)
    if (payload?.data) localStorage.setItem('authUser', JSON.stringify(payload.data))
    else updateStoredRecruiterVerificationStatus('documents_required')
    navigate('/recruiter-documents', { replace: true })
  }

  return (
    <VerificationShell
      icon={Clock3}
      title={title}
      subtitle={subtitle}
    >
      <StatusSteps active="account" />
      {remark && (
        <div className="mt-6 rounded-[7px] bg-amber-50 p-5 text-sm font-semibold leading-7 text-amber-800">
          <span className="font-black">Account manager remark:</span> {remark}
        </div>
      )}
      <div className="mt-6 rounded-[7px] bg-blue-50 p-5 text-sm font-semibold leading-7 text-blue-800">
        {blocked ? 'Please fill company documents again and submit updated details for admin review.' : 'The next step unlocks after admin review. Your dashboard access becomes active only after approval.'}
      </div>
      {blocked && (
        <button className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white" onClick={fillAgain} type="button">
          Again
        </button>
      )}
    </VerificationShell>
  )
}

export function RecruiterDocumentsPage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const status = getRecruiterVerificationStatus(user)
  const canRefillDocuments = ['rejected', 'hold', 'suspended'].includes(status)
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
  const [uploadingFields, setUploadingFields] = useState({})

  if (!user) return <Navigate replace to="/recruiter-login" />
  if (status === 'account_review' && !canRefillDocuments) return <Navigate replace to="/recruiter-verification" />
  if (status === 'documents_review') return <Navigate replace to="/recruiter-document-review" />
  if (status === 'approved') return <Navigate replace to="/recruiter-dashboard" />

  const update = (key, value) => {
    const nextValue = key === 'gstNumber' || key === 'panNumber'
      ? value.toUpperCase()
      : key === 'aadhaarNumber'
        ? value.replace(/\D/g, '').slice(0, 12)
        : value
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

    setGstDetails({ ...validation.details, valid: true })
    setGstLoading(false)
  }

  const uploadDocument = async (key, file) => {
    if (!file) return

    if (file.type !== 'application/pdf') {
      setMessage('Only PDF document upload is allowed.')
      return
    }

    const data = new FormData()
    data.append('document', file)
    data.append('field', key)
    data.append('recruiterEmail', user.email || '')

    setUploadingFields((current) => ({ ...current, [key]: true }))
    setMessage('')

    try {
      const payload = await api.uploadRecruiterDocumentToSupaCloud(data)
      const url = payload.data?.url
      if (!url) {
        setMessage('Document uploaded, but Supa Cloud public URL was not returned. Please check public bucket setting.')
        return
      }
      update(key, url)
    } catch (error) {
      setMessage(error.message || 'Document could not be uploaded to Supa Cloud.')
    } finally {
      setUploadingFields((current) => ({ ...current, [key]: false }))
    }
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!form.documentType) {
      setMessage('Please choose a recruiter document type.')
      return
    }

    const panValidation = validatePanNumber(form.panNumber)

    if (!panValidation.valid) {
      setMessage(panValidation.error)
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

    if (form.documentType === 'Aadhar Card' && !/^\d{12}$/.test(form.aadhaarNumber)) {
      setMessage('Please enter a valid 12 digit Aadhar number.')
      return
    }

    const submittedAt = new Date().toISOString()
    const payload = {
      ...form,
      recruiterName: user.name || '',
      recruiterEmail: user.email || '',
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
      subtitle="Choose the recruiter document type, then submit the required details and uploads. After submission, the account manager will review it for approval."
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
              <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={gstLoading} onClick={validateGst} type="button">
                {gstLoading ? 'Validating...' : 'Validate GST'}
              </button>
            </div>
            {gstDetails && <GstDetailsPanel details={gstDetails} />}
            <DocumentField label="PAN card document" loading={uploadingFields.panDocument} onChange={(file) => uploadDocument('panDocument', file)} required value={form.panDocument} />
            <DocumentField label="GST certificate" loading={uploadingFields.gstDocument} onChange={(file) => uploadDocument('gstDocument', file)} required value={form.gstDocument} />
          </>
        )}

        {form.documentType === 'Offer Letter' && (
          <>
            <input className="input" onChange={(event) => update('panNumber', event.target.value)} placeholder="Company PAN number" required value={form.panNumber} />
            <DocumentField label="PAN card document" loading={uploadingFields.panDocument} onChange={(file) => uploadDocument('panDocument', file)} required value={form.panDocument} />
            <DocumentField label="Offer letter" loading={uploadingFields.offerLetter} onChange={(file) => uploadDocument('offerLetter', file)} required value={form.offerLetter} />
          </>
        )}

        {form.documentType === 'Aadhar Card' && (
          <>
            <input className="input" onChange={(event) => update('panNumber', event.target.value)} placeholder="Company PAN number" required value={form.panNumber} />
            <DocumentField label="PAN card document" loading={uploadingFields.panDocument} onChange={(file) => uploadDocument('panDocument', file)} required value={form.panDocument} />
            <input className="input" inputMode="numeric" maxLength={12} onChange={(event) => update('aadhaarNumber', event.target.value)} pattern="[0-9]*" placeholder="Aadhar number" required value={form.aadhaarNumber} />
            <DocumentField label="Aadhar card" loading={uploadingFields.aadhaarDocument} onChange={(file) => uploadDocument('aadhaarDocument', file)} required value={form.aadhaarDocument} />
          </>
        )}

        {message && <p className="rounded-[7px] bg-rose-50 p-3 text-sm font-bold text-rose-700">{message}</p>}
        <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting} type="submit">
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
  const documentStatus = String(submittedDocument?.status || '').toLowerCase()
  const reviewBlocked = ['rejected', 'suspend', 'suspended'].includes(documentStatus)
  const adminRemark = submittedDocument?.remark || user?.recruiterVerificationRemark || ''
  const reviewTitle = reviewBlocked
    ? documentStatus === 'rejected' ? 'Documents rejected' : 'Documents suspended'
    : 'Documents submitted. Please wait 24 hours'
  const reviewSubtitle = reviewBlocked
    ? 'Admin has added a remark to your submitted documents. Fill the details again and resubmit the documents.'
    : 'Your company documents have been submitted. The account manager will review and approve them within 24 hours.'

  useEffect(() => {
    if (!user?.email) return

    api
      .list('recruiter-documents', `?recruiterEmail=${encodeURIComponent(user.email)}&limit=1&sort=-updatedAt`)
      .then((payload) => setSubmittedDocument(payload.data?.[0] || null))
      .catch(() => setSubmittedDocument(null))
  }, [user?.email])

  const refillDocuments = async () => {
    const payload = await api.updateRecruiterStatus('documents_required').catch(() => null)
    if (payload?.data) localStorage.setItem('authUser', JSON.stringify(payload.data))
    else updateStoredRecruiterVerificationStatus('documents_required')
    navigate('/recruiter-documents', { replace: true })
  }

  if (!user) return <Navigate replace to="/recruiter-login" />
  if (status === 'account_review') return <Navigate replace to="/recruiter-verification" />
  if (status === 'documents_required') return <Navigate replace to="/recruiter-documents" />
  if (status === 'approved') return <Navigate replace to="/recruiter-dashboard" />

  return (
    <VerificationShell
      icon={ShieldCheck}
      title={reviewTitle}
      subtitle={reviewSubtitle}
    >
      <StatusSteps active="approval" />
      {reviewBlocked && adminRemark && (
        <div className="mt-6 rounded-[7px] bg-rose-50 p-5 text-sm font-semibold leading-7 text-rose-800">
          <span className="font-black">Admin remark:</span> {adminRemark}
        </div>
      )}
      <div className="mt-6 grid gap-3">
        {getSubmittedDocumentLabels(submittedDocument).map((item) => (
          <p className="flex items-center gap-3 rounded-[7px] bg-slate-50 p-4 text-sm font-bold text-slate-700" key={item}>
            <CheckCircle2 className="text-teal-500" size={18} />
            {item}
          </p>
        ))}
      </div>
      <div className="mt-6 rounded-[7px] bg-blue-50 p-5 text-sm font-semibold leading-7 text-blue-800">
        {reviewBlocked ? 'Please fill company documents again and submit updated details for admin review.' : 'After Account Team verification is completed, access to the Recruiter Dashboard will be available through login.'}
      </div>
      {reviewBlocked && (
        <button className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white" onClick={refillDocuments} type="button">
          Fill Company Documents Again
        </button>
      )}
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

function validatePanNumber(panNumber) {
  const normalizedPan = String(panNumber || '').trim().toUpperCase()

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedPan)) {
    return { valid: false, error: 'Please enter a valid PAN number.' }
  }

  return { valid: true, panNumber: normalizedPan }
}

function GstDetailsPanel({ details }) {
  if (!details.valid) {
    return (
      <div className="rounded-[7px] bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-700">
        <p className="font-black">GST live details not fetched</p>
        <p className="mt-1">{details.error || 'GST verification service is not configured. Please contact admin.'}</p>
      </div>
    )
  }

  const rows = [
    ['GST number', details.gstNumber],
    ['State', details.state],
    ['PAN number', details.panNumber],
  ]

  return (
    <div className="rounded-[7px] bg-teal-50 p-4 text-sm text-teal-900 ring-1 ring-teal-100">
      <p className="font-black">GST number validated</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div className="rounded-[7px] bg-white/80 p-3" key={label}>
            <p className="text-xs font-black uppercase tracking-wide text-teal-600">{label}</p>
            <p className="mt-1 font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function getSubmittedDocumentLabels(savedDocuments = {}) {
  const status = String(savedDocuments?.status || '').toLowerCase()
  const reviewStatusLabel = ['rejected', 'suspend', 'suspended'].includes(status)
    ? status === 'rejected' ? 'Documents rejected by admin' : 'Documents suspended by admin'
    : 'Account manager review pending'

  if (savedDocuments?.documentType === 'GST') {
    return ['PAN number submitted', 'GST number submitted', 'PAN document submitted', 'GST certificate submitted', reviewStatusLabel]
  }

  if (savedDocuments?.documentType === 'Offer Letter') {
    return ['PAN number submitted', 'PAN document submitted', 'Offer letter submitted', reviewStatusLabel]
  }

  if (savedDocuments?.documentType === 'Aadhar Card') {
    return ['PAN number submitted', 'PAN document submitted', 'Aadhar number submitted', 'Aadhar card submitted', reviewStatusLabel]
  }

  return ['Documents submitted', reviewStatusLabel]
}

function VerificationShell({ children, icon: Icon, subtitle, title }) {
  return (
    <section className="grid min-h-[calc(100vh-76px)] place-items-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-3xl rounded-[7px] border border-white bg-white/90 p-6 shadow-2xl shadow-blue-100 backdrop-blur sm:p-8">
        <div className="grid h-16 w-16 place-items-center rounded-[7px] bg-blue-600 text-white shadow-lg shadow-blue-100">
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
        <div className={`rounded-[7px] p-4 text-sm font-black ${key === active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500'}`} key={key}>
          {label}
        </div>
      ))}
    </div>
  )
}

function DocumentField({ label, loading = false, onChange, required = false, value }) {
  return (
    <label className="rounded-[7px] border border-dashed border-blue-200 bg-blue-50 p-4">
      <span className="flex items-center gap-2 text-sm font-black text-blue-700"><Upload size={17} /> {label}</span>
      <input accept="application/pdf" className="mt-3 w-full rounded-[7px] border border-blue-100 bg-white px-4 py-3 text-sm font-semibold outline-none" disabled={loading} onChange={(event) => onChange(event.target.files?.[0] || null)} required={required && !value} type="file" />
      <span className="mt-2 flex items-center gap-2 break-all text-xs font-semibold text-slate-500"><FileText size={14} /> {loading ? 'Uploading to Supa Cloud...' : value || 'Choose PDF to upload'}</span>
    </label>
  )
}
