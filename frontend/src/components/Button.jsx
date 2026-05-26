import { Link } from 'react-router-dom'

export function Button({ children, to, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-[7px] px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-100'
  const variants = {
    primary: 'bg-[#0057B8] !text-white shadow-lg shadow-[#0057B8]/20 hover:bg-[#004694]',
    secondary: 'bg-[#0057B8] !text-white shadow-lg shadow-[#0057B8]/20 hover:bg-[#004694]',
    teal: 'bg-[#0057B8] text-white shadow-lg shadow-[#0057B8]/20 hover:bg-[#004694]',
    ghost: 'bg-[#0057B8] !text-white shadow-lg shadow-[#0057B8]/20 hover:bg-[#004694]',
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
