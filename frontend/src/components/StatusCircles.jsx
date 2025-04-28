import React from 'react';
import './StatusCircles.css';

const Circle = ({ label, percentage, color }) => {
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circle-container">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e6e6e6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="percentage">
          {percentage}%
        </text>
      </svg>
      <div className="label">{label}</div>
    </div>
  );
};

const StatusCircles = ({ stats }) => {
  return (
    <div className="status-circles">
      {Object.entries(stats).map(([key, value]) => {
        let color = '#ccc';
        if (key === 'seen') color = '#4caf50';
        else if (key === 'unseen') color = '#f44336';
        else if (key === 'reviewed') color = '#2196f3';
        else if (key === 'pending') color = '#ff9800';
        else if (key === 'resolved') color = '#9c27b0';

        const label = key.charAt(0).toUpperCase() + key.slice(1);
        return <Circle key={key} label={label} percentage={value} color={color} />;
      })}
    </div>
  );
};

export default StatusCircles;
