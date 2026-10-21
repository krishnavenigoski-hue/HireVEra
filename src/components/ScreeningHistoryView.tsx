import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Download,
  FolderOpen,
  History,
  Trash2,
} from 'lucide-react';
import React from 'react';
import { api, ScreeningSession } from '../api.js';

interface ScreeningHistoryViewProps {
  sessions: ScreeningSession[];
  onOpenSession: (session: ScreeningSession) => void;
  onRefreshSessions: () => void;
}

export const ScreeningHistoryView: React.FC<ScreeningHistoryViewProps> = ({
  sessions,
  onOpenSession,
  onRefreshSessions,
}) => {
  const handleDeleteSession = async (sessionId: string, jobTitle: string) => {
    if (confirm(`Are you sure you want to delete screening session for "${jobTitle}"? Stored resume text and match results will be cleared.`)) {
      try {
        await api.deleteScreening(sessionId);
        onRefreshSessions();
      } catch (err: any) {
        alert(err.message || 'Failed to delete session');
      }
    }
  };

  const handleExportCsv = (sessionId: string) => {
    window.location.href = `/api/screenings/${sessionId}/export.csv`;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#293149] pb-4">
        <h2 className="text-xl font-extrabold text-[#F8FAFC]">Screening Session History</h2>
        <p className="text-xs text-[#A7B0C0] mt-0.5">
          Archived candidate cohorts stored in MySQL database with full match audit trails
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#A7B0C0] space-y-3 bg-[#171D33] rounded-2xl border border-[#293149]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D1326] text-[#A7B0C0] border border-[#293149]">
            <History className="h-6 w-6" />
          </div>
          <p className="font-bold text-sm text-[#F8FAFC]">No screening history available.</p>
          <p>Run a new screening session to store candidate rankings in the database.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#293149] bg-[#171D33] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#293149] bg-[#0D1326] text-[#A7B0C0]">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Date & ID</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Target Job Profile</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Uploaded</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Analysed</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Review Needed</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Best Suitable</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#293149]/60">
                {sessions.map(s => {
                  const bestCount = s.candidates.filter(
                    c => c.matchResult?.suitabilityCategory === 'BEST_SUITABLE'
                  ).length;
                  const reviewCount = s.candidates.filter(
                    c => c.extractionStatus === 'NEEDS_REVIEW'
                  ).length;

                  return (
                    <tr key={s.id} className="hover:bg-[#1E2540]/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#F8FAFC] flex items-center space-x-1.5">
                          <Clock className="h-3 w-3 text-[#8B5CF6]" />
                          <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[10px] text-[#A7B0C0] font-mono mt-0.5">
                          {s.id}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-[#F8FAFC] text-sm">
                          {s.jobProfile.title}
                        </div>
                        <div className="text-[11px] text-[#A7B0C0]">
                          {s.jobProfile.companyName || 'Apex Solutions'} • Threshold: ≥ {s.jobProfile.eligibilityThreshold}%
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-[#F8FAFC]">
                        {s.totalUploadedFiles} files
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-[#22C55E]">
                          {s.successfullyProcessedFiles}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {reviewCount > 0 ? (
                          <span className="inline-flex items-center space-x-1 text-amber-400 font-semibold">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{reviewCount}</span>
                          </span>
                        ) : (
                          <span className="text-[#A7B0C0]">0</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center space-x-1 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#22C55E]">
                          <Award className="h-3 w-3" />
                          <span>{bestCount}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="rounded bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
                          {s.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleExportCsv(s.id)}
                            className="rounded-lg p-1.5 text-[#A7B0C0] hover:bg-[#0D1326] hover:text-[#22C55E] transition-colors"
                            title="Export CSV Report"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(s.id, s.jobProfile.title)}
                            className="rounded-lg p-1.5 text-[#A7B0C0] hover:bg-red-500/10 hover:text-[#F87171] transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onOpenSession(s)}
                            className="flex items-center space-x-1 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 px-3 py-1.5 text-xs font-bold text-[#C4B5FD] hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
