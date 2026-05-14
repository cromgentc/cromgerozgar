/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { City, Country, State } from 'country-state-city'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Download, Eye, EyeOff, FileText, ShieldCheck } from 'lucide-react'
import {
  ActionButtons,
  AdminCard,
  AdminModal,
  ConfirmDialog,
  DataTable,
  EmptyAdminState,
  ExportButtons,
  StatusBadge,
  Toolbar,
} from '../components/AdminPrimitives'
import { reportRows } from '../data/adminData'
import { api } from '../../services/api'
import { updateRecruiterVerificationRemark } from '../../routes/authRouting'

const configs = {
  users: {
    resource: 'users',
    title: 'User Management',
    subtitle: 'Get all portal users from MongoDB, add new users, and manage role access.',
    actionLabel: 'Add User',
    modalTitle: 'Add / Edit User',
    extra: 'Profile',
    columns: [
      { key: '_id', label: 'User ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', badge: true },
      { key: 'status', label: 'Status', badge: true },
      { key: 'createdAt', label: 'Created' },
    ],
    fields: [
      ['name', 'Full name'],
      ['email', 'Email address'],
      ['role', 'Role: Admin, staff, recruiter, users'],
      ['status', 'Status'],
    ],
    required: ['name', 'email', 'role', 'status'],
    transform: (form) => {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      return payload
    },
  },
  jobs: {
    resource: 'jobs',
    title: 'Jobs Management',
    subtitle: 'Add, edit, approve, reject, open, close, and manage job listings.',
    actionLabel: 'Add New Job',
    modalTitle: 'Add / Edit Job',
    extra: 'Approve',
    columns: [
      { key: '_id', label: 'Job ID' },
      { key: 'title', label: 'Job Title' },
      { key: 'company', label: 'Company' },
      { key: 'industry', label: 'Industry' },
      { key: 'department', label: 'Department' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'approval', label: 'Approval', badge: true },
      { key: 'applicationsCount', label: 'Applications' },
      { key: 'views', label: 'Views' },
    ],
    fields: [
      ['title', 'Job title'],
      ['company', 'Company name'],
      ['department', 'Department'],
      ['location', 'Location', 'jobLocation'],
      ['salary', 'Salary range'],
      ['experience', 'Experience'],
      ['type', 'Job type'],
      ['workMode', 'Work mode'],
      ['posted', 'Posted date', 'date'],
      ['deadline', 'Application deadline', 'date'],
      ['skills', 'Skills comma separated'],
      ['description', 'Description', 'jobDescription'],
    ],
    required: ['title', 'company', 'location'],
    transform: (form) => ({
      ...form,
      location: formatJobLocation(form),
      interviewAddress: form.interviewSameAsOffice ? form.officeAddress : form.interviewAddress,
      posted: form.posted ? new Date(form.posted).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
      deadline: form.deadline ? new Date(form.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      skills: splitComma(form.skills),
      companyLogo: form.company?.slice(0, 2).toUpperCase(),
    }),
  },
  companies: {
    resource: 'companies',
    title: 'Company Management',
    subtitle: 'Review company profiles, verify documents, and control recruiter access.',
    actionLabel: 'Add Company',
    modalTitle: 'Add / Edit Company',
    extra: 'Verify',
    columns: [
      { key: '_id', label: 'Company ID' },
      { key: 'name', label: 'Company' },
      { key: 'industry', label: 'Industry' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'jobs', label: 'Jobs' },
    ],
    fields: [['name', 'Company name'], ['industry', 'Industry'], ['location', 'Location', 'companyLocation'], ['jobs', 'Open jobs', 'number'], ['status', 'Status']],
    required: ['name', 'industry'],
    transform: (form) => ({ ...form, location: formatJobLocation(form), jobs: Number(form.jobs || 0), badge: form.name?.slice(0, 2).toUpperCase() }),
  },
  employers: {
    resource: 'employers',
    title: 'Recruiter Management',
    subtitle: 'Approve accounts, verify documents, edit details, and block recruiters.',
    actionLabel: 'Add Recruiter',
    modalTitle: 'Add / Edit Recruiter',
    extra: 'Approve',
    columns: [
      { key: '_id', label: 'Recruiter ID' },
      { key: 'companyName', label: 'Recruiter' },
      { key: 'businessEmail', label: 'Business Email' },
      { key: 'industry', label: 'Industry' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status', badge: true },
    ],
    fields: [['companyName', 'Recruiter name'], ['businessEmail', 'Business email'], ['phone', 'Phone'], ['industry', 'Industry'], ['companySize', 'Company size'], ['website', 'Website'], ['location', 'Location'], ['status', 'Status']],
  },
  candidates: {
    resource: 'candidates',
    title: 'Candidate Management',
    subtitle: 'View profiles, preview resumes, shortlist talent, and manage candidate access.',
    actionLabel: 'Add Candidate',
    modalTitle: 'Candidate Details',
    extra: 'Shortlist',
    columns: [
      { key: '_id', label: 'Candidate ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'skills', label: 'Skills' },
      { key: 'experience', label: 'Experience' },
      { key: 'status', label: 'Status', badge: true },
    ],
    fields: [['name', 'Full name'], ['email', 'Email'], ['phone', 'Phone'], ['role', 'Current role'], ['skills', 'Skills comma separated'], ['experience', 'Experience'], ['location', 'Location'], ['status', 'Status']],
    transform: (form) => ({ ...form, skills: splitComma(form.skills) }),
  },
  applications: {
    resource: 'applications',
    title: 'Applications Management',
    subtitle: 'Track applications and update candidate status across hiring stages.',
    actionLabel: 'Add Application',
    modalTitle: 'Candidate Application',
    extra: 'Update',
    columns: [
      { key: '_id', label: 'Application ID' },
      { key: 'candidateName', label: 'Candidate' },
      { key: 'jobTitle', label: 'Job' },
      { key: 'company', label: 'Company' },
      { key: 'status', label: 'Status', badge: true },
      { key: 'createdAt', label: 'Date' },
    ],
    fields: [['candidateName', 'Candidate name'], ['candidateEmail', 'Candidate email'], ['jobTitle', 'Job'], ['company', 'Company'], ['status', 'Status'], ['coverNote', 'Recruiter note', 'textarea']],
  },
  resumes: {
    resource: 'resumes',
    title: 'Resume Database',
    subtitle: 'Switch between registered candidate leads and admin-uploaded resumes.',
    actionLabel: 'Upload Resume',
    modalTitle: 'Resume Preview',
    extra: 'Preview',
    columns: [
      { key: '_id', label: 'Resume ID' },
      { key: 'name', label: 'Candidate' },
      { key: 'role', label: 'Target Role' },
      { key: 'skills', label: 'Skills' },
      { key: 'experience', label: 'Experience' },
      { key: 'source', label: 'Source', badge: true },
      { key: 'status', label: 'Status', badge: true },
    ],
    fields: [['name', 'Candidate'], ['email', 'Email'], ['role', 'Resume title'], ['skills', 'Skills comma separated'], ['experience', 'Experience'], ['resumeUrl', 'Resume URL']],
    transform: (form) => ({ ...form, skills: splitComma(form.skills) }),
  },
  categories: {
    resource: 'categories',
    title: 'Category Management',
    subtitle: 'Add, edit, delete, activate, and deactivate job categories.',
    actionLabel: 'Add Category',
    modalTitle: 'Add / Edit Category',
    extra: 'Toggle',
    columns: [{ key: '_id', label: 'Category ID' }, { key: 'name', label: 'Category' }, { key: 'jobs', label: 'Jobs' }, { key: 'status', label: 'Status', badge: true }],
    fields: [['name', 'Category name'], ['jobs', 'Jobs count'], ['status', 'Status']],
  },
  locations: {
    resource: 'locations',
    title: 'Location Management',
    subtitle: 'Maintain city, state, country, and active location status.',
    actionLabel: 'Add Location',
    modalTitle: 'Add / Edit Location',
    extra: 'Toggle',
    columns: [{ key: '_id', label: 'Location ID' }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }, { key: 'country', label: 'Country' }, { key: 'status', label: 'Status', badge: true }],
    fields: [['city', 'City'], ['state', 'State'], ['country', 'Country'], ['status', 'Status']],
  },
  payments: {
    resource: 'payments',
    title: 'Payment Management',
    subtitle: 'Manage subscriptions, payment history, invoices, revenue, and failed payments.',
    actionLabel: 'Add Payment',
    modalTitle: 'Payment / Plan Details',
    extra: 'Invoice',
    export: true,
    columns: [{ key: 'invoiceNo', label: 'Invoice' }, { key: 'employer', label: 'Recruiter' }, { key: 'plan', label: 'Plan' }, { key: 'amount', label: 'Amount' }, { key: 'status', label: 'Status', badge: true }],
    fields: [['invoiceNo', 'Invoice number'], ['employer', 'Recruiter'], ['plan', 'Plan'], ['amount', 'Amount'], ['status', 'Payment status']],
  },
  reports: {
    resource: null,
    title: 'Reports',
    subtitle: 'Daily, weekly, monthly, recruiter-wise, job-wise, and candidate-wise reports.',
    actionLabel: 'Generate Report',
    modalTitle: 'Generate Report',
    extra: 'Export',
    export: true,
    columns: [{ key: 'id', label: 'Report ID' }, { key: 'name', label: 'Report' }, { key: 'scope', label: 'Scope' }, { key: 'updated', label: 'Updated' }, { key: 'records', label: 'Records' }],
    fields: [['name', 'Report type'], ['scope', 'Scope'], ['updated', 'Date range'], ['records', 'Records']],
    staticRows: reportRows,
  },
}

const accessByRole = {
  Admin: ['users', 'jobs', 'companies', 'employers', 'candidates', 'applications', 'resumes', 'categories', 'locations', 'payments', 'reports', 'settings'],
  staff: [],
  recruiter: [],
  users: [],
}

const fieldOptions = {
  role: ['Admin', 'staff', 'recruiter', 'users'],
  status: ['Active', 'Inactive', 'Pending', 'Approved', 'Blocked', 'Open', 'Closed', 'New', 'Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
  userStatus: ['Active', 'Inactive', 'Suspend'],
  company: ['Nimbus Tech', 'Talentora', 'Auralis Support', 'BluePeak Finance', 'PeopleMint', 'Marketly Labs', 'Cromgen Solutions'],
  department: ['Engineering', 'Product', 'Design', 'Growth', 'Marketing', 'Sales', 'Customer Success', 'Support', 'HR & Recruitment', 'Finance', 'Operations', 'Research Operations', 'AI Operations'],
  experience: ['Fresher', '0-1 years', '1-3 years', '3-6 years', '6-10 years', '10+ years'],
  type: ['Full Time', 'Part Time', 'Contract', 'Freelance'],
  workMode: ['Remote', 'Hybrid', 'On-site'],
}

const skillOptions = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'PHP', 'Laravel', 'Next.js', 'Tailwind', 'REST API', 'GraphQL', 'MongoDB', 'SQL', 'AWS', 'Docker', 'DevOps', 'QA', 'Selenium', 'Cypress', 'SEO', 'Google Ads', 'Meta Ads', 'Analytics', 'CRM', 'Communication', 'Excel', 'Power BI', 'Data Analysis', 'Machine Learning', 'LLM Review', 'Quality Audit', 'Research', 'Reporting']

const jobTitleOptions = ['Frontend Developer', 'React Developer', 'Next.js Developer', 'Backend Developer', 'Node.js Developer', 'Full Stack Developer', 'MERN Stack Developer', 'Python Developer', 'Java Developer', 'PHP Developer', 'Laravel Developer', 'Mobile App Developer', 'Flutter Developer', 'Android Developer', 'iOS Developer', 'UI/UX Designer', 'Product Designer', 'QA Engineer', 'Automation Tester', 'DevOps Engineer', 'Cloud Engineer', 'Data Analyst', 'Data Scientist', 'Machine Learning Engineer', 'AI Engineer', 'Digital Marketing Executive', 'SEO Specialist', 'Performance Marketing Manager', 'Content Writer', 'Sales Executive', 'Business Development Executive', 'Customer Support Specialist', 'HR Recruiter', 'Talent Acquisition Specialist', 'Finance Analyst', 'Operations Executive', 'Data Entry Operator', 'BPO Executive']

const companyNameOptions = ['Nimbus Tech', 'Talentora', 'Auralis Support', 'BluePeak Finance', 'PeopleMint', 'Marketly Labs', 'Cromgen Solutions', 'TechNova Systems', 'BrightEdge Digital', 'Cloudify Labs', 'HireWave', 'FinEdge Analytics', 'SupportSphere', 'DataMint', 'GrowthWorks']

const industryOptions = ['IT & Software', 'SaaS', 'Fintech', 'Recruitment', 'HR Technology', 'Digital Marketing', 'Customer Support', 'E-commerce', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Logistics', 'AI & Data', 'BPO', 'Consulting']

const recruiterReviewActions = [
  { label: 'Account Reviews', value: 'account_review', status: 'account_review' },
  { label: 'Account Verify', value: 'account_verify', status: 'documents_required' },
  { label: 'Rejected', value: 'rejected', status: 'rejected' },
  { label: 'Hold', value: 'hold', status: 'hold' },
  { label: 'Suspended', value: 'suspended', status: 'suspended' },
]

function normalizeName(value) {
  return String(value || '').trim().toLowerCase()
}

function getDefaultJobLocation() {
  const state = State.getStatesOfCountry('IN')[0]
  const city = City.getCitiesOfState('IN', state?.isoCode || '')[0]
  return {
    locationScope: 'India',
    country: 'India',
    countryCode: 'IN',
    state: state?.name || '',
    stateCode: state?.isoCode || '',
    city: city?.name || '',
  }
}

function getStoredAdminUser() {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null')
  } catch {
    return null
  }
}

export function AdminManagementPage({ type }) {
  const user = getStoredAdminUser()
  const allowedTypes = accessByRole[user?.role] || accessByRole.Admin

  if (!allowedTypes.includes(type)) {
    return <Navigate replace to="/admin" />
  }

  const config = configs[type]
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const resumeMode = searchParams.get('resumeMode') || 'lead'
  const [rows, setRows] = useState(config.staticRows || [])
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState(null)
  const [reviewRemark, setReviewRemark] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)
  const [form, setForm] = useState({})
  const [message, setMessage] = useState('')
  const [companyOptions, setCompanyOptions] = useState(fieldOptions.company)
  const [companyRows, setCompanyRows] = useState([])

  const loadRows = () => {
    if (!config.resource) {
      const staticRows = config.staticRows || []
      setRows(
        staticRows.filter((row) => {
          const matchesSearch = search ? JSON.stringify(row).toLowerCase().includes(search.toLowerCase()) : true
          const matchesStatus = status ? String(row.status || '').toLowerCase() === status.toLowerCase() : true
          return matchesSearch && matchesStatus
        }),
      )
      return
    }

    const resource = type === 'resumes' && resumeMode === 'lead' ? 'candidates' : config.resource
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)

    api
      .list(resource, params.toString() ? `?${params.toString()}` : '')
      .then((payload) => {
        const data = payload.data || []
        setRows(type === 'resumes' && resumeMode === 'lead' ? data.map((row) => ({ ...row, source: 'Lead Resume' })) : data.map((row) => ({ ...row, source: row.source || 'Admin Upload' })))
      })
      .catch((error) => {
        setMessage(error.message)
        setRows([])
      })
  }

  useEffect(() => {
    setMessage('')
    setSelectedRow(null)
    setForm({})
    loadRows()
  }, [type, search, status, resumeMode])

  useEffect(() => {
    api
      .list('companies')
      .then((payload) => {
        const names = (payload.data || []).map((company) => company.name).filter(Boolean)
        setCompanyRows(payload.data || [])
        if (names.length) setCompanyOptions(names)
      })
      .catch(() => {
        setCompanyRows([])
        setCompanyOptions(fieldOptions.company)
      })
  }, [])

  const updateQuery = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const openCreate = () => {
    setSelectedRow(null)
    const initialForm = getInitialForm(type, companyOptions)
    if (type === 'jobs') {
      const company = companyRows.find((item) => normalizeName(item.name) === normalizeName(initialForm.company))
      if (company?.industry) {
        initialForm.industry = company.industry
        initialForm.department = company.industry
      }
    }
    setForm(initialForm)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setSelectedRow(row)
    setForm(rowToForm(row, config.fields))
    setModalOpen(true)
  }

  const requestDelete = (row) => {
    setSelectedRow(row)
    setConfirmOpen(true)
  }

  const save = async () => {
    if (!config.resource) {
      setModalOpen(false)
      setMessage('Report generated successfully.')
      return
    }

    const payload = config.transform ? config.transform(form) : form
    const requiredFields = type === 'users' && !selectedRow ? [...(config.required || []), 'password'] : config.required
    const missingField = requiredFields?.find((key) => !String(form[key] || '').trim())

    if (missingField) {
      setMessage(`${getFieldLabel(config.fields, missingField)} is required.`)
      return
    }

    try {
      const resource = type === 'resumes' ? 'resumes' : config.resource
      const resumePayload = type === 'resumes' ? { ...payload, source: 'Admin Upload' } : payload

      if (selectedRow?._id && !(type === 'resumes' && resumeMode === 'lead')) {
        await api.update(resource, selectedRow._id, resumePayload)
        setMessage('Record updated successfully.')
      } else {
        await api.create(resource, resumePayload)
        setMessage('Record created successfully.')
      }
      setModalOpen(false)
      loadRows()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const remove = async () => {
    if (!selectedRow?._id || !config.resource) {
      setConfirmOpen(false)
      return
    }

    try {
      await api.remove(config.resource, selectedRow._id)
      setMessage('Record deleted successfully.')
      setConfirmOpen(false)
      loadRows()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const applyRecruiterReviewAction = async (row, action, remark = '') => {
    const normalizedAction = recruiterReviewActions.find((item) => item.value === action)
    if (!normalizedAction) return

    const email = row.email || row.businessEmail
    const status = normalizedAction.status
    const backendStatus = action === 'suspended' ? 'Suspend' : action === 'account_verify' ? 'Active' : 'Inactive'
    const localPayload = { status: normalizedAction.label, recruiterVerificationStatus: status, recruiterVerificationRemark: remark }
    const apiPayload = { status: backendStatus, recruiterVerificationStatus: status, recruiterVerificationRemark: remark }

    if (email) {
      localStorage.setItem(`recruiterVerification:${email.toLowerCase()}`, status)
      updateRecruiterVerificationRemark(email, remark)
    }

    try {
      if (row._id && config.resource) {
        await api.update(config.resource, row._id, apiPayload)
      }
      setRows((current) => current.map((item) => (item._id === row._id ? { ...item, ...localPayload } : item)))
      setMessage(`Recruiter account marked as ${normalizedAction.label}.`)
    } catch (error) {
      setRows((current) => current.map((item) => (item._id === row._id ? { ...item, ...localPayload } : item)))
      setMessage(`Saved locally. Backend unavailable: ${error.message}`)
    }
  }

  const selectRecruiterReviewAction = (row, action) => {
    const needsRemark = ['rejected', 'hold', 'suspended'].includes(action)

    if (needsRemark) {
      setReviewAction({ row, action })
      setReviewRemark('')
      return
    }

    applyRecruiterReviewAction(row, action)
  }

  const submitReviewRemark = () => {
    if (!reviewAction) return

    if (!reviewRemark.trim()) {
      setMessage('Remark is required for rejected, hold, and suspended accounts.')
      return
    }

    applyRecruiterReviewAction(reviewAction.row, reviewAction.action, reviewRemark.trim())
    setReviewAction(null)
    setReviewRemark('')
  }

  const actions = useMemo(
    () => (row) => {
      if (type === 'users' && row.role === 'recruiter') {
        return <RecruiterReviewActions onAction={(action) => selectRecruiterReviewAction(row, action)} onDelete={() => requestDelete(row)} onEdit={() => openEdit(row)} />
      }

      return (
        <ActionButtons
          extra={type === 'resumes' ? 'Preview' : config.extra}
          onDelete={type === 'resumes' && resumeMode === 'lead' ? undefined : () => requestDelete(row)}
          onEdit={type === 'resumes' && resumeMode === 'lead' ? () => openEdit(row) : () => openEdit(row)}
        />
      )
    },
    [config.extra, resumeMode, type],
  )

  return (
    <div className="grid gap-5">
      <Toolbar
        actionLabel={config.actionLabel}
        onAction={openCreate}
        onSearchChange={(value) => updateQuery('search', value)}
        onStatusChange={(value) => updateQuery('status', value)}
        searchValue={search}
        statusValue={status}
        subtitle={config.subtitle}
        title={config.title}
      />
      <div className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {['Admin', 'staff', 'recruiter', 'users'].map((role) => <StatusBadge key={role} status={role} />)}
        </div>
        {type === 'resumes' && (
          <select className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 outline-none" onChange={(event) => updateQuery('resumeMode', event.target.value)} value={resumeMode}>
            <option value="lead">Lead Resume</option>
            <option value="upload">Upload Resume</option>
          </select>
        )}
        {config.export && <ExportButtons />}
      </div>
      {message && <p className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700">{message}</p>}
      {type === 'applications' && <ApplicationStatusPanel />}
      {type === 'payments' && <RevenueSummary />}
      <DataTable actions={actions} columns={config.columns} rows={formatRows(rows)} />
      {!rows.length && <EmptyAdminState title={`${config.title} empty state`} />}
      <CrudModal companyOptions={companyOptions} companyRows={companyRows} config={config} form={form} isCreate={!selectedRow} onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))} onClose={() => setModalOpen(false)} onSave={save} open={modalOpen} type={type} />
      <AdminModal open={Boolean(reviewAction)} title="Add recruiter account remark" onClose={() => setReviewAction(null)}>
        <p className="text-sm leading-6 text-slate-500">This remark will be shown to the recruiter on their verification screen.</p>
        <textarea className="input mt-4 min-h-32" onChange={(event) => setReviewRemark(event.target.value)} placeholder="Write reason or next steps for recruiter" value={reviewRemark} />
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700" onClick={() => setReviewAction(null)} type="button">Cancel</button>
          <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white" onClick={submitReviewRemark} type="button">Save Remark</button>
        </div>
      </AdminModal>
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={remove} />
    </div>
  )
}

function getInitialForm(type, companyOptions = fieldOptions.company) {
  if (type === 'users') {
    return {
      name: '',
      email: '',
      role: fieldOptions.role[0],
      password: '',
      status: fieldOptions.userStatus[0],
    }
  }

  if (type === 'companies') {
    return {
      ...getDefaultJobLocation(),
      name: companyNameOptions[0],
      industry: industryOptions[0],
      jobs: 0,
      status: 'Pending',
      address: '',
    }
  }

  if (type === 'jobs') {
    const location = getDefaultJobLocation()
    return {
      ...location,
      title: jobTitleOptions[0],
      company: companyOptions[0] || fieldOptions.company[0],
      industry: '',
      department: fieldOptions.department[0],
      location: formatJobLocation(location),
      experience: fieldOptions.experience[0],
      type: fieldOptions.type[0],
      workMode: fieldOptions.workMode[0],
      status: 'Open',
      approval: 'Pending',
      interviewSameAsOffice: true,
    }
  }

  return {}
}

function getFieldLabel(fields, key) {
  return fields.find(([fieldKey]) => fieldKey === key)?.[1] || key
}

function RecruiterReviewActions({ onAction, onDelete, onEdit }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700" onClick={onEdit} type="button">Edit</button>
      <select className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 outline-none" onChange={(event) => {
        if (event.target.value) onAction(event.target.value)
        event.target.value = ''
      }} defaultValue="">
        <option value="">Actions</option>
        {recruiterReviewActions.map((action) => <option key={action.value} value={action.value}>{action.label}</option>)}
      </select>
      {onDelete && <button className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700" onClick={onDelete} type="button">Delete</button>}
    </div>
  )
}

