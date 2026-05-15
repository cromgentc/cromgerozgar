import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Phone, UserRound } from 'lucide-react'
import { GoogleAuthButton } from '../components/GoogleAuthButton'
import { getDashboardPath, normalizeRole } from '../routes/authRouting'
import { api } from '../services/api'

const initialForm = {
  name: '',
  phone: '',
  meta: '',
  email: '',
  password: '',
}

const registerRoles = [
  { label: 'Candidate', value: 'Candidate' },
  { label: 'Recruiter', value: 'recruiter' },
]

function saveSession(payload) {
  localStorage.setItem('authToken', payload.token)
  localStorage.setItem('authUser', JSON.stringify({ ...payload.data, role: normalizeRole(payload.data.role) }))
}

export function AuthPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('Candidate')
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'login'

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = isLogin
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({ name: form.name, email: form.email, password: form.password, role })

      saveSession(payload)
      setMessage(`${getRoleLabel(payload.data.role)} login successful. Redirecting...`)
      navigate(getDashboardPath(payload.data.role))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const googleSubmit = async (credential) => {
    setLoading(true)
    setMessage('')

    try {
      const payload = await api.googleAuth({ credential, mode, role })
      saveSession(payload)
      setMessage(`${getRoleLabel(payload.data.role)} Google login successful. Redirecting...`)
      navigate(getDashboardPath(payload.data.role))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-170px)] place-items-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white bg-white/85 shadow-2xl shadow-blue-100 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-gradient-to-br from-blue-600 via-sky-500 to-violet-500 p-8 text-white sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-50">Secure account access</p>
          <h1 className="mt-4 text-4xl font-black">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-4 leading-7 text-blue-50">
            {isLogin
              ? 'Login with seeded demo credentials or your MongoDB account.'
              : 'Register a dynamic account and start using the portal.'}
          </p>
          <div className="mt-10 grid gap-4">
            {['Candidate dashboard', 'Recruiter hiring suite', 'Admin control center'].map((item) => (
              <div className="rounded-2xl bg-white/15 p-4 font-semibold" key={item}>{item}</div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">{isLogin ? 'Login' : 'Register'}</h2>
              <p className="mt-1 text-sm text-slate-500">{isLogin ? 'Use email and password' : `${getRoleLabel(role)} access portal`}</p>
            </div>
            <p className="text-sm text-slate-500">
              {isLogin ? 'New here?' : 'Already have an account?'}{' '}
              <button
                className="font-black text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setMode(isLogin ? 'register' : 'login')
                  setMessage('')
                }}
                type="button"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>

          {!isLogin && (
            <div className="mb-6 grid grid-cols-2 rounded-full bg-slate-100 p-1">
              {registerRoles.map((item) => (
                <button className={`rounded-full px-4 py-2 text-sm font-black transition ${role === item.value ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`} key={item.value} onClick={() => setRole(item.value)} type="button">{item.label}</button>
              ))}
            </div>
          )}

          <form className="grid gap-4" onSubmit={submit}>
            {!isLogin && (
              <>
                <Field icon={UserRound} label="Full Name" onChange={(e) => update('name', e.target.value)} placeholder="Your full name" required value={form.name} />
                <Field icon={Phone} label="Phone" onChange={(e) => update('phone', e.target.value)} placeholder="Phone number" value={form.phone} />
                <Field icon={UserRound} label={role === 'Candidate' ? 'Target Role' : 'Company Name'} onChange={(e) => update('meta', e.target.value)} placeholder={role === 'Candidate' ? 'Frontend Developer' : 'Company name'} value={form.meta} />
              </>
            )}
            <Field icon={Mail} label="Email" onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required type="email" value={form.email} />
            <Field icon={Lock} label="Password" onChange={(e) => update('password', e.target.value)} placeholder="Password" required type="password" value={form.password} />
            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" /> Remember me</label>
                <a className="font-semibold text-blue-600" href="#forgot">Forgot password?</a>
              </div>
            )}
            {message && <p className="rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-700">{message}</p>}
            <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700" disabled={loading} type="submit">
              {loading ? 'Please wait...' : isLogin ? 'Login' : `Create ${getRoleLabel(role)} Account`}
            </button>
            <GoogleAuthButton disabled={loading} onCredential={googleSubmit} />
          </form>
        </div>
      </div>
    </section>
  )
}

function getRoleLabel(role) {
  return normalizeRole(role) === 'recruiter' ? 'Recruiter' : normalizeRole(role)
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
