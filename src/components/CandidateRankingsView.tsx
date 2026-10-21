import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CandidateResume, JobProfile, ScreeningSession } from '../api.js';

interface CandidateRankingsViewProps {
  currentSession: ScreeningSession | null;
  allSessions: ScreeningSession[];
  onSelectCandidate: (candidate: CandidateResume) => void;
  onSelectSession: (sessionId: string) => void;
  onExportCsv: () => void;
}

export const CandidateRankingsView: React.FC<CandidateRankingsViewProps> = ({
  currentSession,
  allSessions,
  onSelectCandidate,
  onSelectSession,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BEST_SUITABLE' | 'MEDIUM_SUITABLE' | 'LOW_SUITABLE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEEDS_REVIEW' | 'SUCCESS'>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'name'>('rank');
  const [onlyShortlist, setOnlyShortlist] = useState(false);

  const candidates = currentSession?.candidates || [];
  const job = currentSession?.jobProfile;

  // Filter & Search Logic
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter(c => {
        // Search
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const nameMatch = c.candidateName.toLowerCase().includes(term);
          const emailMatch = c.email.toLowerCase().includes(term);
          const skillMatch = c.identifiedSkills.some(s => s.toLowerCase().includes(term));
          if (!nameMatch && !emailMatch && !skillMatch) return false;
        }

        // Category
        if (categoryFilter !== 'ALL') {
          if (c.matchResult?.suitabilityCategory !== categoryFilter) return false;
        }

        // Shortlist toggle (Only Best Suitable)
        if (onlyShortlist) {
          if (c.matchResult?.suitabilityCategory !== 'BEST_SUITABLE') return false;
        }

        // Status
        if (statusFilter !== 'ALL') {
          if (c.extractionStatus !== statusFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.candidateName.localeCompare(b.candidateName);
        }
        if (sortBy === 'score') {
          const scoreA = a.matchResult?.matchingPercentage ?? -1;
          const scoreB = b.matchResult?.matchingPercentage ?? -1;
          return scoreB - scoreA;
        }
        // default rank
        const rankA = a.matchResult?.rank ?? 999;
        const rankB = b.matchResult?.rank ?? 999;
        return rankA - rankB;
      });
  }, [candidates, searchTerm, categoryFilter, statusFilter, sortBy, onlyShortlist]);

  // Counts
  const totalCount = candidates.length;
  const bestCount = candidates.filter(c => c.matchResult?.suitabilityCategory === 'BEST_SUITABLE').length;
  const mediumCount = candidates.filter(c => c.matchResult?.suitabilityCategory === 'MEDIUM_SUITABLE').length;
  const lowCount = candidates.filter(c => c.matchResult?.suitabilityCategory === 'LOW_SUITABLE').length;
  const reviewCount = candidates.filter(c => c.extractionStatus === 'NEEDS_REVIEW').length;

  if (!currentSession) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171D33] text-[#A7B0C0] border border-[#293149]">
          <Users className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-[#F8FAFC]">No Active Screening Selected</h3>
        <p className="text-xs text-[#A7B0C0] leading-relaxed">
          Please select a previous screening session or launch a new screening from the menu.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Top Banner / Session Switcher */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] bg-[#8B5CF6]/15 px-2 py-0.5 rounded border border-[#8B5CF6]/30">
              Active Screening Cohort
            </span>
            <span className="text-xs text-[#A7B0C0]">
              Session ID: <strong className="font-mono text-[#F8FAFC]">{currentSession.id}</strong>
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#F8FAFC] mt-1">
            {job?.title} <span className="text-sm font-normal text-[#A7B0C0]">({job?.companyName})</span>
          </h2>
          <p className="text-xs text-[#A7B0C0] mt-0.5">
            Eligibility Threshold: <strong className="text-[#22C55E]">≥ {job?.eligibilityThreshold}%</strong> • Formula: Equal-weight unique required skills
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Session Selector dropdown */}
          {allSessions.length > 1 && (
            <select
              value={currentSession.id}
              onChange={e => onSelectSession(e.target.value)}
              className="rounded-xl border border-[#293149] bg-[#0D1326] px-3 py-2 text-xs font-semibold text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
            >
              {allSessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.jobProfile.title} ({new Date(s.createdAt).toLocaleDateString()}) - {s.candidates.length} cand.
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onExportCsv}
            className="flex items-center space-x-2 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 px-4 py-2 text-xs font-bold text-[#22C55E] hover:bg-[#22C55E]/20 transition-all cursor-pointer shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills & Shortlist Toggle */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => {
            setCategoryFilter('ALL');
            setOnlyShortlist(false);
          }}
          className={`rounded-xl border p-3 text-left transition-all ${
            categoryFilter === 'ALL' && !onlyShortlist
              ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 shadow-sm'
              : 'border-[#293149] bg-[#171D33] hover:border-[#3B4568]'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0] block">All Candidates</span>
          <span className="text-lg font-black text-[#F8FAFC]">{totalCount}</span>
        </button>

        <button
          onClick={() => {
            setCategoryFilter('BEST_SUITABLE');
            setOnlyShortlist(false);
          }}
          className={`rounded-xl border p-3 text-left transition-all ${
            categoryFilter === 'BEST_SUITABLE'
              ? 'border-[#22C55E] bg-[#22C55E]/15 shadow-sm'
              : 'border-[#293149] bg-[#171D33] hover:border-[#22C55E]/40'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#22C55E] block">Best Suitable</span>
          <span className="text-lg font-black text-[#22C55E]">{bestCount}</span>
        </button>

        <button
          onClick={() => {
            setCategoryFilter('MEDIUM_SUITABLE');
            setOnlyShortlist(false);
          }}
          className={`rounded-xl border p-3 text-left transition-all ${
            categoryFilter === 'MEDIUM_SUITABLE'
              ? 'border-[#FBBF24] bg-[#FBBF24]/15 shadow-sm'
              : 'border-[#293149] bg-[#171D33] hover:border-[#FBBF24]/40'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FBBF24] block">Medium Match</span>
          <span className="text-lg font-black text-[#FBBF24]">{mediumCount}</span>
        </button>

        <button
          onClick={() => {
            setCategoryFilter('LOW_SUITABLE');
            setOnlyShortlist(false);
          }}
          className={`rounded-xl border p-3 text-left transition-all ${
            categoryFilter === 'LOW_SUITABLE'
              ? 'border-[#F87171] bg-[#F87171]/15 shadow-sm'
              : 'border-[#293149] bg-[#171D33] hover:border-[#F87171]/40'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F87171] block">Low Match</span>
          <span className="text-lg font-black text-[#F87171]">{lowCount}</span>
        </button>

        <button
          onClick={() => setOnlyShortlist(!onlyShortlist)}
          className={`col-span-2 sm:col-span-1 rounded-xl border p-3 text-left transition-all ${
            onlyShortlist
              ? 'border-[#6366F1] bg-[#6366F1]/20 shadow-sm'
              : 'border-[#293149] bg-[#171D33] hover:border-[#6366F1]/40'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] block flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Shortlist Only</span>
          </span>
          <span className="text-xs font-semibold text-[#F8FAFC]">
            {onlyShortlist ? 'Filtered (Best Only)' : 'Show Shortlist'}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#171D33] p-4 rounded-2xl border border-[#293149]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A7B0C0]" />
          <input
            type="text"
            placeholder="Search candidate name, email, or identified skills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#293149] bg-[#0D1326] pl-10 pr-4 py-2 text-xs text-[#F8FAFC] placeholder-[#A7B0C0] focus:border-[#8B5CF6] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[#293149] bg-[#0D1326] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success Only</option>
            <option value="NEEDS_REVIEW">Needs Review ({reviewCount})</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-xl border border-[#293149] bg-[#0D1326] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
          >
            <option value="rank">Sort by Rank</option>
            <option value="score">Sort by Score (%)</option>
            <option value="name">Sort by Candidate Name</option>
          </select>
        </div>
      </div>

      {/* Main Ranked Candidates Table */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] overflow-hidden shadow-xl">
        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A7B0C0] space-y-2">
            <p className="font-semibold text-[#F8FAFC]">No candidates match your current filter criteria.</p>
            <p>Try clearing your search term or selecting &quot;All Candidates&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#293149] bg-[#0D1326] text-[#A7B0C0]">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider w-16">Rank</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Candidate & File</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Match Score</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Suitability Category</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Matched Skills</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Missing Skills</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293149]/60">
                {filteredCandidates.map(c => {
                  const mr = c.matchResult;
                  const rank = mr ? mr.rank : 999;
                  const matchPct = mr ? mr.matchingPercentage : 0;
                  const isBest = mr?.suitabilityCategory === 'BEST_SUITABLE';
                  const isMedium = mr?.suitabilityCategory === 'MEDIUM_SUITABLE';
                  const isLow = mr?.suitabilityCategory === 'LOW_SUITABLE';

                  // Rank Badge styling (Competition ranking: 1, 1, 3)
                  const isRank1 = rank === 1;
                  const isRank2 = rank === 2;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCandidate(c)}
                      className="hover:bg-[#1E2540]/60 transition-colors cursor-pointer group"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
                            isRank1
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                              : isRank2
                              ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                              : 'bg-[#0D1326] text-[#A7B0C0] border border-[#293149]'
                          }`}
                        >
                          #{rank}
                        </div>
                      </td>

                      {/* Candidate Name & Filename */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#F8FAFC] text-sm group-hover:text-[#8B5CF6] transition-colors">
                          {c.candidateName}
                        </div>
                        <div className="text-[11px] text-[#A7B0C0] flex items-center space-x-2 mt-0.5">
                          <span className="truncate max-w-[200px]" title={c.originalFilename}>
                            {c.originalFilename}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-[#8B5CF6]">{c.fileType}</span>
                        </div>
                      </td>

                      {/* Match Score */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-black text-base ${
                              isBest ? 'text-[#22C55E]' : isMedium ? 'text-[#FBBF24]' : 'text-[#F87171]'
                            }`}
                          >
                            {matchPct}%
                          </span>
                          <span className="text-[10px] text-[#A7B0C0]">
                            ({mr?.matchedSkills.length || 0}/{job?.requiredSkills.length || 0})
                          </span>
                        </div>
                        {/* Horizontal mini bar */}
                        <div className="h-1.5 w-20 rounded-full bg-[#0D1326] overflow-hidden mt-1 border border-[#293149]">
                          <div
                            className={`h-full ${
                              isBest ? 'bg-[#22C55E]' : isMedium ? 'bg-[#FBBF24]' : 'bg-[#F87171]'
                            }`}
                            style={{ width: `${matchPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Suitability Category */}
                      <td className="py-4 px-4">
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

                      {/* Matched Skills */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {mr && mr.matchedSkills.length > 0 ? (
                            mr.matchedSkills.map((s, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-[#22C55E]/10 border border-[#22C55E]/30 px-1.5 py-0.5 text-[10px] font-semibold text-[#22C55E]"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[#A7B0C0] italic">None</span>
                          )}
                        </div>
                      </td>

                      {/* Missing Skills */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {mr && mr.missingSkills.length > 0 ? (
                            mr.missingSkills.map((s, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-[#F87171]/10 border border-[#F87171]/30 px-1.5 py-0.5 text-[10px] font-semibold text-[#F87171]"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[#22C55E] font-semibold">None (100% matched)</span>
                          )}
                        </div>
                      </td>

                      {/* Extraction Status */}
                      <td className="py-4 px-4">
                        {c.extractionStatus === 'NEEDS_REVIEW' ? (
                          <span
                            className="inline-flex items-center space-x-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-[#FBBF24]"
                            title={c.extractionWarnings.join(', ')}
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <span>Review Needed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectCandidate(c);
                          }}
                          className="inline-flex items-center space-x-1.5 rounded-xl border border-[#293149] bg-[#0D1326] px-3 py-1.5 text-xs font-semibold text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Report</span>
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
