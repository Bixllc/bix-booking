interface BixMarkProps {
  size?: number
  className?: string
}

export function BixMark({ size = 30, className = '' }: BixMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9 6v20M9 6c5 0 8 2.4 8 6s-3 5-6 5c4 0 7.5 2 7.5 5.5S15.5 26 12 26"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
