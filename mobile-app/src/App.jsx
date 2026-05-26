import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Download,
  FileText,
  Filter,
  GraduationCap,
  Headphones,
  Home,
  Languages,
  Lightbulb,
  ListChecks,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Pencil,
  Phone,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  UserRound,
  WalletCards,
} from 'lucide-react'
import { api, clearAuthSession, getAuthToken, getStoredUser, saveAuthSession } from './services/api'

const fallbackJobs = [
  {
    _id: 'demo-1',
    title: 'Senior React Native Developer',
    company: 'Cromgen Technologies',
    location: 'Noida, India',
    salary: 'INR 18L - 28L',
    experience: '5+ years',
    type: 'Full Time',
    workMode: 'Hybrid',
    match: '96%',
    featured: true,
    skills: ['React Native', 'REST APIs', 'Mobile UI'],
    description: 'Build scalable candidate mobile experiences and connect job flows with production APIs.',
  },
  {
    _id: 'demo-2',
    title: 'Product Designer',
    company: 'NovaFin Labs',
    location: 'Bengaluru, India',
    salary: 'INR 12L - 20L',
    experience: '3-5 years',
    type: 'Full Time',
    workMode: 'Remote',
    match: '91%',
    featured: true,
    skills: ['UX', 'Figma', 'Design Systems'],
    description: 'Own design for fintech hiring workflows and high trust candidate experiences.',
  },
]

const tabs = [
  { id: 'home', label: 'Home', labelKey: 'tabHome', icon: Home },
  { id: 'jobs', label: 'Jobs', labelKey: 'tabJobs', icon: BriefcaseBusiness },
  { id: 'applications', label: 'Applied', labelKey: 'tabApplied', icon: ListChecks },
  { id: 'profile', label: 'Profile', labelKey: 'tabProfile', icon: UserRound },
  { id: 'settings', label: 'Settings', labelKey: 'settingsTitle', icon: Settings },
]

const fallbackCustomerCareNumber = '+91 98765 43210'

function normalizeBrandingPayload(payload = {}) {
  const setting = payload?.data || payload || {}
  const site = setting.value || setting

  return {
    name: site.siteName || site.name || 'Cromgen Jobs',
    logoUrl: site.logoUrl || site.logo || '/cromgen-rozgar-logo.png',
    tollFreeNumber: site.tollFreeNumber || fallbackCustomerCareNumber,
  }
}

const screenOptions = [
  ['splash', 'Splash'],
  ['login', 'Login'],
  ['home', 'Home'],
  ['jobs', 'Jobs'],
  ['details', 'Details'],
  ['applications', 'Applications'],
  ['profile', 'Profile'],
  ['resume', 'Resume'],
  ['notifications', 'Alerts'],
  ['settings', 'Settings'],
  ['edit-profile', 'Edit Profile'],
  ['language', 'Language'],
  ['help', 'Help'],
  ['privacy', 'Privacy'],
]

const translations = {
  English: {
    profileTitle: 'Candidate profile',
    profileSubtitle: 'Keep your profile ready for recruiters',
    editProfile: 'Edit profile',
    updateProfile: 'Update profile',
    profileDetails: 'Profile details',
    personalDetails: 'Personal details',
    education: 'Education',
    experience: 'Experience',
    skills: 'Skills',
    resumeBuilder: 'Open resume builder',
    applicationsTitle: 'My applications',
    applicationsSubtitle: 'Track applied jobs and progress',
    loginApplicationsSubtitle: 'Login required for live application tracking',
    noApplicationsTitle: 'No applications yet',
    noApplicationsCopy: 'Apply from the Jobs tab and status will appear here.',
    notificationsTitle: 'Notifications',
    notificationsSubtitle: 'Job alerts, interviews, offers, and updates',
    clearAll: 'Clear all',
    noNotificationsTitle: 'No notifications',
    noNotificationsCopy: 'New job alerts and application updates will appear here.',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage candidate account preferences',
    changeLanguage: 'Change language',
    themeMode: 'Dark/light mode',
    helpSupport: 'Help & support',
    privacySecurity: 'Privacy and security',
    logout: 'Logout',
    login: 'Login',
    signOut: 'Sign out',
    signIn: 'Sign in',
    tabHome: 'Home',
    tabJobs: 'Jobs',
    tabApplied: 'Applied',
    tabProfile: 'Profile',
    languageTitle: 'Change language',
    languageSubtitle: 'Choose app language preference',
    done: 'Done',
  },
  Hindi: {
    profileTitle: 'उम्मीदवार प्रोफाइल',
    profileSubtitle: 'अपनी प्रोफाइल recruiters के लिए तैयार रखें',
    editProfile: 'प्रोफाइल एडिट करें',
    updateProfile: 'प्रोफाइल अपडेट करें',
    profileDetails: 'प्रोफाइल डिटेल्स',
    personalDetails: 'व्यक्तिगत जानकारी',
    education: 'शिक्षा',
    experience: 'अनुभव',
    skills: 'स्किल्स',
    resumeBuilder: 'रेज्यूमे बिल्डर खोलें',
    applicationsTitle: 'मेरे आवेदन',
    applicationsSubtitle: 'अप्लाई किए गए jobs और progress देखें',
    loginApplicationsSubtitle: 'Live application tracking के लिए login जरूरी है',
    noApplicationsTitle: 'अभी कोई आवेदन नहीं',
    noApplicationsCopy: 'Jobs tab से apply करेंगे तो status यहां दिखेगा.',
    notificationsTitle: 'नोटिफिकेशन',
    notificationsSubtitle: 'Job alerts, interviews, offers और updates',
    clearAll: 'सब साफ करें',
    noNotificationsTitle: 'कोई नोटिफिकेशन नहीं',
    noNotificationsCopy: 'New job alerts और application updates यहां दिखेंगे.',
    settingsTitle: 'सेटिंग्स',
    settingsSubtitle: 'Candidate account preferences manage करें',
    changeLanguage: 'भाषा बदलें',
    themeMode: 'Dark/light mode',
    helpSupport: 'Help और support',
    privacySecurity: 'Privacy और security',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    signOut: 'Sign out',
    signIn: 'Sign in',
    tabHome: 'होम',
    tabJobs: 'जॉब्स',
    tabApplied: 'आवेदन',
    tabProfile: 'प्रोफाइल',
    languageTitle: 'भाषा बदलें',
    languageSubtitle: 'App language preference चुनें',
    done: 'हो गया',
  },
  Hinglish: {
    profileTitle: 'Candidate profile',
    profileSubtitle: 'Profile recruiters ke liye ready rakho',
    editProfile: 'Profile edit karo',
    updateProfile: 'Profile update karo',
    profileDetails: 'Profile details',
    personalDetails: 'Personal details',
    education: 'Education',
    experience: 'Experience',
    skills: 'Skills',
    resumeBuilder: 'Resume builder kholo',
    applicationsTitle: 'Meri applications',
    applicationsSubtitle: 'Applied jobs aur progress track karo',
    loginApplicationsSubtitle: 'Live tracking ke liye login required hai',
    noApplicationsTitle: 'Abhi applications nahi hain',
    noApplicationsCopy: 'Jobs tab se apply karte hi status yahan aa jayega.',
    notificationsTitle: 'Notifications',
    notificationsSubtitle: 'Job alerts, interviews, offers aur updates',
    clearAll: 'Clear all',
    noNotificationsTitle: 'Notifications clear hain',
    noNotificationsCopy: 'Naye job alerts aur application updates yahan dikhenge.',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Candidate account preferences manage karo',
    changeLanguage: 'Language change karo',
    themeMode: 'Dark/light mode',
    helpSupport: 'Help & support',
    privacySecurity: 'Privacy and security',
    logout: 'Logout',
    login: 'Login',
    signOut: 'Sign out',
    signIn: 'Sign in',
    tabHome: 'Home',
    tabJobs: 'Jobs',
    tabApplied: 'Applied',
    tabProfile: 'Profile',
    languageTitle: 'Language change karo',
    languageSubtitle: 'App language choose karo',
    done: 'Done',
  },
}

Object.assign(translations.English, {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  notAdded: 'Not added',
  profileCompletion: 'profile completion',
  professionalSummary: 'Professional summary',
  addSummary: 'Add professional summary',
  addEducation: 'Add education details',
  addExperience: 'Add work experience',
  addSkills: 'Add skills to improve matching',
  educationSuggestions: 'Education suggestions',
  experienceSuggestions: 'Experience suggestions',
  skillSuggestions: 'Skill suggestions',
  tapToUse: 'Tap any suggestion to add it',
  fullName: 'Full name',
  mobileNumber: 'Mobile number',
  skillsComma: 'Skills, comma separated',
  resumeTitle: 'Resume builder',
  resumeSubtitle: 'Create, preview, and update your resume',
  resumePreview: 'Resume preview',
  resumeSuggestions: 'Resume suggestions',
  newJobAlert: 'New job alert',
  jobAlertCopy: 'roles match your current search',
  applicationUpdate: 'Application update',
  applicationUpdateCopy: 'applied jobs are being tracked',
  profileReminder: 'Profile reminder',
  profileReminderCopy: 'Complete profile for better matching',
  now: 'Now',
  today: 'Today',
  downloadPdf: 'Download PDF',
  saveResume: 'Save resume',
  resumeSaved: 'Resume details updated.',
})

