import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, MessageCircle, Phone, UserRound } from 'lucide-react'
import { GoogleAuthButton } from '../components/GoogleAuthButton'
import { getDashboardPath, normalizeRole } from '../routes/authRouting'
import { api } from '../services/api'
import { showMessageToast } from '../utils/toast'

const initialForm = {
  name: '',
  phone: '',
  meta: '',
  email: '',
  password: '',
}

const registerRoles = [
  { label: 'Candidate', value: 'Candidate' },
  { label: 'Freelancer', value: 'freelancer' },
  { label: 'Recruiter', value: 'recruiter' },
]

const primarySkillSuggestions = [
  'React Developer',
  'Node.js Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'Graphic Designer',
  'Content Writer',
  'SEO Specialist',
  'Digital Marketer',
  'Data Entry Operator',
  'Video Editor',
  'Social Media Manager',
  'Virtual Assistant',
  'Customer Support',
  'WordPress Developer',
  'Mobile App Developer',
]

const targetRoleSuggestions = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'Java Developer',
  'UI/UX Designer',
  'Graphic Designer',
  'Digital Marketer',
  'SEO Specialist',
  'Content Writer',
  'Data Analyst',
  'HR Executive',
  'Customer Support Executive',
  'Sales Executive',
  'Accountant',
  'Data Entry Operator',
]

function saveSession(payload) {
  localStorage.setItem('authToken', payload.token)
  localStorage.setItem('authUser', JSON.stringify({ ...payload.data, role: normalizeRole(payload.data.role) }))
}

