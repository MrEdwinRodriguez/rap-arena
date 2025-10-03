interface RapArenaLogoProps {
  className?: string
  width?: number
  height?: number
}

export function RapArenaLogo({ className, width = 200, height = 50 }: RapArenaLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Microphone Icon */}
      <g transform="translate(5, 10)">
        {/* Mic body */}
        <rect x="8" y="5" width="8" height="12" rx="4" fill="currentColor" opacity="0.9" />
        {/* Mic stand */}
        <line x1="12" y1="17" x2="12" y2="25" stroke="currentColor" strokeWidth="2" opacity="0.9" />
        {/* Mic base */}
        <line x1="6" y1="25" x2="18" y2="25" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      </g>

      {/* RAP text - Bold, urban style */}
      <text
        x="35"
        y="32"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="900"
        fill="currentColor"
        letterSpacing="1"
      >
        RAP
      </text>

      {/* ARENA text - Sleeker */}
      <text
        x="95"
        y="32"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="600"
        fill="currentColor"
        opacity="0.85"
        letterSpacing="0.5"
      >
        ARENA
      </text>
    </svg>
  )
} 