Object.assign(translations.Hindi, {
  profileTitle: '\u0909\u092e\u094d\u092e\u0940\u0926\u0935\u093e\u0930 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932',
  profileSubtitle: '\u0905\u092a\u0928\u0940 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u092d\u0930\u094d\u0924\u0940\u0915\u0930\u094d\u0924\u093e\u0913\u0902 \u0915\u0947 \u0932\u093f\u090f \u0924\u0948\u092f\u093e\u0930 \u0930\u0916\u0947\u0902',
  editProfile: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u0947\u0902',
  updateProfile: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0947\u0902',
  profileDetails: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0935\u093f\u0935\u0930\u0923',
  personalDetails: '\u0935\u094d\u092f\u0915\u094d\u0924\u093f\u0917\u0924 \u091c\u093e\u0928\u0915\u093e\u0930\u0940',
  education: '\u0936\u093f\u0915\u094d\u0937\u093e',
  experience: '\u0905\u0928\u0941\u092d\u0935',
  skills: '\u0915\u094c\u0936\u0932',
  resumeBuilder: '\u0930\u0947\u091c\u094d\u092f\u0942\u092e\u0947 \u092c\u093f\u0932\u094d\u0921\u0930 \u0916\u094b\u0932\u0947\u0902',
  applicationsTitle: '\u092e\u0947\u0930\u0947 \u0906\u0935\u0947\u0926\u0928',
  applicationsSubtitle: '\u0906\u0935\u0947\u0926\u093f\u0924 \u0928\u094c\u0915\u0930\u093f\u092f\u094b\u0902 \u0914\u0930 \u092a\u094d\u0930\u0917\u0924\u093f \u0915\u094b \u091f\u094d\u0930\u0948\u0915 \u0915\u0930\u0947\u0902',
  loginApplicationsSubtitle: '\u0932\u093e\u0907\u0935 \u0906\u0935\u0947\u0926\u0928 \u091f\u094d\u0930\u0948\u0915\u093f\u0902\u0917 \u0915\u0947 \u0932\u093f\u090f \u0932\u0949\u0917\u093f\u0928 \u091c\u0930\u0942\u0930\u0940 \u0939\u0948',
  noApplicationsTitle: '\u0905\u092d\u0940 \u0915\u094b\u0908 \u0906\u0935\u0947\u0926\u0928 \u0928\u0939\u0940\u0902',
  noApplicationsCopy: '\u091c\u0949\u092c\u094d\u0938 \u091f\u0948\u092c \u0938\u0947 \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0924\u0947 \u0939\u0940 \u0938\u094d\u0925\u093f\u0924\u093f \u092f\u0939\u093e\u0902 \u0926\u093f\u0916\u0947\u0917\u0940.',
  notificationsTitle: '\u0938\u0942\u091a\u0928\u093e\u090f\u0902',
  notificationsSubtitle: '\u0928\u094c\u0915\u0930\u0940 \u0905\u0932\u0930\u094d\u091f, \u0938\u093e\u0915\u094d\u0937\u093e\u0924\u094d\u0915\u093e\u0930, \u0911\u092b\u0930 \u0914\u0930 \u0905\u092a\u0921\u0947\u091f',
  clearAll: '\u0938\u092d\u0940 \u0938\u093e\u092b \u0915\u0930\u0947\u0902',
  noNotificationsTitle: '\u0915\u094b\u0908 \u0938\u0942\u091a\u0928\u093e \u0928\u0939\u0940\u0902',
  noNotificationsCopy: '\u0928\u090f \u091c\u0949\u092c \u0905\u0932\u0930\u094d\u091f \u0914\u0930 \u0906\u0935\u0947\u0926\u0928 \u0905\u092a\u0921\u0947\u091f \u092f\u0939\u093e\u0902 \u0926\u093f\u0916\u0947\u0902\u0917\u0947.',
  settingsTitle: '\u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938',
  settingsSubtitle: '\u0909\u092e\u094d\u092e\u0940\u0926\u0935\u093e\u0930 \u0916\u093e\u0924\u093e \u092a\u094d\u0930\u093e\u0925\u092e\u093f\u0915\u0924\u093e\u090f\u0902 \u092a\u094d\u0930\u092c\u0902\u0927\u093f\u0924 \u0915\u0930\u0947\u0902',
  changeLanguage: '\u092d\u093e\u0937\u093e \u092c\u0926\u0932\u0947\u0902',
  themeMode: '\u0921\u093e\u0930\u094d\u0915/\u0932\u093e\u0907\u091f \u092e\u094b\u0921',
  helpSupport: '\u0938\u0939\u093e\u092f\u0924\u093e \u0914\u0930 \u0938\u092a\u094b\u0930\u094d\u091f',
  privacySecurity: '\u0917\u094b\u092a\u0928\u0940\u092f\u0924\u093e \u0914\u0930 \u0938\u0941\u0930\u0915\u094d\u0937\u093e',
  logout: '\u0932\u0949\u0917\u0906\u0909\u091f',
  login: '\u0932\u0949\u0917\u093f\u0928',
  signOut: '\u0938\u093e\u0907\u0928 \u0906\u0909\u091f',
  signIn: '\u0938\u093e\u0907\u0928 \u0907\u0928',
  tabHome: '\u0939\u094b\u092e',
  tabJobs: '\u0928\u094c\u0915\u0930\u093f\u092f\u093e\u0902',
  tabApplied: '\u0906\u0935\u0947\u0926\u0928',
  tabProfile: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932',
  languageTitle: '\u092d\u093e\u0937\u093e \u092c\u0926\u0932\u0947\u0902',
  languageSubtitle: '\u090f\u092a \u0915\u0940 \u092d\u093e\u0937\u093e \u091a\u0941\u0928\u0947\u0902',
  name: '\u0928\u093e\u092e',
  email: '\u0908\u092e\u0947\u0932',
  phone: '\u092b\u094b\u0928',
  location: '\u0938\u094d\u0925\u093e\u0928',
  notAdded: '\u091c\u094b\u0921\u093c\u093e \u0928\u0939\u0940\u0902 \u0917\u092f\u093e',
  profileCompletion: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u092a\u0942\u0930\u094d\u0923',
  professionalSummary: '\u092a\u094d\u0930\u094b\u092b\u0947\u0936\u0928\u0932 \u0938\u093e\u0930\u093e\u0902\u0936',
  addSummary: '\u092a\u094d\u0930\u094b\u092b\u0947\u0936\u0928\u0932 \u0938\u093e\u0930\u093e\u0902\u0936 \u091c\u094b\u0921\u093c\u0947\u0902',
  addEducation: '\u0936\u093f\u0915\u094d\u0937\u093e \u0935\u093f\u0935\u0930\u0923 \u091c\u094b\u0921\u093c\u0947\u0902',
  addExperience: '\u0905\u0928\u0941\u092d\u0935 \u091c\u094b\u0921\u093c\u0947\u0902',
  addSkills: '\u092c\u0947\u0939\u0924\u0930 \u092e\u0948\u091a \u0915\u0947 \u0932\u093f\u090f \u0915\u094c\u0936\u0932 \u091c\u094b\u0921\u093c\u0947\u0902',
  educationSuggestions: '\u0936\u093f\u0915\u094d\u0937\u093e \u0938\u0941\u091d\u093e\u0935',
  experienceSuggestions: '\u0905\u0928\u0941\u092d\u0935 \u0938\u0941\u091d\u093e\u0935',
  skillSuggestions: '\u0915\u094c\u0936\u0932 \u0938\u0941\u091d\u093e\u0935',
  tapToUse: '\u091c\u094b\u0921\u093c\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u093f\u0938\u0940 \u0938\u0941\u091d\u093e\u0935 \u092a\u0930 \u091f\u0948\u092a \u0915\u0930\u0947\u0902',
  fullName: '\u092a\u0942\u0930\u093e \u0928\u093e\u092e',
  mobileNumber: '\u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930',
  skillsComma: '\u0915\u094c\u0936\u0932, \u0915\u0949\u092e\u093e \u0938\u0947 \u0905\u0932\u0917',
  resumeTitle: '\u0930\u0947\u091c\u094d\u092f\u0942\u092e\u0947 \u092c\u093f\u0932\u094d\u0921\u0930',
  resumeSubtitle: '\u0930\u0947\u091c\u094d\u092f\u0942\u092e\u0947 \u092c\u0928\u093e\u090f\u0902, \u092a\u094d\u0930\u0940\u0935\u094d\u092f\u0942 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0947\u0902',
  resumePreview: '\u0930\u0947\u091c\u094d\u092f\u0942\u092e\u0947 \u092a\u094d\u0930\u0940\u0935\u094d\u092f\u0942',
  resumeSuggestions: '\u0930\u0947\u091c\u094d\u092f\u0942\u092e\u0947 \u0938\u0941\u091d\u093e\u0935',
  newJobAlert: '\u0928\u092f\u093e \u091c\u0949\u092c \u0905\u0932\u0930\u094d\u091f',
  jobAlertCopy: '\u092d\u0942\u092e\u093f\u0915\u093e\u090f\u0902 \u0906\u092a\u0915\u0940 \u0916\u094b\u091c \u0938\u0947 \u092e\u0948\u091a \u0915\u0930\u0924\u0940 \u0939\u0948\u0902',
  applicationUpdate: '\u0906\u0935\u0947\u0926\u0928 \u0905\u092a\u0921\u0947\u091f',
  applicationUpdateCopy: '\u0906\u0935\u0947\u0926\u093f\u0924 \u0928\u094c\u0915\u0930\u093f\u092f\u093e\u0902 \u091f\u094d\u0930\u0948\u0915 \u0939\u094b \u0930\u0939\u0940 \u0939\u0948\u0902',
  profileReminder: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0930\u093f\u092e\u093e\u0907\u0902\u0921\u0930',
  profileReminderCopy: '\u092c\u0947\u0939\u0924\u0930 \u092e\u0948\u091a \u0915\u0947 \u0932\u093f\u090f \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u092a\u0942\u0930\u0940 \u0915\u0930\u0947\u0902',
  now: '\u0905\u092d\u0940',
  today: '\u0906\u091c',
  downloadPdf: '\u092a\u0940\u0921\u0940\u090f\u092b \u0921\u093e\u0909\u0928\u0932\u094b\u0921',
  saveResume: '\u0930\u0947\u091c\u094d\u092f\u0942\u092e\u0947 \u0938\u0947\u0935 \u0915\u0930\u0947\u0902',
  resumeSaved: '\u0930\u0947\u091c\u094d\u092f\u0942\u092e\u0947 \u0935\u093f\u0935\u0930\u0923 \u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0917\u092f\u093e.',
  done: '\u0939\u094b \u0917\u092f\u093e',
})

Object.assign(translations.Hinglish, {
  name: 'Naam',
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  notAdded: 'Add nahi hua',
  profileCompletion: 'profile complete',
  professionalSummary: 'Professional summary',
  addSummary: 'Professional summary add karo',
  addEducation: 'Education details add karo',
  addExperience: 'Work experience add karo',
  addSkills: 'Better matching ke liye skills add karo',
  educationSuggestions: 'Education suggestions',
  experienceSuggestions: 'Experience suggestions',
  skillSuggestions: 'Skill suggestions',
  tapToUse: 'Add karne ke liye suggestion tap karo',
  fullName: 'Full name',
  mobileNumber: 'Mobile number',
  skillsComma: 'Skills, comma separated',
  resumeTitle: 'Resume builder',
  resumeSubtitle: 'Resume banao, preview karo, update karo',
  resumePreview: 'Resume preview',
  resumeSuggestions: 'Resume suggestions',
  newJobAlert: 'Naya job alert',
  jobAlertCopy: 'roles aapki current search se match karte hain',
  applicationUpdate: 'Application update',
  applicationUpdateCopy: 'applied jobs track ho rahe hain',
  profileReminder: 'Profile reminder',
  profileReminderCopy: 'Better matching ke liye profile complete karo',
  now: 'Abhi',
  today: 'Aaj',
  downloadPdf: 'PDF download karo',
  saveResume: 'Resume save karo',
  resumeSaved: 'Resume details update ho gayi.',
})