export function AuthPage({ defaultMode = 'login', defaultRole = 'Candidate', lockRole = false }) {
  const navigate = useNavigate()
  const [role, setRole] = useState(defaultRole)
  const [mode, setMode] = useState(defaultMode)
  const [form, setForm] = useState(initialForm)
  const [forgotMode, setForgotMode] = useState('')
  const [forgotForm, setForgotForm] = useState({ email: '', phone: '', otp: '' })
  const [otpSent, setOtpSent] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [resetPasswordValue, setResetPasswordValue] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'login'

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const updateForgot = (key, value) => setForgotForm((current) => ({ ...current, [key]: value }))
  const notify = (text, type) => {
    setMessage('')
    if (text) showMessageToast(text, type ? { type } : {})
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token') || ''
    if (token) {
      setMode('login')
      setForgotMode('reset-password')
      setResetToken(token)
      return
    }

    if (window.location.hash === '#forgot') {
      setMode('login')
      setForgotMode('choice')
    }
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = isLogin
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role })

      saveSession(payload)
      notify(`${getRoleLabel(payload.data.role)} login successful. Redirecting...`, 'success')
      navigate(getDashboardPath(payload.data.role))
    } catch (error) {
      notify(getAuthErrorMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }

  const requestOtp = async () => {
    setLoading(true)
    setMessage('')

    try {
      const isLoginOtp = forgotMode === 'login-whatsapp'
      const payload = isLoginOtp
        ? await api.whatsappLoginOtp({ phone: forgotForm.phone })
        : await api.requestWhatsappOtp({ phone: forgotForm.phone })
      setOtpSent(true)
      notify(payload.message || 'OTP sent successfully.', 'success')
    } catch (error) {
      notify(getAuthErrorMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtpLogin = async () => {
    setLoading(true)
    setMessage('')

    try {
      const isLoginOtp = forgotMode === 'login-whatsapp'
      const payload = isLoginOtp
        ? await api.whatsappLoginVerify({ phone: forgotForm.phone, otp: forgotForm.otp })
        : await api.verifyWhatsappOtp({ phone: forgotForm.phone, otp: forgotForm.otp })
      saveSession(payload)
      notify('OTP verified. Redirecting...', 'success')
      navigate(getDashboardPath(payload.data.role))
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const requestGmailReset = async () => {
    setLoading(true)
    setMessage('')

    try {
      const payload = await api.forgotEmail({ email: forgotForm.email })
      notify(payload.message || 'Gmail reset request submitted.', 'success')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const submitResetPassword = async () => {
    setLoading(true)
    setMessage('')

    try {
      const payload = await api.resetPassword({ token: resetToken, password: resetPasswordValue })
      notify(payload.message || 'Password reset successfully. Please login.', 'success')
      setForgotMode('')
      setResetPasswordValue('')
      window.history.replaceState({}, '', '/auth')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const openForgot = (nextMode = 'choice') => {
    setMode('login')
    setForgotMode(nextMode)
    setOtpSent(false)
    setMessage('')
  }

  const googleSubmit = async (credential) => {
    setLoading(true)
    setMessage('')

    try {
      const payload = await api.googleAuth({ credential, mode, role })
      saveSession(payload)
      notify(`${getRoleLabel(payload.data.role)} Google login successful. Redirecting...`, 'success')
      navigate(getDashboardPath(payload.data.role))
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-76px)] place-items-start bg-gradient-to-br from-blue-50 via-white to-teal-50 px-0 py-0 sm:min-h-[calc(100vh-170px)] sm:place-items-center sm:px-4 sm:py-12">
      <div className="grid w-full max-w-6xl overflow-hidden border border-white bg-white/90 shadow-xl shadow-blue-100 backdrop-blur-xl sm:rounded-[7px] sm:shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden bg-gradient-to-br from-blue-600 via-sky-500 to-violet-500 p-8 text-white sm:p-10 lg:block">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-50">Secure account access</p>
          <h1 className="mt-4 text-4xl font-black">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-4 leading-7 text-blue-50">
            {isLogin
              ? 'Login with seeded demo credentials or your MongoDB account.'
              : 'Register a dynamic account and start using the portal.'}
          </p>
          <div className="mt-10 grid gap-4">
            {['Candidate dashboard', 'Recruiter hiring suite', 'Admin control center'].map((item) => (
              <div className="rounded-[7px] bg-white/15 p-4 font-semibold" key={item}>{item}</div>
            ))}
          </div>
        </div>

        <div className="w-full p-4 sm:p-10">
          <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{isLogin ? 'Login' : 'Register'}</h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{isLogin ? 'Use email and password' : `${getRoleLabel(role)} access portal`}</p>
            </div>
            <p className="text-xs text-slate-500 sm:text-sm">
              {isLogin ? 'New here?' : 'Already have an account?'}{' '}
              <button
                className="font-black text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setMode(isLogin ? 'register' : 'login')
                  setForgotMode('')
                  setMessage('')
                }}
                type="button"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>

            {!isLogin && !lockRole && (
              <div className="mb-4 grid grid-cols-2 rounded-[7px] bg-slate-100 p-1 sm:mb-6 sm:grid-cols-3">
                {registerRoles.map((item) => (
                  <button className={`rounded-[7px] px-4 py-2 text-sm font-black transition ${item.value === 'recruiter' ? 'hidden sm:block' : ''} ${role === item.value ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`} key={item.value} onClick={() => setRole(item.value)} type="button">{item.label}</button>
                ))}
              </div>
            )}

          {isLogin && forgotMode ? (
            <ForgotAccessPanel
              forgotForm={forgotForm}
              forgotMode={forgotMode}
              loading={loading}
              message={message}
              onBack={() => openForgot('choice')}
              onCancel={() => {
                setForgotMode('')
                setMessage('')
              }}
              onGmail={() => openForgot('gmail')}
              onOtpRequest={requestOtp}
              onOtpVerify={verifyOtpLogin}
              onSubmitGmail={requestGmailReset}
              onSubmitResetPassword={submitResetPassword}
              onUpdate={updateForgot}
              onWhatsapp={() => openForgot('whatsapp')}
              otpSent={otpSent}
              resetPasswordValue={resetPasswordValue}
              setResetPasswordValue={setResetPasswordValue}
            />
          ) : (
          <form className="grid gap-3 sm:gap-4" onSubmit={submit}>
            {!isLogin && (
              <>
                <Field icon={UserRound} label="Full Name" onChange={(e) => update('name', e.target.value)} placeholder="Your full name" required value={form.name} />
                <Field icon={Phone} label="Phone" onChange={(e) => update('phone', e.target.value)} placeholder="Phone number" value={form.phone} />
                <Field icon={UserRound} label={getMetaLabel(role)} list={getMetaSuggestionList(role)} onChange={(e) => update('meta', e.target.value)} placeholder={getMetaPlaceholder(role)} value={form.meta} />
                {normalizeRole(role) === 'freelancer' && (
                  <datalist id="primary-skill-suggestions">
                    {primarySkillSuggestions.map((skill) => <option key={skill} value={skill} />)}
                  </datalist>
                )}
                {normalizeRole(role) === 'Candidate' && (
                  <datalist id="target-role-suggestions">
                    {targetRoleSuggestions.map((targetRole) => <option key={targetRole} value={targetRole} />)}
                  </datalist>
                )}
              </>
            )}
            <Field icon={Mail} label="Email" onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required type="email" value={form.email} />
            <Field icon={Lock} label="Password" onChange={(e) => update('password', e.target.value)} placeholder="Password" required type="password" value={form.password} />
            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" /> Remember me</label>
                <button className="font-semibold text-blue-600" onClick={() => openForgot('choice')} type="button">Forgot password?</button>
              </div>
            )}
            {message && <p className="rounded-[7px] bg-blue-50 p-3 text-sm font-bold text-blue-700">{message}</p>}
            <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700" disabled={loading} type="submit">
              {loading ? 'Please wait...' : isLogin ? 'Login' : `Create ${getRoleLabel(role)} Account`}
            </button>
            <div className="flex items-center justify-center gap-3">
              {isLogin && (
                <GoogleAuthButton disabled={loading} iconOnly onCredential={googleSubmit} />
              )}
              {isLogin && (
                <button
                  aria-label="WhatsApp OTP login"
                  className="grid h-11 w-11 place-items-center rounded-[7px] border border-[#25D366]/25 bg-[#25D366]/10 text-[#128C7E] shadow-sm shadow-emerald-100 transition hover:border-[#25D366]/45 hover:bg-[#25D366]/15"
                  disabled={loading}
                  onClick={() => openForgot('login-whatsapp')}
                  title="WhatsApp OTP login"
                  type="button"
                >
                  <MessageCircle size={19} />
                </button>
              )}
            </div>
          </form>
          )}
        </div>
      </div>
    </section>
  )
}

function ForgotAccessPanel({ forgotForm, forgotMode, loading, message, onBack, onCancel, onGmail, onOtpRequest, onOtpVerify, onSubmitGmail, onSubmitResetPassword, onUpdate, onWhatsapp, otpSent, resetPasswordValue, setResetPasswordValue }) {
  if (forgotMode === 'reset-password') {
    return (
      <div className="grid gap-4">
        <div className="rounded-[7px] bg-blue-50 p-4">
          <p className="font-black text-slate-950">Set new password</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">Enter your new password to complete reset.</p>
        </div>
        <Field icon={Lock} label="New Password" onChange={(e) => setResetPasswordValue(e.target.value)} placeholder="New password" required type="password" value={resetPasswordValue} />
        {message && <p className="rounded-[7px] bg-blue-50 p-3 text-sm font-bold text-blue-700">{message}</p>}
        <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} onClick={onSubmitResetPassword} type="button">
          {loading ? 'Please wait...' : 'Reset Password'}
        </button>
      </div>
    )
  }

  if (forgotMode === 'choice') {
    return (
      <div className="grid gap-4">
        <button className="flex items-center gap-4 rounded-[7px] border border-slate-200 p-4 text-left transition hover:border-green-200 hover:bg-green-50" onClick={onWhatsapp} type="button">
          <span className="grid h-11 w-11 place-items-center rounded-[7px] bg-green-50 text-green-700"><MessageCircle size={21} /></span>
          <span>
            <span className="block font-black text-slate-950">Recover with WhatsApp mobile number</span>
            <span className="mt-1 block text-sm font-semibold text-slate-500">Verify the mobile OTP to log in directly.</span>
          </span>
        </button>
        <button className="flex items-center gap-4 rounded-[7px] border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50" onClick={onGmail} type="button">
          <span className="grid h-11 w-11 place-items-center rounded-[7px] bg-blue-50 text-blue-700"><Mail size={21} /></span>
          <span>
            <span className="block font-black text-slate-950">Recover with Gmail</span>
            <span className="mt-1 block text-sm font-semibold text-slate-500">Send a password reset request to your registered Gmail address.</span>
          </span>
        </button>
        <button className="justify-self-start text-sm font-black text-slate-500 hover:text-blue-700" onClick={onCancel} type="button">Back to login</button>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {forgotMode === 'whatsapp' || forgotMode === 'login-whatsapp' ? (
        <>
          <div className="rounded-[7px] bg-green-50 p-4">
            <p className="font-black text-slate-950">{forgotMode === 'login-whatsapp' ? 'WhatsApp Login' : 'WhatsApp Forget Access'}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">Verify the OTP sent to your registered mobile number to log in directly.</p>
          </div>
          <Field icon={Phone} label="WhatsApp Mobile Number" onChange={(e) => onUpdate('phone', e.target.value)} placeholder="Registered mobile number" required value={forgotForm.phone} />
          {otpSent && <Field icon={Lock} label="WhatsApp OTP" onChange={(e) => onUpdate('otp', e.target.value)} placeholder="6 digit OTP" required value={forgotForm.otp} />}
          <div className="grid gap-2 sm:grid-cols-2">
            <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} onClick={otpSent ? onOtpVerify : onOtpRequest} type="button">
              {loading ? 'Please wait...' : otpSent ? 'Verify OTP & Login' : 'Send WhatsApp OTP'}
            </button>
            <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-600" onClick={forgotMode === 'login-whatsapp' ? onCancel : onBack} type="button">{forgotMode === 'login-whatsapp' ? 'Back to login' : 'Change option'}</button>
          </div>
        </>
      ) : (
        <>
          <Field icon={Mail} label="Gmail Address" onChange={(e) => onUpdate('email', e.target.value)} placeholder="registered@gmail.com" required type="email" value={forgotForm.email} />
          <div className="grid gap-2 sm:grid-cols-2">
            <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={loading} onClick={onSubmitGmail} type="button">
              {loading ? 'Please wait...' : 'Submit Gmail Forget'}
            </button>
            <button className="inline-flex min-h-11 items-center justify-center rounded-[7px] bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-600" onClick={onBack} type="button">Change option</button>
          </div>
        </>
      )}
      {message && <p className="rounded-[7px] bg-blue-50 p-3 text-sm font-bold text-blue-700">{message}</p>}
      <button className="justify-self-start text-sm font-black text-slate-500 hover:text-blue-700" onClick={onCancel} type="button">Back to login</button>
    </div>
  )
}

function getRoleLabel(role) {
  const normalizedRole = normalizeRole(role)
  if (normalizedRole === 'recruiter') return 'Recruiter'
  if (normalizedRole === 'freelancer') return 'Freelancer'
  return normalizedRole
}

function getAuthErrorMessage(error) {
  return error?.message || 'Authentication Error'
}

function getMetaLabel(role) {
  const normalizedRole = normalizeRole(role)
  if (normalizedRole === 'recruiter') return 'Company Name'
  if (normalizedRole === 'freelancer') return 'Primary Skill'
  return 'Target Role'
}

function getMetaPlaceholder(role) {
  const normalizedRole = normalizeRole(role)
  if (normalizedRole === 'recruiter') return 'Company name'
  if (normalizedRole === 'freelancer') return 'React developer, designer, writer'
  return 'Frontend Developer'
}

function getMetaSuggestionList(role) {
  const normalizedRole = normalizeRole(role)
  if (normalizedRole === 'freelancer') return 'primary-skill-suggestions'
  if (normalizedRole === 'Candidate') return 'target-role-suggestions'
  return undefined
}

function Field({ icon: Icon, label, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = props.type === 'password'
  const InputIcon = showPassword ? EyeOff : Eye

  return (
    <label>
      <span className="text-xs font-bold text-slate-700 sm:text-sm">{label}</span>
      <div className="mt-1.5 flex min-h-11 items-center gap-2 rounded-[7px] border border-slate-200 px-3 py-2.5 sm:mt-2 sm:gap-3 sm:px-4 sm:py-3">
        <Icon size={17} className="shrink-0 text-blue-600 sm:size-[18px]" />
        <input className="min-w-0 w-full text-sm outline-none sm:text-base" {...props} type={isPassword && showPassword ? 'text' : props.type} />
        {isPassword && (
          <button
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
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
