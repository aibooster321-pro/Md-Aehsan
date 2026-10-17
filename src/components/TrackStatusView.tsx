import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  User,
  Calendar,
  FileText,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import type { Inquiry } from '../types/inquiry.ts';
import { calculateSLA, formatDisplayDate } from '../utils/sla.ts';
import { DeleteConfirmModal } from './DeleteConfirmModal.tsx';

interface TrackStatusViewProps {
  inquiries: Inquiry[];
  initialTrackingId?: string;
  onNavigateToSubmit: () => void;
  onDeleteInquiry?: (id: string) => void;
}

export const TrackStatusView: React.FC<TrackStatusViewProps> = ({
  inquiries,
  initialTrackingId = '',
  onNavigateToSubmit,
  onDeleteInquiry,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialTrackingId || '');
  const [searchedId, setSearchedId] = useState(initialTrackingId || '');
  const [copied, setCopied] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState(false);
  const [inquiryPendingDelete, setInquiryPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (initialTrackingId) {
      setSearchTerm(initialTrackingId);
      setSearchedId(initialTrackingId);
    }
  }, [initialTrackingId]);

  const foundInquiry = inquiries.find(
    (i) => i.id.toUpperCase() === searchedId.trim().toUpperCase()
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteNotice(false);
    setSearchedId(searchTerm.trim().toUpperCase());
  };

  const handleCopyId = () => {
    if (!foundInquiry) return;
    navigator.clipboard.writeText(foundInquiry.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteSelf = () => {
    if (!foundInquiry) return;
    setInquiryPendingDelete(foundInquiry.id);
  };

  const sla = foundInquiry ? calculateSLA(foundInquiry) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Search Input Box matching the video */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            LIVE TRACKER
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Track your inquiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter the tracking ID you received when submitting (format GC-XXXXXX).
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              placeholder="GC-XXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm tracking-wider uppercase focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
        </form>

        {/* Quick sample chips for easy testing */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-400">Recent demo IDs:</span>
          {inquiries.slice(0, 4).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSearchTerm(item.id);
                setSearchedId(item.id);
              }}
              className="font-mono px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] border border-slate-200 transition-colors"
            >
              {item.id}
            </button>
          ))}
        </div>
      </div>

      {/* Deleted Notice */}
      {deleteNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Inquiry successfully deleted / withdrawn from campus records.</span>
        </div>
      )}

      {/* Inquiry Result */}
      {searchedId ? (
        foundInquiry && sla ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
            {/* Header with Tracking ID and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl sm:text-2xl font-mono font-black text-slate-900 tracking-wider">
                    {foundInquiry.id}
                  </span>
                  <button
                    onClick={handleCopyId}
                    title="Copy tracking ID"
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-md"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted on {formatDisplayDate(foundInquiry.createdAt)}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {foundInquiry.status === 'open' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                    Open — College Review
                  </span>
                )}
                {foundInquiry.status === 'in_progress' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
                    In Progress
                  </span>
                )}
                {foundInquiry.status === 'resolved' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Resolved — Closed
                  </span>
                )}
                {foundInquiry.status === 'escalated_aktu' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                    Escalated to AKTU Desk
                  </span>
                )}
              </div>
            </div>

            {/* 7-Day SLA Progress Bar */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>7-Day SLA Rule Timeline</span>
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    foundInquiry.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : foundInquiry.status === 'escalated_aktu'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {sla.slaStatusLabel}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all duration-500 ${
                    foundInquiry.status === 'resolved'
                      ? 'bg-emerald-500'
                      : foundInquiry.status === 'escalated_aktu'
                      ? 'bg-rose-600'
                      : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      foundInquiry.status === 'resolved'
                        ? 100
                        : ((sla.daysElapsed + 1) / 7) * 100
                    )}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                <span>Day 0 (Submitted)</span>
                <span>Day 4 (College Mid-Check)</span>
                <span>Day 7 (Auto-AKTU Escalation)</span>
              </div>
            </div>

            {/* Inquiry Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  STUDENT
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block text-sm">
                  {foundInquiry.studentName}
                </span>
                <span className="font-mono text-slate-500">
                  Roll: {foundInquiry.rollNumber}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  COLLEGE ID
                </span>
                <span className="font-bold font-mono text-slate-900 mt-0.5 block text-xs">
                  {foundInquiry.collegeId || 'GNIOT-' + foundInquiry.rollNumber}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Verified Student ID
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  CLASSROOM / SPOT
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block text-xs">
                  {foundInquiry.classroomNumber || 'Campus Grounds'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {foundInquiry.semester || '1st Sem'} • {foundInquiry.section || 'Sec A'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                  CATEGORY
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block text-xs truncate">
                  {foundInquiry.category}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Priority: {foundInquiry.priority || 'Normal'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                Issue Description
              </span>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                {foundInquiry.description}
              </p>
            </div>

            {/* Admin Response & Action Notes */}
            {foundInquiry.adminNotes && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                    College Admin Desk Notes
                  </span>
                </div>
                <p className="text-xs text-blue-950 leading-relaxed">
                  {foundInquiry.adminNotes}
                </p>
              </div>
            )}

            {/* AKTU Directives (if escalated) */}
            {foundInquiry.status === 'escalated_aktu' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <Building2 className="w-4 h-4 text-rose-700" />
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                    AKTU University State Desk Directive
                  </span>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed">
                  {foundInquiry.aktuNotes ||
                    'Inquiry transferred to AKTU State Escalation Desk. The university compliance officer has been notified.'}
                </p>
                {foundInquiry.escalatedAt && (
                  <span className="text-[10px] text-rose-700 block mt-2">
                    Transferred on: {formatDisplayDate(foundInquiry.escalatedAt)}
                  </span>
                )}
              </div>
            )}

            {/* Student Action Bar with Delete / Withdraw option */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Submitted by student • Need to withdraw?
              </span>
              <button
                type="button"
                onClick={handleDeleteSelf}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Withdraw / Delete Inquiry</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not Found state */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No inquiry found for &quot;{searchedId}&quot;
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Please double-check the tracking ID or ask the college admin cell with your student roll number.
            </p>
          </div>
        )
      ) : (
        /* Empty / initial state matching the video */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
          <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">
            Your result will appear here.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Lost the ID? Ask the admin office with your roll number.
          </p>
        </div>
      )}

      {/* In-app Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(inquiryPendingDelete)}
        inquiryId={inquiryPendingDelete || ''}
        onConfirm={() => {
          if (inquiryPendingDelete && onDeleteInquiry) {
            onDeleteInquiry(inquiryPendingDelete);
            setSearchedId('');
            setSearchTerm('');
            setDeleteNotice(true);
            setInquiryPendingDelete(null);
          }
        }}
        onClose={() => setInquiryPendingDelete(null)}
      />
    </div>
  );
};
