// src/features/admin/components/common/ActionButtons.tsx
"use client";

import { cn } from "@/lib/utils";
import { Edit, UserX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ActionButtonsProps {
  onEdit?: () => void;
  onToggleStatus?: () => void;
  currentStatus?: "active" | "suspended";
  onDelete?: () => void;
  isLoading?: boolean;
  showDelete?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ActionButtons({
  onEdit,
  onToggleStatus,
  currentStatus = "active",
  onDelete,
  isLoading = false,
  showDelete = true,
  size = "sm",
  className,
}: ActionButtonsProps) {
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={size === "sm" ? "icon" : "default"}
                className={cn(
                  buttonSize,
                  "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                onClick={onEdit}
                disabled={isLoading}
                aria-label="Edit user"
              >
                <Edit className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit user profile</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onToggleStatus && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={size === "sm" ? "icon" : "default"}
                className={cn(
                  buttonSize,
                  currentStatus === "suspended" &&
                    "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-950",
                  currentStatus === "active" &&
                    "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                onClick={onToggleStatus}
                disabled={isLoading}
                aria-label={
                  currentStatus === "active" ? "Suspend user" : "Activate user"
                }
              >
                <UserX className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {currentStatus === "active" ? "Suspend user" : "Activate user"}
              </p>
            </TooltipContent>
          </Tooltip>
        )}

        {showDelete && onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={size === "sm" ? "icon" : "default"}
                className={cn(
                  buttonSize,
                  "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                onClick={onDelete}
                disabled={isLoading}
                aria-label="Delete user"
              >
                <Trash2 className={iconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-red-600 dark:text-red-400">
                Delete user permanently
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