Object.assign(translations.English, {
  welcomeBack: 'Welcome back',
  loginSubtitle: 'Sign in to continue your career journey',
  candidateAccess: 'Candidate access',
  register: 'Register',
  createAccount: 'Create account',
  password: 'Password',
  apiFinePrint: 'The same backend authentication API configured on the website is being used.',
  recommendedJobs: 'Recommended jobs',
  recentJobs: 'Recent jobs',
  seeAll: 'See all',
  profileCompletionLabel: 'Profile completion',
  liveJobs: 'Live jobs',
  applied: 'Applied',
  findJobs: 'Find jobs',
  findJobsSubtitle: 'Search by title, company, and location',
  filters: 'Filters',
  noJobsFound: 'No jobs found',
  noJobsCopy: 'Change search or filter and try again.',
  jobDetails: 'Job details',
  save: 'Save',
  fullJobDescription: 'Full job description',
  skillsRequired: 'Skills required',
  companyDetails: 'Company details',
  applyNow: 'Apply now',
  details: 'Details',
  apply: 'Apply',
  searchPlaceholder: 'Job title, company, location',
  loginSuccess: 'Login successful. App is connected to the live API.',
  loginRequiredApply: 'Candidate login is required to apply.',
  alreadyApplied: 'You have already applied to this job.',
  applicationSubmitted: 'Application submitted successfully.',
  applicationSavedLocal: 'API failed. Application saved locally.',
  loggedOut: 'You have been logged out.',
  profileSaved: 'Profile updated successfully.',
  languageSaved: 'Language set to',
  notificationsClearedMessage: 'Notifications cleared.',
  supportSaved: 'Support request saved. Our team will contact you soon.',
  avatarUpdated: 'Profile image updated.',
  uploadPhoto: 'Upload profile photo',
  editSection: 'Edit',
  remote: 'Remote',
  fullTime: 'Full time',
  freshRoles: 'Fresh roles',
  customerCare: 'Customer care',
  callNow: 'Tap to call',
  refresh: 'Refresh',
  syncing: 'Syncing',
  reviewPending: 'Recruiter review pending',
  reviewedMessage: 'Application reviewed by recruiter',
  shortlistedMessage: 'You have been shortlisted',
  interviewMessage: 'Interview stage started',
  selectedMessage: 'Congratulations, you are selected',
  rejectedMessage: 'Application rejected',
  approvedMessage: 'Application approved',
})

Object.assign(translations.Hindi, {
  welcomeBack: '\u0935\u093e\u092a\u0938 \u0938\u094d\u0935\u093e\u0917\u0924 \u0939\u0948',
  loginSubtitle: '\u0905\u092a\u0928\u0940 \u0915\u0930\u093f\u092f\u0930 \u092f\u093e\u0924\u094d\u0930\u093e \u091c\u093e\u0930\u0940 \u0930\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0938\u093e\u0907\u0928 \u0907\u0928 \u0915\u0930\u0947\u0902',
  candidateAccess: '\u0909\u092e\u094d\u092e\u0940\u0926\u0935\u093e\u0930 \u090f\u0915\u094d\u0938\u0947\u0938',
  register: '\u0930\u091c\u093f\u0938\u094d\u091f\u0930',
  createAccount: '\u0916\u093e\u0924\u093e \u092c\u0928\u093e\u090f\u0902',
  password: '\u092a\u093e\u0938\u0935\u0930\u094d\u0921',
  apiFinePrint: '\u0935\u0947\u092c\u0938\u093e\u0907\u091f \u092e\u0947\u0902 \u0915\u0949\u0928\u094d\u092b\u093f\u0917\u0930 \u0915\u093f\u092f\u093e \u0917\u092f\u093e \u0935\u0939\u0940 \u092c\u0948\u0915\u090f\u0902\u0921 \u0911\u0925 API \u0909\u092a\u092f\u094b\u0917 \u0939\u094b \u0930\u0939\u093e \u0939\u0948.',
  recommendedJobs: '\u0938\u0941\u091d\u093e\u0908 \u0917\u0908 \u0928\u094c\u0915\u0930\u093f\u092f\u093e\u0902',
  recentJobs: '\u0939\u093e\u0932 \u0915\u0940 \u0928\u094c\u0915\u0930\u093f\u092f\u093e\u0902',
  seeAll: '\u0938\u092d\u0940 \u0926\u0947\u0916\u0947\u0902',
  profileCompletionLabel: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u092a\u0942\u0930\u094d\u0923\u0924\u093e',
  liveJobs: '\u0932\u093e\u0907\u0935 \u0928\u094c\u0915\u0930\u093f\u092f\u093e\u0902',
  applied: '\u0906\u0935\u0947\u0926\u093f\u0924',
  findJobs: '\u0928\u094c\u0915\u0930\u093f\u092f\u093e\u0902 \u0916\u094b\u091c\u0947\u0902',
  findJobsSubtitle: '\u091f\u093e\u0907\u091f\u0932, \u0915\u0902\u092a\u0928\u0940 \u0914\u0930 \u0938\u094d\u0925\u093e\u0928 \u0938\u0947 \u0916\u094b\u091c\u0947\u0902',
  filters: '\u092b\u093f\u0932\u094d\u091f\u0930',
  noJobsFound: '\u0915\u094b\u0908 \u0928\u094c\u0915\u0930\u0940 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940',
  noJobsCopy: '\u0916\u094b\u091c \u092f\u093e \u092b\u093f\u0932\u094d\u091f\u0930 \u092c\u0926\u0932\u0915\u0930 \u0926\u094b\u092c\u093e\u0930\u093e \u0915\u094b\u0936\u093f\u0936 \u0915\u0930\u0947\u0902.',
  jobDetails: '\u0928\u094c\u0915\u0930\u0940 \u0935\u093f\u0935\u0930\u0923',
  save: '\u0938\u0947\u0935',
  fullJobDescription: '\u092a\u0942\u0930\u093e \u091c\u0949\u092c \u0935\u093f\u0935\u0930\u0923',
  skillsRequired: '\u091c\u0930\u0942\u0930\u0940 \u0915\u094c\u0936\u0932',
  companyDetails: '\u0915\u0902\u092a\u0928\u0940 \u0935\u093f\u0935\u0930\u0923',
  applyNow: '\u0905\u092d\u0940 \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902',
  details: '\u0935\u093f\u0935\u0930\u0923',
  apply: '\u0906\u0935\u0947\u0926\u0928',
  searchPlaceholder: '\u091c\u0949\u092c \u091f\u093e\u0907\u091f\u0932, \u0915\u0902\u092a\u0928\u0940, \u0938\u094d\u0925\u093e\u0928',
  loginSuccess: '\u0932\u0949\u0917\u093f\u0928 \u0938\u092b\u0932 \u0939\u0941\u0906. \u090f\u092a \u0932\u093e\u0907\u0935 API \u0938\u0947 \u0915\u0928\u0947\u0915\u094d\u091f \u0939\u0948.',
  loginRequiredApply: '\u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0909\u092e\u094d\u092e\u0940\u0926\u0935\u093e\u0930 \u0932\u0949\u0917\u093f\u0928 \u091c\u0930\u0942\u0930\u0940 \u0939\u0948.',
  alreadyApplied: '\u0906\u092a \u0907\u0938 \u0928\u094c\u0915\u0930\u0940 \u092a\u0930 \u092a\u0939\u0932\u0947 \u0939\u0940 \u0906\u0935\u0947\u0926\u0928 \u0915\u0930 \u091a\u0941\u0915\u0947 \u0939\u0948\u0902.',
  applicationSubmitted: '\u0906\u0935\u0947\u0926\u0928 \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u091c\u092e\u093e \u0939\u094b \u0917\u092f\u093e.',
  applicationSavedLocal: 'API \u0935\u093f\u092b\u0932 \u0939\u0941\u0908. \u0906\u0935\u0947\u0926\u0928 \u0932\u094b\u0915\u0932 \u0930\u0942\u092a \u0938\u0947 \u0938\u0947\u0935 \u0939\u094b \u0917\u092f\u093e.',
  loggedOut: '\u0906\u092a \u0932\u0949\u0917\u0906\u0909\u091f \u0939\u094b \u0917\u090f.',
  profileSaved: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0938\u092b\u0932\u0924\u093e\u092a\u0942\u0930\u094d\u0935\u0915 \u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0917\u0908.',
  languageSaved: '\u092d\u093e\u0937\u093e \u0938\u0947\u091f \u0939\u094b \u0917\u0908',
  notificationsClearedMessage: '\u0938\u0942\u091a\u0928\u093e\u090f\u0902 \u0938\u093e\u092b \u0939\u094b \u0917\u0908\u0902.',
  supportSaved: '\u0938\u092a\u094b\u0930\u094d\u091f \u0930\u093f\u0915\u094d\u0935\u0947\u0938\u094d\u091f \u0938\u0947\u0935 \u0939\u094b \u0917\u0908. \u091f\u0940\u092e \u091c\u0932\u094d\u0926 \u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u0947\u0917\u0940.',
  avatarUpdated: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0907\u092e\u0947\u091c \u0905\u092a\u0921\u0947\u091f \u0939\u094b \u0917\u0908.',
  uploadPhoto: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u092b\u094b\u091f\u094b \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u0947\u0902',
  editSection: '\u0938\u0902\u092a\u093e\u0926\u093f\u0924',
  remote: '\u0930\u093f\u092e\u094b\u091f',
  fullTime: '\u092b\u0941\u0932 \u091f\u093e\u0907\u092e',
  freshRoles: '\u0928\u0908 \u092d\u0942\u092e\u093f\u0915\u093e\u090f\u0902',
  customerCare: '\u0915\u0938\u094d\u091f\u092e\u0930 \u0915\u0947\u092f\u0930',
  callNow: '\u0915\u0949\u0932 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u091f\u0948\u092a \u0915\u0930\u0947\u0902',
  refresh: '\u0930\u093f\u092b\u094d\u0930\u0947\u0936',
  syncing: '\u0938\u093f\u0902\u0915 \u0939\u094b \u0930\u0939\u093e \u0939\u0948',
  reviewPending: '\u092d\u0930\u094d\u0924\u0940\u0915\u0930\u094d\u0924\u093e \u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0932\u0902\u092c\u093f\u0924 \u0939\u0948',
  reviewedMessage: '\u0906\u0935\u0947\u0926\u0928 \u0915\u0940 \u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0939\u094b \u0917\u0908',
  shortlistedMessage: '\u0906\u092a \u0936\u0949\u0930\u094d\u091f\u0932\u093f\u0938\u094d\u091f \u0939\u094b \u0917\u090f \u0939\u0948\u0902',
  interviewMessage: '\u0907\u0902\u091f\u0930\u0935\u094d\u092f\u0942 \u0938\u094d\u091f\u0947\u091c \u0936\u0941\u0930\u0942 \u0939\u094b \u0917\u092f\u093e',
  selectedMessage: '\u092c\u0927\u093e\u0908 \u0939\u094b, \u0906\u092a \u091a\u092f\u0928\u093f\u0924 \u0939\u0948\u0902',
  rejectedMessage: '\u0906\u0935\u0947\u0926\u0928 \u0905\u0938\u094d\u0935\u0940\u0915\u093e\u0930 \u0939\u094b \u0917\u092f\u093e',
  approvedMessage: '\u0906\u0935\u0947\u0926\u0928 \u0938\u094d\u0935\u0940\u0915\u0943\u0924 \u0939\u094b \u0917\u092f\u093e',
})

