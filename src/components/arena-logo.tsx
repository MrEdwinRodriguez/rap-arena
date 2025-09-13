interface ArenaLogoProps {
  className?: string
  size?: number
}

export function ArenaLogo({ className = "", size = 32 }: ArenaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Microphone capsule */}
      <ellipse cx="50" cy="25" rx="18" ry="25" fill="currentColor" />

      {/* Microphone grille lines */}
      <line x1="35" y1="15" x2="65" y2="15" stroke="black" strokeWidth="2" />
      <line x1="35" y1="20" x2="65" y2="20" stroke="black" strokeWidth="2" />
      <line x1="35" y1="25" x2="65" y2="25" stroke="black" strokeWidth="2" />
      <line x1="35" y1="30" x2="65" y2="30" stroke="black" strokeWidth="2" />
      <line x1="35" y1="35" x2="65" y2="35" stroke="black" strokeWidth="2" />

      {/* Microphone stand */}
      <rect x="47" y="50" width="6" height="35" fill="currentColor" />

      {/* Microphone base */}
      <ellipse cx="50" cy="85" rx="20" ry="8" fill="currentColor" />
    </svg>
  )
}
