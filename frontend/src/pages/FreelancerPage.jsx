import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, FileText, IndianRupee, Laptop, MapPin, SearchCheck, ShieldCheck, Sparkles, UserRoundCheck, WalletCards } from 'lucide-react'
import { Button } from '../components/Button'
import { Section } from '../components/Section'

const heroSlides = [
  {
    badge: 'Verified freelance network',
    heading: 'Find Freelance Projects That Match Your Skills',
    subtitle: 'Create your freelancer profile, explore verified projects, submit proposals, and grow your independent career with CromGen Rozgar.',
    primary: 'Explore Projects',
    primaryTo: '/freelancer/projects',
    secondary: 'Create Freelancer Profile',
    secondaryTo: '/freelancer-register',
    proof: ['Verified Projects', 'Flexible Work', 'Secure Client Connect', 'Pan India Opportunities'],
    visualTitle: 'Proposal-ready profile',
    cardTitle: 'React Website Revamp',
    cardMeta: 'Remote / 4 weeks / Fixed budget',
    details: [
      [Clock3, 'Fast project review'],
      [IndianRupee, 'Milestone payouts'],
      [ShieldCheck, 'Verified client connect'],
    ],
    tags: ['React', 'Tailwind', 'API', 'Remote'],
  },
  {
    badge: 'Trusted client access',
    heading: 'Work With Trusted Clients Across India',
    subtitle: 'Discover remote, hybrid, and contract-based freelance opportunities from companies looking for skilled professionals.',
    primary: 'Browse Freelance Jobs',
    primaryTo: '/freelancer/projects',
    secondary: 'View Categories',
    secondaryTo: '/freelancer/projects',
    proof: ['Remote Projects', 'Hybrid Contracts', 'Verified Clients', 'Skill-based Matching'],
    visualTitle: 'Client shortlist board',
    cardTitle: 'UI/UX Product Designer',
    cardMeta: 'Hybrid / Weekly review / Contract',
    details: [
      [Laptop, 'Flexible work mode'],
      [Clock3, 'Weekly client review'],
      [ShieldCheck, 'Verified Company Profile'],
    ],
    tags: ['Figma', 'Mobile App', 'Dashboard', 'Contract'],
  },
  {
    badge: 'Freelance career growth',
    heading: 'Build Your Freelance Career Faster',
    subtitle: 'Showcase your skills, manage proposals, track project status, and get discovered by businesses hiring freelancers.',
    primary: 'Get Started',
    primaryTo: '/freelancer-register',
    secondary: 'Login',
    secondaryTo: '/freelancer-login',
    proof: ['Portfolio Visibility', 'Proposal Tracking', 'Project Status', 'Business Discovery'],
    visualTitle: 'Career growth tracker',
    cardTitle: 'Full Stack Developer',
    cardMeta: 'Remote / MERN / Deployment',
    details: [
      [MapPin, 'Remote / Hybrid Projects'],
      [UserRoundCheck, 'Direct business discovery'],
      [WalletCards, 'Secure Project Workflow'],
    ],
    tags: ['MERN', 'Node.js', 'MongoDB', 'Deployment'],
  },
]

const freelancerSteps = [
  {
    icon: UserRoundCheck,
    title: 'Create your profile',
    text: 'Add skills, experience, portfolio links, preferred work mode, and expected project rate.',
  },
  {
    icon: SearchCheck,
    title: 'Find project work',
    text: 'Browse freelance, remote, contract, and part-time opportunities from verified companies.',
  },
  {
    icon: FileText,
    title: 'Apply with confidence',
    text: 'Share a clear proposal and track responses through your candidate workspace.',
  },
]

const freelancerBenefits = [
  ['Verified freelance roles', 'Projects and contract openings from active recruiters.'],
  ['Flexible work filters', 'Remote, hybrid, part-time, short-term, and recurring work options.'],
  ['Profile-led matching', 'Skills, experience, salary, and location help companies discover you.'],
  ['Application tracking', 'Keep applied projects, saved jobs, and interview updates in one place.'],
]