Object.assign(translations.Hinglish, {
  welcomeBack: 'Welcome back',
  loginSubtitle: 'Career journey continue karne ke liye sign in karo',
  candidateAccess: 'Candidate access',
  register: 'Register',
  createAccount: 'Account banao',
  password: 'Password',
  apiFinePrint: 'Website wali same backend auth API use ho rahi hai.',
  recommendedJobs: 'Recommended jobs',
  recentJobs: 'Recent jobs',
  seeAll: 'Sab dekho',
  profileCompletionLabel: 'Profile completion',
  liveJobs: 'Live jobs',
  applied: 'Applied',
  findJobs: 'Jobs dhundo',
  findJobsSubtitle: 'Title, company aur location se search karo',
  filters: 'Filters',
  noJobsFound: 'Jobs nahi mili',
  noJobsCopy: 'Search ya filter change karke dobara try karo.',
  jobDetails: 'Job details',
  save: 'Save',
  fullJobDescription: 'Full job description',
  skillsRequired: 'Skills required',
  companyDetails: 'Company details',
  applyNow: 'Apply now',
  details: 'Details',
  apply: 'Apply',
  searchPlaceholder: 'Job title, company, location',
  loginSuccess: 'Login successful. App live API se connected hai.',
  loginRequiredApply: 'Apply karne ke liye candidate login required hai.',
  alreadyApplied: 'Is job par aap already apply kar chuke hain.',
  applicationSubmitted: 'Application submit ho gayi.',
  applicationSavedLocal: 'API fail hui. Application local tracking me save kar di.',
  loggedOut: 'Logout ho gaya.',
  profileSaved: 'Profile update ho gayi.',
  languageSaved: 'Language set ho gayi',
  notificationsClearedMessage: 'Notifications clear ho gayi.',
  supportSaved: 'Support request save ho gayi. Team jaldi contact karegi.',
  avatarUpdated: 'Profile image update ho gayi.',
  uploadPhoto: 'Profile photo upload karo',
  editSection: 'Edit',
  remote: 'Remote',
  fullTime: 'Full time',
  freshRoles: 'Fresh roles',
  customerCare: 'Customer care',
  callNow: 'Call karne ke liye tap karo',
  refresh: 'Refresh',
  syncing: 'Sync ho raha hai',
  reviewPending: 'Recruiter review pending hai',
  reviewedMessage: 'Recruiter ne application review kar li',
  shortlistedMessage: 'Aap shortlisted ho gaye',
  interviewMessage: 'Interview stage start ho gaya',
  selectedMessage: 'Congratulations, aap selected hain',
  rejectedMessage: 'Application reject ho gayi',
  approvedMessage: 'Application approve ho gayi',
})

const profileSuggestions = {
  English: {
    education: ['B.Tech Computer Science', 'BCA - Bachelor of Computer Applications', 'MBA Human Resources', '12th Pass with Computer Diploma'],
    experience: ['Fresher - ready for internship or entry level role', '1-2 years in customer support and operations', '3-5 years in React and frontend development', '5+ years in team handling and delivery'],
    skills: ['React', 'JavaScript', 'Node.js', 'Communication', 'Excel', 'Sales', 'Customer Support', 'Digital Marketing'],
    summary: ['Motivated candidate with strong communication skills and a quick learning mindset.', 'Frontend developer focused on responsive UI, API integration, and clean user experiences.', 'Operations professional experienced in coordination, reporting, and customer handling.'],
  },
  Hindi: {
    education: ['B.Tech \u0915\u0902\u092a\u094d\u092f\u0942\u091f\u0930 \u0938\u093e\u0907\u0902\u0938', 'BCA - \u092c\u0948\u091a\u0932\u0930 \u0911\u092b \u0915\u0902\u092a\u094d\u092f\u0942\u091f\u0930 \u090f\u092a\u094d\u0932\u093f\u0915\u0947\u0936\u0928', 'MBA \u092e\u093e\u0928\u0935 \u0938\u0902\u0938\u093e\u0927\u0928', '12\u0935\u0940\u0902 \u092a\u093e\u0938 \u0915\u0902\u092a\u094d\u092f\u0942\u091f\u0930 \u0921\u093f\u092a\u094d\u0932\u094b\u092e\u093e \u0915\u0947 \u0938\u093e\u0925'],
    experience: ['\u092b\u094d\u0930\u0947\u0936\u0930 - \u0907\u0902\u091f\u0930\u094d\u0928\u0936\u093f\u092a \u092f\u093e \u090f\u0902\u091f\u094d\u0930\u0940 \u0932\u0947\u0935\u0932 \u092d\u0942\u092e\u093f\u0915\u093e \u0915\u0947 \u0932\u093f\u090f \u0924\u0948\u092f\u093e\u0930', '1-2 \u0935\u0930\u094d\u0937 \u0915\u0938\u094d\u091f\u092e\u0930 \u0938\u092a\u094b\u0930\u094d\u091f \u0914\u0930 \u0911\u092a\u0930\u0947\u0936\u0928 \u092e\u0947\u0902', '3-5 \u0935\u0930\u094d\u0937 React \u0914\u0930 \u092b\u094d\u0930\u0902\u091f\u090f\u0902\u0921 \u0921\u0947\u0935\u0932\u092a\u092e\u0947\u0902\u091f \u092e\u0947\u0902', '5+ \u0935\u0930\u094d\u0937 \u091f\u0940\u092e \u0939\u0948\u0902\u0921\u0932\u093f\u0902\u0917 \u0914\u0930 \u0921\u093f\u0932\u093f\u0935\u0930\u0940 \u092e\u0947\u0902'],
    skills: ['React', 'JavaScript', 'Node.js', '\u0938\u0902\u091a\u093e\u0930', 'Excel', '\u0938\u0947\u0932\u094d\u0938', '\u0915\u0938\u094d\u091f\u092e\u0930 \u0938\u092a\u094b\u0930\u094d\u091f', '\u0921\u093f\u091c\u093f\u091f\u0932 \u092e\u093e\u0930\u094d\u0915\u0947\u091f\u093f\u0902\u0917'],
    summary: ['\u092e\u091c\u092c\u0942\u0924 \u0938\u0902\u091a\u093e\u0930 \u0915\u094c\u0936\u0932 \u0914\u0930 \u091c\u0932\u094d\u0926\u0940 \u0938\u0940\u0916\u0928\u0947 \u0915\u0940 \u0915\u094d\u0937\u092e\u0924\u093e \u0935\u093e\u0932\u093e \u092a\u094d\u0930\u0947\u0930\u093f\u0924 \u0909\u092e\u094d\u092e\u0940\u0926\u0935\u093e\u0930.', '\u0930\u093f\u0938\u094d\u092a\u0949\u0928\u094d\u0938\u093f\u0935 UI, API integration \u0914\u0930 \u0938\u093e\u092b user experience \u092a\u0930 \u0927\u094d\u092f\u093e\u0928 \u0926\u0947\u0928\u0947 \u0935\u093e\u0932\u093e frontend developer.', '\u0938\u092e\u0928\u094d\u0935\u092f, \u0930\u093f\u092a\u094b\u0930\u094d\u091f\u093f\u0902\u0917 \u0914\u0930 \u0915\u0938\u094d\u091f\u092e\u0930 \u0939\u0948\u0902\u0921\u0932\u093f\u0902\u0917 \u092e\u0947\u0902 \u0905\u0928\u0941\u092d\u0935\u0940 \u0911\u092a\u0930\u0947\u0936\u0928 \u092a\u094d\u0930\u094b\u092b\u0947\u0936\u0928\u0932.'],
  },
  Hinglish: {
    education: ['B.Tech Computer Science', 'BCA - Computer Applications', 'MBA Human Resources', '12th pass with computer diploma'],
    experience: ['Fresher - internship ya entry level role ke liye ready', '1-2 years customer support aur operations me', '3-5 years React aur frontend development me', '5+ years team handling aur delivery me'],
    skills: ['React', 'JavaScript', 'Node.js', 'Communication', 'Excel', 'Sales', 'Customer Support', 'Digital Marketing'],
    summary: ['Strong communication aur quick learning mindset wala motivated candidate.', 'Frontend developer jo responsive UI, API integration aur clean UX par focus karta hai.', 'Operations professional jise coordination, reporting aur customer handling ka experience hai.'],
  },
}

translations.Hindi = { ...translations.English }
translations.Hinglish = { ...translations.English }
profileSuggestions.Hindi = { ...profileSuggestions.English }
profileSuggestions.Hinglish = { ...profileSuggestions.English }

