const mongoose = require('mongoose')

const recruiterDocumentSchema = new mongoose.Schema(
  {
    recruiterName: { type: String, default: '' },
    recruiterEmail: { type: String, default: '', lowercase: true },
    documentType: { type: String, enum: ['GST', 'Offer Letter', 'Aadhar Card'], required: true },
    panNumber: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    aadhaarNumber: { type: String, default: '' },
    panDocument: { type: String, default: '' },
    gstDocument: { type: String, default: '' },
    offerLetter: { type: String, default: '' },
    aadhaarDocument: { type: String, default: '' },
    gstLegalName: { type: String, default: '' },
    gstTradeName: { type: String, default: '' },
    gstStatus: { type: String, default: '' },
    status: { type: String, default: 'Submitted' },
    remark: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model('RecruiterDocument', recruiterDocumentSchema)
