import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  Mail,
  Phone,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { CandidateResume, JobProfile } from '../api.js';

interface CandidateReportModalProps {
  candidate: CandidateResume | null;
  jobProfile?: JobProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateReportModal: React.FC<CandidateReportModalProps> = ({
  candidate,
  jobProfile,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rawText'>('overview');

  if (!isOpen || !candidate) return null;

  const match = candidate.matchResult;
  const matchPct = match ? match.matchingPercentage : 0;
  const isBest = match?.suitabilityCategory === 'BEST_SUITABLE';
  const isMedium = match?.suitabilityCategory === 'MEDIUM_SUITABLE';
  const isLow = match?.suitabilityCategory === 'LOW_SUITABLE';

  const categoryBadgeColor = isBest
    ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
    : isMedium
    ? 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30'
    : 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30';

  const categoryLabel = isBest
    ? 'BEST SUITABLE'
    : isMedium
    ? 'MEDIUM SUITABLE'
    : 'LOW SUITABLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl border border-[#293149] bg-[#171D33] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#293149] bg-[#0D1326] px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#6366F1] text-white font-bold text-lg shadow-md">
              {match ? `#${match.rank}` : '•'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-[#F8FAFC]">{candidate.candidateName}</h3>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${categoryBadgeColor}`}>
                  {categoryLabel}
                </span>
                <span className="rounded bg-[#1E2540] px-2 py-0.5 text-[10px] font-mono text-[#A7B0C0] border border-[#293149]">
                  {candidate.fileType}
                </span>
              </div>
              <p className="text-xs text-[#A7B0C0] flex items-center space-x-3 mt-1">
                <span>File: {candidate.originalFilename}</span>
                <span>•</span>
                <span>Screening ID: {candidate.screeningSessionId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#A7B0C0] hover:bg-[#1E2540] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#293149] bg-[#141A2E] px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'border-[#8B5CF6] text-[#8B5CF6]'
                : 'border-transparent text-[#A7B0C0] hover:text-[#F8FAFC]'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>Match Evaluation & Highlights</span>
          </button>
          <button
            onClick={() => setActiveTab('rawText')}
            className={`flex items-center space-x-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
              activeTab === 'rawText'
                ? 'border-[#8B5CF6] text-[#8B5CF6]'
                : 'border-transparent text-[#A7B0C0] hover:text-[#F8FAFC]'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Extracted Document Text & Audit</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' ? (
            <>
              {/* Warnings Banner if any */}
              {candidate.extractionWarnings && candidate.extractionWarnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-[#FBBF24] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24]">
                        Extraction & Audit Warnings
                      </h4>
                      <ul className="mt-1 list-disc list-inside text-xs text-[#FBBF24]/90 space-y-0.5">
                        {candidate.extractionWarnings.map((warn, i) => (
                          <li key={i}>{warn}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Score & Suitability Metric Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Visual Gauge */}
                <div className="rounded-xl border border-[#293149] bg-[#0D1326] p-5 flex flex-col items-center justify-center text-center">
                  <span className="text-xs uppercase tracking-wider text-[#A7B0C0] font-semibold mb-2">
                    Suitability Score
                  </span>
                  <div className="relative flex items-center justify-center my-2">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="#293149"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke={isBest ? '#22C55E' : isMedium ? '#FBBF24' : '#F87171'}
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - matchPct / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-[#F8FAFC]">
                        {matchPct}%
                      </span>
                      <span className="text-[10px] text-[#A7B0C0]">
                        Rank #{match?.rank || 1}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-[#A7B0C0] mt-1">
                    Threshold: {jobProfile?.eligibilityThreshold || 75}%
                  </span>
                </div>

                {/* Candidate Contact & Profile Card */}
                <div className="rounded-xl border border-[#293149] bg-[#0D1326] p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#A7B0C0] font-semibold">
                      Candidate Contacts
                    </span>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center space-x-2 text-[#F8FAFC]">
                        <Mail className="h-4 w-4 text-[#8B5CF6]" />
                        <span className="font-mono truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[#F8FAFC]">
                        <Phone className="h-4 w-4 text-[#8B5CF6]" />
                        <span className="font-mono">{candidate.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[#A7B0C0]">
                        <Clock className="h-4 w-4 text-[#8B5CF6]" />
                        <span>Parsed: {new Date(candidate.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#293149]/60 flex items-center justify-between text-[11px] text-[#A7B0C0]">
                    <span>Extraction status:</span>
                    <span className={`font-semibold ${candidate.extractionStatus === 'SUCCESS' ? 'text-[#22C55E]' : 'text-[#FBBF24]'}`}>
                      {candidate.extractionStatus}
                    </span>
                  </div>
                </div>

                {/* Recommendation Summary */}
                <div className="rounded-xl border border-[#293149] bg-[#0D1326] p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#A7B0C0] font-semibold flex items-center space-x-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
                      <span>Recommendation Decision</span>
                    </span>
                    <p className="mt-3 text-xs leading-relaxed text-[#F8FAFC]">
                      {match?.recommendationExplanation}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#293149]/60">
                    <span className="text-[11px] text-[#A7B0C0]">
                      Status:{' '}
                      <strong className={match?.isEligible ? 'text-[#22C55E]' : 'text-[#F87171]'}>
                        {match?.isEligible ? 'Stage 2 Technical Review Shortlisted' : 'Archived / Not Shortlisted'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills Analysis Breakdown Grid */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#F8FAFC] flex items-center space-x-2">
                  <Award className="h-4 w-4 text-[#8B5CF6]" />
                  <span>Transparent Skill Breakdown</span>
                </h4>

                {/* Matched Skills */}
                <div className="rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#22C55E] flex items-center space-x-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Matched Required Skills ({match?.matchedSkills.length || 0})</span>
                    </span>
                    <span className="text-[11px] text-[#22C55E]/80">Contributed to matching score</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {match && match.matchedSkills.length > 0 ? (
                      match.matchedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1 rounded-lg border border-[#22C55E]/40 bg-[#22C55E]/15 px-3 py-1 text-xs font-semibold text-[#22C55E]"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{s}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#A7B0C0] italic">No required skills matched.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="rounded-xl border border-[#F87171]/20 bg-[#F87171]/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#F87171] flex items-center space-x-1.5">
                      <XCircle className="h-4 w-4" />
                      <span>Missing Required Skills ({match?.missingSkills.length || 0})</span>
                    </span>
                    <span className="text-[11px] text-[#F87171]/80">Required by job profile</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {match && match.missingSkills.length > 0 ? (
                      match.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1 rounded-lg border border-[#F87171]/40 bg-[#F87171]/15 px-3 py-1 text-xs font-semibold text-[#F87171]"
                        >
                          <XCircle className="h-3 w-3" />
                          <span>{s}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#22C55E] font-medium">None! 100% required skills present.</span>
                    )}
                  </div>
                </div>

                {/* Additional / Extra Skills */}
                <div className="rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#8B5CF6] flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>Additional Candidate Skills ({match?.extraSkills.length || 0})</span>
                    </span>
                    <span className="text-[11px] text-[#A7B0C0]">
                      Identified in resume (equal-weight formula prevents score inflation)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {match && match.extraSkills.length > 0 ? (
                      match.extraSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-lg border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 px-3 py-1 text-xs font-medium text-[#C4B5FD]"
                        >
                          + {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#A7B0C0] italic">No extra skills detected.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Extracted Education & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#293149] bg-[#0D1326] p-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#A7B0C0] flex items-center space-x-2 mb-2">
                    <BookOpen className="h-4 w-4 text-[#8B5CF6]" />
                    <span>Extracted Education Highlights</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#F8FAFC]">
                    {candidate.extractedEducation && candidate.extractedEducation.length > 0 ? (
                      candidate.extractedEducation.map((edu, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-[#8B5CF6] font-bold mt-0.5">•</span>
                          <span>{edu}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[#A7B0C0] italic">No specific degree line matched.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#293149] bg-[#0D1326] p-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#A7B0C0] flex items-center space-x-2 mb-2">
                    <Briefcase className="h-4 w-4 text-[#8B5CF6]" />
                    <span>Extracted Experience Highlights</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-[#F8FAFC]">
                    {candidate.extractedExperience && candidate.extractedExperience.length > 0 ? (
                      candidate.extractedExperience.map((exp, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-[#8B5CF6] font-bold mt-0.5">•</span>
                          <span>{exp}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[#A7B0C0] italic">No work experience lines parsed.</li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            /* Raw Extracted Text Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">Parsed Document Content</h4>
                  <p className="text-xs text-[#A7B0C0]">
                    Cleaned text layer produced by document extractor / OCR engine
                  </p>
                </div>
                <a
                  href={`/api/candidates/${candidate.id}/resume`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 rounded-lg border border-[#293149] bg-[#1E2540] px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:bg-[#293149] transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Open Full Raw Document</span>
                </a>
              </div>
              <div className="rounded-xl border border-[#293149] bg-[#0B1020] p-4 font-mono text-xs leading-relaxed text-[#A7B0C0] max-h-96 overflow-y-auto whitespace-pre-wrap select-text">
                {candidate.rawText || 'No text extracted.'}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#293149] bg-[#0D1326] px-6 py-4">
          <div className="text-xs text-[#A7B0C0]">
            Candidate ID: <span className="font-mono">{candidate.id}</span>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={`/api/candidates/${candidate.id}/resume`}
              download={candidate.originalFilename}
              className="inline-flex items-center space-x-2 rounded-xl border border-[#293149] bg-[#1E2540] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:bg-[#293149] transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Original Resume</span>
            </a>
            <button
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#8B5CF6]/25 hover:brightness-110 transition-all"
            >
              Back to Rankings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
