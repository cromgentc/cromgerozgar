import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Eye,
  FileCheck2,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UsersRound,
} from 'lucide-react'

export const adminRoles = ['Admin', 'staff', 'company', 'users']

export const dashboardMetrics = [
  { label: 'Total Jobs', value: '12,840', change: '+12.4%', icon: BriefcaseBusiness, color: 'blue' },
  { label: 'Active Jobs', value: '8,216', change: '+8.1%', icon: ShieldCheck, color: 'teal' },
  { label: 'Pending Jobs', value: '486', change: '-2.3%', icon: Clock3, color: 'purple' },
  { label: 'Total Employers', value: '1,284', change: '+6.8%', icon: Building2, color: 'blue' },
  { label: 'Total Candidates', value: '48,920', change: '+18.2%', icon: UsersRound, color: 'teal' },
  { label: 'Total Applications', value: '96,430', change: '+14.9%', icon: FileCheck2, color: 'purple' },
  { label: 'Shortlisted Candidates', value: '7,418', change: '+9.5%', icon: UserCheck, color: 'blue' },
  { label: 'Revenue', value: 'INR 42.8L', change: '+21.7%', icon: BadgeDollarSign, color: 'teal' },
  { label: 'New Registrations', value: '2,918', change: '+11.0%', icon: TrendingUp, color: 'purple' },
  { label: 'Job Views', value: '1.2M', change: '+24.6%', icon: Eye, color: 'blue' },
]

export const jobsAdmin = [
  { id: 'JB-1001', title: 'Senior React Engineer', company: 'Nimbus Tech', category: 'IT & Software', location: 'Bengaluru', status: 'Active', approval: 'Approved', applications: 148, views: 4820 },
  { id: 'JB-1002', title: 'Performance Marketing Manager', company: 'Talentora', category: 'Digital Marketing', location: 'Mumbai', status: 'Open', approval: 'Pending', applications: 82, views: 2218 },
  { id: 'JB-1003', title: 'Customer Success Specialist', company: 'Auralis Support', category: 'Customer Support', location: 'Remote', status: 'Active', approval: 'Approved', applications: 211, views: 5990 },
  { id: 'JB-1004', title: 'Finance Analyst', company: 'BluePeak Finance', category: 'Finance', location: 'Hyderabad', status: 'Closed', approval: 'Rejected', applications: 37, views: 930 },
  { id: 'JB-1005', title: 'HR Operations Lead', company: 'PeopleMint', category: 'HR & Recruitment', location: 'Delhi NCR', status: 'Open', approval: 'Pending', applications: 56, views: 1402 },
]

export const companiesAdmin = [
  { id: 'CO-401', name: 'Nimbus Tech', owner: 'Ritika Shah', documents: 'Verified', status: 'Active', jobs: 42, plan: 'Enterprise' },
  { id: 'CO-402', name: 'Talentora', owner: 'Arjun Mehta', documents: 'Review', status: 'Pending', jobs: 35, plan: 'Growth' },
  { id: 'CO-403', name: 'Auralis Support', owner: 'Sneha Rao', documents: 'Verified', status: 'Active', jobs: 18, plan: 'Starter' },
  { id: 'CO-404', name: 'BluePeak Finance', owner: 'Karan Sethi', documents: 'Missing', status: 'Blocked', jobs: 27, plan: 'Enterprise' },
]

export const candidatesAdmin = [
  { id: 'CA-7001', name: 'Neha Sharma', role: 'React Developer', skills: 'React, Tailwind, API', experience: '4 years', status: 'Active', applications: 12 },
  { id: 'CA-7002', name: 'Rohan Mehta', role: 'Marketing Manager', skills: 'SEO, Ads, Analytics', experience: '6 years', status: 'Shortlisted', applications: 8 },
  { id: 'CA-7003', name: 'Simran Kaur', role: 'Customer Success', skills: 'CRM, Support, SLA', experience: '3 years', status: 'Active', applications: 15 },
  { id: 'CA-7004', name: 'Aditya Rao', role: 'Finance Analyst', skills: 'Excel, Forecasting', experience: '2 years', status: 'Blocked', applications: 4 },
]

