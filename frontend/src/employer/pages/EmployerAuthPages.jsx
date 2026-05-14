import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, Eye, EyeOff, Globe2, Lock, Mail } from 'lucide-react'
import { Button } from '../../components/Button'
import { getDashboardPath, getRecruiterVerificationPath, getRecruiterVerificationStatus, normalizeRole } from '../../routes/authRouting'
import { api } from '../../services/api'
import employerImage from '../../assets/employer-hiring-suite.png'

const initialRegister = {
  companyName: '',
  businessEmail: '',
  phone: '',
  industry: '',
  companySize: '',
  website: '',
  locationType: 'India',
  country: 'India',
  state: '',
  city: '',
  fullAddress: '',
  password: '',
  confirmPassword: '',
}

const companySuggestions = ['Nimbus Tech', 'Talentora', 'Auralis Support', 'BluePeak Finance', 'PeopleMint', 'Marketly Labs', 'Cromgen Rozgar']

const industrySuggestions = [
  'IT & Software', 'Recruitment', 'HR Technology', 'Cloud Software', 'Fintech', 'Digital Marketing', 'Customer Support',
  'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Logistics', 'Consulting', 'AI Operations',
]

const companySizeSuggestions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+']

const freeEmailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'rediffmail.com']

const indiaLocations = {
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Anantapur', 'Kadapa'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Tawang', 'Pasighat', 'Ziro'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur', 'Nagaon'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
  Chandigarh: ['Chandigarh'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg'],
  Delhi: ['New Delhi', 'Delhi NCR', 'Dwarka', 'Rohini', 'Saket'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Vapi'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Karnal', 'Sonipat'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi', 'Solan'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Udupi', 'Manipal'],
  Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam'],
  Ladakh: ['Leh', 'Kargil'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai', 'Aurangabad', 'Kolhapur'],
  Manipur: ['Imphal', 'Thoubal'],
  Meghalaya: ['Shillong', 'Tura'],
  Mizoram: ['Aizawl', 'Lunglei'],
  Nagaland: ['Kohima', 'Dimapur'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur'],
  Puducherry: ['Puducherry', 'Karaikal'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Mohali', 'Patiala'],
  Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer'],
  Sikkim: ['Gangtok', 'Namchi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tiruppur', 'Hosur'],
  Telangana: ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam'],
  Tripura: ['Agartala', 'Udaipur'],
  'Uttar Pradesh': ['Noida', 'Greater Noida', 'Lucknow', 'Kanpur', 'Ghaziabad', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee'],
  'West Bengal': ['Kolkata', 'Siliguri', 'Durgapur', 'Asansol', 'Howrah'],
}

const internationalLocations = {
  'United States': {
    California: ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose'],
    'New York': ['New York City', 'Buffalo', 'Rochester'],
    Texas: ['Austin', 'Dallas', 'Houston'],
  },
  'United Kingdom': {
    England: ['London', 'Manchester', 'Birmingham', 'Leeds'],
    Scotland: ['Edinburgh', 'Glasgow'],
  },
  Canada: {
    Ontario: ['Toronto', 'Ottawa', 'Mississauga'],
    'British Columbia': ['Vancouver', 'Victoria'],
  },
  UAE: {
    Dubai: ['Dubai'],
    'Abu Dhabi': ['Abu Dhabi'],
    Sharjah: ['Sharjah'],
  },
  Singapore: {
    Central: ['Singapore'],
  },
  Australia: {
    'New South Wales': ['Sydney', 'Newcastle'],
    Victoria: ['Melbourne', 'Geelong'],
  },
}

function saveSession(payload, overrides = {}) {
  const recruiterVerificationStatus = overrides.recruiterVerificationStatus || payload.data.recruiterVerificationStatus

  localStorage.setItem('authToken', payload.token)
  localStorage.setItem('authUser', JSON.stringify({ ...payload.data, ...overrides, role: normalizeRole(payload.data.role), ...(recruiterVerificationStatus ? { recruiterVerificationStatus } : {}) }))
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
      if (normalizeRole(payload.data.role) !== 'recruiter') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
        setMessage('Only recruiter accounts can login from this page.')
        return
      }

      saveSession(payload)
      const status = getRecruiterVerificationStatus()
      setMessage('Recruiter login successful. Redirecting...')
      navigate(status === 'approved' ? getDashboardPath(payload.data.role) : getRecruiterVerificationPath(status))
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
  const stateOptions = useMemo(() => {
    if (form.locationType === 'India') return Object.keys(indiaLocations)
    return form.country ? Object.keys(internationalLocations[form.country] || {}) : []
  }, [form.country, form.locationType])
  const cityOptions = useMemo(() => {
    if (!form.state) return []
    if (form.locationType === 'India') return indiaLocations[form.state] || []
    return internationalLocations[form.country]?.[form.state] || []
  }, [form.country, form.locationType, form.state])
  const fullAddressOpen = Boolean(form.city)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const isBusinessEmail = (email) => {
    const domain = email.split('@')[1]?.toLowerCase()
    return Boolean(domain && !freeEmailDomains.includes(domain))
  }

  const continueToSetup = () => {
    if (!form.companyName || !form.businessEmail) {
      setMessage('Company name and business email are required.')
      return
    }

    if (!isBusinessEmail(form.businessEmail)) {
      setMessage('Please use a business email address. Personal email domains are not accepted.')
      return
    }

    setMessage('')
    setStep(2)
  }

  const changeLocationType = (value) => {
    setForm((current) => ({
      ...current,
      locationType: value,
      country: value === 'India' ? 'India' : '',
      state: '',
      city: '',
      fullAddress: '',
    }))
  }

  const submit = async () => {
    if (!isBusinessEmail(form.businessEmail)) {
      setMessage('Please use a business email address. Personal email domains are not accepted.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setMessage('Password and confirm password do not match.')
      return
    }

    const location = [form.city, form.state, form.country].filter(Boolean).join(', ')

    setLoading(true)
    setMessage('')

    try {
      const payload = await api.register({
        name: form.companyName,
        email: form.businessEmail,
        password: form.password,
        role: 'recruiter',
      })

      await api.employerRegister({
        companyName: form.companyName,
        businessEmail: form.businessEmail,
        phone: form.phone,
        industry: form.industry,
        companySize: form.companySize,
        website: form.website,
        location,
        fullAddress: form.fullAddress,
      }).catch(() => null)

      saveSession(payload)
      setMessage('Recruiter registered successfully. Redirecting...')
      navigate('/recruiter-documents')
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
            <input className="input" list="register-company-suggestions" onChange={(e) => update('companyName', e.target.value)} placeholder="Company Name" required value={form.companyName} />
            <input className="input" onChange={(e) => update('businessEmail', e.target.value)} placeholder="Business Email" required type="email" value={form.businessEmail} />
            <input className="input" onChange={(e) => update('phone', e.target.value)} placeholder="Phone Number" value={form.phone} />
            <input className="input" list="register-industry-suggestions" onChange={(e) => update('industry', e.target.value)} placeholder="Industry" value={form.industry} />
            <datalist id="register-company-suggestions">{companySuggestions.map((item) => <option key={item} value={item} />)}</datalist>
            <datalist id="register-industry-suggestions">{industrySuggestions.map((item) => <option key={item} value={item} />)}</datalist>
          </>
        ) : (
          <>
            <input className="input" list="register-company-size-suggestions" onChange={(e) => update('companySize', e.target.value)} placeholder="Company Size" value={form.companySize} />
            <input className="input" onChange={(e) => update('website', e.target.value)} placeholder="Website URL" value={form.website} />
            <select className="input" onChange={(e) => changeLocationType(e.target.value)} value={form.locationType}>
              <option>India</option>
              <option>International</option>
            </select>
            {form.locationType === 'International' ? (
              <select className="input" onChange={(e) => setForm((current) => ({ ...current, country: e.target.value, state: '', city: '', fullAddress: '' }))} required value={form.country}>
                <option value="">Select country</option>
                {Object.keys(internationalLocations).map((country) => <option key={country}>{country}</option>)}
              </select>
            ) : (
              <input className="input" readOnly value="India" />
            )}
            <select className="input" onChange={(e) => setForm((current) => ({ ...current, state: e.target.value, city: '', fullAddress: '' }))} required value={form.state}>
              <option value="">Select state / region</option>
              {stateOptions.map((state) => <option key={state}>{state}</option>)}
            </select>
            <input className="input" disabled={!form.state} list="register-city-suggestions" onChange={(e) => update('city', e.target.value)} placeholder="Select or type city" required value={form.city} />
            {fullAddressOpen && (
              <textarea className="input min-h-24 sm:col-span-2" onChange={(e) => update('fullAddress', e.target.value)} placeholder="Full company address" required value={form.fullAddress} />
            )}
            <PasswordInput onChange={(e) => update('password', e.target.value)} placeholder="Password" required value={form.password} />
            <PasswordInput className="sm:col-span-2" onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Confirm Password" required value={form.confirmPassword} />
            <datalist id="register-company-size-suggestions">{companySizeSuggestions.map((item) => <option key={item} value={item} />)}</datalist>
            <datalist id="register-city-suggestions">{cityOptions.map((city) => <option key={city} value={city} />)}</datalist>
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
          onClick={() => (step === 1 ? continueToSetup() : submit())}
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
