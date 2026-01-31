"use client";

import { FC, useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownProps {
  endTime: number; // Unix timestamp in seconds
  onComplete?: () => void;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Countdown: FC<CountdownProps> = ({ 
  endTime, 
  onComplete, 
  showIcon = true,
  size = "md" 
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft(null);
        onComplete?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / 86400),
        hours: Math.floor((difference % 86400) / 3600),
        minutes: Math.floor((difference % 3600) / 60),
        seconds: difference % 60,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (!timeLeft) {
    return (
      <div className={`flex items-center gap-2 text-error-400 ${sizeClasses[size]}`}>
        {showIcon && <Clock className={iconSizes[size]} />}
        <span className="font-medium">Ended</span>
      </div>
    );
  }

  // Determine urgency styling
  const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const isUrgent = totalSeconds < 3600; // Less than 1 hour
  const isCritical = totalSeconds < 300; // Less than 5 minutes

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      {showIcon && (
        <Clock 
          className={`${iconSizes[size]} ${
            isCritical 
              ? "text-error-400" 
              : isUrgent 
                ? "text-warning-400" 
                : "text-accent-500"
          }`} 
        />
      )}
      <div className="flex gap-1 font-mono">
        {timeLeft.days > 0 && (
          <>
            <span className="text-surface-100 font-medium">{timeLeft.days}d</span>
            <span className="text-surface-500">:</span>
          </>
        )}
        <span className={`font-medium ${isCritical ? "text-error-400" : "text-surface-100"}`}>
          {String(timeLeft.hours).padStart(2, "0")}h
        </span>
        <span className="text-surface-500">:</span>
        <span className={`font-medium ${isCritical ? "text-error-400" : "text-surface-100"}`}>
          {String(timeLeft.minutes).padStart(2, "0")}m
        </span>
        <span className="text-surface-500">:</span>
        <span className={`font-medium ${isCritical ? "text-error-400" : "text-accent-400"}`}>
          {String(timeLeft.seconds).padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
};
