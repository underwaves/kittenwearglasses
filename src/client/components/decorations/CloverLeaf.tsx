import React from 'react'

interface CloverLeafProps {
  className?: string
  size?: number
  color?: string
}

export const CloverLeaf: React.FC<CloverLeafProps> = ({
  className = '',
  size = 32,
  color = '#CDE8A8',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block drop-shadow-xs ${className}`}
      aria-hidden="true"
    >
      {/* Curved Stem */}
      <path
        d="M50 52 C48 70, 54 84, 65 92"
        stroke="#5E8B34"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Top Heart Leaf */}
      <path
        d="M50 48 C36 36, 30 16, 43 14 C48 13, 50 18, 50 20 C50 18, 52 13, 57 14 C70 16, 64 36, 50 48 Z"
        fill={color}
        stroke="#5E8B34"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Bottom Heart Leaf */}
      <path
        d="M50 52 C36 64, 30 84, 43 86 C48 87, 50 82, 50 80 C50 82, 52 87, 57 86 C70 84, 64 64, 50 52 Z"
        fill={color}
        stroke="#5E8B34"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Left Heart Leaf */}
      <path
        d="M48 50 C36 36, 16 30, 14 43 C13 48, 18 50, 20 50 C18 50, 13 52, 14 57 C16 70, 36 64, 48 50 Z"
        fill={color}
        stroke="#5E8B34"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Right Heart Leaf */}
      <path
        d="M52 50 C64 36, 84 30, 86 43 C87 48, 82 50, 80 50 C82 50, 87 52, 86 57 C84 70, 64 64, 52 50 Z"
        fill={color}
        stroke="#5E8B34"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Center Dot */}
      <circle cx="50" cy="50" r="3.5" fill="#5E8B34" />
      <circle cx="49" cy="49" r="1.2" fill="#FAF6F0" />
    </svg>
  )
}
