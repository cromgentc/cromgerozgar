import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { City, Country, State } from 'country-state-city'
import { MapPin, Search } from 'lucide-react'
import { Button } from './Button'

export function SearchBar({ compact = false }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [locationScope, setLocationScope] = useState(searchParams.get('scope') || 'India')
  const [countryCode, setCountryCode] = useState(searchParams.get('country') || 'IN')
  const [stateCode, setStateCode] = useState(searchParams.get('state') || '')
  const [city, setCity] = useState(searchParams.get('city') || searchParams.get('location') || '')
  const [jobType, setJobType] = useState(searchParams.get('type') || '')
  const countryOptions = useMemo(() => {
    if (locationScope === 'India') return [Country.getCountryByCode('IN')].filter(Boolean)
    return Country.getAllCountries().filter((country) => country.isoCode !== 'IN')
  }, [locationScope])
  const stateOptions = useMemo(() => State.getStatesOfCountry(countryCode || 'IN'), [countryCode])
  const cityOptions = useMemo(() => City.getCitiesOfState(countryCode || 'IN', stateCode || ''), [countryCode, stateCode])

  const selectedCountry = Country.getCountryByCode(countryCode)
  const selectedState = State.getStateByCodeAndCountry(stateCode, countryCode)
  const selectedLocation = [city, selectedState?.name, selectedCountry?.name].filter(Boolean).join(', ')

  const changeScope = (value) => {
    const nextCountryCode = value === 'India' ? 'IN' : 'US'
    const firstState = State.getStatesOfCountry(nextCountryCode)[0]
    const firstCity = City.getCitiesOfState(nextCountryCode, firstState?.isoCode || '')[0]
    setLocationScope(value)
    setCountryCode(nextCountryCode)
    setStateCode(firstState?.isoCode || '')
    setCity(firstCity?.name || '')
  }

  const changeCountry = (value) => {
    const firstState = State.getStatesOfCountry(value)[0]
    const firstCity = City.getCitiesOfState(value, firstState?.isoCode || '')[0]
    setCountryCode(value)
    setStateCode(firstState?.isoCode || '')
    setCity(firstCity?.name || '')
  }

  const changeState = (value) => {
    const firstCity = City.getCitiesOfState(countryCode, value)[0]
    setStateCode(value)
    setCity(firstCity?.name || '')
  }

  const submit = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('q', keyword.trim())
    if (selectedLocation) {
      params.set('location', selectedLocation)
      params.set('scope', locationScope)
      params.set('country', countryCode)
      if (stateCode) params.set('state', stateCode)
      if (city) params.set('city', city)
    }
    if (jobType) params.set('type', jobType)
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <form className="w-full rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-2xl shadow-blue-100/70 backdrop-blur-xl ring-1 ring-slate-200/80" onSubmit={submit}>
      <div className={`grid gap-3 ${compact ? 'lg:grid-cols-[minmax(0,1fr)_220px_auto]' : 'lg:grid-cols-[minmax(0,1fr)_190px_auto]'}`}>
        <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-2xl bg-slate-50 px-4 text-slate-500 ring-1 ring-transparent focus-within:bg-white focus-within:ring-blue-200">
          <Search className="shrink-0 text-blue-600" size={20} />
          <input className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400" onChange={(event) => setKeyword(event.target.value)} placeholder="Job title, skill, or company" value={keyword} />
        </label>
        <select className="min-h-14 rounded-2xl bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none ring-1 ring-transparent focus:bg-white focus:ring-blue-200" onChange={(event) => setJobType(event.target.value)} value={jobType}>
          <option value="">All job types</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
          <option value="Freelance">Freelance</option>
        </select>
        <Button className="min-h-14 whitespace-nowrap px-7" type="submit">Find Jobs</Button>
      </div>

      <div className={`mt-3 grid gap-2 rounded-2xl bg-slate-50 p-2 ${locationScope === 'International' ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3'}`}>
        <label className="flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-slate-200">
          <MapPin className="shrink-0 text-teal-500" size={18} />
          <select className="min-w-0 flex-1 bg-transparent text-sm font-black text-slate-700 outline-none" onChange={(event) => changeScope(event.target.value)} value={locationScope}>
            <option value="India">India</option>
            <option value="International">International</option>
          </select>
        </label>
        {locationScope === 'International' ? (
          <select className="min-h-11 min-w-0 rounded-xl bg-white px-3 text-sm font-semibold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-blue-200" onChange={(event) => changeCountry(event.target.value)} value={countryCode}>
            {countryOptions.map((country) => <option key={country.isoCode} value={country.isoCode}>{country.name}</option>)}
          </select>
        ) : null}
        <select className="min-h-11 min-w-0 rounded-xl bg-white px-3 text-sm font-semibold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-blue-200" onChange={(event) => changeState(event.target.value)} value={stateCode}>
          <option value="">All states</option>
          {stateOptions.map((state) => <option key={state.isoCode} value={state.isoCode}>{state.name}</option>)}
        </select>
        <select className="min-h-11 min-w-0 rounded-xl bg-white px-3 text-sm font-semibold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-blue-200" onChange={(event) => setCity(event.target.value)} value={city}>
          <option value="">All cities</option>
          {cityOptions.map((cityOption) => <option key={`${cityOption.name}-${cityOption.latitude}-${cityOption.longitude}`} value={cityOption.name}>{cityOption.name}</option>)}
        </select>
      </div>
    </form>
  )
}
