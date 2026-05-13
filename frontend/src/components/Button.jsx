import { Link } from 'react-router-dom'

export function Button({ children, to, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-100'
  const variants = {
    primary: 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700',
    secondary: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50',
    teal: 'bg-teal-500 text-white shadow-lg shadow-teal-100 hover:bg-teal-600',
    ghost: 'text-slate-700 hover:bg-slate-100',
  }
  const classes = `${base} ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  )
}
