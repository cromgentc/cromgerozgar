import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Plus, Send, Sparkles, X } from 'lucide-react'
import { Button } from '../components/Button'
import { getRecruiterVerificationPath, getRecruiterVerificationStatus, getStoredUser } from '../routes/authRouting'
import { api } from '../services/api'

const jobTitleSuggestions = [
  'Senior React Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Node.js Developer', 'Python Developer',
  'Java Developer', 'DevOps Engineer', 'QA Engineer', 'UI/UX Designer', 'Product Manager', 'Digital Marketing Manager',
  'Performance Marketing Manager', 'HR Recruiter', 'Customer Success Specialist', 'Sales Executive', 'Data Analyst', 'Data Collection Lead',
]

const companySuggestions = ['Nimbus Tech', 'Talentora', 'Auralis Support', 'BluePeak Finance', 'PeopleMint', 'Marketly Labs', 'Cromgen Rozgar']

const departmentSuggestions = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Customer Success', 'Human Resources', 'Recruitment',
  'Finance', 'Operations', 'Research Operations', 'Data & Analytics', 'AI Operations', 'Administration', 'Legal',
]

const skillSuggestions = [
  'React', 'TypeScript', 'JavaScript', 'Tailwind', 'Node.js', 'Express', 'MongoDB', 'Python', 'Java', 'SQL', 'AWS', 'Docker',
  'REST API', 'CRM', 'Communication', 'Retention', 'Google Ads', 'Meta Ads', 'Analytics', 'SEO', 'Excel', 'Research', 'Reporting',
]

const experienceOptions = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5-8 years', '8-12 years', '12+ years']

const indiaLocations = {
  'Andaman and Nicobar Islands': ['Port Blair'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Anantapur', 'Kadapa', 'Eluru', 'Ongole', 'Srikakulam', 'Vizianagaram'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Tawang', 'Pasighat', 'Ziro'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur', 'Nagaon', 'Tinsukia', 'Bongaigaon', 'Dhubri', 'Sivasagar'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Begusarai', 'Arrah', 'Katihar', 'Munger', 'Chapra', 'Bettiah'],
  Chandigarh: ['Chandigarh'],
  Chhattisgarh: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa'],
  Delhi: ['New Delhi', 'Delhi NCR', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh', 'Lajpat Nagar', 'Janakpuri', 'Pitampura', 'Vasant Kunj'],
  Goa: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Navsari', 'Bharuch', 'Mehsana', 'Vapi'],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Karnal', 'Sonipat', 'Rohtak', 'Yamunanagar', 'Panchkula', 'Kurukshetra', 'Rewari'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Manali', 'Hamirpur', 'Una'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua'],
  Jharkhand: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Davangere', 'Ballari', 'Shivamogga', 'Tumakuru', 'Udupi', 'Manipal', 'Kalaburagi', 'Dharwad'],
  Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Kannur', 'Kottayam', 'Palakkad', 'Malappuram'],
  Ladakh: ['Leh', 'Kargil'],
  Lakshadweep: ['Kavaratti'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Katni'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Jalgaon', 'Akola', 'Latur'],
  Manipur: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'],
  Meghalaya: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur', 'Balasore', 'Jharsuguda'],
  Puducherry: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Mohali', 'Patiala', 'Bathinda', 'Pathankot', 'Hoshiarpur', 'Moga'],
  Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Sikar', 'Bharatpur'],
  Sikkim: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Tirunelveli', 'Hosur', 'Thanjavur'],
  Telangana: ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Mahbubnagar', 'Ramagundam', 'Suryapet'],
  Tripura: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'],
  'Uttar Pradesh': ['Noida', 'Greater Noida', 'Lucknow', 'Kanpur', 'Ghaziabad', 'Varanasi', 'Agra', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Mathura', 'Jhansi'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee', 'Rishikesh', 'Rudrapur', 'Nainital'],
  'West Bengal': ['Kolkata', 'Siliguri', 'Durgapur', 'Asansol', 'Howrah', 'Kharagpur', 'Haldia', 'Bardhaman', 'Malda'],
}

