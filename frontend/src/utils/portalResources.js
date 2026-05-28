import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  Code2,
  Headphones,
  HeartHandshake,
  Home,
  Megaphone,
  PenTool,
  PieChart,
  TrendingUp,
  Users,
} from 'lucide-react'

const categoryIconRules = [
  [/software|developer|engineering|technology|web|react|node|python|cloud|devops|cyber|testing/i, Code2],
  [/sales|marketing|business development|lead/i, Megaphone],
  [/support|customer|helpdesk|success/i, Headphones],
  [/bpo|voice|call|tele/i, Users],
  [/hr|recruit/i, HeartHandshake],
  [/finance|account|bank|audit|tax|insurance/i, PieChart],
  [/data collection|data entry|research|annotation/i, BarChart3],
  [/digital|seo|content|social/i, PenTool],
  [/home|remote|wfh/i, Home],
  [/freelance|contract|part time/i, BriefcaseBusiness],
  [/ai|machine learning|llm/i, Bot],
  [/business|growth|partnership/i, TrendingUp],
]

const categoryTones = [
  'bg-blue-50 text-blue-600',
  'bg-teal-50 text-teal-600',
  'bg-violet-50 text-violet-600',
  'bg-sky-50 text-sky-600',
]

export function decorateCategories(items = []) {
  return items
    .filter((item) => item?.status !== 'Inactive')
    .map((item, index) => {
      const name = item.name || item.title || 'Category'
      const Icon = categoryIconRules.find(([pattern]) => pattern.test(name))?.[1] || Building2

      return {
        ...item,
        name,
        jobs: Number(item.jobs || 0),
        icon: Icon,
        color: item.color || categoryTones[index % categoryTones.length],
      }
    })
}
