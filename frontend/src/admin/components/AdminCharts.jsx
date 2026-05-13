import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AdminCard } from './AdminPrimitives'
import { categoryChartData, employerPerformance, monthlyJobsData } from '../data/adminData'

const colors = ['#2563EB', '#14B8A6', '#8B5CF6', '#38BDF8', '#0EA5E9']

export function ChartCard({ title, children }) {
  return (
    <AdminCard>
      <h3 className="mb-5 text-lg font-black text-slate-950">{title}</h3>
      <div className="h-72">{children}</div>
    </AdminCard>
  )
}

export function AnalyticsGrid() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Monthly Job Posting Chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyJobsData}>
            <defs><linearGradient id="jobs" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.28} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Area dataKey="jobs" fill="url(#jobs)" stroke="#2563EB" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Application Trend Chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyJobsData}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Line dataKey="applications" stroke="#14B8A6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Category-wise Jobs Chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categoryChartData} dataKey="value" nameKey="name" outerRadius={92} innerRadius={54} paddingAngle={4}>
              {categoryChartData.map((entry, index) => <Cell fill={colors[index % colors.length]} key={entry.name} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Employer Performance Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={employerPerformance}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="company" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Bar dataKey="hires" fill="#8B5CF6" radius={[10, 10, 0, 0]} />
            <Bar dataKey="views" fill="#38BDF8" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Revenue Chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyJobsData}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Area dataKey="revenue" fill="#CCFBF1" stroke="#14B8A6" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Candidate Registration Graph">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyJobsData}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Bar dataKey="candidates" fill="#2563EB" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
