import {
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  FileCheck2,
  FolderGit2,
  GraduationCap,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import React from 'react';

export const AboutView: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="rounded-2xl border border-[#293149] bg-gradient-to-r from-[#171D33] via-[#141A2E] to-[#1F1937] p-8 shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/15 px-3 py-1 text-xs font-bold text-[#C4B5FD]">
          <GraduationCap className="h-4 w-4 text-[#8B5CF6]" />
          <span>Final-Year BSc Data Science Portfolio Project</span>
        </div>
        <h1 className="text-3xl font-black text-[#F8FAFC] tracking-tight">
          SkillMatch AI — Intelligent Resume Screening System
        </h1>
        <p className="text-sm text-[#A7B0C0] max-w-3xl leading-relaxed">
          Built for recruiters and talent acquisition teams to eliminate hours of manual resume triage. SkillMatch AI automates multi-format document parsing (PDF, Word, OCR, and Camera), matches technical qualifications with mathematical rigor, and automatically ranks candidate cohorts without human typing or scoring bias.
        </p>
      </div>

      {/* The Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-red-500/20 bg-[#171D33] p-6 space-y-3">
          <div className="flex items-center space-x-2 text-[#F87171] font-bold text-sm">
            <Scale className="h-4 w-4" />
            <span>The Traditional Recruiter Dilemma</span>
          </div>
          <p className="text-xs text-[#A7B0C0] leading-relaxed">
            A single tech job posting frequently attracts hundreds of resumes. Manually opening every PDF and DOCX, scanning for keywords, and maintaining inconsistent spreadsheet rankings is exhausting and error-prone. Valuable engineering candidates are easily missed.
          </p>
        </div>

        <div className="rounded-2xl border border-[#22C55E]/20 bg-[#171D33] p-6 space-y-3">
          <div className="flex items-center space-x-2 text-[#22C55E] font-bold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>The SkillMatch AI Solution</span>
          </div>
          <p className="text-xs text-[#A7B0C0] leading-relaxed">
            Recruiters drag and drop resume batches or photograph paper CVs. The engine automatically extracts text, normalizes technology phrases, computes an equal-weight suitability percentage, and delivers ranked candidate reports in seconds.
          </p>
        </div>
      </div>

      {/* Mathematical Matching Formula & Worked Example */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-5">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-[#8B5CF6]" />
          <h3 className="text-base font-bold text-[#F8FAFC]">
            Equal-Weight Scoring Formula & Worked Example
          </h3>
        </div>

        <div className="rounded-xl border border-[#8B5CF6]/30 bg-[#0D1326] p-4 text-center font-mono text-sm text-[#C4B5FD]">
          Match Percentage = (Matched Unique Required Skills / Total Unique Required Skills) × 100
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0D1326] border border-[#293149] space-y-2">
            <span className="font-bold text-[#F8FAFC] block text-sm">Target Role Requirements</span>
            <p className="text-[#A7B0C0]">
              Job Title: <strong>Java Backend Intern</strong>
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Java', 'SQL', 'Spring Boot', 'HTML'].map((s, i) => (
                <span key={i} className="rounded bg-[#8B5CF6]/20 text-[#C4B5FD] px-2 py-0.5 font-semibold">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#22C55E] font-semibold pt-1">
              Eligibility Threshold: ≥ 75.0%
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D1326] border border-[#293149] space-y-2">
            <span className="font-bold text-[#F8FAFC] block text-sm">Candidate A Evaluation</span>
            <p className="text-[#A7B0C0]">
              Skills in Resume: <strong>Java, SQL, HTML, Python, Git</strong>
            </p>
            <ul className="space-y-1 text-[#A7B0C0] text-[11px] pt-1">
              <li>• Matched: <strong className="text-[#22C55E]">Java, SQL, HTML (3)</strong></li>
              <li>• Missing: <strong className="text-[#F87171]">Spring Boot (1)</strong></li>
              <li>• Extra: <strong className="text-indigo-400">Python, Git (2)</strong></li>
              <li>• Calculation: (3 / 4) × 100 = <strong className="text-[#F8FAFC]">75.0%</strong></li>
              <li>• Category: <strong className="text-[#22C55E]">BEST SUITABLE (Eligible for Review)</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-4">
        <h3 className="text-base font-bold text-[#F8FAFC] flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-[#8B5CF6]" />
          <span>Full-Stack Engineering Technologies</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0D1326] border border-[#293149]">
            <span className="font-bold text-[#8B5CF6] block mb-1">Backend Core</span>
            <p className="text-[#A7B0C0] text-[11px]">Java 17, Spring Boot 3.2, Maven, Jakarta Validation</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1326] border border-[#293149]">
            <span className="font-bold text-[#6366F1] block mb-1">Database & ORM</span>
            <p className="text-[#A7B0C0] text-[11px]">MySQL 8.0, Spring Data JPA, Hibernate, HikariCP</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1326] border border-[#293149]">
            <span className="font-bold text-[#22C55E] block mb-1">Document & OCR</span>
            <p className="text-[#A7B0C0] text-[11px]">Apache PDFBox, Apache POI, Tesseract OCR / Tess4J</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1326] border border-[#293149]">
            <span className="font-bold text-amber-400 block mb-1">Testing & QA</span>
            <p className="text-[#A7B0C0] text-[11px]">JUnit 5, Spring Boot Test, H2 in-memory DB</p>
          </div>
        </div>
      </div>

      {/* Candidate Privacy & Ethics */}
      <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-3">
        <h3 className="text-base font-bold text-[#F8FAFC] flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-[#22C55E]" />
          <span>Ethical AI & Privacy Policy</span>
        </h3>
        <p className="text-xs text-[#A7B0C0] leading-relaxed">
          SkillMatch AI evaluates candidates strictly on verified technical competencies extracted from their resumes. The ranking engine contains no hidden bonuses or subjective deductions. Protected personal characteristics (including gender, age, ethnicity, and photographs) are excluded from scoring calculations.
        </p>
      </div>
    </div>
  );
};