function translate(language, key) {
  return translations[language]?.[key] || translations.English[key] || key
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('mobileTheme') || 'light')
  const [activeScreen, setActiveScreen] = useState('home')
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [user, setUser] = useState(() => getStoredUser())
  const [query, setQuery] = useState('')
  const [workMode, setWorkMode] = useState('All')
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [language, setLanguage] = useState(() => localStorage.getItem('mobileLanguage') || 'English')
  const [notificationsCleared, setNotificationsCleared] = useState(() => localStorage.getItem('mobileNotificationsCleared') === 'true')
  const [branding, setBranding] = useState({ name: 'Cromgen Jobs', logoUrl: '/cromgen-rozgar-logo.png', tollFreeNumber: fallbackCustomerCareNumber })
  const isDark = theme === 'dark'
  const t = useMemo(() => (key) => translate(language, key), [language])

  useEffect(() => {
    localStorage.setItem('mobileTheme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('mobileLanguage', language)
  }, [language])

  useEffect(() => {
    let active = true

    async function loadInitialData() {
      setLoading(true)
      setError('')
      try {
        const [jobsPayload, brandingPayload] = await Promise.all([
          api.jobs('?sort=-createdAt&limit=100'),
          api.publicSiteBranding().catch(() => null),
        ])

        if (!active) return
        const nextJobs = Array.isArray(jobsPayload.data) && jobsPayload.data.length ? jobsPayload.data : fallbackJobs
        setJobs(nextJobs)
        setSelectedJob((current) => current || nextJobs[0] || null)

        setBranding(normalizeBrandingPayload(brandingPayload))
      } catch (loadError) {
        if (!active) return
        setJobs(fallbackJobs)
        setSelectedJob(fallbackJobs[0])
        setError(`${loadError.message}. Showing demo data until the API is available.`)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadInitialData()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const refreshBranding = async () => {
      try {
        const payload = await api.publicSiteBranding()
        if (active) setBranding(normalizeBrandingPayload(payload))
      } catch {
        // Keep the last known branding if the backend is temporarily unavailable.
      }
    }

    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') refreshBranding()
    }

    const intervalId = window.setInterval(refreshBranding, 10000)
    window.addEventListener('focus', refreshBranding)
    document.addEventListener('visibilitychange', refreshOnVisible)

    return () => {
      active = false
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshBranding)
      document.removeEventListener('visibilitychange', refreshOnVisible)
    }
  }, [])

  const loadApplications = useCallback(async ({ silent = false } = {}) => {
    if (!user?.email) {
      setApplications([])
      return
    }

    const localApplications = getLocalApplications(user.email)

    if (getAuthToken().startsWith('local-')) {
      setApplications(localApplications)
      return
    }

    if (!silent) setApplicationsLoading(true)
    try {
      const payload = await api.applicationsByCandidate(user.email)
      const remoteApplications = Array.isArray(payload.data) ? payload.data : []
      const mergedApplications = mergeApplications(remoteApplications, localApplications)
      setApplications(mergedApplications)
      saveLocalApplications(user.email, mergedApplications)
    } catch {
      setApplications(localApplications)
    } finally {
      if (!silent) setApplicationsLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  useEffect(() => {
    if (activeScreen !== 'applications' || !user?.email) return undefined

    loadApplications({ silent: true })
    const intervalId = window.setInterval(() => loadApplications({ silent: true }), 8000)
    const refreshOnFocus = () => loadApplications({ silent: true })
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') loadApplications({ silent: true })
    }

    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnVisible)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnVisible)
    }
  }, [activeScreen, loadApplications, user?.email])

  const activeTab = useMemo(() => {
    if (['jobs', 'details'].includes(activeScreen)) return 'jobs'
    if (activeScreen === 'resume') return 'profile'
    if (activeScreen === 'notifications') return 'home'
    return tabs.some((tab) => tab.id === activeScreen) ? activeScreen : 'home'
  }, [activeScreen])

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return jobs.filter((job) => {
      const haystack = [job.title, job.company, job.location, job.salary, job.experience, job.type, job.workMode, job.mode, ...(job.skills || [])].join(' ').toLowerCase()
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery)
      const matchesMode = workMode === 'All' || (job.workMode || job.mode || '').toLowerCase() === workMode.toLowerCase()
      return matchesQuery && matchesMode
    })
  }, [jobs, query, workMode])

  const openDetails = (job) => {
    setSelectedJob(job)
    setActiveScreen('details')
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(''), 3200)
  }

  const handleAuthSuccess = (nextUser) => {
    setUser(nextUser)
    setActiveScreen('home')
    showToast(t('loginSuccess'), 'success')
  }

  const handleApply = async (job) => {
    if (!user?.email) {
      setActiveScreen('login')
      showToast(t('loginRequiredApply'), 'warning')
      return
    }

    if (applications.some((application) => isSameAppliedJob(application, job))) {
      setActiveScreen('applications')
      showToast(t('alreadyApplied'), 'warning')
      return
    }

    const applicationPayload = {
      jobId: job._id || job.id,
      recruiterEmail: job.recruiterEmail || '',
      recruiterName: job.recruiterName || '',
      candidateName: user.name || user.fullName || 'Candidate',
      candidateEmail: user.email,
      candidatePhone: user.phone || user.mobile || '',
      jobTitle: job.title,
      company: job.company,
      resumeUrl: user.resumeUrl || user.resumeName || '',
      status: 'New',
    }

    try {
      const payload = await api.createApplication(applicationPayload)
      const saved = payload.data || { ...applicationPayload, _id: `local-${Date.now()}`, createdAt: new Date().toISOString() }
      setApplications((current) => [saved, ...current])
      saveLocalApplication(user.email, saved)
      setActiveScreen('applications')
      showToast(t('applicationSubmitted'), 'success')
      window.setTimeout(() => loadApplications({ silent: true }), 800)
    } catch (applyError) {
      const saved = { ...applicationPayload, _id: `local-${Date.now()}`, createdAt: new Date().toISOString(), offline: true }
      setApplications((current) => [saved, ...current])
      saveLocalApplication(user.email, saved)
      setActiveScreen('applications')
      showToast(t('applicationSavedLocal'), 'warning')
    }
  }

  const logout = () => {
    clearAuthSession()
    setUser(null)
    setApplications([])
    setActiveScreen('login')
    showToast(t('loggedOut'), 'danger')
  }

  const saveProfile = (profile) => {
    const nextUser = { ...(user || {}), ...profile, role: user?.role || 'Candidate' }
    setUser(nextUser)
    localStorage.setItem('authUser', JSON.stringify(nextUser))
    setActiveScreen('profile')
    showToast(t('profileSaved'), 'success')
  }

  const saveLanguage = (nextLanguage) => {
    setLanguage(nextLanguage)
    showToast(`${translate(nextLanguage, 'languageSaved')}: ${nextLanguage}`, 'success')
  }

  const clearNotifications = () => {
    localStorage.setItem('mobileNotificationsCleared', 'true')
    setNotificationsCleared(true)
    showToast(t('notificationsClearedMessage'), 'success')
  }

  const updateAvatar = (avatarUrl) => {
    saveProfile({ avatarUrl })
    showToast(t('avatarUpdated'), 'success')
  }

  return (
    <main className={`app-shell ${isDark ? 'dark' : ''}`}>
      <section className="showcase-panel">
        <div>
          <p className="eyebrow">Live candidate mobile app</p>
          <h1>{branding.name}</h1>
          <p className="showcase-copy">
            Jobs, applications, login, branding, and candidate flows are connected through the same website API.
          </p>
        </div>
        <div className="screen-switcher" aria-label="Mobile app screens">
          {screenOptions.map(([id, label]) => (
            <button className={activeScreen === id ? 'active' : ''} key={id} onClick={() => setActiveScreen(id)} type="button">
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="phone-frame" aria-label="Cromgen Jobs mobile app preview">
        <div className="phone">
          <div className="phone-screen">
            {toast && <div className={`mobile-toast ${toast.type || 'info'}`}>{toast.message || toast}</div>}
            {activeScreen === 'splash' && <SplashScreen branding={branding} onContinue={() => setActiveScreen(user?.email ? 'home' : 'login')} />}
            {activeScreen === 'login' && <LoginScreen branding={branding} t={t} theme={theme} onAuthSuccess={handleAuthSuccess} onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')} />}
            {activeScreen === 'home' && (
              <HomeScreen
                applications={applications}
                error={error}
                jobs={filteredJobs}
                loading={loading}
                onOpenDetails={openDetails}
                onOpenNotifications={() => setActiveScreen('notifications')}
                onOpenJobs={() => setActiveScreen('jobs')}
                query={query}
                setQuery={setQuery}
                setWorkMode={setWorkMode}
                t={t}
                user={user}
              />
            )}
            {activeScreen === 'jobs' && (
              <JobsScreen
                jobs={filteredJobs}
                loading={loading}
                onApply={handleApply}
                onOpenDetails={openDetails}
                query={query}
                setQuery={setQuery}
                setWorkMode={setWorkMode}
                t={t}
                workMode={workMode}
              />
            )}
            {activeScreen === 'details' && <DetailsScreen job={selectedJob || filteredJobs[0]} onApply={handleApply} t={t} />}
            {activeScreen === 'applications' && <ApplicationsScreen applications={applications} loading={applicationsLoading} onRefresh={() => loadApplications()} t={t} user={user} />}
            {activeScreen === 'profile' && <ProfileScreen onAvatarChange={updateAvatar} onEdit={() => setActiveScreen('edit-profile')} onOpenResume={() => setActiveScreen('resume')} t={t} user={user} />}
            {activeScreen === 'resume' && <ResumeScreen language={language} onSave={saveProfile} t={t} user={user} />}
            {activeScreen === 'notifications' && <NotificationsScreen applications={applications} cleared={notificationsCleared} jobs={jobs} onClear={clearNotifications} t={t} />}
            {activeScreen === 'settings' && (
              <SettingsScreen
                language={language}
                onLogout={logout}
                onNavigate={setActiveScreen}
                onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
                branding={branding}
                t={t}
                theme={theme}
                user={user}
              />
            )}
            {activeScreen === 'edit-profile' && <EditProfileScreen language={language} onBack={() => setActiveScreen('profile')} onSave={saveProfile} t={t} user={user} />}
            {activeScreen === 'language' && <LanguageScreen language={language} onBack={() => setActiveScreen('settings')} onSelect={saveLanguage} t={t} />}
            {activeScreen === 'help' && <HelpSupportScreen onBack={() => setActiveScreen('settings')} onSubmit={showToast} t={t} user={user} />}
            {activeScreen === 'privacy' && <PrivacySecurityScreen onBack={() => setActiveScreen('settings')} user={user} />}
          </div>
          <BottomNav activeTab={activeTab} onChange={setActiveScreen} t={t} />
        </div>
      </section>
    </main>
  )
}

function BottomNav({ activeTab, onChange, t }) {
  return (
    <nav className="bottom-nav" aria-label="Candidate app navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => onChange(tab.id)} type="button">
            <Icon size={20} />
            <span>{t(tab.labelKey) || tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function SplashScreen({ branding, onContinue }) {
  return (
    <Screen className="splash-screen">
      <div className="splash-orbit">
        <div className="logo-mark">CR</div>
      </div>
      <img className="brand-logo-image" src={branding.logoUrl} alt={`${branding.name} logo`} />
      <div className="splash-copy">
        <h2>{branding.name}</h2>
        <p>Find Your Next Career Opportunity</p>
      </div>
      <div className="loading-track">
        <span />
      </div>
      <button className="primary-button splash-action" onClick={onContinue} type="button">
        Continue
      </button>
    </Screen>
  )
}

function LoginScreen({ branding, t, theme, onAuthSuccess, onThemeToggle }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', name: '', password: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const payload =
        mode === 'login'
          ? await api.login({ email: form.email, password: form.password })
          : await api.register({ name: form.name, email: form.email, password: form.password, phone: form.phone, role: 'Candidate' })
      const session = saveAuthSession(payload)
      onAuthSuccess(session.user || { name: form.name, email: form.email, phone: form.phone, role: 'Candidate' })
    } catch (error) {
      setMessage(error.message || 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen className="login-screen">
      <div className="login-topbar">
        <span>{t('candidateAccess')}</span>
        <ThemeButton theme={theme} onClick={onThemeToggle} />
      </div>
      <section className="login-brand-panel">
        <div className="login-logo-frame">
          <img src={branding.logoUrl} alt={`${branding.name} logo`} />
        </div>
        <div className="login-brand-copy">
          <p>{branding.name}</p>
          <h2>{mode === 'login' ? t('welcomeBack') : t('createAccount')}</h2>
          <span>{t('loginSubtitle')}</span>
        </div>
      </section>
      <Card className="auth-card login-card">
        <div className="segment-control">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">{t('login')}</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">{t('register')}</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <input name="name" onChange={updateForm} placeholder={t('fullName')} required type="text" value={form.name} />
          )}
          <input name="email" onChange={updateForm} placeholder={t('email')} required type="email" value={form.email} />
          {mode === 'register' && (
            <input name="phone" onChange={updateForm} placeholder={t('mobileNumber')} type="tel" value={form.phone} />
          )}
          <input name="password" onChange={updateForm} placeholder={t('password')} required type="password" value={form.password} />
          {message && <p className="form-error"><AlertCircle size={15} /> {message}</p>}
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}
            {mode === 'login' ? t('login') : t('createAccount')}
          </button>
        </form>
      </Card>
      <p className="fine-print">{t('apiFinePrint')}</p>
    </Screen>
  )
}

function HomeScreen({ applications, error, jobs, loading, onOpenDetails, onOpenJobs, onOpenNotifications, query, setQuery, setWorkMode, t, user }) {
  const featuredJobs = jobs.filter((job) => job.featured).slice(0, 3)
  const profileCompletion = user?.email ? 82 : 35

  return (
    <Screen>
      <Header
        title={`Hi, ${getFirstName(user)}`}
        subtitle={`${jobs.length} recommended jobs available`}
        action={
          <button className="icon-button" onClick={onOpenNotifications} type="button" aria-label="Open notifications">
            <Bell size={20} />
          </button>
        }
      />
      {error && <InlineNotice message={error} />}
      <SearchPanel
        onQuickFilter={(filter) => {
          if (filter === 'remote') {
            setWorkMode('Remote')
            setQuery('')
          } else if (filter === 'full-time') {
            setWorkMode('All')
            setQuery('Full Time')
          } else {
            setWorkMode('All')
            setQuery('')
          }
          onOpenJobs()
        }}
        query={query}
        setQuery={setQuery}
        t={t}
      />
      <Card className="progress-card">
        <div>
          <p className="muted">{t('profileCompletionLabel')}</p>
          <h3>{profileCompletion}% complete</h3>
        </div>
        <div className="progress-ring">{profileCompletion}%</div>
        <div className="progress-line">
          <span style={{ width: `${profileCompletion}%` }} />
        </div>
      </Card>
      <MetricGrid jobs={jobs} applications={applications} t={t} />
      <SectionTitle title={t('recommendedJobs')} action={t('seeAll')} />
      {loading ? <LoadingCards /> : (
        <div className="horizontal-list">
          {(featuredJobs.length ? featuredJobs : jobs).slice(0, 4).map((job) => (
            <MiniJobCard job={job} key={job._id || job.title} onOpenDetails={() => onOpenDetails(job)} />
          ))}
        </div>
      )}
      <SectionTitle title={t('recentJobs')} />
      {jobs.slice(0, 3).map((job) => (
        <JobCard job={job} key={job._id || job.title} compact onOpenDetails={() => onOpenDetails(job)} t={t} />
      ))}
    </Screen>
  )
}

function JobsScreen({ jobs, loading, onApply, onOpenDetails, query, setQuery, setWorkMode, t, workMode }) {
  return (
    <Screen>
      <Header title={t('findJobs')} subtitle={t('findJobsSubtitle')} action={<IconPill icon={Filter} label={t('filters')} />} />
      <SearchPanel compact query={query} setQuery={setQuery} t={t} />
      <div className="filter-row">
        {['All', 'Remote', 'Hybrid', 'On-site'].map((filter) => (
          <button className={workMode === filter ? 'active' : ''} key={filter} onClick={() => setWorkMode(filter)} type="button">{filter}</button>
        ))}
      </div>
      {loading ? <LoadingCards /> : jobs.length ? jobs.map((job) => (
        <JobCard job={job} key={job._id || job.title} onApply={() => onApply(job)} onOpenDetails={() => onOpenDetails(job)} t={t} />
      )) : <EmptyState title={t('noJobsFound')} copy={t('noJobsCopy')} />}
    </Screen>
  )
}

function DetailsScreen({ job, onApply, t }) {
  if (!job) return <Screen><EmptyState title={t('noJobsFound')} copy={t('noJobsCopy')} /></Screen>

  return (
    <Screen>
      <Header title={t('jobDetails')} subtitle={job.title} action={<IconPill icon={Bookmark} label={t('save')} />} />
      <Card className="details-hero">
        <div className="company-logo">{getCompanyInitials(job.company)}</div>
        <div>
          <h2>{job.title}</h2>
          <p>{job.company}</p>
        </div>
        <div className="details-meta">
          <span><MapPin size={14} /> {job.location}</span>
          <span><WalletCards size={14} /> {job.salary || 'Salary undisclosed'}</span>
          <span><Clock3 size={14} /> {job.experience || 'Experience flexible'}</span>
        </div>
      </Card>
      <ContentBlock title={t('fullJobDescription')}>{job.description || t('fullJobDescription')}</ContentBlock>
      <ContentBlock title={t('skillsRequired')}>
        <div className="skill-cloud">
          {(job.skills?.length ? job.skills : ['Communication', 'Ownership', 'Role fit']).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </ContentBlock>
      <ContentBlock title={t('companyDetails')}>{job.aboutCompany || `${job.company} - ${job.title}`}</ContentBlock>
      <button className="primary-button sticky-action" onClick={() => onApply(job)} type="button">
        <Send size={18} />
        {t('applyNow')}
      </button>
    </Screen>
  )
}

function ApplicationsScreen({ applications, loading, onRefresh, t, user }) {
  return (
    <Screen>
      <Header
        title={t('applicationsTitle')}
        subtitle={user?.email ? t('applicationsSubtitle') : t('loginApplicationsSubtitle')}
        action={<button className="icon-pill" disabled={loading} onClick={onRefresh} type="button">{loading ? t('syncing') : t('refresh')}</button>}
      />
      {loading ? <LoadingCards /> : applications.length ? applications.map((application) => {
        const status = normalizeApplicationStatus(application.status)
        const steps = getApplicationTimelineSteps(status)
        const currentStep = Math.max(0, steps.indexOf(status))
        const statusMessage = getApplicationStatusMessage(application, t)
        return (
          <Card className="application-card" key={application._id || `${application.jobTitle}-${application.company}`}>
            <div className="card-header">
              <div>
                <h3>{application.jobTitle}</h3>
                <p>{application.company}</p>
              </div>
              <span className={`status-badge ${status.toLowerCase()}`}>{application.offline ? 'Saved' : status}</span>
            </div>
            <div className="tracker" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
              {steps.map((step, index) => (
                <div className={`${index <= currentStep ? 'done' : ''} ${step === 'Rejected' && index <= currentStep ? 'rejected' : ''}`} key={step}>
                  <span>{index <= currentStep ? <Check size={12} /> : index + 1}</span>
                  <small>{step}</small>
                </div>
              ))}
            </div>
            <div className="info-list">
              <span><CalendarDays size={15} /> {formatDate(application.createdAt)}</span>
              <span><FileText size={15} /> {statusMessage}</span>
            </div>
          </Card>
        )
      }) : <EmptyState title={t('noApplicationsTitle')} copy={t('noApplicationsCopy')} />}
    </Screen>
  )
}

function ProfileScreen({ onAvatarChange, onEdit, onOpenResume, t, user }) {
  const completion = getProfileCompletion(user)

  const handleAvatarFile = (event) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onAvatarChange(reader.result)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  return (
    <Screen>
      <Header title={t('profileTitle')} subtitle={t('profileSubtitle')} action={<button className="icon-pill" onClick={onEdit} type="button"><Pencil size={16} /> {t('editProfile')}</button>} />
      <Card className="profile-card">
        <div className="avatar-wrap">
          <div className="avatar">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : getInitials(user?.name || user?.email || 'Candidate')}
          </div>
          <label aria-label={t('uploadPhoto')} title={t('uploadPhoto')}>
            <Upload size={16} />
            <input accept="image/*" onChange={handleAvatarFile} type="file" />
          </label>
        </div>
        <h2>{user?.name || user?.fullName || 'Candidate'}</h2>
        <p>{user?.email || 'Login to sync your profile'}</p>
        <div className="progress-line">
          <span style={{ width: `${completion}%` }} />
        </div>
        <strong>{completion}% {t('profileCompletion')}</strong>
      </Card>
      <Card className="profile-details-card">
        <h3>{t('profileDetails')}</h3>
        <div className="profile-detail-grid">
          <DetailItem label={t('name')} value={user?.name || user?.fullName || t('notAdded')} />
          <DetailItem label={t('email')} value={user?.email || t('notAdded')} />
          <DetailItem label={t('phone')} value={user?.phone || user?.mobile || t('notAdded')} />
          <DetailItem label={t('location')} value={user?.location || t('notAdded')} />
        </div>
      </Card>
      <ProfileSection actionLabel={t('editSection')} icon={CircleUserRound} onClick={onEdit} title={t('personalDetails')} items={[user?.summary || t('addSummary')]} />
      <ProfileSection actionLabel={t('editSection')} icon={GraduationCap} onClick={onEdit} title={t('education')} items={[user?.education || t('addEducation')]} />
      <ProfileSection actionLabel={t('editSection')} icon={BriefcaseBusiness} onClick={onEdit} title={t('experience')} items={[user?.experience || t('addExperience')]} />
      <ProfileSection actionLabel={t('editSection')} icon={Lightbulb} onClick={onEdit} title={t('skills')} items={Array.isArray(user?.skills) && user.skills.length ? user.skills : [t('addSkills')]} />
      <button className="secondary-button" onClick={onOpenResume} type="button">
        <FileText size={18} />
        {t('resumeBuilder')}
      </button>
    </Screen>
  )
}

function ResumeScreen({ language, onSave, t, user }) {
  const [resume, setResume] = useState(() => ({
    education: user?.education || '',
    experience: user?.experience || '',
    name: user?.name || user?.fullName || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : '',
    summary: user?.summary || '',
  }))
  const suggestions = getProfileSuggestions(language)

  const updateResume = (event) => {
    const { name, value } = event.target
    setResume((current) => ({ ...current, [name]: value }))
  }

  const useSuggestion = (field, value) => {
    setResume((current) => ({
      ...current,
      [field]: field === 'skills' ? appendCommaValue(current.skills, value) : value,
    }))
  }

  const submit = (event) => {
    event.preventDefault()
    onSave({
      education: resume.education,
      experience: resume.experience,
      fullName: resume.name,
      name: resume.name,
      skills: resume.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      summary: resume.summary,
    })
  }

  return (
    <Screen>
      <Header title={t('resumeTitle')} subtitle={t('resumeSubtitle')} />
      <Card className="resume-builder-card">
        <form className="auth-form" onSubmit={submit}>
          <input name="name" onChange={updateResume} placeholder={t('fullName')} required type="text" value={resume.name} />
          <textarea name="summary" onChange={updateResume} placeholder={t('professionalSummary')} value={resume.summary} />
          <input name="education" onChange={updateResume} placeholder={t('education')} type="text" value={resume.education} />
          <input name="experience" onChange={updateResume} placeholder={t('experience')} type="text" value={resume.experience} />
          <input name="skills" onChange={updateResume} placeholder={t('skillsComma')} type="text" value={resume.skills} />
          <button className="primary-button" type="submit">
            <Check size={18} />
            {t('saveResume')}
          </button>
        </form>
      </Card>
      <SuggestionGroup items={suggestions.summary} title={t('resumeSuggestions')} onPick={(value) => useSuggestion('summary', value)} />
      <SuggestionGroup items={suggestions.education} title={t('educationSuggestions')} onPick={(value) => useSuggestion('education', value)} />
      <SuggestionGroup items={suggestions.experience} title={t('experienceSuggestions')} onPick={(value) => useSuggestion('experience', value)} />
      <SuggestionGroup items={suggestions.skills} title={t('skillSuggestions')} onPick={(value) => useSuggestion('skills', value)} />
      <Card className="resume-preview">
        <p className="muted">{t('resumePreview')}</p>
        <h2>{resume.name || t('fullName')}</h2>
        <p>{resume.summary || t('addSummary')}</p>
        <div className="resume-preview-grid">
          <DetailItem label={t('education')} value={resume.education || t('addEducation')} />
          <DetailItem label={t('experience')} value={resume.experience || t('addExperience')} />
        </div>
        <div className="skill-cloud">
          {(resume.skills ? resume.skills.split(',').map((skill) => skill.trim()).filter(Boolean) : [t('addSkills')]).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </Card>
      <button className="primary-button" type="button">
        <Download size={18} />
        {t('downloadPdf')}
      </button>
    </Screen>
  )
}

function NotificationsScreen({ applications, cleared, jobs, onClear, t }) {
  const notifications = cleared ? [] : [
    [t('newJobAlert'), `${jobs.length} ${t('jobAlertCopy')}`, t('now')],
    [t('applicationUpdate'), `${applications.length} ${t('applicationUpdateCopy')}`, t('today')],
    [t('profileReminder'), t('profileReminderCopy'), t('today')],
  ]

  return (
    <Screen>
      <Header
        title={t('notificationsTitle')}
        subtitle={t('notificationsSubtitle')}
        action={notifications.length ? <button className="icon-pill" onClick={onClear} type="button">{t('clearAll')}</button> : null}
      />
      {notifications.length ? notifications.map(([title, copy, time]) => (
        <Card className="notification-card" key={title}>
          <div className="notification-icon">
            <Bell size={18} />
          </div>
          <div>
            <h3>{title}</h3>
            <p>{copy}</p>
            <small>{time}</small>
          </div>
        </Card>
      )) : <EmptyState title={t('noNotificationsTitle')} copy={t('noNotificationsCopy')} />}
    </Screen>
  )
}

function SettingsScreen({ branding, language, theme, onLogout, onNavigate, onThemeToggle, t, user }) {
  const hasSession = Boolean(user?.email || getAuthToken())
  const customerCareNumber = branding?.tollFreeNumber || fallbackCustomerCareNumber
  const customerCareHref = `tel:${customerCareNumber.replace(/[^\d+]/g, '')}`

  return (
    <Screen>
      <Header title={t('settingsTitle')} subtitle={user?.email || t('settingsSubtitle')} action={<ThemeButton theme={theme} onClick={onThemeToggle} />} />
      <div className="settings-list">
        <SettingsRow icon={Pencil} title={t('editProfile')} onClick={() => onNavigate('edit-profile')} />
        <SettingsRow icon={Languages} title={t('changeLanguage')} value={language} onClick={() => onNavigate('language')} />
        <SettingsRow icon={theme === 'dark' ? Moon : Sun} title={t('themeMode')} value={theme === 'dark' ? 'Dark' : 'Light'} onClick={onThemeToggle} />
        <SettingsRow icon={Headphones} title={t('helpSupport')} onClick={() => onNavigate('help')} />
        <SettingsRow icon={LockKeyhole} title={t('privacySecurity')} onClick={() => onNavigate('privacy')} />
        {hasSession ? (
          <SettingsRow danger icon={LogOut} title={t('logout')} value={t('signOut')} onClick={onLogout} />
        ) : (
          <SettingsRow icon={LogOut} title={t('login')} value={t('signIn')} onClick={() => onNavigate('login')} />
        )}
        <a className="customer-care-row" href={customerCareHref}>
          <span><Phone size={18} /></span>
          <strong>{t('customerCare')}</strong>
          <em>{customerCareNumber}</em>
          <small>{t('callNow')}</small>
        </a>
      </div>
    </Screen>
  )
}

function EditProfileScreen({ language, onBack, onSave, t, user }) {
  const [form, setForm] = useState(() => ({
    education: user?.education || '',
    email: user?.email || '',
    experience: user?.experience || '',
    location: user?.location || '',
    name: user?.name || user?.fullName || '',
    phone: user?.phone || user?.mobile || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : '',
    summary: user?.summary || '',
  }))
  const suggestions = getProfileSuggestions(language)

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submit = (event) => {
    event.preventDefault()
    onSave({
      ...form,
      fullName: form.name,
      mobile: form.phone,
      skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    })
  }

  const useSuggestion = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'skills' ? appendCommaValue(current.skills, value) : value,
    }))
  }

  return (
    <Screen>
      <Header title={t('editProfile')} subtitle={t('updateProfile')} action={<BackButton onClick={onBack} />} />
      <Card className="auth-card">
        <form className="auth-form" onSubmit={submit}>
          <input name="name" onChange={updateForm} placeholder={t('fullName')} required type="text" value={form.name} />
          <input name="email" onChange={updateForm} placeholder={t('email')} required type="email" value={form.email} />
          <input name="phone" onChange={updateForm} placeholder={t('mobileNumber')} type="tel" value={form.phone} />
          <input name="location" onChange={updateForm} placeholder={t('location')} type="text" value={form.location} />
          <input name="education" onChange={updateForm} placeholder={t('education')} type="text" value={form.education} />
          <SuggestionGroup compact items={suggestions.education} title={t('educationSuggestions')} onPick={(value) => useSuggestion('education', value)} />
          <input name="experience" onChange={updateForm} placeholder={t('experience')} type="text" value={form.experience} />
          <SuggestionGroup compact items={suggestions.experience} title={t('experienceSuggestions')} onPick={(value) => useSuggestion('experience', value)} />
          <textarea name="summary" onChange={updateForm} placeholder={t('professionalSummary')} value={form.summary} />
          <SuggestionGroup compact items={suggestions.summary} title={t('resumeSuggestions')} onPick={(value) => useSuggestion('summary', value)} />
          <input name="skills" onChange={updateForm} placeholder={t('skillsComma')} type="text" value={form.skills} />
          <SuggestionGroup compact items={suggestions.skills} title={t('skillSuggestions')} onPick={(value) => useSuggestion('skills', value)} />
          <button className="primary-button" type="submit">
            <Check size={18} />
            {t('updateProfile')}
          </button>
        </form>
      </Card>
    </Screen>
  )
}

