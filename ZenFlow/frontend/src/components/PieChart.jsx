import React from 'react';

const PieChart = ({ data, size = 200 }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const radius = size / 2;
  const center = radius;
  const strokeWidth = 20;

  let cumulativeAngle = 0;

  const paths = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + (radius - strokeWidth / 2) * Math.cos(startAngleRad);
    const y1 = center + (radius - strokeWidth / 2) * Math.sin(startAngleRad);
    const x2 = center + (radius - strokeWidth / 2) * Math.cos(endAngleRad);
    const y2 = center + (radius - strokeWidth / 2) * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius - strokeWidth / 2} ${radius - strokeWidth / 2} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    ].join(' ');

    cumulativeAngle += angle;

    return (
      <path
        key={index}
        d={pathData}
        fill="none"
        stroke={item.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    );
  });

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {paths}
      </svg>
    </div>
  );
};

export default PieChart;