const internationalLocations = {
  'United States': {
    California: ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Oakland'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
    Texas: ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth'],
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
    AbuDhabi: ['Abu Dhabi'],
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

const initialForm = {
  title: '',
  company: '',
  department: '',
  locationType: 'India',
  country: 'India',
  state: '',
  city: '',
  officeAddress: '',
  interviewSameAsOffice: true,
  interviewAddress: '',
  salary: '',
  experience: '1-3 years',
  type: 'Full Time',
  workMode: 'Hybrid',
  skills: [],
  skillInput: '',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  postedDate: new Date().toISOString().slice(0, 10),
  deadline: '',
}

export function PostJobPage() {
  const navigate = useNavigate()
  const user = useMemo(() => getStoredUser(), [])
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('authToken')

    if (!token || !user) {
      navigate('/recruiter-login', { replace: true })
      return
    }

    if (user.role !== 'recruiter') {
      navigate('/recruiter-register', { replace: true })
      return
    }

    const status = getRecruiterVerificationStatus(user)
    if (status !== 'approved') {
      navigate(getRecruiterVerificationPath(status), { replace: true })
    }
  }, [navigate, user])

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

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setMessage('')
  }

  const changeLocationType = (value) => {
    setForm((current) => ({
      ...current,
      locationType: value,
      country: value === 'India' ? 'India' : '',
      state: '',
      city: '',
      officeAddress: '',
      interviewAddress: '',
    }))
  }

  const addSkill = (skill = form.skillInput) => {
    const nextSkill = skill.trim()
    if (!nextSkill || form.skills.includes(nextSkill)) return
    setForm((current) => ({ ...current, skills: [...current.skills, nextSkill], skillInput: '' }))
  }

  const removeSkill = (skill) => {
    setForm((current) => ({ ...current, skills: current.skills.filter((item) => item !== skill) }))
  }

  const generateDescription = () => {
    const skills = form.skills.length ? form.skills.join(', ') : 'relevant tools and workflows'
    const title = form.title || 'skilled professional'
    const company = form.company || 'our company'
    const location = [form.city, form.state, form.country].filter(Boolean).join(', ') || 'the selected location'

    setForm((current) => ({
      ...current,
      description: `We are hiring a ${title} for ${company} in ${location}. This ${form.type} role is ideal for candidates with ${form.experience} of experience who can contribute across planning, execution, collaboration, and delivery.\n\nThe selected candidate will work with cross-functional teams, own key responsibilities, communicate clearly, and deliver high-quality outcomes using ${skills}.`,
      responsibilities: `Own day-to-day execution for the ${title} role\nCollaborate with hiring managers, product, operations, and leadership teams\nTrack progress, solve blockers, and deliver measurable outcomes`,
      requirements: `Experience in ${skills}\nStrong communication and ownership mindset\nAbility to work in a ${form.workMode} environment`,
      benefits: `Growth-focused work culture\nCompetitive compensation\nLearning support and modern hiring workflow`,
    }))
  }

  const submit = async (event) => {
    event.preventDefault()

    if (user?.role !== 'recruiter') {
      navigate(user ? '/recruiter-register' : '/recruiter-login', { replace: true })
      return
    }

    const status = getRecruiterVerificationStatus(user)
    if (status !== 'approved') {
      navigate(getRecruiterVerificationPath(status), { replace: true })
      return
    }

    setMessage('Submitting...')

    const location = [form.city, form.state, form.country].filter(Boolean).join(', ')
    const interviewAddress = form.interviewSameAsOffice ? form.officeAddress : form.interviewAddress

    try {
      await api.createJob({
        ...form,
        location,
        fullAddress: form.officeAddress,
        interviewAddress,
        companyLogo: form.company.slice(0, 2).toUpperCase(),
        skills: form.skills,
        responsibilities: form.responsibilities.split('\n').filter(Boolean),
        requirements: form.requirements.split('\n').filter(Boolean),
        benefits: form.benefits.split('\n').filter(Boolean),
        posted: form.postedDate || 'Today',
        status: 'Open',
        approval: 'Pending',
      })
      setForm(initialForm)
      setMessage('Job submitted successfully.')
    } catch (error) {
      setMessage(`Backend unavailable: ${error.message}`)
    }
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-xl shadow-blue-100/50 backdrop-blur sm:p-8">
          <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">Post a Premium Job</h1>
          <p className="mt-3 text-slate-500">Create a structured recruiter job post with location, interview address, skills, dates, and AI-assisted content.</p>

          <form className="mt-8 grid gap-6" onSubmit={submit}>
            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h2 className="mb-4 text-xl font-black text-slate-950">Role Basics</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input" list="job-title-suggestions" onChange={(e) => update('title', e.target.value)} placeholder="Job title" required value={form.title} />
                <input className="input" list="company-suggestions" onChange={(e) => update('company', e.target.value)} placeholder="Company name" required value={form.company} />
                <input className="input" list="department-suggestions" onChange={(e) => update('department', e.target.value)} placeholder="Department" value={form.department} />
                <select className="input" onChange={(e) => update('experience', e.target.value)} value={form.experience}>
                  {experienceOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <datalist id="job-title-suggestions">{jobTitleSuggestions.map((item) => <option key={item} value={item} />)}</datalist>
              <datalist id="company-suggestions">{companySuggestions.map((item) => <option key={item} value={item} />)}</datalist>
              <datalist id="department-suggestions">{departmentSuggestions.map((item) => <option key={item} value={item} />)}</datalist>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h2 className="mb-4 text-xl font-black text-slate-950">Location & Interview</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <select className="input" onChange={(e) => changeLocationType(e.target.value)} value={form.locationType}>
                  <option>India</option>
                  <option>International</option>
                </select>
                {form.locationType === 'International' ? (
                  <select className="input" onChange={(e) => setForm((current) => ({ ...current, country: e.target.value, state: '', city: '', officeAddress: '', interviewAddress: '' }))} required value={form.country}>
                    <option value="">Select country</option>
                    {Object.keys(internationalLocations).map((country) => <option key={country}>{country}</option>)}
                  </select>
                ) : (
                  <input className="input" readOnly value="India" />
                )}
                <select className="input" onChange={(e) => setForm((current) => ({ ...current, state: e.target.value, city: '', officeAddress: '', interviewAddress: '' }))} required value={form.state}>
                  <option value="">Select state / region</option>
                  {stateOptions.map((state) => <option key={state}>{state}</option>)}
                </select>
                <input className="input" disabled={!form.state} list="city-suggestions" onChange={(e) => update('city', e.target.value)} placeholder="Select or type city" required value={form.city} />
                <datalist id="city-suggestions">{cityOptions.map((city) => <option key={city} value={city} />)}</datalist>
                {fullAddressOpen && (
                  <>
                    <textarea className="input min-h-24 sm:col-span-2" onChange={(e) => update('officeAddress', e.target.value)} placeholder="Full office address" required value={form.officeAddress} />
                    <label className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold text-slate-700 ring-1 ring-slate-200 sm:col-span-2">
                      <input checked={form.interviewSameAsOffice} className="h-5 w-5 accent-blue-600" onChange={(e) => update('interviewSameAsOffice', e.target.checked)} type="checkbox" />
                      Interview address same as office
                    </label>
                    {!form.interviewSameAsOffice && (
                      <textarea className="input min-h-24 sm:col-span-2" onChange={(e) => update('interviewAddress', e.target.value)} placeholder="Interview full address" required value={form.interviewAddress} />
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h2 className="mb-4 text-xl font-black text-slate-950">Compensation, Work & Dates</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="input" onChange={(e) => update('salary', e.target.value)} placeholder="Salary range" value={form.salary} />
                <select className="input" onChange={(e) => update('type', e.target.value)} value={form.type}><option>Full Time</option><option>Part Time</option><option>Contract</option><option>Freelance</option></select>
                <select className="input" onChange={(e) => update('workMode', e.target.value)} value={form.workMode}><option>Hybrid</option><option>Remote</option><option>On-site</option></select>
                <input className="input" onChange={(e) => update('postedDate', e.target.value)} type="date" value={form.postedDate} />
                <input className="input sm:col-span-2" onChange={(e) => update('deadline', e.target.value)} required type="date" value={form.deadline} />
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h2 className="mb-4 text-xl font-black text-slate-950">Skills</h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input className="input flex-1" list="skill-suggestions" onChange={(e) => update('skillInput', e.target.value)} onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }} placeholder="Select or type skill" value={form.skillInput} />
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white" onClick={() => addSkill()} type="button"><Plus size={18} /> Add Skill</button>
              </div>
              <datalist id="skill-suggestions">{skillSuggestions.map((item) => <option key={item} value={item} />)}</datalist>
              <div className="mt-4 flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <button className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-black text-slate-700 ring-1 ring-slate-200" key={skill} onClick={() => removeSkill(skill)} type="button">
                    {skill}
                    <X size={14} />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-black text-slate-950">Job Content</h2>
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-100" onClick={generateDescription} type="button">
                  <Sparkles size={18} />
                  AI Generate Description
                </button>
              </div>
              <div className="grid gap-4">
                <textarea className="input min-h-36" onChange={(e) => update('description', e.target.value)} placeholder="Description" required value={form.description} />
                <textarea className="input min-h-28" onChange={(e) => update('responsibilities', e.target.value)} placeholder="Responsibilities, one per line" value={form.responsibilities} />
                <textarea className="input min-h-28" onChange={(e) => update('requirements', e.target.value)} placeholder="Requirements, one per line" value={form.requirements} />
                <textarea className="input min-h-28" onChange={(e) => update('benefits', e.target.value)} placeholder="Benefits, one per line" value={form.benefits} />
              </div>
            </section>

            {message && <p className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700">{message}</p>}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" variant="secondary"><Eye size={18} /> Preview Job</Button>
              <button className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-100 transition hover:-translate-y-0.5 hover:bg-teal-600" type="submit"><Send size={18} /> Submit Job</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
