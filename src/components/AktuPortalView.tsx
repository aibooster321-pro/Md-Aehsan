import React, { useState } from 'react';
import {
  Lock,
  Key,
  Building2,
  RefreshCw,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  X,
  FileCheck,
  Send,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Inquiry } from '../types/inquiry.ts';
import { CAMPUS_CATEGORIES } from '../data/categories.ts';
import {
  calculateSLA,
  validatePIN,
  formatDisplayDate,
  applySLAEngine,
  generateTrackingId,
} from '../utils/sla.ts';
import { DeleteConfirmModal } from './DeleteConfirmModal.tsx';

const AKTU_CORRECT_PIN = '9999';

interface AktuPortalViewProps {
  inquiries: Inquiry[];
  onUpdateInquiry: (updated: Inquiry) => void;
  onBatchUpdateInquiries: (updatedList: Inquiry[]) => void;
  onDeleteInquiry?: (id: string) => void;
  isAktuLoggedIn: boolean;
  setIsAktuLoggedIn: (val: boolean) => void;
  onBackToHome: () => void;
}

export const AktuPortalView: React.FC<AktuPortalViewProps> = ({
  inquiries,
  onUpdateInquiry,
  onBatchUpdateInquiries,
  onDeleteInquiry,
  isAktuLoggedIn,
  setIsAktuLoggedIn,
  onBackToHome,
}) => {
  // Authentication PIN states
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  // Modal state
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryPendingDelete, setInquiryPendingDelete] = useState<string | null>(null);
  const [aktuDirective, setAktuDirective] = useState('');
  const [markResolved, setMarkResolved] = useState(false);
  const [auditNotice, setAuditNotice] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setInquiryPendingDelete(id);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setPinError('');

    setTimeout(() => {
      if (validatePIN(pin, AKTU_CORRECT_PIN)) {
        setIsAktuLoggedIn(true);
        setPin('');
      } else {
        setPinError('Incorrect security PIN. Please enter the AKTU State Officer PIN.');
      }
      setIsVerifying(false);
    }, 400);
  };

  const handleSignOut = () => {
    setIsAktuLoggedIn(false);
    setPin('');
  };

  const handleRunAudit = () => {
    const result = applySLAEngine(inquiries);
    onBatchUpdateInquiries(result.updatedInquiries);
    if (result.escalatedCount > 0) {
      setAuditNotice(
        `AKTU SLA Sweep: ${result.escalatedCount} inquiries officially brought under state university docket.`
      );
    } else {
      setAuditNotice('AKTU SLA Sweep: All college dockets synchronized.');
    }
    setTimeout(() => setAuditNotice(null), 5000);
  };

  const handleOpenDirectiveModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAktuDirective(inquiry.aktuNotes || '');
    setMarkResolved(inquiry.status === 'resolved');
  };

  const handleSaveDirective = () => {
    if (!selectedInquiry) return;
    const nowIso = new Date().toISOString();
    const updated: Inquiry = {
      ...selectedInquiry,
      status: markResolved ? 'resolved' : 'escalated_aktu',
      aktuNotes: aktuDirective.trim(),
      updatedAt: nowIso,
      resolvedAt: markResolved ? nowIso : selectedInquiry.resolvedAt,
    };
    onUpdateInquiry(updated);
    setSelectedInquiry(null);
  };

  // Filter inquiries for AKTU view: by default all or prioritizing escalated ones
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All categories' || inquiry.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'All statuses' ||
      (statusFilter === 'With AKTU' && inquiry.status === 'escalated_aktu') ||
      (statusFilter === 'Resolved' && inquiry.status === 'resolved') ||
      (statusFilter === 'Open' && inquiry.status === 'open') ||
      (statusFilter === 'In progress' && inquiry.status === 'in_progress');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Specific AKTU metrics
  const totalInquiries = inquiries.length;
  const withAktuCount = inquiries.filter((i) => i.status === 'escalated_aktu').length;
  const openCount = inquiries.filter((i) => i.status === 'open').length;
  const inProgressCount = inquiries.filter((i) => i.status === 'in_progress').length;
  const resolvedCount = inquiries.filter((i) => i.status === 'resolved').length;

  // Render PIN Screen if not authenticated (exact visual match to video 00:33-00:44)
  if (!isAktuLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Care</span>
        </button>

        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-rose-900/40 shadow-2xl relative overflow-hidden">
          {/* Subtle university red banner */}
          <div className="bg-rose-600 px-4 py-2.5 rounded-2xl flex items-center space-x-2.5 mb-6 shadow-md">
            <Building2 className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-sm font-bold text-white">AKTU Portal</h2>
              <p className="text-[10px] text-rose-100">
                Dr. A.P.J. Abdul Kalam Technical University
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            State escalation desk. Enter the AKTU security PIN to review inquiries transferred after the 7-day SLA.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-2">
                SECURITY PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="• • • •"
                  className="w-full text-center text-xl tracking-[0.5em] font-mono py-3.5 bg-slate-900 border border-rose-900/60 rounded-xl text-white focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
              {pinError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || !pin}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-600/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying...' : 'Unlock portal'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AKTU Portal Dashboard when logged in (exact match to video 00:45-00:51)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* SLA audit alert banner if triggered */}
      {auditNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{auditNotice}</span>
          </div>
          <button
            onClick={() => setAuditNotice(null)}
            className="text-rose-700 hover:text-rose-900 text-xs underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
                UNIVERSITY PORTAL • AKTU
              </span>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                State Oversight
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              AKTU State Escalation Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Inquiries the college could not close within 7 days are transferred here
              automatically for university-level review.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRunAudit}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-rose-600" />
              <span>Run SLA check</span>
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* 5 Metric Cards matching video */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-8">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Total inquiries
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalInquiries}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Open
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {openCount}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-500 block mb-1">
              In progress
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
              {inProgressCount}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-xs font-medium text-slate-500 block mb-1">
              Resolved
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {resolvedCount}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-rose-50 border border-rose-300 rounded-2xl p-4">
            <span className="text-xs font-medium text-rose-700 block mb-1">
              With AKTU
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700">
              {withAktuCount}
            </span>
          </div>
        </div>

        {/* Search & Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking ID, name or roll number..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-600 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-600 focus:bg-white"
            >
              <option value="All categories">All categories</option>
              {CAMPUS_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-600 focus:bg-white"
            >
              <option value="All statuses">All statuses</option>
              <option value="With AKTU">With AKTU (Escalated)</option>
              <option value="Open">Open</option>
              <option value="In progress">In progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Escalated / Monitored Inquiries Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">TRACKING ID</th>
                <th className="py-3.5 px-4">STUDENT</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">7-DAY SLA</th>
                <th className="py-3.5 px-4">LAST UPDATE</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No inquiries match the current filters.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => {
                  const sla = calculateSLA(inquiry);
                  const isWithAktu = inquiry.status === 'escalated_aktu';
                  return (
                    <tr
                      key={inquiry.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isWithAktu ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Tracking ID */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="flex items-center space-x-1.5">
                          {isWithAktu && (
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                          )}
                          <span>{inquiry.id}</span>
                        </span>
                      </td>

                      {/* Student info */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {inquiry.studentName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Roll: {inquiry.rollNumber} {inquiry.collegeId && `• ${inquiry.collegeId}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {inquiry.classroomNumber || 'Campus'} • {inquiry.semester || '1st Sem'} ({inquiry.section || 'Sec A'})
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-700 font-medium">
                        {inquiry.category}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {inquiry.status === 'escalated_aktu' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            With AKTU
                          </span>
                        ) : inquiry.status === 'resolved' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Resolved
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {inquiry.status}
                          </span>
                        )}
                      </td>

                      {/* 7-Day SLA Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isWithAktu ? (
                          <span className="text-rose-700 font-bold text-[11px]">
                            College breached 7d SLA
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">
                            {sla.slaStatusLabel}
                          </span>
                        )}
                      </td>

                      {/* Last Update */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                        {formatDisplayDate(inquiry.updatedAt)}
                      </td>

                      {/* Directive & Delete Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleOpenDirectiveModal(inquiry)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          AKTU Directive
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry.id)}
                          title="Delete inquiry from records"
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note matching video */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 text-[11px] text-slate-500 flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            The SLA sweep runs by itself — hourly on the server and before every dashboard refresh.
          </span>
        </div>
      </div>

      {/* AKTU DIRECTIVE & RESOLUTION MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-rose-600 block">
                  {selectedInquiry.id} • STATE OVERSIGHT
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  AKTU University Directive
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inquiry Context */}
            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1.5 border border-slate-200 text-slate-700">
              <p>
                <strong className="text-slate-900">Student:</strong> {selectedInquiry.studentName} (Roll: {selectedInquiry.rollNumber})
              </p>
              <p>
                <strong className="text-slate-900">College ID:</strong> {selectedInquiry.collegeId || 'GNIOT-' + selectedInquiry.rollNumber}
              </p>
              <p>
                <strong className="text-slate-900">Classroom / Spot:</strong> {selectedInquiry.classroomNumber || 'Campus Grounds'}
              </p>
              <p>
                <strong className="text-slate-900">Academic:</strong> {selectedInquiry.semester || '1st Sem'} • {selectedInquiry.section || 'Sec A'}
              </p>
              <p>
                <strong className="text-slate-900">Category:</strong> {selectedInquiry.category}
              </p>
              <p className="italic text-slate-600 bg-white p-2 rounded border border-slate-200">
                &ldquo;{selectedInquiry.description}&rdquo;
              </p>
              {selectedInquiry.adminNotes && (
                <p className="text-blue-900 pt-1">
                  <strong>College Admin Remark:</strong> {selectedInquiry.adminNotes}
                </p>
              )}
            </div>

            {/* AKTU Official Directive Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                AKTU State University Directive / Order
              </label>
              <textarea
                rows={4}
                value={aktuDirective}
                onChange={(e) => setAktuDirective(e.target.value)}
                placeholder="Issue formal university notice, compliance ultimatum to GNIOT administration, or inquiry resolution notes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-rose-600"
              />
            </div>

            {/* Resolve Checkbox */}
            <div className="flex items-center space-x-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <input
                type="checkbox"
                id="resolveCheckbox"
                checked={markResolved}
                onChange={(e) => setMarkResolved(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
              />
              <label htmlFor="resolveCheckbox" className="text-xs font-semibold text-emerald-900 cursor-pointer">
                Mark as officially resolved by AKTU Order (Close grievance)
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDelete(selectedInquiry.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Inquiry</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDirective}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs cursor-pointer"
                >
                  Issue Directive &amp; Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(inquiryPendingDelete)}
        inquiryId={inquiryPendingDelete || ''}
        onConfirm={() => {
          if (inquiryPendingDelete && onDeleteInquiry) {
            onDeleteInquiry(inquiryPendingDelete);
            if (selectedInquiry?.id === inquiryPendingDelete) {
              setSelectedInquiry(null);
            }
            setInquiryPendingDelete(null);
          }
        }}
        onClose={() => setInquiryPendingDelete(null)}
      />
    </div>
  );
};
