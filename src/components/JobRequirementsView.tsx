import {
  AlertCircle,
  Building,
  Check,
  Edit2,
  FilePlus2,
  Layers,
  Plus,
  Sliders,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { api, JobProfile } from '../api.js';

interface JobRequirementsViewProps {
  jobs: JobProfile[];
  onRefreshJobs: () => void;
  onSelectForScreening: (jobId: string) => void;
}

export const JobRequirementsView: React.FC<JobRequirementsViewProps> = ({
  jobs,
  onRefreshJobs,
  onSelectForScreening,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [eligibilityThreshold, setEligibilityThreshold] = useState<number>(75);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick skill suggestions
  const suggestedSkills = [
    'Java',
    'Spring Boot',
    'SQL',
    'MySQL',
    'PostgreSQL',
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Git',
    'REST APIs',
    'Hibernate',
    'Docker',
    'Python',
    'JUnit',
  ];

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingJobId(null);
    setTitle('');
    setCompanyName('');
    setJobDescription('');
    setRequiredSkills(['Java', 'SQL', 'Spring Boot', 'HTML']);
    setSkillInput('');
    setEligibilityThreshold(75);
    setNotes('');
    setError(null);
  };

  const handleOpenEdit = (job: JobProfile) => {
    setIsCreating(true);
    setEditingJobId(job.id);
    setTitle(job.title);
    setCompanyName(job.companyName || '');
    setJobDescription(job.jobDescription);
    setRequiredSkills([...job.requiredSkills]);
    setSkillInput('');
    setEligibilityThreshold(job.eligibilityThreshold);
    setNotes(job.notes || '');
    setError(null);
  };

  const handleAddSkill = (skillToAdd?: string) => {
    const raw = (skillToAdd || skillInput).trim();
    if (!raw) return;

    if (requiredSkills.some(s => s.toLowerCase() === raw.toLowerCase())) {
      setError(`Skill "${raw}" is already added.`);
      return;
    }

    setRequiredSkills(prev => [...prev, raw]);
    setSkillInput('');
    setError(null);
  };

  const handleRemoveSkill = (index: number) => {
    setRequiredSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Job title cannot be blank.');
      return;
    }

    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill.');
      return;
    }

    if (eligibilityThreshold < 1 || eligibilityThreshold > 100) {
      setError('Threshold must be between 1% and 100%.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        companyName: companyName.trim() || undefined,
        jobDescription: jobDescription.trim(),
        requiredSkills,
        eligibilityThreshold,
        notes: notes.trim() || undefined,
      };

      if (editingJobId) {
        await api.updateJob(editingJobId, payload);
      } else {
        await api.createJob(payload);
      }

      setIsCreating(false);
      onRefreshJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to save job profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (confirm(`Are you sure you want to delete job profile "${jobTitle}"?`)) {
      try {
        await api.deleteJob(jobId);
        onRefreshJobs();
      } catch (err: any) {
        alert(err.message || 'Failed to delete job');
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#293149] pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#F8FAFC]">Job Profiles & Required Competencies</h2>
          <p className="text-xs text-[#A7B0C0] mt-0.5">
            Configure target technical criteria, eligibility threshold percentages, and job descriptions
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#8B5CF6]/25 hover:brightness-110 transition-all cursor-pointer shrink-0"
        >
          <FilePlus2 className="h-4 w-4" />
          <span>Create New Job Profile</span>
        </button>
      </div>

      {/* Modal / Form Drawer for Job Creation/Edit */}
      {isCreating && (
        <div className="rounded-2xl border border-[#8B5CF6]/40 bg-[#171D33] p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#293149]">
            <h3 className="text-base font-bold text-[#F8FAFC]">
              {editingJobId ? 'Edit Job Profile' : 'Configure New Job Profile'}
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="rounded-lg p-1.5 text-[#A7B0C0] hover:bg-[#1E2540] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-[#F87171] flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSaveJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java Backend Intern"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#293149] bg-[#0D1326] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F8FAFC] mb-1">
                  Company / Organization (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Cloud Labs"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-[#293149] bg-[#0D1326] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F8FAFC] mb-1">Job Description</label>
              <textarea
                rows={3}
                placeholder="Describe role responsibilities, tech stack, and qualifications..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="w-full rounded-xl border border-[#293149] bg-[#0D1326] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>

            {/* Required Skills Management */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F8FAFC]">
                Required Skills List <span className="text-red-400">*</span> (Equal Weight per Skill)
              </label>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a skill (e.g. Spring Boot, Java, SQL) and press Add or Enter..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 rounded-xl border border-[#293149] bg-[#0D1326] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="rounded-xl bg-[#8B5CF6] px-4 py-2 text-xs font-bold text-white hover:bg-[#7C3AED] transition-colors"
                >
                  Add Skill
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#A7B0C0] mr-1">Quick Add:</span>
                {suggestedSkills.map((sk, idx) => {
                  const isAdded = requiredSkills.some(s => s.toLowerCase() === sk.toLowerCase());
                  if (isAdded) return null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddSkill(sk)}
                      className="rounded-lg border border-[#293149] bg-[#0D1326] px-2 py-0.5 text-[10px] font-medium text-[#A7B0C0] hover:text-[#8B5CF6] hover:border-[#8B5CF6] transition-colors"
                    >
                      + {sk}
                    </button>
                  );
                })}
              </div>

              {/* Added Skills Badge list */}
              <div className="flex flex-wrap gap-2 pt-2 p-3 rounded-xl bg-[#0D1326] border border-[#293149] min-h-[50px] items-center">
                {requiredSkills.length === 0 ? (
                  <span className="text-xs text-[#A7B0C0] italic">No required skills added yet.</span>
                ) : (
                  requiredSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 rounded-lg border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 px-3 py-1 text-xs font-semibold text-[#C4B5FD]"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-[#C4B5FD] hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Eligibility Threshold Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[#F8FAFC]">
                  Eligibility Threshold for &quot;Best Suitable&quot;:
                </label>
                <span className="font-mono font-bold text-[#22C55E] text-sm">
                  {eligibilityThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={eligibilityThreshold}
                onChange={e => setEligibilityThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-[#8B5CF6] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#A7B0C0]">
                <span>1% (Lenient)</span>
                <span>Default: 75%</span>
                <span>100% (Strict)</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#F8FAFC] mb-1">
                Internal Recruiter Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Summer 2026 developer internship cohort"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-xl border border-[#293149] bg-[#0D1326] px-3.5 py-2 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#293149]">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-[#293149] bg-[#0D1326] px-4 py-2 text-xs font-semibold text-[#A7B0C0] hover:text-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-6 py-2 text-xs font-bold text-white shadow-lg shadow-[#8B5CF6]/25 hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingJobId ? 'Update Role' : 'Save Job Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Job Profiles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map(job => (
          <div
            key={job.id}
            className="rounded-2xl border border-[#293149] bg-[#171D33] p-6 flex flex-col justify-between space-y-4 hover:border-[#3B4568] transition-all shadow-md"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC]">{job.title}</h3>
                  {job.companyName && (
                    <p className="text-xs text-[#A7B0C0] flex items-center space-x-1 mt-0.5">
                      <Building className="h-3 w-3 text-[#8B5CF6]" />
                      <span>{job.companyName}</span>
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center rounded-full border border-[#22C55E]/30 bg-[#22C55E]/15 px-2.5 py-0.5 text-xs font-bold text-[#22C55E]">
                  ≥ {job.eligibilityThreshold}%
                </span>
              </div>

              <p className="text-xs text-[#A7B0C0] mt-3 line-clamp-2 leading-relaxed">
                {job.jobDescription || 'No description provided.'}
              </p>

              {/* Skills Tags */}
              <div className="mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7B0C0] block mb-2">
                  Required Competencies ({job.requiredSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/15 px-2.5 py-0.5 text-xs font-semibold text-[#C4B5FD]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-[#293149] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#A7B0C0]">
                Created: {new Date(job.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(job)}
                  className="rounded-lg p-1.5 text-[#A7B0C0] hover:bg-[#1E2540] hover:text-[#F8FAFC] transition-colors"
                  title="Edit Job"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id, job.title)}
                  className="rounded-lg p-1.5 text-[#A7B0C0] hover:bg-red-500/10 hover:text-[#F87171] transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onSelectForScreening(job.id)}
                  className="flex items-center space-x-1.5 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 px-3 py-1.5 text-xs font-bold text-[#C4B5FD] hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer"
                >
                  <span>Start Screening</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
