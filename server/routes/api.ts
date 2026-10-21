import { Request, Response, Router } from 'express';
import multer from 'multer';
import { db } from '../db.js';
import { documentExtractionService } from '../services/extractionService.js';
import { SKILL_DICTIONARY, skillMatchingService } from '../services/matchingService.js';
import { CandidateResume, FileType, JobProfile } from '../types.js';

export const apiRouter = Router();

// Configure safe in-memory file upload with 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20, // Max 20 files per batch
  },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.webp', '.txt'];
    const lowerName = file.originalname.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => lowerName.endsWith(ext));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file format. Please upload PDF, DOCX, JPG, or PNG files.`));
    }
  },
});

// ==========================================
// DASHBOARD STATS
// ==========================================
apiRouter.get('/dashboard/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics', message: err.message });
  }
});

// ==========================================
// SKILL DICTIONARY
// ==========================================
apiRouter.get('/skills/dictionary', (_req: Request, res: Response) => {
  res.json({
    totalSkills: SKILL_DICTIONARY.length,
    skills: SKILL_DICTIONARY,
  });
});

// ==========================================
// JOB PROFILES (CRUD)
// ==========================================
apiRouter.get('/jobs', (_req: Request, res: Response) => {
  try {
    const jobs = db.getJobs();
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch job profiles', message: err.message });
  }
});

apiRouter.get('/jobs/:id', (req: Request, res: Response) => {
  const job = db.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job profile not found' });
  }
  res.json(job);
});

apiRouter.post('/jobs', (req: Request, res: Response) => {
  try {
    const { title, companyName, jobDescription, requiredSkills, eligibilityThreshold, notes } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Job title is required and cannot be blank.' });
    }

    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ error: 'At least one required skill must be specified.' });
    }

    // Clean and deduplicate skills
    const cleanedSkills = Array.from(
      new Set(
        requiredSkills
          .map(s => String(s).trim())
          .filter(s => s.length > 0)
      )
    );

    if (cleanedSkills.length === 0) {
      return res.status(400).json({ error: 'Required skills cannot be empty or solely whitespace.' });
    }

    const thresholdNum = Number(eligibilityThreshold);
    if (isNaN(thresholdNum) || thresholdNum < 1 || thresholdNum > 100) {
      return res.status(400).json({ error: 'Eligibility threshold must be a number between 1% and 100%.' });
    }

    const newJob = db.createJob({
      title: title.trim(),
      companyName: companyName ? String(companyName).trim() : undefined,
      jobDescription: jobDescription ? String(jobDescription).trim() : '',
      requiredSkills: cleanedSkills,
      eligibilityThreshold: thresholdNum,
      notes: notes ? String(notes).trim() : undefined,
    });

    res.status(201).json(newJob);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create job profile', message: err.message });
  }
});

apiRouter.put('/jobs/:id', (req: Request, res: Response) => {
  try {
    const { title, companyName, jobDescription, requiredSkills, eligibilityThreshold, notes } = req.body;
    const existing = db.getJob(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Job profile not found.' });
    }

    const updates: Partial<JobProfile> = {};
    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Job title cannot be blank.' });
      }
      updates.title = title.trim();
    }

    if (companyName !== undefined) {
      updates.companyName = String(companyName).trim();
    }

    if (jobDescription !== undefined) {
      updates.jobDescription = String(jobDescription).trim();
    }

    if (requiredSkills !== undefined) {
      if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
        return res.status(400).json({ error: 'At least one required skill must be specified.' });
      }
      updates.requiredSkills = Array.from(new Set(requiredSkills.map(s => String(s).trim()).filter(Boolean)));
    }

    if (eligibilityThreshold !== undefined) {
      const num = Number(eligibilityThreshold);
      if (isNaN(num) || num < 1 || num > 100) {
        return res.status(400).json({ error: 'Threshold must be between 1% and 100%.' });
      }
      updates.eligibilityThreshold = num;
    }

    if (notes !== undefined) {
      updates.notes = String(notes).trim();
    }

    const updated = db.updateJob(req.params.id, updates);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update job profile', message: err.message });
  }
});

apiRouter.delete('/jobs/:id', (req: Request, res: Response) => {
  const success = db.deleteJob(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Job profile not found.' });
  }
  res.json({ message: 'Job profile successfully deleted.', id: req.params.id });
});

// ==========================================
// SCREENING SESSIONS
// ==========================================
apiRouter.get('/screenings', (_req: Request, res: Response) => {
  try {
    const list = db.getScreenings();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve screening sessions', message: err.message });
  }
});

apiRouter.post('/screenings', (req: Request, res: Response) => {
  try {
    const { jobProfileId } = req.body;
    if (!jobProfileId) {
      return res.status(400).json({ error: 'jobProfileId is required to start a screening session.' });
    }

    const screening = db.createScreening(jobProfileId);
    res.status(201).json(screening);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to initialize screening session' });
  }
});

apiRouter.get('/screenings/:id', (req: Request, res: Response) => {
  const screening = db.getScreening(req.params.id);
  if (!screening) {
    return res.status(404).json({ error: 'Screening session not found.' });
  }
  res.json(screening);
});

apiRouter.delete('/screenings/:id', (req: Request, res: Response) => {
  const success = db.deleteScreening(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Screening session not found.' });
  }
  res.json({ message: 'Screening session deleted successfully.', id: req.params.id });
});

// Upload batch of resumes to screening session
apiRouter.post(
  '/screenings/:id/resumes',
  upload.array('resumes', 20),
  async (req: Request, res: Response) => {
    try {
      const screeningId = req.params.id;
      const screening = db.getScreening(screeningId);
      if (!screening) {
        return res.status(404).json({ error: 'Screening session not found.' });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No resume files were uploaded.' });
      }

      const newCandidates: CandidateResume[] = [];
      let successCount = 0;
      let failCount = 0;

      for (const file of files) {
        try {
          const candidate = await documentExtractionService.extractResume(
            file.buffer,
            file.originalname,
            screeningId,
            file.mimetype
          );

          // Store buffer in-memory for preview/download
          db.storeFileBuffer(candidate.id, file.originalname, file.mimetype, file.buffer);

          newCandidates.push(candidate);
          if (candidate.extractionStatus === 'FAILED') {
            failCount++;
          } else {
            successCount++;
          }
        } catch (err: any) {
          failCount++;
          console.error(`Failed to process resume ${file.originalname}:`, err);
        }
      }

      // Append to screening session candidates
      const updatedCandidates = [...screening.candidates, ...newCandidates];
      screening.candidates = updatedCandidates;
      screening.totalUploadedFiles = updatedCandidates.length;
      screening.successfullyProcessedFiles += successCount;
      screening.failedFiles += failCount;
      screening.status = 'UPLOADED';

      db.updateScreening(screeningId, screening);

      res.status(200).json({
        message: `Successfully uploaded and extracted ${successCount} file(s).`,
        uploadedCount: files.length,
        totalInSession: updatedCandidates.length,
        candidates: newCandidates,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'File upload processing failed', message: err.message });
    }
  }
);

// Upload camera captured photo resume (Base64)
apiRouter.post('/screenings/:id/camera-resume', async (req: Request, res: Response) => {
  try {
    const screeningId = req.params.id;
    const screening = db.getScreening(screeningId);
    if (!screening) {
      return res.status(404).json({ error: 'Screening session not found.' });
    }

    const { imageBase64, filename } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 string is required.' });
    }

    // Strip data prefix if present (e.g. data:image/jpeg;base64,)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const safeFilename = filename || `Camera_Capture_${Date.now()}.jpg`;

    const candidate = await documentExtractionService.extractResume(
      buffer,
      safeFilename,
      screeningId,
      'image/jpeg',
      'CAMERA'
    );

    db.storeFileBuffer(candidate.id, safeFilename, 'image/jpeg', buffer);

    screening.candidates.push(candidate);
    screening.totalUploadedFiles++;
    if (candidate.extractionStatus === 'FAILED') {
      screening.failedFiles++;
    } else {
      screening.successfullyProcessedFiles++;
    }
    screening.status = 'UPLOADED';

    db.updateScreening(screeningId, screening);

    res.status(201).json({
      message: 'Camera resume captured and processed successfully.',
      candidate,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Camera upload failed', message: err.message });
  }
});

// Trigger automated matching & ranking
apiRouter.post('/screenings/:id/analyse', (req: Request, res: Response) => {
  try {
    const screeningId = req.params.id;
    const screening = db.getScreening(screeningId);
    if (!screening) {
      return res.status(404).json({ error: 'Screening session not found.' });
    }

    if (screening.candidates.length === 0) {
      return res.status(400).json({ error: 'No resumes have been uploaded for this screening session.' });
    }

    screening.status = 'PROCESSING';
    db.updateScreening(screeningId, screening);

    const jobProfile = screening.jobProfile;

    // Run matching for every candidate
    const evaluatedCandidates = screening.candidates.map(candidate => {
      const match = skillMatchingService.calculateMatch(candidate.id, candidate.identifiedSkills, jobProfile);
      return {
        ...candidate,
        matchResult: match,
      };
    });

    // Rank candidates using competition ranking
    const rankedCandidates = skillMatchingService.rankCandidates(evaluatedCandidates);

    screening.candidates = rankedCandidates;
    screening.status = 'COMPLETED';
    screening.completedAt = new Date().toISOString();
    db.updateScreening(screeningId, screening);

    res.json({
      message: 'Analysis completed successfully. Candidates ranked.',
      screeningId,
      status: 'COMPLETED',
      candidatesCount: rankedCandidates.length,
      candidates: rankedCandidates,
    });
  } catch (err: any) {
    const screeningId = req.params.id;
    db.updateScreening(screeningId, { status: 'FAILED' });
    res.status(500).json({ error: 'Analysis failed', message: err.message });
  }
});

// Get session status
apiRouter.get('/screenings/:id/status', (req: Request, res: Response) => {
  const screening = db.getScreening(req.params.id);
  if (!screening) {
    return res.status(404).json({ error: 'Screening session not found.' });
  }
  res.json({
    id: screening.id,
    status: screening.status,
    totalUploadedFiles: screening.totalUploadedFiles,
    successfullyProcessedFiles: screening.successfullyProcessedFiles,
    failedFiles: screening.failedFiles,
    completedAt: screening.completedAt,
  });
});

// Get ranked candidates for a screening
apiRouter.get('/screenings/:id/candidates', (req: Request, res: Response) => {
  const screening = db.getScreening(req.params.id);
  if (!screening) {
    return res.status(404).json({ error: 'Screening session not found.' });
  }
  res.json(screening.candidates);
});

// Export CSV
apiRouter.get('/screenings/:id/export.csv', (req: Request, res: Response) => {
  const screening = db.getScreening(req.params.id);
  if (!screening) {
    return res.status(404).json({ error: 'Screening session not found.' });
  }

  const job = screening.jobProfile;
  const rows: string[] = [];

  // CSV Header
  rows.push(
    [
      'Rank',
      'Candidate Name',
      'Original Filename',
      'Match Percentage (%)',
      'Suitability Category',
      'Eligibility (>= Threshold)',
      'Matched Skills',
      'Missing Skills',
      'Extra Skills',
      'Email',
      'Phone',
      'Extraction Status',
      'Extraction Warnings',
    ]
      .map(h => `"${h}"`)
      .join(',')
  );

  for (const c of screening.candidates) {
    const mr = c.matchResult;
    const rank = mr ? mr.rank : 'N/A';
    const matchPct = mr ? `${mr.matchingPercentage}%` : 'N/A';
    const cat = mr ? mr.suitabilityCategory.replace('_', ' ') : 'UNPROCESSED';
    const eligible = mr ? (mr.isEligible ? 'YES' : 'NO') : 'N/A';
    const matched = mr ? mr.matchedSkills.join('; ') : '';
    const missing = mr ? mr.missingSkills.join('; ') : '';
    const extra = mr ? mr.extraSkills.join('; ') : '';
    const warnings = c.extractionWarnings.join('; ') || 'None';

    const line = [
      rank,
      c.candidateName,
      c.originalFilename,
      matchPct,
      cat,
      eligible,
      matched,
      missing,
      extra,
      c.email,
      c.phone,
      c.extractionStatus,
      warnings,
    ]
      .map(val => `"${String(val).replace(/"/g, '""')}"`)
      .join(',');

    rows.push(line);
  }

  const csvContent = rows.join('\r\n');
  const safeTitle = job.title.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `SkillMatch_${safeTitle}_Ranking_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvContent);
});

// ==========================================
// CANDIDATES DETAILS & REPORT
// ==========================================
apiRouter.get('/candidates/:id', (req: Request, res: Response) => {
  const candidate = db.getCandidate(req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate resume not found.' });
  }
  res.json(candidate);
});

apiRouter.get('/candidates/:id/report', (req: Request, res: Response) => {
  const candidate = db.getCandidate(req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found.' });
  }
  const screening = db.getScreening(candidate.screeningSessionId);
  res.json({
    candidate,
    screeningSession: screening
      ? {
          id: screening.id,
          jobProfile: screening.jobProfile,
          createdAt: screening.createdAt,
        }
      : null,
  });
});

// View original resume text or download
apiRouter.get('/candidates/:id/resume', (req: Request, res: Response) => {
  const candidate = db.getCandidate(req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found.' });
  }

  const fileData = db.getFileBuffer(candidate.id);
  if (fileData) {
    res.setHeader('Content-Type', fileData.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${fileData.filename}"`);
    return res.send(fileData.buffer);
  }

  // Fallback: return raw text as text/plain
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(candidate.rawText || 'No raw text available for this document.');
});

// Reset / reload demo seed data
apiRouter.post('/demo/reset-seed', (_req: Request, res: Response) => {
  db.seedDefaultData();
  res.json({ message: 'Default demo job profile and candidate cohort reseeded successfully.' });
});
