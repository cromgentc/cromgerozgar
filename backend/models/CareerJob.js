const mongoose = require('mongoose')

const careerJobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, default: '', trim: true },
    location: { type: String, default: 'India', trim: true },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Hybrid' },
    type: { type: String, enum: ['Full Time', 'Part Time', 'Contract', 'Internship'], default: 'Full Time' },
    experience: { type: String, default: '', trim: true },
    salary: { type: String, default: '', trim: true },
    openings: { type: Number, default: 1 },
    deadline: { type: String, default: '', trim: true },
    skills: [{ type: String }],
    description: { type: String, required: true, trim: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    applyEmail: { type: String, default: 'support@cromgenrozgar.com', lowercase: true, trim: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive', 'Closed'], default: 'Active' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('CareerJob', careerJobSchema)
