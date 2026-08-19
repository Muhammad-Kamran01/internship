import { supabase, isSupabaseConfigured, STORAGE_BUCKET_NAME } from './client';
import { Project, ProjectFile, ProjectStatus, ProjectPriority, Notification, ActivityLog, Comment } from '../../types';
import {
  INITIAL_MOCK_PROJECTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_MOCK_COMMENTS,
} from '../../constants/mockData';
import { AI_AGENTS } from '../../constants/aiAgents';

const LOCAL_PROJECTS_KEY = 'student_assistant_projects';
const LOCAL_NOTIFS_KEY = 'student_assistant_notifications';
const LOCAL_LOGS_KEY = 'student_assistant_activity_logs';
const LOCAL_COMMENTS_KEY = 'student_assistant_comments';

// Initialize local storage fallback state
function getLocalProjects(): Project[] {
  const stored = localStorage.getItem(LOCAL_PROJECTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // empty
    }
  }
  localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(INITIAL_MOCK_PROJECTS));
  return INITIAL_MOCK_PROJECTS;
}

function saveLocalProjects(projects: Project[]): void {
  localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects));
}

function getLocalNotifications(): Notification[] {
  const stored = localStorage.getItem(LOCAL_NOTIFS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // empty
    }
  }
  localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  return INITIAL_NOTIFICATIONS;
}

function saveLocalNotifications(notifs: Notification[]): void {
  localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(notifs));
}

function getLocalLogs(): ActivityLog[] {
  const stored = localStorage.getItem(LOCAL_LOGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // empty
    }
  }
  localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  return INITIAL_ACTIVITY_LOGS;
}

function saveLocalLogs(logs: ActivityLog[]): void {
  localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logs));
}

function getLocalComments(): Comment[] {
  const stored = localStorage.getItem(LOCAL_COMMENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // empty
    }
  }
  localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(INITIAL_MOCK_COMMENTS));
  return INITIAL_MOCK_COMMENTS;
}

function saveLocalComments(comments: Comment[]): void {
  localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments));
}

