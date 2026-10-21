import { CheckCircle2, Info, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  api,
  CandidateResume,
  DashboardStats,
  JobProfile,
  ScreeningSession,
} from './api.js';
import { AboutView } from './components/AboutView.js';
import { CandidateRankingsView } from './components/CandidateRankingsView.js';
import { CandidateReportModal } from './components/CandidateReportModal.js';
import { DashboardView } from './components/DashboardView.js';
import { Header } from './components/Header.js';
import { JavaShowcaseView } from './components/JavaShowcaseView.js';
import { JobRequirementsView } from './components/JobRequirementsView.js';
import { NewScreeningView } from './components/NewScreeningView.js';
import { ScreeningHistoryView } from './components/ScreeningHistoryView.js';
import { SettingsView } from './components/SettingsView.js';
import { NavigationItem, Sidebar } from './components/Sidebar.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationItem>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<JobProfile[]>([]);
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ScreeningSession | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResume | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [fetchedStats, fetchedJobs, fetchedSessions] = await Promise.all([
        api.getDashboardStats(),
        api.getJobs(),
        api.getScreenings(),
      ]);

      setStats(fetchedStats);
      setJobs(fetchedJobs);
      setSessions(fetchedSessions);

      if (fetchedSessions.length > 0) {
        // Default to latest completed session
        setCurrentSession(fetchedSessions[0]);
      }
    } catch (err) {
      console.error('Initialization error:', err);
      showToast('Could not reach backend API. Retrying connection...', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScreeningComplete = (completedSession: ScreeningSession) => {
    setCurrentSession(completedSession);
    loadAllData();
    setCurrentTab('rankings');
    showToast(
      `Screening completed! ${completedSession.candidates.length} candidates evaluated and ranked.`,
      'success'
    );
  };

  const handleOpenSession = (session: ScreeningSession) => {
    setCurrentSession(session);
    setCurrentTab('rankings');
  };

  const handleSelectSessionById = (sessionId: string) => {
    const found = sessions.find(s => s.id === sessionId);
    if (found) {
      setCurrentSession(found);
    }
  };

  const handleSelectForScreening = (jobId: string) => {
    setCurrentTab('new-screening');
  };

  const handleResetSeed = async () => {
    try {
      await api.resetDemoSeed();
      await loadAllData();
      showToast('Demo cohort reseeded with standard test candidates.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reseed database', 'error');
    }
  };

  const handleExportCsv = () => {
    if (!currentSession) return;
    window.location.href = `/api/screenings/${currentSession.id}/export.csv`;
    showToast(`Downloading CSV ranking report for "${currentSession.jobProfile.title}"...`, 'info');
  };

  const bestCount = currentSession
    ? currentSession.candidates.filter(c => c.matchResult?.suitabilityCategory === 'BEST_SUITABLE').length
    : stats?.bestSuitableCandidates || 0;

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-2xl border border-[#293149] bg-[#171D33] px-5 py-3.5 shadow-2xl animate-in slide-in-from-bottom duration-300">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
          ) : (
            <Info className="h-5 w-5 text-[#8B5CF6]" />
          )}
          <span className="text-xs font-semibold text-[#F8FAFC]">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-[#A7B0C0] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        bestCount={bestCount}
        totalScreenings={sessions.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 pt-16 lg:pt-0">
        <Header
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          activeScreeningId={currentSession?.id}
          onResetSeed={handleResetSeed}
          onExportCsv={handleExportCsv}
        />

        <main className="flex-1 pb-16">
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              isLoading={isLoading}
              onStartNewScreening={() => setCurrentTab('new-screening')}
              onSelectCandidate={setSelectedCandidate}
              onOpenSession={handleOpenSession}
              onNavigateToCode={() => setCurrentTab('java-architecture')}
            />
          )}

          {currentTab === 'new-screening' && (
            <NewScreeningView
              jobs={jobs}
              onScreeningComplete={handleScreeningComplete}
              onNavigateToJobs={() => setCurrentTab('jobs')}
            />
          )}

          {currentTab === 'rankings' && (
            <CandidateRankingsView
              currentSession={currentSession}
              allSessions={sessions}
              onSelectCandidate={setSelectedCandidate}
              onSelectSession={handleSelectSessionById}
              onExportCsv={handleExportCsv}
            />
          )}

          {currentTab === 'jobs' && (
            <JobRequirementsView
              jobs={jobs}
              onRefreshJobs={loadAllData}
              onSelectForScreening={handleSelectForScreening}
            />
          )}

          {currentTab === 'history' && (
            <ScreeningHistoryView
              sessions={sessions}
              onOpenSession={handleOpenSession}
              onRefreshSessions={loadAllData}
            />
          )}

          {currentTab === 'java-architecture' && <JavaShowcaseView />}

          {currentTab === 'settings' && (
            <SettingsView onResetSeed={handleResetSeed} />
          )}

          {currentTab === 'about' && <AboutView />}
        </main>
      </div>

      {/* Detailed Candidate Report Modal */}
      <CandidateReportModal
        candidate={selectedCandidate}
        jobProfile={currentSession?.jobProfile}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}
