export function Section({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <section className={`py-14 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || subtitle) && (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>}
            {title && <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>}
            {subtitle && <p className="mt-4 text-base leading-7 text-slate-500">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
