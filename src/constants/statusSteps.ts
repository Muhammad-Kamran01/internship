import { ProjectStatus } from '../types';

export interface StatusStep {
  status: ProjectStatus;
  label: string;
  description: string;
  stepNumber: number;
  iconName: string;
}

export const PROJECT_STATUS_STEPS: StatusStep[] = [
  {
    status: 'Submitted',
    label: 'Submitted',
    description: 'Task received and queued in system',
    stepNumber: 1,
    iconName: 'Send',
  },
  {
    status: 'Analyzing',
    label: 'Pre-Analysis',
    description: 'Analyzing requirements & estimating scope',
    stepNumber: 2,
    iconName: 'Cpu',
  },
  {
    status: 'Assigned',
    label: 'Assistant Assigned',
    description: 'Specialized assistant / Freelancer assigned',
    stepNumber: 3,
    iconName: 'UserCheck',
  },
  {
    status: 'In Progress',
    label: 'In Progress',
    description: 'Assistant actively working on your academic task',
    stepNumber: 4,
    iconName: 'Clock',
  },
  {
    status: 'Review',
    label: 'Quality Review',
    description: 'Plagiarism & accuracy audit in progress',
    stepNumber: 5,
    iconName: 'ShieldCheck',
  },
  {
    status: 'Completed',
    label: 'Completed',
    description: 'Final deliverable ready for download',
    stepNumber: 6,
    iconName: 'CheckCircle2',
  },
];