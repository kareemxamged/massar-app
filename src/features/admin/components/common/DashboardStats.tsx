// src/features/admin/components/common/DashboardStats.tsx
"use client";

import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  UserPlus,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface DashboardStatsProps {
  totalStudents?: number;
  totalTeachers?: number;
  activeUsers?: number;
  suspendedUsers?: number;
  newRegistrations?: number;
  recentChanges?: number;
  isLoading?: boolean;
  className?: string;
}

export function DashboardStats({
  totalStudents = 0,
  totalTeachers = 0,
  activeUsers = 0,
  suspendedUsers = 0,
  newRegistrations = 0,
  recentChanges = 0,
  isLoading = false,
  className,
}: DashboardStatsProps) {
  const totalUsers = totalStudents + totalTeachers;
  const activeRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
  const suspendedRate = totalUsers > 0 ? (suspendedUsers / totalUsers) * 100 : 0;

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      trend: "+12% from last month",
      trendUp: true,
    },
    {
      title: "Total Teachers",
      value: totalTeachers,
      icon: UserCheck,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      trend: "+3 new this month",
      trendUp: true,
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: TrendingUp,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      trend: `${activeRate.toFixed(1)}% active rate`,
      trendUp: activeRate > 90,
    },
    {
      title: "Suspended Users",
      value: suspendedUsers,
      icon: UserX,
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      trend: `${suspendedRate.toFixed(1)}% of total`,
      trendUp: suspendedRate < 5,
    },
  ];

  if (isLoading) {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardTitle>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border-gray-200 dark:border-gray-800 transition-all hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </CardTitle>
            <div
              className={cn(
                "p-2 rounded-lg",
                stat.bgColor
              )}
            >
              <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stat.value.toLocaleString()}
            </div>
            <p
              className={cn(
                "text-xs mt-1",
                stat.trendUp
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {stat.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// User Distribution Card with Progress Bars
export function UserDistributionCard({
  students,
  teachers,
  active,
  suspended,
  isLoading,
}: {
  students: number;
  teachers: number;
  active: number;
  suspended: number;
  isLoading?: boolean;
}) {
  const total = students + teachers;
  const studentPercentage = total > 0 ? (students / total) * 100 : 0;
  const teacherPercentage = total > 0 ? (teachers / total) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            User Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Students</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Loading...
              </span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Teachers</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Loading...
              </span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">
          User Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Students */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Students
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {students.toLocaleString()} ({studentPercentage.toFixed(1)}%)
            </span>
          </div>
          <Progress value={studentPercentage} className="h-2 bg-blue-100 dark:bg-blue-900/30" />
        </div>

        {/* Teachers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Teachers
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {teachers.toLocaleString()} ({teacherPercentage.toFixed(1)}%)
            </span>
          </div>
          <Progress value={teacherPercentage} className="h-2 bg-green-100 dark:bg-green-900/30" />
        </div>

        {/* Status Breakdown */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            User Status
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Active
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {active.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Suspended
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {suspended.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activity Card
export function RecentActivityCard({
  newRegistrations,
  recentChanges,
  isLoading,
}: {
  newRegistrations: number;
  recentChanges: number;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">
          Today's Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {newRegistrations}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              New Registrations
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {recentChanges}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Status Changes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
