import React, { useState } from 'react';
import {
  Lock,
  Key,
  ShieldCheck,
  Plus,
  RefreshCw,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Trash2,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  X,
  FastForward,
} from 'lucide-react';
import type { Inquiry, InquiryStatus } from '../types/inquiry.ts';
import { CAMPUS_CATEGORIES } from '../data/categories.ts';
import {
  calculateSLA,
  applySLAEngine,
  validatePIN,
  formatDisplayDate,
  generateTrackingId,
} from '../utils/sla.ts';

import { DeleteConfirmModal } from './DeleteConfirmModal.tsx';

const ADMIN_CORRECT_PIN = '7890';

interface AdminPortalViewProps {
  inquiries: Inquiry[];
  onUpdateInquiry: (updated: Inquiry) => void;
  onAddInquiry: (newInquiry: Inquiry) => void;
  onDeleteInquiry: (id: string) => void;
  onBatchUpdateInquiries: (updatedList: Inquiry[]) => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  onBackToHome: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  inquiries,
  onUpdateInquiry,
  onAddInquiry,
  onDeleteInquiry,
  onBatchUpdateInquiries,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  onBackToHome,
}) => {
  // Authentication PIN states
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Table filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState('All statuses');

  // Modal states
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inquiryPendingDelete, setInquiryPendingDelete] = useState<string | null>(null);
  const [slaCheckNotice, setSlaCheckNotice] = useState<string | null>(null);

  // Edit fields inside Manage Modal
  const [editStatus, setEditStatus] = useState<InquiryStatus>('open');
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  // New Inquiry Modal fields
  const [newStudentName, setNewStudentName] = useState('');
  const [newRollNumber, setNewRollNumber] = useState('');
  const [newCollegeId, setNewCollegeId] = useState('');
  const [newClassroom, setNewClassroom] = useState('');
  const [newSemester, setNewSemester] = useState('1st Semester');
  const [newSection, setNewSection] = useState('Section A');
  const [newCategory, setNewCategory] = useState(CAMPUS_CATEGORIES[0]?.name || '');
  const [newDescription, setNewDescription] = useState('');

  // Handle PIN unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setPinError('');

    setTimeout(() => {
      if (validatePIN(pin, ADMIN_CORRECT_PIN)) {
        setIsAdminLoggedIn(true);
        setPin('');
      } else {
        setPinError('Incorrect security PIN. Please try again.');
      }
      setIsVerifying(false);
    }, 400);
  };

  const handleSignOut = () => {
    setIsAdminLoggedIn(false);
    setPin('');
  };

  // Run SLA Check across all inquiries
  const handleRunSLACheck = () => {
    const result = applySLAEngine(inquiries);
    onBatchUpdateInquiries(result.updatedInquiries);
    if (result.escalatedCount > 0) {
      setSlaCheckNotice(
        `SLA Check Complete: ${result.escalatedCount} overdue inquiries transferred to AKTU State Escalation Desk!`
      );
    } else {
      setSlaCheckNotice('SLA Check Complete: All open inquiries are within the 7-day college SLA window.');
    }
    setTimeout(() => setSlaCheckNotice(null), 5000);
  };

  // Open manage modal
  const handleOpenManage = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setEditStatus(inquiry.status);
    setEditNotes(inquiry.adminNotes || '');
    setEditPriority(inquiry.priority || 'normal');
  };

  // Save manage modal changes
  const handleSaveManage = () => {
    if (!selectedInquiry) return;
    const nowIso = new Date().toISOString();
    const updated: Inquiry = {
      ...selectedInquiry,
      status: editStatus,
      adminNotes: editNotes.trim(),
      priority: editPriority,
      updatedAt: nowIso,
      resolvedAt: editStatus === 'resolved' ? (selectedInquiry.resolvedAt || nowIso) : undefined,
      escalatedAt: editStatus === 'escalated_aktu' ? (selectedInquiry.escalatedAt || nowIso) : selectedInquiry.escalatedAt,
    };
    onUpdateInquiry(updated);
    setSelectedInquiry(null);
  };

  const handleDeleteFromManage = () => {
    if (!selectedInquiry) return;
    setInquiryPendingDelete(selectedInquiry.id);
  };

  // Fast forward simulation for 7-day rule testing
  const handleFastForwardInquiry = () => {
    if (!selectedInquiry) return;
    const newSimulatedDays = (selectedInquiry.simulatedDaysElapsed || 0) + 7;
    const nowIso = new Date().toISOString();
    const updated: Inquiry = {
      ...selectedInquiry,
      simulatedDaysElapsed: newSimulatedDays,
      status: 'escalated_aktu',
      escalatedAt: nowIso,
      aktuNotes: 'Auto-escalated to AKTU State Escalation Desk after simulated 7-day college SLA breach.',
      updatedAt: nowIso,
    };
    onUpdateInquiry(updated);
    setSelectedInquiry(updated);
    setEditStatus('escalated_aktu');
  };

  // Create new inquiry from admin panel
  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newRollNumber.trim() || !newDescription.trim()) return;

    const newId = generateTrackingId();
    const nowIso = new Date().toISOString();
    const created: Inquiry = {
      id: newId,
      studentName: newStudentName.trim(),
      rollNumber: newRollNumber.trim(),
      collegeId: newCollegeId.trim() || `GNIOT-${newRollNumber.trim()}`,
      classroomNumber: newClassroom.trim() || 'General Campus',
      semester: newSemester,
      section: newSection,
      category: newCategory,
      description: newDescription.trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'open',
      priority: 'normal',
      adminNotes: 'Registered via College Admin Desk.',
    };

    onAddInquiry(created);
    setIsAddModalOpen(false);
    setNewStudentName('');
    setNewRollNumber('');
    setNewCollegeId('');
    setNewClassroom('');
    setNewSemester('1st Semester');
    setNewSection('Section A');
    setNewDescription('');
  };

  // Filtered inquiries list
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All categories' || inquiry.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'All statuses' ||
      (statusFilter === 'Open' && inquiry.status === 'open') ||
      (statusFilter === 'In progress' && inquiry.status === 'in_progress') ||
      (statusFilter === 'Resolved' && inquiry.status === 'resolved') ||
      (statusFilter === 'With AKTU' && inquiry.status === 'escalated_aktu');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate metrics
  const totalInquiries = inquiries.length;
  const openCount = inquiries.filter((i) => i.status === 'open').length;
  const inProgressCount = inquiries.filter((i) => i.status === 'in_progress').length;
  const resolvedCount = inquiries.filter((i) => i.status === 'resolved').length;
  const withAktuCount = inquiries.filter((i) => i.status === 'escalated_aktu').length;

  // Render PIN Screen if not authenticated (exact visual match to video 00:16-00:21)
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Care</span>
        </button>

        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Admin Portal</h2>
              <p className="text-xs text-slate-400">GNIOT College Control Room</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Restricted to authorised GNIOT staff. Enter the security PIN to manage every student inquiry.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                SECURITY PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="• • • •"
                  className="w-full text-center text-xl tracking-[0.5em] font-mono py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <Key className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying...' : 'Unlock portal'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard when logged in (exact match to video 00:22-00:32)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* SLA notice alert banner if triggered */}
      {slaCheckNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{slaCheckNotice}</span>
          </div>
          <button
            onClick={() => setSlaCheckNotice(null)}
            className="text-amber-700 hover:text-amber-900 text-xs underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              COLLEGE PORTAL • GNIOT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Admin Control Room
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Every student inquiry across the college. Resolve, progress, or note them before
              the 7-day SLA transfers pending ones to AKTU.
            </p>
          </div>

          {/* Action Toolbar matching video */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add inquiry</span>
            </button>
            <button
              onClick={handleRunSLACheck}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>Run SLA check</span>
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
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

          <div className="col-span-2 sm:col-span-1 bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <span className="text-xs font-medium text-rose-700 block mb-1">
              With AKTU
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700">
              {withAktuCount}
            </span>
          </div>
        </div>

        {/* Search & Filter Dropdowns matching video */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking ID, name or roll number..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-600 focus:bg-white"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-600 focus:bg-white"
            >
              <option value="All statuses">All statuses</option>
              <option value="Open">Open</option>
              <option value="In progress">In progress</option>
              <option value="Resolved">Resolved</option>
              <option value="With AKTU">With AKTU</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Table matching video columns */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">TRACKING ID</th>
                <th className="py-3.5 px-4">STUDENT</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">7-DAY SLA</th>
                <th className="py-3.5 px-4">LAST UPDATE</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No inquiries match the current search or filters.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => {
                  const sla = calculateSLA(inquiry);
                  return (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Tracking ID */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {inquiry.id}
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

                      {/* 7-Day SLA Badge matching video */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {inquiry.status === 'resolved' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Closed — SLA stopped
                          </span>
                        ) : inquiry.status === 'escalated_aktu' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <Building2 className="w-3 h-3 mr-1" />
                            Transferred to AKTU
                          </span>
                        ) : sla.daysRemaining <= 1 ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <Clock className="w-3 h-3 mr-1 animate-spin" />
                            Auto-AKTU in 1d
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {sla.slaStatusLabel}
                          </span>
                        )}
                      </td>

                      {/* Last Update */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                        {formatDisplayDate(inquiry.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleOpenManage(inquiry)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => setInquiryPendingDelete(inquiry.id)}
                          title="Delete inquiry"
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

        {/* Footer note matching video at 00:26 */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 text-[11px] text-slate-500 flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            The SLA sweep runs by itself — hourly on the server and before every dashboard refresh.
          </span>
        </div>
      </div>

      {/* MANAGE INQUIRY MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 block">
                  {selectedInquiry.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Manage Inquiry
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student details summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-200">
              <p>
                <strong className="text-slate-800">Student:</strong> {selectedInquiry.studentName} (Roll: {selectedInquiry.rollNumber})
              </p>
              <p>
                <strong className="text-slate-800">College ID:</strong> {selectedInquiry.collegeId || 'GNIOT-' + selectedInquiry.rollNumber}
              </p>
              <p>
                <strong className="text-slate-800">Classroom / Spot:</strong> {selectedInquiry.classroomNumber || 'Campus Grounds'}
              </p>
              <p>
                <strong className="text-slate-800">Academic:</strong> {selectedInquiry.semester || '1st Sem'} • {selectedInquiry.section || 'Sec A'}
              </p>
              <p>
                <strong className="text-slate-800">Category:</strong> {selectedInquiry.category}
              </p>
              <p className="mt-1 text-slate-800 italic">
                &ldquo;{selectedInquiry.description}&rdquo;
              </p>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Update Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as InquiryStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-blue-600 bg-white"
              >
                <option value="open">Open (College Review)</option>
                <option value="in_progress">In Progress (Work Assigned)</option>
                <option value="resolved">Resolved (Stop SLA)</option>
                <option value="escalated_aktu">Escalate to AKTU State Desk</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Priority
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as 'normal' | 'high' | 'urgent')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-blue-600 bg-white"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Admin Response & Action Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Admin Response / Resolution Notes
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Log internal action taken, technician assigned, or resolution details..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:border-blue-600"
              />
            </div>

            {/* Test Simulation Helper */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <strong className="block font-semibold">Test 7-Day SLA Auto-Escalation:</strong>
                <span className="text-[11px] text-amber-800">
                  Simulate passing 7 days to test transfer to AKTU desk immediately.
                </span>
              </div>
              <button
                type="button"
                onClick={handleFastForwardInquiry}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-xs flex items-center space-x-1 shrink-0 ml-2 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Simulate 7d</span>
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDeleteFromManage}
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
                  onClick={handleSaveManage}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD INQUIRY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Add Inquiry via Admin Desk
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={newRollNumber}
                    onChange={(e) => setNewRollNumber(e.target.value)}
                    placeholder="e.g. 2300940089"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">College ID</label>
                  <input
                    type="text"
                    value={newCollegeId}
                    onChange={(e) => setNewCollegeId(e.target.value)}
                    placeholder="e.g. GNIOT-2023-CS-042"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Classroom / Spot</label>
                  <input
                    type="text"
                    value={newClassroom}
                    onChange={(e) => setNewClassroom(e.target.value)}
                    placeholder="e.g. Room 302 / Lab 4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white"
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
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white"
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                    <option value="Section D">Section D</option>
                    <option value="Section E">Section E</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white"
                >
                  {CAMPUS_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Details of the issue..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                >
                  Register Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(inquiryPendingDelete)}
        inquiryId={inquiryPendingDelete || ''}
        onConfirm={() => {
          if (inquiryPendingDelete) {
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
