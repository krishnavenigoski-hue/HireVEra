export interface JobProfile {
  id: string;
  title: string;
  companyName?: string;
  jobDescription: string;
  requiredSkills: string[];
  eligibilityThreshold: number; // default 75
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
