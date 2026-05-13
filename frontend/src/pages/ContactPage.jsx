import { Mail, MapPin, MessageCircle, Phone, Send, Share2 } from 'lucide-react'
import { Button } from '../components/Button'

export function ContactPage() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-black text-slate-950 sm:text-5xl">Contact Us</h1>
          <p className="mt-3 text-slate-500">Talk to our team about hiring, partnerships, or candidate support.</p>
          <form className="mt-8 grid gap-4">
            <input className="input" placeholder="Name" />
            <input className="input" placeholder="Email" />
            <input className="input" placeholder="Subject" />
            <textarea className="input min-h-36" placeholder="Message" />
            <Button>Send Message</Button>
          </form>
        </div>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Company Info</h2>
            <div className="mt-5 grid gap-4 text-slate-600">
              <p className="flex gap-3"><MapPin className="text-blue-600" /> 21 Career Avenue, New Delhi</p>
              <p className="flex gap-3"><Phone className="text-blue-600" /> +91 98765 43210</p>
              <p className="flex gap-3"><Mail className="text-blue-600" /> support@cromgenrozgar.com</p>
            </div>
            <div className="mt-6 flex gap-3">
              {[Share2, Send, MessageCircle].map((Icon, index) => <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-600" key={index}><Icon size={19} /></span>)}
            </div>
          </div>
          <div className="grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50 p-6 text-center">
            <div>
              <MapPin className="mx-auto text-blue-600" size={36} />
              <p className="mt-4 text-xl font-bold text-slate-950">Map Placeholder</p>
              <p className="mt-2 text-sm text-slate-500">Interactive map can be connected here.</p>
            </div>
          </div>
          <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-teal-500 p-6 text-white shadow-xl shadow-blue-100">
            <h2 className="text-2xl font-black">Need hiring support?</h2>
            <p className="mt-2 text-blue-50">Our support team can help candidates and recruiters with onboarding, listings, and applications.</p>
            <Button className="mt-5" variant="secondary">Contact Support</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
