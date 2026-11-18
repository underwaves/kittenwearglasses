import React from 'react'

interface PriceBadgeProps {
  price: string | number
  unit?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({
  price,
  unit = '฿',
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-28 h-28',
  }

  const priceStr = String(price).trim()
  const isLong = priceStr.length > 5
  const hasUnit = Boolean(unit && unit.trim())

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className} animate-float select-none flex-shrink-0`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
        aria-hidden="true"
      >
        {/* Symmetrical 8-point Star in Crystal Blue */}
        <polygon
          points="50,2 62,23 85,15 77,38 98,50 77,62 85,85 62,77 50,98 38,77 15,85 23,62 2,50 23,38 15,15 38,23"
          fill="#DFEEF7"
          stroke="#A6C9DD"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Text centered mathematically inside the star in Beet Red & Rum Raisin */}
        {hasUnit ? (
          <>
            <text
              x="50"
              y="44"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#68002C"
              fontWeight="700"
              fontSize={isLong ? '13' : '17'}
              fontFamily="'Prompt', sans-serif"
            >
              {priceStr}
            </text>
            <text
              x="50"
              y="61"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#441910"
              fontWeight="600"
              fontSize="10"
              fontFamily="'Prompt', sans-serif"
              letterSpacing="0.05em"
            >
              {unit}
            </text>
          </>
        ) : (
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#68002C"
            fontWeight="700"
            fontSize={isLong ? '13' : '16'}
            fontFamily="'Prompt', sans-serif"
          >
            {priceStr}
          </text>
        )}
      </svg>
    </div>
  )
}
