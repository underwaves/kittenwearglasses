import React from 'react'

interface RibbonBowProps {
  className?: string
  size?: number
  color?: string
}

export const RibbonBow: React.FC<RibbonBowProps> = ({
  className = '',
  size = 36,
  color = '#68002C',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block drop-shadow-xs ${className}`}
      aria-hidden="true"
    >
      {/* Left Tail */}
      <path
        d="M44 40 C36 53, 22 67, 17 78 C25 74, 31 73, 37 76 C42 64, 46 51, 48 40 Z"
        fill="#E098AC"
        stroke={color}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Right Tail */}
      <path
        d="M56 40 C64 53, 78 67, 83 78 C75 74, 69 73, 63 76 C58 64, 54 51, 52 40 Z"
        fill="#E098AC"
        stroke={color}
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      {/* Left Loop */}
      <path
        d="M48 34 C34 11, 7 15, 10 37 C12 55, 37 49, 48 39 Z"
        fill="#E098AC"
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Left Loop Inner Crease Highlight */}
      <path
        d="M44 35 C34 25, 21 26, 20 35"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Right Loop */}
      <path
        d="M52 34 C66 11, 93 15, 90 37 C88 55, 63 49, 52 39 Z"
        fill="#E098AC"
        stroke={color}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Right Loop Inner Crease Highlight */}
      <path
        d="M56 35 C66 25, 79 26, 80 35"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Center Knot */}
      <rect
        x="42.5"
        y="29"
        width="15"
        height="14"
        rx="6.5"
        fill={color}
        stroke="#FAF6F0"
        strokeWidth="1.8"
      />
      {/* Pearl Highlight on Knot */}
      <circle cx="47.5" cy="33.5" r="1.8" fill="#FAF6F0" opacity="0.9" />
    </svg>
  )
}
