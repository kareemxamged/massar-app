// src/features/admin/components/common/SearchFilterBar.tsx
"use client";

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface SearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  roleFilter?: "all" | "admin" | "teacher" | "student";
  onRoleFilterChange?: (role: "all" | "admin" | "teacher" | "student") => void;
  statusFilter?: "all" | "active" | "suspended";
  onStatusFilterChange?: (status: "all" | "active" | "suspended") => void;
  resultsCount?: number;
  placeholder?: string;
  className?: string;
}

export function SearchFilterBar({
  searchValue = "",
  onSearchChange,
  roleFilter = "all",
  onRoleFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
  resultsCount,
  placeholder = "Search users by name, email, or ID...",
  className,
}: SearchFilterBarProps) {
  const hasFilters =
    searchValue || roleFilter !== "all" || statusFilter !== "all";

  const handleClearFilters = () => {
    onSearchChange?.("");
    onRoleFilterChange?.("all");
    onStatusFilterChange?.("all");
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className={cn(
            "pl-10 transition-all",
            "border-gray-300 dark:border-gray-700",
            "focus:border-blue-500 focus:ring-blue-500",
            "dark:bg-gray-800 dark:text-gray-100",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500"
          )}
          aria-label="Search users"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange?.("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={roleFilter}
          onValueChange={(v) => onRoleFilterChange?.(v as any)}
        >
          <SelectTrigger className="w-[140px] sm:w-[160px] transition-colors">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange?.(v as any)}
        >
          <SelectTrigger className="w-[140px] sm:w-[160px] transition-colors">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="transition-colors"
            aria-label="Clear all filters"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results Count */}
      {resultsCount !== undefined && (
        <div className="text-sm text-gray-600 dark:text-gray-400 self-start sm:self-center">
          {resultsCount} user{resultsCount !== 1 ? "s" : ""} found
        </div>
      )}
    </div>
  );
}
