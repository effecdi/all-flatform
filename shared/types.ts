export interface ProgramFilters {
  supportType?: string;
  status?: string;
  region?: string;
  search?: string;
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
