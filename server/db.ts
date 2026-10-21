import fs from 'fs';
import path from 'path';
import { CandidateResume, DashboardStats, JobProfile, MatchResult, ScreeningSession } from './types.js';
import { skillMatchingService } from './services/matchingService.js';

const DATA_FILE = path.resolve(process.cwd(), 'skillmatch-data.json');

interface AppData {
  jobs: JobProfile[];
  screenings: ScreeningSession[];
}

export class DatabaseStore {
  private jobs: Map<string, JobProfile> = new Map();
  private screenings: Map<string, ScreeningSession> = new Map();
  private fileBuffers: Map<string, { buffer: Buffer; filename: string; mimetype: string }> = new Map();

  constructor() {
    this.load();
    if (this.jobs.size === 0) {
      this.seedDefaultData();
    }
  }

  private load(): void {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const data: AppData = JSON.parse(raw);
        for (const j of data.jobs || []) {
          this.jobs.set(j.id, j);
        }
        for (const s of data.screenings || []) {
          this.screenings.set(s.id, s);
        }
      }
    } catch (err) {
      console.warn('Failed to load database file, starting clean with seed:', err);
    }
  }

  public save(): void {
    try {
      const data: AppData = {
        jobs: Array.from(this.jobs.values()),
        screenings: Array.from(this.screenings.values()),
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save database file:', err);
    }
  }

  public storeFileBuffer(id: string, filename: string, mimetype: string, buffer: Buffer): void {
    this.fileBuffers.set(id, { buffer, filename, mimetype });
  }

  public getFileBuffer(id: string): { buffer: Buffer; filename: string; mimetype: string } | undefined {
    return this.fileBuffers.get(id);
  }

  // --- JOB PROFILES ---
  public getJobs(): JobProfile[] {
    return Array.from(this.jobs.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getJob(id: string): JobProfile | undefined {
    return this.jobs.get(id);
  }

  public createJob(job: Omit<JobProfile, 'id' | 'createdAt' | 'updatedAt'>): JobProfile {
    const id = `job-${Date.now()}`;
    const now = new Date().toISOString();
    const newJob: JobProfile = {
      ...job,
      id,
      eligibilityThreshold: job.eligibilityThreshold || 75,
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(id, newJob);
    this.save();
    return newJob;
  }

  public updateJob(id: string, updates: Partial<JobProfile>): JobProfile | undefined {
    const existing = this.jobs.get(id);
    if (!existing) return undefined;
    const updated: JobProfile = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.jobs.set(id, updated);
    this.save();
    return updated;
  }

  public deleteJob(id: string): boolean {
    const deleted = this.jobs.delete(id);
    if (deleted) this.save();
    return deleted;
  }

  // --- SCREENING SESSIONS ---
  public getScreenings(): ScreeningSession[] {
    return Array.from(this.screenings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getScreening(id: string): ScreeningSession | undefined {
    return this.screenings.get(id);
  }

  public createScreening(jobProfileId: string): ScreeningSession {
    const job = this.jobs.get(jobProfileId);
    if (!job) {
      throw new Error(`Job profile with ID '${jobProfileId}' does not exist.`);
    }

    const id = `scr-${Date.now()}`;
    const screening: ScreeningSession = {
      id,
      jobProfileId,
      jobProfile: job,
      status: 'CREATED',
      totalUploadedFiles: 0,
      successfullyProcessedFiles: 0,
      failedFiles: 0,
      candidates: [],
      createdAt: new Date().toISOString(),
    };

    this.screenings.set(id, screening);
    this.save();
    return screening;
  }

  public updateScreening(id: string, updates: Partial<ScreeningSession>): ScreeningSession | undefined {
    const existing = this.screenings.get(id);
    if (!existing) return undefined;
    const updated: ScreeningSession = {
      ...existing,
      ...updates,
    };
    this.screenings.set(id, updated);
    this.save();
    return updated;
  }

  public deleteScreening(id: string): boolean {
    const deleted = this.screenings.delete(id);
    if (deleted) this.save();
    return deleted;
  }

  // --- CANDIDATE LOOKUP ---
  public getCandidate(candidateId: string): CandidateResume | undefined {
    for (const screening of this.screenings.values()) {
      const found = screening.candidates.find(c => c.id === candidateId);
      if (found) return found;
    }
    return undefined;
  }

  // --- DASHBOARD STATS ---
  public getDashboardStats(): DashboardStats {
    let totalResumesProcessed = 0;
    let totalCandidatesAnalysed = 0;
    let bestSuitableCandidates = 0;
    let mediumSuitableCandidates = 0;
    let lowSuitableCandidates = 0;
    let reviewNeededResumes = 0;
    const allCandidates: CandidateResume[] = [];

    for (const scr of this.screenings.values()) {
      totalResumesProcessed += scr.totalUploadedFiles;
      for (const cand of scr.candidates) {
        totalCandidatesAnalysed++;
        allCandidates.push(cand);
        if (cand.extractionStatus === 'NEEDS_REVIEW' || cand.extractionStatus === 'FAILED') {
          reviewNeededResumes++;
        }
        if (cand.matchResult) {
          if (cand.matchResult.suitabilityCategory === 'BEST_SUITABLE') {
            bestSuitableCandidates++;
          } else if (cand.matchResult.suitabilityCategory === 'MEDIUM_SUITABLE') {
            mediumSuitableCandidates++;
          } else if (cand.matchResult.suitabilityCategory === 'LOW_SUITABLE') {
            lowSuitableCandidates++;
          }
        }
      }
    }

    const recentSessions = this.getScreenings().slice(0, 5);
    const recentCandidates = allCandidates
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    return {
      totalResumesProcessed,
      totalCandidatesAnalysed,
      bestSuitableCandidates,
      mediumSuitableCandidates,
      lowSuitableCandidates,
      reviewNeededResumes,
      totalScreeningSessions: this.screenings.size,
      recentSessions,
      recentCandidates,
    };
  }

  // --- SEED DEFAULT DATA ---
  public seedDefaultData(): void {
    const now = new Date();
    const demoJob: JobProfile = {
      id: 'job-default-java-intern',
      title: 'Java Backend Intern',
      companyName: 'Apex Cloud Innovations',
      jobDescription:
        'Seeking a passionate Java Backend Intern to design scalable microservices, implement Spring Boot controllers, optimize SQL queries, and integrate responsive HTML/web interfaces.',
      requiredSkills: ['Java', 'SQL', 'Spring Boot', 'HTML'],
      eligibilityThreshold: 75,
      notes: 'Initial technical screening for 2026 Engineering Graduate Cohort. Equal-weight evaluation on core competencies.',
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    };

    const fullStackJob: JobProfile = {
      id: 'job-fullstack-dev',
      title: 'Full Stack Software Engineer',
      companyName: 'Nexis Enterprise Systems',
      jobDescription:
        'Looking for a full stack engineer proficient in modern web applications, REST APIs, TypeScript, React, and backend Java services.',
      requiredSkills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'REST APIs', 'SQL'],
      eligibilityThreshold: 75,
      notes: 'Priority screening on API architecture and frontend integration.',
      createdAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
      updatedAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
    };

    this.jobs.set(demoJob.id, demoJob);
    this.jobs.set(fullStackJob.id, fullStackJob);

    // Create a completed demo screening session for the Java Backend Intern job
    const screeningId = 'scr-demo-cohort-01';

    const rawCandidates: Array<Omit<CandidateResume, 'id' | 'screeningSessionId' | 'matchResult' | 'createdAt'>> = [
      {
        candidateName: 'Aditya Sharma',
        email: 'aditya.sharma@example.edu',
        phone: '+91 98765 43210',
        originalFilename: 'Aditya_Sharma_Resume_Backend.pdf',
        fileType: 'PDF',
        fileSizeBytes: 84200,
        contentHash: 'hash-aditya-sharma-2026',
        rawText: `ADITYA SHARMA\nEmail: aditya.sharma@example.edu | Phone: +91 98765 43210\nEducation: B.Sc. Data Science & Computer Applications, CGPA: 9.1/10\nTechnical Skills: Java, Spring Boot, SQL, HTML, Hibernate, Git, REST APIs, Docker, Maven\nExperience: Backend Engineering Intern at FinTech Labs. Built robust REST APIs using Spring Boot and Hibernate. Tuned MySQL queries reducing response times by 35%.`,
        extractionStatus: 'SUCCESS',
        extractionWarnings: [],
        extractedEducation: ['B.Sc. Data Science & Computer Applications, CGPA: 9.1/10'],
        extractedExperience: [
          'Backend Engineering Intern at FinTech Labs: Built REST APIs using Spring Boot',
          'Database optimization: Tuned MySQL queries reducing latency',
        ],
        identifiedSkills: ['Java', 'SQL', 'Spring Boot', 'HTML', 'Hibernate', 'Git', 'REST APIs', 'Docker', 'Maven'],
      },
      {
        candidateName: 'Priya Patel',
        email: 'priya.patel@student.ac.in',
        phone: '+91 98234 56789',
        originalFilename: 'Priya_Patel_SWE_CV.docx',
        fileType: 'DOCX',
        fileSizeBytes: 65400,
        contentHash: 'hash-priya-patel-2026',
        rawText: `PRIYA PATEL\nEmail: priya.patel@student.ac.in | Phone: +91 98234 56789\nEducation: B.Tech Computer Science and Engineering, Apex Institute\nSkills: Java, Spring Boot, HTML, React, JavaScript, Git, JUnit\nProjects: Developed cloud inventory web application utilizing Spring Boot and React with HTML and Tailwind CSS UI.`,
        extractionStatus: 'SUCCESS',
        extractionWarnings: [],
        extractedEducation: ['B.Tech Computer Science and Engineering, Apex Institute'],
        extractedExperience: ['Developed cloud inventory web application utilizing Spring Boot and React'],
        identifiedSkills: ['Java', 'Spring Boot', 'HTML', 'React', 'JavaScript', 'Git', 'JUnit'],
      },
      {
        candidateName: 'Marcus Chen',
        email: 'marcus.chen@techuniv.edu',
        phone: '(555) 234-5678',
        originalFilename: 'Marcus_Chen_Resume.pdf',
        fileType: 'PDF',
        fileSizeBytes: 72100,
        contentHash: 'hash-marcus-chen-2026',
        rawText: `MARCUS CHEN\nEmail: marcus.chen@techuniv.edu | Phone: (555) 234-5678\nEducation: Bachelor of Science in Information Technology\nCompetencies: Java, SQL, HTML, Python, Git, Linux, Data Structures and Algorithms\nExperience: Teaching Assistant for CS101. Created relational schema in SQL and frontend dashboards in HTML for university portal.`,
        extractionStatus: 'SUCCESS',
        extractionWarnings: [],
        extractedEducation: ['Bachelor of Science in Information Technology'],
        extractedExperience: ['Teaching Assistant: CS101 data structures and SQL database design'],
        identifiedSkills: ['Java', 'SQL', 'HTML', 'Python', 'Git', 'Linux', 'Data Structures and Algorithms'],
      },
      {
        candidateName: 'Sneha Kulkarni',
        email: 'sneha.k@datasci.org',
        phone: '+91 91234 87654',
        originalFilename: 'Sneha_Kulkarni_Profile.pdf',
        fileType: 'PDF',
        fileSizeBytes: 58900,
        contentHash: 'hash-sneha-kulkarni-2026',
        rawText: `SNEHA KULKARNI\nEmail: sneha.k@datasci.org | Phone: +91 91234 87654\nEducation: B.Sc. Statistics and Data Analytics\nCore Competencies: Java, SQL, Python, NumPy, Pandas, Machine Learning\nProjects: Built predictive statistical models using Python and extracted transaction datasets using complex SQL queries.`,
        extractionStatus: 'SUCCESS',
        extractionWarnings: [],
        extractedEducation: ['B.Sc. Statistics and Data Analytics'],
        extractedExperience: ['Data analytics project: extracted transaction datasets using SQL'],
        identifiedSkills: ['Java', 'SQL', 'Python', 'NumPy', 'Pandas', 'Machine Learning'],
      },
      {
        candidateName: 'David Miller',
        email: 'dmiller@devmail.io',
        phone: '(555) 890-1234',
        originalFilename: 'David_Miller_Frontend_Resume.docx',
        fileType: 'DOCX',
        fileSizeBytes: 49800,
        contentHash: 'hash-david-miller-2026',
        rawText: `DAVID MILLER\nEmail: dmiller@devmail.io | Phone: (555) 890-1234\nEducation: Associate Degree in Web Development\nSkills: HTML, CSS, JavaScript, React, TypeScript, Git\nExperience: Junior Frontend Developer. Crafted accessible web interfaces and components using React and HTML5.`,
        extractionStatus: 'SUCCESS',
        extractionWarnings: [],
        extractedEducation: ['Associate Degree in Web Development'],
        extractedExperience: ['Junior Frontend Developer: crafted accessible interfaces using React and HTML5'],
        identifiedSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Git'],
      },
      {
        candidateName: 'Elena Rostova',
        email: 'elena.rostova@engineer.net',
        phone: '+1 415 555 9812',
        originalFilename: 'Elena_Rostova_Scanned_Resume.jpg',
        fileType: 'IMAGE',
        fileSizeBytes: 142000,
        contentHash: 'hash-elena-rostova-2026',
        rawText: `ELENA ROSTOVA\nEmail: elena.rostova@engineer.net | Phone: +1 415 555 9812\nEducation: Bachelor of Computer Engineering\nTechnical Skills: Java, SQL, Hibernate, MySQL, Linux, Git\nWork History: Junior Software Developer at SysTech. Wrote Java backend services and designed MySQL database tables.`,
        extractionStatus: 'NEEDS_REVIEW',
        extractionWarnings: [
          'Photograph/Scanned resume processed via Tesseract OCR engine.',
          'OCR scanned document: Minor character variance may be present.',
        ],
        extractedEducation: ['Bachelor of Computer Engineering'],
        extractedExperience: ['Junior Software Developer: Wrote Java backend services and designed MySQL tables'],
        identifiedSkills: ['Java', 'SQL', 'Hibernate', 'MySQL', 'Linux', 'Git'],
      },
    ];

    const processedCandidates: CandidateResume[] = rawCandidates.map((c, idx) => {
      const candId = `cand-seed-${idx + 1}`;
      const match = skillMatchingService.calculateMatch(candId, c.identifiedSkills, demoJob);
      return {
        ...c,
        id: candId,
        screeningSessionId: screeningId,
        matchResult: match,
        createdAt: new Date(now.getTime() - 3600000 * (6 - idx)).toISOString(),
      };
    });

    // Rank candidates using competition ranking
    const rankedCandidates = skillMatchingService.rankCandidates(processedCandidates);

    const demoScreening: ScreeningSession = {
      id: screeningId,
      jobProfileId: demoJob.id,
      jobProfile: demoJob,
      status: 'COMPLETED',
      totalUploadedFiles: rankedCandidates.length,
      successfullyProcessedFiles: rankedCandidates.filter(c => c.extractionStatus !== 'FAILED').length,
      failedFiles: rankedCandidates.filter(c => c.extractionStatus === 'FAILED').length,
      candidates: rankedCandidates,
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      completedAt: new Date(now.getTime() - 86400000 + 120000).toISOString(),
    };

    this.screenings.set(demoScreening.id, demoScreening);
    this.save();
  }
}

export const db = new DatabaseStore();
