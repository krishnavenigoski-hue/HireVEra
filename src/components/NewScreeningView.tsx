import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileCheck,
  FileText,
  FileUp,
  Image as ImageIcon,
  Layers,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { api, CandidateResume, JobProfile, ScreeningSession } from '../api.js';
import { CameraCaptureModal } from './CameraCaptureModal.js';

interface NewScreeningViewProps {
  jobs: JobProfile[];
  onScreeningComplete: (session: ScreeningSession) => void;
  onNavigateToJobs: () => void;
}

export const NewScreeningView: React.FC<NewScreeningViewProps> = ({
  jobs,
  onScreeningComplete,
  onNavigateToJobs,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraPhotos, setCameraPhotos] = useState<{ base64: string; filename: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analysisStepText, setAnalysisStepText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      appendFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      appendFiles(Array.from(e.target.files));
    }
  };

  const appendFiles = (newFiles: File[]) => {
    const validExtensions = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.webp', '.txt'];
    const filtered: File[] = [];
    const rejected: string[] = [];

    for (const f of newFiles) {
      const lower = f.name.toLowerCase();
      const isValid = validExtensions.some(ext => lower.endsWith(ext));
      if (isValid) {
        if (f.size > 15 * 1024 * 1024) {
          rejected.push(`${f.name} (exceeds 15MB limit)`);
        } else {
          filtered.push(f);
        }
      } else {
        rejected.push(`${f.name} (unsupported format)`);
      }
    }

    if (rejected.length > 0) {
      setErrorMessage(`Some files were skipped: ${rejected.join(', ')}`);
    } else {
      setErrorMessage(null);
    }

    // Deduplicate against existing staged files by name and size
    setStagedFiles(prev => {
      const combined = [...prev];
      for (const f of filtered) {
        if (!combined.some(existing => existing.name === f.name && existing.size === f.size)) {
          combined.push(f);
        }
      }
      return combined;
    });
  };

  const removeFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeCameraPhoto = (index: number) => {
    setCameraPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = (base64: string, filename: string) => {
    setCameraPhotos(prev => [...prev, { base64, filename }]);
  };

  // Helper: create realistic synthetic sample resumes
  const handleLoadSampleBatch = () => {
    const sampleCandidates = [
      {
        name: 'Aditya_Sharma_Java_Backend_Resume.pdf',
        content: `ADITYA SHARMA\nEmail: aditya.sharma@example.edu | Phone: +91 98765 43210\nEducation: B.Sc. Data Science & Computer Applications, CGPA: 9.1/10\nSkills: Java, Spring Boot, SQL, HTML, Hibernate, Git, REST APIs, Docker, Maven\nExperience: Backend Engineering Intern at FinTech Labs. Built robust REST APIs using Spring Boot and Hibernate. Tuned MySQL queries reducing response times by 35%.`,
      },
      {
        name: 'Priya_Patel_FullStack_Profile.docx',
        content: `PRIYA PATEL\nEmail: priya.patel@student.ac.in | Phone: +91 98234 56789\nEducation: B.Tech Computer Science and Engineering, Apex Institute\nSkills: Java, Spring Boot, HTML, React, JavaScript, Git, JUnit\nProjects: Developed cloud inventory web application utilizing Spring Boot and React with HTML and Tailwind CSS UI.`,
      },
      {
        name: 'Marcus_Chen_Software_Engineer.pdf',
        content: `MARCUS CHEN\nEmail: marcus.chen@techuniv.edu | Phone: (555) 234-5678\nEducation: Bachelor of Science in Information Technology\nCompetencies: Java, SQL, HTML, Python, Git, Linux, Data Structures and Algorithms\nExperience: Teaching Assistant for CS101. Created relational schema in SQL and frontend dashboards in HTML for university portal.`,
      },
      {
        name: 'Sneha_Kulkarni_Data_Systems.pdf',
        content: `SNEHA KULKARNI\nEmail: sneha.k@datasci.org | Phone: +91 91234 87654\nEducation: B.Sc. Statistics and Data Analytics\nCore Competencies: Java, SQL, Python, NumPy, Pandas, Machine Learning\nProjects: Built predictive statistical models using Python and extracted transaction datasets using complex SQL queries.`,
      },
      {
        name: 'David_Miller_Frontend_UI.docx',
        content: `DAVID MILLER\nEmail: dmiller@devmail.io | Phone: (555) 890-1234\nEducation: Associate Degree in Web Development\nSkills: HTML, CSS, JavaScript, React, TypeScript, Git\nExperience: Junior Frontend Developer. Crafted accessible web interfaces and components using React and HTML5.`,
      },
      {
        name: 'Elena_Rostova_Scanned_Candidate.txt',
        content: `ELENA ROSTOVA\nEmail: elena.rostova@engineer.net | Phone: +1 415 555 9812\nEducation: Bachelor of Computer Engineering\nTechnical Skills: Java, SQL, Hibernate, MySQL, Linux, Git\nWork History: Junior Software Developer at SysTech. Wrote Java backend services and designed MySQL database tables.`,
      },
    ];

    const generatedFiles = sampleCandidates.map(sc => {
      const blob = new Blob([sc.content], { type: 'text/plain' });
      return new File([blob], sc.name, { type: 'text/plain' });
    });

    setStagedFiles(prev => [...prev, ...generatedFiles]);
    setErrorMessage(null);
  };

  // Run full screening workflow: Create Session -> Upload Batch -> Trigger Analysis
  const handleStartAnalysis = async () => {
    if (!selectedJob) {
      setErrorMessage('Please select or create a job profile first.');
      return;
    }

    if (stagedFiles.length === 0 && cameraPhotos.length === 0) {
      setErrorMessage('Please upload at least one resume file or capture a photo.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);
      setUploadProgress(15);
      setAnalysisStepText('Initializing screening session in MySQL database...');

      // 1. Create screening session
      const session = await api.createScreening(selectedJob.id);
      setUploadProgress(35);

      // 2. Upload staged files
      if (stagedFiles.length > 0) {
        setAnalysisStepText(`Parsing ${stagedFiles.length} resume document(s) via PDFBox/Mammoth...`);
        await api.uploadResumes(session.id, stagedFiles);
      }
      setUploadProgress(65);

      // 3. Upload camera photos if any
      if (cameraPhotos.length > 0) {
        setAnalysisStepText(`Processing ${cameraPhotos.length} photographed resume(s) through Tesseract OCR...`);
        for (const photo of cameraPhotos) {
          await api.uploadCameraResume(session.id, photo.base64, photo.filename);
        }
      }
      setUploadProgress(80);

      // 4. Trigger automated matching & ranking
      setIsAnalyzing(true);
      setAnalysisStepText('Calculating equal-weight skill scores & assigning competition ranks...');
      const completedSession = await api.triggerAnalysis(session.id);
      setUploadProgress(100);

      // Success callback
      onScreeningComplete(completedSession);
    } catch (err: any) {
      console.error('Screening execution error:', err);
      setErrorMessage(err.message || 'Screening analysis encountered an error');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const totalStaged = stagedFiles.length + cameraPhotos.length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between border-b border-[#293149] pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#F8FAFC]">New Screening Session</h2>
          <p className="text-xs text-[#A7B0C0] mt-0.5">
            Automated resume parsing, OCR text extraction, and candidate ranking
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/30">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Automated 1-Click Workflow</span>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-[#F87171] flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Select Job Profile */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">Select Target Job Profile</h3>
              <p className="text-xs text-[#A7B0C0]">
                Matching engine compares extracted candidate skills against this profile
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToJobs}
            className="flex items-center space-x-1.5 text-xs font-semibold text-[#8B5CF6] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Role</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A7B0C0] mb-2">
              Select Role
            </label>
            <select
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              className="w-full rounded-xl border border-[#293149] bg-[#0D1326] px-3.5 py-2.5 text-xs font-semibold text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none transition-colors"
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} {job.companyName ? `(${job.companyName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedJob && (
            <div className="md:col-span-2 rounded-xl border border-[#293149] bg-[#0D1326] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F8FAFC]">
                    {selectedJob.title}
                  </span>
                  <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/15 px-2.5 py-0.5 rounded-full border border-[#22C55E]/30">
                    Threshold: ≥ {selectedJob.eligibilityThreshold}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="text-[11px] text-[#A7B0C0] mr-1">Required:</span>
                  {selectedJob.requiredSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 px-2 py-0.5 text-[11px] font-semibold text-[#C4B5FD]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-[#A7B0C0] mt-2 line-clamp-1 italic">
                {selectedJob.notes || selectedJob.jobDescription}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Resume Upload Zone */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">Upload Resumes in Mixed Formats</h3>
              <p className="text-xs text-[#A7B0C0]">
                Supports Digital PDFs, Scanned PDFs, Word (.docx), Images (.jpg, .png), and Camera capture
              </p>
            </div>
          </div>

          <button
            onClick={handleLoadSampleBatch}
            className="flex items-center space-x-1.5 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 px-3.5 py-1.5 text-xs font-bold text-[#C4B5FD] hover:bg-[#8B5CF6]/20 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
            <span>Load Sample Batch (6 Resumes)</span>
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 scale-[1.01]'
              : 'border-[#293149] bg-[#0D1326] hover:border-[#3B4568]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/15 text-[#8B5CF6] mb-4 shadow-inner">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h4 className="text-sm font-bold text-[#F8FAFC]">
            Drag and drop resumes here, or choose an upload method
          </h4>
          <p className="text-xs text-[#A7B0C0] mt-1 max-w-md mx-auto">
            Batch process multiple resumes simultaneously. Mixed formats supported in a single session.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#8B5CF6]/25 hover:brightness-110 transition-all cursor-pointer"
            >
              <FileUp className="h-4 w-4" />
              <span>Browse Documents (PDF / Word)</span>
            </button>

            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center space-x-2 rounded-xl border border-[#293149] bg-[#171D33] px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] hover:bg-[#1E2540] transition-colors cursor-pointer"
            >
              <ImageIcon className="h-4 w-4 text-[#8B5CF6]" />
              <span>Upload Scanned Image</span>
            </button>

            <button
              onClick={() => setIsCameraOpen(true)}
              className="flex items-center space-x-2 rounded-xl border border-[#293149] bg-[#171D33] px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] hover:bg-[#1E2540] transition-colors cursor-pointer"
            >
              <Camera className="h-4 w-4 text-[#8B5CF6]" />
              <span>Take Photo / Camera</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center space-x-4 text-[11px] text-[#A7B0C0]">
            <span>✓ Max file size: 15MB</span>
            <span>•</span>
            <span>✓ Multi-format batch</span>
            <span>•</span>
            <span>✓ Client-to-server safe hashing</span>
          </div>
        </div>

        {/* Selected Files Staging List */}
        {totalStaged > 0 && (
          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F8FAFC]">
                Ready for Extraction ({totalStaged} document{totalStaged > 1 ? 's' : ''})
              </span>
              <button
                onClick={() => {
                  setStagedFiles([]);
                  setCameraPhotos([]);
                }}
                className="text-[11px] text-[#F87171] hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {stagedFiles.map((file, idx) => {
                const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                const sizeKb = Math.round(file.size / 1024);

                return (
                  <div
                    key={`file-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-[#293149] bg-[#0D1326] p-3 text-xs"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171D33] text-[#8B5CF6] font-mono text-[10px] font-bold shrink-0 border border-[#293149]">
                        {ext}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-[#F8FAFC] truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-[#A7B0C0] font-mono">{sizeKb} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="rounded-lg p-1 text-[#A7B0C0] hover:bg-red-500/10 hover:text-[#F87171] transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}

              {cameraPhotos.map((photo, idx) => (
                <div
                  key={`photo-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-[#293149] bg-[#0D1326] p-3 text-xs"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-[#293149] bg-black">
                      <img
                        src={photo.base64}
                        alt="Camera Snapshot"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-[#F8FAFC] truncate">
                        {photo.filename}
                      </p>
                      <p className="text-[10px] text-[#22C55E]">Camera Snapshot (OCR Ready)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeCameraPhoto(idx)}
                    className="rounded-lg p-1 text-[#A7B0C0] hover:bg-red-500/10 hover:text-[#F87171] transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress & Automated Analysis Action */}
      {(isUploading || isAnalyzing) && (
        <div className="rounded-2xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 p-6 space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#C4B5FD] flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#8B5CF6]" />
              <span>{analysisStepText}</span>
            </span>
            <span className="font-mono font-bold text-[#8B5CF6]">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#0D1326] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-[#A7B0C0]">
            Running Apache PDFBox, Apache POI, and Tesseract OCR pipeline. Do not close this window.
          </p>
        </div>
      )}

      {/* Start Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-[#A7B0C0]">
          Total Resumes in Staging:{' '}
          <strong className="text-[#F8FAFC]">{totalStaged}</strong>
        </div>
        <button
          disabled={totalStaged === 0 || isUploading || isAnalyzing}
          onClick={handleStartAnalysis}
          className="flex items-center space-x-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#8B5CF6]/30 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isUploading || isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing Resumes...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>Analyse Resumes Automatically</span>
            </>
          )}
        </button>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
