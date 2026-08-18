import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectPriority, ProjectStatus } from '../types';
import { projectService } from '../services/supabase/projectService';
import { useAuth } from '../context/AuthContext';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // If student, filter by student_id; otherwise show platform projects
      const studentId = user?.role === 'student' ? user.id : undefined;
      const data = await projectService.getProjects(studentId);
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (
    projectData: {
      title: string;
      description: string;
      category: string;
      deadline: string;
      budget?: number;
      priority: ProjectPriority;
    },
    attachedFiles: File[] = []
  ) => {
    if (!user) throw new Error('User must be logged in to create a project');

    const created = await projectService.createProject(
      {
        student_id: user.id,
        student_name: user.full_name,
        ...projectData,
      },
      attachedFiles
    );

    setProjects((prev) => [created, ...prev]);
    return created;
  };

  const updateStatus = async (
    projectId: string,
    status: ProjectStatus,
    progressPercentage?: number,
    assignedAgent?: string
  ) => {
    const updated = await projectService.updateProjectStatus(
      projectId,
      status,
      progressPercentage,
      assignedAgent
    );
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    }
    return updated;
  };

  return {
    projects,
    loading,
    error,
    refreshProjects: fetchProjects,
    createProject,
    updateStatus,
  };
}
