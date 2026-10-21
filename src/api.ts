export interface JobProfile {
  id: string;
  title: string;
  companyName?: string;
  jobDescription: string;
  requiredSkills: string[];
  eligibilityThreshold: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type SuitabilityCategory = 'BEST_SUITABLE' | 'MEDIUM_SUITABLE' | 'LOW_SUITABLE';
export type ExtractionStatus = 'SUCCESS' | 'NEEDS_REVIEW' | 'FAILED';
export type ScreeningStatus = 'CREATED' | 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type FileType = 'PDF' | 'DOCX' | 'IMAGE' | 'CAMERA' | 'TEXT';

export interface MatchResult {
  id: string;
  candidateResumeId: string;
  jobProfileId: string;
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  matchingPercentage: number;
  suitabilityCategory: SuitabilityCategory;
  recommendationExplanation: string;
  rank: number;
  isEligible: boolean;
  createdAt: string;
}

export interface CandidateResume {
  id: string;
  screeningSessionId: string;
  candidateName: string;
  email: string;
  phone: string;
  originalFilename: string;
  fileType: FileType;
  fileSizeBytes: number;
  contentHash: string;
  rawText: string;
  extractionStatus: ExtractionStatus;
  extractionWarnings: string[];
  extractedEducation: string[];
  extractedExperience: string[];
  identifiedSkills: string[];
  matchResult?: MatchResult;
  createdAt: string;
}

export interface ScreeningSession {
  id: string;
  jobProfileId: string;
  jobProfile: JobProfile;
  status: ScreeningStatus;
  totalUploadedFiles: number;
  successfullyProcessedFiles: number;
  failedFiles: number;
  candidates: CandidateResume[];
  createdAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalResumesProcessed: number;
  totalCandidatesAnalysed: number;
  bestSuitableCandidates: number;
  mediumSuitableCandidates: number;
  lowSuitableCandidates: number;
  reviewNeededResumes: number;
  totalScreeningSessions: number;
  recentSessions: ScreeningSession[];
  recentCandidates: CandidateResume[];
}

export const api = {
  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Jobs
  async getJobs(): Promise<JobProfile[]> {
    const res = await fetch('/api/jobs');
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  async getJob(id: string): Promise<JobProfile> {
    const res = await fetch(`/api/jobs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch job');
    return res.json();
  },

  async createJob(data: Partial<JobProfile>): Promise<JobProfile> {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create job');
    }
    return res.json();
  },

  async updateJob(id: string, data: Partial<JobProfile>): Promise<JobProfile> {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update job');
    }
    return res.json();
  },

  async deleteJob(id: string): Promise<void> {
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete job');
  },

  // Screenings
  async getScreenings(): Promise<ScreeningSession[]> {
    const res = await fetch('/api/screenings');
    if (!res.ok) throw new Error('Failed to fetch screenings');
    return res.json();
  },

  async getScreening(id: string): Promise<ScreeningSession> {
    const res = await fetch(`/api/screenings/${id}`);
    if (!res.ok) throw new Error('Failed to fetch screening');
    return res.json();
  },

  async createScreening(jobProfileId: string): Promise<ScreeningSession> {
    const res = await fetch('/api/screenings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobProfileId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to initialize screening session');
    }
    return res.json();
  },

  async uploadResumes(screeningId: string, files: File[]): Promise<any> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('resumes', file);
    }
    const res = await fetch(`/api/screenings/${screeningId}/resumes`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  async uploadCameraResume(screeningId: string, imageBase64: string, filename?: string): Promise<any> {
    const res = await fetch(`/api/screenings/${screeningId}/camera-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, filename }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Camera photo upload failed');
    }
    return res.json();
  },

  async triggerAnalysis(screeningId: string): Promise<ScreeningSession> {
    const res = await fetch(`/api/screenings/${screeningId}/analyse`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Analysis execution failed');
    }
    const data = await res.json();
    return data;
  },

  async deleteScreening(id: string): Promise<void> {
    const res = await fetch(`/api/screenings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete screening session');
  },

  // Candidates
  async getCandidate(id: string): Promise<CandidateResume> {
    const res = await fetch(`/api/candidates/${id}`);
    if (!res.ok) throw new Error('Candidate not found');
    return res.json();
  },

  async getCandidateReport(id: string): Promise<{ candidate: CandidateResume; screeningSession: any }> {
    const res = await fetch(`/api/candidates/${id}/report`);
    if (!res.ok) throw new Error('Failed to fetch candidate report');
    return res.json();
  },

  // Reset demo seed
  async resetDemoSeed(): Promise<void> {
    const res = await fetch('/api/demo/reset-seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
  },

  // Skill Dictionary
  async getSkillDictionary(): Promise<any> {
    const res = await fetch('/api/skills/dictionary');
    if (!res.ok) throw new Error('Failed to fetch skill dictionary');
    return res.json();
  },
};