function getSelectOptions(key, companyOptions) {
  return key === 'company' ? companyOptions : fieldOptions[key]
}

function CrudModal({ companyOptions, companyRows, config, form, isCreate, onChange, onClose, onSave, open, type }) {
  const [showPassword, setShowPassword] = useState(false)
  const fields = type === 'users' && isCreate
    ? [['name', 'Full name'], ['email', 'Email address'], ['role', 'Role: Admin, staff, recruiter, users'], ['password', 'Password'], ['status', 'Status']]
    : config.fields
  const updateMany = (updates) => {
    Object.entries(updates).forEach(([key, value]) => onChange(key, value))
  }

  return (
    <AdminModal open={open} title={config.modalTitle} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([key, label, fieldType]) =>
          fieldType === 'textarea' ? (
            <textarea className="input min-h-28 sm:col-span-2" key={key} onChange={(event) => onChange(key, event.target.value)} placeholder={label} value={form[key] || ''} />
          ) : fieldType === 'jobLocation' ? (
            <JobLocationSelect form={form} key={key} updateMany={updateMany} />
          ) : fieldType === 'companyLocation' ? (
            <CompanyLocationSelect form={form} key={key} updateMany={updateMany} />
          ) : fieldType === 'jobDescription' ? (
            <JobDescriptionField form={form} key={key} onChange={(value) => onChange(key, value)} />
          ) : fieldType === 'date' ? (
            <label className="grid gap-1" key={key}>
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
              <input className="input" onChange={(event) => onChange(key, event.target.value)} type="date" value={toDateInputValue(form[key])} />
            </label>
          ) : key === 'skills' ? (
            <SkillSelect key={key} onChange={(value) => onChange(key, value)} value={form[key] || ''} />
          ) : key === 'title' ? (
            <label className="grid gap-1" key={key}>
              <input className="input" list="job-title-options" onChange={(event) => onChange(key, event.target.value)} placeholder={label} value={form[key] || ''} />
              <datalist id="job-title-options">
                {jobTitleOptions.map((option) => <option key={option} value={option} />)}
              </datalist>
            </label>
          ) : key === 'name' && type === 'companies' ? (
            <label className="grid gap-1" key={key}>
              <input className="input" list="company-name-options" onChange={(event) => onChange(key, event.target.value)} placeholder={label} value={form[key] || ''} />
              <datalist id="company-name-options">
                {companyNameOptions.map((option) => <option key={option} value={option} />)}
              </datalist>
            </label>
          ) : key === 'industry' && type === 'companies' ? (
            <label className="grid gap-1" key={key}>
              <input className="input" list="industry-options" onChange={(event) => onChange(key, event.target.value)} placeholder={label} value={form[key] || ''} />
              <datalist id="industry-options">
                {industryOptions.map((option) => <option key={option} value={option} />)}
              </datalist>
            </label>
          ) : fieldType === 'number' ? (
            <input className="input" key={key} min="0" onChange={(event) => onChange(key, event.target.value)} placeholder={label} type="number" value={form[key] || ''} />
          ) : type === 'users' && key === 'status' ? (
            <select className="input" key={key} onChange={(event) => onChange(key, event.target.value)} value={form[key] || 'Active'}>
              {fieldOptions.userStatus.map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : type === 'users' && key === 'password' ? (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3" key={key}>
              <input
                className="w-full bg-transparent text-sm font-semibold outline-none"
                onChange={(event) => onChange(key, event.target.value)}
                placeholder={label}
                type={showPassword ? 'text' : 'password'}
                value={form[key] || ''}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          ) : fieldOptions[key] ? (
            <select
              className="input"
              key={key}
              onChange={(event) => {
                onChange(key, event.target.value)
                if (type === 'jobs' && key === 'company') {
                  const company = companyRows.find((item) => normalizeName(item.name) === normalizeName(event.target.value))
                  if (company?.industry) {
                    onChange('industry', company.industry)
                    onChange('department', company.industry)
                  }
                }
              }}
              value={form[key] || getSelectOptions(key, companyOptions)[0]}
            >
              {getSelectOptions(key, companyOptions).map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : (
            <input className="input" key={key} onChange={(event) => onChange(key, event.target.value)} placeholder={label} value={form[key] || ''} />
          ),
        )}
      </div>
      {type === 'applications' && (
        <select className="input mt-3" onChange={(event) => onChange('status', event.target.value)} value={form.status || 'New'}>
          {['New', 'Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map((status) => <option key={status}>{status}</option>)}
        </select>
      )}
      {type === 'resumes' && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
          <p className="flex items-center gap-2 font-bold"><Eye size={17} /> Resume preview panel</p>
          <p>Skills, experience, application history, and download controls appear here.</p>
        </div>
      )}
      <div className="mt-5 flex flex-col justify-end gap-2 sm:flex-row">
        <button className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700" onClick={onClose} type="button">Cancel</button>
        <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white" onClick={onSave} type="button">Save Changes</button>
      </div>
    </AdminModal>
  )
}

function SkillSelect({ onChange, value }) {
  const [query, setQuery] = useState('')
  const selected = splitComma(value)
  const filteredSkills = skillOptions.filter((skill) => skill.toLowerCase().includes(query.trim().toLowerCase()))

  const toggle = (skill) => {
    const next = selected.includes(skill) ? selected.filter((item) => item !== skill) : [...selected, skill]
    onChange(next.join(', '))
  }

  return (
    <div className="sm:col-span-2">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">Skills</p>
      <input
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search skills"
        value={query}
      />
      <div className="mt-3 flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
        {filteredSkills.map((skill) => {
          const active = selected.includes(skill)
          return (
            <button
              className={`rounded-full px-3 py-2 text-xs font-black transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700'}`}
              key={skill}
              onClick={() => toggle(skill)}
              type="button"
            >
              {skill}
            </button>
          )
        })}
        {!filteredSkills.length && <p className="text-sm font-semibold text-slate-500">No skills found.</p>}
      </div>
    </div>
  )
}

function JobLocationSelect({ form, updateMany }) {
  const location = {
    ...getDefaultJobLocation(),
    ...form,
  }
  const countryOptions = location.locationScope === 'India' ? [Country.getCountryByCode('IN')].filter(Boolean) : Country.getAllCountries()
  const stateOptions = State.getStatesOfCountry(location.countryCode || 'IN')
  const cityOptions = City.getCitiesOfState(location.countryCode || 'IN', location.stateCode || '')

  const setScope = (locationScope) => {
    const countryCode = locationScope === 'India' ? 'IN' : 'US'
    const country = Country.getCountryByCode(countryCode)
    const state = State.getStatesOfCountry(countryCode)[0]
    const city = City.getCitiesOfState(countryCode, state?.isoCode || '')[0]

    updateMany({
      locationScope,
      country: country?.name || '',
      countryCode,
      state: state?.name || '',
      stateCode: state?.isoCode || '',
      city: city?.name || '',
      location: [city?.name, state?.name, country?.name].filter(Boolean).join(', '),
    })
  }

  const setCountry = (countryCode) => {
    const country = Country.getCountryByCode(countryCode)
    const state = State.getStatesOfCountry(countryCode)[0]
    const city = City.getCitiesOfState(countryCode, state?.isoCode || '')[0]

    updateMany({
      country: country?.name || '',
      countryCode,
      state: state?.name || '',
      stateCode: state?.isoCode || '',
      city: city?.name || '',
      location: [city?.name, state?.name, country?.name].filter(Boolean).join(', '),
    })
  }

  const setState = (stateCode) => {
    const state = State.getStateByCodeAndCountry(stateCode, location.countryCode)
    const city = City.getCitiesOfState(location.countryCode, stateCode)[0]

    updateMany({
      state: state?.name || '',
      stateCode,
      city: city?.name || '',
      location: [city?.name, state?.name, location.country].filter(Boolean).join(', '),
    })
  }

  const setCity = (city) => {
    updateMany({ city, location: [city, location.state, location.country].filter(Boolean).join(', ') })
  }

  return (
    <div className="sm:col-span-2">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">Job Location</p>
      <div className="mt-2 grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-2">
        <SelectField label="Region" onChange={setScope} options={['India', 'International']} value={location.locationScope} />
        <SelectField label="Country" onChange={setCountry} options={countryOptions.map((country) => ({ label: country.name, value: country.isoCode }))} value={location.countryCode} />
        <SelectField label={location.locationScope === 'India' ? 'State / UT' : 'State / Province'} onChange={setState} options={stateOptions.map((state) => ({ label: state.name, value: state.isoCode }))} value={location.stateCode} />
        <SelectField label="City" onChange={setCity} options={cityOptions.map((city) => ({ label: city.name, value: city.name }))} value={location.city} />
        <label className="sm:col-span-2">
          <span className="text-xs font-black uppercase tracking-wide text-slate-400">Office Address</span>
          <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500" onChange={(event) => updateMany({ officeAddress: event.target.value, ...(location.interviewSameAsOffice !== false ? { interviewAddress: event.target.value } : {}) })} placeholder="Office address, landmark, floor, PIN/ZIP" value={form.officeAddress || ''} />
        </label>
        <label className="flex items-center justify-between rounded-xl bg-white p-3 text-sm font-bold text-slate-600 ring-1 ring-slate-200 sm:col-span-2">
          Interview address same as office
          <input checked={form.interviewSameAsOffice !== false} className="h-5 w-5 accent-blue-600" onChange={(event) => updateMany({ interviewSameAsOffice: event.target.checked, interviewAddress: event.target.checked ? form.officeAddress || '' : form.interviewAddress || '' })} type="checkbox" />
        </label>
        {form.interviewSameAsOffice === false && (
          <label className="sm:col-span-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">Interview Address</span>
            <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500" onChange={(event) => updateMany({ interviewAddress: event.target.value })} placeholder="Interview venue address if different from office" value={form.interviewAddress || ''} />
          </label>
        )}
      </div>
    </div>
  )
}

function SelectField({ label, onChange, options, value }) {
  return (
    <label>
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
      <select className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500" onChange={(event) => onChange(event.target.value)} value={value || ''}>
        {options.map((option) => {
          const normalized = typeof option === 'string' ? { label: option, value: option } : option
          return <option key={normalized.value} value={normalized.value}>{normalized.label}</option>
        })}
      </select>
    </label>
  )
}

function CompanyLocationSelect({ form, updateMany }) {
  const location = {
    ...getDefaultJobLocation(),
    ...form,
  }
  const countryOptions = location.locationScope === 'India' ? [Country.getCountryByCode('IN')].filter(Boolean) : Country.getAllCountries()
  const stateOptions = State.getStatesOfCountry(location.countryCode || 'IN')
  const cityOptions = City.getCitiesOfState(location.countryCode || 'IN', location.stateCode || '')

  const setScope = (locationScope) => {
    const countryCode = locationScope === 'India' ? 'IN' : 'US'
    const country = Country.getCountryByCode(countryCode)
    const state = State.getStatesOfCountry(countryCode)[0]
    const city = City.getCitiesOfState(countryCode, state?.isoCode || '')[0]

    updateMany({
      locationScope,
      country: country?.name || '',
      countryCode,
      state: state?.name || '',
      stateCode: state?.isoCode || '',
      city: city?.name || '',
      location: [city?.name, state?.name, country?.name].filter(Boolean).join(', '),
    })
  }

  const setCountry = (countryCode) => {
    const country = Country.getCountryByCode(countryCode)
    const state = State.getStatesOfCountry(countryCode)[0]
    const city = City.getCitiesOfState(countryCode, state?.isoCode || '')[0]

    updateMany({
      country: country?.name || '',
      countryCode,
      state: state?.name || '',
      stateCode: state?.isoCode || '',
      city: city?.name || '',
      location: [city?.name, state?.name, country?.name].filter(Boolean).join(', '),
    })
  }

  const setState = (stateCode) => {
    const state = State.getStateByCodeAndCountry(stateCode, location.countryCode)
    const city = City.getCitiesOfState(location.countryCode, stateCode)[0]

    updateMany({
      state: state?.name || '',
      stateCode,
      city: city?.name || '',
      location: [city?.name, state?.name, location.country].filter(Boolean).join(', '),
    })
  }

  const setCity = (city) => {
    updateMany({ city, location: [city, location.state, location.country].filter(Boolean).join(', ') })
  }

  return (
    <div className="sm:col-span-2">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">Company Location</p>
      <div className="mt-2 grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-2">
        <SelectField label="Region" onChange={setScope} options={['India', 'International']} value={location.locationScope} />
        <SelectField label="Country" onChange={setCountry} options={countryOptions.map((country) => ({ label: country.name, value: country.isoCode }))} value={location.countryCode} />
        <SelectField label={location.locationScope === 'India' ? 'State / UT' : 'State / Province'} onChange={setState} options={stateOptions.map((state) => ({ label: state.name, value: state.isoCode }))} value={location.stateCode} />
        <SelectField label="City" onChange={setCity} options={cityOptions.map((city) => ({ label: city.name, value: city.name }))} value={location.city} />
        <label className="sm:col-span-2">
          <span className="text-xs font-black uppercase tracking-wide text-slate-400">Address</span>
          <textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500" onChange={(event) => updateMany({ address: event.target.value })} placeholder="Company office address, landmark, floor, PIN/ZIP" value={form.address || ''} />
        </label>
      </div>
    </div>
  )
}

function JobDescriptionField({ form, onChange }) {
  const generate = () => {
    const skills = splitComma(form.skills).join(', ') || 'relevant tools and business skills'
    const description = `We are hiring a ${form.title || 'skilled professional'} for ${form.company || 'our company'} in the ${form.department || 'relevant'} department. This ${form.type || 'Full Time'} role is designed for candidates with ${form.experience || 'relevant experience'} who can work in a ${form.workMode || 'Hybrid'} setup from ${formatJobLocation(form) || 'the selected location'}.

The selected candidate will own day-to-day execution, collaborate with cross-functional teams, and deliver high-quality work aligned with business goals. Strong practical knowledge of ${skills} is expected, along with clear communication, ownership, and problem-solving ability.

Key responsibilities include understanding requirements, planning and delivering tasks on time, coordinating with internal stakeholders, maintaining quality standards, and sharing regular progress updates. Candidates should be comfortable working in a fast-paced environment and adapting to changing priorities.

This role offers growth opportunities, exposure to real projects, and a professional hiring workflow. Applicants should review the job details carefully and apply before the deadline.`

    onChange(description)
  }

  return (
    <div className="sm:col-span-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Description</p>
        <button className="rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700" onClick={generate} type="button">
          AI Generate
        </button>
      </div>
      <textarea className="input min-h-48" onChange={(event) => onChange(event.target.value)} placeholder="Description" value={form.description || ''} />
    </div>
  )
}

function ApplicationStatusPanel() {
  return (
    <AdminCard>
      <h3 className="mb-4 text-lg font-black text-slate-950">Application Status Workflow</h3>
      <div className="flex flex-wrap gap-2">
        {['New', 'Reviewed', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map((status) => <StatusBadge key={status} status={status} />)}
      </div>
    </AdminCard>
  )
}

function RevenueSummary() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ['Subscription Plans', '4 active tiers', ShieldCheck],
        ['Revenue Summary', 'INR 42.8L', FileText],
        ['Failed Payments', '16 retries', Download],
      ].map(([label, value, Icon]) => (
        <AdminCard key={label}>
          <Icon className="text-blue-600" size={24} />
          <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
        </AdminCard>
      ))}
    </div>
  )
}

export function AdminSettingsPage() {
  return (
    <div className="grid gap-5">
      <Toolbar actionLabel="Settings Disabled" subtitle="Settings controls are currently hidden from this panel." title="Settings" />
      <EmptyAdminState title="No settings controls available" />
    </div>
  )
}

function splitComma(value) {
  if (Array.isArray(value)) return value
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
}

function rowToForm(row, fields) {
  return fields.reduce((acc, [key]) => {
    acc[key] = Array.isArray(row[key]) ? row[key].join(', ') : toDateInputValue(row[key]) || row[key] || ''
    return acc
  }, {})
}

function toDateInputValue(value) {
  if (!value || value === 'Today') return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return value

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
}

function formatJobLocation(form) {
  return [form.city, form.state, form.country].filter(Boolean).join(', ') || form.location || ''
}

function formatRows(rows) {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        if (Array.isArray(value)) return [key, value.join(', ')]
        if (key === 'createdAt' && value) return [key, new Date(value).toLocaleDateString()]
        return [key, value]
      }),
    ),
  )
}
