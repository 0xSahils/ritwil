import React from 'react'

const PieChart = ({ percentage, size = 50, colorClass }) => {
  const radius = size / 2 - 4
  const center = size / 2
  const innerRadius = radius * 0.65 // For donut effect
  const circumference = 2 * Math.PI * radius
  
  // Cap visual fill at 100%; for 100% we use two 180° arcs (SVG arc with start=end draws nothing)
  const fillPercent = Math.min(percentage, 100)
  const angle = (fillPercent / 100) * 360
  const largeArcFlag = angle > 180 ? 1 : 0

  // Calculate end point of the arc
  const endAngle = (angle * Math.PI) / 180
  const endX = center + radius * Math.sin(endAngle)
  const endY = center - radius * Math.cos(endAngle)

  // Start from top (12 o'clock position)
  const startX = center
  const startY = center - radius

  // Inner circle points for donut effect
  const innerEndX = center + innerRadius * Math.sin(endAngle)
  const innerEndY = center - innerRadius * Math.cos(endAngle)
  const innerStartX = center
  const innerStartY = center - innerRadius

  // Full donut path when 100%: two 180° arcs (single 360° arc has start=end and SVG omits it)
  const fullDonutPath = `M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center} ${center + radius} A ${radius} ${radius} 0 1 1 ${center} ${center - radius} L ${center} ${center - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center + innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius} Z`
  const slicePath = `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L ${innerEndX} ${innerEndY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY} Z`
  
  // Get gradient colors based on percentage
  const getGradientColors = (percentage) => {
    if (percentage <= 30) {
      // Red for 0-30%
      return { start: '#ef4444', end: '#dc2626', stop1: '#f87171' }
    } else if (percentage <= 80) {
      // Yellow for 30-80%
      return { start: '#eab308', end: '#ca8a04', stop1: '#facc15' }
    } else {
      // Green for above 80%
      return { start: '#22c55e', end: '#16a34a', stop1: '#4ade80' }
    }
  }
  
  const gradientColors = getGradientColors(percentage)
  const gradientId = `pie-gradient-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="relative flex-shrink-0 group" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-md"
           style={{
             background: `radial-gradient(circle, ${gradientColors.start} 0%, transparent 70%)`,
             transform: 'scale(1.2)'
           }}
      />
      
      <svg width={size} height={size} className="transform -rotate-90 relative z-10 drop-shadow-lg">
        <defs>
          {/* Gradient definition */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.start} stopOpacity="1" />
            <stop offset="50%" stopColor={gradientColors.stop1} stopOpacity="1" />
            <stop offset="100%" stopColor={gradientColors.end} stopOpacity="1" />
          </linearGradient>
          
          {/* Shadow filter */}
          <filter id={`shadow-${gradientId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle - visible track so 0% doesn't look blank */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-200"
        />
        
        {/* Inner background circle for donut effect */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="white"
          className="drop-shadow-sm"
        />
        
        {/* Progress pie slice with gradient; use full donut path when >= 100% so arc is drawn */}
        {percentage > 0 && (
          <path
            d={fillPercent >= 100 ? fullDonutPath : slicePath}
            fill={`url(#${gradientId})`}
            filter={`url(#shadow-${gradientId})`}
            className="transition-all duration-500 ease-out animate-scaleIn"
            style={{
              transformOrigin: `${center}px ${center}px`
            }}
          />
        )}
      </svg>
      
      {/* Percentage text in center with enhanced styling */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <span className="text-[11px] font-extrabold text-slate-800 leading-none drop-shadow-sm" style={{
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
        }}>
          {Math.round(percentage)}
        </span>
        <span className="text-[8px] font-semibold text-slate-500 leading-none mt-0.5">%</span>
      </div>
      
      {/* Animated ring effect */}
      {percentage > 80 && (
        <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping" style={{ animationDuration: '2s' }} />
      )}
    </div>
  )
}

export default PieChart
