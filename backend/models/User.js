const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['Admin', 'staff', 'company', 'users', 'Employer', 'Candidate'], default: 'Candidate' },
    status: { type: String, enum: ['Active', 'Inactive', 'Suspend'], default: 'Active' },
  },
  { timestamps: true },
)

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
