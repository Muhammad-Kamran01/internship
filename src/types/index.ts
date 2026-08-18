export type UserRole = 'student' | 'freelancer' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type AssistantApprovalStatus = 'Approved' | 'Pending Approval' | 'Rejected' | 'Suspended';

export type ProjectStatus = 
  | 'Submitted'
  | 'Analyzing'
  | 'Assigned'
  | 'In Progress'
  | 'Review'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled';

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status?: UserStatus;
  profile_photo?: string;
  created_at: string;
  institution?: string;
  academic_degree?: string;
  last_activity_at?: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  category?: string;
}

export interface Project {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  budget?: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  assigned_agent?: string;
  assigned_freelancer_id?: string;
  assigned_freelancer_name?: string;
  progress_percentage?: number;
  required_skills?: string[];
  proposals_count?: number;
  created_at: string;
  updated_at?: string;
  files?: ProjectFile[];
}

export type ProposalStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn';

export interface Proposal {
  id: string;
  project_id: string;
  project_title?: string;
  project_category?: string;
  project_budget?: number;
  project_deadline?: string;
  student_id?: string;
  student_name?: string;
  freelancer_id: string;
  freelancer_name?: string;
  freelancer_email?: string;
  freelancer_photo?: string;
  cover_letter: string;
  proposed_price: number;
  estimated_days: number;
  status: ProposalStatus;
  attachment_url?: string;
  attachment_name?: string;
  created_at: string;
  updated_at?: string;
}

export type DeliveryStatus = 'Submitted for Review' | 'Revision Requested' | 'Accepted';

export interface Delivery {
  id: string;
  project_id: string;
  project_title?: string;
  student_id?: string;
  student_name?: string;
  freelancer_id: string;
  freelancer_name: string;
  delivery_message: string;
  notes?: string;
  status: DeliveryStatus;
  files?: ProjectFile[];
  revision_notes?: string;
  revision_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface EarningRecord {
  id: string;
  project_id: string;
  project_title: string;
  freelancer_id: string;
  amount: number;
  status: 'Available' | 'Pending' | 'Withdrawn';
  completed_at: string;
}

export interface AssistantProfile extends Profile {
  title?: string;
  bio?: string;
  skills?: string[];
  academic_expertise?: string[];
  categories?: string[];
  experience_years?: number;
  education?: string;
  portfolio?: { id: string; title: string; description: string; link?: string; category?: string }[];
  languages?: string[];
  rating?: number;
  reviews_count?: number;
  completed_projects_count?: number;
  active_projects_count?: number;
  proposals_count?: number;
  success_rate?: number;
  approval_status?: AssistantApprovalStatus;
  total_earnings?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type?: 'status' | 'comment' | 'system' | 'assignment';
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  activity: string;
  details?: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_role?: UserRole;
  action: string;
  details?: string;
  target_type?: 'user' | 'project' | 'proposal' | 'delivery' | 'category' | 'system' | 'broadcast';
  target_id?: string;
  created_at: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  target_audience: 'all' | 'students' | 'freelancers' | 'admins';
  status: 'published' | 'draft';
  created_by: string;
  created_at: string;
  expires_at?: string;
}

export interface PlatformSettings {
  platform_name: string;
  platform_description?: string;
  default_currency: string;
  currency?: string;
  default_project_status?: ProjectStatus;
  max_file_size_mb: number;
  allowed_file_types?: string[];
  maintenance_mode: boolean;
  require_assistant_approval: boolean;
  allow_student_registrations?: boolean;
  commission_rate_percentage?: number;
  support_email: string;
}

export type { AcademicCategory } from '../constants/categories';

export interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  description: string;
  iconName: string;
  badge: string;
  rating: number;
  tasksCompleted: number;
  status: 'Available' | 'Busy' | 'In Training';
  supportedCategories: string[];
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole | 'ai_agent';
  message: string;
  created_at: string;
  is_ai_generated?: boolean;
}