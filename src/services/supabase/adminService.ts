import { supabase, isSupabaseConfigured } from './client';
import {
  Profile,
  Project,
  ProjectFile,
  Proposal,
  Delivery,
  EarningRecord,
  AssistantProfile,
  AdminAuditLog,
  SystemAnnouncement,
  PlatformSettings,
  UserRole,
  UserStatus,
  AssistantApprovalStatus,
  ProjectStatus,
} from '../../types';
import { ACADEMIC_CATEGORIES, AcademicCategory } from '../../constants/categories';
import { projectService } from './projectService';
import { proposalService } from './proposalService';

const LOCAL_AUDIT_KEY = 'student_assistant_admin_audit_logs';
const LOCAL_ANNOUNCEMENTS_KEY = 'student_assistant_announcements';
const LOCAL_SETTINGS_KEY = 'student_assistant_platform_settings';
const LOCAL_CATEGORIES_KEY = 'student_assistant_categories';
const LOCAL_ASSISTANTS_KEY = 'student_assistant_profiles_freelancers';
const LOCAL_PROFILES_KEY = 'student_assistant_profiles';

const DEFAULT_SETTINGS: PlatformSettings = {
  platform_name: 'Student Assistant',
  platform_description: 'Next-Generation Academic Project & Freelance Assistant Platform',
  default_currency: 'PKR',
  default_project_status: 'Submitted',
  max_file_size_mb: 25,
  allowed_file_types: ['pdf', 'docx', 'doc', 'zip', 'py', 'js', 'ts', 'cpp', 'java', 'sql', 'pptx', 'xlsx', 'png', 'jpg'],
  maintenance_mode: false,
  require_assistant_approval: true,
  commission_rate_percentage: 10,
  support_email: 'support@studentassistant.com',
};

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'audit-1',
    user_id: 'usr-admin',
    user_name: 'Platform Administrator',
    user_role: 'admin',
    action: 'Platform Initialized',
    details: 'Security controls, Supabase RLS policies and marketplace verification active.',
    target_type: 'system',
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'audit-2',
    user_id: 'usr-admin',
    user_name: 'Platform Administrator',
    user_role: 'admin',
    action: 'Assistant Approved',
    details: 'Approved academic credentials for Muhammad Hamza (Data Analysis & ML Specialist).',
    target_type: 'user',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'audit-3',
    user_id: 'usr-admin',
    user_name: 'Platform Administrator',
    user_role: 'admin',
    action: 'Category Updated',
    details: 'Active status confirmed for FYP & Thesis Writing category.',
    target_type: 'category',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

function getStoredAuditLogs(): AdminAuditLog[] {
  const stored = localStorage.getItem(LOCAL_AUDIT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // empty
    }
  }
  localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
  return INITIAL_AUDIT_LOGS;
}

function saveStoredAuditLogs(logs: AdminAuditLog[]): void {
  localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(logs));
}

function getStoredCategories(): AcademicCategory[] {
  const stored = localStorage.getItem(LOCAL_CATEGORIES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // empty
    }
  }
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(ACADEMIC_CATEGORIES));
  return ACADEMIC_CATEGORIES;
}

function saveStoredCategories(cats: AcademicCategory[]): void {
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(cats));
}

function getStoredAnnouncements(): SystemAnnouncement[] {
  const stored = localStorage.getItem(LOCAL_ANNOUNCEMENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // empty
    }
  }
  const defaultAnnouncements: SystemAnnouncement[] = [
    {
      id: 'ann-1',
      title: 'Midterm Submission Guidelines Active',
      message: 'All assistants must ensure code and thesis files include plagiarism clearance reports before final delivery review.',
      target_audience: 'all',
      status: 'published',
      created_by: 'Platform Administrator',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'ann-2',
      title: 'Fast-Track FYP Proposals',
      message: 'Students submitting Final Year Projects can now get proposals within 2 hours from verified academic assistants.',
      target_audience: 'students',
      status: 'published',
      created_by: 'Platform Administrator',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];
  localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(defaultAnnouncements));
  return defaultAnnouncements;
}

function saveStoredAnnouncements(announcements: SystemAnnouncement[]): void {
  localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
}

function getStoredSettings(): PlatformSettings {
  const stored = localStorage.getItem(LOCAL_SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // empty
    }
  }
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
}

function saveStoredSettings(settings: PlatformSettings): void {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
}

