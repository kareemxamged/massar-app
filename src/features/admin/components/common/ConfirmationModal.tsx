// src/features/admin/components/common/ConfirmationModal.tsx
"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  type?: "delete" | "suspend" | "warning";
  className?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  type = "delete",
  className,
}: ConfirmationModalProps) {
  const [confirmValue, setConfirmValue] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const isConfirmValid = confirmValue === confirmText;

  const handleConfirm = () => {
    if (isConfirmValid) {
      setIsConfirming(true);
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isConfirmValid) {
      handleConfirm();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "delete":
        return {
          icon: AlertTriangle,
          iconColor: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
          titleColor: "text-red-800 dark:text-red-200",
          buttonColor:
            "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
        };
      case "suspend":
        return {
          icon: AlertTriangle,
          iconColor: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-950/20",
          borderColor: "border-orange-200 dark:border-orange-800",
          titleColor: "text-orange-800 dark:text-orange-200",
          buttonColor:
            "bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600",
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          titleColor: "text-yellow-800 dark:text-yellow-200",
          buttonColor:
            "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600",
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-md",
          "bg-white dark:bg-gray-900",
          "border-gray-200 dark:border-gray-800",
          className
        )}
      >
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                styles.bgColor,
                styles.borderColor,
                "border"
              )}
            >
              <Icon className={cn("w-6 h-6", styles.iconColor)} />
            </div>
            <div className="flex-1">
              <DialogTitle
                className={cn("text-xl font-bold", styles.titleColor)}
              >
                {title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
                {description}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div
            className={cn(
              "border rounded-lg p-4",
              styles.borderColor,
              "bg-gray-50 dark:bg-gray-800/50"
            )}
          >
            <p className="font-semibold text-sm mb-2">
              Type the confirmation code below:
            </p>
            <Input
              type="text"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={confirmText}
              className={cn(
                "font-mono",
                "border-gray-300 dark:border-gray-700",
                "focus:border-blue-500 focus:ring-blue-500",
                "dark:bg-gray-800 dark:text-gray-100",
                isConfirmValid &&
                  "border-green-500 dark:border-green-500 focus:border-green-500 focus:ring-green-500",
                !isConfirmValid &&
                  confirmValue.length > 0 &&
                  "border-red-500 dark:border-red-500"
              )}
              aria-label="Confirmation code"
            />
            {confirmValue.length > 0 && (
              <p
                className={cn(
                  "text-xs mt-2",
                  isConfirmValid
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {isConfirmValid ? "✓ Confirmation code is correct" : "✗ Incorrect code"}
              </p>
            )}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-semibold mb-1">⚠️ This action will:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Permanently affect the selected user</li>
              <li>Cannot be undone once confirmed</li>
              <li>Be logged in the system audit trail</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="transition-colors"
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isConfirmValid || isConfirming}
            className={cn(
              "transition-all",
              styles.buttonColor,
              (!isConfirmValid || isConfirming) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {isConfirming ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Confirming...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
