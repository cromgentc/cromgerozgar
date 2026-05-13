import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, Eye, EyeOff, Globe2, Lock, Mail } from 'lucide-react'
import { Button } from '../../components/Button'
import { getDashboardPath, normalizeRole } from '../../routes/authRouting'
import { api } from '../../services/api'
import employerImage from '../../assets/employer-hiring-suite.png'

const initialRegister = {
  companyName: '',
  businessEmail: '',
  phone: '',
  industry: '',
  companySize: '',
  website: '',
  location: '',
  password: '',
  confirmPassword: '',
}

function saveSession(payload) {
  localStorage.setItem('authToken', payload.token)
  localStorage.setItem('authUser', JSON.stringify({ ...payload.data, role: normalizeRole(payload.data.role) }))
}

export function EmployerLoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = await api.employerLogin(form)
      if (normalizeRole(payload.data.role) !== 'Employer') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        setMessage('Only recruiter accounts can login from this page.')
        return
      }

      saveSession(payload)
      setMessage('Recruiter login successful. Redirecting...')
      navigate(getDashboardPath(payload.data.role))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <EmployerAuthShell title="Recruiter Login" subtitle="Access your recruiter hiring workspace, review applications, and manage hiring workflows.">
      <form className="grid gap-4" onSubmit={submit}>
        <Field icon={Mail} label="Business Email" onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} placeholder="recruiter@cromgen.test" required type="email" value={form.email} />
        <Field icon={Lock} label="Password" onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} placeholder="password123" required type="password" value={form.password} />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" /> Remember me</label>
          <a className="font-bold text-blue-600" href="#forgot">Forgot password?</a>
        </div>
        {message && <p className="rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-700">{message}</p>}
        <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700" disabled={loading} type="submit">
          {loading ? 'Logging in...' : 'Login to Recruiter Portal'}
        </button>
        <Button className="w-full" variant="secondary"><Globe2 size={18} /> Continue with Google</Button>
        <p className="text-center text-sm text-slate-500">New recruiter? <Link className="font-black text-blue-600" to="/recruiter-register">Register Recruiter</Link></p>
      </form>
    </EmployerAuthShell>
  )
}

export function EmployerRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialRegister)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async () => {
    if (form.password !== form.confirmPassword) {
      setMessage('Password and confirm password do not match.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const payload = await api.register({
        name: form.companyName,
        email: form.businessEmail,
        password: form.password,
        role: 'Employer',
      })

      await api.employerRegister({
        companyName: form.companyName,
        businessEmail: form.businessEmail,
        phone: form.phone,
        industry: form.industry,
        companySize: form.companySize,
        website: form.website,
        location: form.location,
      }).catch(() => null)

      saveSession(payload)
      setMessage('Recruiter registered successfully. Redirecting...')
      navigate(getDashboardPath(payload.data.role))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <EmployerAuthShell title="Register Recruiter" subtitle="Create your recruiter account and start building a premium hiring pipeline.">
      <div className="mb-6">
        <div className="flex justify-between text-sm font-black text-slate-600"><span>Step {step} of 2</span><span>{step === 1 ? 'Recruiter info' : 'Hiring setup'}</span></div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-400 ${step === 1 ? 'w-1/2' : 'w-full'}`} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {step === 1 ? (
          <>
            <input className="input" onChange={(e) => update('companyName', e.target.value)} placeholder="Company Name" required value={form.companyName} />
            <input className="input" onChange={(e) => update('businessEmail', e.target.value)} placeholder="Business Email" required type="email" value={form.businessEmail} />
            <input className="input" onChange={(e) => update('phone', e.target.value)} placeholder="Phone Number" value={form.phone} />
            <input className="input" onChange={(e) => update('industry', e.target.value)} placeholder="Industry" value={form.industry} />
          </>
        ) : (
          <>
            <input className="input" onChange={(e) => update('companySize', e.target.value)} placeholder="Company Size" value={form.companySize} />
            <input className="input" onChange={(e) => update('website', e.target.value)} placeholder="Website URL" value={form.website} />
            <input className="input" onChange={(e) => update('location', e.target.value)} placeholder="Location" value={form.location} />
            <PasswordInput onChange={(e) => update('password', e.target.value)} placeholder="Password" required value={form.password} />
            <PasswordInput className="sm:col-span-2" onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Confirm Password" required value={form.confirmPassword} />
          </>
        )}
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm text-slate-500"><input type="checkbox" /> I agree to recruiter terms and hiring policies.</label>
      {message && <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-700">{message}</p>}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {step > 1 && <Button className="flex-1" onClick={() => setStep(1)} variant="secondary">Back</Button>}
        <button
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
          disabled={loading}
          onClick={() => (step === 1 ? setStep(2) : submit())}
          type="button"
        >
          {loading ? 'Please wait...' : step === 1 ? 'Continue' : 'Register Recruiter'}
        </button>
      </div>
      <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-black text-blue-600" to="/recruiter-login">Login</Link></p>
    </EmployerAuthShell>
  )
}

function EmployerAuthShell({ title, subtitle, children }) {
  return (
    <section className="grid min-h-[calc(100vh-76px)] place-items-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white bg-white/85 shadow-2xl shadow-blue-100 backdrop-blur-xl lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative bg-gradient-to-br from-blue-600 via-sky-500 to-violet-500 p-8 text-white sm:p-10">
          <div className="relative z-10">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15"><Building2 size={28} /></div>
            <h1 className="mt-5 text-4xl font-black">{title}</h1>
            <p className="mt-4 leading-7 text-blue-50">{subtitle}</p>
            <div className="mt-8 grid gap-3">
              {['Verified recruiter profile', 'Collaborative recruiter workspace', 'Application and shortlist management'].map((item) => <p className="flex items-center gap-3 rounded-2xl bg-white/15 p-4 font-semibold" key={item}><CheckCircle2 size={18} />{item}</p>)}
            </div>
          </div>
          <img className="relative z-10 mt-8 w-full rounded-[1.75rem] bg-white/10 object-contain p-2" src={employerImage} alt="Recruiter portal illustration" />
        </div>
        <div className="p-6 sm:p-10">{children}</div>
      </div>
    </section>
  )
}

function Field({ icon: Icon, label, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = props.type === 'password'
  const InputIcon = showPassword ? EyeOff : Eye

  return (
    <label>
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
        <Icon size={18} className="text-blue-600" />
        <input className="w-full outline-none" {...props} type={isPassword && showPassword ? 'text' : props.type} />
        {isPassword && (
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            <InputIcon size={18} />
          </button>
        )}
      </div>
    </label>
  )
}

function PasswordInput({ className = '', ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const InputIcon = showPassword ? EyeOff : Eye

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 ${className}`}>
      <input className="w-full bg-transparent text-sm font-semibold outline-none" {...props} type={showPassword ? 'text' : 'password'} />
      <button
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
        onClick={() => setShowPassword((value) => !value)}
        type="button"
      >
        <InputIcon size={18} />
      </button>
    </div>
  )
}