function LanguageScreen({ language, onBack, onSelect, t }) {
  const languages = ['English', 'Hindi', 'Hinglish']

  return (
    <Screen>
      <Header title={t('languageTitle')} subtitle={t('languageSubtitle')} action={<BackButton onClick={onBack} />} />
      <div className="settings-list">
        {languages.map((item) => (
          <button className={`choice-row ${language === item ? 'active' : ''}`} key={item} onClick={() => onSelect(item)} type="button">
            <span>{item}</span>
            {language === item && <Check size={18} />}
          </button>
        ))}
      </div>
      <button className="secondary-button" onClick={onBack} type="button">{t('done')}</button>
    </Screen>
  )
}

function HelpSupportScreen({ onBack, onSubmit, t, user }) {
  const [form, setForm] = useState({ message: '', subject: 'Application support' })

  const submit = (event) => {
    event.preventDefault()
    const tickets = JSON.parse(localStorage.getItem('mobileSupportTickets') || '[]')
    localStorage.setItem('mobileSupportTickets', JSON.stringify([{ ...form, email: user?.email || '', createdAt: new Date().toISOString() }, ...tickets]))
    setForm({ message: '', subject: 'Application support' })
    onSubmit(t('supportSaved'))
  }

  return (
    <Screen>
      <Header title="Help & support" subtitle="Support for accounts, jobs, and applications" action={<BackButton onClick={onBack} />} />
      <Card className="content-block">
        <h3>Quick help</h3>
        <p>Create a ticket for login issues, duplicate applications, profile updates, resume help, or application status.</p>
      </Card>
      <Card className="auth-card">
        <form className="auth-form" onSubmit={submit}>
          <input name="subject" onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Subject" value={form.subject} />
          <textarea name="message" onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Write your issue" required value={form.message} />
          <button className="primary-button" type="submit">
            <Send size={18} />
            Send support request
          </button>
        </form>
      </Card>
    </Screen>
  )
}