function isUuid(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export const projectService = {
  /**
   * Get all projects for student or platform view
   */
  async getProjects(studentId?: string): Promise<Project[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (studentId && isUuid(studentId)) {
          query = query.eq('student_id', studentId);
        }
        const { data: projectsData, error: projError } = await query;
        if (!projError && projectsData && projectsData.length > 0) {
          // Fetch project files
          const projectIds = projectsData.map((p: any) => p.id);
          const { data: filesData } = await supabase
            .from('project_files')
            .select('*')
            .in('project_id', projectIds);

          const filesMap = new Map<string, ProjectFile[]>();
          (filesData || []).forEach((f: any) => {
            const list = filesMap.get(f.project_id) || [];
            list.push(f);
            filesMap.set(f.project_id, list);
          });

          // Fetch proposals counts
          const { data: propCounts } = await supabase
            .from('proposals')
            .select('project_id');
          const propCountMap = new Map<string, number>();
          (propCounts || []).forEach((p: any) => {
            propCountMap.set(p.project_id, (propCountMap.get(p.project_id) || 0) + 1);
          });

          return projectsData.map((p: any) => ({
            ...p,
            files: filesMap.get(p.id) || [],
            proposals_count: propCountMap.get(p.id) || p.proposals_count || 0,
          })) as Project[];
        }
        if (projError) {
          console.warn('Supabase fetch projects error:', projError.message);
        }
      } catch (err) {
        console.warn('Supabase fetch projects error, using local state:', err);
      }
    }

    const projects = getLocalProjects();
    if (studentId) {
      return projects.filter((p) => p.student_id === studentId);
    }
    return projects;
  },

  /**
   * Get single project detail by ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    if (isSupabaseConfigured && isUuid(projectId)) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (!error && data) {
          const { data: filesData } = await supabase
            .from('project_files')
            .select('*')
            .eq('project_id', projectId);

          const { count } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', projectId);

          return {
            ...data,
            files: filesData || [],
            proposals_count: count || data.proposals_count || 0,
          } as Project;
        }
        if (error) {
          console.warn('Supabase get project by id error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase get project by id error:', err);
      }
    }

    const projects = getLocalProjects();
    const found = projects.find((p) => p.id === projectId);
    return found || null;
  },

  /**
   * Create a new project task
   */
  async createProject(
    projectData: {
      student_id: string;
      student_name: string;
      title: string;
      description: string;
      category: string;
      deadline: string;
      budget?: number;
      priority: ProjectPriority;
    },
    attachedFiles: File[] = []
  ): Promise<Project> {
    const newProjectId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Auto-match AI Agent based on category
    let matchedAgent = 'Documentation Agent';
    if (projectData.category.toLowerCase().includes('programming') || projectData.category.toLowerCase().includes('code')) {
      matchedAgent = 'Programming Agent';
    } else if (projectData.category.toLowerCase().includes('presentation')) {
      matchedAgent = 'Presentation Agent';
    } else if (projectData.category.toLowerCase().includes('research') || projectData.category.toLowerCase().includes('paper')) {
      matchedAgent = 'Research Agent';
    } else if (projectData.category.toLowerCase().includes('assignment') || projectData.category.toLowerCase().includes('essay')) {
      matchedAgent = 'Assignment Agent';
    } else if (projectData.category.toLowerCase().includes('data') || projectData.category.toLowerCase().includes('stats')) {
      matchedAgent = 'Data Analysis Agent';
    }

    // Process attached files
    const uploadedProjectFiles: ProjectFile[] = [];
    for (let i = 0; i < attachedFiles.length; i++) {
      const file = attachedFiles[i];
      let fileUrl = URL.createObjectURL(file); // Default fallback preview URL

      if (isSupabaseConfigured) {
        try {
          const filePath = `${projectData.student_id}/${newProjectId}_${file.name}`;
          const { error: uploadErr } = await supabase.storage
            .from(STORAGE_BUCKET_NAME)
            .upload(filePath, file, { upsert: true });

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from(STORAGE_BUCKET_NAME)
              .getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              fileUrl = publicUrlData.publicUrl;
            }
          }
        } catch (uploadException) {
          console.warn('Supabase storage upload error:', uploadException);
        }
      }

      uploadedProjectFiles.push({
        id: crypto.randomUUID(),
        project_id: newProjectId,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type || file.name.split('.').pop() || 'file',
        uploaded_by: projectData.student_id,
        created_at: createdAt,
      });
    }

    const newProject: Project = {
      id: newProjectId,
      student_id: projectData.student_id,
      student_name: projectData.student_name,
      title: projectData.title,
      description: projectData.description,
      category: projectData.category,
      deadline: projectData.deadline,
      budget: projectData.budget || 0,
      status: 'Analyzing', // Starts at Analyzing for AI agent pre-assessment
      priority: projectData.priority,
      assigned_agent: matchedAgent,
      progress_percentage: 15,
      created_at: createdAt,
      updated_at: createdAt,
      files: uploadedProjectFiles,
    };

    if (isSupabaseConfigured) {
      try {
        const { error: insertErr } = await supabase.from('projects').insert([{
          id: newProject.id,
          student_id: newProject.student_id,
          student_name: newProject.student_name,
          title: newProject.title,
          description: newProject.description,
          category: newProject.category,
          deadline: newProject.deadline,
          budget: newProject.budget,
          status: newProject.status,
          priority: newProject.priority,
          assigned_agent: newProject.assigned_agent,
          progress_percentage: newProject.progress_percentage,
          created_at: newProject.created_at,
        }]);

        if (insertErr) {
          console.error('Supabase project insert error:', insertErr.message, insertErr);
        } else if (uploadedProjectFiles.length > 0) {
          const { error: filesErr } = await supabase.from('project_files').insert(uploadedProjectFiles);
          if (filesErr) {
            console.error('Supabase project files insert error:', filesErr.message, filesErr);
          }
        }
      } catch (dbErr) {
        console.warn('Supabase project creation warning:', dbErr);
      }
    }

    // Save locally
    const projects = getLocalProjects();
    projects.unshift(newProject);
    saveLocalProjects(projects);

    // Log Activity
    await this.addActivityLog(
      projectData.student_id,
      'Submitted New Project',
      `Project "${projectData.title}" submitted in category "${projectData.category}".`
    );

    // Add Notification
    await this.addNotification(
      projectData.student_id,
      'Project Submitted Successfully',
      `Your project "${projectData.title}" was received and is currently being analyzed by the ${matchedAgent}.`,
      'status'
    );

    // Add Initial AI Agent Welcome Comment
    await this.addComment({
      project_id: newProjectId,
      user_id: matchedAgent.toLowerCase().replace(/\s+/g, '-'),
      user_name: matchedAgent,
      user_role: 'ai_agent',
      message: `Hello! I am your assigned ${matchedAgent}. I have received your files and prompt for "${projectData.title}". I am initiating requirements analysis now.`,
      is_ai_generated: true,
    });

    return newProject;
  },

  /**
   * Update Project Status and Progress Percentage
   */
  async updateProjectStatus(
    projectId: string,
    status: ProjectStatus,
    progressPercentage?: number,
    assignedAgent?: string
  ): Promise<Project | null> {
    const updatedAt = new Date().toISOString();

    if (isSupabaseConfigured) {
      try {
        const updates: Partial<Project> = { status, updated_at: updatedAt };
        if (progressPercentage !== undefined) updates.progress_percentage = progressPercentage;
        if (assignedAgent) updates.assigned_agent = assignedAgent;

        await supabase.from('projects').update(updates).eq('id', projectId);
      } catch (err) {
        console.warn('Supabase update status error:', err);
      }
    }

    const projects = getLocalProjects();
    const index = projects.findIndex((p) => p.id === projectId);
    if (index !== -1) {
      projects[index].status = status;
      projects[index].updated_at = updatedAt;
      if (progressPercentage !== undefined) projects[index].progress_percentage = progressPercentage;
      if (assignedAgent) projects[index].assigned_agent = assignedAgent;

      saveLocalProjects(projects);

      // Log activity and notify
      await this.addNotification(
        projects[index].student_id,
        `Project Status Updated: ${status}`,
        `Your project "${projects[index].title}" is now marked as "${status}".`,
        'status'
      );

      return projects[index];
    }
    return null;
  },

  /**
   * Upload additional file to project
   */
  async uploadProjectFile(
    projectId: string,
    file: File,
    uploadedBy: string
  ): Promise<ProjectFile> {
    const fileId = crypto.randomUUID();
    let fileUrl = URL.createObjectURL(file);

    if (isSupabaseConfigured) {
      try {
        const filePath = `files/${projectId}_${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from(STORAGE_BUCKET_NAME)
          .upload(filePath, file, { upsert: true });

        if (!uploadErr) {
          const { data: publicData } = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(filePath);
          if (publicData?.publicUrl) fileUrl = publicData.publicUrl;
        }
      } catch (err) {
        console.warn('Storage upload error:', err);
      }
    }

    const newFile: ProjectFile = {
      id: fileId,
      project_id: projectId,
      file_name: file.name,
      file_url: fileUrl,
      file_size: file.size,
      file_type: file.type || file.name.split('.').pop() || 'file',
      uploaded_by: uploadedBy,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('project_files').insert([newFile]);
      } catch (e) {
        console.warn('Insert file error:', e);
      }
    }

    // Update local state
    const projects = getLocalProjects();
    const target = projects.find((p) => p.id === projectId);
    if (target) {
      if (!target.files) target.files = [];
      target.files.push(newFile);
      saveLocalProjects(projects);
    }

    return newFile;
  },

  /**
   * Get Comments for a project
   */
  async getComments(projectId: string): Promise<Comment[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('project_comments')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (!error && data) return data as Comment[];
      } catch (e) {
        console.warn('Supabase fetch comments error:', e);
      }
    }

    const comments = getLocalComments();
    return comments.filter((c) => c.project_id === projectId);
  },

  /**
   * Alias for getComments
   */
  async getProjectComments(projectId: string): Promise<Comment[]> {
    return this.getComments(projectId);
  },

  /**
   * Add a Comment or Discussion Message
   */
  async addComment(commentData: {
    project_id: string;
    user_id: string;
    user_name: string;
    user_role: 'student' | 'freelancer' | 'admin' | 'ai_agent';
    message: string;
    is_ai_generated?: boolean;
  }): Promise<Comment> {
    const newComment: Comment = {
      id: crypto.randomUUID(),
      project_id: commentData.project_id,
      user_id: commentData.user_id,
      user_name: commentData.user_name,
      user_role: commentData.user_role,
      message: commentData.message,
      created_at: new Date().toISOString(),
      is_ai_generated: commentData.is_ai_generated || false,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('project_comments').insert([newComment]);
      } catch (e) {
        console.warn('Supabase comment insert error:', e);
      }
    }

    const comments = getLocalComments();
    comments.push(newComment);
    saveLocalComments(comments);

    return newComment;
  },

  /**
   * Notifications API
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as Notification[];
      } catch (e) {
        console.warn('Supabase get notifs error:', e);
      }
    }
    const notifs = getLocalNotifications();
    return notifs.filter((n) => n.user_id === userId || n.user_id === 'usr-student-001');
  },

  async addNotification(
    userId: string,
    title: string,
    message: string,
    type: 'status' | 'comment' | 'system' | 'assignment' = 'status'
  ): Promise<Notification> {
    const notif: Notification = {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      message,
      is_read: false,
      type,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        // Only insert into Supabase if userId is a valid UUID
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
          await supabase.from('notifications').insert([notif]);
        }
      } catch (e) {
        console.warn('Insert notification error:', e);
      }
    }

    const notifs = getLocalNotifications();
    notifs.unshift(notif);
    saveLocalNotifications(notifs);

    return notif;
  },

  async markNotificationRead(notifId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
      } catch (e) {
        console.warn('Mark read error:', e);
      }
    }

    const notifs = getLocalNotifications();
    const found = notifs.find((n) => n.id === notifId);
    if (found) {
      found.is_read = true;
      saveLocalNotifications(notifs);
    }
  },

  /**
   * Activity Logs API
   */
  async getActivityLogs(userId: string): Promise<ActivityLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as ActivityLog[];
      } catch (e) {
        console.warn('Supabase activity log error:', e);
      }
    }

    const logs = getLocalLogs();
    return logs.filter((l) => l.user_id === userId || l.user_id === 'usr-student-001');
  },

  async addActivityLog(userId: string, activity: string, details?: string): Promise<ActivityLog> {
    const log: ActivityLog = {
      id: crypto.randomUUID(),
      user_id: userId,
      activity,
      details,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
          await supabase.from('activity_logs').insert([log]);
        }
      } catch (e) {
        console.warn('Insert activity log error:', e);
      }
    }

    const logs = getLocalLogs();
    logs.unshift(log);
    saveLocalLogs(logs);

    return log;
  },

  /**
   * Simulated AI Agent Step Processor
   * Advances project status in background to simulate live Agent processing for demo
   */
  simulateAIAgentProgress(projectId: string, callback?: (updatedProject: Project) => void): void {
    const projects = getLocalProjects();
    const index = projects.findIndex((p) => p.id === projectId);
    if (index === -1) return;

    const currentStatus = projects[index].status;
    let nextStatus: ProjectStatus = 'In Progress';
    let nextPct = 50;

    if (currentStatus === 'Submitted') {
      nextStatus = 'Analyzing';
      nextPct = 25;
    } else if (currentStatus === 'Analyzing') {
      nextStatus = 'Assigned';
      nextPct = 40;
    } else if (currentStatus === 'Assigned') {
      nextStatus = 'In Progress';
      nextPct = 65;
    } else if (currentStatus === 'In Progress') {
      nextStatus = 'Review';
      nextPct = 90;
    } else if (currentStatus === 'Review') {
      nextStatus = 'Completed';
      nextPct = 100;
    }

    projects[index].status = nextStatus;
    projects[index].progress_percentage = nextPct;
    projects[index].updated_at = new Date().toISOString();

    saveLocalProjects(projects);

    if (callback) {
      callback(projects[index]);
    }
  },
};