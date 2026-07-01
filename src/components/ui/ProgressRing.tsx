interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function ProgressRing({ progress, size = 34, strokeWidth = 3, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#ededf2" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#bf9a42"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      {label && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-semibold text-ink">
          {label}
        </span>
      )}
    </div>
  )
}
