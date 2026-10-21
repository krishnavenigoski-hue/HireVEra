import { Download, FilePlus2, RefreshCw, Sparkles } from 'lucide-react';
import React from 'react';
import { NavigationItem } from './Sidebar.js';

interface HeaderProps {
  currentTab: NavigationItem;
  onNavigate: (tab: NavigationItem) => void;
  activeScreeningId?: string;
  onResetSeed?: () => void;
  onExportCsv?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  activeScreeningId,
  onResetSeed,
  onExportCsv,
}) => {
  const titles: Record<NavigationItem, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Recruitment Analytics Dashboard',
      subtitle: 'Real-time overview of screening sessions, qualification distributions, and candidate volume.',
    },
    'new-screening': {
      title: 'Automated Resume Screening',
      subtitle: 'Select a job profile, upload mixed PDF/DOCX/scanned resumes, and run instant skill matching.',
    },
    rankings: {
      title: 'Candidate Rankings & Evaluation',
      subtitle: 'Competition-ranked candidates (1, 1, 3) grouped by Best, Medium, and Low suitability.',
    },
    jobs: {
      title: 'Job Profile Requirements',
      subtitle: 'Configure required competencies, eligibility thresholds, and role specifications.',
    },
    history: {
      title: 'Screening Session History',
      subtitle: 'Audit past screening batches, review processed candidate cohorts, or export historical reports.',
    },
    'java-architecture': {
      title: 'Java Spring Boot & Architecture Showcase',
      subtitle: 'Production code explorer, Spring Data JPA entities, JUnit 5 test suite, and MySQL DDL schema.',
    },
    settings: {
      title: 'System Preferences & Dictionary',
      subtitle: 'Adjust eligibility thresholds, inspect canonical skill dictionaries, and manage persistence.',
    },
    about: {
      title: 'About SkillMatch AI',
      subtitle: 'Portfolio project architecture, scoring formula mathematical breakdown, and candidate privacy.',
    },
  };

  const currentInfo = titles[currentTab] || {
    title: 'SkillMatch AI',
    subtitle: 'Intelligent Resume Screening & Candidate Ranking System',
  };

  return (
    <header className="border-b border-[#293149] bg-[#0D1326]/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold text-[#F8FAFC] tracking-tight">{currentInfo.title}</h2>
        <p className="text-xs text-[#A7B0C0] mt-0.5">{currentInfo.subtitle}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 shrink-0">
        {onResetSeed && (
          <button
            onClick={onResetSeed}
            title="Reload default demo cohort with diverse PDF, DOCX, and scanned candidates"
            className="flex items-center space-x-1.5 rounded-xl border border-[#293149] bg-[#171D33] px-3.5 py-2 text-xs font-semibold text-[#A7B0C0] hover:text-[#F8FAFC] hover:bg-[#1E2540] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#8B5CF6]" />
            <span className="hidden sm:inline">Reset Demo Cohort</span>
          </button>
        )}

        {currentTab === 'rankings' && onExportCsv && activeScreeningId && (
          <button
            onClick={onExportCsv}
            className="flex items-center space-x-2 rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 px-4 py-2 text-xs font-bold text-[#22C55E] hover:bg-[#22C55E]/20 transition-all shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        )}

        {currentTab !== 'new-screening' && (
          <button
            onClick={() => onNavigate('new-screening')}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#8B5CF6]/25 hover:brightness-110 transition-all"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>New Screening</span>
          </button>
        )}
      </div>
    </header>
  );
};
