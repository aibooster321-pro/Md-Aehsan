import React, { useState } from 'react';
import {
  Send,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  PhoneCall,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
} from 'lucide-react';
import type { Inquiry } from '../types/inquiry.ts';
import { CAMPUS_CATEGORIES } from '../data/categories.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface HomeViewProps {
  inquiries: Inquiry[];
  onNavigateTab: (tab: 'home' | 'submit' | 'track' | 'admin' | 'aktu', categoryPreselect?: string) => void;
  onTrackIdSearch: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  inquiries,
  onNavigateTab,
  onTrackIdSearch,
}) => {
  const [trackInput, setTrackInput] = useState('');

  // Calculate live board metrics
  const totalInquiries = inquiries.length;
  const openCount = inquiries.filter((i) => i.status === 'open').length;
  const inProgressCount = inquiries.filter((i) => i.status === 'in_progress').length;
  const resolvedCount = inquiries.filter((i) => i.status === 'resolved').length;
  const withAktuCount = inquiries.filter((i) => i.status === 'escalated_aktu').length;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    onTrackIdSearch(trackInput.trim().toUpperCase());
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-3 sm:mx-6 lg:mx-8 mt-4 border border-slate-800 shadow-2xl">
        {/* Decorative background grid and ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:py-20 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>GNIOT CAMPUS CARE</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight sm:leading-snug">
            Every campus complaint, tracked — and{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400">
              auto-escalated to AKTU
            </span>{' '}
            after 7 days.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Raise an inquiry about anything on campus — ragging, classrooms, fans and ACs,
            lab damage, playground, hostel or fees. The college admin team resolves it; if it
            stays open for more than 7 days, it transfers to{' '}
            <strong className="text-white font-semibold">
              Dr. A.P.J. Abdul Kalam Technical University
            </strong>{' '}
            automatically.
          </p>

          {/* Direct Track ID Search Bar */}
          <form
            onSubmit={handleTrackSubmit}
            className="mt-8 max-w-xl flex flex-col sm:flex-row items-stretch gap-2.5 bg-slate-900/90 p-2 rounded-2xl border border-slate-700 shadow-xl"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value.toUpperCase())}
                placeholder="TRACK: GC-XXXXXX"
                className="w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-slate-500 font-mono text-sm uppercase tracking-wider focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <span>Track status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('submit')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit an Inquiry</span>
            </button>
            <button
              onClick={() => onNavigateTab('admin')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={() => onNavigateTab('aktu')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-sm font-semibold transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-rose-400" />
              <span>AKTU Portal</span>
            </button>
          </div>

          {/* Live Grievance Board Section */}
          <div className="mt-12 pt-10 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  LIVE GRIEVANCE BOARD
                </h3>
                <p className="text-xs text-slate-500">
                  Campus-wide SLA transparency, updated live.
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Sync Active</span>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Inquiries raised
                </span>
                <span className="text-3xl font-extrabold text-white">
                  {totalInquiries}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Open
                </span>
                <span className="text-3xl font-extrabold text-amber-400">
                  {openCount}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  In progress
                </span>
                <span className="text-3xl font-extrabold text-blue-400">
                  {inProgressCount}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Resolved
                </span>
                <span className="text-3xl font-extrabold text-emerald-400">
                  {resolvedCount}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-rose-900/50 rounded-2xl p-4">
                <span className="text-xs font-medium text-rose-300 block mb-1">
                  With AKTU
                </span>
                <span className="text-3xl font-extrabold text-rose-400">
                  {withAktuCount}
                </span>
              </div>
            </div>

            {/* Rule Callout */}
            <div className="mt-4 flex items-start space-x-2.5 bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300 font-semibold">Rule:</strong> an inquiry
                unresolved for 7 days moves from the college admin desk to the AKTU state desk
                automatically.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How the 7-day escalation works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            TRANSPARENT WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            How the 7-day escalation works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            One transparent pipeline — from a student&apos;s phone to the university desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Day 0
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Student submits</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pick a category, describe the issue, and get a tracking ID instantly. No login
              needed.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative hover:border-amber-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Day 1 – 6
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">College admin resolves</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The GNIOT admin control room works the inquiry — every status change and note is
              logged.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative hover:border-rose-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Day 7
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Auto-transfer to AKTU</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Still unresolved after 7 days? The SLA engine moves it to the AKTU state escalation
              desk automatically.
            </p>
          </div>
        </div>
      </section>

      {/* What can you report? 10 Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            ALL-CAMPUS COVERAGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            What can you report?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Ten categories covering the issues students actually face on campus. Click any category to start an inquiry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {CAMPUS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigateTab('submit', cat.name)}
              className="text-left bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex items-start space-x-4 group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.bgLight} transition-transform group-hover:scale-105`}
              >
                <CategoryIcon name={cat.icon} className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h4>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {cat.shortDesc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Campus Photos & Assurance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white min-h-[220px] flex flex-col justify-end p-6 border border-slate-800 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
            <div className="relative z-20">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                CAMPUS LIFE
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Student services &amp; support</h3>
              <p className="text-xs text-slate-300 mt-1">
                Direct accountability for academics, lab devices, sports ground, and hostel hygiene.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white min-h-[220px] flex flex-col justify-end p-6 border border-slate-800 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
            <div className="relative z-20">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                INFRASTRUCTURE
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Facility &amp; infrastructure care</h3>
              <p className="text-xs text-slate-300 mt-1">
                Audited repair cycles with mandatory university compliance tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official GNIOT Campus Helpline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              OFFICIAL CONTACT CHANNELS
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              GNIOT campus helpline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Official institute lines for anything urgent — admissions, campus facilities, or the
              grievance cell. Open on working days, 9:30 am – 4:30 pm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                  TOLL-FREE HELPLINE
                </span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  1800 274 6969
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                  ADMISSIONS HELPLINE
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  +91 8860606661 / 62 / 63
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                  GRIEVANCE CELL EMAIL
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">
                  feedback@gniot.net.in
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-500">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Plot No. 7, Knowledge Park II, Greater Noida, Uttar Pradesh 201306. Landline: 0120 - 2328214
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white rounded-3xl mx-3 sm:mx-6 lg:mx-8 p-8 sm:p-12 border border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white">GNIOT Campus Care</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              The grievance redressal portal of the Greater Noida Institute of Technology — built
              for students, run by the admin cell, supervised by AKTU.
            </p>
            <div className="mt-4 space-y-1 text-xs text-slate-400">
              <p>📞 Toll-free: 1800 274 6969</p>
              <p>✉️ feedback@gniot.net.in</p>
              <p>📍 Knowledge Park II, Greater Noida</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              STUDENTS
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('submit')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Submit an inquiry
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('track')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Track status
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('home')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              SECURE PORTALS
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('admin')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Admin portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('aktu')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  AKTU portal
                </button>
              </li>
              <li className="text-[11px] text-slate-500 pt-1">
                Unresolved inquiries auto-transfer to AKTU after 7 days.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 GNIOT Campus Care • Grievance Redressal &amp; AKTU Escalation Portal</p>
          <p>Official Institute Grievance Desk</p>
        </div>
      </footer>
    </div>
  );
};
