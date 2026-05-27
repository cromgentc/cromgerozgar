const defaultTestimonials = [
  {
    name: 'Ritika Shah',
    role: 'HR Director',
    company: 'Nimbus Tech',
    type: 'Company',
    frontendPlacement: 'Users Frontend',
    text: 'The candidate quality and clean hiring workflow helped our team close senior roles faster.',
    rating: 5,
    status: 'Active',
    featured: true,
  },
  {
    name: 'Arjun Mehta',
    role: 'Growth Lead',
    company: 'Talentora',
    type: 'Recruiter',
    frontendPlacement: 'Recruiter Frontend',
    text: 'A premium job portal experience with filters and dashboards our recruiters actually enjoy using.',
    rating: 5,
    status: 'Active',
    featured: true,
  },
  {
    name: 'Neha Sharma',
    role: 'Frontend Developer',
    company: 'Placed Candidate',
    type: 'Candidate',
    frontendPlacement: 'Users Frontend',
    text: 'I found relevant jobs quickly, saved openings, and tracked every application in one place.',
    rating: 5,
    status: 'Active',
    featured: false,
  },
]

async function ensureDefaultTestimonials(Testimonial) {
  const existingCount = await Testimonial.countDocuments()
  if (existingCount) return []
  return Testimonial.insertMany(defaultTestimonials)
}

module.exports = { ensureDefaultTestimonials }
