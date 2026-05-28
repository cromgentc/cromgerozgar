const categories = [
  { name: 'IT & Software', jobs: 0, status: 'Active' },
  { name: 'Sales & Marketing', jobs: 0, status: 'Active' },
  { name: 'Customer Support', jobs: 0, status: 'Active' },
  { name: 'BPO', jobs: 0, status: 'Active' },
  { name: 'HR & Recruitment', jobs: 0, status: 'Active' },
  { name: 'Finance', jobs: 0, status: 'Active' },
  { name: 'Data Collection', jobs: 0, status: 'Active' },
  { name: 'Digital Marketing', jobs: 0, status: 'Active' },
  { name: 'Work From Home', jobs: 0, status: 'Active' },
  { name: 'Freelance', jobs: 0, status: 'Active' },
  { name: 'AI & Data Annotation', jobs: 0, status: 'Active' },
  { name: 'Business Development', jobs: 0, status: 'Active' },
  { name: 'Engineering', jobs: 0, status: 'Active' },
  { name: 'Product', jobs: 0, status: 'Active' },
  { name: 'Design', jobs: 0, status: 'Active' },
  { name: 'Growth', jobs: 0, status: 'Active' },
  { name: 'Marketing', jobs: 0, status: 'Active' },
  { name: 'Sales', jobs: 0, status: 'Active' },
  { name: 'Support', jobs: 0, status: 'Active' },
  { name: 'Operations', jobs: 0, status: 'Active' },
  { name: 'Research Operations', jobs: 0, status: 'Active' },
  { name: 'AI Operations', jobs: 0, status: 'Active' },
  { name: 'Human Resources', jobs: 0, status: 'Active' },
  { name: 'Recruitment', jobs: 0, status: 'Active' },
  { name: 'Data & Analytics', jobs: 0, status: 'Active' },
  { name: 'Administration', jobs: 0, status: 'Active' },
  { name: 'Legal', jobs: 0, status: 'Active' },
]

const companies = [
  { name: 'Nimbus Tech', industry: 'Cloud software', jobs: 42, badge: 'NT', location: 'Bengaluru', rating: '4.8', accent: 'from-blue-600 to-sky-400', status: 'Active', documents: 'Verified', plan: 'Enterprise' },
  { name: 'BluePeak Finance', industry: 'Fintech', jobs: 27, badge: 'BP', location: 'Hyderabad', rating: '4.7', accent: 'from-teal-500 to-blue-500', status: 'Active', documents: 'Verified', plan: 'Enterprise' },
  { name: 'Talentora', industry: 'Recruitment', jobs: 35, badge: 'TA', location: 'Mumbai', rating: '4.9', accent: 'from-violet-500 to-blue-500', status: 'Pending', documents: 'Review', plan: 'Growth' },
  { name: 'Auralis Support', industry: 'Customer success', jobs: 18, badge: 'AS', location: 'Remote', rating: '4.6', accent: 'from-sky-500 to-teal-400', status: 'Active', documents: 'Verified', plan: 'Starter' },
]

const jobs = [
  {
    title: 'Senior React Engineer',
    company: 'Nimbus Tech',
    companyLogo: 'NT',
    department: 'Engineering',
    location: 'Bengaluru',
    salary: '18 - 28 LPA',
    experience: '4-7 years',
    type: 'Full Time',
    workMode: 'Hybrid',
    posted: '2 hours ago',
    deadline: '30 May 2026',
    featured: true,
    urgent: true,
    skills: ['React', 'TypeScript', 'Tailwind', 'REST API'],
    description: 'Build elegant hiring tools used by enterprise teams, with ownership across UI architecture, performance, accessibility, and release quality.',
    responsibilities: ['Create polished React interfaces', 'Collaborate with product and backend teams', 'Improve performance and quality'],
    requirements: ['Strong React experience', 'Modern JavaScript skills', 'Good product detail'],
    benefits: ['Flexible hybrid work', 'Premium health coverage', 'Learning budget'],
    aboutCompany: 'Nimbus Tech builds enterprise workflow software for hiring teams.',
    status: 'Active',
    approval: 'Approved',
    applicationsCount: 148,
    views: 4820,
  },
  {
    title: 'Performance Marketing Manager',
    company: 'Talentora',
    companyLogo: 'TA',
    department: 'Growth',
    location: 'Mumbai',
    salary: '10 - 16 LPA',
    experience: '3-6 years',
    type: 'Full Time',
    workMode: 'On-site',
    posted: 'Today',
    deadline: '24 May 2026',
    featured: true,
    urgent: false,
    skills: ['Google Ads', 'Meta Ads', 'Analytics', 'SEO'],
    description: 'Own acquisition campaigns for a fast-growing talent platform.',
    responsibilities: ['Plan paid campaigns', 'Optimize funnels', 'Report weekly performance'],
    requirements: ['Campaign management', 'Analytics mindset', 'Clear communication'],
    benefits: ['Quarterly bonus', 'Team offsites', 'Wellness allowance'],
    aboutCompany: 'Talentora partners with recruiters and founders.',
    status: 'Open',
    approval: 'Pending',
    applicationsCount: 82,
    views: 2218,
  },
  {
    title: 'Customer Success Specialist',
    company: 'Auralis Support',
    companyLogo: 'AS',
    department: 'Customer Success',
    location: 'Delhi NCR',
    salary: '4 - 7 LPA',
    experience: '1-3 years',
    type: 'Full Time',
    workMode: 'Remote',
    posted: '1 day ago',
    deadline: '28 May 2026',
    featured: false,
    urgent: true,
    skills: ['CRM', 'Communication', 'Retention', 'SLA'],
    description: 'Support premium clients through onboarding, renewals, and account management.',
    responsibilities: ['Manage onboarding calls', 'Resolve customer requests', 'Track account health'],
    requirements: ['Excellent written English', 'CRM experience', 'Customer-first attitude'],
    benefits: ['Remote work', 'Shift allowance', 'Career coaching'],
    aboutCompany: 'Auralis Support delivers managed customer success operations.',
    status: 'Active',
    approval: 'Approved',
    applicationsCount: 211,
    views: 5990,
  },
]

