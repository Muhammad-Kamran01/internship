import { supabase, isSupabaseConfigured, STORAGE_BUCKET_NAME } from './client';
import {
  Proposal,
  ProposalStatus,
  Delivery,
  DeliveryStatus,
  EarningRecord,
  AssistantProfile,
  Project,
  ProjectFile,
} from '../../types';
import {
  INITIAL_MOCK_PROPOSALS,
  INITIAL_MOCK_EARNINGS,
  INITIAL_DEMO_FREELANCER,
} from '../../constants/mockData';
import { projectService } from './projectService';

const LOCAL_PROPOSALS_KEY = 'student_assistant_proposals';
const LOCAL_DELIVERIES_KEY = 'student_assistant_deliveries';
const LOCAL_EARNINGS_KEY = 'student_assistant_earnings';
const LOCAL_ASSISTANT_PROFILE_KEY = 'student_assistant_freelancer_profile';

function getLocalProposals(): Proposal[] {
  const stored = localStorage.getItem(LOCAL_PROPOSALS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(LOCAL_PROPOSALS_KEY, JSON.stringify(INITIAL_MOCK_PROPOSALS));
  return INITIAL_MOCK_PROPOSALS;
}

function saveLocalProposals(proposals: Proposal[]): void {
  localStorage.setItem(LOCAL_PROPOSALS_KEY, JSON.stringify(proposals));
}

function getLocalDeliveries(): Delivery[] {
  const stored = localStorage.getItem(LOCAL_DELIVERIES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return [];
}

function saveLocalDeliveries(deliveries: Delivery[]): void {
  localStorage.setItem(LOCAL_DELIVERIES_KEY, JSON.stringify(deliveries));
}

function getLocalEarnings(): EarningRecord[] {
  const stored = localStorage.getItem(LOCAL_EARNINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(LOCAL_EARNINGS_KEY, JSON.stringify(INITIAL_MOCK_EARNINGS));
  return INITIAL_MOCK_EARNINGS;
}

function saveLocalEarnings(earnings: EarningRecord[]): void {
  localStorage.setItem(LOCAL_EARNINGS_KEY, JSON.stringify(earnings));
}

function isUuid(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export const proposalService = {
  /**
   * Get all proposals submitted by a freelancer
   */
  async getProposalsForFreelancer(freelancerId: string): Promise<Proposal[]> {
    if (isSupabaseConfigured && isUuid(freelancerId)) {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*, project:projects(*)')
          .eq('freelancer_id', freelancerId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((item: any) => ({
            ...item,
            project_title: item.project?.title,
            project_category: item.project?.category,
            project_budget: item.project?.budget,
            project_deadline: item.project?.deadline,
          })) as Proposal[];
        }
      } catch (e) {
        console.warn('Fetch proposals error:', e);
      }
    }

    const proposals = getLocalProposals();
    return proposals.filter(
      (p) => p.freelancer_id === freelancerId || freelancerId === 'usr-freelancer-001'
    );
  },

  /**
   * Get all proposals submitted for a specific project (Student view)
   */
  async getProposalsForProject(projectId: string): Promise<Proposal[]> {
    if (isSupabaseConfigured && isUuid(projectId)) {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as Proposal[];
      } catch (e) {
        console.warn('Fetch project proposals error:', e);
      }
    }

    const proposals = getLocalProposals();
    return proposals.filter((p) => p.project_id === projectId);
  },

  /**
   * Check if freelancer has already submitted a proposal for this project
   */
  async hasSubmittedProposal(projectId: string, freelancerId: string): Promise<boolean> {
    const proposals = await this.getProposalsForFreelancer(freelancerId);
    return proposals.some((p) => p.project_id === projectId && p.status !== 'Withdrawn');
  },

  /**
   * Submit a new proposal as Assistant
   */
  async submitProposal(
    proposalData: {
      project_id: string;
      freelancer_id: string;
      freelancer_name: string;
      freelancer_photo?: string;
      cover_letter: string;
      proposed_price: number;
      estimated_days: number;
    },
    attachmentFile?: File
  ): Promise<Proposal> {
    const project = await projectService.getProjectById(proposalData.project_id);
    const newProposalId = crypto.randomUUID();
    let attachmentUrl: string | undefined;
    let attachmentName: string | undefined;

    if (attachmentFile) {
      attachmentName = attachmentFile.name;
      attachmentUrl = URL.createObjectURL(attachmentFile);

      if (isSupabaseConfigured) {
        try {
          const path = `proposals/${newProposalId}_${attachmentFile.name}`;
          const { error: uploadErr } = await supabase.storage
            .from(STORAGE_BUCKET_NAME)
            .upload(path, attachmentFile, { upsert: true });

          if (!uploadErr) {
            const { data: publicData } = supabase.storage
              .from(STORAGE_BUCKET_NAME)
              .getPublicUrl(path);
            if (publicData?.publicUrl) attachmentUrl = publicData.publicUrl;
          }
        } catch (err) {
          console.warn('Proposal file upload warning:', err);
        }
      }
    }

    const newProposal: Proposal = {
      id: newProposalId,
      project_id: proposalData.project_id,
      project_title: project?.title || 'Academic Task',
      project_category: project?.category || 'General',
      project_budget: project?.budget || 0,
      project_deadline: project?.deadline || '',
      freelancer_id: proposalData.freelancer_id,
      freelancer_name: proposalData.freelancer_name,
      freelancer_photo: proposalData.freelancer_photo,
      cover_letter: proposalData.cover_letter,
      proposed_price: proposalData.proposed_price,
      estimated_days: proposalData.estimated_days,
      status: 'Pending',
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && isUuid(proposalData.freelancer_id) && isUuid(proposalData.project_id)) {
      try {
        await supabase.from('proposals').insert([
          {
            id: newProposal.id,
            project_id: newProposal.project_id,
            freelancer_id: newProposal.freelancer_id,
            cover_letter: newProposal.cover_letter,
            proposed_price: newProposal.proposed_price,
            estimated_days: newProposal.estimated_days,
            status: newProposal.status,
            attachment_url: newProposal.attachment_url,
            attachment_name: newProposal.attachment_name,
          },
        ]);
      } catch (err) {
        console.warn('Supabase proposal insert error:', err);
      }
    }

    // Save in local storage
    const proposals = getLocalProposals();
    proposals.unshift(newProposal);
    saveLocalProposals(proposals);

    // Increment project proposals_count
    if (project) {
      const allProj = await projectService.getProjects();
      const target = allProj.find((p) => p.id === project.id);
      if (target) {
        target.proposals_count = (target.proposals_count || 0) + 1;
        // Notify student about new proposal
        await projectService.addNotification(
          project.student_id,
          'New Proposal Received',
          `Assistant ${proposalData.freelancer_name} submitted a proposal ($${proposalData.proposed_price}) for "${project.title}".`,
          'status'
        );
      }
    }

    // Add activity log for freelancer
    await projectService.addActivityLog(
      proposalData.freelancer_id,
      'Submitted Proposal',
      `Submitted proposal for "${project?.title || 'Project'}" ($${proposalData.proposed_price}).`
    );

    return newProposal;
  },

  /**
   * Withdraw a proposal
   */
  async withdrawProposal(proposalId: string): Promise<void> {
    if (isSupabaseConfigured && isUuid(proposalId)) {
      try {
        await supabase
          .from('proposals')
          .update({ status: 'Withdrawn', updated_at: new Date().toISOString() })
          .eq('id', proposalId);
      } catch (e) {
        console.warn('Withdraw proposal DB error:', e);
      }
    }

    const proposals = getLocalProposals();
    const found = proposals.find((p) => p.id === proposalId);
    if (found) {
      found.status = 'Withdrawn';
      found.updated_at = new Date().toISOString();
      saveLocalProposals(proposals);
    }
  },

  /**
   * Student Accepts a Proposal
   */
  async acceptProposal(
    proposalId: string,
    projectId: string,
    assistantName: string,
    freelancerId: string
  ): Promise<void> {
    // 1. Mark target proposal as Accepted
    if (isSupabaseConfigured && isUuid(proposalId)) {
      try {
        await supabase
          .from('proposals')
          .update({ status: 'Accepted', updated_at: new Date().toISOString() })
          .eq('id', proposalId);

        // Reject other pending proposals for this project
        await supabase
          .from('proposals')
          .update({ status: 'Rejected', updated_at: new Date().toISOString() })
          .eq('project_id', projectId)
          .neq('id', proposalId);
      } catch (e) {
        console.warn('Accept proposal DB error:', e);
      }
    }

    const proposals = getLocalProposals();
    proposals.forEach((p) => {
      if (p.project_id === projectId) {
        if (p.id === proposalId) p.status = 'Accepted';
        else if (p.status === 'Pending') p.status = 'Rejected';
        p.updated_at = new Date().toISOString();
      }
    });
    saveLocalProposals(proposals);

    // 2. Update project status to Assigned / In Progress & assign assistant
    await projectService.updateProjectStatus(projectId, 'In Progress', 25, assistantName);

    // 3. Notify Assistant
    await projectService.addNotification(
      freelancerId,
      '🎉 Proposal Accepted!',
      `Your proposal for project #${projectId.slice(-6).toUpperCase()} was accepted! You can now start working on the project.`,
      'assignment'
    );
  },

  /**
   * Get Active Projects for Freelancer/Assistant
   */
  async getActiveProjectsForFreelancer(freelancerId: string): Promise<Project[]> {
    const allProjects = await projectService.getProjects();
    const freelancerProposals = await this.getProposalsForFreelancer(freelancerId);
    const acceptedProjectIds = new Set(
      freelancerProposals.filter((p) => p.status === 'Accepted').map((p) => p.project_id)
    );

    return allProjects.filter(
      (p) =>
        acceptedProjectIds.has(p.id) ||
        p.id === 'proj-001' || // Keep default demo active project
        p.id === 'proj-002' ||
        p.id === 'proj-003'
    );
  },

  /**
   * Submit Work Delivery
   */
  async submitDelivery(
    deliveryData: {
      project_id: string;
      freelancer_id: string;
      freelancer_name: string;
      delivery_message: string;
      notes?: string;
    },
    attachedFiles: File[] = []
  ): Promise<Delivery> {
    const deliveryId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const uploadedFiles: ProjectFile[] = [];
    for (const file of attachedFiles) {
      const fileRecord = await projectService.uploadProjectFile(
        deliveryData.project_id,
        file,
        deliveryData.freelancer_name
      );
      uploadedFiles.push(fileRecord);
    }

    const newDelivery: Delivery = {
      id: deliveryId,
      project_id: deliveryData.project_id,
      freelancer_id: deliveryData.freelancer_id,
      freelancer_name: deliveryData.freelancer_name,
      delivery_message: deliveryData.delivery_message,
      notes: deliveryData.notes,
      status: 'Submitted for Review',
      files: uploadedFiles,
      created_at: createdAt,
    };

    if (isSupabaseConfigured && isUuid(deliveryData.project_id)) {
      try {
        await supabase.from('deliveries').insert([
          {
            id: newDelivery.id,
            project_id: newDelivery.project_id,
            freelancer_id: newDelivery.freelancer_id,
            delivery_message: newDelivery.delivery_message,
            notes: newDelivery.notes,
            status: newDelivery.status,
          },
        ]);
      } catch (err) {
        console.warn('Supabase delivery insert error:', err);
      }
    }

    const deliveries = getLocalDeliveries();
    deliveries.unshift(newDelivery);
    saveLocalDeliveries(deliveries);

    // Update project status to 'Review'
    const project = await projectService.getProjectById(deliveryData.project_id);
    if (project) {
      await projectService.updateProjectStatus(project.id, 'Review', 90);

      // Notify Student
      await projectService.addNotification(
        project.student_id,
        'Project Deliverable Submitted for Review',
        `Assistant ${deliveryData.freelancer_name} has submitted the completed work for "${project.title}". Please review and confirm.`,
        'status'
      );
    }

    return newDelivery;
  },

  /**
   * Get Deliveries for a project
   */
  async getDeliveriesForProject(projectId: string): Promise<Delivery[]> {
    if (isSupabaseConfigured && isUuid(projectId)) {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as Delivery[];
      } catch (e) {
        console.warn('Fetch deliveries error:', e);
      }
    }

    const deliveries = getLocalDeliveries();
    return deliveries.filter((d) => d.project_id === projectId);
  },

  /**
   * Student Accepts Delivery -> Marks Project Completed & Releases Earnings
   */
  async acceptDelivery(projectId: string, studentId?: string): Promise<void> {
    const project = await projectService.getProjectById(projectId);
    if (!project) return;

    // 1. Update project status to Completed (100%)
    await projectService.updateProjectStatus(projectId, 'Completed', 100);

    // 2. Mark deliveries as Accepted
    const deliveries = getLocalDeliveries();
    let assignedFreelancerId = 'usr-freelancer-001';
    let assignedFreelancerName = 'Assistant';

    deliveries.forEach((d) => {
      if (d.project_id === projectId) {
        d.status = 'Accepted';
        d.updated_at = new Date().toISOString();
        if (d.freelancer_id) assignedFreelancerId = d.freelancer_id;
        if (d.freelancer_name) assignedFreelancerName = d.freelancer_name;
      }
    });
    saveLocalDeliveries(deliveries);

    // Also check proposals for accepted freelancer
    const proposals = getLocalProposals();
    const acceptedProp = proposals.find((p) => p.project_id === projectId && p.status === 'Accepted');
    if (acceptedProp) {
      if (acceptedProp.freelancer_id) assignedFreelancerId = acceptedProp.freelancer_id;
      if (acceptedProp.freelancer_name) assignedFreelancerName = acceptedProp.freelancer_name;
    }

    if (isSupabaseConfigured && isUuid(projectId)) {
      try {
        await supabase
          .from('deliveries')
          .update({ status: 'Accepted', updated_at: new Date().toISOString() })
          .eq('project_id', projectId);
      } catch (e) {
        console.warn('Accept delivery DB error:', e);
      }
    }

    // 3. Find proposal bid price or use budget for earnings
    const earningsAmount = acceptedProp?.proposed_price || project.budget || 150;
    const earningId = crypto.randomUUID();

    const newEarning: EarningRecord = {
      id: earningId,
      project_id: projectId,
      project_title: project.title,
      freelancer_id: assignedFreelancerId,
      amount: earningsAmount,
      status: 'Available',
      completed_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && isUuid(projectId)) {
      try {
        await supabase.from('earnings').insert([newEarning]);
      } catch (e) {
        console.warn('Earnings insert error:', e);
      }
    }

    const earnings = getLocalEarnings();
    earnings.unshift(newEarning);
    saveLocalEarnings(earnings);

    // 4. Add celebration comment to discussion
    await projectService.addComment({
      project_id: projectId,
      user_id: studentId || project.student_id,
      user_name: project.student_name || 'Student',
      user_role: 'student',
      message: `🎉 Work delivery has been approved! The project is marked as Completed. Thank you, ${assignedFreelancerName}!`,
    });

    // 5. Notify Assistant
    await projectService.addNotification(
      assignedFreelancerId,
      '🎉 Delivery Approved & Earnings Released!',
      `The student approved your work for "${project.title}". PKR ${earningsAmount.toLocaleString()} has been credited to your available balance.`,
      'status'
    );
  },

  /**
   * Student Requests Revision
   */
  async requestRevision(projectId: string, revisionNotes: string): Promise<void> {
    const project = await projectService.getProjectById(projectId);
    if (!project) return;

    await projectService.updateProjectStatus(projectId, 'Review', 80);

    // Update latest delivery
    const deliveries = getLocalDeliveries();
    const latest = deliveries.find((d) => d.project_id === projectId);
    if (latest) {
      latest.status = 'Revision Requested';
      latest.revision_notes = revisionNotes;
      latest.updated_at = new Date().toISOString();
      saveLocalDeliveries(deliveries);
    }

    // Add comment to project discussion
    await projectService.addComment({
      project_id: projectId,
      user_id: project.student_id,
      user_name: project.student_name || 'Student',
      user_role: 'student',
      message: `REVISION REQUESTED: ${revisionNotes}`,
    });

    // Notify Assistant
    await projectService.addNotification(
      'usr-freelancer-001',
      'Revision Requested by Student',
      `Changes requested on "${project.title}": "${revisionNotes}"`,
      'status'
    );
  },

  /**
   * Get Earnings for Freelancer
   */
  async getEarningsForFreelancer(freelancerId: string): Promise<{
    totalEarnings: number;
    completedEarnings: number;
    pendingEarnings: number;
    availableBalance: number;
    records: EarningRecord[];
  }> {
    const records = getLocalEarnings().filter(
      (e) => e.freelancer_id === freelancerId || freelancerId === 'usr-freelancer-001'
    );

    const available = records
      .filter((r) => r.status === 'Available')
      .reduce((sum, r) => sum + r.amount, 0);

    const pending = records
      .filter((r) => r.status === 'Pending')
      .reduce((sum, r) => sum + r.amount, 0);

    const total = available + pending;

    return {
      totalEarnings: total,
      completedEarnings: available,
      pendingEarnings: pending,
      availableBalance: available,
      records,
    };
  },

  /**
   * Get Assistant Profile details
   */
  async getAssistantProfile(userId: string): Promise<AssistantProfile> {
    const stored = localStorage.getItem(LOCAL_ASSISTANT_PROFILE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }

    const defaultProfile: AssistantProfile = {
      ...INITIAL_DEMO_FREELANCER,
      title: 'Senior Academic Research Assistant & Systems Engineer',
      bio: 'Dedicated academic specialist with over 7 years of experience helping undergraduate and graduate students excel in FYP software engineering, documentation, thesis writing, and statistical data analysis.',
      skills: [
        'React & TypeScript',
        'Python & Data Science',
        'IEEE Documentation',
        'Thesis Writing',
        'LaTeX',
        'Software Architecture',
        'SQL & Supabase',
        'Statistical Analysis',
      ],
      academic_expertise: [
        'Final Year Projects (FYP)',
        'Computer Science & Software Engineering',
        'Machine Learning & AI Ethics',
        'System Requirement Specification (SRS)',
        'Research Literature Reviews',
      ],
      categories: [
        'FYP & Thesis Writing',
        'Programming & Software Development',
        'Research Paper & Literature Review',
        'Data Analysis & Statistics',
      ],
      experience_years: 7,
      education: 'Ph.D. in Computer Science (MIT AI Lab)',
      languages: ['English (Fluent / Academic)', 'Urdu (Native)', 'Spanish (Basic)'],
      rating: 4.95,
      reviews_count: 48,
      completed_projects_count: 64,
      success_rate: 99,
      portfolio: [
        {
          id: 'port-001',
          title: 'IEEE Format Smart Attendance System SRS',
          description: 'Comprehensive 45-page Software Requirements Specification including UML Use Case & Sequence Diagrams.',
          category: 'FYP & Thesis Writing',
        },
        {
          id: 'port-002',
          title: 'Microservices E-Commerce API',
          description: 'Scalable Node.js & React full-stack application for undergraduate capstone project.',
          category: 'Programming & Software Development',
        },
      ],
    };

    localStorage.setItem(LOCAL_ASSISTANT_PROFILE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  /**
   * Process Freelancer Payout Request
   */
  async processWithdrawal(data: {
    freelancerId: string;
    amount: number;
    payoutMethod: string;
    providerName: string;
    accountTitle: string;
    accountNumber: string;
  }): Promise<void> {
    const earnings = getLocalEarnings();
    // Mark or insert payout record
    const payoutRecord: EarningRecord = {
      id: crypto.randomUUID(),
      project_id: 'payout-' + Date.now(),
      project_title: `Payout Withdrawal (${data.providerName} - ${data.accountTitle})`,
      freelancer_id: data.freelancerId,
      amount: -data.amount,
      status: 'Available',
      completed_at: new Date().toISOString(),
    };

    earnings.unshift(payoutRecord);
    saveLocalEarnings(earnings);

    await projectService.addNotification(
      data.freelancerId,
      '💸 Payout Processed Successfully',
      `Withdrawal of PKR ${data.amount.toLocaleString()} requested to ${data.providerName} (${data.accountNumber}). Funds will arrive in 24-48 hours.`,
      'status'
    );
  },

  /**
   * Update Assistant Profile
   */
  async updateAssistantProfile(userId: string, data: Partial<AssistantProfile>): Promise<AssistantProfile> {
    const current = await this.getAssistantProfile(userId);
    const updated = { ...current, ...data };
    localStorage.setItem(LOCAL_ASSISTANT_PROFILE_KEY, JSON.stringify(updated));
    return updated;
  },
};