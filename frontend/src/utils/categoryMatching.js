export const categorySeoTerms = {
  'IT & Software': ['it', 'software', 'engineering', 'developer', 'engineer', 'frontend', 'backend', 'full stack', 'react', 'node', 'java', 'python', 'php', 'qa', 'devops', 'cloud', 'data', 'technology'],
  'Sales & Marketing': ['sales', 'marketing', 'growth', 'campaign', 'lead generation', 'business development', 'seo', 'google ads', 'meta ads', 'brand'],
  'Customer Support': ['customer support', 'customer success', 'support', 'service', 'crm', 'retention', 'client success', 'helpdesk'],
  BPO: ['bpo', 'call center', 'voice process', 'non voice', 'telecaller', 'customer care', 'process executive'],
  'HR & Recruitment': ['hr', 'human resources', 'recruitment', 'recruiter', 'talent acquisition', 'hiring', 'payroll'],
  Finance: ['finance', 'accounting', 'accounts', 'analyst', 'audit', 'tax', 'banking', 'payroll'],
  'Data Collection': ['data collection', 'research', 'data entry', 'operations', 'excel', 'quality audit', 'field data'],
  'Digital Marketing': ['digital marketing', 'seo', 'content', 'social media', 'google ads', 'meta ads', 'performance marketing', 'analytics'],
  'Work From Home': ['work from home', 'remote', 'wfh'],
  Freelance: ['freelance', 'contract', 'part time', 'consultant'],
  'AI & Data Annotation': ['ai', 'artificial intelligence', 'annotation', 'data annotation', 'machine learning', 'nlp', 'labeling'],
  'Business Development': ['business development', 'bd', 'sales', 'partnership', 'lead generation', 'client acquisition'],
}

export const departmentCategoryMap = {
  'it & software': ['it & software', 'it', 'software', 'engineering', 'technology', 'development', 'product engineering'],
  'sales & marketing': ['sales & marketing', 'sales', 'marketing', 'growth', 'business development', 'bd', 'lead generation'],
  'customer support': ['customer support', 'customer success', 'support', 'service', 'helpdesk'],
  bpo: ['bpo', 'call center', 'voice process', 'non voice', 'customer care'],
  'hr & recruitment': ['hr & recruitment', 'hr', 'human resources', 'recruitment', 'recruiter', 'talent acquisition', 'hiring'],
  finance: ['finance', 'accounting', 'accounts', 'banking', 'audit', 'tax'],
  'data collection': ['data collection', 'data entry', 'research operations', 'research', 'field data'],
  'digital marketing': ['digital marketing', 'seo', 'content marketing', 'social media marketing', 'performance marketing'],
  'work from home': ['work from home', 'wfh', 'remote'],
  freelance: ['freelance', 'contract', 'consultant', 'part time'],
  'ai & data annotation': ['ai & data annotation', 'ai operations', 'data annotation', 'annotation', 'machine learning', 'nlp'],
  'business development': ['business development', 'bd', 'partnership', 'client acquisition'],
}

export function normalizeCategoryText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ')
}

export function slugifyCategory(name) {
  return normalizeCategoryText(name).trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

export function getCategoryBySlug(categories, slug) {
  return categories.find((category) => slugifyCategory(category.name) === slug)
}

export function normalizeJobForCategory(job) {
  return {
    ...job,
    skills: Array.isArray(job.skills) ? job.skills : String(job.skills || '').split(',').map((skill) => skill.trim()).filter(Boolean),
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
  }
}

export function getCategoryJobScore(job, categoryName) {
  const terms = categorySeoTerms[categoryName] || [categoryName]
  const normalizedJob = normalizeJobForCategory(job)
  const normalizedCategory = normalizeCategoryText(categoryName)
  const normalizedDepartment = normalizeCategoryText(normalizedJob.department)
  const normalizedIndustry = normalizeCategoryText(normalizedJob.industry)
  const normalizedTitle = normalizeCategoryText(normalizedJob.title)
  const normalizedWorkMode = normalizeCategoryText(normalizedJob.workMode)
  const normalizedType = normalizeCategoryText(normalizedJob.type)
  const mappedDepartments = departmentCategoryMap[normalizedCategory] || [normalizedCategory]
  const hasDepartmentOrIndustry = Boolean(normalizedDepartment || normalizedIndustry)
  const matchesMappedDepartment = mappedDepartments.some((term) => {
    const normalizedTerm = normalizeCategoryText(term)
    return normalizedDepartment === normalizedTerm || normalizedIndustry === normalizedTerm
  })
  const containsMappedDepartment = mappedDepartments.some((term) => {
    const normalizedTerm = normalizeCategoryText(term)
    return (normalizedDepartment && (normalizedDepartment.includes(normalizedTerm) || normalizedTerm.includes(normalizedDepartment)))
      || (normalizedIndustry && (normalizedIndustry.includes(normalizedTerm) || normalizedTerm.includes(normalizedIndustry)))
  })

  if (matchesMappedDepartment) return 100
  if (containsMappedDepartment) return 80

  if (hasDepartmentOrIndustry) {
    if (normalizedCategory === 'work from home' && normalizedWorkMode === 'remote') return 50
    if (normalizedCategory === 'freelance' && ['freelance', 'contract', 'part time'].includes(normalizedType)) return 50
    return 0
  }

  const text = normalizeCategoryText([
    normalizedJob.title,
    normalizedJob.company,
    normalizedJob.department,
    normalizedJob.industry,
    normalizedJob.description,
    normalizedJob.type,
    normalizedJob.workMode,
    normalizedJob.location,
    ...normalizedJob.skills,
  ].filter(Boolean).join(' '))

  return terms.reduce((score, term) => {
    const normalizedTerm = normalizeCategoryText(term)
    const titleBoost = normalizedTitle.includes(normalizedTerm) ? 2 : 0
    return score + (text.includes(normalizedTerm) ? 1 : 0) + titleBoost
  }, 0)
}

export function getJobsForCategory(jobs, categoryName) {
  return jobs
    .map(normalizeJobForCategory)
    .map((job) => ({ ...job, categoryScore: getCategoryJobScore(job, categoryName) }))
    .filter((job) => job.categoryScore > 0)
    .sort((a, b) => b.categoryScore - a.categoryScore)
}