const employers = [
  { companyName: 'Nimbus Tech', businessEmail: 'hr@nimbus.test', phone: '9999999999', industry: 'Cloud software', companySize: '501-1000', website: 'https://nimbus.example', location: 'Bengaluru', status: 'Approved', verified: true },
  { companyName: 'Talentora', businessEmail: 'hr@talentora.test', phone: '9888888888', industry: 'Recruitment', companySize: '51-200', website: 'https://talentora.example', location: 'Mumbai', status: 'Pending', verified: false },
]

const candidates = [
  { name: 'Neha Sharma', email: 'neha@example.com', phone: '9000000001', role: 'React Developer', skills: ['React', 'Tailwind', 'API'], experience: '4 years', location: 'Bengaluru', profileStrength: 86, status: 'Active' },
  { name: 'Rohan Mehta', email: 'rohan@example.com', phone: '9000000002', role: 'Marketing Manager', skills: ['SEO', 'Ads', 'Analytics'], experience: '6 years', location: 'Mumbai', profileStrength: 78, status: 'Shortlisted' },
]

const applications = [
  { candidateName: 'Neha Sharma', candidateEmail: 'neha@example.com', jobTitle: 'Senior React Engineer', company: 'Nimbus Tech', status: 'Shortlisted' },
  { candidateName: 'Rohan Mehta', candidateEmail: 'rohan@example.com', jobTitle: 'Performance Marketing Manager', company: 'Talentora', status: 'Interview' },
]

const locations = [
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', status: 'Active' },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', status: 'Active' },
  { city: 'Remote', state: 'All', country: 'Global', status: 'Active' },
]

const payments = [
  { employer: 'Nimbus Tech', plan: 'Enterprise', amount: 'INR 1,20,000', status: 'Paid', invoiceNo: 'INV-901' },
  { employer: 'Talentora', plan: 'Growth', amount: 'INR 48,000', status: 'Paid', invoiceNo: 'INV-902' },
]

const settings = [
  { key: 'siteName', value: 'Cromgen Rozgar', group: 'website' },
  { key: 'supportEmail', value: 'support@cromgenrozgar.com', group: 'email' },
]

const users = [
  { name: 'Admin Demo', email: 'admin@cromgen.test', password: 'password123', role: 'Admin', status: 'Active' },
  { name: 'Staff Demo', email: 'staff@cromgen.test', password: 'password123', role: 'staff', status: 'Active' },
  { name: 'Recruiter Demo', email: 'recruiter@cromgen.test', password: 'password123', role: 'recruiter', status: 'Active' },
  { name: 'Users Demo', email: 'users@cromgen.test', password: 'password123', role: 'users', status: 'Active' },
  { name: 'Hiring Team Demo', email: 'hiring@cromgen.test', password: 'password123', role: 'hiring', status: 'Active' },
  { name: 'Account Team Demo', email: 'account@cromgen.test', password: 'password123', role: 'account team', status: 'Active' },
  { name: 'Recruiter Admin Demo', email: 'employer@cromgen.test', password: 'password123', role: 'recruiter', status: 'Active' },
  { name: 'Candidate Demo', email: 'candidate@cromgen.test', password: 'password123', role: 'Candidate', status: 'Active' },
]

module.exports = { applications, candidates, categories, companies, employers, jobs, locations, payments, settings, users }
