"use client";

import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("card", className)}>
      {children}
    </div>
  );
};

export const CardHeader: FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
};

export const CardTitle: FC<CardProps> = ({ children, className }) => {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  );
};

export const CardDescription: FC<CardProps> = ({ children, className }) => {
  return (
    <p className={cn("text-midnight-400 text-sm mt-1", className)}>
      {children}
    </p>
  );
};

export const CardContent: FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

export const CardFooter: FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("mt-4 pt-4 border-t border-midnight-700", className)}>
      {children}
    </div>
  );
};
