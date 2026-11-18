import React from 'react'

interface StarSparkleProps {
  className?: string
  size?: number
  color?: string
}

export const StarSparkle: React.FC<StarSparkleProps> = ({
  className = '',
  size = 20,
  color = '#68002C',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-hidden="true"
    >
      <path
        d="M20 0 C20 11, 29 20, 40 20 C29 20, 20 29, 20 40 C20 29, 11 20, 0 20 C11 20, 20 11, 20 0 Z"
        fill={color}
      />
    </svg>
  )
}
