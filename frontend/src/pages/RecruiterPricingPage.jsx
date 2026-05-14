import { useEffect, useState } from 'react'
import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from 'lucide-react'
import { api } from '../services/api'
import { DashboardShell, Panel } from './CandidateDashboard'
import { fetchPricingPackages, getPricingPackages, PRICING_PACKAGES_KEY } from '../utils/pricingPackages'

function getStoredRecruiter() {
  try {
    return JSON.parse(localStorage.getItem('authUser') || 'null')
  } catch {
    return null
  }
}

function getPackageAmount(plan) {
  const amount = Number(String(plan?.price || '').replace(/[^\d.]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

function getPackageCoins(plan) {
  const amount = getPackageAmount(plan)
  const discount = Number(plan?.discountPercent || 0)
  const payable = Math.max(0, amount - (amount * discount) / 100)
  const amountCoins = Math.floor(payable / 100) * 10
  const coinPerJob = Number(plan?.coinPerJob || 10)
  const jobLimit = Number(plan?.jobLimit || 1)

  return Math.max(amountCoins, coinPerJob, jobLimit * coinPerJob)
}

export function RecruiterPricingPage() {
  const recruiter = getStoredRecruiter()
  const [plans, setPlans] = useState(() => getPricingPackages())
  const [activePackage, setActivePackage] = useState(null)
  const [message, setMessage] = useState('')
  const [paymentPlan, setPaymentPlan] = useState(null)
  const [coinQuantity, setCoinQuantity] = useState(50)
  const [coinBuying, setCoinBuying] = useState(false)

  useEffect(() => {
    const syncPlans = () => {
      fetchPricingPackages({ activeOnly: true })
        .then(setPlans)
        .catch(() => setPlans(getPricingPackages()))
    }
    const syncFromStorage = (event) => {
      if (!event.key || event.key === PRICING_PACKAGES_KEY || event.key === `${PRICING_PACKAGES_KEY}:updatedAt`) {
        syncPlans()
      }
    }

    window.addEventListener('pricing-packages-updated', syncPlans)
    window.addEventListener('storage', syncFromStorage)
    window.addEventListener('focus', syncPlans)
    document.addEventListener('visibilitychange', syncPlans)
    syncPlans()

    return () => {
      window.removeEventListener('pricing-packages-updated', syncPlans)
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener('focus', syncPlans)
      document.removeEventListener('visibilitychange', syncPlans)
    }
  }, [])

  const loadActivePackage = () => {
    if (!recruiter?.email) return

    api
      .currentRecruiterPackage(recruiter.email)
      .then((payload) => setActivePackage(payload.data || null))
      .catch(() => setActivePackage(null))
  }

  useEffect(() => {
    loadActivePackage()
  }, [recruiter?.email])

  useEffect(() => {
    const syncWallet = () => loadActivePackage()

    window.addEventListener('focus', syncWallet)
    window.addEventListener('recruiter-wallet-updated', syncWallet)

    return () => {
      window.removeEventListener('focus', syncWallet)
      window.removeEventListener('recruiter-wallet-updated', syncWallet)
    }
  }, [recruiter?.email])

  const activatePackage = async (plan) => {
    if (!recruiter?.email) {
      setMessage('Please login as recruiter to activate a package.')
      return
    }

    try {
      const payload = await api.activateRecruiterPackage({
        recruiterEmail: recruiter.email,
        recruiterName: recruiter.name,
        packageId: plan._id,
      })
      setActivePackage(payload.data)
      window.dispatchEvent(new Event('recruiter-wallet-updated'))
      setMessage(`${plan.name} package activated successfully.`)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const choosePackage = (plan) => {
    if (getPackageAmount(plan) > 0) {
      setPaymentPlan(plan)
      return
    }

    activatePackage(plan)
  }

  const buyCoins = async () => {
    if (!recruiter?.email) {
      setMessage('Please login as recruiter to buy coins.')
      return
    }

    if (!activePackage) {
      setMessage('Please activate a recruiter package before buying coins.')
      return
    }

    setCoinBuying(true)
    try {
      const payload = await api.purchaseRecruiterCoins({
        recruiterEmail: recruiter.email,
        recruiterName: recruiter.name,
        coins: coinQuantity,
        amount: coinQuantity * 10,
      })
      setActivePackage(payload.data)
      window.dispatchEvent(new Event('recruiter-wallet-updated'))
      setMessage(payload.message || `${coinQuantity} coins added to your wallet.`)
    } catch (error) {
      setMessage(error.message || 'Coin payment failed.')
    } finally {
      setCoinBuying(false)
    }
  }

  return (
    <DashboardShell title="Recruiter Pricing" subtitle="Choose a hiring plan for posting jobs, reviewing candidates, and scaling your recruitment workflow.">
      {message && <p className="mb-5 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700">{message}</p>}
      {activePackage && (
        <div className="mb-5 rounded-[2rem] border border-teal-200 bg-teal-50 p-5">
          <p className="text-xs font-black uppercase tracking-wide text-teal-700">Current Active Package</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{activePackage.packageSnapshot?.name}</p>
          <p className="mt-1 text-sm font-bold text-teal-800">{activePackage.packageSnapshot?.price} / {activePackage.coinBalance || 0} coins left / {activePackage.packageSnapshot?.coinPerJob || 10} coins per job / Active since {new Date(activePackage.activatedAt).toLocaleDateString()}</p>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const isActive = String(activePackage?.packageId || '') === String(plan._id || '')

          return (
          <article className={`rounded-[2rem] border bg-white p-6 shadow-sm ${isActive ? 'border-teal-300 shadow-xl shadow-teal-100' : plan.badge ? 'border-blue-200 shadow-xl shadow-blue-100' : 'border-slate-200'}`} key={plan._id || plan.name}>
            <div className="flex items-center justify-between gap-3">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${isActive ? 'bg-teal-600 text-white' : plan.badge ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <CreditCard size={22} />
              </span>
              {isActive ? <span className="rounded-full bg-teal-600 px-3 py-1 text-xs font-black text-white">Active</span> : plan.badge && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">{plan.badge}</span>}
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-950">{plan.name}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">{plan.description}</p>
            <p className="mt-5 text-3xl font-black text-slate-950">{plan.price}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-wide text-slate-400">{plan.jobLimit || 1} jobs / {plan.validityDays || 30} days / {plan.coinPerJob || 10} coins per job</p>
            <div className="mt-6 grid gap-3">
              {plan.features.map((feature) => (
                <p className="flex items-center gap-3 text-sm font-bold text-slate-600" key={feature}>
                  <CheckCircle2 className="text-teal-500" size={18} />
                  {feature}
                </p>
              ))}
            </div>
            <button
              className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-black transition ${isActive ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' : plan.badge ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              disabled={isActive}
              onClick={() => choosePackage(plan)}
              type="button"
            >
              {isActive ? 'Current Package' : getPackageAmount(plan) > 0 ? 'Pay & Activate' : plan.buttonLabel || 'Start Hiring'}
            </button>
          </article>
          )
        })}
      </div>
      {paymentPlan && (
        <PackagePaymentModal
          activePackage={activePackage}
          onClose={() => setPaymentPlan(null)}
          onPay={() => {
            const plan = paymentPlan
            setPaymentPlan(null)
            activatePackage(plan)
          }}
          plan={paymentPlan}
        />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Plan Benefits">
          <div className="grid gap-3">
            {[
              [Sparkles, 'Better hiring visibility across premium job listings'],
              [ShieldCheck, 'Verified recruiter profile and clean hiring workspace'],
            ].map(([Icon, text]) => (
              <p className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700" key={text}>
                <Icon size={18} />
                {text}
              </p>
            ))}
          </div>
        </Panel>
        <Panel title="Need to buying more coin">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-black uppercase tracking-wide text-blue-200">Recruiter wallet top-up</p>
            <p className="mt-3 text-3xl font-black">{activePackage?.coinBalance || 0} coins</p>
            <p className="mt-1 text-sm font-semibold text-slate-300">10 coins = INR 100 / one job uses {activePackage?.packageSnapshot?.coinPerJob || 10} coins</p>
          </div>

          <div className="mt-5 grid gap-4">
            <label>
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">Choose coins</span>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setCoinQuantity(Number(event.target.value))}
                value={coinQuantity}
              >
                {[10, 20, 50, 100, 200, 500].map((coins) => (
                  <option key={coins} value={coins}>{coins} coins</option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-800">
              <div className="flex justify-between gap-3"><span>Selected coins</span><span>{coinQuantity}</span></div>
              <div className="flex justify-between gap-3"><span>Payable amount</span><span>INR {coinQuantity * 10}</span></div>
              <div className="flex justify-between gap-3"><span>After payment wallet</span><span>{(activePackage?.coinBalance || 0) + coinQuantity} coins</span></div>
            </div>

            <button
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={coinBuying || !activePackage}
              onClick={buyCoins}
              type="button"
            >
              {coinBuying ? 'Processing Payment...' : 'Buy Coins & Pay'}
            </button>
            {!activePackage && <p className="text-xs font-bold text-rose-600">Coin buy karne se pehle ek package activate karein.</p>}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  )
}

function PackagePaymentModal({ activePackage, onClose, onPay, plan }) {
  const amount = getPackageAmount(plan)
  const discount = Number(plan.discountPercent || 0)
  const payable = Math.max(0, amount - (amount * discount) / 100)
  const coins = getPackageCoins(plan)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-600">Package Payment</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">{plan.name}</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">Wallet balance: {activePackage?.coinBalance || 0} coins</p>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600" onClick={onClose} type="button">×</button>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
          <div className="flex justify-between gap-3"><span>Package amount</span><span>{plan.price}</span></div>
          <div className="flex justify-between gap-3"><span>Discount</span><span>{discount}%</span></div>
          <div className="flex justify-between gap-3 border-t border-slate-200 pt-3 text-slate-950"><span>Payable amount</span><span>INR {payable}</span></div>
          <div className="flex justify-between gap-3 text-teal-700"><span>Coins credited</span><span>{coins} coins</span></div>
        </div>

        <div className="mt-5 grid gap-3">
          <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-black text-slate-700" type="button">UPI / QR Payment</button>
          <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-black text-slate-700" type="button">Card / Net Banking</button>
        </div>

        <div className="mt-6 flex flex-col justify-end gap-2 sm:flex-row">
          <button className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700" onClick={onClose} type="button">Cancel</button>
          <button className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white" onClick={onPay} type="button">Payment Done & Activate</button>
        </div>
      </div>
    </div>
  )
}
