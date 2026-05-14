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
      <div className="h-72 min-h-72 min-w-0 overflow-hidden">{children}</div>
    </AdminCard>
  )
}

function ChartContainer({ children }) {
  return (
    <ResponsiveContainer debounce={50} height="100%" minHeight={260} minWidth={0} width="100%">
      {children}
    </ResponsiveContainer>
  )
}

export function AnalyticsGrid({ monthlyData = monthlyJobsData, categoryData = categoryChartData, recruiterData = employerPerformance }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Monthly Job Posting Chart">
        <ChartContainer>
          <AreaChart data={monthlyData}>
            <defs><linearGradient id="jobs" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.28} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Area dataKey="jobs" fill="url(#jobs)" stroke="#2563EB" strokeWidth={3} />
          </AreaChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Application Trend Chart">
        <ChartContainer>
          <LineChart data={monthlyData}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Line dataKey="applications" stroke="#14B8A6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Category-wise Jobs Chart">
        <ChartContainer>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={92} innerRadius={54} paddingAngle={4}>
              {categoryData.map((entry, index) => <Cell fill={colors[index % colors.length]} key={entry.name} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Recruiter Performance Chart">
        <ChartContainer>
          <BarChart data={recruiterData}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="company" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Bar dataKey="hires" fill="#8B5CF6" radius={[10, 10, 0, 0]} />
            <Bar dataKey="views" fill="#38BDF8" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Revenue Chart">
        <ChartContainer>
          <AreaChart data={monthlyData}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Area dataKey="revenue" fill="#CCFBF1" stroke="#14B8A6" strokeWidth={3} />
          </AreaChart>
        </ChartContainer>
      </ChartCard>
      <ChartCard title="Candidate Registration Graph">
        <ChartContainer>
          <BarChart data={monthlyData}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" />
            <Tooltip />
            <Bar dataKey="candidates" fill="#2563EB" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}
