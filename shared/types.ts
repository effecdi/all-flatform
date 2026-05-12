export interface ProgramFilters {
  supportType?: string;
  status?: string;
  region?: string;
  search?: string;
  deadline?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalGovernmentPrograms: number;
  activeGovernmentPrograms: number;
  totalInvestmentPrograms: number;
  upcomingDeadlines: number;
  bookmarkCount: number;
}

export interface InvestmentFilters {
  investorType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Program and Investment Card Props (Added)
export interface ProgramCardProps {
  id: string;
  title: string;
  type: string;
  status: string;
  dDay: string | null;
  isBookmarked: boolean;
  organization: string;
  region: string;
  amount: string;
  deadline: string | null;
  gradient?: string; // Added for dynamic gradient
}

export interface InvestmentCardProps {
  id: string;
  title: string;
  investmentType: string;
  status: string;
  dDay: string | null;
  isBookmarked: boolean;
  companyName: string;
  targetStage: string;
  investmentSize: string;
  deadline: string | null;
  gradient?: string; // Added for dynamic gradient
}

// Recommendation types (Added)
export interface Recommendation {
  id: string;
  programId: string;
  title: string;
  type: "government" | "investment";
  matchScore: number;
  reason: string[];
  isBookmarked: boolean;
  dDay: string | null;
}

// Notification types (Added)
export interface Notification {
  id: string;
  programId: string;
  title: string;
  dDay: string; // e.g., "D-7"
  type: "deadline" | "new_program" | "system";
}

// Dashboard Data (Expanded based on usage in dashboard.tsx)
export interface DashboardData {
  userProfileExists: boolean;
  statistics: {
    label: string;
    value: string;
    description: string;
    icon: string; // Icon name as string, e.g., "ClipboardList"
  }[];
  recentGovPrograms: ProgramCardProps[];
  recentInvestmentPrograms: InvestmentCardProps[];
  // recommendations는 별도로 fetch되므로 여기에 포함하지 않음
}


// Discover / Search types
export interface DiscoverProject {
  id: number;
  type: "government" | "investment";
  title: string;
  organization: string | null;
  description: string | null;
  status: string;
  region: string | null;
  endDate: string | null;
  supportAmount: string | null;
  supportType?: string;
  investorType?: string;
  applicationUrl: string | null;
  sourceUrl: string | null;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface DiscoverResponse {
  governmentProjects: DiscoverProject[];
  investmentProjects: DiscoverProject[];
  webResults: WebSearchResult[];
}