function PrivacySecurityScreen({ onBack, user }) {
  const [privacy, setPrivacy] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mobilePrivacy') || '{"jobAlerts":true,"profileVisible":true,"secureLogin":true}')
    } catch {
      return { jobAlerts: true, profileVisible: true, secureLogin: true }
    }
  })

  const toggle = (key) => {
    setPrivacy((current) => {
      const next = { ...current, [key]: !current[key] }
      localStorage.setItem('mobilePrivacy', JSON.stringify(next))
      return next
    })
  }

  return (
    <Screen>
      <Header title="Privacy & security" subtitle={user?.email || 'Candidate security controls'} action={<BackButton onClick={onBack} />} />
      <div className="settings-list">
        <ToggleRow checked={privacy.profileVisible} onClick={() => toggle('profileVisible')} title="Profile visible to recruiters" />
        <ToggleRow checked={privacy.jobAlerts} onClick={() => toggle('jobAlerts')} title="Job alert notifications" />
        <ToggleRow checked={privacy.secureLogin} onClick={() => toggle('secureLogin')} title="Secure login reminders" />
      </div>
      <Card className="content-block">
        <h3>Account security</h3>
        <p>The token is stored in local secure storage. Logging out clears the session.</p>
      </Card>
    </Screen>
  )
}

