import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Protected Student Pages
import { StudentDashboardPage } from '../pages/StudentDashboardPage';
import { ProjectsListPage } from '../pages/ProjectsListPage';
import { NewProjectPage } from '../pages/NewProjectPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';

// Protected Freelancer & Admin Pages
import { FreelancerDashboardPage } from '../pages/FreelancerDashboardPage';
import { BrowseProjectsPage } from '../pages/BrowseProjectsPage';
import { FreelancerProjectDetailPage } from '../pages/FreelancerProjectDetailPage';
import { ProposalsListPage } from '../pages/ProposalsListPage';
import { ActiveProjectsPage } from '../pages/ActiveProjectsPage';
import { ProjectWorkspacePage } from '../pages/ProjectWorkspacePage';
import { EarningsPage } from '../pages/EarningsPage';

// Admin Portal Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from '../pages/admin/AdminUserDetailPage';
import { AdminStudentsPage } from '../pages/admin/AdminStudentsPage';
import { AdminAssistantsPage } from '../pages/admin/AdminAssistantsPage';
import { AdminProjectsPage } from '../pages/admin/AdminProjectsPage';
import { AdminProjectDetailPage } from '../pages/admin/AdminProjectDetailPage';
import { AdminProposalsPage } from '../pages/admin/AdminProposalsPage';
import { AdminDeliveriesPage } from '../pages/admin/AdminDeliveriesPage';
import { AdminFilesPage } from '../pages/admin/AdminFilesPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminActivityPage } from '../pages/admin/AdminActivityPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/dashboard" element={<StudentDashboardPage />} />
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/projects/new" element={<NewProjectPage />} />
      </Route>

      {/* Shared Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'freelancer', 'admin']} />}>
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Protected Freelancer/Assistant Routes */}
      <Route element={<ProtectedRoute allowedRoles={['freelancer']} />}>
        <Route path="/freelancer" element={<FreelancerDashboardPage />} />
        <Route path="/freelancer/projects" element={<BrowseProjectsPage />} />
        <Route path="/freelancer/projects/:id" element={<FreelancerProjectDetailPage />} />
        <Route path="/freelancer/proposals" element={<ProposalsListPage />} />
        <Route path="/freelancer/active-projects" element={<ActiveProjectsPage />} />
        <Route path="/freelancer/projects/:id/workspace" element={<ProjectWorkspacePage />} />
        <Route path="/freelancer/earnings" element={<EarningsPage />} />
      </Route>

      {/* Protected Admin Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
        <Route path="/admin/students" element={<AdminStudentsPage />} />
        <Route path="/admin/assistants" element={<AdminAssistantsPage />} />
        <Route path="/admin/projects" element={<AdminProjectsPage />} />
        <Route path="/admin/projects/:id" element={<AdminProjectDetailPage />} />
        <Route path="/admin/proposals" element={<AdminProposalsPage />} />
        <Route path="/admin/deliveries" element={<AdminDeliveriesPage />} />
        <Route path="/admin/files" element={<AdminFilesPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/activity" element={<AdminActivityPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};