export const adminService = {
  /**
   * Log administrative action
   */
  async logAudit(
    action: string,
    details?: string,
    targetType?: 'user' | 'project' | 'proposal' | 'delivery' | 'category' | 'system' | 'broadcast',
    targetId?: string,
    adminUser?: Profile | null
  ): Promise<AdminAuditLog> {
    const newLog: AdminAuditLog = {
      id: 'audit-' + Math.random().toString(36).substring(2, 9),
      user_id: adminUser?.id || 'usr-admin',
      user_name: adminUser?.full_name || 'Platform Administrator',
      user_role: adminUser?.role || 'admin',
      action,
      details,
      target_type: targetType || 'system',
      target_id: targetId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('activity_logs').insert([
          {
            user_id: newLog.user_id,
            activity: `[ADMIN] ${action}`,
            details: details || '',
          },
        ]);
      } catch (e) {
        console.warn('Supabase audit logging fallback:', e);
      }
    }

    const logs = getStoredAuditLogs();
    logs.unshift(newLog);
    saveStoredAuditLogs(logs);
    return newLog;
  },

  /**
   * Get all Audit logs
   */
  async getAuditLogs(filters?: { action?: string; targetType?: string; search?: string }): Promise<AdminAuditLog[]> {
    let logs = getStoredAuditLogs();

    if (filters?.targetType && filters.targetType !== 'all') {
      logs = logs.filter((l) => l.target_type === filters.targetType);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          (l.details && l.details.toLowerCase().includes(q)) ||
          (l.user_name && l.user_name.toLowerCase().includes(q))
      );
    }

    return logs;
  },

  /**
   * Get comprehensive Dashboard Overview statistics
   */
  async getDashboardOverview() {
    const [projects, proposals, users, earningsData] = await Promise.all([
      this.getAllProjects(),
      this.getAllProposals(),
      this.getAllUsers(),
      proposalService.getEarningsForFreelancer('all'),
    ]);

    const students = users.filter((u) => u.role === 'student');
    const assistants = users.filter((u) => u.role === 'freelancer');
    const admins = users.filter((u) => u.role === 'admin');

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'Assigned').length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;
    const pendingProjects = projects.filter((p) => p.status === 'Submitted' || p.status === 'Analyzing').length;
    const reviewProjects = projects.filter((p) => p.status === 'Review').length;

    const pendingProposals = proposals.filter((p) => p.status === 'Pending').length;
    const acceptedProposals = proposals.filter((p) => p.status === 'Accepted').length;

    // Overdue projects: deadline < today && status !== 'Completed' && status !== 'Cancelled'
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueProjects = projects.filter((p) => {
      if (p.status === 'Completed' || p.status === 'Cancelled' || p.status === 'Rejected') return false;
      return p.deadline && p.deadline < todayStr;
    });

    // Deliveries: collect from proposals/projects
    const deliveries = await this.getAllDeliveries();
    const pendingDeliveries = deliveries.filter((d) => d.status === 'Submitted for Review' || d.status === 'Revision Requested').length;
    const completedDeliveries = deliveries.filter((d) => d.status === 'Accepted').length;

    // Earnings
    const totalPlatformVolume = projects
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    const pendingVolume = projects
      .filter((p) => p.status === 'In Progress' || p.status === 'Review' || p.status === 'Assigned')
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    // Status breakdown
    const statusCounts: Record<string, number> = {
      Submitted: 0,
      Analyzing: 0,
      Assigned: 0,
      'In Progress': 0,
      Review: 0,
      Completed: 0,
      Rejected: 0,
      Cancelled: 0,
    };
    projects.forEach((p) => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
    });

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    projects.forEach((p) => {
      const cat = p.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Recent activity list
    const auditLogs = await this.getAuditLogs();

    return {
      totalStudents: students.length,
      totalAssistants: assistants.length,
      totalAdmins: admins.length,
      totalUsers: users.length,
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      reviewProjects,
      overdueCount: overdueProjects.length,
      overdueProjects,
      pendingProposals,
      acceptedProposals,
      pendingDeliveries,
      completedDeliveries,
      totalPlatformVolume,
      pendingVolume,
      statusCounts,
      categoryCounts,
      recentProjects: projects.slice(0, 5),
      recentProposals: proposals.slice(0, 5),
      recentDeliveries: deliveries.slice(0, 5),
      recentActivity: auditLogs.slice(0, 8),
    };
  },

  /**
   * Get all Users with extended attributes
   */
  async getAllUsers(filters?: { role?: string; status?: string; search?: string; sortBy?: string }): Promise<Profile[]> {
    let allUsers: Profile[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          allUsers = data as Profile[];
        }
      } catch (err) {
        console.warn('Supabase fetch profiles warning, using fallback:', err);
      }
    }

    if (allUsers.length === 0) {
      // Local storage fallback profiles
      const stored = localStorage.getItem(LOCAL_PROFILES_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          allUsers = Object.values(parsed);
        } catch {
          // empty
        }
      }

      // Default mock users if none exist
      if (allUsers.length === 0) {
        allUsers = [
          {
            id: 'usr-student-1',
            full_name: 'Ayesha Khan',
            email: 'ayesha.khan@student.nust.edu.pk',
            phone: '+92 301 2345678',
            role: 'student',
            status: 'active',
            institution: 'National University of Sciences and Technology (NUST)',
            academic_degree: 'BS Computer Science (Final Year)',
            profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
            last_activity_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: 'usr-student-2',
            full_name: 'Bilal Ahmed',
            email: 'bilal.ahmed@iba.edu.pk',
            phone: '+92 321 9876543',
            role: 'student',
            status: 'active',
            institution: 'Institute of Business Administration (IBA)',
            academic_degree: 'BBA Finance',
            profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
            last_activity_at: new Date(Date.now() - 3600000 * 18).toISOString(),
          },
          {
            id: 'usr-student-3',
            full_name: 'Zainab Fatima',
            email: 'zainab.fatima@lums.edu.pk',
            phone: '+92 333 4567890',
            role: 'student',
            status: 'active',
            institution: 'Lahore University of Management Sciences (LUMS)',
            academic_degree: 'BS Electrical Engineering',
            profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
            created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
            last_activity_at: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
          {
            id: 'usr-assistant-1',
            full_name: 'Dr. Muhammad Hamza',
            email: 'hamza.phd@gmail.com',
            phone: '+92 300 1122334',
            role: 'freelancer',
            status: 'active',
            institution: 'FAST-NUCES Islamabad',
            academic_degree: 'PhD in Machine Learning & Data Science',
            profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
            created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
            last_activity_at: new Date(Date.now() - 3600000 * 1).toISOString(),
          },
          {
            id: 'usr-assistant-2',
            full_name: 'Fatima Noor',
            email: 'fatima.academic@gmail.com',
            phone: '+92 312 9988776',
            role: 'freelancer',
            status: 'active',
            institution: 'Quaid-i-Azam University',
            academic_degree: 'MS in Literature & Academic Research',
            profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            created_at: new Date(Date.now() - 86400000 * 50).toISOString(),
            last_activity_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          },
          {
            id: 'usr-assistant-3',
            full_name: 'Saad Tariq',
            email: 'saad.developer@gmail.com',
            phone: '+92 345 5544332',
            role: 'freelancer',
            status: 'active',
            institution: 'COMSATS Islamabad',
            academic_degree: 'BS Software Engineering',
            profile_photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
            created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
            last_activity_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'usr-admin-1',
            full_name: 'Platform Administrator',
            email: 'admin@studentassistant.com',
            phone: '+92 300 0000000',
            role: 'admin',
            status: 'active',
            institution: 'Student Assistant Head Office',
            academic_degree: 'Executive Management',
            profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
            created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
            last_activity_at: new Date().toISOString(),
          },
        ];

        const saveMap: Record<string, Profile> = {};
        allUsers.forEach((u) => {
          saveMap[u.email.toLowerCase()] = u;
        });
        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(saveMap));
      }
    }

    // Apply filtering
    if (filters?.role && filters.role !== 'all') {
      allUsers = allUsers.filter((u) => u.role === filters.role);
    }
    if (filters?.status && filters.status !== 'all') {
      allUsers = allUsers.filter((u) => (u.status || 'active') === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      allUsers = allUsers.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.institution && u.institution.toLowerCase().includes(q)) ||
          u.id.toLowerCase().includes(q)
      );
    }

    if (filters?.sortBy === 'oldest') {
      allUsers.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (filters?.sortBy === 'name') {
      allUsers.sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else {
      allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return allUsers;
  },

  /**
   * Get single user full details
   */
  async getUserDetails(userId: string): Promise<{
    user: Profile | null;
    projects: Project[];
    proposals: Proposal[];
    deliveries: Delivery[];
    earnings: EarningRecord[];
  }> {
    const allUsers = await this.getAllUsers();
    const user = allUsers.find((u) => u.id === userId) || null;

    if (!user) {
      return { user: null, projects: [], proposals: [], deliveries: [], earnings: [] };
    }

    const allProjects = await this.getAllProjects();
    const allProposals = await this.getAllProposals();
    const allDeliveries = await this.getAllDeliveries();

    let userProjects: Project[] = [];
    let userProposals: Proposal[] = [];
    let userDeliveries: Delivery[] = [];
    let userEarnings: EarningRecord[] = [];

    if (user.role === 'student') {
      userProjects = allProjects.filter((p) => p.student_id === user.id);
      userDeliveries = allDeliveries.filter((d) => d.student_id === user.id);
    } else if (user.role === 'freelancer') {
      userProposals = allProposals.filter((p) => p.freelancer_id === user.id);
      userProjects = allProjects.filter((p) => p.assigned_freelancer_id === user.id || p.assigned_agent === user.full_name);
      userDeliveries = allDeliveries.filter((d) => d.freelancer_id === user.id);
      const earningsResult = await proposalService.getEarningsForFreelancer(user.id);
      userEarnings = earningsResult.records;
    }

    return {
      user,
      projects: userProjects,
      proposals: userProposals,
      deliveries: userDeliveries,
      earnings: userEarnings,
    };
  },

  /**
   * Update User Status (active, suspended, pending)
   */
  async updateUserStatus(userId: string, newStatus: UserStatus, adminUser?: Profile | null): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
      } catch (err) {
        console.warn('Supabase update status warning:', err);
      }
    }

    const stored = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, Profile>;
        for (const k of Object.keys(parsed)) {
          if (parsed[k].id === userId) {
            parsed[k].status = newStatus;
            break;
          }
        }
        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(parsed));
      } catch {
        // empty
      }
    }

    await this.logAudit(
      `User Status Changed to ${newStatus.toUpperCase()}`,
      `User ID: ${userId} status updated to ${newStatus}`,
      'user',
      userId,
      adminUser
    );

    return true;
  },

  /**
   * Update User Role
   */
  async updateUserRole(userId: string, newRole: UserRole, adminUser?: Profile | null): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      } catch (err) {
        console.warn('Supabase update role warning:', err);
      }
    }

    const stored = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, Profile>;
        for (const k of Object.keys(parsed)) {
          if (parsed[k].id === userId) {
            parsed[k].role = newRole;
            break;
          }
        }
        localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(parsed));
      } catch {
        // empty
      }
    }

    await this.logAudit(
      `User Role Changed to ${newRole.toUpperCase()}`,
      `User ID: ${userId} role changed to ${newRole}`,
      'user',
      userId,
      adminUser
    );

    return true;
  },

  /**
   * Get all Assistants with performance metrics & approval status
   */
  async getAllAssistants(filters?: { approvalStatus?: string; search?: string }): Promise<AssistantProfile[]> {
    const allUsers = await this.getAllUsers({ role: 'freelancer' });
    const allProjects = await this.getAllProjects();
    const allProposals = await this.getAllProposals();

    let assistants: AssistantProfile[] = allUsers.map((u) => {
      const userProposals = allProposals.filter((p) => p.freelancer_id === u.id);
      const userAccepted = userProposals.filter((p) => p.status === 'Accepted');
      const userProjects = allProjects.filter((p) => p.assigned_freelancer_id === u.id || p.assigned_agent === u.full_name);
      const completedCount = userProjects.filter((p) => p.status === 'Completed').length;
      const activeCount = userProjects.filter((p) => p.status === 'In Progress' || p.status === 'Assigned' || p.status === 'Review').length;

      const totalEarnings = userProjects
        .filter((p) => p.status === 'Completed')
        .reduce((sum, p) => sum + (p.budget || 0), 0);

      const successRate = userProposals.length > 0 ? Math.round((userAccepted.length / userProposals.length) * 100) : 100;

      return {
        ...u,
        approval_status: (u.status === 'suspended' ? 'Suspended' : 'Approved') as AssistantApprovalStatus,
        completed_projects_count: completedCount,
        active_projects_count: activeCount,
        proposals_count: userProposals.length,
        total_earnings: totalEarnings,
        rating: 4.9,
        reviews_count: completedCount + 2,
        success_rate: Math.max(85, successRate),
        skills: ['Academic Writing', 'Python', 'Data Analysis', 'LaTeX', 'Research'],
      };
    });

    if (filters?.approvalStatus && filters.approvalStatus !== 'all') {
      assistants = assistants.filter((a) => a.approval_status === filters.approvalStatus);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      assistants = assistants.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.institution && a.institution.toLowerCase().includes(q))
      );
    }

    return assistants;
  },

  /**
   * Update Assistant Approval Status (Approved, Pending Approval, Rejected, Suspended)
   */
  async updateAssistantApproval(
    assistantId: string,
    approvalStatus: AssistantApprovalStatus,
    adminUser?: Profile | null
  ): Promise<boolean> {
    const userStatus: UserStatus = approvalStatus === 'Suspended' ? 'suspended' : 'active';
    await this.updateUserStatus(assistantId, userStatus, adminUser);

    await projectService.addNotification(
      assistantId,
      `Account Status: ${approvalStatus}`,
      `Your Academic Assistant account status has been updated to "${approvalStatus}" by the platform administration.`,
      'system'
    );

    await this.logAudit(
      `Assistant Status Set to ${approvalStatus}`,
      `Assistant ${assistantId} approval status set to ${approvalStatus}`,
      'user',
      assistantId,
      adminUser
    );

    return true;
  },

  /**
   * Get all Projects with full details & overdue calculation
   */
  async getAllProjects(filters?: {
    status?: string;
    category?: string;
    search?: string;
    overdueOnly?: boolean;
    sortBy?: string;
  }): Promise<Project[]> {
    let projects = await projectService.getProjects('all');

    if (filters?.status && filters.status !== 'all') {
      projects = projects.filter((p) => p.status === filters.status);
    }

    if (filters?.category && filters.category !== 'all') {
      projects = projects.filter((p) => p.category === filters.category);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.student_name && p.student_name.toLowerCase().includes(q)) ||
          p.id.toLowerCase().includes(q)
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (filters?.overdueOnly) {
      projects = projects.filter((p) => {
        if (p.status === 'Completed' || p.status === 'Cancelled' || p.status === 'Rejected') return false;
        return p.deadline && p.deadline < todayStr;
      });
    }

    if (filters?.sortBy === 'budget_high') {
      projects.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    } else if (filters?.sortBy === 'deadline_soon') {
      projects.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (filters?.sortBy === 'oldest') {
      projects.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return projects;
  },

  /**
   * Admin update Project status
   */
  async updateProjectStatus(
    projectId: string,
    status: ProjectStatus,
    note?: string,
    adminUser?: Profile | null
  ): Promise<boolean> {
    const updated = await projectService.updateProjectStatus(projectId, status);

    const project = await projectService.getProjectById(projectId);
    if (project?.student_id) {
      await projectService.addNotification(
        project.student_id,
        `Project Status Updated by Admin`,
        `Your project "${project.title}" status has been changed to "${status}"${note ? ': ' + note : '.'}`,
        'status'
      );
    }

    await this.logAudit(
      `Project Status Updated: ${status}`,
      `Project "${project?.title || projectId}" status set to ${status}${note ? ' - Note: ' + note : ''}`,
      'project',
      projectId,
      adminUser
    );

    return Boolean(updated);
  },

  /**
   * Admin Assign / Reassign Assistant to Project
   */
  async assignAssistant(
    projectId: string,
    freelancerId: string,
    freelancerName: string,
    adminUser?: Profile | null
  ): Promise<boolean> {
    const project = await projectService.getProjectById(projectId);
    if (!project) return false;

    await projectService.updateProjectStatus(projectId, 'Assigned');

    // Notify freelancer
    await projectService.addNotification(
      freelancerId,
      `Assigned to Project by Admin`,
      `You have been directly assigned to "${project.title}". You can now start working in the Project Workspace.`,
      'assignment'
    );

    // Notify student
    if (project.student_id) {
      await projectService.addNotification(
        project.student_id,
        `Assistant Assigned by Admin`,
        `${freelancerName} has been assigned to your project "${project.title}".`,
        'assignment'
      );
    }

    await this.logAudit(
      `Assistant Assigned: ${freelancerName}`,
      `Assigned assistant ${freelancerName} (${freelancerId}) to project "${project.title}"`,
      'project',
      projectId,
      adminUser
    );

    return true;
  },

  /**
   * Cancel project with admin reason
   */
  async cancelProject(projectId: string, reason: string, adminUser?: Profile | null): Promise<boolean> {
    const project = await projectService.getProjectById(projectId);
    await projectService.updateProjectStatus(projectId, 'Cancelled');

    if (project?.student_id) {
      await projectService.addNotification(
        project.student_id,
        `Project Cancelled by Admin`,
        `Your project "${project.title}" has been cancelled. Reason: ${reason}`,
        'status'
      );
    }

    await this.logAudit(
      `Project Cancelled`,
      `Project "${project?.title || projectId}" cancelled by admin. Reason: ${reason}`,
      'project',
      projectId,
      adminUser
    );

    return true;
  },

  /**
   * Get all Proposals across platform
   */
  async getAllProposals(filters?: { status?: string; search?: string }): Promise<Proposal[]> {
    let proposals: Proposal[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*, projects(title, category, budget, deadline, student_id)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          proposals = data.map((p: any) => ({
            id: p.id,
            project_id: p.project_id,
            project_title: p.projects?.title || 'Academic Project',
            project_category: p.projects?.category || 'General',
            project_budget: p.projects?.budget || 0,
            project_deadline: p.projects?.deadline,
            student_id: p.projects?.student_id,
            freelancer_id: p.freelancer_id,
            freelancer_name: p.freelancer_name || 'Academic Assistant',
            cover_letter: p.cover_letter,
            proposed_price: Number(p.proposed_price),
            estimated_days: Number(p.estimated_days),
            status: p.status,
            attachment_url: p.attachment_url,
            attachment_name: p.attachment_name,
            created_at: p.created_at,
            updated_at: p.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch proposals warning:', err);
      }
    }

    if (proposals.length === 0) {
      // Local fallback proposals
      const stored = localStorage.getItem('student_assistant_proposals');
      if (stored) {
        try {
          proposals = JSON.parse(stored);
        } catch {
          // empty
        }
      }

      if (proposals.length === 0) {
        const projects = await projectService.getProjects('all');
        proposals = [
          {
            id: 'prop-admin-1',
            project_id: projects[0]?.id || 'proj-1',
            project_title: projects[0]?.title || 'AI/ML Final Year Project',
            project_category: projects[0]?.category || 'FYP & Thesis Writing',
            project_budget: projects[0]?.budget || 15000,
            project_deadline: projects[0]?.deadline,
            student_name: projects[0]?.student_name || 'Ayesha Khan',
            freelancer_id: 'usr-assistant-1',
            freelancer_name: 'Dr. Muhammad Hamza',
            cover_letter: 'I have 6+ years experience in Python ML algorithms and IEEE research paper writing. I will provide clean source code with full documentation and plagiarism report.',
            proposed_price: 14500,
            estimated_days: 5,
            status: 'Accepted',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'prop-admin-2',
            project_id: projects[1]?.id || 'proj-2',
            project_title: projects[1]?.title || 'Hospital Management System',
            project_category: projects[1]?.category || 'Programming & Software Development',
            project_budget: projects[1]?.budget || 8000,
            project_deadline: projects[1]?.deadline,
            student_name: projects[1]?.student_name || 'Bilal Ahmed',
            freelancer_id: 'usr-assistant-3',
            freelancer_name: 'Saad Tariq',
            cover_letter: 'Full-stack React + Node.js software engineer. Will build responsive UI with MySQL database schemas and complete test suite.',
            proposed_price: 7500,
            estimated_days: 3,
            status: 'Pending',
            created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
          },
          {
            id: 'prop-admin-3',
            project_id: projects[2]?.id || 'proj-3',
            project_title: projects[2]?.title || 'Literature Review on Renewable Energy',
            project_category: projects[2]?.category || 'Research Paper & Literature Review',
            project_budget: projects[2]?.budget || 6000,
            project_deadline: projects[2]?.deadline,
            student_name: projects[2]?.student_name || 'Zainab Fatima',
            freelancer_id: 'usr-assistant-2',
            freelancer_name: 'Fatima Noor',
            cover_letter: 'Expert academic researcher specializing in APA citations and high-impact journal reviews. Ready to start immediately.',
            proposed_price: 6000,
            estimated_days: 4,
            status: 'Pending',
            created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
        ];
        localStorage.setItem('student_assistant_proposals', JSON.stringify(proposals));
      }
    }

    if (filters?.status && filters.status !== 'all') {
      proposals = proposals.filter((p) => p.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      proposals = proposals.filter(
        (p) =>
          (p.project_title && p.project_title.toLowerCase().includes(q)) ||
          (p.freelancer_name && p.freelancer_name.toLowerCase().includes(q)) ||
          (p.student_name && p.student_name.toLowerCase().includes(q)) ||
          p.cover_letter.toLowerCase().includes(q)
      );
    }

    return proposals;
  },

  /**
   * Get all Deliveries across platform
   */
  async getAllDeliveries(filters?: { status?: string; search?: string }): Promise<Delivery[]> {
    let deliveries: Delivery[] = [];

    const stored = localStorage.getItem('student_assistant_deliveries');
    if (stored) {
      try {
        deliveries = JSON.parse(stored);
      } catch {
        // empty
      }
    }

    if (deliveries.length === 0) {
      const projects = await projectService.getProjects('all');
      deliveries = [
        {
          id: 'del-1',
          project_id: projects[0]?.id || 'proj-1',
          project_title: projects[0]?.title || 'AI/ML Final Year Project',
          student_name: projects[0]?.student_name || 'Ayesha Khan',
          freelancer_id: 'usr-assistant-1',
          freelancer_name: 'Dr. Muhammad Hamza',
          delivery_message: 'Completed the full project codebase, Python notebooks, SRS documentation and PDF report.',
          notes: 'Source code in ZIP, full documentation attached.',
          status: 'Submitted for Review',
          revision_count: 0,
          created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
          files: [
            {
              id: 'df-1',
              project_id: projects[0]?.id || 'proj-1',
              file_name: 'Final_FYP_Code_v1.zip',
              file_url: 'https://example.com/files/Final_FYP_Code_v1.zip',
              file_size: 14500000,
              file_type: 'application/zip',
              uploaded_by: 'Dr. Muhammad Hamza',
              created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
            },
            {
              id: 'df-2',
              project_id: projects[0]?.id || 'proj-1',
              file_name: 'Project_Final_Report.pdf',
              file_url: 'https://example.com/files/Project_Final_Report.pdf',
              file_size: 3200000,
              file_type: 'application/pdf',
              uploaded_by: 'Dr. Muhammad Hamza',
              created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
            },
          ],
        },
      ];
      localStorage.setItem('student_assistant_deliveries', JSON.stringify(deliveries));
    }

    if (filters?.status && filters.status !== 'all') {
      deliveries = deliveries.filter((d) => d.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      deliveries = deliveries.filter(
        (d) =>
          (d.project_title && d.project_title.toLowerCase().includes(q)) ||
          d.freelancer_name.toLowerCase().includes(q) ||
          (d.student_name && d.student_name.toLowerCase().includes(q)) ||
          d.delivery_message.toLowerCase().includes(q)
      );
    }

    return deliveries;
  },

  /**
   * Admin intervene in delivery (approve / request revision)
   */
  async interveneDelivery(
    deliveryId: string,
    action: 'approve' | 'request_revision',
    notes?: string,
    adminUser?: Profile | null
  ): Promise<boolean> {
    const deliveries = await this.getAllDeliveries();
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!delivery) return false;

    if (action === 'approve') {
      delivery.status = 'Accepted';
      await projectService.updateProjectStatus(delivery.project_id, 'Completed');
    } else {
      delivery.status = 'Revision Requested';
      delivery.revision_notes = notes || 'Administrative review: revision required.';
      delivery.revision_count = (delivery.revision_count || 0) + 1;
    }

    localStorage.setItem('student_assistant_deliveries', JSON.stringify(deliveries));

    await this.logAudit(
      `Delivery ${action === 'approve' ? 'Approved by Admin' : 'Revision Requested'}`,
      `Delivery ID ${deliveryId} for project ${delivery.project_title || delivery.project_id}. ${notes || ''}`,
      'delivery',
      deliveryId,
      adminUser
    );

    return true;
  },

  /**
   * Get all Files across the platform (Student attachments, Assistant deliverables, Profile pictures)
   */
  async getAllPlatformFiles(): Promise<{
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploaded_by: string;
    uploader_role: string;
    project_id?: string;
    project_title?: string;
    file_url: string;
    category: string;
    created_at: string;
  }[]> {
    const projects = await projectService.getProjects('all');
    const deliveries = await this.getAllDeliveries();

    const filesList: any[] = [];

    // 1. Project initial files
    projects.forEach((p) => {
      if (p.files && p.files.length > 0) {
        p.files.forEach((f) => {
          filesList.push({
            id: f.id || 'pf-' + Math.random().toString(36).substring(2, 7),
            file_name: f.file_name,
            file_type: f.file_type || 'application/octet-stream',
            file_size: f.file_size || 2500000,
            uploaded_by: p.student_name || 'Student',
            uploader_role: 'student',
            project_id: p.id,
            project_title: p.title,
            file_url: f.file_url || '#',
            category: 'Project Requirement File',
            created_at: f.created_at || p.created_at,
          });
        });
      }
    });

    // 2. Deliveries files
    deliveries.forEach((d) => {
      if (d.files && d.files.length > 0) {
        d.files.forEach((f) => {
          filesList.push({
            id: f.id || 'df-' + Math.random().toString(36).substring(2, 7),
            file_name: f.file_name,
            file_type: f.file_type || 'application/octet-stream',
            file_size: f.file_size || 4800000,
            uploaded_by: d.freelancer_name || 'Assistant',
            uploader_role: 'freelancer',
            project_id: d.project_id,
            project_title: d.project_title || 'Project Delivery',
            file_url: f.file_url || '#',
            category: 'Delivery Output File',
            created_at: f.created_at || d.created_at,
          });
        });
      }
    });

    // Fallback sample files if list is empty
    if (filesList.length === 0) {
      filesList.push(
        {
          id: 'f-sample-1',
          file_name: 'FYP_Requirements_Specification.pdf',
          file_type: 'application/pdf',
          file_size: 3400000,
          uploaded_by: 'Ayesha Khan',
          uploader_role: 'student',
          project_id: projects[0]?.id || 'proj-1',
          project_title: projects[0]?.title || 'AI/ML Final Year Project',
          file_url: '#',
          category: 'Project Requirement File',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: 'f-sample-2',
          file_name: 'Dataset_Cleaned_2026.csv',
          file_url: '#',
          file_type: 'text/csv',
          file_size: 8900000,
          uploaded_by: 'Dr. Muhammad Hamza',
          uploader_role: 'freelancer',
          project_id: projects[0]?.id || 'proj-1',
          project_title: projects[0]?.title || 'AI/ML Final Year Project',
          category: 'Delivery Output File',
          created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        }
      );
    }

    return filesList;
  },

  /**
   * Academic Categories Management
   */
  async getCategories(): Promise<AcademicCategory[]> {
    return getStoredCategories();
  },

  async addCategory(cat: Omit<AcademicCategory, 'id'>, adminUser?: Profile | null): Promise<AcademicCategory> {
    const categories = getStoredCategories();
    const newCategory: AcademicCategory = {
      id: 'cat-' + Math.random().toString(36).substring(2, 9),
      ...cat,
      status: 'active',
      created_at: new Date().toISOString(),
      projects_count: 0,
    };
    categories.push(newCategory);
    saveStoredCategories(categories);

    await this.logAudit('Category Created', `New academic category "${newCategory.name}" added`, 'category', newCategory.id, adminUser);

    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<AcademicCategory>, adminUser?: Profile | null): Promise<AcademicCategory | null> {
    const categories = getStoredCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    categories[idx] = { ...categories[idx], ...updates };
    saveStoredCategories(categories);

    await this.logAudit('Category Updated', `Category "${categories[idx].name}" updated`, 'category', id, adminUser);
    return categories[idx];
  },

  async toggleCategoryStatus(id: string, adminUser?: Profile | null): Promise<AcademicCategory | null> {
    const categories = getStoredCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const currentStatus = categories[idx].status || 'active';
    categories[idx].status = currentStatus === 'active' ? 'inactive' : 'active';
    saveStoredCategories(categories);

    await this.logAudit(
      `Category Status: ${categories[idx].status.toUpperCase()}`,
      `Category "${categories[idx].name}" status toggled to ${categories[idx].status}`,
      'category',
      id,
      adminUser
    );

    return categories[idx];
  },

  async deleteCategory(id: string, adminUser?: Profile | null): Promise<boolean> {
    let categories = getStoredCategories();
    const cat = categories.find((c) => c.id === id);
    categories = categories.filter((c) => c.id !== id);
    saveStoredCategories(categories);

    await this.logAudit('Category Deleted', `Category "${cat?.name || id}" removed`, 'category', id, adminUser);
    return true;
  },

  /**
   * System Announcements / Notifications
   */
  async getAnnouncements(): Promise<SystemAnnouncement[]> {
    return getStoredAnnouncements();
  },

  async createAnnouncement(
    data: { title: string; message: string; target_audience: 'all' | 'students' | 'freelancers' | 'admins'; expires_at?: string },
    adminUser?: Profile | null
  ): Promise<SystemAnnouncement> {
    const announcements = getStoredAnnouncements();
    const newAnnouncement: SystemAnnouncement = {
      id: 'ann-' + Math.random().toString(36).substring(2, 9),
      title: data.title,
      message: data.message,
      target_audience: data.target_audience,
      status: 'published',
      created_by: adminUser?.full_name || 'Platform Administrator',
      created_at: new Date().toISOString(),
      expires_at: data.expires_at,
    };

    announcements.unshift(newAnnouncement);
    saveStoredAnnouncements(announcements);

    // Send platform notification to targeted users
    const users = await this.getAllUsers();
    const targetUsers = users.filter((u) => {
      if (data.target_audience === 'all') return true;
      if (data.target_audience === 'students' && u.role === 'student') return true;
      if (data.target_audience === 'freelancers' && u.role === 'freelancer') return true;
      if (data.target_audience === 'admins' && u.role === 'admin') return true;
      return false;
    });

    for (const u of targetUsers) {
      await projectService.addNotification(u.id, `📢 ${data.title}`, data.message, 'system');
    }

    await this.logAudit('Broadcast Announcement Published', `Announcement "${data.title}" sent to ${data.target_audience}`, 'broadcast', newAnnouncement.id, adminUser);

    return newAnnouncement;
  },

  /**
   * Reports and Analytics Aggregation
   */
  async getReports(filters: { dateRange: string; category?: string; role?: string }) {
    const [users, projects, proposals, deliveries, categories] = await Promise.all([
      this.getAllUsers(),
      this.getAllProjects(),
      this.getAllProposals(),
      this.getAllDeliveries(),
      this.getCategories(),
    ]);

    const totalSpent = projects
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    const completionRate = projects.length > 0
      ? Math.round((projects.filter((p) => p.status === 'Completed').length / projects.length) * 100)
      : 0;

    const proposalAcceptanceRate = proposals.length > 0
      ? Math.round((proposals.filter((p) => p.status === 'Accepted').length / proposals.length) * 100)
      : 0;

    // Monthly aggregation
    const monthlyProjects = [
      { month: 'Apr', count: 12, completed: 9, revenue: 140000 },
      { month: 'May', count: 19, completed: 15, revenue: 220000 },
      { month: 'Jun', count: 24, completed: 21, revenue: 310000 },
      { month: 'Jul', count: 32, completed: 28, revenue: 450000 },
      { month: 'Aug', count: projects.length, completed: projects.filter((p) => p.status === 'Completed').length, revenue: totalSpent },
    ];

    return {
      totalUsers: users.length,
      totalProjects: projects.length,
      completedProjects: projects.filter((p) => p.status === 'Completed').length,
      totalRevenue: totalSpent,
      completionRate,
      proposalAcceptanceRate,
      monthlyProjects,
      categoriesCount: categories.length,
      deliveriesCount: deliveries.length,
      topCategories: categories.map((c) => ({
        name: c.name,
        count: projects.filter((p) => p.category === c.name).length,
      })),
    };
  },

  /**
   * Platform Settings
   */
  async getSettings(): Promise<PlatformSettings> {
    return getStoredSettings();
  },

  async getPlatformSettings(): Promise<PlatformSettings> {
    return getStoredSettings();
  },

  async updateSettings(updates: Partial<PlatformSettings>, adminUser?: Profile | null): Promise<PlatformSettings> {
    const current = getStoredSettings();
    const updated = { ...current, ...updates };
    saveStoredSettings(updated);

    await this.logAudit('Platform Settings Updated', 'System parameters, file limits or preferences adjusted', 'system', undefined, adminUser);

    return updated;
  },

  async updatePlatformSettings(updates: Partial<PlatformSettings>, adminUser?: Profile | null): Promise<PlatformSettings> {
    return this.updateSettings(updates, adminUser);
  },

  async getAllProjectFiles(filters?: { search?: string }) {
    const files = await this.getAllPlatformFiles();
    if (!filters?.search?.trim()) return files;
    const term = filters.search.toLowerCase();
    return files.filter(
      (f) =>
        f.file_name.toLowerCase().includes(term) ||
        f.uploaded_by.toLowerCase().includes(term) ||
        (f.project_title && f.project_title.toLowerCase().includes(term))
    );
  },

  async createCategory(cat: Omit<AcademicCategory, 'id'>, adminUser?: Profile | null): Promise<AcademicCategory> {
    return this.addCategory(cat, adminUser);
  },
};
