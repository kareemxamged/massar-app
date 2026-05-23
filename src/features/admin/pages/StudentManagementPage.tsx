// ============================================================
// STUDENT MANAGEMENT PAGE
// Bounded Context: User Management (Core)
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useAdminUsers, useUserActions } from "../api/useAdminUsers";
import { useUserActions as useUserActionsHook } from "../api/useUserActions";
import type { AdminUser } from "../types";
import { DashboardStats } from "./DashboardStats";
import { SearchFilterBar } from "./SearchFilterBar";
import { UserDataTable } from "./UserDataTable";
import { StudentEditDrawer } from "./StudentEditDrawer";
import { ConfirmationModal } from "./ConfirmationModal";
import { ActionButtons } from "./ActionButtons";
import { ExportButton } from "./ExportButton";

export function StudentManagementPage() {
  // State management
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "suspended">("all");

  // Fetch students with role filter
  const { data: studentsData, isLoading, error } = useAdminUsers({
    role: "student",
    search: searchTerm || undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  // Get mutations
  const {
    updateUserStatus,
    updateUserStatusIsPending,
    updateUserProfile,
    updateUserProfileIsPending,
    deleteUser,
    deleteUserIsPending,
    deleteUserError,
  } = useUserActionsHook();

  const students = studentsData?.data || [];
  const total = studentsData?.total || 0;

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle status filter
  const handleStatusFilter = (status: "all" | "active" | "suspended") => {
    setSelectedStatus(status);
  };

  // Handle edit
  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditDrawerOpen(true);
  };

  // Handle delete
  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle suspend
  const handleSuspend = (user: AdminUser) => {
    setSelectedUser(user);
    setIsSuspendModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Handle confirm suspend
  const handleConfirmSuspend = () => {
    if (selectedUser) {
      updateUserStatus(selectedUser.id, "suspended");
      setIsSuspendModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Handle save edit
  const handleSaveEdit = async (data: Partial<AdminUser>) => {
    if (selectedUser) {
      await updateUserProfile(selectedUser.id, {
        full_name: data.full_name,
        major: data.major,
        level: data.level,
        specialization: data.specialization,
        department: data.department,
        avatar_url: data.avatar_url,
      });
      setIsEditDrawerOpen(false);
      setSelectedUser(null);
    }
  };

  // Handle reset password
  const handleResetPassword = async (user: AdminUser) => {
    try {
      // This would typically call an API endpoint that sends password reset email
      // For now, we'll show a success message
      alert(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error("Failed to reset password:", error);
    }
  };

  // Handle export CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Major", "Level", "Status", "Created At"];
    const rows = students.map((student) => [
      student.id,
      student.full_name,
      student.email,
      student.major || "",
      student.level || "",
      student.status,
      new Date(student.created_at).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle close edit drawer
  const handleCloseEditDrawer = () => {
    setIsEditDrawerOpen(false);
    setSelectedUser(null);
  };

  // Handle close delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // Handle close suspend modal
  const handleCloseSuspendModal = () => {
    setIsSuspendModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Student Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage student accounts, roles, and permissions
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <ExportButton onClick={handleExportCSV} disabled={students.length === 0} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Search and Filter Bar */}
        <div className="mt-6">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearch={handleSearch}
            selectedStatus={selectedStatus}
            onStatusFilter={handleStatusFilter}
            totalResults={total}
          />
        </div>

        {/* User Data Table */}
        <div className="mt-6">
          <UserDataTable
            users={students}
            isLoading={isLoading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSuspend={handleSuspend}
            selectedUser={selectedUser}
          />
        </div>
      </div>

      {/* Edit Drawer */}
      <StudentEditDrawer
        isOpen={isEditDrawerOpen}
        onClose={handleCloseEditDrawer}
        user={selectedUser}
        onSave={handleSaveEdit}
        onResetPassword={handleResetPassword}
        isSaving={updateUserProfileIsPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        isConfirming={deleteUserIsPending}
        variant="danger"
      />

      {/* Suspend Confirmation Modal */}
      <ConfirmationModal
        isOpen={isSuspendModalOpen}
        onClose={handleCloseSuspendModal}
        title="Suspend Student"
        message="Are you sure you want to suspend this student? They will lose access to the system."
        confirmText="Suspend"
        cancelText="Cancel"
        onConfirm={handleConfirmSuspend}
        isConfirming={updateUserStatusIsPending}
        variant="warning"
      />

      {/* Delete Error Toast */}
      {deleteUserError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <p className="font-medium">Error deleting user</p>
          <p className="text-sm">{deleteUserError.message}</p>
          <button
            onClick={() => {
              // Clear error
              deleteUserError = null;
            }}
            className="mt-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
