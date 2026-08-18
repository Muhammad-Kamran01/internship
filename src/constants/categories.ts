export interface AcademicCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
  recommendedAgent?: string;
  turnaroundDays?: number;
  status?: 'active' | 'inactive';
  projects_count?: number;
  created_at?: string;
}

export const ACADEMIC_CATEGORIES: AcademicCategory[] = [
  {
    id: 'fyp-thesis',
    name: 'FYP & Thesis Writing',
    description: 'Complete proposals, literature reviews, SRS, methodologies, and chapter writing.',
    iconName: 'GraduationCap',
    recommendedAgent: 'Thesis & Research Assistant',
    turnaroundDays: 5,
    status: 'active',
  },
  {
    id: 'programming-code',
    name: 'Programming & Software Development',
    description: 'Full-stack web apps, mobile applications, data structures, algorithms & bug fixes.',
    iconName: 'Code',
    recommendedAgent: 'Programming Assistant',
    turnaroundDays: 3,
    status: 'active',
  },
  {
    id: 'documentation-srs',
    name: 'Software Documentation & SRS',
    description: 'Software Requirement Specifications, UML diagrams, architecture design & API specs.',
    iconName: 'FileText',
    recommendedAgent: 'Documentation Assistant',
    turnaroundDays: 2,
    status: 'active',
  },
  {
    id: 'research-paper',
    name: 'Research Paper & Literature Review',
    description: 'Peer-reviewed research formatting, IEEE / APA citation, latex and deep literature search.',
    iconName: 'Search',
    recommendedAgent: 'Research Assistant',
    turnaroundDays: 4,
    status: 'active',
  },
  {
    id: 'assignment-essay',
    name: 'Academic Assignment & Essay',
    description: 'Case studies, analytical essays, critical reviews, and structured problem solving.',
    iconName: 'BookOpen',
    recommendedAgent: 'Assignment Assistant',
    turnaroundDays: 2,
    status: 'active',
  },
  {
    id: 'presentation-deck',
    name: 'Presentation & Defense Decks',
    description: 'Professional slide decks, speaker notes, defense preparation & visual infographics.',
    iconName: 'Presentation',
    recommendedAgent: 'Presentation Assistant',
    turnaroundDays: 1,
    status: 'active',
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis & Statistics',
    description: 'SPSS, Python/R data processing, statistical tests, charts, and research insights.',
    iconName: 'BarChart3',
    recommendedAgent: 'Data Analysis Assistant',
    turnaroundDays: 3,
    status: 'active',
  },
];