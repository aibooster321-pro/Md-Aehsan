/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { Inquiry } from './types/inquiry.ts';
import { INITIAL_INQUIRIES } from './data/seedData.ts';
import { applySLAEngine } from './utils/sla.ts';
import { Navbar } from './components/Navbar.tsx';
import { HomeView } from './components/HomeView.tsx';
import { SubmitInquiryView } from './components/SubmitInquiryView.tsx';
import { TrackStatusView } from './components/TrackStatusView.tsx';
import { AdminPortalView } from './components/AdminPortalView.tsx';
import { AktuPortalView } from './components/AktuPortalView.tsx';

const STORAGE_KEY = 'gniot_campus_care_inquiries_v3';
const DELETED_IDS_KEY = 'gniot_campus_care_deleted_ids_v3';
const INITIALIZED_KEY = 'gniot_campus_care_initialized_v3';

/**
 * Permanently record a deleted inquiry ID in localStorage
 */
function recordDeletedId(id: string) {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Could not record deleted ID:', e);
  }
}

/**
 * Synchronously persist inquiries to localStorage
 */
function saveInquiriesToStorage(inquiries: Inquiry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
    localStorage.setItem(INITIALIZED_KEY, 'true');
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

/**
 * Load initial inquiries honoring deletion tombstones and preventing resurrection on page refresh
 */
function loadInitialInquiries(): Inquiry[] {
  try {
    // 1. Gather all permanently deleted IDs across versions
    let deletedIds: string[] = [];
    const deletedRaw = localStorage.getItem(DELETED_IDS_KEY);
    if (deletedRaw) {
      try {
        const parsed = JSON.parse(deletedRaw);
        if (Array.isArray(parsed)) deletedIds = parsed;
      } catch (e) {
        console.warn('Could not parse deleted IDs:', e);
      }
    }

    // 2. Check current version's storage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((item: Inquiry) => !deletedIds.includes(item.id));
      }
    }

    // 3. Fallback to v2 storage if migrating
    const legacyV2 = localStorage.getItem('gniot_campus_care_inquiries_v2');
    if (legacyV2 !== null) {
      const parsed = JSON.parse(legacyV2);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((item: Inquiry) => !deletedIds.includes(item.id));
        saveInquiriesToStorage(filtered);
        return filtered;
      }
    }

    // 4. If previously initialized before (even if empty []), do NOT resurrect seed inquiries!
    const isInitialized = localStorage.getItem(INITIALIZED_KEY) === 'true';
    if (isInitialized) {
      return [];
    }

    // 5. Very first first-time launch: seed initial inquiries minus any deleted IDs
    const seeded = INITIAL_INQUIRIES.filter((item) => !deletedIds.includes(item.id));
    saveInquiriesToStorage(seeded);
    return seeded;
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
    return INITIAL_INQUIRIES;
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'submit' | 'track' | 'admin' | 'aktu'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAktuLoggedIn, setIsAktuLoggedIn] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<string>('');
  const [trackedId, setTrackedId] = useState<string>('');

  // Persistent Inquiries State
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => loadInitialInquiries());

  // Continuous sync to localStorage
  useEffect(() => {
    saveInquiriesToStorage(inquiries);
  }, [inquiries]);

  // Periodic automatic 7-day SLA evaluation sweep
  useEffect(() => {
    const runSLAEvaluation = () => {
      setInquiries((prev) => {
        const result = applySLAEngine(prev);
        if (result.escalatedCount > 0) {
          saveInquiriesToStorage(result.updatedInquiries);
          return result.updatedInquiries;
        }
        return prev;
      });
    };

    // Run on initial mount
    runSLAEvaluation();

    // Check periodically
    const timer = setInterval(runSLAEvaluation, 30000);
    return () => clearInterval(timer);
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handlers
  const handleInquiryCreated = (newInquiry: Inquiry) => {
    setInquiries((prev) => {
      const next = [newInquiry, ...prev];
      saveInquiriesToStorage(next);
      return next;
    });
  };

  const handleUpdateInquiry = (updated: Inquiry) => {
    setInquiries((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      saveInquiriesToStorage(next);
      return next;
    });
  };

  const handleDeleteInquiry = (id: string) => {
    // 1. Permanently record deleted ID in tombstones
    recordDeletedId(id);

    // 2. Synchronously write updated array to localStorage immediately
    setInquiries((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveInquiriesToStorage(next);
      return next;
    });

    setToastMessage(`Inquiry ${id} permanently deleted.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBatchUpdateInquiries = (updatedList: Inquiry[]) => {
    setInquiries(updatedList);
    saveInquiriesToStorage(updatedList);
  };

  const handleNavigateTab = (
    tab: 'home' | 'submit' | 'track' | 'admin' | 'aktu',
    categoryPreselect?: string
  ) => {
    if (categoryPreselect) {
      setPreselectedCategory(categoryPreselect);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackIdSearch = (id: string) => {
    setTrackedId(id);
    setCurrentTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdminLoggedIn={isAdminLoggedIn}
        isAktuLoggedIn={isAktuLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            inquiries={inquiries}
            onNavigateTab={handleNavigateTab}
            onTrackIdSearch={handleTrackIdSearch}
          />
        )}

        {currentTab === 'submit' && (
          <SubmitInquiryView
            initialCategory={preselectedCategory}
            onInquiryCreated={handleInquiryCreated}
            onNavigateToTrack={(newId) => {
              setTrackedId(newId);
              setCurrentTab('track');
            }}
          />
        )}

        {currentTab === 'track' && (
          <TrackStatusView
            inquiries={inquiries}
            initialTrackingId={trackedId}
            onNavigateToSubmit={() => setCurrentTab('submit')}
            onDeleteInquiry={handleDeleteInquiry}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPortalView
            inquiries={inquiries}
            onUpdateInquiry={handleUpdateInquiry}
            onAddInquiry={handleInquiryCreated}
            onDeleteInquiry={handleDeleteInquiry}
            onBatchUpdateInquiries={handleBatchUpdateInquiries}
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'aktu' && (
          <AktuPortalView
            inquiries={inquiries}
            onUpdateInquiry={handleUpdateInquiry}
            onBatchUpdateInquiries={handleBatchUpdateInquiries}
            onDeleteInquiry={handleDeleteInquiry}
            isAktuLoggedIn={isAktuLoggedIn}
            setIsAktuLoggedIn={setIsAktuLoggedIn}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}
      </main>

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
