export default function HeroBall({
  className,
  width = 280,
  height = 280,
  ...props
}) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 280 280"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id="ball-glow" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.14" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* outer circle */}
      <circle
        cx="140"
        cy="140"
        r="135"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity="0.18"
      />
      {/* inner glow */}
      <circle cx="140" cy="140" r="135" fill="url(#ball-glow)" />
      {/* center pentagon */}
      <path
        d="M140 84l18 13-7 22h-22l-7-22z"
        fill="currentColor"
        opacity="0.13"
      />
      <path
        d="M140 84l18 13-7 22h-22l-7-22z"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.2"
      />
      {/* surrounding irregular panels — top */}
      <path
        d="M122 86l-38 27 7 22 34-12 4-14z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.16"
      />
      <path
        d="M158 86l38 27-7 22-34-12-4-14z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.16"
      />
      {/* side panels */}
      <path
        d="M84 113l-12 35 23 16 27-20-3-23z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.16"
      />
      <path
        d="M196 113l12 35-23 16-27-20 3-23z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.16"
      />
      {/* bottom panels */}
      <path
        d="M95 164l-8 25 25 18 18-14-3-24z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.16"
      />
      <path
        d="M185 164l8 25-25 18-18-14 3-24z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.16"
      />
      {/* bottom pentagon */}
      <path
        d="M112 193l7 22h22l7-22-18-13z"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="currentColor"
        opacity="0.08"
      />
      {/* top accent dots */}
      <circle cx="140" cy="112" r="2.5" fill="currentColor" opacity="0.25" />
      <circle cx="112" cy="122" r="2.5" fill="currentColor" opacity="0.25" />
      <circle cx="168" cy="122" r="2.5" fill="currentColor" opacity="0.25" />
    </svg>
  )
}