export const applicationsAdmin = [
  { id: 'AP-2101', candidate: 'Neha Sharma', job: 'Senior React Engineer', company: 'Nimbus Tech', status: 'Shortlisted', date: '12 May 2026' },
  { id: 'AP-2102', candidate: 'Rohan Mehta', job: 'Performance Marketing Manager', company: 'Talentora', status: 'Interview', date: '11 May 2026' },
  { id: 'AP-2103', candidate: 'Simran Kaur', job: 'Customer Success Specialist', company: 'Auralis Support', status: 'Reviewed', date: '10 May 2026' },
  { id: 'AP-2104', candidate: 'Aditya Rao', job: 'Finance Analyst', company: 'BluePeak Finance', status: 'Rejected', date: '9 May 2026' },
]

export const categoryRows = [
  { id: 'CAT-01', name: 'IT & Software', jobs: 1842, status: 'Active' },
  { id: 'CAT-02', name: 'Sales & Marketing', jobs: 936, status: 'Active' },
  { id: 'CAT-03', name: 'BPO', jobs: 524, status: 'Inactive' },
  { id: 'CAT-04', name: 'Finance', jobs: 624, status: 'Active' },
]

export const locationRows = [
  { id: 'LOC-01', city: 'Bengaluru', state: 'Karnataka', country: 'India', status: 'Active' },
  { id: 'LOC-02', city: 'Mumbai', state: 'Maharashtra', country: 'India', status: 'Active' },
  { id: 'LOC-03', city: 'Remote', state: 'All', country: 'Global', status: 'Active' },
  { id: 'LOC-04', city: 'Hyderabad', state: 'Telangana', country: 'India', status: 'Inactive' },
]

export const paymentRows = [
  { id: 'INV-901', employer: 'Nimbus Tech', plan: 'Enterprise', amount: 'INR 1,20,000', status: 'Paid', date: '12 May 2026' },
  { id: 'INV-902', employer: 'Talentora', plan: 'Growth', amount: 'INR 48,000', status: 'Paid', date: '10 May 2026' },
  { id: 'INV-903', employer: 'BluePeak Finance', plan: 'Enterprise', amount: 'INR 1,20,000', status: 'Failed', date: '8 May 2026' },
]

export const reportRows = [
  { id: 'REP-01', name: 'Daily Report', scope: 'Platform activity', updated: 'Today', records: '4,820' },
  { id: 'REP-02', name: 'Weekly Report', scope: 'Jobs and employers', updated: 'This week', records: '18,240' },
  { id: 'REP-03', name: 'Monthly Report', scope: 'Revenue and growth', updated: 'May 2026', records: '74,118' },
  { id: 'REP-04', name: 'Candidate-wise Report', scope: 'Applications', updated: 'May 2026', records: '96,430' },
]

export const monthlyJobsData = [
  { month: 'Jan', jobs: 520, applications: 3100, revenue: 9.8, candidates: 980 },
  { month: 'Feb', jobs: 680, applications: 4200, revenue: 12.4, candidates: 1240 },
  { month: 'Mar', jobs: 740, applications: 5100, revenue: 15.2, candidates: 1420 },
  { month: 'Apr', jobs: 910, applications: 6400, revenue: 19.6, candidates: 1880 },
  { month: 'May', jobs: 1080, applications: 7600, revenue: 24.8, candidates: 2240 },
  { month: 'Jun', jobs: 1260, applications: 8900, revenue: 31.4, candidates: 2680 },
]

export const categoryChartData = [
  { name: 'IT', value: 1842 },
  { name: 'Sales', value: 936 },
  { name: 'Support', value: 710 },
  { name: 'Finance', value: 624 },
  { name: 'Remote', value: 1280 },
]

export const employerPerformance = [
  { company: 'Nimbus', hires: 82, views: 482 },
  { company: 'Talentora', hires: 61, views: 366 },
  { company: 'Auralis', hires: 49, views: 290 },
  { company: 'BluePeak', hires: 38, views: 236 },
]

export const auditItems = [
  '42 jobs approved by Admin team',
  '8 employer accounts awaiting verification',
  '16 payment retries scheduled',
  '124 resumes added to database',
]
