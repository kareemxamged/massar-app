// src/features/admin/components/common/UserStatusBadge.tsx
"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export interface UserStatusBadgeProps {
  status: "active" | "suspended" | "inactive";
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export function UserStatusBadge({
  status,
  size = "md",
  showTooltip = true,
  className,
}: UserStatusBadgeProps) {
  const statusStyles = {
    active: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-200",
      border: "border-green-200 dark:border-green-800",
      icon: CheckCircle2,
      iconColor: "text-green-600 dark:text-green-400",
      label: "Active",
    },
    suspended: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-200",
      border: "border-red-200 dark:border-red-800",
      icon: XCircle,
      iconColor: "text-red-600 dark:text-red-400",
      label: "Suspended",
    },
    inactive: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-800 dark:text-gray-200",
      border: "border-gray-200 dark:border-gray-700",
      icon: XCircle,
      iconColor: "text-gray-500 dark:text-gray-400",
      label: "Inactive",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-0.5 text-sm gap-1.5",
    lg: "px-3 py-1 text-base gap-2",
  };

  const statusStyle = statusStyles[status];
  const StatusIcon = statusStyle.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors",
        statusStyle.bg,
        statusStyle.text,
        statusStyle.border,
        sizeStyles[size],
        className
      )}
      title={showTooltip ? statusStyle.label : undefined}
      role="status"
      aria-label={`Status: ${statusStyle.label}`}
      aria-live="polite"
    >
      <StatusIcon className={cn("w-3.5 h-3.5 flex-shrink-0", statusStyle.iconColor)} />
      <span className="sr-only sm:not-sr-only sm:static">{statusStyle.label}</span>
    </span>
  );
}
