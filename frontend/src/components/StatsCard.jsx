const icons = {
  weight: (
    // trending-up — weight trend over time
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  steps: (
    // activity / EKG line — physical activity
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  sleep: (
    // crescent moon
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  heartRate: (
    // heart
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
}

export default function StatsCard({ label, value, unit, icon = 'weight' }) {
  return (
    <div className="group bg-card rounded-2xl border border-border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
      <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white shadow-accent mb-4 flex-shrink-0">
        {icons[icon]}
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
        {label}
      </p>
      <p className="text-3xl font-bold text-foreground tracking-tight leading-none">
        {value != null
          ? value
          : <span className="text-muted-foreground/40">—</span>
        }
        {value != null && unit && (
          <span className="text-sm font-normal text-muted-foreground ml-1.5">{unit}</span>
        )}
      </p>
    </div>
  )
}
