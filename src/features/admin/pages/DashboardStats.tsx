// ============================================================
// DASHBOARD STATS COMPONENT
// Bounded Context: User Management (Core)
// ============================================================

"use client";

import { useAdminUserCount } from "../api/useAdminUsers";

export function DashboardStats() {
  const { data: counts, isLoading } = useAdminUserCount();

  const stats = [
    {
      name: "Total Students",
      value: counts?.student || 0,
      change: "+12%",
      changeType: "increase",
      icon: "👨‍🎓",
    },
    {
      name: "Active Students",
      value: counts?.student || 0, // Will be filtered by status in real implementation
      change: "+5%",
      changeType: "increase",
      icon: "✅",
    },
    {
      name: "Total Teachers",
      value: counts?.teacher || 0,
      change: "+8%",
      changeType: "increase",
      icon: "👨‍🏫",
    },
    {
      name: "Active Teachers",
      value: counts?.teacher || 0,
      change: "+3%",
      changeType: "increase",
      icon: "✅",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl" aria-hidden="true">
                {stat.icon}
              </span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {stat.name}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                stat.changeType === "increase"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {stat.change}
              <span className="ml-1 text-gray-500 dark:text-gray-400">from last month</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
