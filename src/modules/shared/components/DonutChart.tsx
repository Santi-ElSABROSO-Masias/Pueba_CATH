import React from 'react';

interface DonutChartProps {
  passed: number; // Percentage
  failed: number; // Percentage
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ passed, failed, size = 200 }) => {
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const passedOffset = circumference * (1 - passed / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#8B5CF6" // Failed color (purple)
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#10B981" // Passed color (green)
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={passedOffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="24" fontWeight="bold" fill="#1E293B">
        {passed}%
      </text>
    </svg>
  );
};
