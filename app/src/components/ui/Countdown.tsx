"use client";

import { FC, useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownProps {
  endTime: number; // Unix timestamp in seconds
  onComplete?: () => void;
}

export const Countdown: FC<CountdownProps> = ({ endTime, onComplete }) => {
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

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <Clock className="w-4 h-4" />
        <span>Ended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-shadow-400" />
      <div className="flex gap-1 font-mono text-sm">
        {timeLeft.days > 0 && (
          <span className="text-white">{timeLeft.days}d</span>
        )}
        <span className="text-white">
          {String(timeLeft.hours).padStart(2, "0")}h
        </span>
        <span className="text-midnight-400">:</span>
        <span className="text-white">
          {String(timeLeft.minutes).padStart(2, "0")}m
        </span>
        <span className="text-midnight-400">:</span>
        <span className="text-shadow-400">
          {String(timeLeft.seconds).padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
};