function ToggleRow({ checked, onClick, title }) {
  return (
    <button className="toggle-row" onClick={onClick} type="button">
      <strong>{title}</strong>
      <span className={checked ? 'on' : ''}>{checked ? 'On' : 'Off'}</span>
    </button>
  )
}

function SearchPanel({ compact = false, onQuickFilter, query, setQuery, t }) {
  return (
    <Card className={`search-card ${compact ? 'compact' : ''}`}>
      <label className="search-input">
        <Search size={18} />
        <input onChange={(event) => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} type="search" value={query} />
      </label>
      {!compact && (
        <div className="quick-stats">
          <button onClick={() => onQuickFilter?.('remote')} type="button">{t('remote')}</button>
          <button onClick={() => onQuickFilter?.('full-time')} type="button">{t('fullTime')}</button>
          <button onClick={() => onQuickFilter?.('fresh')} type="button">{t('freshRoles')}</button>
        </div>
      )}
    </Card>
  )
}

function JobCard({ job, compact = false, onApply, onOpenDetails, t }) {
  return (
    <Card className="job-card">
      <div className="card-header">
        <div className="company-logo">{getCompanyInitials(job.company)}</div>
        <div>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
        </div>
        <span className="match-pill">{job.match || (job.featured ? 'Featured' : 'New')}</span>
      </div>
      <div className="job-meta">
        <span><MapPin size={14} /> {job.location}</span>
        <span><WalletCards size={14} /> {job.salary || 'Undisclosed'}</span>
        <span><Clock3 size={14} /> {job.experience || 'Any exp.'}</span>
        <span><Building2 size={14} /> {job.workMode || job.mode || job.type}</span>
      </div>
      {!compact && <p className="job-summary">{job.description || 'Verified employer role with structured hiring workflow.'}</p>}
      <div className="card-actions">
        <span className="type-pill">{job.type || 'Full Time'}</span>
        <button className="apply-button secondary-action" onClick={onOpenDetails} type="button">{t('details')}</button>
        {onApply && <button className="apply-button" onClick={onApply} type="button">{t('apply')}</button>}
      </div>
    </Card>
  )
}

function MiniJobCard({ job, onOpenDetails }) {
  return (
    <button className="mini-job-card" onClick={onOpenDetails} type="button">
      <span className="company-logo">{getCompanyInitials(job.company)}</span>
      <strong>{job.title}</strong>
      <small>{job.company}</small>
      <span>{job.salary || job.location}</span>
    </button>
  )
}

function MetricGrid({ applications, jobs, t }) {
  return (
    <div className="metric-grid">
      <Card>
        <strong>{jobs.length}</strong>
        <span>{t('liveJobs')}</span>
      </Card>
      <Card>
        <strong>{applications.length}</strong>
        <span>{t('applied')}</span>
      </Card>
    </div>
  )
}

function LoadingCards() {
  return (
    <div className="loading-list">
      {[1, 2, 3].map((item) => <Card className="skeleton-card" key={item} />)}
    </div>
  )
}

function EmptyState({ copy, title }) {
  return (
    <Card className="empty-state">
      <Sparkles size={24} />
      <h3>{title}</h3>
      <p>{copy}</p>
    </Card>
  )
}

function InlineNotice({ message }) {
  return (
    <div className="inline-notice">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  )
}

function ProfileSection({ actionLabel, icon: Icon, items, onClick, title }) {
  const Element = onClick ? 'button' : Card
  const props = onClick
    ? { className: 'card profile-section profile-section-button', onClick, type: 'button' }
    : { className: 'profile-section' }

  return (
    <Element {...props}>
      <div className="section-icon"><Icon size={18} /></div>
      <div>
        <h3>{title}</h3>
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
      {actionLabel && <small>{actionLabel}</small>}
      <ChevronRight size={18} />
    </Element>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function SuggestionGroup({ compact = false, items, onPick, title }) {
  if (!items?.length) return null

  return (
    <Card className={`suggestion-card ${compact ? 'compact' : ''}`}>
      <div className="suggestion-title">
        <strong>{title}</strong>
      </div>
      <div className="suggestion-chips">
        {items.map((item) => (
          <button key={item} onClick={() => onPick(item)} type="button">
            {item}
          </button>
        ))}
      </div>
    </Card>
  )
}

function SettingsRow({ danger = false, icon: Icon, onClick, title, value }) {
  return (
    <button className={`settings-row ${danger ? 'danger' : ''}`} onClick={onClick} type="button">
      <span><Icon size={18} /></span>
      <strong>{title}</strong>
      {value && <em>{value}</em>}
      <ChevronRight size={18} />
    </button>
  )
}

function ContentBlock({ children, title }) {
  return (
    <Card className="content-block">
      <h3>{title}</h3>
      {typeof children === 'string' ? <p>{children}</p> : children}
    </Card>
  )
}

function SectionTitle({ action, title }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      {action && <button type="button">{action}</button>}
    </div>
  )
}

function Header({ action, subtitle, title }) {
  return (
    <header className="screen-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

function IconPill({ icon: Icon, label }) {
  return (
    <button className="icon-pill" type="button">
      <Icon size={16} />
      {label}
    </button>
  )
}

function ThemeButton({ theme, onClick }) {
  const Icon = theme === 'dark' ? Moon : Sun
  return (
    <button className="icon-button" onClick={onClick} type="button" aria-label="Toggle theme">
      <Icon size={20} />
    </button>
  )
}

function BackButton({ onClick }) {
  return (
    <button className="icon-pill" onClick={onClick} type="button">
      Back
    </button>
  )
}

function Card({ children, className = '' }) {
  return <article className={`card ${className}`}>{children}</article>
}

function Screen({ children, className = '' }) {
  return <div className={`screen ${className}`}>{children}</div>
}

function getFirstName(user) {
  return (user?.name || user?.fullName || user?.email || 'Candidate').split(/[ @]/)[0]
}

function getInitials(value) {
  return String(value)
    .split(/[ @.]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getCompanyInitials(company = 'Company') {
  return getInitials(company)
}

function getProfileSuggestions(language) {
  return profileSuggestions[language] || profileSuggestions.English
}

function appendCommaValue(current, value) {
  const parts = String(current || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (!parts.some((item) => item.toLowerCase() === value.toLowerCase())) {
    parts.push(value)
  }

  return parts.join(', ')
}

function getProfileCompletion(user) {
  if (!user?.email) return 20
  const fields = [
    user.name || user.fullName,
    user.email,
    user.phone || user.mobile,
    user.location,
    user.education,
    user.experience,
    user.summary,
    Array.isArray(user.skills) && user.skills.length,
  ]
  const completed = fields.filter(Boolean).length
  return Math.max(25, Math.round((completed / fields.length) * 100))
}

function formatDate(value) {
  if (!value) return 'Today'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function normalizeApplicationStatus(status) {
  if (status === 'Approved') return 'Selected'
  return status || 'New'
}

function getApplicationTimelineSteps(status) {
  if (status === 'Rejected') return ['New', 'Reviewed', 'Rejected']
  if (status === 'Selected') return ['New', 'Reviewed', 'Shortlisted', 'Interview', 'Selected']
  return ['New', 'Reviewed', 'Shortlisted', 'Interview', 'Selected']
}

function getApplicationStatusMessage(application, t) {
  if (application.reviewRemark) return application.reviewRemark

  const status = normalizeApplicationStatus(application.status)
  const messages = {
    New: t('reviewPending'),
    Reviewed: t('reviewedMessage'),
    Shortlisted: t('shortlistedMessage'),
    Interview: t('interviewMessage'),
    Selected: t('selectedMessage'),
    Rejected: t('rejectedMessage'),
    Approved: t('approvedMessage'),
  }

  return messages[status] || t('reviewPending')
}

function isSameAppliedJob(application, job) {
  const applicationJobId = String(application.jobId || '')
  const jobId = String(job._id || job.id || '')
  if (applicationJobId && jobId && applicationJobId === jobId) return true
  return `${application.jobTitle}`.toLowerCase() === `${job.title}`.toLowerCase() && `${application.company}`.toLowerCase() === `${job.company}`.toLowerCase()
}

function getLocalApplications(email) {
  if (!email) return []
  try {
    return JSON.parse(localStorage.getItem(`mobileApplications:${email}`) || '[]')
  } catch {
    return []
  }
}

function saveLocalApplication(email, application) {
  if (!email) return
  const current = getLocalApplications(email)
  const exists = current.some((item) => isSameAppliedJob(item, application))
  const next = exists ? current : [application, ...current]
  localStorage.setItem(`mobileApplications:${email}`, JSON.stringify(next))
}

function saveLocalApplications(email, applications) {
  if (!email) return
  localStorage.setItem(`mobileApplications:${email}`, JSON.stringify(applications))
}

function getApplicationKey(application) {
  const jobId = String(application.jobId || application.job?._id || application.job?.id || '').trim()
  if (jobId) return `job:${jobId}`
  return `role:${String(application.jobTitle || '').toLowerCase()}|${String(application.company || '').toLowerCase()}`
}

function mergeApplications(remoteApplications, localApplications) {
  const merged = new Map()

  remoteApplications.forEach((application) => {
    merged.set(getApplicationKey(application), { ...application, offline: false })
  })

  localApplications.forEach((application) => {
    const key = getApplicationKey(application)
    if (!merged.has(key)) merged.set(key, application)
  })

  return [...merged.values()].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
}

function getResumeField(field, user) {
  const values = {
    'Full name': user?.name || user?.fullName || 'Add full name',
    'Professional summary': user?.summary || 'Add professional summary',
    Education: user?.education || 'Add education',
    Experience: user?.experience || 'Add experience',
    Skills: Array.isArray(user?.skills) && user.skills.length ? user.skills.join(', ') : 'Add skills',
  }

  return values[field] || `Add ${field.toLowerCase()}`
}

export default App
