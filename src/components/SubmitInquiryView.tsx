import React, { useState } from 'react';
import {
  Send,
  Clock,
  PhoneCall,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { Inquiry } from '../types/inquiry.ts';
import { CAMPUS_CATEGORIES } from '../data/categories.ts';
import { generateTrackingId } from '../utils/sla.ts';

interface SubmitInquiryViewProps {
  initialCategory?: string;
  onInquiryCreated: (newInquiry: Inquiry) => void;
  onNavigateToTrack: (trackingId: string) => void;
}

export const SubmitInquiryView: React.FC<SubmitInquiryViewProps> = ({
  initialCategory = '',
  onInquiryCreated,
  onNavigateToTrack,
}) => {
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [classroomNumber, setClassroomNumber] = useState('');
  const [semester, setSemester] = useState('1st Semester');
  const [section, setSection] = useState('Section A');
  const [category, setCategory] = useState(initialCategory || '');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedInquiry, setSubmittedInquiry] = useState<Inquiry | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!category) newErrors.category = 'Please select a category';
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Please describe the issue in at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newTrackingId = generateTrackingId();
    const nowIso = new Date().toISOString();

    const created: Inquiry = {
      id: newTrackingId,
      studentName: fullName.trim(),
      rollNumber: rollNumber.trim(),
      collegeId: collegeId.trim() || `GNIOT-${rollNumber.trim()}`,
      classroomNumber: classroomNumber.trim() || 'General Campus',
      semester: semester || '1st Semester',
      section: section || 'Section A',
      category: category,
      description: description.trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'open',
      priority: 'normal',
      adminNotes: 'Inquiry registered. Assigned to college admin desk for resolution.',
    };

    onInquiryCreated(created);
    setSubmittedInquiry(created);
  };

  const handleCopyId = () => {
    if (!submittedInquiry) return;
    navigator.clipboard.writeText(submittedInquiry.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setSubmittedInquiry(null);
    setFullName('');
    setRollNumber('');
    setCollegeId('');
    setClassroomNumber('');
    setSemester('1st Semester');
    setSection('Section A');
    setCategory('');
    setDescription('');
    setErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* If inquiry was just submitted, show confirmation modal/screen */}
      {submittedInquiry ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              INQUIRY SUBMITTED SUCCESSFULLY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Your tracking ID is ready
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Please save this ID to check updates. The 7-day SLA countdown has started.
            </p>
          </div>

          {/* Big Tracking ID Box */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl max-w-md mx-auto flex items-center justify-between border border-slate-700 shadow-inner">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                CAMPUS CARE TRACKING ID
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-wider">
                {submittedInquiry.id}
              </span>
            </div>
            <button
              onClick={handleCopyId}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Details summary */}
          <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 text-xs text-slate-600 space-y-1.5 max-w-md mx-auto">
            <p>
              <strong className="text-slate-800">Student:</strong> {submittedInquiry.studentName} (Roll: {submittedInquiry.rollNumber})
            </p>
            <p>
              <strong className="text-slate-800">College ID:</strong> {submittedInquiry.collegeId}
            </p>
            <p>
              <strong className="text-slate-800">Classroom / Spot:</strong> {submittedInquiry.classroomNumber}
            </p>
            <p>
              <strong className="text-slate-800">Academic:</strong> {submittedInquiry.semester} • {submittedInquiry.section}
            </p>
            <p>
              <strong className="text-slate-800">Category:</strong> {submittedInquiry.category}
            </p>
            <p>
              <strong className="text-slate-800">SLA Status:</strong> Auto-AKTU in 7d (College resolution in progress)
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigateToTrack(submittedInquiry.id)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
            >
              <span>Track Inquiry Status Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={resetForm}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-sm font-semibold rounded-xl cursor-pointer transition-all"
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      ) : (
        /* The Inquiry Submission Form matching video */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              GNIOT CAMPUS CARE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Submit an inquiry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              No login needed. You&apos;ll get a tracking ID to follow every update — including an
              automatic 7-day escalation to AKTU if the college can&apos;t close it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name & Roll Number in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Full name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-hidden transition-all ${
                    errors.fullName
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Roll number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 2202940057"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-hidden transition-all ${
                    errors.rollNumber
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {errors.rollNumber && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.rollNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {/* College ID & Class Room Number in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  College ID
                </label>
                <input
                  type="text"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  placeholder="e.g. GNIOT-2023-CS-042"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-mono focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Class Room Number / Spot
                </label>
                <input
                  type="text"
                  value={classroomNumber}
                  onChange={(e) => setClassroomNumber(e.target.value)}
                  placeholder="e.g. Room 302, Lab 4, Hostel Block B"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Semester & Section in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm focus:outline-hidden bg-white transition-all"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Section
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm focus:outline-hidden bg-white transition-all"
                >
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                  <option value="Section D">Section D</option>
                  <option value="Section E">Section E</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-hidden bg-white transition-all ${
                  errors.category
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              >
                <option value="">Select a category</option>
                {CAMPUS_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-rose-500 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            {/* Describe the Issue */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Describe the issue <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {description.length}/2000 characters (minimum 10)
                </span>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="Where is it, what's wrong, and since when? The more detail, the faster the fix."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-hidden transition-all ${
                  errors.description
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            {/* SLA Promise Callout Box */}
            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-950">SLA promise:</strong> the college
                must act within 7 days — otherwise this inquiry auto-transfers to the AKTU state
                desk and stays on record.
              </div>
            </div>

            {/* Helpline Callout Box */}
            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <PhoneCall className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-800">Need help submitting?</strong> Call
                the GNIOT helpline (toll-free){' '}
                <span className="font-bold text-slate-900">1800 274 6969</span> or email{' '}
                <span className="font-bold text-slate-900">feedback@gniot.net.in</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              data-testid="submit-inquiry-btn"
              type="submit"
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit inquiry</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
