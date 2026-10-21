import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  FolderGit2,
  HelpCircle,
  Layers,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import React from 'react';
import { CandidateResume, DashboardStats, ScreeningSession } from '../api.js';

interface DashboardViewProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  onStartNewScreening: () => void;
  onSelectCandidate: (candidate: CandidateResume) => void;
  onOpenSession: (session: ScreeningSession) => void;
  onNavigateToCode: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  isLoading,
  onStartNewScreening,
  onSelectCandidate,
  onOpenSession,
  onNavigateToCode,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-[#171D33] border border-[#293149]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-xl bg-[#171D33] border border-[#293149]" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-[#171D33] border border-[#293149]" />
      </div>
    );
  }

  const totalCandidates = stats.totalCandidatesAnalysed;
  const bestCount = stats.bestSuitableCandidates;
  const mediumCount = stats.mediumSuitableCandidates;
  const lowCount = stats.lowSuitableCandidates;

  const bestPct = totalCandidates > 0 ? Math.round((bestCount / totalCandidates) * 100) : 0;
  const mediumPct = totalCandidates > 0 ? Math.round((mediumCount / totalCandidates) * 100) : 0;
  const lowPct = totalCandidates > 0 ? Math.round((lowCount / totalCandidates) * 100) : 0;

  const latestSession = stats.recentSessions[0];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Hero Welcome / Fast Action Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#293149] bg-gradient-to-r from-[#171D33] via-[#141A2E] to-[#1E1735] p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/15 px-3 py-1 text-xs font-semibold text-[#C4B5FD]">
              <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>Automated Screening & Candidate Ranking</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Screen Resumes & Rank Talent in Seconds
            </h1>
            <p className="text-xs md:text-sm text-[#A7B0C0] leading-relaxed">
              Upload batches of PDFs, Word files, or photographed resumes. SkillMatch AI extracts candidate credentials, computes transparent equal-weight skill matches, and groups candidates into Best, Medium, and Low suitability.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onStartNewScreening}
              className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#8B5CF6]/25 hover:brightness-110 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Start New Screening</span>
            </button>
            <button
              onClick={onNavigateToCode}
              className="flex items-center justify-center space-x-2 rounded-xl border border-[#293149] bg-[#171D33] px-4 py-3.5 text-xs font-semibold text-[#A7B0C0] hover:text-[#F8FAFC] hover:bg-[#1E2540] transition-colors"
            >
              <FolderGit2 className="h-4 w-4 text-[#8B5CF6]" />
              <span>Java Spring Boot Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Total Processed */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#293149] bg-[#171D33] p-4 transition-all hover:border-[#3B4568]">
          <div className="flex items-center justify-between text-[#A7B0C0]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Resumes</span>
            <FileText className="h-4 w-4 text-[#8B5CF6]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#F8FAFC]">{stats.totalResumesProcessed}</span>
            <span className="text-[10px] text-[#A7B0C0]">files</span>
          </div>
        </div>

        {/* Total Analysed */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#293149] bg-[#171D33] p-4 transition-all hover:border-[#3B4568]">
          <div className="flex items-center justify-between text-[#A7B0C0]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Candidates</span>
            <Users className="h-4 w-4 text-[#6366F1]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#F8FAFC]">{stats.totalCandidatesAnalysed}</span>
            <span className="text-[10px] text-[#A7B0C0]">parsed</span>
          </div>
        </div>

        {/* Best Suitable (Green) */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-4 transition-all hover:border-[#22C55E]/50">
          <div className="flex items-center justify-between text-[#22C55E]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Best Suitable</span>
            <Award className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#22C55E]">{stats.bestSuitableCandidates}</span>
            <span className="text-[10px] text-[#22C55E]/80">≥ 75% match</span>
          </div>
        </div>

        {/* Medium Suitable (Amber) */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/5 p-4 transition-all hover:border-[#FBBF24]/50">
          <div className="flex items-center justify-between text-[#FBBF24]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Medium Match</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#FBBF24]">{stats.mediumSuitableCandidates}</span>
            <span className="text-[10px] text-[#FBBF24]/80">50-74%</span>
          </div>
        </div>

        {/* Low Suitable (Coral) */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#F87171]/30 bg-[#F87171]/5 p-4 transition-all hover:border-[#F87171]/50">
          <div className="flex items-center justify-between text-[#F87171]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Match</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#F87171]">{stats.lowSuitableCandidates}</span>
            <span className="text-[10px] text-[#F87171]/80">&lt; 50%</span>
          </div>
        </div>

        {/* Review Needed */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 transition-all hover:border-amber-500/50">
          <div className="flex items-center justify-between text-[#FBBF24]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Audit Needed</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#FBBF24]">{stats.reviewNeededResumes}</span>
            <span className="text-[10px] text-[#A7B0C0]">OCR / flags</span>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#293149] bg-[#171D33] p-4 transition-all hover:border-[#3B4568]">
          <div className="flex items-center justify-between text-[#A7B0C0]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sessions</span>
            <Layers className="h-4 w-4 text-[#8B5CF6]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#F8FAFC]">{stats.totalScreeningSessions}</span>
            <span className="text-[10px] text-[#A7B0C0]">batches</span>
          </div>
        </div>
      </div>

      {/* Grid: Suitability Distribution Chart & Latest Job Screening Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suitability Distribution Visualization */}
        <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center space-x-2">
              <Award className="h-4 w-4 text-[#8B5CF6]" />
              <span>Suitability Distribution</span>
            </h3>
            <span className="text-xs text-[#A7B0C0] font-mono">{totalCandidates} total</span>
          </div>

          {totalCandidates === 0 ? (
            <div className="py-12 text-center text-xs text-[#A7B0C0]">
              No candidates processed yet. Upload resumes to visualize distribution.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Stacked Visual Bar */}
              <div className="h-4 w-full rounded-full bg-[#0D1326] flex overflow-hidden border border-[#293149]">
                <div
                  style={{ width: `${bestPct}%` }}
                  className="bg-[#22C55E] h-full transition-all duration-500"
                  title={`Best Suitable: ${bestCount} (${bestPct}%)`}
                />
                <div
                  style={{ width: `${mediumPct}%` }}
                  className="bg-[#FBBF24] h-full transition-all duration-500"
                  title={`Medium Suitable: ${mediumCount} (${mediumPct}%)`}
                />
                <div
                  style={{ width: `${lowPct}%` }}
                  className="bg-[#F87171] h-full transition-all duration-500"
                  title={`Low Suitable: ${lowCount} (${lowPct}%)`}
                />
              </div>

              {/* Legend with Counts */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1326] border border-[#22C55E]/20">
                  <div className="flex items-center space-x-2.5">
                    <span className="h-3 w-3 rounded-full bg-[#22C55E]" />
                    <span className="font-semibold text-[#F8FAFC]">Best Suitable (≥ 75%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#22C55E]">{bestCount}</span>
                    <span className="text-[10px] text-[#A7B0C0]">({bestPct}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1326] border border-[#FBBF24]/20">
                  <div className="flex items-center space-x-2.5">
                    <span className="h-3 w-3 rounded-full bg-[#FBBF24]" />
                    <span className="font-semibold text-[#F8FAFC]">Medium Match (50% - 74%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#FBBF24]">{mediumCount}</span>
                    <span className="text-[10px] text-[#A7B0C0]">({mediumPct}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1326] border border-[#F87171]/20">
                  <div className="flex items-center space-x-2.5">
                    <span className="h-3 w-3 rounded-full bg-[#F87171]" />
                    <span className="font-semibold text-[#F8FAFC]">Low Match (&lt; 50%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#F87171]">{lowCount}</span>
                    <span className="text-[10px] text-[#A7B0C0]">({lowPct}%)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141A2E] border border-[#293149] text-[11px] text-[#A7B0C0] leading-relaxed">
                <span className="text-[#8B5CF6] font-semibold">Equal-Weight Scoring:</span> Every unique required skill represents an equal fraction of the total score. Extra candidate skills do not artificially inflate the qualification baseline.
              </div>
            </div>
          )}
        </div>

        {/* Quick Summary of Most Recent Job Screening */}
        <div className="lg:col-span-2 rounded-2xl border border-[#293149] bg-[#171D33] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#293149]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B5CF6]">
                  Active Screening Profile
                </span>
                <h3 className="text-lg font-bold text-[#F8FAFC]">
                  {latestSession ? latestSession.jobProfile.title : 'No active screening profile'}
                </h3>
              </div>
              {latestSession && (
                <button
                  onClick={() => onOpenSession(latestSession)}
                  className="flex items-center space-x-1.5 rounded-lg border border-[#293149] bg-[#1E2540] px-3 py-1.5 text-xs font-semibold text-[#8B5CF6] hover:bg-[#293149] transition-colors"
                >
                  <span>Open Full Session</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {latestSession ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#0D1326] border border-[#293149]">
                    <span className="text-[10px] text-[#A7B0C0] uppercase font-semibold">Company</span>
                    <p className="font-bold text-[#F8FAFC] truncate mt-1">
                      {latestSession.jobProfile.companyName || 'Not specified'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D1326] border border-[#293149]">
                    <span className="text-[10px] text-[#A7B0C0] uppercase font-semibold">Threshold</span>
                    <p className="font-bold text-[#22C55E] mt-1">
                      ≥ {latestSession.jobProfile.eligibilityThreshold}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D1326] border border-[#293149]">
                    <span className="text-[10px] text-[#A7B0C0] uppercase font-semibold">Resumes</span>
                    <p className="font-bold text-[#F8FAFC] mt-1">{latestSession.totalUploadedFiles}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D1326] border border-[#293149]">
                    <span className="text-[10px] text-[#A7B0C0] uppercase font-semibold">Status</span>
                    <p className="font-bold text-[#22C55E] mt-1">{latestSession.status}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#A7B0C0]">Required Competencies:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {latestSession.jobProfile.requiredSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-xs font-semibold text-[#C4B5FD]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#A7B0C0] leading-relaxed line-clamp-2">
                  {latestSession.jobProfile.jobDescription}
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#A7B0C0]">
                No recent screening session available. Start a new screening session to begin evaluating candidates.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#293149] flex items-center justify-between text-xs text-[#A7B0C0]">
            <span className="flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>
                Last screening run:{' '}
                {latestSession ? new Date(latestSession.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </span>
            <span className="font-mono text-[10px]">Database: MySQL 8.0 / JPA Schema In-Sync</span>
          </div>
        </div>
      </div>

      {/* Highest Ranked Candidates Table */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] overflow-hidden">
        <div className="p-6 border-b border-[#293149] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Recently Evaluated Candidates</h3>
            <p className="text-xs text-[#A7B0C0]">
              Candidates sorted by competition rank from current screening cohort
            </p>
          </div>
          {latestSession && (
            <button
              onClick={() => onOpenSession(latestSession)}
              className="text-xs font-semibold text-[#8B5CF6] hover:underline"
            >
              View Full Ranked Table →
            </button>
          )}
        </div>

        {stats.recentCandidates.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A7B0C0]">
            No candidates parsed yet. Click &quot;Start New Screening&quot; to upload resumes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#293149] bg-[#0D1326] text-[#A7B0C0]">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Rank</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Candidate Name</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">File Type</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Score</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Matched Skills</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293149]/60">
                {stats.recentCandidates.map(c => {
                  const mr = c.matchResult;
                  const isBest = mr?.suitabilityCategory === 'BEST_SUITABLE';
                  const isMedium = mr?.suitabilityCategory === 'MEDIUM_SUITABLE';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#1E2540]/60 transition-colors cursor-pointer"
                      onClick={() => onSelectCandidate(c)}
                    >
                      <td className="py-3.5 px-4">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#0D1326] border border-[#293149] font-bold text-[#F8FAFC]">
                          {mr ? `#${mr.rank}` : '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#F8FAFC]">{c.candidateName}</div>
                        <div className="text-[11px] text-[#A7B0C0] font-mono">{c.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-[#0D1326] px-2 py-0.5 text-[10px] font-mono text-[#A7B0C0] border border-[#293149]">
                          {c.fileType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-black text-sm ${
                              isBest ? 'text-[#22C55E]' : isMedium ? 'text-[#FBBF24]' : 'text-[#F87171]'
                            }`}
                          >
                            {mr ? `${mr.matchingPercentage}%` : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${
                            isBest
                              ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                              : isMedium
                              ? 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30'
                              : 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30'
                          }`}
                        >
                          {mr ? mr.suitabilityCategory.replace('_', ' ') : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {mr && mr.matchedSkills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-[#22C55E]/10 border border-[#22C55E]/30 px-1.5 py-0.5 text-[10px] font-semibold text-[#22C55E]"
                            >
                              {s}
                            </span>
                          ))}
                          {mr && mr.matchedSkills.length > 3 && (
                            <span className="text-[10px] text-[#A7B0C0]">
                              +{mr.matchedSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectCandidate(c);
                          }}
                          className="inline-flex items-center space-x-1 rounded-lg border border-[#293149] bg-[#0D1326] px-2.5 py-1 text-xs font-semibold text-[#8B5CF6] hover:bg-[#293149] hover:text-[#F8FAFC] transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
