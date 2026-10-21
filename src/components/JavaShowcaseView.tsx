import {
  BookOpen,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileCheck,
  FileCode,
  FolderGit2,
  Layers,
  Network,
  Server,
  Terminal,
} from 'lucide-react';
import React, { useState } from 'react';
import { JAVA_PROJECT_STRUCTURE, JavaSourceFile } from '../data/javaCodebase.js';

export const JavaShowcaseView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'schema' | 'api' | 'architecture'>('code');
  const [selectedFile, setSelectedFile] = useState<JavaSourceFile>(JAVA_PROJECT_STRUCTURE[0]);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = ['Configuration', 'Entity', 'Service', 'Controller', 'Test', 'SQL'] as const;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Portfolio Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#293149] bg-gradient-to-r from-[#171D33] via-[#141A2E] to-[#1F1937] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/40 bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-300">
              <FolderGit2 className="h-3.5 w-3.5" />
              <span>BSc Data Science Final Year Internship Portfolio</span>
            </div>
            <h1 className="text-2xl font-black text-[#F8FAFC]">
              Java & Spring Boot Backend Architecture
            </h1>
            <p className="text-xs text-[#A7B0C0] max-w-2xl leading-relaxed">
              Designed according to enterprise Spring Boot 3 standards: Spring Data JPA entities, competition-ranking algorithms, Apache PDFBox/POI document processing, Tess4J OCR fallback, and comprehensive JUnit 5 unit tests.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <span className="rounded-xl border border-[#293149] bg-[#0D1326] px-3 py-2 text-xs font-mono text-[#22C55E] flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>JDK 17 • Spring Boot 3.2</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#293149] pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 transition-all ${
            activeTab === 'code'
              ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/25'
              : 'text-[#A7B0C0] hover:bg-[#171D33] hover:text-[#F8FAFC]'
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>Java Source Code Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 transition-all ${
            activeTab === 'schema'
              ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/25'
              : 'text-[#A7B0C0] hover:bg-[#171D33] hover:text-[#F8FAFC]'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>MySQL Relational DDL & ER</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 transition-all ${
            activeTab === 'architecture'
              ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/25'
              : 'text-[#A7B0C0] hover:bg-[#171D33] hover:text-[#F8FAFC]'
          }`}
        >
          <Network className="h-4 w-4" />
          <span>Multi-Tier Architecture Diagram</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 transition-all ${
            activeTab === 'api'
              ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/25'
              : 'text-[#A7B0C0] hover:bg-[#171D33] hover:text-[#F8FAFC]'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>REST API Specifications</span>
        </button>
      </div>

      {/* TAB 1: CODE EXPLORER */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Tree List */}
          <div className="lg:col-span-1 rounded-2xl border border-[#293149] bg-[#171D33] p-4 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7B0C0] block">
              Package Structure
            </span>

            <div className="space-y-1 text-xs">
              {JAVA_PROJECT_STRUCTURE.map(file => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                      isSelected
                        ? 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#F8FAFC] font-bold'
                        : 'text-[#A7B0C0] hover:bg-[#0D1326] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileCode className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#8B5CF6]' : 'text-[#A7B0C0]'}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[9px] font-mono rounded bg-[#0D1326] px-1.5 py-0.5 text-[#A7B0C0] border border-[#293149]">
                      {file.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-3 rounded-2xl border border-[#293149] bg-[#0D1326] overflow-hidden flex flex-col shadow-2xl">
            {/* Code Header */}
            <div className="flex items-center justify-between border-b border-[#293149] bg-[#141A2E] px-5 py-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#F8FAFC]">{selectedFile.path}</span>
                  <span className="rounded bg-[#8B5CF6]/20 px-2 py-0.5 text-[10px] font-mono text-[#C4B5FD]">
                    {selectedFile.package}
                  </span>
                </div>
                <p className="text-[11px] text-[#A7B0C0] mt-0.5">{selectedFile.description}</p>
              </div>

              <button
                onClick={copyCode}
                className="flex items-center space-x-1.5 rounded-lg border border-[#293149] bg-[#171D33] px-3 py-1.5 text-xs font-semibold text-[#A7B0C0] hover:text-[#F8FAFC] hover:bg-[#1E2540] transition-colors"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto">
              <pre className="font-mono text-xs leading-relaxed text-[#F8FAFC] selection:bg-[#8B5CF6]/30">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEMA & ER */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-5">
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center space-x-2">
                <Database className="h-4 w-4 text-[#8B5CF6]" />
                <span>Relational Architecture</span>
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-2 leading-relaxed">
                Normalized 3NF relational schema enforcing strict referential integrity with cascading deletes and index-backed competition ranking queries.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-[#F8FAFC]">
                <li className="flex items-center space-x-2">
                  <span className="text-[#22C55E]">•</span>
                  <span><strong>job_profiles:</strong> Role criteria & threshold</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#22C55E]">•</span>
                  <span><strong>screening_sessions:</strong> Batch audit logs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#22C55E]">•</span>
                  <span><strong>candidate_resumes:</strong> Parsed metadata & text</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#22C55E]">•</span>
                  <span><strong>match_results:</strong> Scores, categories, and ranks</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-5">
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center space-x-2">
                <Layers className="h-4 w-4 text-[#6366F1]" />
                <span>Optimized Indexes</span>
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-2 leading-relaxed">
                High-performance B-tree indexes for millisecond ranking and retrieval:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-[#F8FAFC] font-mono">
                <li className="text-[11px] bg-[#0D1326] p-1.5 rounded border border-[#293149]">
                  idx_mr_rank (rank_position ASC)
                </li>
                <li className="text-[11px] bg-[#0D1326] p-1.5 rounded border border-[#293149]">
                  idx_resume_hash (content_hash)
                </li>
                <li className="text-[11px] bg-[#0D1326] p-1.5 rounded border border-[#293149]">
                  idx_session_created (created_at DESC)
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-5">
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-[#22C55E]" />
                <span>JPA / Hibernate Mapping</span>
              </h3>
              <p className="text-xs text-[#A7B0C0] mt-2 leading-relaxed">
                Spring Data JPA repositories utilize `@OneToMany(orphanRemoval = true)` and `@ElementCollection` for canonical skill mappings and warning diagnostics.
              </p>
            </div>
          </div>

          {/* DDL SQL Block */}
          <div className="rounded-2xl border border-[#293149] bg-[#0D1326] p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#293149] mb-4">
              <span className="font-mono text-xs font-bold text-[#F8FAFC]">
                schema.sql — MySQL 8.0+ DDL Script
              </span>
              <span className="text-[10px] text-[#A7B0C0]">
                Executes on Spring Boot startup via spring.sql.init.mode=always
              </span>
            </div>
            <pre className="font-mono text-xs leading-relaxed text-[#A7B0C0] max-h-96 overflow-y-auto">
              <code>{JAVA_PROJECT_STRUCTURE.find(f => f.name === 'schema.sql')?.code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE DIAGRAM */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 space-y-6">
            <h3 className="text-base font-bold text-[#F8FAFC]">
              End-to-End Multi-Tier Spring Boot System Architecture
            </h3>

            {/* Architecture Flowchart Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {/* Layer 1: Client */}
              <div className="rounded-xl border border-[#8B5CF6]/40 bg-[#0D1326] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-[#8B5CF6] font-bold mb-2">
                    <Terminal className="h-4 w-4" />
                    <span>Presentation Layer</span>
                  </div>
                  <p className="text-[#A7B0C0] leading-relaxed">
                    React 19 SPA + Tailwind CSS. Browser File API handles drag-and-drop batch upload; MediaDevices API powers camera document scanning.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#293149] font-mono text-[10px] text-[#8B5CF6]">
                  multipart/form-data & JSON
                </div>
              </div>

              {/* Layer 2: Controllers & Dispatch */}
              <div className="rounded-xl border border-indigo-500/40 bg-[#0D1326] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-2">
                    <Server className="h-4 w-4" />
                    <span>REST Controller Tier</span>
                  </div>
                  <p className="text-[#A7B0C0] leading-relaxed">
                    `ScreeningController`, `JobProfileController`, and `CandidateController`. Input validation via Jakarta `@Valid`, CORS protection, and HTTP 201/200 mapping.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#293149] font-mono text-[10px] text-indigo-400">
                  GlobalExceptionHandler
                </div>
              </div>

              {/* Layer 3: Extraction & Matching Services */}
              <div className="rounded-xl border border-[#22C55E]/40 bg-[#0D1326] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-[#22C55E] font-bold mb-2">
                    <Cpu className="h-4 w-4" />
                    <span>Processing Engine</span>
                  </div>
                  <p className="text-[#A7B0C0] leading-relaxed">
                    `DocumentExtractionService` (PDFBox + Apache POI + Tess4J OCR fallback) extracts text layers. `SkillMatchingService` computes equal-weight scores & competition ranks.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#293149] font-mono text-[10px] text-[#22C55E]">
                  Transparent Scoring: 100 * (M / T)
                </div>
              </div>

              {/* Layer 4: Data Layer */}
              <div className="rounded-xl border border-amber-500/40 bg-[#0D1326] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-amber-400 font-bold mb-2">
                    <Database className="h-4 w-4" />
                    <span>Persistence Layer</span>
                  </div>
                  <p className="text-[#A7B0C0] leading-relaxed">
                    Spring Data JPA + Hibernate with MySQL 8.0 connection pool (HikariCP). Transaction management (`@Transactional`) ensures atomic batch processing.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#293149] font-mono text-[10px] text-amber-400">
                  HikariCP • MySQL 8.0 InnoDB
                </div>
              </div>
            </div>

            {/* Resume Parsing Pipeline Steps */}
            <div className="rounded-xl border border-[#293149] bg-[#0D1326] p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                Resume Processing & OCR Pipeline Sequence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#171D33] border border-[#293149]">
                  <span className="font-bold text-[#8B5CF6] block mb-1">1. MIME Detect</span>
                  <span className="text-[#A7B0C0] text-[11px]">Inspect header signatures for PDF, DOCX, or JPEG/PNG.</span>
                </div>
                <div className="p-3 rounded-lg bg-[#171D33] border border-[#293149]">
                  <span className="font-bold text-[#8B5CF6] block mb-1">2. Text Extraction</span>
                  <span className="text-[#A7B0C0] text-[11px]">PDFBox / Mammoth extracts text; triggers OCR if &lt;50 chars.</span>
                </div>
                <div className="p-3 rounded-lg bg-[#171D33] border border-[#293149]">
                  <span className="font-bold text-[#8B5CF6] block mb-1">3. Entity Parsing</span>
                  <span className="text-[#A7B0C0] text-[11px]">Heuristics extract Name, Email, Phone, Degrees, Experience.</span>
                </div>
                <div className="p-3 rounded-lg bg-[#171D33] border border-[#293149]">
                  <span className="font-bold text-[#8B5CF6] block mb-1">4. Skill Dictionary</span>
                  <span className="text-[#A7B0C0] text-[11px]">Phrase regex matches canonical terms & aliases (e.g. Spring Boot).</span>
                </div>
                <div className="p-3 rounded-lg bg-[#171D33] border border-[#293149]">
                  <span className="font-bold text-[#22C55E] block mb-1">5. Rank & Persist</span>
                  <span className="text-[#A7B0C0] text-[11px]">Calculates formula, applies competition ranks (1, 1, 3), saves to MySQL.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API SPECS */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#293149] bg-[#171D33] p-5">
            <h3 className="text-base font-bold text-[#F8FAFC]">SkillMatch AI REST API Reference</h3>
            <p className="text-xs text-[#A7B0C0] mt-1">
              Standard RESTful endpoints implemented according to Spring Web best practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                method: 'GET',
                path: '/api/jobs',
                desc: 'Retrieve all configured job profiles and required skill specifications.',
                color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30',
              },
              {
                method: 'POST',
                path: '/api/jobs',
                desc: 'Create a new role with required skills and custom eligibility threshold.',
                color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30',
              },
              {
                method: 'POST',
                path: '/api/screenings',
                desc: 'Initialize a new screening session linked to a target job profile.',
                color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30',
              },
              {
                method: 'POST',
                path: '/api/screenings/{id}/resumes',
                desc: 'Multipart batch upload of mixed PDF, DOCX, and image resumes.',
                color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
              },
              {
                method: 'POST',
                path: '/api/screenings/{id}/analyse',
                desc: 'Trigger automated text extraction, skill matching, and competition ranking.',
                color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30',
              },
              {
                method: 'GET',
                path: '/api/screenings/{id}/export.csv',
                desc: 'Stream CSV export with candidate names, scores, and matched skill breakdowns.',
                color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30',
              },
              {
                method: 'GET',
                path: '/api/candidates/{id}/report',
                desc: 'Fetch full candidate report with education, experience, and audit warnings.',
                color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
              },
              {
                method: 'GET',
                path: '/api/dashboard/stats',
                desc: 'Aggregate real-time metrics, suitability distributions, and session history.',
                color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30',
              },
            ].map((ep, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#293149] bg-[#171D33] p-4 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <span className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] font-black ${ep.color}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#F8FAFC] truncate">{ep.path}</span>
                </div>
                <p className="text-xs text-[#A7B0C0]">{ep.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
