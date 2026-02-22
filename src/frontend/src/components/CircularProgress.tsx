import { useEffect, useState } from 'react';

interface CircularProgressProps {
  percentage: number;
  total: number;
  target: number;
  remaining: number;
}

export default function CircularProgress({ percentage, total, target, remaining }: CircularProgressProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const offset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div className="glass-card metallic-border p-6 rounded-lg flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.30 0.02 264)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.55 0.20 264)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1500 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px oklch(0.55 0.20 264 / 0.5))',
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{animatedPercentage.toFixed(1)}%</span>
          <span className="text-sm text-muted-foreground mt-1">Complete</span>
        </div>
      </div>
      <div className="mt-6 text-center space-y-2 w-full">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Produced:</span>
          <span className="text-lg font-semibold">{total}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Target:</span>
          <span className="text-lg font-semibold">{target}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <span className="text-sm text-muted-foreground">Remaining:</span>
          <span className="text-lg font-semibold text-primary">{remaining}</span>
        </div>
      </div>
    </div>
  );
}