export function FreelancerPage() {
  return (
    <>
      <FreelancerHeroSlider />

      <Section className="bg-[#F6F9FD] !py-7 sm:!py-20" eyebrow="How it works" title="Start freelancing through Cromgen Rozgar" subtitle="A focused workspace for profile setup, project discovery, and proposal tracking.">
        <div className="relative grid gap-3 md:grid-cols-3 md:gap-5">
          <div className="absolute left-[16%] right-[16%] top-12 hidden h-0.5 bg-gradient-to-r from-[#0057B8] via-[#3E9B28] to-[#FF8A00] md:block" />
          {freelancerSteps.map((step, index) => {
            const Icon = step.icon
            const tones = [
              'bg-[#0057B8] text-white shadow-[#0057B8]/20',
              'bg-[#3E9B28] text-white shadow-[#3E9B28]/20',
              'bg-[#FF8A00] text-white shadow-[#FF8A00]/20',
            ]
            return (
              <div className="relative rounded-[7px] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100 sm:p-6" key={step.title}>
                <div className="flex items-center justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-[7px] shadow-lg sm:h-14 sm:w-14 ${tones[index]}`}>
                    <Icon size={21} />
                  </span>
                  <span className="rounded-[7px] bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">Step {index + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-950 sm:mt-5 sm:text-xl">{step.title}</h3>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 sm:mt-3 sm:min-h-16 sm:text-sm sm:leading-6">{step.text}</p>
                <div className="mt-5 h-1.5 rounded-[7px] bg-slate-100">
                  <div className={`h-full rounded-[7px] ${index === 0 ? 'w-1/3 bg-[#0057B8]' : index === 1 ? 'w-2/3 bg-[#3E9B28]' : 'w-full bg-[#FF8A00]'}`} />
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section className="bg-white !py-7 sm:!py-20" eyebrow="Benefits" title="Built for flexible professionals" subtitle="Everything is arranged for quick scanning, shortlisting, and repeat project work.">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="rounded-[7px] bg-[#07111F] p-4 text-white shadow-2xl shadow-slate-200 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#68D391] sm:text-sm sm:tracking-[0.18em]">Freelancer console</p>
            <h3 className="mt-3 text-xl font-black leading-tight sm:mt-4 sm:text-3xl">One place for profile, matching, and project status.</h3>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-300 sm:mt-4 sm:text-sm sm:leading-7">
              Freelancers can see verified opportunities, prepare proposals, and keep project communication organized without moving through noisy menus.
            </p>
            <div className="mt-5 grid gap-2 sm:mt-7 sm:gap-3">
              {[
                ['86%', 'Profile strength'],
                ['24h', 'Fast review cycle'],
                ['4.8', 'Average client rating'],
              ].map(([value, label]) => (
                <div className="flex items-center justify-between rounded-[7px] bg-white/10 px-3 py-2 sm:px-4 sm:py-3" key={label}>
                  <span className="text-xs font-bold text-slate-300 sm:text-sm">{label}</span>
                  <span className="text-lg font-black text-white sm:text-xl">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2">
            {freelancerBenefits.map(([title, text], index) => (
              <div className="rounded-[7px] border border-slate-200 bg-[#F8FBFF] p-3 shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-100/70 sm:flex sm:gap-4 sm:p-5" key={title}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[7px] ring-1 sm:h-11 sm:w-11 ${index % 2 === 0 ? 'bg-[#0057B8]/10 text-[#0057B8] ring-[#0057B8]/10' : 'bg-[#3E9B28]/10 text-[#3E9B28] ring-[#3E9B28]/10'}`}>
                  <CheckCircle2 size={18} />
                </span>
              <div className="mt-3 sm:mt-0">
                <h3 className="text-sm font-black text-slate-950 sm:text-base">{title}</h3>
                <p className="mt-1 line-clamp-3 text-xs font-semibold leading-5 text-slate-500 sm:text-sm sm:leading-6">{text}</p>
              </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[7px] border border-blue-100 bg-[linear-gradient(110deg,#EAF3FF_0%,#FFFFFF_52%,#ECFDF3_100%)] p-4 shadow-lg shadow-blue-100/60 sm:mt-10 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[7px] bg-[#0057B8] text-white sm:h-12 sm:w-12">
                <Sparkles size={20} />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-950 sm:text-2xl">Ready for your next project?</h3>
                <p className="mt-2 max-w-2xl text-xs font-semibold leading-5 text-slate-500 sm:text-sm sm:leading-6">
                  Register as a freelancer, complete your profile, and start applying to verified project work.
                </p>
              </div>
            </div>
            <Button className="w-full shrink-0 sm:w-auto" to="/freelancer-register">Get Started</Button>
          </div>
        </div>
      </Section>
    </>
  )
}

function FreelancerHeroSlider() {
  const [active, setActive] = useState(0)
  const slide = heroSlides[active]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % heroSlides.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [])

  const previousSlide = () => setActive((active + heroSlides.length - 1) % heroSlides.length)
  const nextSlide = () => setActive((active + 1) % heroSlides.length)

  return (
    <section className="relative isolate overflow-hidden border-b border-[#0057B8]/10 bg-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#0057B8]" />
      <div className="absolute inset-x-0 top-1 h-28 bg-[linear-gradient(180deg,#F3F8FF_0%,rgba(243,248,255,0)_100%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-5 px-2 py-5 sm:min-h-[calc(100vh-5.5rem)] sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <div className="min-w-0">
          <div className="flex w-max max-w-full items-center gap-2 rounded-[7px] border border-[#0057B8]/15 bg-[#0057B8]/5 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[#0057B8] sm:text-xs sm:tracking-[0.16em]">
            <Sparkles size={15} />
            {slide.badge}
          </div>
          <h1 className="mt-4 max-w-4xl text-2xl font-black leading-tight tracking-tight text-slate-950 sm:mt-6 sm:text-5xl sm:leading-[1.02] lg:text-6xl">
            {slide.heading}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
            {slide.subtitle}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:flex-row sm:gap-3">
            <Button to={slide.primaryTo}>{slide.primary}</Button>
            <Button to={slide.secondaryTo} variant="secondary">{slide.secondary}</Button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-9 sm:gap-3">
            {slide.proof.map((item, index) => (
              <div className="flex min-w-0 items-center gap-2 rounded-[7px] border border-slate-200 bg-white p-2 shadow-sm sm:gap-3 sm:p-3" key={item}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[7px] sm:h-9 sm:w-9 ${index === 2 ? 'bg-[#3E9B28]/10 text-[#3E9B28]' : index === 1 ? 'bg-[#FF8A00]/10 text-[#FF8A00]' : 'bg-[#0057B8]/10 text-[#0057B8]'}`}>
                  <CheckCircle2 size={15} />
                </span>
                <span className="min-w-0 text-[11px] font-black leading-4 text-slate-800 sm:text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-3">
            <button className="hidden h-11 w-11 place-items-center rounded-[7px] bg-[#0057B8] text-white shadow-lg shadow-[#0057B8]/20 transition hover:-translate-y-0.5 hover:bg-[#004694] sm:grid" onClick={previousSlide} type="button" aria-label="Previous freelancer slide">
              <ArrowLeft size={18} />
            </button>
            <button className="hidden h-11 w-11 place-items-center rounded-[7px] bg-[#0057B8] text-white shadow-lg shadow-[#0057B8]/20 transition hover:-translate-y-0.5 hover:bg-[#004694] sm:grid" onClick={nextSlide} type="button" aria-label="Next freelancer slide">
              <ArrowRight size={18} />
            </button>
            <div className="flex items-center gap-2 rounded-[7px] border border-slate-200 bg-white px-3 py-2 shadow-sm">
              {heroSlides.map((item, index) => (
                <button
                  aria-label={`Show ${item.badge}`}
                  className={`h-2.5 rounded-[7px] transition-all ${active === index ? 'w-9 bg-[#0057B8]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                  key={item.badge}
                  onClick={() => setActive(index)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-w-0 lg:pl-4">
          <div className="relative mx-auto max-w-2xl">
            <div className="absolute -right-4 top-8 hidden w-40 rounded-[7px] border border-[#3E9B28]/20 bg-white p-4 shadow-xl shadow-slate-200 md:block">
              <p className="text-xs font-black uppercase tracking-wide text-[#3E9B28]">Verified</p>
              <p className="mt-2 text-2xl font-black text-slate-950">98%</p>
              <p className="text-xs font-bold text-slate-500">client trust score</p>
            </div>
            <div className="absolute -left-3 bottom-16 hidden w-48 rounded-[7px] border border-[#FF8A00]/20 bg-white p-4 shadow-xl shadow-slate-200 md:block">
              <p className="text-xs font-black uppercase tracking-wide text-[#FF8A00]">Proposal queue</p>
              <p className="mt-2 text-sm font-bold text-slate-600">12 profiles shortlisted this week</p>
            </div>

            <div className="overflow-hidden rounded-[7px] border border-[#0057B8]/10 bg-white shadow-2xl shadow-[#0057B8]/15">
              <div className="flex items-center justify-between border-b border-slate-100 bg-[#F8FBFF] px-3 py-3 sm:px-5 sm:py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wide text-[#0057B8] sm:text-xs sm:tracking-[0.16em]">CromGen freelance workspace</p>
                  <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">{slide.visualTitle}</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-[#0057B8] text-white sm:h-11 sm:w-11">
                  <BriefcaseBusiness size={18} />
                </span>
              </div>

              <div className="grid gap-0 lg:grid-cols-[15rem_1fr]">
                <aside className="grid grid-cols-2 gap-2 border-b border-slate-100 bg-white p-3 sm:p-4 lg:block lg:border-b-0 lg:border-r">
                  {['Matched Projects', 'Proposals', 'Client Chat', 'Payments'].map((item, index) => (
                    <div className={`rounded-[7px] px-2 py-2 text-xs font-black lg:mb-2 lg:px-3 lg:py-3 lg:text-sm ${index === active ? 'bg-[#0057B8] text-white' : 'bg-slate-50 text-slate-600'}`} key={item}>
                      {item}
                    </div>
                  ))}
                  <div className="col-span-2 mt-1 rounded-[7px] bg-[#3E9B28]/10 p-3 lg:mt-4">
                    <p className="text-xs font-black uppercase text-[#3E9B28]">Profile strength</p>
                    <div className="mt-3 h-2 rounded-[7px] bg-white">
                      <div className="h-full w-[86%] rounded-[7px] bg-[#3E9B28]" />
                    </div>
                  </div>
                </aside>

                <div className="p-3 sm:p-5">
                  <div className="rounded-[7px] border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#FF8A00]">Featured project</p>
                        <h2 className="mt-2 text-lg font-black text-slate-950 sm:text-2xl">{slide.cardTitle}</h2>
                        <p className="mt-1 text-xs font-bold text-slate-500 sm:mt-2 sm:text-sm">{slide.cardMeta}</p>
                      </div>
                      <span className="rounded-[7px] bg-[#3E9B28]/10 px-3 py-1 text-xs font-black text-[#3E9B28]">Open</span>
                    </div>

                    <div className="mt-4 grid gap-2 sm:mt-5 sm:gap-3">
                      {slide.details.map(([Icon, text]) => (
                        <div className="flex items-center gap-2 rounded-[7px] bg-[#F8FBFF] p-2 text-xs font-black text-slate-700 sm:gap-3 sm:p-3 sm:text-sm" key={text}>
                          <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-[#0057B8]/10 text-[#0057B8] sm:h-9 sm:w-9">
                            <Icon size={17} />
                          </span>
                          {text}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                      {slide.tags.map((skill) => (
                        <span className="rounded-[7px] bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700" key={skill}>{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
                    {[
                      ['92%', 'Match'],
                      ['24h', 'Review'],
                      ['4.8', 'Rating'],
                    ].map(([value, label]) => (
                      <div className="rounded-[7px] border border-slate-200 bg-[#F8FBFF] p-2 text-center sm:p-3" key={label}>
                        <p className="text-base font-black text-[#0057B8] sm:text-xl">{value}</p>
                        <p className="mt-1 text-[11px] font-black uppercase text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
