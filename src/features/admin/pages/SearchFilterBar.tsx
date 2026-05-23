// ============================================================
// SEARCH FILTER BAR COMPONENT
// Bounded Context: User Management (Core)
// ============================================================

"use client";

import { useState, useEffect } from "react";

interface SearchFilterBarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  selectedStatus: "all" | "active" | "suspended";
  onStatusFilter: (status: "all" | "active" | "suspended") => void;
  totalResults: number;
}

export function SearchFilterBar({
  searchTerm,
  onSearch,
  selectedStatus,
  onStatusFilter,
  totalResults,
}: SearchFilterBarProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearch(value);
  };

  const handleStatusChange = (status: "all" | "active" | "suspended") => {
    onStatusFilter(status);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={localSearchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, email, or student ID..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          />
          {localSearchTerm && (
            <button
              onClick={() => {
                setLocalSearchTerm("");
                onSearch("");
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value as "all" | "active" | "suspended")}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalResults} result{totalResults !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
