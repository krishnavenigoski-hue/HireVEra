import {
  BarChart3,
  BookOpen,
  Code2,
  FileCheck2,
  FolderGit2,
  History,
  Layers,
  Menu,
  PlusCircle,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

export type NavigationItem =
  | 'dashboard'
  | 'new-screening'
  | 'rankings'
  | 'jobs'
  | 'history'
  | 'java-architecture'
  | 'settings'
  | 'about';

interface SidebarProps {
  currentTab: NavigationItem;
  onSelectTab: (tab: NavigationItem) => void;
  bestCount?: number;
  totalScreenings?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  bestCount = 0,
  totalScreenings = 0,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as NavigationItem,
      label: 'Dashboard',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'new-screening' as NavigationItem,
      label: 'New Screening',
      icon: PlusCircle,
      badge: 'Action',
      badgeColor: 'bg-[#8B5CF6]/20 text-[#8B5CF6]',
    },
    {
      id: 'rankings' as NavigationItem,
      label: 'Candidate Rankings',
      icon: Users,
      badge: bestCount > 0 ? `${bestCount} Best` : null,
      badgeColor: 'bg-[#22C55E]/20 text-[#22C55E]',
    },
    {
      id: 'jobs' as NavigationItem,
      label: 'Job Requirements',
      icon: Layers,
      badge: null,
    },
    {
      id: 'history' as NavigationItem,
      label: 'Screening History',
      icon: History,
      badge: totalScreenings > 0 ? String(totalScreenings) : null,
      badgeColor: 'bg-[#1E2540] text-[#A7B0C0]',
    },
    {
      id: 'java-architecture' as NavigationItem,
      label: 'Java Architecture & Code',
      icon: Code2,
      badge: 'Portfolio',
      badgeColor: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      id: 'settings' as NavigationItem,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
    {
      id: 'about' as NavigationItem,
      label: 'About Project',
      icon: BookOpen,
      badge: null,
    },
  ];

  const handleNavClick = (tab: NavigationItem) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Trigger Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-[#293149] bg-[#0D1326] px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#6366F1] text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[#F8FAFC]">SkillMatch AI</h1>
            <p className="text-[10px] text-[#A7B0C0]">Intelligent Resume Screening</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-[#A7B0C0] hover:bg-[#1E2540] hover:text-[#F8FAFC]"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-[#293149] bg-[#0D1326] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding */}
        <div className="flex items-center space-x-3 border-b border-[#293149] px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#6366F1] text-white shadow-lg shadow-[#8B5CF6]/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#F8FAFC] flex items-center space-x-1.5">
              <span>SkillMatch</span>
              <span className="text-[#8B5CF6]">AI</span>
            </h1>
            <p className="text-xs text-[#A7B0C0] font-medium">Intelligent Resume Screening</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group relative flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#6366F1]/10 text-white border border-[#8B5CF6]/40 shadow-sm'
                    : 'text-[#A7B0C0] hover:bg-[#171D33] hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-[#8B5CF6]' : 'text-[#A7B0C0] group-hover:text-[#F8FAFC]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.badgeColor || 'bg-[#1E2540] text-[#A7B0C0]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#8B5CF6]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Student Portfolio Card at Bottom */}
        <div className="border-t border-[#293149] p-4 bg-[#090E1D]">
          <div className="rounded-xl border border-[#293149] bg-[#141A2E] p-3 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] flex items-center space-x-1">
                <FolderGit2 className="h-3 w-3" />
                <span>BSc Data Science Final Year</span>
              </span>
              <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" title="System Operational" />
            </div>
            <p className="text-[11px] font-medium text-[#F8FAFC]">Java Backend Internship Portfolio</p>
            <p className="text-[10px] text-[#A7B0C0] mt-0.5">Spring Boot • MySQL • PDFBox • OCR</p>
          </div>
        </div>
      </aside>
    </>
  );
};
