"use client";

import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "interactive";
}

export const Card: FC<CardProps> = ({ children, className, variant = "default" }) => {
  const variants = {
    default: "card",
    elevated: "card-elevated",
    interactive: "card-interactive",
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader: FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4";
}

export const CardTitle: FC<CardTitleProps> = ({ children, className, as: Component = "h3" }) => {
  return (
    <Component className={cn("text-lg font-semibold text-surface-100", className)}>
      {children}
    </Component>
  );
};

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const CardDescription: FC<CardDescriptionProps> = ({ children, className }) => {
  return (
    <p className={cn("text-surface-400 text-sm mt-1", className)}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn("mt-4 pt-4 border-t border-surface-800", className)}>
      {children}
    </div>
  );
};
